import {build} from 'esbuild';
import {fixtureCall} from './fixture-provider.mjs';
import {createCatalogServer} from '../server.mjs';
await build({entryPoints:['test/harness.mjs'],outfile:'dist/harness.js',bundle:true,format:'esm'});
createCatalogServer({testHarness:true,call:fixtureCall}).listen(4317,'127.0.0.1');
