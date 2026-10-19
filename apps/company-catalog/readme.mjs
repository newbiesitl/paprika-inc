import {readFile,writeFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile(new URL('../../plugins/paprika-inc/runtime/company-catalog/catalog.json',import.meta.url)));
const entries=kind=>catalog.entries.filter(e=>e.kind===kind);
const safe=value=>String(value).replaceAll('|','\\|').replaceAll('\n',' ');
export function catalogSection() {
 const rows=entries('preset').filter(p=>p.availability!=='planned').map(p=>'| '+[p.label,p.version,p.availability,p.data.defaults.roles.length+' roles',p.data.defaults.structure_id].map(safe).join(' | ')+' |');
 const packs=entries('pack').filter(p=>p.availability!=='planned').map(p=>'| '+[p.label,p.version,(p.data.skills??[]).join(', ')].map(safe).join(' | ')+' |');
 return ['<!-- company-catalog:start -->','## Company catalog preview','',
 'Browse and configure a portable company draft in the [shared catalog UI](apps/company-catalog/README.md). One component supports a standalone local interface and an MCP App resource for supported native hosts. This candidate is not installed or deployed; actual Codex/ChatGPT rendering remains unverified.','',
 '| Starting template | Version | Catalog state | Default roster | Default structure |','| --- | --- | --- | --- | --- |',...rows,'',
 '**Organization structures:** '+entries('structure').map(e=>safe(e.label)).join(', ')+'. Industry and business-model tags are independent choices.','',
 '**Role templates:** '+entries('role').map(e=>safe(e.label)).join(', ')+'. Reporting lines and independent reviewers are configured separately.','',
 '| Available pack source | Version | Included guidance |','| --- | --- | --- |',...packs,'',
 'Pack source availability does not establish local installation, authentication, native-host verification, task-quality acceptance or release.','',
 '**Planned catalog entries:** '+catalog.entries.filter(e=>e.availability==='planned').map(e=>safe(e.label)).join(', ')+'. The broader [industry and integration roadmap](https://github.com/newbiesitl/paprika-inc/issues/30) is tracked separately.','',
 'Generated from the version '+catalog.version+' [backend catalog](plugins/paprika-inc/runtime/company-catalog/catalog.json); check with npm --prefix apps/company-catalog run readme:check.','<!-- company-catalog:end -->'].join('\n');
}
const path=new URL('../../README.md',import.meta.url),before=await readFile(path,'utf8'),block=catalogSection();
const pattern=/<!-- company-catalog:start -->[\s\S]*?<!-- company-catalog:end -->/;
const after=pattern.test(before)?before.replace(pattern,()=>block):before.trimEnd()+'\n\n'+block+'\n';
if(process.argv.includes('--check')){if(after!==before)throw new Error('README catalog drift: run node apps/company-catalog/readme.mjs');console.log('README matches canonical catalog.');}
else {await writeFile(path,after);console.log('Updated README from canonical catalog.');}
