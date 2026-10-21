import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, writeFile, mkdir, rm, readdir, symlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { loadCompanyCatalog, validateCompanyCatalog, catalogIdentity, catalogDigest, readCompanyCatalog, configureCompany } from '../plugins/paprika-inc/runtime/paprika-inc/company-catalog.mjs';
import { runCli } from '../plugins/paprika-inc/runtime/paprika-inc/cli.mjs';
const catalog = await loadCompanyCatalog();
const fixture = async name => JSON.parse(await readFile(new URL(`./fixtures/company-catalog/${name}.json`, import.meta.url), 'utf8'));
const preset = (id = 'software-studio', data = catalog) => readCompanyCatalog(data, { command: 'catalog read', catalogKind: 'preset', catalogId: id }).default_selection;
const configure = (selection, extra = {}) => configureCompany({ catalog, selection, ...extra });
const entry = (c, kind, id) => c.entries.find(e => e.kind === kind && e.id === id);
async function folder(t) { const root = await mkdtemp(join(tmpdir(), 'inc-catalog-')); t.after(() => rm(root, { recursive: true, force: true })); return root; }

test('one catalog supports kind filtering, literal search, exact read and clone-safe defaults', () => {
  assert.ok(readCompanyCatalog(catalog, { query: 'RESEARCH', catalogKind: 'preset' }).entries.some(e => e.id === 'scientific-research'));
  assert.equal(readCompanyCatalog(catalog, { query: '[.*]' }).entries.length, 0);
  assert.equal(readCompanyCatalog(catalog, { catalogKind: 'structure' }).entries.length, 3);
  assert.equal(readCompanyCatalog(catalog, { catalogKind: 'preset' }).entries.find(e => e.id === 'marketing-agency').tier, 'extension');
  const a = preset(); a.roles[0].reviewers.push('untrusted');
  assert.ok(!preset().roles[0].reviewers.includes('untrusted'));
  assert.throws(() => readCompanyCatalog(catalog, { command: 'catalog read', catalogKind: 'role', catalogId: 'missing' }), { code: 'unknown_catalog_entry' });
  assert.throws(() => readCompanyCatalog(catalog, { catalogKind: 'secret' }), { code: 'invalid_catalog_kind' });
  assert.throws(() => readCompanyCatalog(catalog, { query: 'x'.repeat(257) }), { code: 'invalid_catalog_query' });
});

for (const [identity, source] of [['software-studio', 'it-company-blueprint'], ['scientific-research', 'research-company-blueprint']]) {
  test(`${identity} exports the existing blueprint without industry-specific branching`, async () => {
    const selection = await fixture(identity), before = structuredClone(selection);
    assert.deepEqual(selection, preset(identity));
    const result = await configure(selection, { command: 'config export' });
    assert.equal(result.ok, true, JSON.stringify(result.diagnostics));
    const expected = JSON.parse(await readFile(new URL(`../plugins/paprika-inc/skills/setup-paprika-inc/assets/${source}.json`, import.meta.url), 'utf8'));
    assert.deepEqual(result.blueprint, expected);
    assert.deepEqual(result.selection, before); assert.deepEqual(selection, before);
    assert.equal(result.applied, false); assert.equal(result.read_only, true);
    assert.ok(result.evidence.package_presence.every(p => p.state === 'bundled'));
    assert.equal(result.evidence.connection_authentication, 'unverified');
    assert.equal(result.evidence.native_host_verification, 'unverified');
    assert.equal(result.evidence.task_quality_acceptance, 'unverified');
    assert.equal(result.evidence.release_state, 'draft');
  });
}

