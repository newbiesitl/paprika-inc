import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, lstat, mkdir, readFile, readdir, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { projectSkills, capabilityReport, probeCapabilities } from '../plugins/paprika-inc/runtime/paprika-inc/skill-packs.mjs';
import { researchPack, sha, skillNames } from '../plugins/paprika-inc/runtime/paprika-inc/skill-catalog.mjs';
import { renderCompany } from '../plugins/paprika-inc/runtime/paprika-inc/authoring.mjs';
import { inspectDefinition } from '../plugins/paprika-inc/runtime/paprika-inc/definition.mjs';
import { beginBootstrap, nextBootstrap, recordBootstrap } from '../plugins/paprika-inc/runtime/paprika-inc/bootstrap.mjs';
import { fixture, blueprint, git, capabilities, projectReport, membershipReport, readReport, journal, senderContext } from './mvp-fixture.mjs';
const run = promisify(execFile), code = value => error => error.code === value;
const probe = { python3: {version: [], requests: false, scholarly: false}, executables: {}, credential_presence: {}, network: 'not_tested' };
const options = root => ({ repository: root, skillSet: 'research-core', probe });
const install = (root, extra = {}) => projectSkills({ ...options(root), command: 'skills install', ...extra });
const status = root => projectSkills({ ...options(root), command: 'skills status' });

test('optional role selection preserves legacy authoring and rejects unknown/nonarray/duplicate sets', async t => {
  const f = await fixture(t);
  assert.ok((await inspectDefinition(f.source)).roles.every(role => role.skill_sets.length === 0));
  assert.deepEqual((await projectSkills({repository: f.source, probe})).skills, []);
  for (const value of ['research-core', ['unknown'], ['research-core', 'research-core'], [null]]) {
    const spec = blueprint(); spec.roles[0].skill_sets = value;
    assert.throws(() => renderCompany(spec), code('invalid_skill_sets'));
  }
  const spec = blueprint(); spec.roles[1].skill_sets = ['research-core'];
  const rendered = renderCompany(spec), manifest = JSON.parse(rendered['company/company.json']);
  assert.deepEqual(manifest.roles[1].skill_sets, ['research-core']);
  assert.ok(!rendered['company/roles/artisan/agent.md'].includes('name: paper-lookup'));
  for (const [name, content] of Object.entries(rendered)) await writeFile(join(f.source, name), content);
  assert.deepEqual((await inspectDefinition(f.source)).roles[1].skill_sets, ['research-core']);
  for (const value of [['unknown'], ['research-core', 'research-core'], {}]) {
    manifest.roles[1].skill_sets = value; await writeFile(join(f.source, 'company/company.json'), JSON.stringify(manifest));
    await assert.rejects(inspectDefinition(f.source), code('invalid_skill_sets'));
  }
});

test('plan is read-only and accepts only the explicit reviewed set', async t => {
  const f = await fixture(t), before = await readdir(join(f.source, '.git'));
  const result = await projectSkills({...options(f.source), command: 'skills plan'});
  assert.deepEqual(result.skills.map(skill => skill.name), skillNames);
  assert.ok(result.skills.every(skill => skill.state === 'not_installed'));
  assert.deepEqual(await readdir(join(f.source, '.git')), before);
  await assert.rejects(lstat(join(f.source, '.agents')), {code:'ENOENT'});
  await assert.rejects(projectSkills({...options(f.source), skillSet:'../other'}), code('invalid_skill_sets'));
});

test('installation carries every resource/license and unchanged managed rerun is a no-op', async t => {
  const f = await fixture(t), result = await install(f.source), pack = await researchPack();
  assert.ok(result.applied && result.skills.every(skill => skill.state === 'intact'));
  for (const file of pack.files) assert.equal(sha(await readFile(join(f.source, '.agents/skills', file.path))), file.sha256);
  const record = join(f.source, '.git/paprika-inc/skill-packs.json'), before = await readFile(record);
  assert.equal((await install(f.source)).no_op, true);
  assert.deepEqual(await readFile(record), before);
  assert.equal(result.source_fallback, false);
  assert.equal((await lstat(record)).mode & 0o777, 0o600);
});

test('an unmanaged name conflicts even when its bytes equal the reviewed pack', async t => {
  const f = await fixture(t); await install(f.source);
  await rm(join(f.source, '.git/paprika-inc/skill-packs.json'));
  assert.ok((await status(f.source)).skills.every(skill => skill.state === 'unmanaged_conflict'));
  await assert.rejects(install(f.source), code('skill_install_conflict'));
});

for (const mutation of ['modified', 'extra', 'missing']) test(`managed ${mutation} files are preserved and installation refuses overwrite`, async t => {
  const f = await fixture(t); await install(f.source);
  const path = join(f.source, '.agents/skills/paper-lookup', mutation === 'extra' ? 'human-notes.md' : 'SKILL.md');
  if (mutation === 'missing') await rm(path); else await writeFile(path, 'User work.\n');
  assert.equal((await status(f.source)).skills[0].state, 'modified_conflict');
  await assert.rejects(install(f.source), code('skill_install_conflict'));
  if (mutation !== 'missing') assert.equal(await readFile(path,'utf8'), 'User work.\n');
});

