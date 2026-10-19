import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, mkdir, rm, symlink, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { authorCompany, renderCompany } from '../plugins/paprika-inc/runtime/paprika-inc/authoring.mjs';
import { inspectDefinition } from '../plugins/paprika-inc/runtime/paprika-inc/definition.mjs';
import { blueprint } from './mvp-fixture.mjs';
const code = value => error => error.code === value;

async function folder(t) {
  const root = await mkdtemp(join(tmpdir(), 'inc-author-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  await writeFile(join(root, 'AGENTS.md'), '# Existing human instructions\n');
  return root;
}

test('generic roster draft previews focused diffs without files, chats or grants', async t => {
  const root = await folder(t), before = await readdir(root);
  const plan = await authorCompany({ repository: root, spec: blueprint() });
  assert.equal(plan.read_only, true); assert.equal(plan.applied, false);
  assert.equal(plan.live_roles_created, false); assert.equal(plan.grants_changed, false);
  assert.ok(plan.changes.some(change => change.path === 'company/ownership.json' && change.diff.startsWith('--- /dev/null')));
  assert.ok(plan.changes.every(change => change.path !== 'AGENTS.md'));
  assert.deepEqual(await readdir(root), before);
});

test('explicit writing creates complete contracts and one ownership map, preserving user files', async t => {
  const root = await folder(t);
  await writeFile(join(root, 'README.md'), '# Existing product\n');
  const before = await readFile(join(root, 'AGENTS.md'), 'utf8');
  const result = await authorCompany({ repository: root, spec: blueprint(), write: true });
  const definition = await inspectDefinition(root);
  assert.deepEqual(definition.roles.map(role => role.id), ['organizer', 'artisan']);
  assert.equal(definition.manifest.ownership, 'company/ownership.json');
  assert.equal(definition.ownership.entries.length, 2);
  for (const role of definition.roles) for (const heading of ['Purpose', 'Responsibilities', 'Ownership', 'Boundaries', 'Inputs', 'Outputs and acceptance', 'Review relationships', 'Escalation']) assert.ok(role.text.includes('## ' + heading));
  for (const role of definition.roles) {
    assert.match(role.text, /use the Paprika Inc skill and its message start\/next\/record workflow/);
    assert.match(role.text, /These instructions authorize no message during read\/report onboarding/);
  }
  assert.equal(result.definition_input_sha256, definition.definition_input_sha256);
  assert.match(result.publication, /draft_commit_and_publish/);
  assert.equal(await readFile(join(root, 'AGENTS.md'), 'utf8'), before);
  assert.equal(await readFile(join(root, 'README.md'), 'utf8'), '# Existing product\n');
  const again = await authorCompany({ repository: root, spec: blueprint(), write: true });
  assert.deepEqual(again.created_files, []);
});

test('different existing company files block all writes and retain a reviewable diff', async t => {
  const root = await folder(t);
  await mkdir(join(root, 'company'));
  await writeFile(join(root, 'company/company.json'), '{"user_file":true}\n');
  const plan = await authorCompany({ repository: root, spec: blueprint() });
  assert.deepEqual(plan.conflicts, ['company/company.json']);
  assert.match(plan.changes[0].diff, /-\{"user_file":true\}/);
  await assert.rejects(authorCompany({ repository: root, spec: blueprint(), write: true }), code('authoring_conflict'));
  assert.equal(await readFile(join(root, 'company/company.json'), 'utf8'), '{"user_file":true}\n');
  assert.deepEqual(await readdir(join(root, 'company')), ['company.json']);
});

for (const [name, change, errorCode] of [
  ['missing company ID', value => { delete value.company_id; }, 'invalid_blueprint'],
  ['duplicate role IDs', value => { value.roles[1].id = value.roles[0].id; }, 'invalid_blueprint'],
  ['missing role boundary', value => { value.roles[0].boundaries = []; }, 'invalid_blueprint'],
  ['self review', value => { value.roles[0].reviewer_roles = ['organizer']; }, 'invalid_reviewer'],
  ['unknown owner', value => { value.ownership[0].owner_role = 'absent'; }, 'unknown_owner'],
  ['overlapping ownership', value => { value.ownership[1].path = 'docs/nested/'; }, 'overlapping_ownership'],
  ['case-colliding ownership', value => { value.ownership[1].path = 'DOCS/'; }, 'overlapping_ownership'],
  ['private ownership', value => { value.ownership[0].path = '.git/config'; }, 'invalid_ownership_path'],
  ['traversal ownership', value => { value.ownership[0].path = '../outside/'; }, 'invalid_ownership_path'],
  ['wildcard ownership', value => { value.ownership[0].path = 'src/*'; }, 'invalid_ownership_path'],
  ['duplicate metadata in prose', value => { value.roles[0].purpose += '\nRole ID: `other`'; }, 'invalid_blueprint'],
  ['native identity in public blueprint', value => { value.thread_id = 'fictional-thread'; }, 'invalid_blueprint'],
]) test(`authoring rejects ${name}`, () => {
  const input = blueprint(); change(input);
  assert.throws(() => renderCompany(input), code(errorCode));
});

test('authoring refuses a symlinked company directory', async t => {
  const root = await folder(t), other = await folder(t);
  await symlink(other, join(root, 'company'), process.platform === 'win32' ? 'junction' : 'dir');
  await assert.rejects(authorCompany({ repository: root, spec: blueprint(), write: true }), code('unsafe_authoring_path'));
  assert.deepEqual(await readdir(other), ['AGENTS.md']);
});
