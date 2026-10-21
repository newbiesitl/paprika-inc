import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { IncError, requireInput as check } from './errors.mjs';
import { semver } from './definition.mjs';
import { authorCompany, renderCompany } from './authoring.mjs';
import { skillPack } from './skill-catalog.mjs';

export const catalogKinds = Object.freeze(['preset', 'structure', 'role', 'pack', 'workflow', 'requirement']);
const hosts = ['codex-local', 'chatgpt', 'standalone'];
const idPattern = /^[a-z][a-z0-9-]{0,95}$/;
const digestPattern = /^[0-9a-f]{64}$/;
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
const text = (x, max = 8000) => typeof x === 'string' && x.trim().length > 0 && x.length <= max && !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(x);
const id = x => typeof x === 'string' && idPattern.test(x);
const ids = x => Array.isArray(x) && x.length <= 100 && x.every(id) && new Set(x).size === x.length;
const fields = (x, allowed, required = allowed) => object(x) && Object.keys(x).every(k => allowed.includes(k)) && required.every(k => Object.hasOwn(x, k));
const canonical = x => Array.isArray(x) ? x.map(canonical) : object(x) ? Object.fromEntries(Object.keys(x).sort().map(k => [k, canonical(x[k])])) : x;
export const catalogDigest = x => createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
export const catalogIdentity = catalog => ({ version: catalog.version, sha256: catalogDigest(catalog) });
const key = (kind, identity) => `${kind}:${identity}`;
const indexCatalog = catalog => new Map(catalog.entries.map(e => [key(e.kind, e.id), e]));
const entryFields = ['kind', 'id', 'version', 'label', 'description', 'tags', 'availability', 'requirements', 'provenance', 'evidence', 'data', 'tier'];
const roleFields = ['id', 'version', 'title', 'purpose', 'responsibilities', 'boundaries', 'inputs', 'outputs', 'escalation'];

function acyclic(nodes, edges, fail) {
  const active = new Set(), done = new Set();
  function visit(node) {
    if (active.has(node)) { fail(node); return; }
    if (done.has(node)) return;
    active.add(node);
    for (const child of edges(node)) if (nodes.has(child)) visit(child);
    active.delete(node); done.add(node);
  }
  for (const node of nodes) visit(node);
}