for (const relative of ['.agents', '.agents/skills', '.agents/skills/paper-lookup']) test(`symlink target ${relative} is refused without writing outside project`, async t => {
  const f = await fixture(t), outside = join(f.base, 'outside'); await mkdir(outside);
  await mkdir(join(f.source, relative, '..'), {recursive:true}); await symlink(outside, join(f.source, relative));
  await assert.rejects(install(f.source), code('unsafe_skill_path'));
  assert.deepEqual(await readdir(outside), []);
});

test('a symlink inside a managed skill blocks integrity and cannot be followed', async t => {
  const f = await fixture(t); await install(f.source);
  const target = join(f.source,'.agents/skills/paper-lookup/SKILL.md'); await rm(target);
  await symlink(join(f.source,'AGENTS.md'), target);
  await assert.rejects(install(f.source), code('unsafe_skill_path'));
  assert.match(await readFile(join(f.source,'AGENTS.md'),'utf8'), /Existing user/);
});

test('partial failure preserves earlier successes and resumes only remaining selected skills', async t => {
  const f = await fixture(t);
  await assert.rejects(install(f.source, { beforeCommit: name => { if(name === 'literature-review') throw new Error('Injected I/O failure'); }}), error => error.code === 'partial_skill_install' && error.details.completed_skills.join() === 'paper-lookup');
  const partial = await status(f.source);
  assert.equal(partial.skills[0].state,'intact'); assert.equal(partial.skills[1].state,'not_installed');
  assert.ok(!(await readdir(join(f.source,'.agents/skills'))).some(name => name.startsWith('.inc-')));
  assert.ok((await install(f.source)).skills.every(skill => skill.state === 'intact'));
});

test('pending intent plus complete exact bytes recovers without replacing user files', async t => {
  const f = await fixture(t); await install(f.source);
  const path = join(f.source,'.git/paprika-inc/skill-packs.json'), record = JSON.parse(await readFile(path));
  Object.values(record.projects)[0].skills['paper-lookup'].state = 'pending'; await writeFile(path,JSON.stringify(record));
  assert.equal((await status(f.source)).skills[0].state,'recoverable');
  assert.equal((await install(f.source)).skills[0].state,'intact');
});

test('private installation lock blocks concurrent writers without timer takeover', async t => {
  const f = await fixture(t); await mkdir(join(f.source,'.git/paprika-inc/skill-install.lock'),{recursive:true});
  await assert.rejects(install(f.source), code('skill_install_busy'));
  await assert.rejects(lstat(join(f.source,'.agents')), {code:'ENOENT'});
});

test('worktrees resolve one private store while keeping distinct installation targets', async t => {
  const f = await fixture(t), worktree = join(f.base,'worktree');
  await git(f.source,'worktree','add','--detach',worktree);
  await install(f.source); await install(worktree);
  const state=JSON.parse(await readFile(join(f.source,'.git/paprika-inc/skill-packs.json')));
  assert.equal(Object.keys(state.projects).length,2);
  assert.ok((await status(worktree)).skills.every(skill => skill.state === 'intact'));
});

test('baseline analytical capabilities remain available without optional dependencies', () => {
  for (const name of skillNames) {
    const report=capabilityReport(name,probe);
    assert.ok(report.some(cap => cap.id === 'markdown_analysis' && cap.state === 'guidance_available'));
    assert.ok(report.filter(cap => /pdf|paid|parallel|scholar|schematics|full_text/.test(cap.id)).every(cap => cap.state === 'optional_feature_disabled'));
  }
  assert.equal(capabilityReport('scientific-critical-thinking',probe).find(cap => cap.id === 'critical_appraisal').network_required,false);
  assert.equal(capabilityReport('citation-management',probe).find(cap => cap.id === 'local_bibtex_formatting').state,'local_dependency_missing');
  const present={...probe,python3:{version:[3,11,0],requests:true},executables:{curl:true}};
  assert.equal(capabilityReport('citation-management',present).find(cap => cap.id === 'metadata_search_and_validation').state,'external_access_unverified');
});

test('local checks report only allowlisted credential presence, never values or access success', async () => {
  const key='OPENROUTER_API_KEY', prior=process.env[key]; process.env[key]='fixture-secret-must-never-be-serialized';
  try {
    const result=await probeCapabilities(); assert.equal(result.credential_presence[key],true);
    assert.ok(!JSON.stringify(result).includes(process.env[key]));
    assert.equal(result.network,'not_tested'); assert.equal(result.authentication,'not_tested'); assert.equal(result.packages_installed,false);
  } finally { if(prior === undefined) delete process.env[key]; else process.env[key]=prior; }
});

