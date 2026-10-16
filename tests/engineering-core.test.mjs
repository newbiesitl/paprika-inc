import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, lstat } from 'node:fs/promises';
import { join } from 'node:path';
import { projectSkills } from '../plugins/paprika-inc/runtime/paprika-inc/skill-packs.mjs';
import { skillPack, validateSkillSets, sha } from '../plugins/paprika-inc/runtime/paprika-inc/skill-catalog.mjs';
import { renderCompany } from '../plugins/paprika-inc/runtime/paprika-inc/authoring.mjs';
import { inspectDefinition } from '../plugins/paprika-inc/runtime/paprika-inc/definition.mjs';
import { fixture, blueprint } from './mvp-fixture.mjs';
const probe = { python3: {}, executables: {}, credential_presence: {}, network: 'not_tested' };
const run = (root, command, skillSet = 'engineering-core', extra = {}) => projectSkills({repository:root, command:'skills '+command, skillSet, ...extra});
const record = async root => Object.values(JSON.parse(await readFile(join(root,'.git/paprika-inc/skill-packs.json'))).projects)[0].skills;

test('both optional sets survive role authoring and reject duplicates or unknown names', async t => {
  const f=await fixture(t), spec=blueprint();
  spec.roles[1].skill_sets=['research-core','engineering-core'];
  const rendered=renderCompany(spec);
  for(const [path, content] of Object.entries(rendered)) await writeFile(join(f.source,path),content);
  assert.deepEqual((await inspectDefinition(f.source)).roles[1].skill_sets,spec.roles[1].skill_sets);
  for(const value of [['engineering-core','engineering-core'],['engineering-core','other'],['__proto__']])
    assert.throws(()=>validateSkillSets(value),error=>error.code==='invalid_skill_sets');
});

test('engineering guidance has two immutable sources and does not probe optional research dependencies', async t => {
  const f=await fixture(t), result=await run(f.source,'install');
  assert.equal(result.local_observations,null);
  assert.equal(result.skills.length,1);
  assert.equal(result.skills[0].state,'intact');
  assert.deepEqual(Object.keys(result.skills[0].source_commits),['karpathy_guidelines','ponytail']);
  assert.equal(result.skills[0].capabilities[0].efficacy,'not_benchmarked');
  assert.equal(result.skills[0].source_commit,undefined);
  assert.equal((await run(f.source,'install')).no_op,true);
});

test('adding engineering preserves existing research bytes and legacy journal provenance', async t => {
  const f=await fixture(t);
  await run(f.source,'install','research-core',{probe});
  const before=await record(f.source), research=await skillPack('research-core');
  assert.equal(research.manifest_sha256,'988d91a74704904dd08598ab5ca39d9b06018d52dddf5fece717f0cb7df4b101');
  const result=await run(f.source,'install','research-core,engineering-core',{probe});
  assert.equal(result.skills.length,5);
  assert.ok(result.skills.every(skill=>skill.state==='intact'));
  const after=await record(f.source);
  for(const name of research.skills) assert.deepEqual(after[name],before[name]);
  for(const file of research.files) assert.equal(sha(await readFile(join(f.source,'.agents/skills',file.path))),file.sha256);
  assert.equal((await run(f.source,'install','engineering-core,research-core',{probe})).no_op,true);
});

test('a conflict in the second pack prevents any new selected files', async t => {
  const f=await fixture(t), target=join(f.source,'.agents/skills/paprika-code-review');
  await mkdir(target,{recursive:true});await writeFile(join(target,'SKILL.md'),'Human owned.\n');
  await assert.rejects(run(f.source,'install','research-core,engineering-core',{probe}),error=>error.code==='skill_install_conflict');
  await assert.rejects(lstat(join(f.source,'.agents/skills/paper-lookup')),{code:'ENOENT'});
  assert.equal(await readFile(join(target,'SKILL.md'),'utf8'),'Human owned.\n');
});

test('mixed-pack interruption resumes without rewriting the already installed engineering skill', async t => {
  const f=await fixture(t), sets='engineering-core,research-core';
  await assert.rejects(run(f.source,'install',sets,{probe,beforeCommit:name=>{if(name==='paper-lookup') throw new Error('Injected failure');}}),
    error=>error.code==='partial_skill_install' && error.details.completed_skills.join()==='paprika-code-review');
  const before=(await record(f.source))['paprika-code-review'];
  assert.ok((await run(f.source,'install',sets,{probe})).skills.every(skill=>skill.state==='intact'));
  assert.deepEqual((await record(f.source))['paprika-code-review'],before);
});

test('a changed engineering source pin or local edit is a conflict, never silently adopted', async t => {
  const f=await fixture(t);await run(f.source,'install');
  const path=join(f.source,'.git/paprika-inc/skill-packs.json'), state=JSON.parse(await readFile(path));
  Object.values(state.projects)[0].skills['paprika-code-review'].source_commits.ponytail='a'.repeat(40);
  await writeFile(path,JSON.stringify(state));
  assert.equal((await run(f.source,'status')).skills[0].state,'managed_version_conflict');
  await assert.rejects(run(f.source,'install'),error=>error.code==='skill_install_conflict');
});