test('title edits keep role IDs, reviewers, ownership and full portable envelope', async () => {
  const selection = preset(); selection.roles[2].title = 'Backend Engineer 日本語'; selection.business_model_tags = ['b2b', 'saas'];
  selection.structure_id = 'functional-departments'; selection.roles[2].reports_to = 'architect';
  const result = await configure(selection, { command: 'config export' });
  assert.equal(result.ok, true); assert.deepEqual(result.selection, selection);
  assert.equal(result.blueprint.roles[2].id, 'developer'); assert.equal(result.blueprint.roles[2].title, selection.roles[2].title);
  assert.deepEqual(result.blueprint.ownership, entry(catalog, 'preset', selection.preset_id).data.ownership);
  assert.notEqual(result.selection_sha256, catalogDigest(preset()));
  assert.deepEqual(JSON.parse(JSON.stringify(result)).selection, selection);
});

test('optional removal works, peer-review cycles remain valid, and empty reviewers require a human', async () => {
  const selection = preset(); selection.roles = selection.roles.filter(r => r.role_id !== 'release-engineer');
  selection.roles[2].reviewers = [];
  const result = await configure(selection, { command: 'config export' });
  assert.equal(result.ok, true); assert.equal(result.blueprint.roles.length, 4);
  assert.ok(!result.blueprint.ownership.some(o => o.path === 'release/'));
  assert.equal(result.roster.find(r => r.role_id === 'developer').review_requirement, 'human_review_required');
  assert.equal(result.evidence.task_quality_acceptance, 'unverified');
});

test('role title bounds count UTF-16 units consistently for non-BMP and combining text', async () => {
  for (const title of ['\u{1f52c}'.repeat(80), 'e\u0301'.repeat(80)]) {
    const selection = preset(); selection.roles[2].title = title;
    const result = await configure(selection, { command: 'config export' });
    assert.equal(result.ok, true); assert.equal(result.blueprint.roles[2].title, title);
    selection.roles[2].title += 'x';
    const invalid = await configure(selection, { command: 'config export' });
    assert.equal(invalid.ok, false);
    assert.ok(invalid.diagnostics.some(d => d.code === 'invalid_role_title'));
    assert.equal(invalid.blueprint, undefined);
  }
});

const failures = [
  ['required-role removal', s => { s.roles = s.roles.filter(r => r.role_id !== 'architect'); }, 'missing_required_role'],
  ['dangling optional reference', s => { s.roles[2].reviewers = ['release-engineer']; s.roles.pop(); }, 'invalid_reviewer'],
  ['duplicate role', s => s.roles.push(structuredClone(s.roles[0])), 'duplicate_role'],
  ['self review', s => { s.roles[1].reviewers = ['architect']; }, 'invalid_reviewer'],
  ['dangling reviewer', s => { s.roles[1].reviewers = ['unknown']; }, 'invalid_reviewer'],
  ['duplicate reviewer', s => { s.roles[1].reviewers = ['qa', 'qa']; }, 'invalid_role_selection'],
  ['self reporting', s => { s.roles[1].reports_to = 'architect'; }, 'self_reporting'],
  ['dangling manager', s => { s.roles[1].reports_to = 'unknown'; }, 'missing_reporting_role'],
  ['second root', s => { s.roles[1].reports_to = null; }, 'invalid_reporting_root'],
  ['root has manager', s => { s.roles[0].reports_to = 'architect'; }, 'invalid_reporting_root'],
  ['flat indirect reporting', s => { s.roles[2].reports_to = 'architect'; }, 'invalid_flat_reporting'],
  ['reporting cycle', s => { s.structure_id = 'research-lab'; s.roles[1].reports_to = 'developer'; s.roles[2].reports_to = 'architect'; }, 'reporting_cycle'],
  ['unknown pack', s => s.roles[1].packs.push('unknown'), 'unknown_entry'],
  ['planned pack', s => s.roles[1].packs.push('marketing-core'), 'planned_entry'],
  ['duplicate pack', s => s.roles[1].packs.push('engineering-core'), 'invalid_role_selection'],
  ['unknown workflow', s => s.roles[1].workflows.push('unknown'), 'unknown_entry'],
  ['unknown structure', s => { s.structure_id = 'matrix'; }, 'unknown_entry'],
  ['unknown business tag', s => s.business_model_tags.push('unknown'), 'invalid_business_tags'],
  ['private field', s => { s.connection = { token: 'fictional-secret' }; }, 'invalid_selection'],
  ['private company field', s => { s.company.token = 'fictional-secret'; }, 'invalid_company'],
  ['machine path', s => { s.company.repository = 'C:/private/project'; }, 'invalid_company'],
  ['empty title', s => { s.roles[1].title = ' '; }, 'invalid_role_title'],
  ['multiline title', s => { s.roles[1].title = 'Line\nTwo'; }, 'invalid_role_title'],
  ['oversized title', s => { s.roles[1].title = 'x'.repeat(161); }, 'invalid_role_title'],
  ['changed digest', s => { s.catalog.sha256 = '0'.repeat(64); }, 'stale_catalog'],
  ['changed version', s => { s.catalog.version = '9.0.0'; }, 'stale_catalog'],
];
for (const [name, mutate, expected] of failures) test(`configuration rejects ${name} without a partial blueprint`, async () => {
  const selection = preset(); mutate(selection); const before = structuredClone(selection);
  for (const command of ['config validate', 'config preview', 'config export']) {
    const result = await configure(selection, { command, repository: 'nonexistent-path-not-to-be-read' });
    assert.equal(result.ok, false); assert.ok(result.diagnostics.some(d => d.code === expected), JSON.stringify(result.diagnostics));
    assert.equal(result.blueprint, undefined); assert.equal(result.authoring, undefined);
    assert.equal(result.selection_sha256, null); assert.deepEqual(selection, before);
  }
});

