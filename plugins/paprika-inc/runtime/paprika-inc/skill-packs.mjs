import { access, lstat, mkdir, readFile, readdir, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { join, resolve, dirname, delimiter } from 'node:path';
import { homedir } from 'node:os';
import { spawnSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { inspectDefinition, repositoryRoot } from './definition.mjs';
import { git } from './checkout.mjs';
import { IncError, requireInput as check } from './errors.mjs';
import { skillPack, validateSkillSets, provenance, validProvenance, sameProvenance, sha } from './skill-catalog.mjs';

// These checks are local observations, never authentication or network probes.
export async function probeCapabilities() {
  const python = spawnSync('python3', ['-B', '-c', 'import sys,importlib.util,json; print(json.dumps({"version":list(sys.version_info[:3]),"requests":importlib.util.find_spec("requests") is not None,"scholarly":importlib.util.find_spec("scholarly") is not None}))'],
    { encoding: 'utf8', timeout: 5000, maxBuffer: 4096, env: { ...process.env, PYTHONDONTWRITEBYTECODE: '1' } });
  let interpreter = { version: [], requests: false, scholarly: false };
  if (python.status === 0) { try {
    const parsed = JSON.parse(python.stdout);
    if (Array.isArray(parsed.version) && parsed.version.length === 3 && parsed.version.every(Number.isInteger)) interpreter = {version: parsed.version, requests: parsed.requests === true, scholarly: parsed.scholarly === true};
  } catch { /* Missing evidence remains missing. */ } }
  const executables = {};
  for (const name of ['curl', 'pandoc', 'xelatex', 'parallel-cli']) {
    executables[name] = false;
    for (const folder of (process.env.PATH || '').split(delimiter).filter(Boolean)) {
      try { const path = join(folder, name); if ((await lstat(path)).isFile() || (await lstat(path)).isSymbolicLink()) { await access(path, constants.X_OK); executables[name] = true; break; } } catch { /* Absent executable. */ }
    }
  }
  const credentials = Object.fromEntries(['PARALLEL_API_KEY', 'OPENROUTER_API_KEY', 'NCBI_API_KEY', 'S2_API_KEY', 'CORE_API_KEY', 'OPENALEX_API_KEY'].map(name => [name, Boolean(process.env[name]) ]));
  return { python3: interpreter, executables, credential_presence: credentials, network: 'not_tested', authentication: 'not_tested', full_text_access: 'not_tested', packages_installed: false };
}

export function capabilityReport(name, probe = {}) {
  if (name === 'paprika-code-review') return [{ id: 'connected_code_review', state: 'guidance_available', network_required: false, execution_tested: false, efficacy: 'not_benchmarked' }];
  const python = minor => Array.isArray(probe.python3?.version) && (probe.python3.version[0] > 3 || probe.python3.version[0] === 3 && probe.python3.version[1] >= minor);
  const local = (id, available) => ({ id, state: available ? 'local_dependencies_present' : 'local_dependency_missing', execution_tested: false });
  const external = (id, available) => ({ ...local(id, available), state: available ? 'external_access_unverified' : 'local_dependency_missing' });
  const optional = (id, included = true) => ({ id, state: 'optional_feature_disabled', implementation: included ? 'bundled_optional_helper_or_guidance' : 'unselected_skill_not_bundled' });
  const guidance = { id: 'markdown_analysis', state: 'guidance_available', network_required: false };
  if (name === 'paper-lookup') return [guidance, local('local_parsers', python(11)), external('public_source_retrieval', probe.executables?.curl === true), optional('restricted_full_text')];
  if (name === 'literature-review') return [guidance, local('local_record_processing', python(10)), external('doi_verification', python(10) && probe.python3.requests === true), optional('pdf_export'), optional('paid_ai_figures'), optional('parallel', false)];
  if (name === 'citation-management') return [guidance, local('local_bibtex_formatting', python(9)), external('metadata_search_and_validation', python(9) && probe.python3.requests === true), optional('google_scholar'), optional('parallel', false)];
  check(name === 'scientific-critical-thinking', 'invalid_skill_pack', 'Unknown capability profile.');
  return [guidance, { id: 'critical_appraisal', state: 'guidance_available', network_required: false }, optional('scientific_schematics', false)];
}

async function safePath(root, relative, leafDirectory = false) {
  let path = root;
  const parts = relative.split('/');
  for (const [index, part] of parts.entries()) {
    const parent = path;
    path = join(path, part);
    try {
      const info = await lstat(path);
      check((await readdir(parent)).includes(part), 'unsafe_skill_path', `Skill target path case differs: ${relative}.`);
      check(!info.isSymbolicLink() && (index < parts.length - 1 || leafDirectory ? info.isDirectory() : info.isFile()), 'unsafe_skill_path', `Refusing symlink or nonregular skill path: ${relative}.`);
    } catch (error) { if (error.code === 'ENOENT') return false; throw error; }
  }
  return true;
}
async function treeFiles(root, relative = '') {
  const found = [];
  for (const entry of await readdir(join(root, relative), { withFileTypes: true })) {
    const path = relative ? relative + '/' + entry.name : entry.name;
    check(!entry.isSymbolicLink(), 'unsafe_skill_path', 'A managed skill contains a symlink.');
    if (entry.isDirectory()) found.push(...await treeFiles(root, path));
    else { check(entry.isFile(), 'unsafe_skill_path', 'A managed skill contains a nonregular file.'); found.push(path); }
  }
  return found.sort();
}
async function identical(root, files, name) {
  const expected = files.filter(file => file.path.startsWith(name + '/'));
  const actual = await treeFiles(root);
  if (JSON.stringify(actual) !== JSON.stringify(expected.map(file => file.path.slice(name.length + 1)).sort())) return false;
  for (const file of expected) {
    const path = join(root, file.path.slice(name.length + 1));
    if ((await lstat(path)).size !== file.bytes.length || sha(await readFile(path)) !== file.sha256) return false;
  }
  return true;
}
async function context(repository) {
  const root = await repositoryRoot(repository);
  const top = await realpath(await git(['rev-parse', '--show-toplevel'], root));
  check(root === top && root !== homedir() && !root.startsWith(join(homedir(), '.agents')) && !root.startsWith(join(homedir(), '.codex', 'skills')), 'project_skill_scope_required', 'Select the Git project root, outside account-wide skill directories.');
  const common = await realpath(resolve(root, await git(['rev-parse', '--git-common-dir'], root)));
  const record = join(common, 'paprika-inc', 'skill-packs.json');
  // One physical private store across worktrees; project entries still have distinct destinations.
  await safePath(common, 'paprika-inc', true);
  await safePath(common, 'paprika-inc/skill-packs.json');
  let state = { schema_version: 1, projects: {} };
  try { state = JSON.parse(await readFile(record, 'utf8')); } catch (error) { if (error.code !== 'ENOENT') throw new IncError('invalid_skill_record', 'Preserve and reconcile the unreadable private skill record.'); }
  check(state.schema_version === 1 && state.projects && typeof state.projects === 'object' && !Array.isArray(state.projects), 'invalid_skill_record', 'Unsupported private skill record.');
  const key = sha(root), project = state.projects[key] || { skills: {} };
  check(project.skills && typeof project.skills === 'object' && !Array.isArray(project.skills), 'invalid_skill_record', 'Invalid private project skill record.');
  return { root, record, state, key, project };
}
async function save(ctx) {
  await safePath(dirname(dirname(ctx.record)), 'paprika-inc', true);
  await mkdir(dirname(ctx.record), { recursive: true, mode: 0o700 });
  await safePath(dirname(ctx.record), 'skill-packs.json');
  ctx.state.projects[ctx.key] = ctx.project;
  const temp = ctx.record + '.' + randomUUID() + '.tmp';
  await writeFile(temp, JSON.stringify(ctx.state, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  await rename(temp, ctx.record);
}
async function selection(options) {
  if (options.skillSet !== undefined) return validateSkillSets(options.skillSet.split(','));
  const definition = await inspectDefinition(options.repository, options.manifestPath);
  const ids = options.roles?.split(',');
  check(!ids || ids.length > 0 && new Set(ids).size === ids.length && ids.every(id => definition.roles.some(role => role.id === id)), 'invalid_roles', 'Select distinct role IDs from the manifest.');
  return [...new Set(definition.roles.filter(role => !ids || ids.includes(role.id)).flatMap(role => role.skill_sets))];
}
async function inspect(ctx, pack) {
  const result = [];
  for (const name of pack.skills) {
    const path = '.agents/skills/' + name, present = await safePath(ctx.root, path, true), record = ctx.project.skills[name];
    let state = 'not_installed';
    check(!record || ['pending', 'installed'].includes(record.state) && /^[0-9a-f]{64}$/.test(record.manifest_sha256) && validProvenance(record), 'invalid_skill_record', 'Preserve and reconcile an invalid managed skill record.');
    if (present) {
      if (!record) state = 'unmanaged_conflict';
      else if (record.manifest_sha256 !== pack.manifest_sha256 || !sameProvenance(record, pack)) state = 'managed_version_conflict';
      else state = await identical(join(ctx.root, path), pack.files, name) ? (record.state === 'pending' ? 'recoverable' : 'intact') : 'modified_conflict';
    } else if (record && record.state !== 'pending') state = 'managed_files_missing';
    result.push({ name, path, state, skill_set: pack.id, ...provenance(pack), manifest_sha256: pack.manifest_sha256, file_count: pack.files.filter(file => file.path.startsWith(name + '/')).length });
  }
  return result;
}

export async function projectSkills(options) {
  const command = options.command || 'skills status', write = command === 'skills install', ctx = await context(options.repository);
  const sets = await selection(options), packs = await Promise.all(sets.map(skillPack));
  check(new Set(packs.flatMap(pack => pack.skills)).size === packs.reduce((sum, pack) => sum + pack.skills.length, 0), 'invalid_skill_pack', 'Selected packs contain duplicate skill names.');
  const probe = options.probe || (sets.includes('research-core') ? await probeCapabilities() : null);
  const inspectAll = async () => (await Promise.all(packs.map(pack => inspect(ctx, pack)))).flat();
  let entries = await inspectAll();
  const conflicts = entries.filter(entry => !['not_installed', 'intact', 'recoverable'].includes(entry.state));
  check(!write || !conflicts.length, 'skill_install_conflict', 'Resolve existing unmanaged, missing or modified project skills before installation. No files were replaced.', { skills: conflicts });
  const completed = [];
  if (write && entries.some(entry => entry.state !== 'intact')) {
    await mkdir(dirname(ctx.record), { recursive: true, mode: 0o700 });
    const lock = join(dirname(ctx.record), 'skill-install.lock');
    try { await mkdir(lock, { mode: 0o700 }); } catch { throw new IncError('skill_install_busy', 'Another installation or unresolved lock occupies this private store. Reconcile it before retrying.'); }
    try {
      // Reload after the lock; do not overwrite a concurrent worktree's journal.
      Object.assign(ctx, await context(options.repository));
      entries = await inspectAll();
      check(entries.every(entry => ['not_installed', 'intact', 'recoverable'].includes(entry.state)), 'skill_install_conflict', 'Project skill files changed after planning.');
      for (const entry of entries) {
        const pack = packs.find(pack => pack.id === entry.skill_set);
        if (entry.state === 'intact') continue;
        if (entry.state === 'recoverable') { ctx.project.skills[entry.name].state = 'installed'; await save(ctx); completed.push(entry.name); continue; }
        ctx.project.skills[entry.name] = { state: 'pending', ...provenance(pack), manifest_sha256: pack.manifest_sha256,
          files: pack.files.filter(file => file.path.startsWith(entry.name + '/')).map(({path, sha256}) => ({path, sha256})) };
        await save(ctx); // Intent precedes visible files; interrupted installs can resume without adopting unmanaged files.
        await safePath(ctx.root, '.agents/skills', true);
        await mkdir(join(ctx.root, '.agents/skills'), { recursive: true });
        const temp = join(ctx.root, '.agents/skills', '.inc-' + randomUUID());
        await mkdir(temp);
        try {
          for (const file of pack.files.filter(file => file.path.startsWith(entry.name + '/'))) {
            const target = join(temp, file.path.slice(entry.name.length + 1));
            await mkdir(dirname(target), { recursive: true }); await writeFile(target, file.bytes, { flag: 'wx' });
          }
          await options.beforeCommit?.(entry.name);
          check(!await safePath(ctx.root, entry.path, true), 'skill_install_conflict', 'A skill destination appeared while installing; preserve it.');
          await rename(temp, join(ctx.root, entry.path));
          ctx.project.skills[entry.name].state = 'installed'; await save(ctx); completed.push(entry.name);
        } finally { await rm(temp, { recursive: true, force: true }); }
      }
    } catch (error) {
      throw new IncError('partial_skill_install', 'Installation stopped. Earlier managed successes are preserved; inspect skills status and resume after resolving the reported failure.', { completed_skills: completed, cause: error.code || 'io_failure' });
    } finally { await rm(lock, { recursive: true }); }
    entries = await inspectAll();
  }
  return { ok: !conflicts.length, command, read_only: !write, applied: write && completed.length > 0, skill_sets: sets,
    skills: entries.map(entry => ({ ...entry, capabilities: capabilityReport(entry.name, probe || {}) })), local_observations: probe,
    no_op: write && completed.length === 0, scope: 'selected_git_project_only', source_fallback: false,
    limits: ['No host skill discovery, API access, authentication, scientific correctness or review quality verified.', 'Optional paid services, PDF export, figures and Scholar are disabled.', 'Project discovery is shared; role references are not access controls.', 'Cooperating installs serialize; external concurrent file changes require manual reconciliation.'] };
}
