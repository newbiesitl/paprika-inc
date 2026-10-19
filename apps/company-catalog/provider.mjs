import {integrationCommand} from '../../plugins/paprika-inc/runtime/paprika-inc/integration-registry.mjs';
import {renderCompany} from '../../plugins/paprika-inc/runtime/paprika-inc/authoring.mjs';
const operations=new Set(['list','read','validate','preview','export']);
function context(value) {
 if(value===undefined)return {schema_version:1};
 if(!value||Object.keys(value).some(k=>!['schema_version','host'].includes(k))||value.schema_version!==1||!['codex-local','chatgpt','standalone'].includes(value.host))throw new Error('Unsupported target host context.');
 return value;
}
// Thin transport adapter: catalog and validation remain owned by CAT-BE-01.
// Destination paths, when supplied, are local process configuration only.
export async function invoke(operation,args={}) {
 if(!operations.has(operation))throw new Error('Unsupported read-only catalog operation.');
 if(!args||Object.keys(args).some(k=>!['selection','query','kind','id','catalog_context'].includes(k))||JSON.stringify(args).length>262144)throw new Error('Invalid catalog request.');
 const backend=await import('../../plugins/paprika-inc/runtime/paprika-inc/company-catalog.mjs');
 const catalog=await backend.loadCompanyCatalog(),catalogContext=context(args.catalog_context);
 if(operation==='list') {
  const result=backend.readCompanyCatalog(catalog,{command:'catalog list',query:args.query});
  const registry=await integrationCommand({command:'integrations list'});
  return {...result,integrations:registry.integrations};
 }
 if(operation==='read')return backend.readCompanyCatalog(catalog,{command:'catalog read',catalogKind:args.kind,catalogId:args.id});
 const repository=process.env.PAPRIKA_CATALOG_REPO;
 const command=operation==='preview'&&!repository?'config export':'config '+operation;
 const result=await backend.configureCompany({catalog,selection:args.selection,catalogContext,command,repository});
 if(operation==='preview') {
  if(!repository&&result.blueprint){result.proposed_files=Object.entries(renderCompany(result.blueprint)).map(([path,content])=>({path,content}));delete result.blueprint;result.destination_state='not_inspected';result.command='config preview';}
  const assessment=await integrationCommand({command:'integrations check',integrationContext:catalogContext.host?{host:catalogContext.host}:{}});
  result.integration_assessments=assessment.integrations;
 }
 return result;
}