test('fixture failures match their documented graph and freshness diagnoses', async () => {
  for (const [name, code] of [['self-review', 'invalid_reviewer'], ['reporting-cycle', 'reporting_cycle'], ['stale-selection', 'stale_catalog']]) {
    const result = await configure(await fixture(name)); assert.ok(result.diagnostics.some(d => d.code === code));
  }
});

test('capability observations never promote auth, installed state, host quality or release evidence', async () => {
  const selection = preset('scientific-research');
  const missing = await configure(selection, { catalogContext: await fixture('missing-capabilities') });
  assert.equal(missing.ok, true); assert.ok(missing.requirements.every(r => r.state === 'missing'));
  const observed = await configure(selection, { catalogContext: { schema_version: 1, host: 'codex-local', capabilities: ['node-24', 'git', 'python'] } });
  assert.ok(observed.requirements.every(r => r.state === 'declared-present'));
  const remote = await configure(selection, { catalogContext: { schema_version: 1, host: 'chatgpt', capabilities: ['node-24', 'git', 'python'] } });
  assert.ok(remote.requirements.every(r => r.state === 'unsupported'));
  assert.deepEqual(observed.evidence, remote.evidence);
  const unknown = await configure(selection); assert.ok(unknown.requirements.every(r => r.state === 'unknown'));
  const hostile = await configure(selection, { catalogContext: { schema_version: 1, token: 'fictional-secret' } });
  assert.equal(hostile.ok, false); assert.ok(hostile.diagnostics.some(d => d.code === 'invalid_capability_context'));
  assert.ok(!JSON.stringify(hostile).includes('fictional-secret'));
});

test('data-defined required packs, workflow dependencies and compatibility constrain selection', async () => {
  for (const [change, expected] of [
    [c => { entry(c, 'role', 'developer').data.required_packs = ['research-core']; }, 'missing_required_pack'],
    [c => { entry(c, 'role', 'developer').data.allowed_packs = ['research-core']; }, 'incompatible_pack'],
    [c => { entry(c, 'workflow', 'reviewed-software').data.required_packs = ['research-core']; }, 'missing_workflow_pack'],
    [c => { entry(c, 'pack', 'engineering-core').data.requires_packs = ['research-core']; }, 'missing_pack_dependency'],
  ]) {
    const modified = structuredClone(catalog); change(modified);
    const result = await configureCompany({ catalog: modified, selection: preset('software-studio', modified) });
    assert.equal(result.ok, false); assert.ok(result.diagnostics.some(d => d.code === expected));
  }
});

