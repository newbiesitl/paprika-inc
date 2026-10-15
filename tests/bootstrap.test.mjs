import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { beginBootstrap, nextBootstrap, recordBootstrap, bindBootstrapRole, bootstrapStatus } from '../plugins/paprika-inc/runtime/paprika-inc/bootstrap.mjs';
import { fixture, capabilities, projectReport, membershipReport, readReport, journal, git } from './mvp-fixture.mjs';
const code = value => error => error.code === value;
const wrap = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }], isError: false });
const start = (f, extra = {}) => beginBootstrap({ repository: f.source, destination: f.destination, expectedDigest: f.digest, hostCapabilities: capabilities(), ...extra });
async function record(root, action, result) { return recordBootstrap({ repository: root, actionId: action.action_id, hostResult: wrap(result) }); }
async function projects(f, extra = {}) {
  const action = await start(f, extra);
  assert.equal(action.host_call.tool, 'mcp__codex_app__list_projects');
  await record(f.destination, action, projectReport(f.destination));
}
async function drive(root, calls = [], max = 40) {
  for (let i = 0; i < max; i++) {
    const action = await nextBootstrap({ repository: root });
    if (action.status !== 'host_action') return action;
    calls.push(action);
    const tool = action.host_call.tool, args = action.host_call.arguments;
    const state = await journal(root), role = state.roles.find(role => role.id === action.role_id);
    let result;
    if (tool.endsWith('__list_projects')) result = projectReport(root);
    else if (tool.endsWith('__create_thread')) {
      assert.deepEqual(args.target, { type: 'project', projectId: 'fictional-project', environment: { type: 'local' } });
      assert.match(args.prompt, /READ\/REPORT ONLY/);
      assert.match(args.prompt, /Ownership is canonical only/);
      assert.ok(!Object.hasOwn(args, 'model'));
      result = { threadId: 'fictional-' + role.id, hostId: 'local' };
    } else if (tool.endsWith('__list_threads')) result = membershipReport(root, role.thread_id);
    else if (tool.endsWith('__send_message_to_thread')) result = { threadId: role.thread_id, hostId: 'local', status: 'submitted' };
    else if (tool.endsWith('__wait_threads')) result = { status: 'completed' };
    else if (tool.endsWith('__read_thread')) result = await readReport(root, role.id);
    else throw new Error('Unexpected host tool: ' + tool);
    await record(root, action, result);
  }
  throw new Error('Fixture exceeded bounded sequential steps');
}

test('supported native contract creates requested persistent project chats and records read/report readiness', async t => {
  const f = await fixture(t); await projects(f);
  const calls = [], result = await drive(f.destination, calls);
  assert.equal(result.status, 'ready');
  assert.equal(result.readiness_scope, 'requested_roster_read_report_onboarding_only');
  assert.ok(result.roles.every(role => role.project_verified && role.thread_verified && role.onboarded));
  assert.deepEqual(result.roles.map(role => role.thread_id), ['fictional-organizer', 'fictional-artisan']);
  assert.equal(calls.filter(call => call.host_call.tool.endsWith('__create_thread')).length, 2);
  assert.equal(await git(f.destination, 'status', '--porcelain'), '');
  assert.equal(result.limits.singleton_enforced, false); assert.equal(result.limits.concurrency_safe, false);
  assert.equal(result.limits.background_receiving, false); assert.equal(result.limits.automatic_adoption, false);
  assert.equal(result.evidence, 'recorded_native_tool_results_not_live_rechecked');
  if (process.platform !== 'win32') assert.equal((await stat(join(f.destination, '.git/paprika-inc/bootstrap-mvp.json'))).mode & 0o777, 0o600);
});

test('cloud or missing native capability hands off before cloning or creating', async t => {
  const f = await fixture(t);
  for (const hostCapabilities of [{ execution_mode: 'cloud', tools: [] }, { execution_mode: 'codex_local', tools: [] }]) {
    const result = await start(f, { hostCapabilities });
    assert.equal(result.status, 'local_host_handoff'); assert.equal(result.applied, false);
    assert.deepEqual(await readdir(f.destination), []);
  }
});

test('missing saved project gives a one-time add-folder handoff and resumes from actual catalog data', async t => {
  const f = await fixture(t), initial = await start(f);
  const missing = await record(f.destination, initial, { projects: [] });
  assert.equal(missing.status, 'awaiting_project'); assert.match(missing.next_step, /Add .* as a local Codex project/);
  assert.ok((await journal(f.destination)).roles.every(role => role.thread_id === null));
  const resume = await nextBootstrap({ repository: f.destination });
  assert.equal(resume.host_call.tool, 'mcp__codex_app__list_projects');
  await record(f.destination, resume, projectReport(f.destination));
  const next = await nextBootstrap({ repository: f.destination });
  assert.equal(next.host_call.tool, 'mcp__codex_app__create_thread');
});

