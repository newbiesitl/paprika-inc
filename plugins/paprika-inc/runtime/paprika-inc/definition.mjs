import { constants } from 'node:fs';
import { lstat, open, readdir, realpath } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { resolve, join } from 'node:path';
import { IncError, requireInput as check } from './errors.mjs';
import { validateOwnership } from './ownership.mjs';

const limit = 256 * 1024;
const identifier = /^[a-z][a-z0-9-]{0,95}$/;
export const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*)(?:\.(?:0|[1-9]\d*|\d*[A-Za-z-][0-9A-Za-z-]*))*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);

function fields(value, allowed, location) {
  check(object(value), 'invalid_manifest', `${location} must be an object.`);
  for (const key of Object.keys(value))
    check(allowed.includes(key), 'unsupported_field', `Unsupported field ${location}.${key}; schema 1 inspection cannot validate it.`);
}

function string(value, location) {
  check(typeof value === 'string' && value.trim() && !/[\x00-\x1f]/.test(value) && value.length <= 256,
    'invalid_manifest', `${location} must be nonempty text without control characters (at most 256 characters).`);
}

function equal(value, expected, location) {
  check(value === expected, 'unsupported_configuration', `${location} must be ${JSON.stringify(expected)} in the supported schema 1 profile.`);
}

export function parseJson(text, file) {
  try { return JSON.parse(text); }
  catch { throw new IncError('invalid_json', `${file} must contain valid JSON.`, { file }); }
}

export async function repositoryRoot(repository) {
  check(typeof repository === 'string' && repository.trim(), 'missing_repository', 'Select an explicit repository directory with --repo; the plugin directory is not the company.');
  try {
    const root = await realpath(resolve(repository));
    check((await lstat(root)).isDirectory(), 'invalid_repository', 'The selected repository must be a directory.');
    return root;
  } catch (error) {
    if (error instanceof IncError) throw error;
    throw new IncError('missing_repository', 'The selected repository directory does not exist or cannot be read.');
  }
}

// Relative, case-exact, regular files only. Never follow contract symlinks or
// evaluate document content. This is definition inspection, not enrollment.
export async function readDocument(root, relative) {
  check(typeof relative === 'string' && relative.length > 0 && relative.length <= 512 &&
    !relative.includes('\\') && !relative.includes(':') && !/[\x00-\x1f]/.test(relative) && !relative.startsWith('/') &&
    relative.split('/').every(part => part && part !== '.' && part !== '..'),
  'unsafe_path', 'Document paths must be relative POSIX paths without traversal, empty components, or control characters.', { file: relative });
  check(!relative.split('/').some(part => ['.git', '.paprika', '.codex', '.agents', 'node_modules'].includes(part) || part.startsWith('.env')),
    'private_document_path', 'Company definitions cannot reference private runtime, credential, host-policy or dependency directories.', { file: relative });
  let target = root;
  for (const [index, part] of relative.split('/').entries()) {
    let names;
    try { names = await readdir(target); }
    catch { throw new IncError('missing_document', `Cannot read document ${relative}.`, { file: relative }); }
    if (!names.includes(part)) {
      const wrongCase = names.some(name => name.toLowerCase() === part.toLowerCase());
      throw new IncError(wrongCase ? 'path_case_mismatch' : 'missing_document',
        wrongCase ? `Use the exact path case for ${relative}.` : `Required document ${relative} is missing.`, { file: relative });
    }
    target = join(target, part);
    const stat = await lstat(target);
    check(!stat.isSymbolicLink(), 'unsafe_path', `Symlinks are not allowed in document paths: ${relative}.`, { file: relative });
    const last = index === relative.split('/').length - 1;
    check(last ? stat.isFile() : stat.isDirectory(), 'invalid_document', `Expected a regular document path: ${relative}.`, { file: relative });
    if (last) check(stat.size <= limit, 'document_too_large', `${relative} exceeds the 256 KiB inspection limit.`, { file: relative });
  }
  let handle;
  try {
    handle = await open(target, constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0));
    const buffer = Buffer.alloc(limit + 1);
    let bytesRead = 0;
    while (bytesRead < buffer.length) {
      const chunk = await handle.read(buffer, bytesRead, buffer.length - bytesRead, bytesRead);
      if (!chunk.bytesRead) break;
      bytesRead += chunk.bytesRead;
    }
    check(bytesRead <= limit, 'document_too_large', `${relative} exceeds the 256 KiB inspection limit.`, { file: relative });
    const text = new TextDecoder('utf-8', { fatal: true }).decode(buffer.subarray(0, bytesRead));
    check(!text.includes('\0'), 'invalid_document', `${relative} contains a NUL character.`, { file: relative });
    return { path: relative, text: text.replace(/\r\n?/g, '\n'), sha256: hash(buffer.subarray(0, bytesRead)) };
  } catch (error) {
    if (error instanceof IncError) throw error;
    throw new IncError('invalid_document', `Cannot read ${relative} as a regular UTF-8 document.`, { file: relative });
  } finally { await handle?.close(); }
}

