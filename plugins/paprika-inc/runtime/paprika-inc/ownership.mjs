import { requireInput as check } from './errors.mjs';

export function portablePath(value, { directory = false } = {}) {
  check(typeof value === 'string' && value.length > 0 && value.length <= 512 &&
    !/[\\:\x00-\x1f]/.test(value) && !value.startsWith('/') && !/[?*\[\]]/.test(value),
  'invalid_ownership_path', 'Ownership uses exact repository-relative file/directory paths, without globs or traversal.');
  const path = directory && value.endsWith('/') ? value.slice(0, -1) : value;
  check(path.split('/').every(part => part && part !== '.' && part !== '..' &&
    !['.git', '.paprika', '.codex', '.agents', 'node_modules'].includes(part) && !part.startsWith('.env')),
  'invalid_ownership_path', 'Ownership paths cannot target private/internal directories or traverse outside the repository.');
  return path;
}

export function validateOwnership(value, roleIds) {
  check(value && value.schema_version === 1 && Object.keys(value).every(key => ['schema_version', 'entries'].includes(key)) &&
    Array.isArray(value.entries) && value.entries.length > 0 && value.entries.length <= 500,
  'invalid_ownership', 'Ownership requires schema_version 1 and 1–500 canonical entries.');
  const paths = [];
  for (const entry of value.entries) {
    check(entry && Object.keys(entry).every(key => ['path', 'owner_role', 'reviewer_roles'].includes(key)), 'invalid_ownership', 'Invalid ownership entry fields.');
    const path = portablePath(entry.path, { directory: true }).toLowerCase();
    check(roleIds.includes(entry.owner_role), 'unknown_owner', 'Each ownership entry must name a declared owner role.');
    check(Array.isArray(entry.reviewer_roles) && new Set(entry.reviewer_roles).size === entry.reviewer_roles.length &&
      entry.reviewer_roles.every(id => roleIds.includes(id) && id !== entry.owner_role),
    'invalid_reviewer', 'Ownership reviewers must be distinct declared peer roles; an author is not their independent reviewer.');
    for (const other of paths) check(path !== other && !path.startsWith(other + '/') && !other.startsWith(path + '/'),
      'overlapping_ownership', 'Canonical ownership entries cannot overlap or collide by case.');
    paths.push(path);
  }
  return value;
}