export function validateCompanyCatalog(catalog) {
  const valid = (condition, message) => check(condition, 'invalid_company_catalog', message);
  valid(fields(catalog, ['schema_version', 'version', 'business_model_tags', 'entries']) && catalog.schema_version === 1 &&
    typeof catalog.version === 'string' && semver.test(catalog.version) && ids(catalog.business_model_tags) &&
    Array.isArray(catalog.entries) && catalog.entries.length > 0 && catalog.entries.length <= 500, 'Unsupported or malformed company catalog.');
  const seen = new Set();
  for (const e of catalog.entries) {
    valid(fields(e, entryFields, entryFields.filter(f => f !== 'tier')) &&
      (e.tier === undefined || ['essential', 'extension'].includes(e.tier)) &&
      catalogKinds.includes(e.kind) && id(e.id) && typeof e.version === 'string' && semver.test(e.version) &&
      text(e.label, 160) && text(e.description) && ids(e.tags) && ids(e.requirements) &&
      ['template', 'available', 'planned'].includes(e.availability) && object(e.data), 'Invalid catalog entry fields.');
    valid(!seen.has(key(e.kind, e.id)), 'Duplicate catalog kind/ID.'); seen.add(key(e.kind, e.id));
    valid(fields(e.provenance, ['path', 'sha256']) && typeof e.provenance.path === 'string' &&
      /^(?:[A-Za-z0-9_.-]+\/)*[A-Za-z0-9_.-]+$/.test(e.provenance.path) && !e.provenance.path.split('/').includes('..') &&
      typeof e.provenance.sha256 === 'string' && digestPattern.test(e.provenance.sha256), 'Catalog provenance must be a portable path and SHA-256.');
    valid(Array.isArray(e.evidence) && e.evidence.length <= 20 && e.evidence.every(x => text(x, 2048)), 'Invalid evidence references.');
    if (e.availability === 'planned') {
      valid(Object.keys(e.data).length === 0, 'Planned entries must not carry an executable or selectable template.');
      continue;
    }
    const d = e.data;
    if (e.kind === 'preset') valid(fields(d, ['coordinator_role', 'required_roles', 'defaults', 'ownership']) && id(d.coordinator_role) && ids(d.required_roles) &&
      d.required_roles.includes(d.coordinator_role) && fields(d.defaults, ['structure_id', 'business_model_tags', 'company', 'roles']) &&
      Array.isArray(d.ownership) && d.ownership.length <= 100 && d.ownership.every(o => fields(o, ['path', 'owner_role', 'reviewer_roles']) && text(o.path, 512) && id(o.owner_role) && ids(o.reviewer_roles)), 'Invalid preset defaults.');
    if (e.kind === 'structure') valid(fields(d, ['reporting']) && ['flat', 'tree'].includes(d.reporting), 'Invalid reporting structure.');
    if (e.kind === 'role') {
      valid(fields(d, ['blueprint', 'ownership_paths', 'allowed_packs', 'required_packs']) && fields(d.blueprint, roleFields) &&
        d.blueprint.id === e.id && d.blueprint.version === e.version && ids(d.allowed_packs) && ids(d.required_packs) &&
        d.required_packs.every(p => d.allowed_packs.includes(p)) && Array.isArray(d.ownership_paths) && d.ownership_paths.length <= 100 &&
        d.ownership_paths.every(p => text(p, 512)) && new Set(d.ownership_paths).size === d.ownership_paths.length, 'Invalid role template.');
      for (const f of ['title', 'purpose']) valid(text(d.blueprint[f]), 'Invalid role prose.');
      for (const f of ['responsibilities', 'boundaries', 'inputs', 'outputs', 'escalation'])
        valid(Array.isArray(d.blueprint[f]) && d.blueprint[f].length > 0 && d.blueprint[f].length <= 100 && d.blueprint[f].every(x => text(x)), 'Invalid role prose list.');
    }
    if (e.kind === 'pack') valid(fields(d, ['skill_set', 'skills', 'manifest_sha256', 'requires_packs']) && id(d.skill_set) && ids(d.skills) && d.skills.length > 0 &&
      typeof d.manifest_sha256 === 'string' && digestPattern.test(d.manifest_sha256) && ids(d.requires_packs), 'Invalid pack metadata.');
    if (e.kind === 'workflow') valid(fields(d, ['required_packs', 'steps']) && ids(d.required_packs) && Array.isArray(d.steps) &&
      d.steps.length > 0 && d.steps.length <= 100 && d.steps.every(x => text(x)), 'Invalid workflow metadata.');
    if (e.kind === 'requirement') valid(fields(d, ['capability', 'hosts']) && id(d.capability) && ids(d.hosts) &&
      d.hosts.length > 0 && d.hosts.every(h => hosts.includes(h)), 'Invalid requirement metadata.');
  }
  const entries = indexCatalog(catalog);
  const references = (kind, values) => valid(values.every(x => entries.has(key(kind, x))), `Missing ${kind} catalog reference.`);
  for (const e of catalog.entries) {
    references('requirement', e.requirements);
    valid(e.requirements.every(r => entries.get(key('requirement', r)).availability !== 'planned'), 'Requirements must have defined assessment metadata.');
    if (e.availability === 'planned') continue;
    if (e.kind === 'preset') { references('role', e.data.required_roles); references('structure', [e.data.defaults.structure_id]);
      for (const o of e.data.ownership) references('role', [o.owner_role, ...o.reviewer_roles]); }
    if (e.kind === 'role') references('pack', e.data.allowed_packs);
    if (e.kind === 'pack') references('pack', e.data.requires_packs);
    if (e.kind === 'workflow') references('pack', e.data.required_packs);
  }
  for (const kind of ['pack', 'requirement']) {
    const nodes = new Set(catalog.entries.filter(e => e.kind === kind).map(e => e.id));
    acyclic(nodes, n => kind === 'pack' ? entries.get(key(kind, n)).data.requires_packs ?? [] : entries.get(key(kind, n)).requirements,
      () => valid(false, `Cyclic ${kind} dependencies.`));
  }
  return catalog;
}

export async function loadCompanyCatalog() {
  return validateCompanyCatalog(JSON.parse(await readFile(new URL('../company-catalog/catalog.json', import.meta.url), 'utf8')));
}

