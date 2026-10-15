import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createHash } from 'node:crypto';
import { lstat, mkdtemp, readdir, realpath, rename, rmdir, rm } from 'node:fs/promises';
import { resolve, dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectDefinition } from './definition.mjs';
import { IncError, requireInput as check } from './errors.mjs';

const run = promisify(execFile);
export async function git(args, cwd) {
  try { return (await run('git', args, { cwd, encoding: 'utf8', maxBuffer: 2 * 1024 * 1024, timeout: 120000 })).stdout.trimEnd(); }
  catch { throw new IncError('git_operation_failed', 'Git could not complete the requested operation. Check the selected repository/revision and standard Git authentication; no credentials are stored by Inc.'); }
}

async function resolveRevision(root, revision) {
  for (const ref of [revision || 'HEAD', ...(revision && !revision.startsWith('refs/') ? ['origin/' + revision] : [])]) {
    try { return (await run('git', ['rev-parse', '--verify', '--end-of-options', ref + '^{commit}'], { cwd: root, encoding: 'utf8' })).stdout.trim(); } catch { /* Try the fetched remote branch form. */ }
  }
  throw new IncError('revision_unavailable', 'The selected definition revision is not available in this checkout/remote. Publish it and fetch/select that exact revision first.');
}

export async function repositoryIdentity(source) {
  check(typeof source === 'string' && source.trim() && !source.startsWith('-') && !/[\x00-\x1f]/.test(source), 'invalid_git_repository', 'Select a Git repository URL or explicit local repository path.');
  if (source.startsWith('file://')) return 'file:' + await realpath(fileURLToPath(source));
  if (/^git@[^/:]+:.+/.test(source)) {
    const [, host, path] = source.match(/^git@([^/:]+):(.+)$/);
    const name = path.replace(/^\/+|\/+$/g, '').replace(/\.git$/, '');
    return host.toLowerCase() + '/' + (host.toLowerCase() === 'github.com' ? name.toLowerCase() : name);
  }
  if (/^[A-Za-z][A-Za-z0-9+.-]*:\/\//.test(source)) {
    const url = new URL(source);
    check(['https:', 'ssh:'].includes(url.protocol) && !url.password && (url.protocol !== 'https:' || !url.username) && !url.search && !url.hash,
      'invalid_git_repository', 'Use HTTPS/SSH Git URLs without embedded credentials, query parameters or fragments; keep authentication in Git.');
    const path = decodeURIComponent(url.pathname).replace(/^\/+|\/+$/g, '').replace(/\.git$/, '');
    check(path && !path.includes('..'), 'invalid_git_repository', 'Git URL must identify a repository.');
    return url.host.toLowerCase() + '/' + (url.hostname.toLowerCase() === 'github.com' ? path.toLowerCase() : path);
  }
  try { return 'file:' + await realpath(resolve(source)); }
  catch { throw new IncError('invalid_git_repository', 'The selected local Git source does not exist.'); }
}

export async function inspectCheckout(destination, { source, revision, expectedDigest, manifestPath } = {}) {
  const root = await realpath(resolve(destination));
  const top = await git(['rev-parse', '--show-toplevel'], root);
  check(await realpath(top) === root, 'unrelated_checkout', 'The destination must be the exact selected checkout root, not a nested or unrelated directory.');
  const origin = await git(['remote', 'get-url', 'origin'], root);
  const identity = await repositoryIdentity(origin);
  if (source) check(identity === await repositoryIdentity(source), 'repository_mismatch', 'The destination origin does not match the selected Git repository.');
  const commit = await resolveRevision(root, revision);
  check(await git(['rev-parse', 'HEAD'], root) === commit, 'revision_mismatch', 'The existing checkout is not at the selected revision. Review and check out that revision explicitly; Inc does not overwrite it.');
  const definition = await inspectDefinition(root, manifestPath);
  const paths = [...new Set(definition.files.map(file => file.path))];
  check(!(await git(['status', '--porcelain=v1', '--untracked-files=all', '--', ...paths], root)),
    'unpublished_definition', 'Company inputs contain an uncommitted/unpublished draft. Commit and publish the discussed files before remote bootstrap.');
  for (const file of definition.files) {
    let bytes;
    try { bytes = (await run('git', ['show', `${commit}:${file.path}`], { cwd: root, encoding: 'buffer', maxBuffer: 512 * 1024 })).stdout; }
    catch { throw new IncError('unpublished_definition', 'A referenced company input is absent from the selected Git revision. Commit and publish it first.', { file: file.path }); }
    check(createHash('sha256').update(bytes).digest('hex') === file.sha256, 'definition_revision_mismatch', 'Working definition bytes do not match the selected Git revision.', { file: file.path });
  }
  if (expectedDigest) check(/^[0-9a-f]{64}$/.test(expectedDigest) && definition.definition_input_sha256 === expectedDigest,
    'stale_definition', 'The selected Git revision does not contain the discussed definition digest. Publish the draft and select its revision; no roles were created.');
  if (identity.startsWith('github.com/')) check(identity.slice('github.com/'.length) === definition.manifest.repository.toLowerCase(),
    'repository_mismatch', 'The declared company repository differs from the actual selected GitHub origin. Review the fork/company definition explicitly.');
  return { root, origin, repository_identity: identity, commit, definition };
}

