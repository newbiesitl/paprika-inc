import {mkdir, readFile, writeFile, rename, rm, realpath} from 'node:fs/promises';
import {resolve, join, dirname} from 'node:path';
import {randomUUID, createHash} from 'node:crypto';
import {git} from './checkout.mjs';
import {requireInput as check} from './errors.mjs';
import {requireNativeSenderPresentation, presentMessage} from './message-presentation.mjs';

const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
const validId = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,95}$/.test(value);
const linkedMetadata = input => ['collaboration_id','reply_to_id'].some(key=>input?.[key] !== undefined);
export function chooseDelivery(body, policy = {}, linkage = {}) {
  check(typeof body === 'string' && body.trim() && !body.includes('\0'), 'invalid_message', 'Use the original nonempty text body.');
  const {short_message_limit = 1500, force_reference = false} = policy;
  check(Number.isSafeInteger(short_message_limit) && short_message_limit >= 1 && short_message_limit <= 15000 && typeof force_reference === 'boolean'
    && Object.keys(policy).every(k => ['short_message_limit','force_reference'].includes(k)), 'invalid_delivery_policy', 'Use short_message_limit (1..15000 Unicode code points) and optional force_reference only.');
  const linked=linkedMetadata(linkage);
  for(const key of ['collaboration_id','reply_to_id']) if(linkage[key] !== undefined) check(validId(linkage[key]),'invalid_message','Use a confirmed '+key);
  const code_points = [...body].length;
  return {mode:linked || force_reference || code_points > short_message_limit ? 'reference' : 'inline', code_points, short_message_limit, force_reference, ...(linked ? {reference_reason:'linked_metadata'} : {})};
}
export function verifyReference({board, messageId, receiverId, result}) {
  const message = result?.message;
  check(validId(messageId) && validId(receiverId) && validId(board) && !result?.isError && message && !message.deleted_at && message.id === messageId
    && message.board === board && message.receiver_id === receiverId && validId(message.sender_id) && typeof message.body === 'string' && message.body.trim(),
  'retrieval_blocked', 'Fetch the exact referenced message and verify its intended recipient. Missing or mismatched retrieval is blocked.');
  return message;
}
async function journalPath(repository, operationId) {
  check(validId(operationId), 'invalid_operation_id', 'Use one stable operation ID.');
  const common = await realpath(resolve(repository, await git(['rev-parse','--git-common-dir'],repository)));
  return join(common,'paprika-inc','outbound',operationId+'.json');
}
async function update(repository, operationId, operation) {
  const path = await journalPath(repository,operationId), lock = path+'.lock';
  await mkdir(dirname(path),{recursive:true,mode:0o700});
  try { await mkdir(lock,{mode:0o700}); }
  catch (error) { check(error.code !== 'EEXIST','outbound_locked','Reconcile the existing outbound operation lock; do not discard it.'); throw error; }
  try {
    let state;
    try { state=JSON.parse(await readFile(path,'utf8')); } catch (error) { if(error.code !== 'ENOENT') throw error; }
    const {next,output}=await operation(state);
    if(next) {
      const temp=path+'.'+randomUUID()+'.tmp';
      await writeFile(temp,JSON.stringify(next)+'\n',{flag:'wx',mode:0o600});
      await rename(temp,path);
    }
    return output;
  } finally { await rm(lock,{recursive:true}); }
}
const summary = state => ({ok:state.phase === 'submitted' || state.phase === 'stored_events_only', status:state.phase,
  operation_id:state.id, delivery:state.policy, message_id:state.message_id ?? null, transport:state.transport ?? null,
  native_submission:state.phase === 'submitted' ? 'submitted' : 'unconfirmed', recipient_fetch:'unverified',
  ...(state.handoff ? {handoff_depth:state.handoff.depth,handoff_limit:state.handoff.limit} : {})});