export function readCompanyCatalog(catalog, { command = 'catalog list', catalogKind, catalogId, query } = {}) {
  validateCompanyCatalog(catalog);
  check(catalogKind === undefined || catalogKinds.includes(catalogKind), 'invalid_catalog_kind', 'Choose a declared catalog kind.');
  check(query === undefined || typeof query === 'string' && query.length <= 256, 'invalid_catalog_query', 'Search text must be at most 256 characters.');
  const result = { schema_version: 1, ok: true, command, read_only: true, applied: false, catalog: catalogIdentity(catalog), business_model_tags: [...catalog.business_model_tags] };
  if (command === 'catalog read') {
    check(catalogKinds.includes(catalogKind) && id(catalogId), 'invalid_catalog_address', 'Read requires --catalog-kind and an exact --catalog-id.');
    const entry = catalog.entries.find(e => e.kind === catalogKind && e.id === catalogId);
    check(entry, 'unknown_catalog_entry', 'No catalog entry matches that kind and ID.');
    result.entry = structuredClone(entry);
    if (entry.kind === 'preset' && entry.availability !== 'planned') result.default_selection = {
      schema_version: 1, catalog: result.catalog, preset_id: entry.id, ...structuredClone(entry.data.defaults),
    };
  } else {
    const tokens = (query ?? '').normalize('NFKC').toLowerCase().split(/\s+/).filter(Boolean);
    result.entries = structuredClone(catalog.entries.filter(e => (!catalogKind || e.kind === catalogKind) && tokens.every(token =>
      [e.id, e.label, e.description, ...e.tags].join(' ').normalize('NFKC').toLowerCase().includes(token))));
  }
  return result;
}