async function requirePublished(root, commit) {
  const output = await git(['ls-remote', '--heads', '--tags', 'origin'], root);
  const heads = [...new Set(output.split('\n').map(line => line.split(/\s+/)[0]).filter(sha => /^[0-9a-f]{40,64}$/.test(sha)))];
  const contains = async () => {
    for (const head of heads) {
      try { await run('git', ['merge-base', '--is-ancestor', commit, head], { cwd: root }); return true; } catch { /* Not this published ref, or not fetched yet. */ }
    }
    return false;
  };
  if (!(await contains())) {
    await git(['fetch', '--no-tags', 'origin'], root); // Metadata only; never changes the user's working files.
    check(await contains(), 'unpublished_definition', 'The selected commit is not reachable from the selected origin’s published branches/tags. Publish it before remote bootstrap.');
  }
}

export async function checkoutCompany({ source, destination, revision, expectedDigest, manifestPath }) {
  check(typeof destination === 'string' && destination.trim(), 'missing_destination', 'Choose an explicit local destination folder.');
  const sourceIdentity = await repositoryIdentity(source); // Reject credentials/options before running Git.
  if (sourceIdentity.startsWith('file:')) {
    const sourceRoot = sourceIdentity.slice(5);
    let hasDefinition = false;
    try { hasDefinition = (await lstat(join(sourceRoot, manifestPath || 'company/company.json'))).isFile(); } catch { /* Bare source or no published definition. */ }
    if (hasDefinition) {
      const draft = await inspectDefinition(sourceRoot, manifestPath);
      check(!(await git(['status', '--porcelain=v1', '--untracked-files=all', '--', ...draft.files.map(file => file.path)], sourceRoot)),
        'unpublished_definition', 'The selected local source has an uncommitted definition draft. Commit/publish the discussed files instead of cloning stale inputs.');
    }
  }
  const target = resolve(destination);
  let exists = false;
  try {
    const stat = await lstat(target);
    check(stat.isDirectory() && !stat.isSymbolicLink(), 'invalid_destination', 'The destination must be a real directory, not a symlink or file.');
    exists = true;
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  if (exists && (await readdir(target)).length) {
    try { await lstat(join(target, '.git')); }
    catch { throw new IncError('destination_not_empty', 'The destination is not empty and is not a compatible Git checkout. Nothing was overwritten.'); }
    check(await repositoryIdentity(await git(['remote', 'get-url', 'origin'], target)) === sourceIdentity,
      'repository_mismatch', 'The destination origin does not match the selected Git repository.');
    const selectedRevision = revision || (await git(['ls-remote', source, 'HEAD'], target)).split(/\s+/)[0];
    check(selectedRevision && (revision || await git(['rev-parse', 'HEAD'], target) === selectedRevision),
      'revision_mismatch', 'The existing checkout is not at the selected remote HEAD. Review/fetch/check out the requested revision explicitly; no working file was overwritten.');
    const result = await inspectCheckout(target, { source, revision: selectedRevision, expectedDigest, manifestPath });
    await requirePublished(result.root, result.commit);
    return { ...result, checkout_action: 'reused_matching_checkout' };
  }
  const parent = await realpath(dirname(target));
  const scratch = await mkdtemp(join(parent, '.paprika-inc-clone-'));
  try {
    await git(['clone', '--no-checkout', '--no-recurse-submodules', '--', source, scratch], parent);
    const commit = await resolveRevision(scratch, revision);
    await git(['checkout', '--detach', commit], scratch);
    await inspectCheckout(scratch, { source, revision: commit, expectedDigest, manifestPath });
    await requirePublished(scratch, commit);
    if (exists) await rmdir(target); // Fails if any user file appeared; never rm -r a destination.
    await rename(scratch, target);
    return { ...await inspectCheckout(target, { source, revision: commit, expectedDigest, manifestPath }), checkout_action: 'cloned' };
  } finally { await rm(scratch, { recursive: true, force: true }); }
}
