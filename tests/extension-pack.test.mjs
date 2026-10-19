import test from 'node:test';
import assert from 'node:assert/strict';
import { cp, mkdir, readFile, writeFile, symlink } from 'node:fs/promises';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { fixture, blueprint } from './mvp-fixture.mjs';
import { sha } from '../plugins/paprika-inc/runtime/paprika-inc/skill-catalog.mjs';
import { sourceDigests } from '../plugins/paprika-inc/runtime/paprika-inc/integration-registry.mjs';

async function extension(t) {
  const f = await fixture(t);
  const runtime = join(f.base,'runtime');
  await cp(new URL('../plugins/paprika-inc/runtime',import.meta.url),runtime,{recursive:true});
  const root = join(runtime,'skill-packs/example-core');
  const skill='example-analysis';
  const payload={
    [skill+'/SKILL.md']:'---\nname: example-analysis\ndescription: Analyze fictional input.\n---\nUse only supplied input.\n',
    [skill+'/INC-PORTABILITY.md']:'Fictional fixture; creates no permissions.\n',
    [skill+'/LICENSE.upstream.md']:'Fictional MIT fixture.\n'
  };
  for(const [path,content] of Object.entries(payload)) {await mkdir(join(root,skill),{recursive:true});await writeFile(join(root,path),content);}
  const pack={schema_version:2,id:'example-core',skills:[skill],sources:{upstream:{kind:'git',url:'https://example.org/fixture',revision:'a'.repeat(40)}},
    files:Object.entries(payload).map(([path,bytes])=>({path,sha256:sha(bytes)})),
    capabilities:{[skill]:[{id:'analysis',kind:'guidance'},{id:'data-access',kind:'remote-tool'}]}};
  const catalogPath=join(runtime,'skill-packs/catalog.json');
  const catalog=JSON.parse(await readFile(catalogPath));
  async function save() {
    const bytes=JSON.stringify(pack,null,2)+'\n';
    await writeFile(join(root,'pack.json'),bytes);
    catalog.sets['example-core']={manifest_sha256:sha(bytes),source_digests:sourceDigests(pack.sources),skills:pack.skills};
    await writeFile(catalogPath,JSON.stringify(catalog));
  }
  await save();
  const module = name=>import(pathToFileURL(join(runtime,'paprika-inc',name+'.mjs')));
  return {...f,root,pack,catalog,catalogPath,save,module};
}

test('a data-only third pack participates in role authoring, installation, status and no-op recovery',async t=>{
  const f=await extension(t), {renderCompany}=await f.module('authoring'), {inspectDefinition}=await f.module('definition'), {projectSkills}=await f.module('skill-packs');
  const spec=blueprint();spec.roles[1].skill_sets=['example-core'];
  for(const [path,content] of Object.entries(renderCompany(spec))) await writeFile(join(f.source,path),content);
  assert.deepEqual((await inspectDefinition(f.source)).roles[1].skill_sets,['example-core']);
  const args={repository:f.source,skillSet:'engineering-core,example-core'};
  await assert.rejects(projectSkills({...args,command:'skills install',beforeCommit:name=>{if(name==='example-analysis') throw new Error('interruption');}}),err=>err.code==='partial_skill_install');
  const result=await projectSkills({...args,command:'skills install'});
  assert.ok(result.skills.every(skill=>skill.state==='intact'));
  const generic=result.skills.find(skill=>skill.name==='example-analysis');
  assert.equal(generic.capabilities[1].state,'requirements_unverified');
  assert.deepEqual(generic.source_digests,sourceDigests(f.pack.sources));
  assert.equal((await projectSkills({...args,command:'skills install'})).no_op,true);
  await writeFile(join(f.source,'.agents/skills/example-analysis/SKILL.md'),'Human edit.');
  await assert.rejects(projectSkills({...args,command:'skills install'}),err=>err.code==='skill_install_conflict');
});

test('extension source digests and inventory cannot be bypassed by changing only metadata',async t=>{
  const f=await extension(t),{skillPack}=await f.module('skill-catalog');
  await writeFile(join(f.root,'example-analysis/SKILL.md'),'Changed.');
  await assert.rejects(skillPack('example-core'),/digest mismatch/);
  const raw=await readFile(join(f.root,'example-analysis/SKILL.md'));
  f.pack.files[0].sha256=sha(raw);await f.save();
  // Rehashing a file is not enough to smuggle another discovery root into the inventory.
  f.pack.files.push({path:'example-analysis/nested/SKILL.md',sha256:'a'.repeat(64)});await f.save();
  await assert.rejects(skillPack('example-core'),/Unsafe/);
});

test('path traversal, case collisions, unselected files and cross-pack skill collisions are rejected',async t=>{
  const f=await extension(t),{skillPack,validateSkillSets}=await f.module('skill-catalog');
  const original=structuredClone(f.pack.files);
  for(const path of ['example-analysis/../secret.md','example-analysis/CON.md','example-analysis/a%2Fb.md','example-analysis/skill.md']){
    f.pack.files=[...original,{path,sha256:'a'.repeat(64)}];await f.save();
    await assert.rejects(skillPack('example-core'),/Unsafe/);
  }
  f.pack.files=original;await f.save();
  await writeFile(join(f.root,'example-analysis/unselected.md'),'Unselected');
  await assert.rejects(skillPack('example-core'),/Unselected/);
  f.catalog.sets['example-core'].skills=['paprika-code-review'];await writeFile(f.catalogPath,JSON.stringify(f.catalog));
  assert.throws(()=>validateSkillSets(['example-core']),/duplicate skill/);
});

test('extension source pins are mandatory and bundled symlinks are rejected',async t=>{
  const f=await extension(t),{skillPack}=await f.module('skill-catalog');
  const source=f.pack.sources.upstream;
  source.revision='main';assert.throws(()=>sourceDigests(f.pack.sources));
  source.revision='a'.repeat(40);
  const link=join(f.root,'example-analysis/linked');
  try {await symlink(join(f.root,'example-analysis'),link,process.platform==='win32'?'junction':'dir');}
  catch(error){if(error.code==='EPERM'){t.skip('Host does not permit file symlinks.');return;}throw error;}
  await assert.rejects(skillPack('example-core'),/symlinks/);
});
