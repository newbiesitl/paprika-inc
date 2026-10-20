import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile, readFile, mkdir, symlink, mkdtemp, rm} from 'node:fs/promises';
import {join} from 'node:path';
import {tmpdir} from 'node:os';
import {fixture} from './mvp-fixture.mjs';
import {prepareMeetingMessage, meetingReceipt, exportMeetingNotes} from '../plugins/paprika-inc/runtime/paprika-inc/meeting-pilot.mjs';
import {nextOutbound, recordOutbound} from '../plugins/paprika-inc/runtime/paprika-inc/outbound.mjs';
import {runCli, parseArguments} from '../plugins/paprika-inc/runtime/paprika-inc/cli.mjs';

const env = {CODEX_THREAD_ID:'coordinator-chat'};
const report = () => ({meeting:{id:'meeting-1', board:'team', notifications:[{id:'notice-1', sender_id:'room', recipient_id:'participant-a',
  kind:'ROUND_START', topic:'Meeting round start', body:'ROUND_START board=team meeting=meeting-1 round=2/3 after=1 sender=room recipient=participant-a. Read published round 1.'}]}});
const context = () => ({deployment:'https://example.invalid', board:'team', subscriptions:[], sender:{id:'room', board:'team', label:'Meeting room', thread_id:env.CODEX_THREAD_ID},
  recipient:{id:'participant-a', board:'team', label:'Participant A', thread_id:'participant-chat'}, native:{source:'read_thread', thread:{id:'participant-chat', hostId:'local', kind:'codex'}}});
const presentation = () => ({schema_version:1, observed_at:new Date().toISOString(), host_id:'local',
  sender_metadata:{source:'read_thread', thread:{id:env.CODEX_THREAD_ID, title:'Meeting coordinator', kind:'codex', hostId:'local'}},
  role_binding:{source:'human_assignment', thread_id:env.CODEX_THREAD_ID, host_id:'local', role_id:'facilitator'}});
const bundle = () => ({format:'paprika-meeting-export/v1', board:'private-board', meeting_id:'private-meeting', source_revision:10,
  suggested_directory:'2026-10-20-design-review', documents:{'notes.md':'# Design review\n\nCurated notes.\n', 'summary.md':'# Summary\n\nB disagrees; follow up.\n'}});

test('meeting references use the existing Inc sender, native action, frozen route and receipt journal', async t => {
  const {source:repository} = await fixture(t);
  const options = {repository, meetingReport:report(), notificationId:'notice-1'};
  const first = await prepareMeetingMessage(options, env);
  assert.equal(first.status, 'prepared'); assert.ok(!first.host_call);
  assert.equal((await prepareMeetingMessage(options, env)).operation_id, first.operation_id);
  const common = {repository, operationId:first.operation_id};
  await assert.rejects(meetingReceipt(common), e => e.code === 'meeting_delivery_unconfirmed');
  const wrong = context(); wrong.recipient.id = 'different';
  assert.equal((await nextOutbound({...common, deliveryContext:wrong, messageContext:presentation()}, env)).status, 'invalid_delivery_route');
  const action = await nextOutbound({...common, deliveryContext:context(), messageContext:presentation()}, env);
  assert.equal(action.host_call.tool, 'mcp__codex_app__send_message_to_thread');
  assert.equal(action.host_call.arguments.threadId, 'participant-chat');
  assert.match(action.host_call.arguments.prompt, /Paprika Inc/);
  assert.match(action.host_call.arguments.prompt, /round=2\/3 after=1/);
  assert.equal((await nextOutbound(common, env)).status, 'submission_unresolved');
  await recordOutbound({...common, actionId:action.action_id, hostResult:{threadId:'participant-chat'}});
  const receipt = await meetingReceipt(common);
  assert.equal(receipt.service_operation, 'record_meeting_notification');
  assert.equal(receipt.arguments.notification_id, 'notice-1'); assert.equal(receipt.arguments.delivery_state, 'submitted');
  assert.equal(receipt.arguments.recipient_id, 'participant-a'); assert.equal(receipt.recipient_read, 'unverified');
  assert.equal((await prepareMeetingMessage(options, env)).status, 'submitted', 'retry reuses the confirmed journal');
  const recorded = report(); recorded.meeting.notifications[0].delivery = {operation_id:first.operation_id, state:'submitted'};
  assert.equal((await prepareMeetingMessage({...options, meetingReport:recorded}, env)).status, 'already_recorded');
  const obsolete = report(); obsolete.meeting.notifications[0].actionable = false;
  await assert.rejects(prepareMeetingMessage({...options, meetingReport:obsolete}, env), e => e.code === 'meeting_notification_obsolete');
  const changed = report(); changed.meeting.notifications[0].body += ' Changed.';
  await assert.rejects(prepareMeetingMessage({...options, meetingReport:changed}, env), e => e.code === 'outbound_conflict');
});

