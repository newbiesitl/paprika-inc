import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile,stat} from 'node:fs/promises';
import {join} from 'node:path';
import {fixture,journal,projectReport,membershipReport,capabilities} from './mvp-fixture.mjs';
import {startOutbound as startImpl,nextOutbound as nextImpl,recordOutbound,outboundStatus,reconcileOutbound,chooseDelivery,verifyReference} from '../plugins/paprika-inc/runtime/paprika-inc/outbound.mjs';
import {beginBootstrap as beginImpl,nextBootstrap as bootstrapImpl,recordBootstrap,bindBootstrapRole} from '../plugins/paprika-inc/runtime/paprika-inc/bootstrap.mjs';
const env={CODEX_THREAD_ID:'fixture-current-chat'}, senderThread=env.CODEX_THREAD_ID;
const startOutbound=o=>startImpl(o,env), nextOutbound=o=>nextImpl(o,env);
const beginBootstrap=o=>beginImpl(o,env), nextBootstrap=o=>bootstrapImpl(o,env);
const ctx=(thread='fixture-recipient')=>({deployment:'https://example.invalid',board:'main',service_available:true,recipient_can_retrieve:true,
  service_tools:{post_message:'mcp__fixture__paprika_service_post_message',get_message:'mcp__fixture__paprika_service_get_message'},
  available_tools:['mcp__fixture__paprika_service_post_message','mcp__fixture__paprika_service_get_message'],subscriptions:[],
  sender:{id:'sender',label:'Registered Sender',board:'main',thread_id:senderThread},recipient:{id:'recipient',label:'Registered Recipient',board:'main',thread_id:thread},
  native:{source:'read_thread',thread:{id:thread,hostId:'local',kind:'codex'}}});
const presentation=()=>({schema_version:1,observed_at:new Date().toISOString(),host_id:'local',supports_plugin_mentions:true,
  plugin_invocation:{source:'current_plugin_invocation',host_id:'local',name:'paprika-inc',reference:'plugin://paprika-inc@fictional-catalog'},
  sender_metadata:{source:'read_thread',thread:{id:senderThread,title:'Observed Builder',kind:'codex',hostId:'local'}},
  role_binding:{source:'human_assignment',thread_id:senderThread,host_id:'local',role_id:'builder'}});
const confirmation=post=>({message:{...post,id:'message-1',created_at:'2026-01-01T00:00:00Z'}});
async function begin(t,body,policy) { const f=await fixture(t); const deliveryInput={request_id:'task-1',body,topic:'Task',...(policy?{delivery_policy:policy}:{})};
  await startOutbound({repository:f.source,deliveryInput}); return {...f,deliveryInput,repository:f.source,operationId:'task-1'}; }