test('matching cwd/title cannot substitute for exact native saved-project membership', async t => {
  const f = await fixture(t); await projects(f, { roles: 'organizer' });
  const create = await nextBootstrap({ repository: f.destination });
  await record(f.destination, create, { threadId: 'fictional-organizer', hostId: 'local' });
  const membership = await nextBootstrap({ repository: f.destination });
  const result = await record(f.destination, membership, membershipReport(f.destination, 'fictional-organizer', { projectId: null, title: 'Matching title' }));
  assert.equal(result.roles[0].project_verified, false);
  assert.equal(result.roles[0].status, 'membership_blocked');
  const retryRead = await nextBootstrap({ repository: f.destination });
  assert.equal(retryRead.host_call.tool, 'mcp__codex_app__list_threads');
  await record(f.destination, retryRead, membershipReport(f.destination, 'fictional-organizer'));
  assert.equal((await drive(f.destination)).status, 'ready');
});

test('unresolved create is never blindly reissued and can resume through a confirmed binding', async t => {
  const f = await fixture(t); await projects(f, { roles: 'organizer' });
  const create = await nextBootstrap({ repository: f.destination });
  const repeated = await nextBootstrap({ repository: f.destination });
  assert.equal(repeated.status, 'submission_unresolved'); assert.ok(!repeated.host_call);
  await recordBootstrap({ repository: f.destination, actionId: create.action_id, hostResult: { isError: true, content: [{ type: 'text', text: 'Fictional transport timeout' }] } });
  assert.equal((await nextBootstrap({ repository: f.destination })).status, 'creation_unresolved');
  await bindBootstrapRole({ repository: f.destination, roleId: 'organizer', threadId: 'fictional-confirmed-created' });
  const calls = [], result = await drive(f.destination, calls);
  assert.equal(result.status, 'ready');
  assert.equal(result.roles[0].thread_id, 'fictional-confirmed-created');
  assert.ok(calls.every(call => !call.host_call.tool.endsWith('__create_thread') && !call.host_call.tool.endsWith('__send_message_to_thread')));
});

test('deliberate rerun verifies known bindings and does not create or onboard them again', async t => {
  const f = await fixture(t); await projects(f); await drive(f.destination);
  const prior = (await bootstrapStatus({ repository: f.destination })).roles.map(role => role.thread_id);
  const rerun = await start(f); await record(f.destination, rerun, projectReport(f.destination));
  const calls = [], result = await drive(f.destination, calls);
  assert.equal(result.status, 'ready'); assert.deepEqual(result.roles.map(role => role.thread_id), prior);
  assert.ok(calls.every(call => !call.host_call.tool.endsWith('__create_thread') && !call.host_call.tool.endsWith('__send_message_to_thread')));
});

test('chosen existing initial staff chat is verified and receives only one scoped onboarding', async t => {
  const f = await fixture(t); await projects(f, { roles: 'organizer', initialRole: 'organizer', initialThreadId: 'fictional-initial-staff' });
  const calls = [], result = await drive(f.destination, calls);
  assert.equal(result.status, 'ready'); assert.equal(result.roles[0].thread_id, 'fictional-initial-staff');
  assert.equal(calls.filter(call => call.host_call.tool.endsWith('__create_thread')).length, 0);
  assert.equal(calls.filter(call => call.host_call.tool.endsWith('__send_message_to_thread')).length, 1);
});

test('partial failure preserves the first role and resolves the second without duplicate creation', async t => {
  const f = await fixture(t); await projects(f);
  const calls = [];
  for (let i = 0; i < 20; i++) {
    const action = await nextBootstrap({ repository: f.destination });
    calls.push(action);
    if (action.role_id === 'artisan' && action.host_call.tool.endsWith('__create_thread')) {
      await recordBootstrap({ repository: f.destination, actionId: action.action_id, hostResult: { isError: true } });
      break;
    }
    const role = (await journal(f.destination)).roles.find(role => role.id === action.role_id);
    const tool = action.host_call.tool;
    await record(f.destination, action, tool.endsWith('__create_thread') ? { threadId: 'fictional-organizer', hostId: 'local' }
      : tool.endsWith('__list_threads') ? membershipReport(f.destination, role.thread_id)
      : tool.endsWith('__read_thread') ? await readReport(f.destination, role.id) : { status: 'completed' });
  }
  const partial = await bootstrapStatus({ repository: f.destination });
  assert.equal(partial.roles[0].status, 'ready'); assert.equal(partial.roles[1].status, 'creation_unresolved');
  await bindBootstrapRole({ repository: f.destination, roleId: 'artisan', threadId: 'fictional-confirmed-artisan' });
  const resumed = [], result = await drive(f.destination, resumed);
  assert.equal(result.status, 'ready');
  assert.equal(result.roles[0].thread_id, 'fictional-organizer');
  assert.ok(resumed.every(call => !call.host_call.tool.endsWith('__create_thread')));
});

