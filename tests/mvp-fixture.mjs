import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { authorCompany } from '../plugins/paprika-inc/runtime/paprika-inc/authoring.mjs';
import { requiredHostTools } from '../plugins/paprika-inc/runtime/paprika-inc/bootstrap.mjs';
const run = promisify(execFile);

export const blueprint = () => ({ schema_version: 1, company_id: 'example-workshop', repository: 'fictional/workshop', version: '0.1.0',
  purpose: 'Build a small fictional workshop product.', coordinator_role: 'organizer',
  roles: [
    { id: 'organizer', version: '0.1.0', title: 'Organizer', purpose: 'Keep scope and review coherent.', responsibilities: ['Plan scoped outcomes.'], boundaries: ['Do not deploy or change grants.'], inputs: ['Human goals.'], outputs: ['Reviewed plans and acceptance criteria.'], reviewer_roles: ['artisan'], escalation: ['Ask the owner about product changes.'] },
    { id: 'artisan', version: '0.1.0', title: 'Artisan', purpose: 'Build the requested product work.', responsibilities: ['Implement scoped product work.'], boundaries: ['Do not dispatch new roles or deploy.'], inputs: ['Reviewed tasks.'], outputs: ['Code and meaningful tests.'], reviewer_roles: ['organizer'], escalation: ['Raise unclear interfaces.'] },
  ], ownership: [{ path: 'docs/', owner_role: 'organizer', reviewer_roles: ['artisan'] }, { path: 'src/', owner_role: 'artisan', reviewer_roles: ['organizer'] }] });
export const capabilities = () => ({ execution_mode: 'codex_local', tools: [...requiredHostTools, 'mcp__codex_app__send_message_to_thread'] });
export const git = async (root, ...args) => (await run('git', args, { cwd: root, encoding: 'utf8' })).stdout.trim();
export async function fixture(t, { commit = true } = {}) {
  const base = await mkdtemp(join(tmpdir(), 'inc-mvp-fixture-'));
  t.after(() => rm(base, { recursive: true, force: true }));
  const source = join(base, 'source'), destination = join(base, 'My Company');
  await mkdir(source); await mkdir(destination);
  await git(source, 'init', '--initial-branch=main');
  await git(source, 'config', 'user.name', 'Fictional Fixture');
  await git(source, 'config', 'user.email', 'fixture@example.invalid');
  await git(source, 'config', 'commit.gpgsign', 'false');
  await writeFile(join(source, 'AGENTS.md'), '# Existing user directions\nPreserve this file.\n');
  const authored = await authorCompany({ repository: source, spec: blueprint(), write: true });
  if (commit) { await git(source, 'add', '.'); await git(source, 'commit', '-m', 'Fictional company definition'); }
  return { base, source, destination, digest: authored.definition_input_sha256,
    revision: commit ? await git(source, 'rev-parse', 'HEAD') : null };
}
export async function journal(root) { return JSON.parse(await readFile(join(root, '.git/paprika-inc/bootstrap-mvp.json'), 'utf8')); }
export const projectReport = root => ({ schemaVersion: 2, projects: [{ projectId: 'fictional-project', projectKind: 'local', label: 'Fictional workshop', path: root, hostId: 'local', isGitRepository: true }] });
export const membershipReport = (root, threadId, overrides = {}) => ({ schemaVersion: 4, pinnedThreads: [], threads: [{ id: threadId, kind: 'codex', hostId: 'local', projectId: 'fictional-project', cwd: root, status: 'idle', ...overrides }] });
export async function readReport(root, roleId, { blocked = false, mismatch = false, active = false } = {}) {
  const state = await journal(root), role = state.roles.find(role => role.id === roleId);
  const receipt = { request_id: role.request_id, role_id: role.id, role_version: role.version, source_revision: state.revision,
    contract_sha256: mismatch ? 'incorrect' : role.contract_sha256, ownership_sha256: state.ownership_sha256,
    sources_read: [state.manifest_path, state.ownership_path, role.definition], state: blocked ? 'blocked' : 'ready', blockers: blocked ? ['fictional_review_needed'] : [] };
  return { schemaVersion: 1, thread: { id: role.thread_id, kind: 'codex', hostId: 'local', cwd: root }, turns: [{ status: active ? 'inProgress' : 'completed', items: [{ type: 'agentMessage', phase: 'final', text: 'Fictional read/report result.\n```json\n' + JSON.stringify(receipt) + '\n```' }] }] };
}