test('malformed and cyclic catalogs fail before serving selections', () => {
  for (const change of [
    c => c.entries.push(structuredClone(c.entries[0])),
    c => { c.entries[0].requirements = ['missing']; },
    c => { entry(c, 'pack', 'engineering-core').data.requires_packs = ['engineering-core']; },
    c => { entry(c, 'requirement', 'node-runtime').requirements = ['node-runtime']; },
    c => { c.entries[0].provenance.path = '../escape'; },
  ]) { const modified = structuredClone(catalog); change(modified); assert.throws(() => validateCompanyCatalog(modified), { code: 'invalid_company_catalog' }); }
});

test('generic added roles cannot introduce overlapping ownership', async () => {
  const modified = structuredClone(catalog); entry(modified, 'role', 'researcher').data.ownership_paths = ['src/'];
  const selection = preset('software-studio', modified); selection.roles.push({ role_id: 'researcher', packs: [], workflows: [], reports_to: 'coordinator', reviewers: ['architect'] });
  const result = await configureCompany({ catalog: modified, selection, command: 'config export' });
  assert.equal(result.ok, false); assert.ok(result.diagnostics.some(d => d.code === 'overlapping_ownership'));
});

test('preview preserves existing files, exposes conflicts and changes its identity after edits', async t => {
  const root = await folder(t), selection = preset();
  await writeFile(join(root, 'AGENTS.md'), 'Existing instructions\n');
  await mkdir(join(root, 'company')); await writeFile(join(root, 'company/company.json'), '{"user_edit":true}\n');
  const before = await readFile(join(root, 'company/company.json'));
  const result = await configure(selection, { command: 'config preview', repository: root });
  assert.equal(result.ok, false); assert.deepEqual(result.authoring.conflicts, ['company/company.json']);
  assert.deepEqual(await readFile(join(root, 'company/company.json')), before);
  assert.deepEqual(await readdir(join(root, 'company')), ['company.json']);
  assert.equal(await readFile(join(root, 'AGENTS.md'), 'utf8'), 'Existing instructions\n');
  assert.deepEqual(result.selection, selection);
  const changed = structuredClone(selection); changed.roles[2].title = 'API Engineer';
  const next = await configure(changed, { command: 'config preview', repository: root });
  assert.notEqual(next.selection_sha256, result.selection_sha256);
  assert.notEqual(next.authoring.generated_files_sha256, result.authoring.generated_files_sha256);
});

test('preview refuses symlink or junction escape without touching the target', async t => {
  const root = await folder(t), outside = await folder(t);
  await symlink(outside, join(root, 'company'), process.platform === 'win32' ? 'junction' : 'dir');
  const result = await configure(preset(), { command: 'config preview', repository: root });
  assert.equal(result.ok, false); assert.ok(result.diagnostics.some(d => d.code === 'unsafe_authoring_path'));
  assert.deepEqual(await readdir(outside), []);
});

test('CLI read/export routes share the contract and invalid selections exit nonzero', async () => {
  async function invoke(args) { let output = ''; const exit = await runCli(args, { write: s => { output += s; } }); return { exit, result: JSON.parse(output) }; }
  const read = await invoke(['catalog', 'read', '--catalog-kind', 'preset', '--catalog-id', 'software-studio']);
  assert.equal(read.exit, 0); assert.deepEqual(read.result.default_selection, preset());
  const exported = await invoke(['config', 'export', '--selection', 'tests/fixtures/company-catalog/software-studio.json']);
  assert.equal(exported.exit, 0); assert.equal(exported.result.blueprint.roles.length, 5);
  const invalid = await invoke(['config', 'export', '--selection', 'tests/fixtures/company-catalog/self-review.json']);
  assert.equal(invalid.exit, 2); assert.equal(invalid.result.ok, false);
});