function inspectSelection(catalog, selection, context) {
  const diagnostics = [], add = (code, path, message) => diagnostics.push({ code, path, message });
  const entries = indexCatalog(catalog), selectedEntries = new Map();
  const pick = (kind, identity, path) => {
    const entry = entries.get(key(kind, identity));
    if (!entry) add('unknown_entry', path, `Unknown ${kind} ID.`);
    else if (entry.availability === 'planned') add('planned_entry', path, 'This entry is planned and cannot be selected for export.');
    else selectedEntries.set(key(kind, identity), entry);
    return entry?.availability !== 'planned' ? entry : null;
  };
  const fail = (condition, code, path, message) => { if (!condition) add(code, path, message); return condition; };
  if (!fields(selection, ['schema_version', 'catalog', 'preset_id', 'structure_id', 'business_model_tags', 'company', 'roles']) || selection.schema_version !== 1) {
    add('invalid_selection', '$', 'Use schema 1 with only the documented portable selection fields.');
    return { diagnostics, selectedEntries };
  }
  const identity = catalogIdentity(catalog);
  fail(fields(selection.catalog, ['version', 'sha256']) && selection.catalog.version === identity.version && selection.catalog.sha256 === identity.sha256,
    'stale_catalog', '$.catalog', 'The catalog version or digest changed. Refresh and review the retained draft before preview/export.');
  fail(ids(selection.business_model_tags) && selection.business_model_tags.every(t => catalog.business_model_tags.includes(t)),
    'invalid_business_tags', '$.business_model_tags', 'Choose distinct declared business-model tags.');
  const c = selection.company;
  fail(fields(c, ['id', 'name', 'repository', 'version', 'purpose']) && id(c.id) && text(c.name, 160) && !/[\r\n]/.test(c.name) &&
    typeof c.repository === 'string' && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(c.repository) && typeof c.version === 'string' && semver.test(c.version) && text(c.purpose),
    'invalid_company', '$.company', 'Company identity, display name, owner/name repository, version and purpose are required; private connection fields are not accepted.');
  const preset = pick('preset', selection.preset_id, '$.preset_id'), structure = pick('structure', selection.structure_id, '$.structure_id');
  if (!fail(Array.isArray(selection.roles) && selection.roles.length > 0 && selection.roles.length <= 100, 'invalid_roles', '$.roles', 'Select 1–100 roles.')) return { diagnostics, selectedEntries };
  const roles = new Map();
  for (const [i, role] of selection.roles.entries()) {
    const path = `$.roles[${i}]`;
    if (!fail(fields(role, ['role_id', 'title', 'packs', 'workflows', 'reports_to', 'reviewers'], ['role_id', 'packs', 'workflows', 'reports_to', 'reviewers']) && id(role.role_id) && ids(role.packs) && ids(role.workflows) && ids(role.reviewers) &&
      (role.reports_to === null || id(role.reports_to)), 'invalid_role_selection', path, 'Use distinct pack/workflow/reviewer IDs and a reporting parent or null.')) continue;
    if (role.title !== undefined) fail(text(role.title, 160) && !/[\r\n\x00-\x1f]/.test(role.title), 'invalid_role_title', `${path}.title`, 'Role title must be nonempty single-line display text up to 160 characters.');
    if (!fail(!roles.has(role.role_id), 'duplicate_role', `${path}.role_id`, 'Each selected role must have a unique ID.')) continue;
    roles.set(role.role_id, role);
    const template = pick('role', role.role_id, `${path}.role_id`);
    for (const pack of role.packs) {
      const entry = pick('pack', pack, `${path}.packs`);
      if (template) fail(template.data.allowed_packs.includes(pack), 'incompatible_pack', `${path}.packs`, 'Pack is not compatible with this role template.');
      if (entry) fail(entry.data.requires_packs.every(p => role.packs.includes(p)), 'missing_pack_dependency', `${path}.packs`, 'Select all required packs explicitly.');
    }
    if (template) fail(template.data.required_packs.every(p => role.packs.includes(p)), 'missing_required_pack', `${path}.packs`, 'This role requires additional selected packs.');
    for (const workflow of role.workflows) {
      const entry = pick('workflow', workflow, `${path}.workflows`);
      if (entry) fail(entry.data.required_packs.every(p => role.packs.includes(p)), 'missing_workflow_pack', `${path}.workflows`, 'This workflow requires additional selected packs.');
    }
  }
  const coordinator = preset?.data.coordinator_role;
  if (preset) for (const required of preset.data.required_roles) fail(roles.has(required), 'missing_required_role', '$.roles', `Required role is missing: ${required}.`);
  for (const [i, role] of selection.roles.entries()) {
    if (!object(role) || roles.get(role.role_id) !== role) continue;
    const path = `$.roles[${i}]`;
    fail(role.reports_to !== role.role_id, 'self_reporting', `${path}.reports_to`, 'A role cannot report to itself.');
    fail(role.reports_to === null || roles.has(role.reports_to), 'missing_reporting_role', `${path}.reports_to`, 'Reporting parent must be selected.');
    fail(role.reviewers.every(peer => peer !== role.role_id && roles.has(peer)), 'invalid_reviewer', `${path}.reviewers`, 'Reviewers must be selected peers, excluding this role.');
    if (coordinator) fail(role.role_id === coordinator ? role.reports_to === null : role.reports_to !== null,
      'invalid_reporting_root', `${path}.reports_to`, 'Only the preset coordinator is the reporting root.');
    if (structure?.data.reporting === 'flat' && coordinator && role.role_id !== coordinator) fail(role.reports_to === coordinator,
      'invalid_flat_reporting', `${path}.reports_to`, 'This structure requires direct reporting to the coordinator.');
  }
  acyclic(new Set(roles.keys()), n => roles.get(n).reports_to === null ? [] : [roles.get(n).reports_to],
    n => add('reporting_cycle', '$.roles', `Reporting cycle includes ${n}.`));
  if (!fields(context, ['schema_version', 'host', 'capabilities'], ['schema_version']) || context.schema_version !== 1 ||
    context.host !== undefined && !hosts.includes(context.host) || context.capabilities !== undefined && !ids(context.capabilities))
    add('invalid_capability_context', '$.context', 'Use schema 1 with an optional supported host and distinct non-secret capability IDs.');
  if (diagnostics.length) return { diagnostics, selectedEntries, preset };
  const blueprint = { schema_version: 1, company_id: c.id, repository: c.repository, version: c.version, purpose: c.purpose,
    coordinator_role: coordinator, roles: selection.roles.map(role => ({ ...structuredClone(entries.get(key('role', role.role_id)).data.blueprint),
      ...(role.title !== undefined ? { title: role.title } : {}),
      reviewer_roles: [...role.reviewers], ...(role.packs.length ? { skill_sets: role.packs.map(p => entries.get(key('pack', p)).data.skill_set) } : {}) })),
    ownership: [...structuredClone(preset.data.ownership.filter(o => roles.has(o.owner_role))),
      ...selection.roles.filter(role => !preset.data.defaults.roles.some(defaultRole => defaultRole.role_id === role.role_id))
        .flatMap(role => entries.get(key('role', role.role_id)).data.ownership_paths.map(path => ({ path, owner_role: role.role_id, reviewer_roles: [...role.reviewers] })))] };
  try { renderCompany(blueprint); }
  catch (e) { if (!(e instanceof IncError)) throw e; add(e.code, '$.roles', e.message); }
  return { diagnostics, selectedEntries, preset, blueprint };
}

