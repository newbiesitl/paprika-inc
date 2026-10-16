import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { requireInput as check } from './errors.mjs';

export const skillNames = Object.freeze(['paper-lookup', 'literature-review', 'citation-management', 'scientific-critical-thinking']);
export const sourceCommit = 'a1043ef544e3a100c28e70a736b6cf32554d0677';
export const resourceRoot = new URL('.', new URL('../skill-packs/research-core/pack.json', import.meta.url));
export const sha = data => createHash('sha256').update(data).digest('hex');
const engineeringCommits = Object.freeze({
  karpathy_guidelines: '2c606141936f1eeef17fa3043a72095b4765b9c2',
  ponytail: '742e0abae1501e12d1254a81d05f16bba10d08c1',
});
const sets = Object.freeze({ 'research-core': skillNames, 'engineering-core': ['paprika-code-review'] });
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const sortedEntries = value => Object.entries(value).sort(([a], [b]) => a.localeCompare(b));

export function validateSkillSets(value) {
  if (value === undefined) return [];
  check(Array.isArray(value) && value.length <= Object.keys(sets).length &&
    new Set(value).size === value.length && value.every(id => typeof id === 'string' && Object.hasOwn(sets, id)),
  'invalid_skill_sets', 'skill_sets must contain distinct known IDs: research-core, engineering-core.');
  return [...value];
}

export function provenance(pack) {
  return pack.id === 'research-core' ? { source_commit: pack.source.commit } :
    { source_commits: Object.fromEntries(sortedEntries(pack.sources).map(([key, source]) => [key, source.commit])) };
}
export function validProvenance(record) {
  if (record.source_commit !== undefined) return /^[0-9a-f]{40}$/.test(record.source_commit) && record.source_commits === undefined;
  return record.source_commits && typeof record.source_commits === 'object' && !Array.isArray(record.source_commits) &&
    same(Object.keys(record.source_commits).sort(), Object.keys(engineeringCommits).sort()) &&
    Object.values(record.source_commits).every(value => typeof value === 'string' && /^[0-9a-f]{40}$/.test(value));
}
export function sameProvenance(record, pack) {
  const expected = provenance(pack);
  return expected.source_commit ? record.source_commit === expected.source_commit :
    Boolean(record.source_commits && same(sortedEntries(record.source_commits), sortedEntries(expected.source_commits)));
}

export async function skillPack(id) {
  validateSkillSets([id]);
  const names = sets[id], root = new URL('../skill-packs/' + id + '/', import.meta.url);
  const catalog = JSON.parse(await readFile(new URL('../skill-packs/catalog.json', import.meta.url), 'utf8'));
  const bytes = await readFile(new URL('pack.json', root));
  const pack = JSON.parse(bytes), entry = catalog.sets?.[id];
  check(catalog.schema_version === 1 && catalog.sets && same(Object.keys(catalog.sets).sort(), Object.keys(sets).sort()) &&
    entry?.manifest_sha256 === sha(bytes) && pack.schema_version === 1 && pack.id === id &&
    same(pack.skills, names) && same(entry.skills, names), 'invalid_skill_pack', 'The bundled manifest does not match its reviewed catalog.');
  if (id === 'research-core') {
    check(pack.source?.commit === sourceCommit && pack.source?.package_version === '2.72.0' &&
      pack.source?.repository === 'https://github.com/K-Dense-AI/scientific-agent-skills.git' &&
      entry.source_commit === sourceCommit && entry.package_version === '2.72.0',
    'invalid_skill_pack', 'The research source differs from the reviewed pin.');
  } else {
    check(pack.sources && same(Object.keys(pack.sources).sort(), Object.keys(engineeringCommits).sort()) &&
      Object.entries(engineeringCommits).every(([key, commit]) => pack.sources[key]?.commit === commit) &&
      sameProvenance(entry, pack), 'invalid_skill_pack', 'The engineering sources differ from the reviewed pins.');
  }
  const seen = new Set();
  check(Array.isArray(pack.files) && pack.files.length > 4 && pack.files.length <= 500, 'invalid_skill_pack', 'Invalid resource inventory.');
  const pattern = id === 'research-core' ?
    /^(paper-lookup|literature-review|citation-management|scientific-critical-thinking)\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:md|py|bib)$/ :
    /^paprika-code-review\/(?:references\/)?[A-Za-z0-9_.-]+\.(?:md|json)$/;
  for (const file of pack.files) {
    check(typeof file.path === 'string' && pattern.test(file.path) && !file.path.includes('..') &&
      (!file.path.endsWith('/SKILL.md') || file.path.split('/').length === 2) && !seen.has(file.path) && /^[0-9a-f]{64}$/.test(file.sha256),
    'invalid_skill_pack', 'Invalid or duplicate bundled resource path/digest.');
    seen.add(file.path);
    file.bytes = await readFile(new URL(file.path, root));
    check(sha(file.bytes) === file.sha256, 'skill_payload_changed', `Bundled resource digest mismatch: ${file.path}.`);
  }
  for (const name of names) for (const file of ['SKILL.md', 'INC-PORTABILITY.md', 'LICENSE.upstream.md'])
    check(seen.has(name + '/' + file), 'invalid_skill_pack', 'Missing selected skill, portability guidance or license.');
  if (id === 'engineering-core') {
    const required = ['SKILL.md', 'INC-PORTABILITY.md', 'LICENSE.upstream.md', 'references/engineering-guidance.md', 'references/connected-review.md', 'references/adoption.json'];
    check(same([...seen].sort(), required.map(path => 'paprika-code-review/' + path).sort()), 'invalid_skill_pack', 'Unexpected engineering resources.');
    const adoption = pack.files.find(file => file.path.endsWith('/adoption.json'));
    check(sha(adoption.bytes) === pack.selection_sha256, 'invalid_skill_pack', 'Engineering adoption record mismatch.');
  }
  return { ...pack, manifest_sha256: sha(bytes) };
}

export const researchPack = () => skillPack('research-core');
