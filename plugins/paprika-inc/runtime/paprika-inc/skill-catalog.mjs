import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { requireInput as check } from './errors.mjs';

export const skillNames = Object.freeze(['paper-lookup', 'literature-review', 'citation-management', 'scientific-critical-thinking']);
export const sourceCommit = 'a1043ef544e3a100c28e70a736b6cf32554d0677';
export const resourceRoot = new URL('.', new URL('../skill-packs/research-core/pack.json', import.meta.url));
export const sha = data => createHash('sha256').update(data).digest('hex');

export function validateSkillSets(value) {
  if (value === undefined) return [];
  check(Array.isArray(value) && value.length <= 1 && value.every(id => id === 'research-core'), 'invalid_skill_sets', 'skill_sets must be an array containing only the known research-core ID, without duplicates.');
  return [...value];
}

export async function researchPack() {
  const catalog = JSON.parse(await readFile(new URL('../skill-packs/catalog.json', import.meta.url), 'utf8'));
  const bytes = await readFile(new URL('pack.json', resourceRoot));
  const pack = JSON.parse(bytes);
  check(catalog.schema_version === 1 && Object.keys(catalog.sets).join() === 'research-core' &&
    catalog.sets['research-core'].manifest_sha256 === sha(bytes) && pack.schema_version === 1 && pack.id === 'research-core' &&
    pack.source.commit === sourceCommit && pack.source.package_version === '2.72.0' &&
    JSON.stringify(pack.skills) === JSON.stringify(skillNames), 'invalid_skill_pack', 'The bundled research-core manifest does not match its reviewed catalog.');
  const seen = new Set();
  check(Array.isArray(pack.files) && pack.files.length > 4 && pack.files.length <= 500, 'invalid_skill_pack', 'Invalid research resource inventory.');
  for (const file of pack.files) {
    check(typeof file.path === 'string' && /^(paper-lookup|literature-review|citation-management|scientific-critical-thinking)\/(?:[A-Za-z0-9_-]+\/)*[A-Za-z0-9_.-]+\.(?:md|py|bib)$/.test(file.path) && !file.path.includes('..') &&
      (!file.path.endsWith('/SKILL.md') || file.path.split('/').length === 2) && !seen.has(file.path) && /^[0-9a-f]{64}$/.test(file.sha256), 'invalid_skill_pack', 'Invalid or duplicate bundled resource path/digest.');
    seen.add(file.path);
    file.bytes = await readFile(new URL(file.path, resourceRoot));
    check(sha(file.bytes) === file.sha256, 'skill_payload_changed', `Bundled resource digest mismatch: ${file.path}.`);
  }
  for (const name of skillNames) for (const file of ['SKILL.md', 'INC-PORTABILITY.md', 'LICENSE.upstream.md'])
    check(seen.has(name + '/' + file), 'invalid_skill_pack', 'Missing selected skill, portability guidance or license.');
  return { ...pack, manifest_sha256: sha(bytes) };
}
