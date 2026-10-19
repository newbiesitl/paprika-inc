import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
import {createServer} from 'node:http';
import {readFile} from 'node:fs/promises';
import {invoke} from './provider.mjs';
const root=new URL('./',import.meta.url),port=Number(process.env.PORT??4317);
export function createCatalogServer({call=invoke,testHarness=false}={}) {
 return createServer(async(req,res)=>{
  const url=new URL(req.url,'http://127.0.0.1');
  const host=req.headers.host;
  if(host!==`127.0.0.1:${port}`&&host!==`localhost:${port}`){res.writeHead(403);return res.end();}
  res.setHeader('X-Content-Type-Options','nosniff');
  res.setHeader('Cache-Control','no-store');
  try{
   if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/catalog.html')){
    res.setHeader('Content-Type','text/html; charset=utf-8');return res.end(await readFile(new URL('dist/catalog.html',root)));
   }
   if(testHarness&&req.method==='GET'&&url.pathname==='/harness'){
    res.setHeader('Content-Type','text/html; charset=utf-8');return res.end('<!doctype html><html lang="en"><title>Browser bridge fixture â€” not native host evidence</title><body><p>Browser bridge fixture â€” not native host evidence</p><iframe id="catalog-frame" title="Company catalog" style="width:100%;height:100vh;border:0"></iframe><script type="module" src="/harness.js"></script></body></html>');
   }
   if(testHarness&&req.method==='GET'&&url.pathname==='/harness.js'){res.setHeader('Content-Type','text/javascript');return res.end(await readFile(new URL('dist/harness.js',root)));}
   const operations=new Set(['list','read','validate','preview','export']);
   const op=url.pathname.startsWith('/api/')?url.pathname.slice(5):'';
   if(req.method!=='POST'||!operations.has(op)){res.writeHead(404);return res.end();}
   if(req.headers.origin&&req.headers.origin!=='http://'+host){res.writeHead(403);return res.end();}
   if(req.headers['content-type']!=='application/json'){res.writeHead(415);return res.end();}
   let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>262144){res.writeHead(413);return res.end();}}
   const args=JSON.parse(body||'{}');const result=await call(op,args);
   res.setHeader('Content-Type','application/json');res.end(JSON.stringify(result));
  }catch(error){res.writeHead(400,{'Content-Type':'application/json'});res.end(JSON.stringify({error:error.message}));}
 });
}
if(process.argv[1] && resolve(process.argv[1])===fileURLToPath(import.meta.url)) {
 createCatalogServer().listen(port,'127.0.0.1',()=>console.log('Catalog preview: http://127.0.0.1:'+port));
}