export async function configureCompany({ catalog, selection, catalogContext = { schema_version: 1 }, command = 'config validate', repository } = {}) {
  catalog ??= await loadCompanyCatalog(); validateCompanyCatalog(catalog);
  check(['config validate', 'config preview', 'config export'].includes(command), 'unknown_command', 'Unknown configuration operation.');
  const inspected = inspectSelection(catalog, selection, catalogContext), { diagnostics, selectedEntries, preset, blueprint } = inspected;
  const requirements = new Set(), entries = indexCatalog(catalog);
  function requireEntry(id) { if (requirements.has(id)) return; requirements.add(id); for (const child of entries.get(key('requirement', id)).requirements) requireEntry(child); }
  for (const entry of selectedEntries.values()) for (const id of entry.requirements) requireEntry(id);
  const validContext = !diagnostics.some(d => d.code === 'invalid_capability_context') && object(catalogContext);
  const result = { schema_version: 1, ok: false, command, read_only: true, applied: false, catalog: catalogIdentity(catalog), selection_sha256: null,
    diagnostics, requirements: [...requirements].sort().map(id => {
      const req = entries.get(key('requirement', id));
      return { id, state: !validContext || !catalogContext.host ? 'unknown' : !req.data.hosts.includes(catalogContext.host) ? 'unsupported' :
        catalogContext.capabilities === undefined ? 'unknown' : catalogContext.capabilities.includes(req.data.capability) ? 'declared-present' : 'missing' };
    }), evidence: { catalog_availability: preset ? 'template' : catalog.entries.some(e => e.kind === 'preset' && e.id === selection?.preset_id && e.availability === 'planned') ? 'planned' : 'unknown',
      package_presence: [], local_configuration: 'unverified', connection_authentication: 'unverified', native_host_verification: 'unverified', task_quality_acceptance: 'unverified', release_state: 'draft' } };
  for (const entry of selectedEntries.values()) if (entry.kind === 'pack') {
    let state = 'unverified';
    try {
      const pack = await skillPack(entry.data.skill_set);
      check(pack.manifest_sha256 === entry.data.manifest_sha256 && JSON.stringify(pack.skills) === JSON.stringify(entry.data.skills), 'catalog_pack_mismatch', 'Catalog pack differs from the bundled reviewed payload.');
      state = 'bundled';
    } catch (e) {
      if (!(e instanceof IncError) && !['ENOENT', 'ENOTDIR'].includes(e.code)) throw e;
      state = 'not-bundled'; diagnostics.push({ code: 'pack_unavailable', path: '$.roles', message: `Selected pack is missing or fails integrity validation: ${entry.id}.` });
    }
    result.evidence.package_presence.push({ id: entry.id, state });
  }
  if (diagnostics.length) return result;
  result.ok = true;
  result.selection_sha256 = catalogDigest(selection);
  result.selection = structuredClone(selection);
  result.roster = selection.roles.map(role => ({ ...structuredClone(role), title: role.title ?? entries.get(key('role', role.role_id)).label,
    version: entries.get(key('role', role.role_id)).version, review_requirement: role.reviewers.length ? 'peer_review_required' : 'human_review_required' }));
  if (command === 'config export') {
    result.blueprint = blueprint;
    result.repository_files = Object.entries({ ...renderCompany(blueprint),
      'company/catalog-selection.json': JSON.stringify(selection, null, 2) + '\n' })
      .map(([path, content]) => ({ path, content }));
    result.application = 'portable_draft_revalidate_selection_and_preview_destination_before_separately_authorized_author_write';
  }
  if (command === 'config preview') {
    try {
      result.authoring = await authorCompany({ repository, spec: blueprint, write: false });
      if (result.authoring.conflicts.length) {
        result.ok = false;
        for (const path of result.authoring.conflicts) diagnostics.push({ code: 'authoring_conflict', path, message: 'Existing file differs; it will not be replaced.' });
      }
    } catch (e) { if (!(e instanceof IncError)) throw e; result.ok = false; diagnostics.push({ code: e.code, path: '$.repository', message: e.message }); }
  }
  return result;
}

export async function companyCatalogCommand(options) {
  const catalog = await loadCompanyCatalog();
  return options.command.startsWith('catalog ') ? readCompanyCatalog(catalog, options) : configureCompany({ ...options, catalog });
}