test('Inc policy uses inclusive original Unicode code points and rejects force-inline or invalid limits',()=>{
  for(const n of [1499,1500,1501]) assert.equal(chooseDelivery('😀'.repeat(n)).mode,n<=1500?'inline':'reference');
  assert.equal(chooseDelivery(' e\u0301\r\n').code_points,5);
  assert.equal(chooseDelivery('small',{force_reference:true}).mode,'reference');
  for(const policy of [{force_inline:true},{short_message_limit:0},{short_message_limit:1.5}]) assert.throws(()=>chooseDelivery('x',policy));
});
test('short tasks stay intact inline; one pending native write suppresses retries and survives uncertain results',async t=>{
  const f=await begin(t,'Exact small task.\n');
  const first=await nextOutbound({...f,deliveryContext:ctx(),messageContext:presentation()});
  assert.equal(first.host_call.tool,'mcp__codex_app__send_message_to_thread');
  assert(first.host_call.arguments.prompt.endsWith(f.deliveryInput.body));
  assert(first.host_call.arguments.prompt.startsWith('![Paprika Inc](<'));
  assert(first.host_call.arguments.prompt.includes('\n[@Paprika Inc]'));
  const attempts=await Promise.all(Array.from({length:3},()=>nextOutbound(f).catch(e=>({status:e.code}))));
  assert(attempts.every(a=>!a.host_call));
  await recordOutbound({...f,actionId:first.action_id,hostResult:{isError:true}});
  assert.equal((await nextOutbound(f)).status,'submission_unresolved');
  assert.equal((await reconcileOutbound({...f,hostResult:{thread:{id:'fixture-recipient',hostId:'local',kind:'codex'},turns:[]}})).status,'submission_unresolved');
  const result=await reconcileOutbound({...f,hostResult:{thread:{id:'fixture-recipient',hostId:'local',kind:'codex'},turns:[{items:[{type:'userMessage',content:[{type:'text',text:first.host_call.arguments.prompt}]}]}]}});
  assert.equal(result.status,'submitted'); assert.equal((await nextOutbound(f)).status,'submitted');
});
test('large reports require confirmed intact storage and produce only metadata/reference native input',async t=>{
  const body=' \nPRIVATE full task payload. '.repeat(90)+'\n ', f=await begin(t,body), context=ctx();
  assert.equal((await nextOutbound(f)).status,'delivery_setup_required');
  assert.equal((await nextOutbound({...f,deliveryContext:{...context,recipient_can_retrieve:false}})).status,'delivery_setup_required');
  const post=await nextOutbound({...f,deliveryContext:context,messageContext:presentation()});
  assert.equal(post.host_call.arguments.body,body);
  assert.equal((await nextOutbound(f)).status,'storage_unconfirmed');
  await recordOutbound({...f,actionId:post.action_id,hostResult:{isError:true}});
  const retry=await nextOutbound({...f,retryStorage:true}); assert.deepEqual(retry.host_call,post.host_call);
  const stored=confirmation(post.host_call.arguments);
  await recordOutbound({...f,actionId:post.action_id,hostResult:stored});
  const native=await nextOutbound({...f,deliveryContext:context,messageContext:presentation()});
  const prompt=native.host_call.arguments.prompt;
  assert(prompt.startsWith('![Paprika Inc](<'));
  for(const text of [body,'PRIVATE full task payload.']) assert(!prompt.includes(text));
  for(const text of ['Observed Builder','Role: builder','Sender ID: sender','Receiver ID: recipient','message-1','main','get_message']) assert(prompt.includes(text));
  assert.equal(verifyReference({board:'main',messageId:'message-1',receiverId:'recipient',result:stored}).body,body);
  assert.throws(()=>verifyReference({board:'main',messageId:'message-1',receiverId:'other',result:stored}),e=>e.code==='retrieval_blocked');
  const path=join(f.source,'.git/paprika-inc/outbound/task-1.json'), saved=JSON.parse(await readFile(path,'utf8'));
  assert.deepEqual(saved.pending.host_call,native.host_call);
  if(process.platform!=='win32') assert.equal((await stat(path)).mode&0o777,0o600);
  await assert.rejects(startOutbound({repository:f.source,deliveryInput:{...f.deliveryInput,delivery_policy:{short_message_limit:10000}}}),e=>e.code==='outbound_conflict');
  await recordOutbound({...f,actionId:native.action_id,hostResult:{threadId:'fixture-recipient'}});
  assert.equal((await outboundStatus(f)).status,'submitted');
});
test('an older frozen native prompt is not rewritten to add artwork',async t=>{
  const f=await begin(t,'Preserve this original body.\n');
  await nextOutbound({...f,deliveryContext:ctx(),messageContext:presentation()});
  const path=join(f.source,'.git/paprika-inc/outbound/task-1.json');
  const saved=JSON.parse(await readFile(path,'utf8'));
  saved.pending.host_call.arguments.prompt=saved.pending.host_call.arguments.prompt.split('\n').slice(1).join('\n');
  const legacy=structuredClone(saved.pending.host_call);
  assert(legacy.arguments.prompt.startsWith('[@Paprika Inc]'));
  await writeFile(path,JSON.stringify(saved));
  const fresh=presentation();fresh.sender_metadata.thread.title='New title after freeze';
  const next=await nextOutbound({...f,deliveryContext:ctx(),messageContext:fresh});
  assert.equal(next.status,'submission_unresolved');assert(!next.host_call);
  assert.deepEqual(JSON.parse(await readFile(path,'utf8')).pending.host_call,legacy);
});
test('storage mismatch, huge service payloads, unsupported destinations and event changes never fall back inline',async t=>{
  const f=await begin(t,'sensitive '.repeat(200)),context=ctx();
  assert.equal((await nextOutbound({...f,deliveryContext:{...context,native:{source:'read_thread',thread:{id:'fixture-recipient',kind:'chatgpt'}}}})).status,'invalid_delivery_route');
  const post=await nextOutbound({...f,deliveryContext:context});
  assert.equal((await recordOutbound({...f,actionId:post.action_id,hostResult:confirmation({...post.host_call.arguments,body:'altered'})})).status,'storage_unconfirmed');
  await recordOutbound({...f,actionId:post.action_id,hostResult:confirmation(post.host_call.arguments)});
  assert.equal((await nextOutbound({...f,deliveryContext:{...context,subscriptions:[{board:'main',receiver_id:'recipient',active:true,expires_at:null}]}})).status,'transport_changed');
  const huge=await begin(t,'😀'.repeat(5000));
  assert.equal((await nextOutbound({...huge,deliveryContext:ctx()})).status,'storage_payload_unsupported');
});
test('paused event route owns notification; force-reference preserves short bodies and correlation',async t=>{
  const f=await begin(t,'Exact short message.',{force_reference:true}),context=ctx();
  context.subscriptions=[{board:'main',receiver_id:'recipient',active:true,paused:true,expires_at:null}];
  const post=await nextOutbound({...f,deliveryContext:context});
  const result=await recordOutbound({...f,actionId:post.action_id,hostResult:confirmation(post.host_call.arguments)});
  assert.equal(result.status,'stored_events_only'); assert.equal((await nextOutbound(f)).status,'stored_events_only');
});
test('large create/onboard uses a self-contained waiting bootstrap, then stored task and exact reference with no duplicate creation',async t=>{
  const f=await fixture(t),repository=f.destination, record=(action,result)=>recordBootstrap({repository,actionId:action.action_id,deliveryActionId:action.delivery_action_id,hostResult:result});
  const initial=await beginBootstrap({repository:f.source,destination:f.destination,hostCapabilities:capabilities(),roles:'organizer',deliveryPolicy:{short_message_limit:50}});
  await record(initial,projectReport(repository));
  const create=await nextBootstrap({repository});
  assert.equal(create.host_call.tool,'mcp__codex_app__create_thread');
  assert(create.host_call.arguments.prompt.includes('Wait for the sender'));
  assert(!create.host_call.arguments.prompt.includes('request_id='));
  assert.equal((await nextBootstrap({repository})).status,'submission_unresolved');
  await record(create,{threadId:'new-role-chat',hostId:'local'});
  assert.equal((await journal(repository)).roles[0].onboarding_submitted,false);
  await record(await nextBootstrap({repository}),membershipReport(repository,'new-role-chat'));
  assert.equal((await nextBootstrap({repository})).status,'delivery_setup_required');
  const context=ctx('new-role-chat'),post=await nextBootstrap({repository,deliveryContext:context});
  assert.equal(post.host_call.tool,context.service_tools.post_message);
  assert(post.host_call.arguments.body.includes('request_id='));
  const stored=confirmation(post.host_call.arguments); await record(post,stored);
  const notify=await nextBootstrap({repository,deliveryContext:context});
  assert.equal(notify.host_call.tool,'mcp__codex_app__send_message_to_thread');
  assert(!notify.host_call.arguments.prompt.includes('request_id=')); assert(notify.host_call.arguments.prompt.includes('message-1'));
  await record(notify,{threadId:'new-role-chat'});
  assert.equal((await journal(repository)).roles[0].onboarding_submitted,true);
  assert.equal((await nextBootstrap({repository})).host_call.tool,'mcp__codex_app__wait_threads');
});

