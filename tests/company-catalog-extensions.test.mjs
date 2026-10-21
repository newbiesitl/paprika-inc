import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { loadCompanyCatalog, readCompanyCatalog, configureCompany, validateCompanyCatalog } from '../plugins/paprika-inc/runtime/paprika-inc/company-catalog.mjs';
import { expandCatalog } from '../scripts/expand-company-catalog.mjs';
const catalog = await loadCompanyCatalog();
const sourceBytes = await readFile(new URL('../docs/research/company-persona-landscape-2026-10-19.json', import.meta.url));
const source = JSON.parse(sourceBytes);
const entries = kind => catalog.entries.filter(e => e.kind === kind);
const selection = id => readCompanyCatalog(catalog, { command: 'catalog read', catalogKind: 'preset', catalogId: id }).default_selection;

test('every research family and distinct persona is selectable with exact source provenance and deterministic generation', () => {
  assert.equal(source.families.length, 43);
  assert.equal(source.families.flatMap(f => f.roles).length, 139);
  const labels = new Set(source.families.flatMap(f => f.roles));
  assert.equal(labels.size, 131);
  for (const label of labels) assert(entries('role').some(r => r.label === label), label);
  assert.equal(entries('preset').filter(e => e.tier === 'essential').length, 2);
  assert.equal(entries('preset').filter(e => e.tier === 'extension').length, 43);
  assert.equal(entries('role').filter(e => e.tier === 'essential').length, 7);
  assert.equal(entries('role').filter(e => e.tier === 'extension').length, 130);
  assert.equal(entries('role').filter(e => e.id === 'release-engineer').length, 1);
  for (const family of source.families) {
    const preset = entries('preset').find(e => e.label === family.family);
    assert(preset, family.family);
    const roles = preset.data.defaults.roles.map(r => entries('role').find(e => e.id === r.role_id).label);
    for (const role of family.roles) assert(roles.includes(role), family.id + ': ' + role);
    assert.deepEqual(catalog.entries.find(e => e.id === preset.data.defaults.roles[0].workflows[0]).data.steps,
      family.workflow.split('→').map(s => s.trim()));
  }
  for (const e of catalog.entries.filter(e => e.tier === 'extension')) {
    assert.equal(e.availability, 'template');
    assert.equal(e.provenance.sha256, createHash('sha256').update(sourceBytes).digest('hex'));
    assert.deepEqual(e.evidence, [source.source_url]);
  }
  assert.deepEqual(expandCatalog(catalog, source, sourceBytes), catalog);
});

test('every preset exports real contracts with valid ownership and starter review boundaries', async () => {
  for (const preset of entries('preset')) {
    const result = await configureCompany({ catalog, selection: selection(preset.id), command: 'config export' });
    assert.equal(result.ok, true, preset.id + ': ' + JSON.stringify(result.diagnostics));
    assert.equal(result.evidence.task_quality_acceptance, 'unverified');
    assert.equal(result.evidence.connection_authentication, 'unverified');
    assert.equal(result.evidence.native_host_verification, 'unverified');
    const paths = new Set(result.repository_files.map(f => f.path));
    for (const role of result.blueprint.roles) assert(paths.has(`company/roles/${role.id}/agent.md`));
    if (preset.tier === 'extension') {
      assert(result.selection.roles.every(r => r.packs.length === 0 && r.reviewers.length === 0));
      assert(result.roster.every(r => r.review_requirement === 'human_review_required'));
      for (const role of result.blueprint.roles.filter(r => r.id !== 'coordinator' && r.id !== 'release-engineer')) {
        assert(role.boundaries.some(b => b.includes('research-derived starter')));
      }
    }
  }
});

test('all extension personas can be added to an Essential company without ownership collisions', async () => {
  for (const role of entries('role').filter(e => e.tier === 'extension')) {
    const draft = selection('software-studio');
    draft.roles.push({ role_id: role.id, packs: [], workflows: [], reports_to: 'coordinator', reviewers: [] });
    const result = await configureCompany({ catalog, selection: draft, command: 'config export' });
    assert.equal(result.ok, true, role.id + ': ' + JSON.stringify(result.diagnostics));
    assert(result.blueprint.ownership.some(o => o.owner_role === role.id));
  }
});

test('tiers validate independently from availability; legacy entries and planned rejection remain supported', async () => {
  const legacy = structuredClone(catalog);
  for (const entry of legacy.entries) delete entry.tier;
  assert.equal(validateCompanyCatalog(legacy), legacy);
  const invalid = structuredClone(catalog); invalid.entries[0].tier = 'certified';
  assert.throws(() => validateCompanyCatalog(invalid), { code: 'invalid_company_catalog' });
  const planned = structuredClone(catalog), p = planned.entries.find(e => e.id === 'marketing-agency' && e.kind === 'preset');
  p.availability = 'planned'; p.data = {};
  const draft = readCompanyCatalog(planned, { command: 'catalog read', catalogKind: 'preset', catalogId: 'software-studio' }).default_selection;
  draft.preset_id = p.id;
  const result = await configureCompany({ catalog: planned, selection: draft, command: 'config export' });
  assert.equal(result.ok, false);
  assert(result.diagnostics.some(d => d.code === 'planned_entry'));
  assert.equal(result.blueprint, undefined);
});
