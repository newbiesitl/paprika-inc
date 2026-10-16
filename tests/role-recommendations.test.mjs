import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { renderCompany } from '../plugins/paprika-inc/runtime/paprika-inc/authoring.mjs';
import { inspectDefinition } from '../plugins/paprika-inc/runtime/paprika-inc/definition.mjs';
import { fixture } from './mvp-fixture.mjs';

for (const profile of ['it-company','research-company']) test(profile+' suggestions render a generic company with independent release review',async t=>{
  const f=await fixture(t), path=new URL('../plugins/paprika-inc/skills/setup-paprika-inc/assets/'+profile+'-blueprint.json',import.meta.url);
  const spec=JSON.parse(await readFile(path,'utf8'));
  const files=renderCompany(spec);
  for(const [name,content] of Object.entries(files)){const target=join(f.source,name);await mkdir(dirname(target),{recursive:true});await writeFile(target,content);}
  const definition=await inspectDefinition(f.source), release=definition.roles.find(role=>role.id==='release-engineer');
  assert.ok(release);
  assert.deepEqual(release.skill_sets,['engineering-core']);
  const ownership=definition.ownership.entries.find(entry=>entry.owner_role==='release-engineer');
  assert.ok(ownership.reviewer_roles.length>0);
  assert.ok(ownership.reviewer_roles.every(id=>id!=='release-engineer'));
  assert.ok(!JSON.stringify(spec).includes('paprika-inc-development'));
  assert.match(release.text,/Review belongs to other roles/);
});
