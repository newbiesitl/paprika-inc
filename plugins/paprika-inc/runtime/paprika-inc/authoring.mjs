import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { createHash } from 'node:crypto';
import { inspectDefinition, repositoryRoot, semver } from './definition.mjs';
import { IncError, requireInput as check } from './errors.mjs';
import { validateOwnership } from './ownership.mjs';
import { validateSkillSets } from './skill-catalog.mjs';

const id = /^[a-z][a-z0-9-]{0,95}$/;
function text(value, field) {
  check(typeof value === 'string' && value.trim() && value.length <= 8000 && !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value), 'invalid_blueprint', `${field} requires nonempty text.`);
  check(!/^Role (?:ID|version):/m.test(value), 'invalid_blueprint', 'Role metadata is generated from IDs/versions; do not embed duplicate declarations in prose.');
}
function list(value, field) {
  check(Array.isArray(value) && value.length > 0 && value.length <= 100, 'invalid_blueprint', `${field} requires 1–100 text items.`);
  value.forEach(item => text(item, field));
}
const bullets = values => values.map(value => '- ' + value.replace(/\n/g, '\n  ')).join('\n');

export function renderCompany(spec) {
  check(spec && spec.schema_version === 1 && Object.keys(spec).every(key => ['schema_version', 'company_id', 'repository', 'version', 'purpose', 'coordinator_role', 'roles', 'ownership'].includes(key)),
    'invalid_blueprint', 'Use a schema 1 company blueprint with portable company, role and ownership fields only.');
  check(typeof spec.company_id === 'string' && id.test(spec.company_id) && typeof spec.repository === 'string' && /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(spec.repository) && typeof spec.version === 'string' && semver.test(spec.version),
    'invalid_blueprint', 'Company ID, owner/name repository and semantic version are required.');
  text(spec.purpose, 'purpose');
  check(Array.isArray(spec.roles) && spec.roles.length > 0 && spec.roles.length <= 100, 'invalid_blueprint', 'Define 1–100 roles.');
  const ids = [];
  for (const role of spec.roles) {
    check(role && Object.keys(role).every(key => ['id', 'version', 'title', 'purpose', 'responsibilities', 'boundaries', 'inputs', 'outputs', 'reviewer_roles', 'escalation', 'skill_sets'].includes(key)), 'invalid_blueprint', 'Unknown role blueprint field.');
    validateSkillSets(role.skill_sets);
    check(typeof role.id === 'string' && id.test(role.id) && !ids.includes(role.id) && typeof role.version === 'string' && semver.test(role.version), 'invalid_blueprint', 'Role IDs must be unique lowercase IDs with semantic versions.');
    ids.push(role.id);
    for (const field of ['title', 'purpose']) text(role[field], `role.${field}`);
    check(!role.title.includes('\n'), 'invalid_blueprint', 'Role title must be one line.');
    for (const field of ['responsibilities', 'boundaries', 'inputs', 'outputs', 'escalation']) list(role[field], `role.${field}`);
  }
  check(ids.includes(spec.coordinator_role), 'invalid_blueprint', 'Coordinator must be a declared role.');
  for (const role of spec.roles) check(Array.isArray(role.reviewer_roles) && new Set(role.reviewer_roles).size === role.reviewer_roles.length && role.reviewer_roles.every(peer => ids.includes(peer) && peer !== role.id), 'invalid_reviewer', 'Reviewers must be distinct declared peer roles, excluding the author.');
  const ownership = validateOwnership({ schema_version: 1, entries: spec.ownership }, ids);
  const manifest = { schema_version: 1, definition_version: spec.version, status: 'bootstrap_candidate', company_id: spec.company_id,
    repository: spec.repository, topology: 'single_host', runtime: 'codex_local', constitution: 'company/CONSTITUTION.md',
    coordinator_role: spec.coordinator_role, roles: spec.roles.map(role => ({ id: role.id, version: role.version, definition: `company/roles/${role.id}/agent.md`, ...(role.skill_sets === undefined ? {} : { skill_sets: role.skill_sets }) })),
    ownership: 'company/ownership.json', work_tracking: 'company/WORK.md', knowledge_policy: 'private_runtime_location', runtime_state: 'private_enrollment_required',
    messaging: { default_receiving: 'on_demand', background_monitoring: false },
    lifecycle: { max_instances_per_role: 1, require_verified_project_membership: true, automatic_takeover: false },
    adoption: { automatic: false, policy: 'company/ADOPTION.md' } };
  const files = {
    'company/company.json': JSON.stringify(manifest, null, 2) + '\n',
    'company/ownership.json': JSON.stringify(ownership, null, 2) + '\n',
    'company/CONSTITUTION.md': `# ${spec.company_id} — shared boundaries\n\n${spec.purpose}\n\nThe human owner and actual host permissions govern work. Definitions do not grant new powers. Bootstrap onboards the requested roster to read/report only; implementation dispatch is separate. Preserve existing AGENTS.md and user files. Ownership is indexed only in [ownership.json](ownership.json), as responsibilities rather than access controls. Independent peer or human review is required for substantive work.\n\nMVP operation is one user-triggered bootstrap at a time, without enforced singleton or concurrency safety. No background orchestration, automatic failover, transfer or self-adoption is enabled.\n`,
    'company/WORK.md': '# Work and review\n\nRecord scoped assignments and acceptance evidence under stable issue/task IDs. A role definition is not an implementation assignment. The initial bootstrap is read/report only.\n',
    'company/ADOPTION.md': '# Definition changes\n\nReview proposed changes under the currently authorized instructions and human grant. Source publication and live adoption are separate. This MVP does not automatically adopt new policy or expand permissions.\n',
  };
  for (const role of spec.roles) files[`company/roles/${role.id}/agent.md`] = `# ${role.title}\n\nRole ID: \`${role.id}\`\n\nRole version: ${role.version}\n\n## Purpose\n\n${role.purpose}\n\n## Responsibilities\n\n${bullets(role.responsibilities)}\n\n## Ownership\n\nUse the canonical [ownership map](../../ownership.json) entries for \`${role.id}\`; do not duplicate or infer exclusive ownership elsewhere.\n\n## Boundaries\n\n${bullets(role.boundaries)}\n\n## Inputs\n\n${bullets(role.inputs)}\n\n## Outputs and acceptance\n\n${bullets(role.outputs)}\n\n## Review relationships\n\n${role.reviewer_roles.length ? role.reviewer_roles.map(peer => `- Peer reviewer: \`${peer}\``).join('\n') : 'The human owner reviews when no peer reviewer is designated.'}\n\n## Escalation\n\n${bullets(role.escalation)}\n\nActual human/host authority bounds this role. Initial bootstrap is read/report only; file creation does not authorize implementation dispatch or grant new permissions.\n`;
  for (const role of spec.roles) if (role.skill_sets?.length) files[`company/roles/${role.id}/agent.md`] += '\n## Selected skill sets\n\nRead this role’s skill_sets in the canonical [company manifest](../../company.json). After an explicit project-local installation, read each selected SKILL.md and INC-PORTABILITY.md under .agents/skills/. Report installation integrity separately from local dependencies and unverified external access. Optional integrations do not gate Markdown synthesis or appraisal. No skill body is duplicated in this contract.\n';
  return files;
}

