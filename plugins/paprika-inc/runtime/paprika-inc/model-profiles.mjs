import { lstat } from 'node:fs/promises';
import { join, posix } from 'node:path';
import { createHash } from 'node:crypto';
import { inspectDefinition, repositoryRoot, readDocument, parseJson } from './definition.mjs';
import { requireInput as check } from './errors.mjs';

const fields = (value, keys) => value !== null && typeof value === 'object' && !Array.isArray(value) && Object.keys(value).every(key => keys.includes(key));
const efforts = new Set(['none', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max', 'ultra']);
const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
function pair(value, keys = ['model', 'thinking', 'reasoning_effort']) {
  check(fields(value, keys) && typeof value.model === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:/+-]{0,127}$/.test(value.model),
    'invalid_model_profile', 'A profile requires a bounded model ID and declared fields only.');
  check(!(value.thinking && value.reasoning_effort && value.thinking !== value.reasoning_effort), 'invalid_model_profile', 'thinking and reasoning_effort must agree.');
  const reasoning_effort = value.reasoning_effort ?? value.thinking;
  check(efforts.has(reasoning_effort), 'invalid_model_profile', 'Select an explicit reasoning-effort name.');
  return { model: value.model, reasoning_effort };
}

export function normalizeModelProfiles(input, definition, source = null) {
  check(fields(input, ['schema_version', 'company_id', 'status', 'roles', 'application', 'execution', 'automatic_application', 'notes', 'legacy_role_preferences']) && input.schema_version === 1,
    'invalid_model_profile', 'Use a schema-version 1 company model profile.');
  check(input.company_id === undefined || input.company_id === definition.manifest.company_id, 'model_profile_scope_mismatch', 'Model profiles belong to a different company.');
  check(Array.isArray(input.roles) || fields(input.roles, Object.keys(input.roles ?? {})), 'invalid_model_profile', 'Profiles require a role map or array.');
  const rows = Array.isArray(input.roles) ? input.roles : Object.entries(input.roles).map(([role_id, value]) => ({ ...value, role_id }));
  const active = new Set(definition.roles.map(role => role.id)), roles = new Map();
  for (const row of rows) {
    check(fields(row, ['role_id', 'model', 'thinking', 'reasoning_effort']) && active.has(row.role_id) && !roles.has(row.role_id), 'invalid_model_profile', 'Use unique active role IDs from this company.');
    roles.set(row.role_id, pair(row, ['role_id', 'model', 'thinking', 'reasoning_effort']));
  }
  check(roles.size === active.size, 'missing_role_model', 'Every active role needs an explicit model/effort pair.');
  return { schema_version: 1, company_id: definition.manifest.company_id, source, roles: Object.fromEntries(roles),
    reset_policy: 'preserve_explicit_chat_override_then_role_default', settings_sha256: hash([...roles].sort(([a], [b]) => a.localeCompare(b))) };
}

export async function readModelProfiles(repository, definition, manifestPath = 'company/company.json', profilePath) {
  const root = await repositoryRoot(repository), folder = posix.dirname(manifestPath);
  const candidates = profilePath ? [profilePath] : ['model-preferences.json', 'model-profiles.json'].map(name => posix.join(folder, name));
  const found = [];
  for (const path of candidates) {
    try { await lstat(join(root, path)); found.push(path); } catch (error) { if (error.code !== 'ENOENT') throw error; }
  }
  check(found.length <= 1, 'ambiguous_model_profiles', 'Choose one canonical profile file; both supported names exist.');
  if (!found.length) { check(!profilePath, 'missing_model_profiles', 'The selected profile file is missing.'); return null; }
  // Shared document reading enforces containment, case, bounded UTF-8 and no symlinks.
  const document = await readDocument(root, found[0]);
  return normalizeModelProfiles(parseJson(document.text, document.path), definition, { path: document.path, sha256: document.sha256 });
}

export function modelAvailability(settings, models) {
  if (models === undefined) return { state: 'unverified', usable: false, evidence: 'No current host model catalog supplied.' };
  check(Array.isArray(models) && models.length <= 500 && models.every(model => fields(model, ['id', 'reasoning_efforts']) && typeof model.id === 'string' &&
    Array.isArray(model.reasoning_efforts) && model.reasoning_efforts.every(e => efforts.has(e))) && new Set(models.map(m => m.id)).size === models.length,
  'invalid_model_catalog', 'Supply distinct model IDs and observed reasoning efforts.');
  const model = models.find(m => m.id === settings.model);
  return { state: !model ? 'model_unavailable' : !model.reasoning_efforts.includes(settings.reasoning_effort) ? 'effort_unavailable' : 'declared_available',
    usable: Boolean(model?.reasoning_efforts.includes(settings.reasoning_effort)), evidence: 'Caller-supplied host catalog; not an invocation/authentication receipt.' };
}

export function resolveRoleModel(profiles, roleId, context = {}) {
  check(profiles && Object.hasOwn(profiles.roles, roleId), 'missing_role_model', 'The exact company role has no model default.');
  check(fields(context, ['schema_version', 'company_id', 'role_id', 'current_override', 'models']), 'invalid_model_context', 'Unknown model-context field.');
  if (Object.keys(context).length) check(context.schema_version === 1 && context.company_id === profiles.company_id && context.role_id === roleId,
    'model_profile_scope_mismatch', 'Override/catalog context must identify this exact company and role.');
  const override = context.current_override === undefined ? null : pair(context.current_override, ['model', 'reasoning_effort']);
  const settings = override ?? profiles.roles[roleId];
  return { role_id: roleId, ...settings, selected_from: override ? 'explicit_chat_override' : 'role_default', role_default: { ...profiles.roles[roleId] },
    availability: modelAvailability(settings, context.models), native_parameters: { model: settings.model, thinking: settings.reasoning_effort },
    codex_config: { model: settings.model, model_reasoning_effort: settings.reasoning_effort } };
}

export async function modelCommand(options) {
  const definition = await inspectDefinition(options.repository, options.manifestPath);
  const profiles = await readModelProfiles(options.repository, definition, options.manifestPath, options.modelProfilesPath);
  check(profiles, 'missing_model_profiles', 'Add company model-preferences.json or model-profiles.json first.');
  const result = { ok: true, command: options.command, read_only: true, applied: false, profiles, native_settings_changed: false, app_global_reset_changed: false };
  if (options.command === 'models list') return result;
  check(options.command !== 'models reset' || options.roleId, 'missing_role_id', 'A reset plan needs --role-id.');
  check(!options.modelContext || options.roleId, 'missing_role_id', 'A private chat context needs one --role-id.');
  const resolved = (options.roleId ? [options.roleId] : Object.keys(profiles.roles)).map(id => resolveRoleModel(profiles, id, options.modelContext));
  const blocked = resolved.some(role => ['model_unavailable', 'effort_unavailable'].includes(role.availability.state));
  if (options.command === 'models reset') return { ...result, ok: !blocked, status: blocked ? 'unavailable' : 'settings_plan', resolved: resolved[0],
    host_verification_required: !resolved[0].availability.usable,
    next_step: 'Use supported host settings under the human request. Preserve explicit overrides; never send a task just to change settings.' };
  return { ...result, ok: !blocked, resolved, exports: resolved.map(role => ({ role_id: role.role_id, profile_name: profiles.company_id + '--' + role.role_id,
    codex_toml: '# Select explicitly with codex --profile <profile-name>. Existing chats are unchanged.\n' +
      `model = ${JSON.stringify(role.model)}\nmodel_reasoning_effort = ${JSON.stringify(role.reasoning_effort)}\n`,
    chatgpt_desired_settings: { model: role.model, reasoning_effort: role.reasoning_effort, host_application: 'manual_supported_settings_only' } })) };
}