test('bundled missing or changed resources fail before target materialization', async t => {
  const f=await fixture(t), plugin=join(f.base,'kit'); await cp(new URL('../plugins/paprika-inc/',import.meta.url),plugin,{recursive:true});
  const resource=join(plugin,'runtime/skill-packs/research-core/paper-lookup/SKILL.md');
  for (const remove of [false,true]) {
    if(remove) await rm(resource); else await writeFile(resource,'Changed payload.');
    await assert.rejects(run(process.execPath,[join(plugin,'skills/paprika-inc/scripts/inc.mjs'),'skills','install','--repo',f.source,'--skill-set','research-core']), error => /skill_payload_changed|operation_failed/.test(error.stdout));
    await assert.rejects(lstat(join(f.source,'.agents')), {code:'ENOENT'});
  }
});

test('ordinary native onboarding carries selected role paths and validates report receipt separately from API readiness', async t => {
  const f=await fixture(t), path=join(f.source,'company/company.json'), manifest=JSON.parse(await readFile(path));
  manifest.roles[0].skill_sets=['research-core']; await writeFile(path,JSON.stringify(manifest,null,2)+'\n');
  await git(f.source,'add','.');await git(f.source,'commit','-m','Select research procedures');
  const digest=(await inspectDefinition(f.source)).definition_input_sha256;
  const senderEnv={CODEX_THREAD_ID:'fixture-research-sender'};
  const next=options=>nextBootstrap({messageContext:senderContext(senderEnv.CODEX_THREAD_ID),...options},senderEnv);
  const record=async (action,result) => recordBootstrap({repository:f.destination,actionId:action.action_id,deliveryActionId:action.delivery_action_id,hostResult:result});
  const first=await beginBootstrap({repository:f.source,destination:f.destination,expectedDigest:digest,roles:'organizer',hostCapabilities:capabilities()},senderEnv);
  await install(f.destination); await record(first,projectReport(f.destination));
  const create=await next({repository:f.destination});
  assert.equal(create.host_call.tool,'mcp__codex_app__create_thread');
  assert.match(create.host_call.arguments.prompt,/Wait for the sender/);
  const frozen=(await journal(f.destination)).roles[0].onboarding_body;
  assert.match(frozen,/\.agents\/skills\/paper-lookup\/SKILL.md/);
  assert.match(frozen,/optional_feature_disabled/);
  assert.match(frozen,/Do not run API calls/);
  await record(create,{threadId:'fictional-scientist',hostId:'local'});
  const membership=await next({repository:f.destination});await record(membership,membershipReport(f.destination,'fictional-scientist'));
  const deliveryContext={deployment:'https://example.invalid',board:'main',service_available:true,recipient_can_retrieve:true,
    service_tools:{post_message:'mcp__fixture__paprika_service_post_message',get_message:'mcp__fixture__paprika_service_get_message'},
    available_tools:['mcp__fixture__paprika_service_post_message','mcp__fixture__paprika_service_get_message'],subscriptions:[],
    sender:{id:'sender',label:'Sender',board:'main',thread_id:senderEnv.CODEX_THREAD_ID},
    recipient:{id:'scientist',label:'Scientist',board:'main',thread_id:'fictional-scientist'},
    native:{source:'read_thread',thread:{id:'fictional-scientist',kind:'codex',hostId:'local'}}};
  const store=await next({repository:f.destination,deliveryContext});
  assert.equal(store.host_call.arguments.body,frozen);
  await record(store,{message:{...store.host_call.arguments,id:'science-task',created_at:'2026-01-01T00:00:00Z'}});
  const notify=await next({repository:f.destination,deliveryContext});
  assert.ok(!notify.host_call.arguments.prompt.includes(frozen));
  await record(notify,{threadId:'fictional-scientist'});
  const wait=await next({repository:f.destination});await record(wait,{status:'completed'});
  const read=await next({repository:f.destination}), response=await readReport(f.destination,'organizer');
  // The old receipt alone cannot attest that selected skill sources/report were read.
  const blocked=await record(read,response); assert.equal(blocked.status,'onboarding_blocked');
  const state=await journal(f.destination),role=state.roles[0];
  const item=response.turns[0].items[0], receipt=JSON.parse(item.text.match(/```json\n([\s\S]*?)\n```/)[1]);
  receipt.sources_read.push(...role.skill_sources); receipt.skill_report_sha256=role.skill_report_sha256;
  item.text='```json\n'+JSON.stringify(receipt)+'\n```';
  const retry=await next({repository:f.destination});
  const installedPath=join(f.destination,'.agents/skills/paper-lookup/SKILL.md'), original=await readFile(installedPath);
  await writeFile(installedPath,'Changed after the prepared native read.');
  const changed=await record(retry,response);assert.equal(changed.status,'onboarding_blocked');
  assert.deepEqual(changed.roles[0].blockers,['skill_report_changed_since_request']);
  await writeFile(installedPath,original);
  const reconciled=await next({repository:f.destination});await record(reconciled,response);
  const result=await next({repository:f.destination});assert.equal(result.status,'ready');
  assert.equal(result.readiness_scope,'requested_roster_read_report_onboarding_only');
  assert.deepEqual(result.roles[0].skill_sets,['research-core']);
  assert.ok(result.roles[0].skill_report.skills.every(skill => skill.state === 'intact'));
});