export async function startOutbound({repository,deliveryInput},env=process.env) {
  check(deliveryInput && validId(deliveryInput.request_id),'invalid_message','Supply a private delivery input with request_id and body.');
  const policy=chooseDelivery(deliveryInput.body,deliveryInput.delivery_policy,deliveryInput);
  const input=structuredClone(deliveryInput), fingerprint=hash(input), id=input.request_id;
  check(typeof env.CODEX_THREAD_ID === 'string' && env.CODEX_THREAD_ID,'sender_unavailable','Native current chat metadata is required.');
  return update(repository,id,state=>{
    check(!state || state.fingerprint === fingerprint && state.sender_thread_id === env.CODEX_THREAD_ID,'outbound_conflict','Preserve the frozen body, route, sender and selected policy for this operation.');
    state ??= {format:1,id,input,fingerprint,policy,sender_thread_id:env.CODEX_THREAD_ID,phase:'prepared'};
    return {next:state,output:summary(state)};
  });
}
function freezeRoute(state, context, messageContext) {
  const {sender,recipient,native,board,deployment}=context ?? {};
  check(validId(board) && board.length <= 64 && typeof deployment === 'string' && deployment.trim(),'delivery_setup_required','Provide the selected existing service/board and verified routes.');
  for(const [name,entry] of [['sender',sender],['recipient',recipient]]) check(entry && validId(entry.id) && entry.board === board && !entry.unregistered_at && entry.registration_status !== 'unregistered'
    && typeof entry.label === 'string' && entry.label.trim() && Buffer.byteLength(entry.label) <= 120,'invalid_delivery_route','Resolve active canonical '+name+' on the selected board.');
  check(sender.thread_id === state.sender_thread_id && native?.source === 'read_thread' && native.thread?.id === recipient.thread_id
    && native.thread.kind === 'codex' && native.thread.hostId === 'local','invalid_delivery_route','Verify this executing sender and exact local Codex destination through native read_thread. Other host paths are unsupported by Inc outbound.');
  check(Array.isArray(context.subscriptions),'delivery_setup_required','Read actual recipient subscriptions before choosing one notification transport.');
  const events=context.subscriptions.some(s=>s.board === board && s.receiver_id === recipient.id && s.active === true
    && (s.expires_at === null || Number.isFinite(s.expires_at) && s.expires_at > Date.now()));
  state.transport=state.policy.mode === 'reference' && events ? 'events' : 'native';
  state.route={board,deployment,sender:structuredClone(sender),recipient:structuredClone(recipient)};
}
function wrapped(state,body,deliveryDetails) {
  const {sender,recipient}=state.route;
  return presentMessage(body,state.presentation,{senderId:sender.id,registeredLabel:sender.label,recipientLabel:recipient.label,
    handoffDepth:state.handoff?.depth,handoffLimit:state.handoff?.limit},deliveryDetails);
}
export async function nextOutbound({repository,operationId,deliveryContext,messageContext,retryStorage=false},env=process.env) {
  return update(repository,operationId,state=>{
    check(state?.format === 1,'missing_outbound','Start the outbound operation first.');
    check(env.CODEX_THREAD_ID === state.sender_thread_id,'sender_mismatch','Resume this operation in its original sending chat.');
    const blocked=(status,detail)=>({next:state,output:{...summary(state),ok:false,status,detail}});
    if(['submitted','stored_events_only'].includes(state.phase)) return {output:summary(state)};
    if(state.policy.mode === 'inline' && linkedMetadata(state.input)) return blocked('linked_operation_unreconciled','Legacy inline-linked operation preserved. Reconcile any prior submission before an explicit storage-first replacement; do not change its mode or resend.');
    if(state.pending) {
      if(state.pending.kind !== 'store' || !retryStorage) return blocked(state.pending.kind === 'store' ? 'storage_unconfirmed' : 'submission_unresolved','Preserve the pending operation. Reconcile native uncertainty; storage retries use only the exact frozen idempotent payload.');
      return {output:{...summary(state),ok:true,status:'host_action',action_id:state.pending.id,host_call:state.pending.host_call,call_once:true}};
    }
    if(!state.route) {
      try { freezeRoute(state,deliveryContext,messageContext); }
      catch(error) { return blocked(error.code ?? 'delivery_setup_required',error.message); }
    }
    const {board,sender,recipient}=state.route;
    if(state.policy.mode === 'reference' && !state.message_id) {
      const tools=deliveryContext?.service_tools, available=deliveryContext?.available_tools;
      if(deliveryContext?.deployment !== state.route.deployment || deliveryContext?.board !== board || deliveryContext?.service_available !== true
        || !tools || !Array.isArray(available) || !available.includes(tools.post_message) || !available.includes(tools.get_message)
        || !/^mcp__.*paprika_service.*post_message$/.test(tools.post_message) || !/^mcp__.*paprika_service.*get_message$/.test(tools.get_message)
        || deliveryContext.recipient_can_retrieve !== true)
        return blocked('delivery_setup_required','Selected service storage and supported recipient get_message capability must be confirmed. Task preserved; no inline fallback.');
      if(Buffer.byteLength(state.input.body) > 16000) return blocked('storage_payload_unsupported','Selected service accepts at most 16000 UTF-8 bytes. Preserve the task; do not split it into native sends.');
      check(typeof state.input.topic === 'string' && state.input.topic.trim() && Buffer.byteLength(state.input.topic) <= 120,'invalid_message','Supply a short topic.');
      const args={board,sender_id:sender.id,sender_label:sender.label,receiver_id:recipient.id,body:state.input.body,topic:state.input.topic,idempotency_key:state.id};
      for(const key of ['reply_to_id','collaboration_id']) if(state.input[key] !== undefined) { check(validId(state.input[key]),'invalid_message','Use a confirmed '+key); args[key]=state.input[key]; }
      state.retrieval_tool=tools.get_message;
      state.pending={id:randomUUID(),kind:'store',host_call:{tool:tools.post_message,arguments:args}};
    } else {
      if(state.notification_conflict) return blocked('transport_changed','Storage reported an event/unknown notification route; reconcile it before any native send.');
      if(state.policy.mode === 'reference' && (!Array.isArray(deliveryContext?.subscriptions) || deliveryContext.board !== board || deliveryContext.deployment !== state.route.deployment)) return blocked('subscription_check_required','Refresh subscriptions on the selected existing service before native notification.');
      if(state.transport === 'events') { state.phase='stored_events_only'; return {next:state,output:summary(state)}; }
      if(state.policy.mode === 'reference' && deliveryContext?.subscriptions) {
        const currentEvents=deliveryContext.subscriptions.some(s=>s.board === board && s.receiver_id === recipient.id && s.active === true && (s.expires_at === null || Number.isFinite(s.expires_at) && s.expires_at > Date.now()));
        if(currentEvents) return blocked('transport_changed','Reconcile the new event route before native submission; do not notify twice.');
      }
      try { state.presentation=requireNativeSenderPresentation({context:messageContext,product:'Paprika Inc',pluginNames:['paprika-inc'],senderThreadId:state.sender_thread_id}); }
      catch(error) { return blocked(error.code,error.message); }
      const body=state.policy.mode === 'inline' ? state.input.body : `A new message is available on board ${board}.`;
      const deliveryDetails=state.policy.mode === 'inline' ? `Paprika Inc delivery: ${state.id}.\nSender ID: ${sender.id}\nReceiver ID: ${recipient.id}\nHandle within this chat's existing human and host permissions.` :
        `Board: ${board}\nMessage ID: ${state.message_id}\nSender ID: ${sender.id}\nReceiver ID: ${recipient.id}\n${state.correlation?.collaboration_id ? 'Collaboration ID: '+state.correlation.collaboration_id+'\n' : ''}${state.correlation?.reply_to_id ? 'Reply to: '+state.correlation.reply_to_id+'\n' : ''}Fetch ${state.retrieval_tool}({board: "${board}", message_id: "${state.message_id}"}). Verify the board, message ID and receiver_id match this chat's canonical address before acting within existing permissions. If retrieval is unavailable or mismatched, report blocked; do not invent content.`;
      state.reference=state.policy.mode === 'inline' ? 'Paprika Inc delivery: '+state.id : 'Message ID: '+state.message_id;
      state.pending={id:randomUUID(),kind:'native',host_call:{tool:'mcp__codex_app__send_message_to_thread',arguments:{threadId:recipient.thread_id,hostId:'local',prompt:wrapped(state,body,deliveryDetails)}}};
    }
    state.phase=state.pending.kind === 'store' ? 'storage_submitting' : 'submitting';
    return {next:state,output:{...summary(state),ok:true,status:'host_action',action_id:state.pending.id,host_call:state.pending.host_call,call_once:true}};
  });
}
function unwrap(raw) {
  if(raw?.isError) return null;
  if(raw?.structuredContent) return raw.structuredContent;
  if(Array.isArray(raw?.content)) for(const entry of raw.content) if(entry.type === 'text') { try { return JSON.parse(entry.text); } catch {} }
  return raw;
}
export async function recordOutbound({repository,operationId,actionId,hostResult}) {
  return update(repository,operationId,state=>{
    check(state?.pending?.id === actionId,'stale_outbound_result','Record the actual result for the exact pending action.');
    const result=unwrap(hostResult);
    if(state.pending.kind === 'store') {
      try {
        const message=verifyReference({board:state.route.board,messageId:result?.message?.id,receiverId:state.route.recipient.id,result});
        const args=state.pending.host_call.arguments;
        check(message.body === args.body && message.sender_id === args.sender_id && typeof message.created_at === 'string' && Number.isFinite(Date.parse(message.created_at))
          && (message.reply_to_id ?? null) === (args.reply_to_id ?? null) && (message.collaboration_id ?? null) === (args.collaboration_id ?? null),
        'storage_unconfirmed','Storage must confirm the intact original body, author, reply and collaboration correlation.');
        if(args.collaboration_id !== undefined || message.handoff_depth != null || message.handoff_limit != null) {
          check(Number.isSafeInteger(message.handoff_depth) && Number.isSafeInteger(message.handoff_limit) && message.handoff_depth >= 1
            && message.handoff_depth <= message.handoff_limit && message.handoff_limit <= 100,'storage_unconfirmed','Require server-confirmed handoff depth and limit before notification.');
          state.handoff={depth:message.handoff_depth,limit:message.handoff_limit};
        }
        state.correlation={collaboration_id:message.collaboration_id ?? null,reply_to_id:message.reply_to_id ?? null};
        state.notification_conflict=state.transport === 'native' && result.notification && !['events_not_configured','subscription_required'].includes(result.notification.state);
        state.message_id=message.id; state.phase=state.transport === 'events' ? 'stored_events_only' : 'stored'; state.pending=null;
      } catch(error) { state.phase='storage_unconfirmed'; return {next:state,output:{...summary(state),detail:error.message}}; }
    } else if(result?.threadId === state.route.recipient.thread_id) {
      state.phase='submitted'; state.pending=null;
    } else state.phase='submission_unresolved';
    return {next:state,output:summary(state)};
  });
}
export async function outboundStatus({repository,operationId}) {
  const path=await journalPath(repository,operationId), state=JSON.parse(await readFile(path,'utf8'));
  return {...summary(state),read_only:true};
}
// Current read_thread returns userMessage.content text blocks. Concatenate
// only complete text blocks without normalization or inserted separators. A
// legacy flat text field is usable only when content is absent, never as a
// fallback for malformed, truncated or mismatched current-format evidence.
function nativeUserText(item) {
  if(item?.type !== 'userMessage' || item.truncated === true) return null;
  if(item.content !== undefined) {
    if(!Array.isArray(item.content) || !item.content.length || item.content.some(block=>block?.type !== 'text'
      || typeof block.text !== 'string' || block.truncated === true)) return null;
    return item.content.map(block=>block.text).join('');
  }
  return typeof item.text === 'string' ? item.text : null;
}
export async function reconcileOutbound({repository,operationId,hostResult}) {
  return update(repository,operationId,state=>{
    check(state?.pending?.kind === 'native','missing_outbound','Only a pending native submission needs history reconciliation.');
    const result=unwrap(hostResult), expected=state.pending.host_call.arguments;
    const found=result?.thread?.id === expected.threadId && result.thread.hostId === 'local' && result.thread.kind === 'codex'
      && result.turns?.some(turn=>turn.items?.some(item=>nativeUserText(item) === expected.prompt));
    if(found) { state.phase='submitted'; state.pending=null; }
    else state.phase='submission_unresolved';
    return {next:state,output:summary(state)};
  });
}
