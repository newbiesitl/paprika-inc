import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {fixture} from './mvp-fixture.mjs';
import {SqliteD1} from '../vendor/paprika-messenger/tests/d1-adapter.mjs';
import {BoardService} from '../vendor/paprika-messenger/src/service.mjs';
import {startOutbound,nextOutbound,recordOutbound} from '../plugins/paprika-inc/runtime/paprika-inc/outbound.mjs';
const actors={sender:{id:'sender',board:'main',label:'Sender',thread_id:'fixture-sender-thread'},receiver:{id:'receiver',board:'main',label:'Receiver',thread_id:'fixture-receiver-thread'}};
const env=sender=>({CODEX_THREAD_ID:sender.thread_id});
const context=(sender=actors.sender,recipient=actors.receiver)=>({deployment:'https://example.invalid',board:'main',service_available:true,recipient_can_retrieve:true,subscriptions:[],sender,recipient,
  service_tools:{post_message:'mcp__fixture__paprika_service_post_message',get_message:'mcp__fixture__paprika_service_get_message'},
  available_tools:['mcp__fixture__paprika_service_post_message','mcp__fixture__paprika_service_get_message'],native:{source:'read_thread',thread:{id:recipient.thread_id,kind:'codex',hostId:'local'}}});
async function setup(t) {
  const f=await fixture(t),db=new SqliteD1();t.after(()=>db.close());
  const root=new URL('../vendor/paprika-messenger/',import.meta.url);
  const journal=JSON.parse(await readFile(new URL('drizzle/meta/_journal.json',root),'utf8'));
  db.connection.exec((await Promise.all(journal.entries.map(e=>readFile(new URL('drizzle/'+e.tag+'.sql',root),'utf8')))).join('\n'));
  const service=new BoardService(db,'fixture-owner');
  for(const p of Object.values(actors)) {
    await service.register_participant({board:'main',participant_id:p.id,label:p.label,kind:'thread',thread_id:p.thread_id});
    await service.update_recipient_metadata({board:'main',entries:[{participant_id:p.id,thread_id:p.thread_id,source:'codex',execution_mode:'local',project_status:'unknown'}]});
  }
  return {repository:f.source,db,service};
}
async function begin(f,input,sender=actors.sender,recipient=actors.receiver) {
  const options={repository:f.repository,operationId:input.request_id,deliveryContext:context(sender,recipient)};
  const started=await startOutbound({repository:f.repository,deliveryInput:{topic:'Report',...input}},env(sender));
  return {options,sender,recipient,started,action:await nextOutbound(options,env(sender))};
}
async function store(f,operation) {
  const result=await f.service.post_message(operation.action.host_call.arguments);
  const status=await recordOutbound({...operation.options,actionId:operation.action.action_id,hostResult:result});
  return {result,status,notice:await nextOutbound(operation.options,env(operation.sender))};
}
async function chain(f,limit=2) {
  await f.service.configure_collaboration({board:'main',enabled:true,participant_ids:['sender','receiver'],max_handoff_depth:limit,expected_revision:0});
  return (await f.service.start_collaboration({board:'main',initiator_id:'sender',goal:'Fictional authorized task',idempotency_key:'root'})).collaboration;
}
test('short linked replies require intact storage and preserve the real stored parent; ordinary short tasks remain inline',async t=>{
  const f=await setup(t);
  const parent=(await f.service.post_message({board:'main',sender_id:'sender',sender_label:'Sender',receiver_id:'receiver',topic:'Task',body:'Parent.',idempotency_key:'parent'})).message;
  const reply=await begin(f,{request_id:'reply',body:'Done.',reply_to_id:parent.id,delivery_policy:{short_message_limit:15000}},actors.receiver,actors.sender);
  assert.equal(reply.started.delivery.mode,'reference'); assert.equal(reply.action.host_call.tool,'mcp__fixture__paprika_service_post_message');
  assert.equal(reply.action.host_call.arguments.reply_to_id,parent.id);
  const stored=await store(f,reply);
  assert.equal(stored.result.message.reply_to_id,parent.id);assert.equal(stored.result.message.body,'Done.');
  assert(stored.notice.host_call.arguments.prompt.includes('Reply to: '+parent.id));
  assert(!stored.notice.host_call.arguments.prompt.includes('Done.'));
  const ordinary=await begin(f,{request_id:'ordinary',body:'Done.'});
  assert.equal(ordinary.started.delivery.mode,'inline');assert.equal(ordinary.action.host_call.tool,'mcp__codex_app__send_message_to_thread');
  assert(ordinary.action.host_call.arguments.prompt.endsWith('Done.'));
});
test('short collaboration handoffs and replies use server-counted storage, preserve IDs and display only confirmed limits',async t=>{
  const f=await setup(t),run=await chain(f);
  const first=await begin(f,{request_id:'handoff-1',body:'Task.',collaboration_id:run.id});
  assert.equal(first.started.delivery.mode,'reference');assert.equal(first.action.host_call.arguments.collaboration_id,run.id);
  const one=await store(f,first);
  assert.equal(one.result.message.handoff_depth,1);assert.equal(one.notice.handoff_depth,1);assert.equal(one.notice.handoff_limit,2);
  assert.match(one.notice.host_call.arguments.prompt,/Handoff 1\/2/);
  await recordOutbound({...first.options,actionId:one.notice.action_id,hostResult:{threadId:first.recipient.thread_id}});
  const reply=await begin(f,{request_id:'handoff-2',body:'Done.',collaboration_id:run.id,reply_to_id:one.result.message.id},{...actors.receiver,handoff_depth:99,handoff_limit:100},actors.sender);
  const two=await store(f,reply),notice=two.notice.host_call.arguments.prompt;
  assert.equal(two.result.message.collaboration_id,run.id);assert.equal(two.result.message.reply_to_id,one.result.message.id);
  assert.match(notice,/Handoff 2\/2/);assert(!notice.includes('Handoff 99/100'));assert(!notice.includes('Done.'));
  assert(notice.includes('Collaboration ID: '+run.id));assert(notice.includes('Reply to: '+one.result.message.id));
  assert.equal((await f.service.get_collaboration({board:'main',collaboration_id:run.id})).collaboration.handoffs_used,2);
  assert.equal((await f.service.post_message(reply.action.host_call.arguments)).message.id,two.result.message.id);
});
test('exhausted and stopped server chains block short reports without any native send or replacement chain',async t=>{
  for(const reason of ['depth_limit_reached','stopped']) {
    const f=await setup(t),run=await chain(f,reason === 'stopped' ? 2 : 1);
    const first=await begin(f,{request_id:'first',body:'Task.',collaboration_id:run.id});
    const one=await store(f,first);
    if(reason==='stopped')await f.service.stop_collaboration({board:'main',collaboration_id:run.id});
    const reply=await begin(f,{request_id:'blocked-reply',body:'Done.',collaboration_id:run.id,reply_to_id:one.result.message.id},actors.receiver,actors.sender);
    assert.equal(reply.action.host_call.tool,'mcp__fixture__paprika_service_post_message');
    await assert.rejects(f.service.post_message(reply.action.host_call.arguments),{code:reason});
    await recordOutbound({...reply.options,actionId:reply.action.action_id,hostResult:{isError:true}});
    const blocked=await nextOutbound(reply.options,env(reply.sender));
    assert.equal(blocked.status,'storage_unconfirmed');assert(!blocked.host_call);
    assert.equal(f.db.connection.prepare('SELECT COUNT(*) AS n FROM messages').get().n,1);
    assert.equal((await f.service.get_collaboration({board:'main',collaboration_id:run.id})).collaboration.handoffs_used,1);
  }
});
test('missing or conflicting server correlation and handoff counts never expose a native notice',async t=>{
  for(const change of [{collaboration_id:undefined},{collaboration_id:'other'},{reply_to_id:'wrong'},{handoff_depth:undefined},{handoff_limit:undefined},{handoff_depth:3,handoff_limit:2}]) {
    const f=await setup(t),operation=await begin(f,{request_id:'bad-confirmation',body:'Done.',collaboration_id:'chain-1',reply_to_id:'parent-1'});
    const args=operation.action.host_call.arguments;
    const message={...args,id:'stored-message',created_at:'2026-01-01T00:00:00Z',handoff_depth:1,handoff_limit:2,...change};
    assert.equal((await recordOutbound({...operation.options,actionId:operation.action.action_id,hostResult:{message}})).status,'storage_unconfirmed');
    assert(!((await nextOutbound(operation.options,env(operation.sender))).host_call));
  }
});
test('legacy inline-linked operations remain frozen and blocked instead of switching modes or replaying',async t=>{
  const f=await setup(t),input={request_id:'legacy-linked',body:'Done.',topic:'Report',reply_to_id:'parent-1'};
  await startOutbound({repository:f.repository,deliveryInput:input},env(actors.sender));
  const path=join(f.repository,'.git/paprika-inc/outbound/legacy-linked.json');
  const saved=JSON.parse(await readFile(path,'utf8'));saved.policy.mode='inline';
  await writeFile(path,JSON.stringify(saved));
  const result=await nextOutbound({repository:f.repository,operationId:input.request_id,deliveryContext:context()},env(actors.sender));
  assert.equal(result.status,'linked_operation_unreconciled');assert(!result.host_call);
  assert.equal(JSON.parse(await readFile(path,'utf8')).policy.mode,'inline');
});
