import { lstat, readFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { sourceDigests } from './integration-registry.mjs';
import { requireInput as check } from './errors.mjs';

const digest = data => createHash('sha256').update(data).digest('hex');
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const fields = (value, keys) => value && typeof value === 'object' && !Array.isArray(value) && same(Object.keys(value).sort(), [...keys].sort());
const valid = (value, message) => check(value, 'invalid_skill_pack', message);
const reserved = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)/i;
export const safePackId = id => typeof id === 'string' && /^[a-z][a-z0-9-]{0,63}$/.test(id) && !reserved.test(id);
export function extensionPath(path, skills) {
  if (typeof path !== 'string' || path.length > 240 || !/\.(md|json|yaml|txt|py|bib|mjs)$/.test(path)) return false;
  const parts = path.split('/');
  return parts.length >= 2 && parts.length <= 8 && skills.includes(parts[0]) && parts.every(part =>
    /^[A-Za-z0-9_-][A-Za-z0-9_.-]*$/.test(part) && !part.includes('..') && !part.endsWith('.') && !reserved.test(part)) &&
    (parts.at(-1).toLowerCase() !== 'skill.md' || parts.length === 2);
}

// Version 2 is an explicitly inventoried payload, never a fetch or execution recipe.
export async function extensionPack(pack, bytes, entry, root) {
  valid(fields(pack, ['schema_version', 'id', 'skills', 'sources', 'files', 'capabilities']) && pack.schema_version === 2 && safePackId(pack.id), 'Invalid extension manifest.');
  valid(Array.isArray(pack.skills) && pack.skills.length > 0 && pack.skills.length <= 100 && pack.skills.every(safePackId) && new Set(pack.skills).size === pack.skills.length, 'Invalid extension skills.');
  const sources = sourceDigests(pack.sources);
  valid(fields(entry, ['manifest_sha256', 'source_digests', 'skills']) && entry.manifest_sha256 === digest(bytes) && same(entry.skills, pack.skills) &&
    fields(entry.source_digests, Object.keys(sources)) && Object.entries(sources).every(([id, hash]) => entry.source_digests[id] === hash), 'Extension catalog provenance mismatch.');
  valid(fields(pack.capabilities, pack.skills), 'Each extension skill requires capability declarations.');
  for (const capabilities of Object.values(pack.capabilities)) {
    valid(Array.isArray(capabilities) && capabilities.length > 0 && capabilities.length <= 32 && new Set(capabilities.map(item => item?.id)).size === capabilities.length, 'Invalid capability declarations.');
    for (const capability of capabilities) valid(fields(capability, ['id', 'kind']) && safePackId(capability.id) && ['guidance', 'local-tool', 'remote-tool'].includes(capability.kind), 'Invalid capability declaration.');
  }
  valid(Array.isArray(pack.files) && pack.files.length >= 3 && pack.files.length <= 500, 'Invalid extension inventory.');
  const seen = new Set(), pathCases = new Map();
  for (const file of pack.files) {
    valid(fields(file, ['path', 'sha256']) && extensionPath(file.path, pack.skills) && /^[0-9a-f]{64}$/.test(file.sha256) && !seen.has(file.path.toLowerCase()), 'Unsafe or duplicate extension resource.');
    seen.add(file.path.toLowerCase());
    const parts = file.path.split('/');
    for (let count = 1; count <= parts.length; count++) {
      const prefix = parts.slice(0, count).join('/'), key = prefix.toLowerCase();
      valid(!pathCases.has(key) || pathCases.get(key) === prefix, 'Case-colliding extension path.');
      pathCases.set(key, prefix);
    }
  }
  for (const name of pack.skills) for (const file of ['SKILL.md', 'INC-PORTABILITY.md', 'LICENSE.upstream.md'])
    valid(pack.files.some(item => item.path === name + '/' + file), 'Missing skill, portability guidance or upstream license.');
  valid((await lstat(root)).isDirectory() && !(await lstat(root)).isSymbolicLink(), 'Invalid extension resource root.');
  const actual = [];
  let size = 0;
  async function inventory(folder, relative = '') {
    for (const item of await readdir(folder, { withFileTypes: true })) {
      const path = relative + item.name;
      valid(!item.isSymbolicLink(), 'Extension symlinks are not allowed.');
      if (item.isDirectory()) {
        valid(pack.files.some(file => file.path.startsWith(path + '/')), 'Unselected extension directory.');
        await inventory(new URL(item.name + '/', folder), path + '/');
      } else {
        valid(item.isFile() && (path === 'pack.json' || pack.files.some(file => file.path === path)), 'Unselected extension resource.');
        const stat = await lstat(new URL(item.name, folder));
        size += stat.size;
        valid(stat.size <= 1024 * 1024 && size <= 8 * 1024 * 1024, 'Extension payload exceeds inspection budget.');
        actual.push(path);
      }
    }
  }
  await inventory(root);
  valid(same(actual.sort(), ['pack.json', ...pack.files.map(file => file.path)].sort()), 'Missing extension resource.');
  for (const file of pack.files) {
    file.bytes = await readFile(new URL(file.path, root));
    valid(digest(file.bytes) === file.sha256, 'Extension resource digest mismatch: ' + file.path);
    if (file.path.endsWith('/SKILL.md')) {
      const text = new TextDecoder('utf-8', { fatal: true }).decode(file.bytes).replace(/\r\n/g, '\n');
      valid(text.startsWith('---\nname: ' + file.path.split('/')[0] + '\ndescription: ') && text.includes('\n---\n'), 'Extension skill frontmatter must match its selected name.');
    }
  }
  return { ...pack, manifest_sha256: digest(bytes) };
}