test('stale native result IDs cannot overwrite the pending operation', async t => {
  const f = await fixture(t); const action = await start(f);
  await assert.rejects(recordBootstrap({ repository: f.destination, actionId: 'fictional-stale-action', hostResult: projectReport(f.destination) }), code('stale_host_result'));
  assert.equal((await journal(f.destination)).pending_action.id, action.action_id);
});

test('a created native identity is retained even when definitions change during the call', async t => {
  const f = await fixture(t); await projects(f, { roles: 'organizer' });
  const create = await nextBootstrap({ repository: f.destination });
  await writeFile(join(f.destination, 'company/WORK.md'), '# New uncommitted definition input\n');
  await record(f.destination, create, { threadId: 'fictional-created-before-drift', hostId: 'local' });
  const result = await bootstrapStatus({ repository: f.destination });
  assert.equal(result.status, 'definition_changed'); assert.equal(result.roles[0].thread_id, 'fictional-created-before-drift');
  await assert.rejects(nextBootstrap({ repository: f.destination }), code('unpublished_definition'));
});

test('corrupt private records are preserved and never treated as an empty bootstrap', async t => {
  const f = await fixture(t); await start(f);
  const path = join(f.destination, '.git/paprika-inc/bootstrap-mvp.json');
  await writeFile(path, '{invalid');
  await assert.rejects(start(f), code('invalid_bootstrap_record'));
  assert.equal(await readFile(path, 'utf8'), '{invalid');
});

test('blocked or mismatched role receipts never establish onboarding readiness', async t => {
  const f = await fixture(t); await projects(f, { roles: 'organizer' });
  const create = await nextBootstrap({ repository: f.destination }); await record(f.destination, create, { threadId: 'fictional-organizer', hostId: 'local' });
  const membership = await nextBootstrap({ repository: f.destination }); await record(f.destination, membership, membershipReport(f.destination, 'fictional-organizer'));
  for (const options of [{ active: true }, { blocked: true }, { mismatch: true }]) {
    let read = await nextBootstrap({ repository: f.destination });
    if (read.host_call.tool.endsWith('__wait_threads')) {
      await recordBootstrap({ repository: f.destination, actionId: read.action_id, hostResult: { content: [{ type: 'text', text: 'Advisory wait result' }], isError: false } });
      read = await nextBootstrap({ repository: f.destination });
    }
    const result = await record(f.destination, read, await readReport(f.destination, 'organizer', options));
    assert.equal(result.roles[0].onboarded, false);
    if (!options.active) { assert.equal(result.ok, false); assert.equal(result.status, 'onboarding_blocked'); }
  }
  assert.equal((await drive(f.destination)).status, 'ready');
});

test('pending, remote or ephemeral create results never become confirmed persistent bindings', async t => {
  for (const raw of [{ clientThreadId: 'fictional-pending-client', hostId: 'local' },
    { threadId: 'fictional-cloud-session', hostId: 'cloud' },
    { threadId: 'fictional-ephemeral', hostId: 'local', ephemeral: true }]) {
    const f = await fixture(t); await projects(f, { roles: 'organizer' });
    const action = await nextBootstrap({ repository: f.destination });
    const result = await record(f.destination, action, raw);
    assert.equal(result.ok, false); assert.equal(result.status, 'creation_unresolved');
    assert.equal(result.roles[0].thread_id, null);
    assert.ok(!(await nextBootstrap({ repository: f.destination })).host_call);
  }
});

test('uncertain onboarding submission is reconciled through reads without resending', async t => {
  const f = await fixture(t); await projects(f, { roles: 'organizer', initialRole: 'organizer', initialThreadId: 'fictional-existing-staff' });
  const membership = await nextBootstrap({ repository: f.destination });
  await record(f.destination, membership, membershipReport(f.destination, 'fictional-existing-staff'));
  const onboard = await nextBootstrap({ repository: f.destination });
  assert.equal(onboard.host_call.tool, 'mcp__codex_app__send_message_to_thread');
  assert.equal((await nextBootstrap({ repository: f.destination })).status, 'submission_unresolved');
  await bindBootstrapRole({ repository: f.destination, roleId: 'organizer', threadId: 'fictional-existing-staff' });
  const calls = [], result = await drive(f.destination, calls);
  assert.equal(result.status, 'ready');
  assert.ok(calls.every(call => !call.host_call.tool.endsWith('__send_message_to_thread') && !call.host_call.tool.endsWith('__create_thread')));
});