export async function inspectDefinition(repository, manifestPath = 'company/company.json') {
  const root = await repositoryRoot(repository);
  const manifestFile = await readDocument(root, manifestPath);
  const manifest = parseJson(manifestFile.text, manifestPath);
  fields(manifest, ['schema_version', 'definition_version', 'status', 'company_id', 'repository', 'topology', 'runtime',
    'constitution', 'coordinator_role', 'roles', 'ownership', 'work_tracking', 'knowledge_policy', 'runtime_state', 'messaging', 'lifecycle', 'adoption'], 'manifest');
  equal(manifest.schema_version, 1, 'schema_version');
  for (const field of ['definition_version', 'status', 'company_id', 'repository', 'coordinator_role']) string(manifest[field], field);
  check(semver.test(manifest.definition_version), 'invalid_version', 'definition_version must be a semantic version.');
  check(identifier.test(manifest.company_id), 'invalid_identifier', 'company_id must be a stable lowercase identifier.');
  check(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(manifest.repository), 'invalid_repository_identity', 'repository must be declared as owner/name; declaration does not verify enrollment.');
  equal(manifest.topology, 'single_host', 'topology');
  equal(manifest.runtime, 'codex_local', 'runtime');
  equal(manifest.knowledge_policy, 'private_runtime_location', 'knowledge_policy');
  equal(manifest.runtime_state, 'private_enrollment_required', 'runtime_state');
  fields(manifest.messaging, ['default_receiving', 'background_monitoring'], 'messaging');
  equal(manifest.messaging.default_receiving, 'on_demand', 'messaging.default_receiving');
  equal(manifest.messaging.background_monitoring, false, 'messaging.background_monitoring');
  fields(manifest.lifecycle, ['max_instances_per_role', 'require_verified_project_membership', 'automatic_takeover'], 'lifecycle');
  equal(manifest.lifecycle.max_instances_per_role, 1, 'lifecycle.max_instances_per_role');
  equal(manifest.lifecycle.require_verified_project_membership, true, 'lifecycle.require_verified_project_membership');
  equal(manifest.lifecycle.automatic_takeover, false, 'lifecycle.automatic_takeover');
  fields(manifest.adoption, ['automatic', 'policy'], 'adoption');
  equal(manifest.adoption.automatic, false, 'adoption.automatic');
  check(Array.isArray(manifest.roles) && manifest.roles.length > 0 && manifest.roles.length <= 100,
    'invalid_roles', 'roles must contain between 1 and 100 role definitions.');
  const ids = new Set(), paths = new Set(), roles = [];
  for (const role of manifest.roles) {
    fields(role, ['id', 'version', 'definition'], 'role');
    check(typeof role.id === 'string' && identifier.test(role.id), 'invalid_identifier', 'Each role ID must be a stable lowercase identifier.');
    check(!ids.has(role.id), 'duplicate_role', `Duplicate role ID: ${role.id}.`);
    ids.add(role.id);
    check(typeof role.version === 'string' && semver.test(role.version), 'invalid_version', `Role ${role.id} requires a semantic version.`);
    check(!paths.has(role.definition), 'duplicate_contract', 'Each role must have its own canonical definition path.');
    paths.add(role.definition);
    const contract = await readDocument(root, role.definition);
    const declaredIds = contract.text.match(/^Role ID: `([^`]+)`\s*$/gm) ?? [];
    const declaredVersions = contract.text.match(/^Role version: ([^\n]+)$/gm) ?? [];
    check(declaredIds.length === 1 && declaredIds[0].trim() === `Role ID: \`${role.id}\``,
      'contract_id_mismatch', `Contract ${role.definition} must declare Role ID: \`${role.id}\` exactly once.`, { file: role.definition });
    check(declaredVersions.length === 1 && declaredVersions[0].trim() === `Role version: ${role.version}`,
      'contract_version_mismatch', `Contract ${role.definition} must declare Role version: ${role.version} exactly once.`, { file: role.definition });
    roles.push({ id: role.id, version: role.version, definition: role.definition, sha256: contract.sha256, text: contract.text });
  }
  check(ids.has(manifest.coordinator_role), 'missing_coordinator', 'coordinator_role must reference a declared role.');
  const shared = [];
  let ownership = null;
  if (manifest.ownership !== undefined) {
    const doc = await readDocument(root, manifest.ownership);
    ownership = validateOwnership(parseJson(doc.text, doc.path), [...ids]);
    shared.push({ path: doc.path, sha256: doc.sha256 });
  }
  for (const path of [manifest.constitution, manifest.work_tracking, manifest.adoption.policy]) {
    const doc = await readDocument(root, path);
    check(doc.text.trim(), 'empty_document', `Shared document ${path} must not be empty.`, { file: path });
    shared.push({ path, sha256: doc.sha256 });
  }
  const files = [{ path: manifestFile.path, sha256: manifestFile.sha256 },
    ...roles.map(role => ({ path: role.definition, sha256: role.sha256 })), ...shared].sort((a, b) => a.path < b.path ? -1 : a.path > b.path ? 1 : 0);
  return { manifest, roles, ownership, files, definition_input_sha256: hash(JSON.stringify(files)), input_scope: 'working_tree_files' };
}