test('repository export is idempotent, preserves edited files and keeps routing provenance private', async t => {
  const {source:repository} = await fixture(t), options = {repository, meetingReport:bundle()};
  const result = await exportMeetingNotes(options);
  assert.equal(result.applied, true); assert.equal(result.git_commit_created, false);
  assert.equal(await readFile(join(result.directory, 'notes.md'), 'utf8'), bundle().documents['notes.md']);
  assert.equal((await exportMeetingNotes(options)).duplicate, true);
  assert.ok(result.private_provenance.includes(join('.git', 'paprika-inc', 'meeting-exports')));
  assert.match(await readFile(result.private_provenance, 'utf8'), /private-board/);
  assert.equal((await readFile(join(result.directory, 'notes.md'), 'utf8')).includes('private-board'), false);
  await writeFile(join(result.directory, 'notes.md'), 'User edited these notes.');
  await assert.rejects(exportMeetingNotes(options), e => e.code === 'meeting_export_conflict');
  assert.equal(await readFile(join(result.directory, 'notes.md'), 'utf8'), 'User edited these notes.');
  const revised = await exportMeetingNotes({...options, exportName:'2026-10-20-design-review-revised'});
  assert.equal(revised.applied, true);
});

test('export rejects unsafe names, additional files, linked directories and partial destinations', async t => {
  const {source:repository} = await fixture(t);
  for (const exportName of ['../escape', '2026-10-20-topic/elsewhere', 'C:\\escape', '2026-10-20-..'])
    await assert.rejects(exportMeetingNotes({repository, meetingReport:bundle(), exportName}), e => e.code === 'invalid_meeting_export_path');
  const bad = bundle(); bad.documents['extra.md'] = 'Unexpected';
  await assert.rejects(exportMeetingNotes({repository, meetingReport:bad}), e => e.code === 'invalid_meeting_export');
  const target = join(repository, 'meetings', bundle().suggested_directory); await mkdir(target, {recursive:true});
  await writeFile(join(target, 'notes.md'), 'Partial export or user work.');
  await assert.rejects(exportMeetingNotes({repository, meetingReport:bundle()}), e => e.code === 'meeting_export_conflict');
  const other = await fixture(t), outside = await mkdtemp(join(tmpdir(), 'meeting-outside-'));
  t.after(() => rm(outside, {recursive:true, force:true}));
  await symlink(outside, join(other.source, 'meetings'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(exportMeetingNotes({repository:other.source, meetingReport:bundle()}), e => e.code === 'unsafe_meeting_export');
});

test('CLI loads a private export tool result and writes the requested meeting folder', async t => {
  const {source:repository} = await fixture(t), input = join(repository, 'private-result.json');
  await writeFile(input, JSON.stringify({structuredContent:bundle()}));
  let output = ''; const exit = await runCli(['meeting', 'export', '--repo', repository, '--meeting-report', input], {write:value => { output += value; }});
  assert.equal(exit, 0); assert.equal(JSON.parse(output).command, 'meeting export');
  assert.equal(parseArguments(['meeting', 'message', '--notification', 'notice-1']).notificationId, 'notice-1');
});
