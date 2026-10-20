import test from 'node:test';
import assert from 'node:assert/strict';
import { writeFile, readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { inspectDefinition } from '../plugins/paprika-inc/runtime/paprika-inc/definition.mjs';
import { normalizeModelProfiles, readModelProfiles, resolveRoleModel, modelCommand } from '../plugins/paprika-inc/runtime/paprika-inc/model-profiles.mjs';
import { beginBootstrap, nextBootstrap, recordBootstrap } from '../plugins/paprika-inc/runtime/paprika-inc/bootstrap.mjs';
import { runCli } from '../plugins/paprika-inc/runtime/paprika-inc/cli.mjs';
import { fixture, capabilities, projectReport, journal, git, senderContext } from './mvp-fixture.mjs';

const defaults = () => ({ schema_version: 1, roles: { organizer: { model: 'model-a', thinking: 'high' }, artisan: { model: 'model-b', thinking: 'xhigh' } } });
const catalog = [{ id: 'model-a', reasoning_efforts: ['high', 'max'] }, { id: 'model-b', reasoning_efforts: ['high', 'xhigh'] }];
const context = (role_id, extra = {}) => ({ schema_version: 1, company_id: 'example-workshop', role_id, models: catalog, ...extra });
const wrap = value => ({ content: [{ type: 'text', text: JSON.stringify(value) }], isError: false });
const env = { CODEX_THREAD_ID: 'fixture-bootstrap-sender' };
async function profiled(t) {
  const f = await fixture(t);
  await writeFile(join(f.source, 'company/model-preferences.json'), JSON.stringify(defaults()));
  await git(f.source, 'add', 'company/model-preferences.json'); await git(f.source, 'commit', '-m', 'Fictional role model defaults');
  return f;
}
const start = (f, extra = {}) => beginBootstrap({ repository: f.source, destination: f.destination, expectedDigest: f.digest,
  hostCapabilities: { ...capabilities(), models: catalog }, messageContext: senderContext(), deliveryPolicy: { short_message_limit: 15000 }, ...extra }, env);

test('both existing profile formats normalize to the same company-scoped role pairs', async t => {
  const f = await fixture(t), definition = await inspectDefinition(f.source);
  const mapped = normalizeModelProfiles(defaults(), definition);
  const listed = normalizeModelProfiles({ schema_version: 1, company_id: 'example-workshop', roles: [
    { role_id: 'organizer', model: 'model-a', reasoning_effort: 'high' }, { role_id: 'artisan', model: 'model-b', reasoning_effort: 'xhigh' },
  ] }, definition);
  assert.deepEqual(mapped, listed);
});

test('reset preserves the explicit override as a complete pair and otherwise uses the exact role default', async t => {
  const f = await profiled(t), profiles = await readModelProfiles(f.source, await inspectDefinition(f.source));
  const override = resolveRoleModel(profiles, 'artisan', context('artisan', { current_override: { model: 'model-a', reasoning_effort: 'max' } }));
  assert.equal(override.selected_from, 'explicit_chat_override'); assert.equal(override.model, 'model-a'); assert.equal(override.reasoning_effort, 'max');
  assert.deepEqual(override.native_parameters, { model: 'model-a', thinking: 'max' });
  const role = resolveRoleModel(profiles, 'artisan', context('artisan'));
  assert.equal(role.selected_from, 'role_default'); assert.deepEqual(role.codex_config, { model: 'model-b', model_reasoning_effort: 'xhigh' });
  assert.equal(resolveRoleModel(profiles, 'artisan').availability.state, 'unverified');
});

test('unavailable explicit overrides are retained and blocked rather than replaced with an available default', async t => {
  const f = await profiled(t), profiles = await readModelProfiles(f.source, await inspectDefinition(f.source));
  const missing = resolveRoleModel(profiles, 'artisan', context('artisan', { current_override: { model: 'missing-model', reasoning_effort: 'high' } }));
  assert.equal(missing.model, 'missing-model'); assert.equal(missing.availability.state, 'model_unavailable');
  const result = await modelCommand({ command: 'models reset', repository: f.source, roleId: 'artisan', modelContext: context('artisan', { current_override: { model: 'model-a', reasoning_effort: 'ultra' } }) });
  assert.equal(result.ok, false); assert.equal(result.status, 'unavailable'); assert.equal(result.resolved.availability.state, 'effort_unavailable');
  assert.equal(result.native_settings_changed, false);
});

test('unknown roles, incomplete profiles, conflicting efforts and cross-company overrides fail precisely', async t => {
  const f = await fixture(t), definition = await inspectDefinition(f.source);
  for (const mutate of [p => { p.roles.artisan.model = 'bad\nmodel'; }, p => { p.roles.artisan.thinking = 'automatic'; },
    p => { p.roles.unknown = p.roles.artisan; }, p => { p.roles.artisan.reasoning_effort = 'high'; }]) {
    const input = defaults(); mutate(input); assert.throws(() => normalizeModelProfiles(input, definition), { code: 'invalid_model_profile' });
  }
  const incomplete = defaults(); delete incomplete.roles.artisan;
  assert.throws(() => normalizeModelProfiles(incomplete, definition), { code: 'missing_role_model' });
  const profiles = normalizeModelProfiles(defaults(), definition);
  assert.throws(() => resolveRoleModel(profiles, 'artisan', { ...context('artisan'), company_id: 'other-company' }), { code: 'model_profile_scope_mismatch' });
  assert.throws(() => resolveRoleModel(profiles, 'artisan', context('organizer')), { code: 'model_profile_scope_mismatch' });
  assert.throws(() => resolveRoleModel(profiles, 'artisan', context('artisan', { current_override: { model: 'model-a' } })), { code: 'invalid_model_profile' });
});

test('ambiguous profile files require a deliberate selection; reset/export make no repository or native writes', async t => {
  const f = await profiled(t), definition = await inspectDefinition(f.source);
  await writeFile(join(f.source, 'company/model-profiles.json'), JSON.stringify(defaults()));
  await assert.rejects(readModelProfiles(f.source, definition), { code: 'ambiguous_model_profiles' });
  const before = await git(f.source, 'status', '--porcelain');
  const result = await modelCommand({ command: 'models export', repository: f.source, modelProfilesPath: 'company/model-preferences.json' });
  assert.equal(result.exports.length, 2); assert.ok(result.exports[1].codex_toml.includes('model_reasoning_effort = "xhigh"'));
  assert.equal(result.exports[1].chatgpt_desired_settings.model, 'model-b');
  assert.equal(await git(f.source, 'status', '--porcelain'), before); assert.equal(result.applied, false);
  await assert.rejects(modelCommand({ command: 'models reset', repository: f.source, modelProfilesPath: 'company/model-preferences.json' }), { code: 'missing_role_id' });
});

test('CLI reports unavailable reset with exit 2 and source-relative profiles without pretending to apply', async t => {
  const f = await profiled(t), path = join(f.base, 'context.json');
  await writeFile(path, JSON.stringify(context('artisan', { models: [] })));
  let text = '';
  const exit = await runCli(['models', 'reset', '--repo', f.source, '--role-id', 'artisan', '--model-context', path], { write: value => { text += value; } });
  const output = JSON.parse(text); assert.equal(exit, 2); assert.equal(output.applied, false); assert.equal(output.resolved.model, 'model-b');
});

test('bootstrap freezes exact role defaults and explicit requested-role overrides in native creation', async t => {
  const f = await profiled(t);
  const first = await start(f, { roles: 'organizer', hostCapabilities: { ...capabilities(), models: catalog, model_overrides: { organizer: { model: 'model-b', reasoning_effort: 'xhigh' } } } });
  await recordBootstrap({ repository: f.destination, actionId: first.action_id, hostResult: wrap(projectReport(f.destination)) });
  const action = await nextBootstrap({ repository: f.destination, messageContext: senderContext() }, env);
  assert.equal(action.host_call.arguments.model, 'model-b'); assert.equal(action.host_call.arguments.thinking, 'xhigh');
  const stored = await journal(f.destination); assert.equal(stored.roles[0].model_settings.selected_from, 'explicit_chat_override');
  assert.equal(stored.model_profiles_source.path, 'company/model-preferences.json');
  const unresolved = await nextBootstrap({ repository: f.destination, messageContext: senderContext() }, env);
  assert.equal(unresolved.status, 'submission_unresolved');
});

test('bootstrap stops unsupported or unverified models before exposing any native action', async t => {
  for (const [models, code] of [[undefined, 'model_catalog_required'], [[], 'model_unavailable'], [[{ id: 'model-a', reasoning_efforts: ['high'] }, { id: 'model-b', reasoning_efforts: ['high'] }], 'effort_unavailable']]) {
    const f = await profiled(t);
    await assert.rejects(start(f, { hostCapabilities: { ...capabilities(), ...(models === undefined ? {} : { models }) } }), { code });
    assert.ok(!(await readdir(join(f.destination, '.git'))).includes('paprika-inc'));
  }
});

test('changed model defaults block subsequent actions but preserve a real pending creation result', async t => {
  const f = await profiled(t), first = await start(f, { roles: 'organizer' });
  await recordBootstrap({ repository: f.destination, actionId: first.action_id, hostResult: wrap(projectReport(f.destination)) });
  const create = await nextBootstrap({ repository: f.destination, messageContext: senderContext() }, env);
  const path = join(f.destination, 'company/model-preferences.json'), changed = JSON.parse(await readFile(path, 'utf8'));
  changed.roles.organizer.thinking = 'max'; await writeFile(path, JSON.stringify(changed));
  await assert.rejects(nextBootstrap({ repository: f.destination }), { code: 'model_profiles_changed' });
  await recordBootstrap({ repository: f.destination, actionId: create.action_id, hostResult: wrap({ threadId: 'fictional-created-profile-role', hostId: 'local' }) });
  assert.equal((await journal(f.destination)).roles[0].thread_id, 'fictional-created-profile-role');
});
