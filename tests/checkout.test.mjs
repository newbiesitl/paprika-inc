import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, readdir, rm, mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { checkoutCompany, repositoryIdentity } from '../plugins/paprika-inc/runtime/paprika-inc/checkout.mjs';
import { fixture, git } from './mvp-fixture.mjs';
const code = value => error => error.code === value;

test('clone uses an empty explicit destination and pins the committed discussed definition', async t => {
  const f = await fixture(t);
  const result = await checkoutCompany({ source: f.source, destination: f.destination, revision: f.revision, expectedDigest: f.digest });
  assert.equal(result.checkout_action, 'cloned'); assert.equal(result.commit, f.revision);
  assert.equal(result.definition.definition_input_sha256, f.digest);
  assert.equal(await readFile(join(f.destination, 'AGENTS.md'), 'utf8'), '# Existing user directions\nPreserve this file.\n');
  assert.ok(!(await readdir(f.base)).some(name => name.startsWith('.paprika-inc-clone-')));
});

test('matching checkout reuses it and preserves unrelated working files', async t => {
  const f = await fixture(t);
  await checkoutCompany({ source: f.source, destination: f.destination });
  await writeFile(join(f.destination, 'user-notes.txt'), 'Keep my uncommitted notes.\n');
  const result = await checkoutCompany({ source: f.source, destination: f.destination, expectedDigest: f.digest });
  assert.equal(result.checkout_action, 'reused_matching_checkout');
  assert.equal(await readFile(join(f.destination, 'user-notes.txt'), 'utf8'), 'Keep my uncommitted notes.\n');
});

test('unrelated nonempty directory and a different origin are never overwritten', async t => {
  const f = await fixture(t);
  await writeFile(join(f.destination, 'important.txt'), 'user data');
  await assert.rejects(checkoutCompany({ source: f.source, destination: f.destination }), code('destination_not_empty'));
  assert.equal(await readFile(join(f.destination, 'important.txt'), 'utf8'), 'user data');
  const second = join(f.base, 'different-origin'); await mkdir(second); await git(second, 'init', '--initial-branch=main');
  await rm(join(f.destination, 'important.txt'));
  await checkoutCompany({ source: f.source, destination: f.destination });
  await assert.rejects(checkoutCompany({ source: second, destination: f.destination }), code('repository_mismatch'));
  assert.equal(await git(f.destination, 'rev-parse', 'HEAD'), f.revision);
});

test('uncommitted source drafts are reported rather than cloning stale definitions', async t => {
  const f = await fixture(t);
  await writeFile(join(f.source, 'company/roles/artisan/agent.md'), (await readFile(join(f.source, 'company/roles/artisan/agent.md'), 'utf8')) + '\nDiscussed draft.\n');
  await assert.rejects(checkoutCompany({ source: f.source, destination: f.destination }), code('unpublished_definition'));
  assert.deepEqual(await readdir(f.destination), []);
});

test('missing published definitions and stale discussed digests leave the empty destination untouched', async t => {
  const f = await fixture(t);
  await assert.rejects(checkoutCompany({ source: f.source, destination: f.destination, expectedDigest: '0'.repeat(64) }), code('stale_definition'));
  assert.deepEqual(await readdir(f.destination), []);
  await git(f.source, 'rm', '-r', 'company'); await git(f.source, 'commit', '-m', 'Remove fictional definition');
  await assert.rejects(checkoutCompany({ source: f.source, destination: f.destination }), code('missing_document'));
  assert.deepEqual(await readdir(f.destination), []);
});

test('dirty or locally unpublished checkout definitions block bootstrap without resetting files', async t => {
  const f = await fixture(t);
  await checkoutCompany({ source: f.source, destination: f.destination });
  const path = join(f.destination, 'company/roles/artisan/agent.md');
  const content = (await readFile(path, 'utf8')) + '\nUnpublished change.\n';
  await writeFile(path, content);
  await assert.rejects(checkoutCompany({ source: f.source, destination: f.destination }), code('unpublished_definition'));
  await git(f.destination, 'config', 'user.name', 'Fictional Fixture'); await git(f.destination, 'config', 'user.email', 'fixture@example.invalid');
  await git(f.destination, 'config', 'commit.gpgsign', 'false'); await git(f.destination, 'add', 'company'); await git(f.destination, 'commit', '-m', 'Local unpublished definition');
  const localRevision = await git(f.destination, 'rev-parse', 'HEAD');
  await assert.rejects(checkoutCompany({ source: f.source, destination: f.destination, revision: localRevision }), code('unpublished_definition'));
  assert.equal(await readFile(path, 'utf8'), content);
});

test('remote HEAD changes require an explicit checkout decision, not silent stale reuse', async t => {
  const f = await fixture(t); await checkoutCompany({ source: f.source, destination: f.destination });
  await writeFile(join(f.source, 'company/WORK.md'), '# New published work guidance\n');
  await git(f.source, 'add', 'company'); await git(f.source, 'commit', '-m', 'New published definition');
  await assert.rejects(checkoutCompany({ source: f.source, destination: f.destination }), code('revision_mismatch'));
  assert.equal(await git(f.destination, 'rev-parse', 'HEAD'), f.revision);
});

test('Git identities normalize SSH/HTTPS while rejecting inline credentials and option injection', async () => {
  assert.equal(await repositoryIdentity('https://github.com/Example/Workshop.git'), 'github.com/example/workshop');
  assert.equal(await repositoryIdentity('git@github.com:example/workshop.git'), 'github.com/example/workshop');
  await assert.rejects(repositoryIdentity('https://token@example.invalid/workshop.git'), code('invalid_git_repository'));
  await assert.rejects(repositoryIdentity('--upload-pack=anything'), code('invalid_git_repository'));
});

test('a published non-default branch resolves to its exact commit and missing refs do not alter the destination', async t => {
  const f = await fixture(t);
  await git(f.source, 'checkout', '-b', 'planning');
  await writeFile(join(f.source, 'company/WORK.md'), '# Branch-specific published guidance\n');
  await git(f.source, 'add', 'company'); await git(f.source, 'commit', '-m', 'Published planning definition');
  const branchRevision = await git(f.source, 'rev-parse', 'HEAD');
  await git(f.source, 'checkout', 'main');
  await assert.rejects(checkoutCompany({ source: f.source, destination: f.destination, revision: 'missing-ref' }), code('revision_unavailable'));
  assert.deepEqual(await readdir(f.destination), []);
  const selected = await checkoutCompany({ source: f.source, destination: f.destination, revision: 'planning' });
  assert.equal(selected.commit, branchRevision);
  assert.equal(await readFile(join(f.destination, 'company/WORK.md'), 'utf8'), '# Branch-specific published guidance\n');
});
