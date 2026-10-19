import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { assessIntegrations, validateIntegrationRegistry, sourceDigests, integrationCommand } from '../plugins/paprika-inc/runtime/paprika-inc/integration-registry.mjs';
import { runCli } from '../plugins/paprika-inc/runtime/paprika-inc/cli.mjs';

const registry = () => ({ schema_version: 1, adapters: { skills: { description: 'Fictional skills', routes: [{host:'codex-local',mode:'native',requires:['plugin-skills']}] } },
  integrations: [{id:'example',title:'Example',adapter:'skills',sources:{upstream:{kind:'git',url:'https://example.org/repo',revision:'a'.repeat(40)}},license:'MIT',maturity:'curated',capabilities:['analysis'],requires:[],notes:[]}] });
const context = {host:'codex-local',capabilities:['plugin-skills']};

test('declarations never certify runtime, authentication or installation', () => {
  const result = assessIntegrations(registry(),context)[0];
  assert.equal(result.state,'declared-compatible');
  assert.equal(result.runtime_verified,false); assert.equal(result.authentication_verified,false); assert.equal(result.installed,false);
  assert.ok(assessIntegrations(registry())[0].reasons.includes('host-not-observed'));
  assert.ok(assessIntegrations(registry(),{host:'codex-local'})[0].reasons.includes('host-capabilities-missing'));
  assert.ok(assessIntegrations(registry(),{host:'chatgpt'})[0].reasons.includes('host-route-not-described'));
});
test('new adapter routes are data, unknown and inherited adapters remain pending', () => {
  const data = registry(); data.integrations[0].adapter = 'constructor';
  assert.ok(assessIntegrations(data,context)[0].reasons.includes('adapter-not-described'));
  data.adapters.constructor = data.adapters.skills;
  assert.equal(assessIntegrations(data,context)[0].state,'declared-compatible');
  data.adapters.constructor.routes[0].mode = 'wrapper-required';
  assert.ok(assessIntegrations(data,context)[0].reasons.includes('wrapper-required'));
});
test('missing pins, dependencies and cycles cannot appear ready', () => {
  const data = registry(); data.integrations[0].maturity='candidate';data.integrations[0].sources.upstream.revision=null;
  assert.deepEqual(assessIntegrations(data,context)[0].unpinned_sources,['upstream']);
  data.integrations[0].requires=['absent'];
  assert.ok(assessIntegrations(data,context)[0].reasons.includes('dependency-not-compatible'));
  data.integrations[0].requires=['example'];
  assert.throws(()=>validateIntegrationRegistry(data),/cycle/);
});
test('selection includes dependencies and rejects unknown or duplicate choices', async () => {
  const data=registry(); const dependency=structuredClone(data.integrations[0]);dependency.id='dependency';data.integrations.push(dependency);
  data.integrations[0].requires=['dependency'];
  assert.deepEqual(assessIntegrations(data,context,['example']).map(item=>item.id),['dependency','example']);
  assert.throws(()=>assessIntegrations(data,context,['absent']));
  assert.throws(()=>assessIntegrations(data,context,['example','example']));
  assert.deepEqual((await integrationCommand({command:'integrations list',spec:data,integrationIds:'dependency'})).integrations.map(item=>item.id),['dependency']);
});
test('invalid transport metadata, credentials and execution instructions are rejected', () => {
  for(const mutate of [
    data=>data.adapters.skills.routes.push(data.adapters.skills.routes[0]),
    data=>data.adapters.skills.routes[0].command='curl',
    data=>data.integrations[0].sources.upstream.url='https://user:secret@example.org/repo',
    data=>data.integrations[0].sources.upstream.url='https://example.org/repo?token=secret',
    data=>data.integrations[0].sources.upstream.revision='main',
    data=>data.integrations[0].sources.upstream.kind='shell',
    data=>data.integrations[0].requires=['x','x']
  ]) {const data=registry();mutate(data);assert.throws(()=>validateIntegrationRegistry(data));}
  const data=registry();data.integrations[0].sources={service:{kind:'service',url:'https://example.org/mcp'}};
  assert.equal(assessIntegrations(data,context)[0].state,'declared-compatible');
  assert.throws(()=>sourceDigests(data.integrations[0].sources));
});
test('bundled candidates and public commands work without a company checkout', async () => {
  const data=JSON.parse(await readFile(new URL('../plugins/paprika-inc/runtime/integrations/registry.json',import.meta.url)));
  assert.equal(data.integrations.length,13);
  assert.ok(assessIntegrations(data,context).every(item=>item.state==='requirements-pending'));
  let output='';
  assert.equal(await runCli(['integrations','check','--integrations','rdkit'],{write:text=>output+=text}),0);
  const result=JSON.parse(output);assert.equal(result.read_only,true);assert.equal(result.integrations[0].id,'rdkit');
});