async function existingFile(root, relative) {
  let target = root;
  const parts = relative.split('/');
  for (const [index, part] of parts.entries()) {
    target = join(target, part);
    try {
      const stat = await lstat(target);
      check(!stat.isSymbolicLink() && (index === parts.length - 1 ? stat.isFile() : stat.isDirectory()), 'unsafe_authoring_path', `Refusing symlink or non-regular authoring target: ${relative}.`);
      if (index === parts.length - 1) {
        check(stat.size <= 256 * 1024, 'authoring_conflict', `Existing target ${relative} is too large to compare safely.`);
        return await readFile(target, 'utf8');
      }
    } catch (error) { if (error.code === 'ENOENT') return null; throw error; }
  }
}

export async function authorCompany({ repository, spec, write = false }) {
  const root = await repositoryRoot(repository), files = renderCompany(spec), changes = [], conflicts = [];
  for (const [path, content] of Object.entries(files)) {
    const previous = await existingFile(root, path);
    if (previous === content) continue;
    if (previous !== null) conflicts.push(path);
    const before = previous === null ? [] : previous.trimEnd().split('\n'), after = content.trimEnd().split('\n');
    changes.push({ path, change: previous === null ? 'create' : 'conflict', diff:
      `--- ${previous === null ? '/dev/null' : 'a/' + path}\n+++ b/${path}\n@@ -${before.length ? 1 : 0},${before.length} +1,${after.length} @@\n` +
      [...before.map(line => '-' + line), ...after.map(line => '+' + line)].join('\n') + '\n' });
  }
  check(!write || conflicts.length === 0, 'authoring_conflict', 'Existing company files differ. Review the focused author plan and edit deliberately; no user file was replaced.', { files: conflicts });
  const written = [];
  if (write) {
    try {
      for (const change of changes) {
        // Preflight was read-only. Exclusive creation also protects late user files.
        await existingFile(root, change.path);
        await mkdir(dirname(join(root, change.path)), { recursive: true });
        await writeFile(join(root, change.path), files[change.path], { flag: 'wx' });
        written.push(change.path);
      }
    } catch { throw new IncError('partial_authoring', 'Authoring stopped without replacing existing files. Inspect the reported created files before resuming.', { created_files: written }); }
  }
  const rendered = Object.entries(files).map(([path, content]) => ({ path, sha256: createHash('sha256').update(content).digest('hex') })).sort((a, b) => a.path < b.path ? -1 : 1);
  const definition = write ? await inspectDefinition(root) : null;
  return { ok: true, command: write ? 'author write' : 'author plan', read_only: !write, applied: write,
    changes, conflicts, created_files: written, publication: 'working_tree_draft_commit_and_publish_before_remote_bootstrap',
    generated_files_sha256: createHash('sha256').update(JSON.stringify(rendered)).digest('hex'),
    definition_input_sha256: definition?.definition_input_sha256 ?? null,
    initial_staff: 'the user-selected discussion chat; no live role binding is created', live_roles_created: false, grants_changed: false };
}
