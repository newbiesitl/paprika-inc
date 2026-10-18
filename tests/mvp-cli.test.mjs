import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { fixture, capabilities, projectReport, blueprint, senderContext } from './mvp-fixture.mjs';

const helper = fileURLToPath(new URL('../plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs', import.meta.url));
function call(...args) {
  const result = spawnSync(process.execPath, [helper, ...args], { encoding: 'utf8', env:{...process.env,CODEX_THREAD_ID:'fixture-cli-sender'} });
  assert.equal(result.stderr, '');
  return { ...result, json: JSON.parse(result.stdout) };
}

test('installed-style CLI accepts private blueprint/capability/results and prepares native project actions', async t => {
  const f = await fixture(t), spec = join(f.base, 'discussed blueprint.json'), caps = join(f.base, 'actual capabilities.json'), results = join(f.base, 'actual host result.json');
  await writeFile(spec, JSON.stringify(blueprint())); await writeFile(caps, JSON.stringify(capabilities()));
  const plan = call('author', 'plan', '--repo', f.source, '--spec', spec);
  assert.equal(plan.status, 0); assert.equal(plan.json.command, 'author plan'); assert.deepEqual(plan.json.changes, []);
  const start = call('bootstrap', 'start', '--repo', f.source, '--destination', f.destination, '--revision', f.revision, '--definition-digest', f.digest, '--host-capabilities', caps);
  assert.equal(start.status, 0); assert.equal(start.json.host_call.tool, 'mcp__codex_app__list_projects');
  assert.equal(start.json.native_action_executed_by_helper, false);
  await writeFile(results, JSON.stringify({ content: [{ type: 'text', text: JSON.stringify(projectReport(f.destination)) }], isError: false }));
  const recorded = call('bootstrap', 'record', '--repo', f.destination, '--action', start.json.action_id, '--result', results);
  assert.equal(recorded.status, 0);
  const missingSender = call('bootstrap', 'next', '--repo', f.destination);
  assert.equal(missingSender.json.status,'sender_metadata_required');
  assert.ok(!missingSender.json.host_call);
  const observations = join(f.base,'sender observations.json');
  await writeFile(observations,JSON.stringify(senderContext('fixture-cli-sender')));
  const next = call('bootstrap', 'next', '--repo', f.destination, '--message-context', observations);
  assert.equal(next.json.host_call.tool, 'mcp__codex_app__create_thread');
  const blockedReplay = call('bootstrap', 'next', '--repo', f.destination);
  assert.equal(blockedReplay.json.status, 'submission_unresolved'); assert.ok(!blockedReplay.json.host_call);
  const state = call('bootstrap', 'status', '--repo', f.destination);
  assert.equal(state.json.project_id, 'fictional-project'); assert.equal(state.json.roles[0].thread_id, null);
});

test('invalid/credential-bearing CLI writes fail without claiming no possible partial progress', async t => {
  const f = await fixture(t), invalid = join(f.base, 'invalid.json'); await writeFile(invalid, '{broken');
  const result = call('author', 'write', '--repo', f.source, '--spec', invalid);
  assert.equal(result.status, 2); assert.equal(result.json.read_only, false); assert.equal(result.json.applied, null);
  const credentials = call('checkout', '--repo', 'https://secret@example.invalid/workshop.git', '--destination', f.destination);
  assert.equal(credentials.status, 2); assert.equal(credentials.json.error.code, 'invalid_git_repository');
  assert.equal(await readFile(join(f.source, 'AGENTS.md'), 'utf8'), '# Existing user directions\nPreserve this file.\n');
});