test('long create uncertainty keeps external onboarding pending after a verified explicit binding',async t=>{
  const f=await fixture(t),repository=f.destination,record=(action,result)=>recordBootstrap({repository,actionId:action.action_id,hostResult:result});
  const initial=await beginBootstrap({repository:f.source,destination:repository,roles:'organizer',hostCapabilities:capabilities(),deliveryPolicy:{short_message_limit:50}});
  await record(initial,projectReport(repository)); const create=await nextBootstrap({repository});
  await record(create,{isError:true});
  await bindBootstrapRole({repository,roleId:'organizer',threadId:'confirmed-role-chat'});
  await record(await nextBootstrap({repository}),membershipReport(repository,'confirmed-role-chat'));
  const action=await nextBootstrap({repository,deliveryContext:ctx('confirmed-role-chat')});
  assert.equal(action.host_call.tool,'mcp__fixture__paprika_service_post_message');
  assert.equal((await journal(repository)).roles[0].onboarding_submitted,false);
});

test('an event or unknown notification reported by storage blocks a second native transport',async t=>{
  for(const state of ['pending','accepted','status_unavailable']) {
    const f=await begin(t,'Private task body. '.repeat(100));
    const post=await nextOutbound({...f,deliveryContext:ctx()});
    await recordOutbound({...f,actionId:post.action_id,hostResult:{...confirmation(post.host_call.arguments),notification:{state}}});
    const next=await nextOutbound({...f,deliveryContext:ctx()});
    assert.equal(next.status,'transport_changed'); assert(!next.host_call);
  }
});


