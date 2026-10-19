import test from 'node:test';
import assert from 'node:assert/strict';
import {Client} from '@modelcontextprotocol/client';
import {createCatalogMcpServer,resourceUri} from '../mcp.mjs';
// Paired in-process transports keep protocol assertions independent of a live host.
function pair(){
 const a={start:async()=>{},close:async()=>{},send:async m=>queueMicrotask(()=>b.onmessage?.(m))};
 const b={start:async()=>{},close:async()=>{},send:async m=>queueMicrotask(()=>a.onmessage?.(m))};return [a,b];
}
test('MCP resource discovery, read-only tools and export are protocol-visible without installation',async()=>{
 const calls=[],server=createCatalogMcpServer({html:'<!doctype html><title>Catalog</title>',call:async(op,args)=>{calls.push({op,args});return {ok:true,read_only:true,applied:false};}});
 const client=new Client({name:'protocol-test',version:'1.0.0'}),[a,b]=pair();
 try{
  await server.connect(a);await client.connect(b);
  const {tools}=await client.listTools();const open=tools.find(t=>t.name==='company_catalog_open');
  assert.equal(open._meta.ui.resourceUri,resourceUri);assert.deepEqual(open._meta['openai/ui'].entrypoints,[{type:'thread'}]);
  assert(tools.every(t=>t.annotations.readOnlyHint));assert(!tools.some(t=>/write|install|bootstrap/.test(t.name)));
  const resource=await client.readResource({uri:resourceUri});assert.match(resource.contents[0].mimeType,/mcp-app/);
  const result=await client.callTool({name:'company_catalog_export',arguments:{selection:{schema_version:1}}});assert.equal(result.structuredContent.applied,false);
  assert.equal(calls.at(-1).op,'export');
  const invalid=await client.callTool({name:'company_catalog_export',arguments:{selection:{},repository:'private-path'}});assert.equal(invalid.isError,true);
 }finally{await client.close();await server.close();}
});