test('reconciliation matches exact current native text blocks and refuses truncated, mismatched or conflicting evidence',async t=>{
  const f=await begin(t,'Exact Unicode task: 😀 e\u0301\r\n');
  const action=await nextOutbound({...f,deliveryContext:ctx()});
  await recordOutbound({...f,actionId:action.action_id,hostResult:{isError:true}});
  const prompt=action.host_call.arguments.prompt, thread={id:'fixture-recipient',kind:'codex',hostId:'local'};
  const item={type:'userMessage',content:[{type:'text',text:prompt}]};
  const history=(user=item,native=thread)=>({schemaVersion:1,thread:native,turns:[{items:[user]}]});
  const invalid=[
    history(null),
    history({...item,content:[{type:'text',text:prompt.slice(0,-1)}]}),
    history({...item,content:[{type:'text',text:prompt+' changed'}]}),
    history({...item,type:'agentMessage'}),
    history({...item,truncated:true}),
    history({...item,content:[{type:'text',text:prompt,truncated:true}]}),
    history({...item,text:prompt,content:[{type:'text',text:'Truncated excerpt'}]}),
    history({...item,text:prompt,content:null}),
    history({...item,content:[...item.content,{type:'image',text:'not text evidence'}]}),
    history(item,{...thread,id:'another-recipient'}),
    history(item,{...thread,hostId:'another-host'}),
    history(item,{...thread,kind:'chatgpt'}),
  ];
  for(const hostResult of invalid) {
    assert.equal((await reconcileOutbound({...f,hostResult})).status,'submission_unresolved');
    assert.ok(!(await nextOutbound(f)).host_call);
  }
  const positive=history({...item,content:[{type:'text',text:prompt.slice(0,32)},{type:'text',text:prompt.slice(32)}]});
  assert.equal((await reconcileOutbound({...f,hostResult:{content:[{type:'text',text:JSON.stringify(positive)}]}})).status,'submitted');
  assert.equal((await nextOutbound(f)).status,'submitted');
  const legacy=await begin(t,'Legacy delivery evidence.'), old=await nextOutbound({...legacy,deliveryContext:ctx()});
  await recordOutbound({...legacy,actionId:old.action_id,hostResult:{isError:true}});
  assert.equal((await reconcileOutbound({...legacy,hostResult:history({type:'userMessage',text:old.host_call.arguments.prompt})})).status,'submitted');
});

test('active and paused recipient subscriptions do not block short inline sends or create board posts',async t=>{
  for(const paused of [false,true]) {
    const f=await begin(t,'Short inline task.'), context=ctx();
    context.subscriptions=[{board:'main',receiver_id:'recipient',active:true,paused,expires_at:null}];
    const action=await nextOutbound({...f,deliveryContext:context});
    assert.equal(action.status,'host_action'); assert.equal(action.delivery.mode,'inline');
    assert.equal(action.host_call.tool,'mcp__codex_app__send_message_to_thread');
    assert.equal(action.message_id,null); assert.equal(action.transport,'native');
    assert(action.host_call.arguments.prompt.endsWith(f.deliveryInput.body));
    const saved=JSON.parse(await readFile(join(f.source,'.git/paprika-inc/outbound/task-1.json'),'utf8'));
    assert.equal(saved.pending.kind,'native'); assert(!saved.message_id);
    assert.equal((await nextOutbound({...f,deliveryContext:context})).status,'submission_unresolved');
  }
});

test('active and paused subscriptions still own long reference delivery and block a second transport after storage',async t=>{
  for(const paused of [false,true]) {
    const subscription={board:'main',receiver_id:'recipient',active:true,paused,expires_at:null};
    const owned=await begin(t,'Long reference task. '.repeat(100)), context=ctx();
    context.subscriptions=[subscription];
    const post=await nextOutbound({...owned,deliveryContext:context});
    assert.equal(post.delivery.mode,'reference'); assert.equal(post.transport,'events');
    assert.equal(post.host_call.tool,context.service_tools.post_message);
    await recordOutbound({...owned,actionId:post.action_id,hostResult:confirmation(post.host_call.arguments)});
    const complete=await nextOutbound({...owned,deliveryContext:context});
    assert.equal(complete.status,'stored_events_only'); assert(!complete.host_call);
    const changed=await begin(t,'Long reference task. '.repeat(100));
    const prepared=await nextOutbound({...changed,deliveryContext:ctx()});
    await recordOutbound({...changed,actionId:prepared.action_id,hostResult:confirmation(prepared.host_call.arguments)});
    const blocked=await nextOutbound({...changed,deliveryContext:context});
    assert.equal(blocked.status,'transport_changed'); assert(!blocked.host_call);
  }
});
