import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, writeFile, readFile, rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {catalog, plan, runCli} from '../plugins/paprika-inc/skills/paprika-explain/scripts/explain.mjs';
import {renderHtml, renderStoryboard} from '../plugins/paprika-inc/skills/paprika-explain/scripts/render.mjs';

const request = (extra = {}) => ({topic:'Queueing and latency', invocation:'explicit', intent:'understand', ui:{mode:'native',max_options:10}, ...extra});
const htmlSpec = () => ({title:'Latency explorer', summary:'Compare two illustrative workloads.', data_notice:'Illustrative precomputed scenarios, not measured service data.',
  sections:[{heading:'Why this happens',body:'When more work arrives than can finish, a queue grows.'}],
  scenarios:[{label:'Light load',explanation:'Requests can start promptly.',values:[{label:'Waiting requests',value:0}]},
    {label:'Heavy load',explanation:'Requests wait for capacity.',values:[{label:'Waiting requests',value:12}]}]});
const videoSpec = () => ({title:'Queueing explained',summary:'Show how work accumulates.',style:'Whiteboard',scenes:[
  {title:'Arrivals',duration_seconds:8,visual:'Dots enter a service station.',narration:'Work arrives over time.'},
  {title:'Waiting',duration_seconds:12,visual:'Extra dots wait beside a busy station.',narration:'Work waits when capacity is busy.'}]});

test('explicit invocation asks once, supplied format skips selection, and follow-ups retain format', () => {
  assert.equal(plan(request()).action,'choose');
  const combined = plan(request({requested:{format:'interactive',style:'eli5'}}));
  assert.equal(combined.action,'explain'); assert.deepEqual(combined.selection,{format:'interactive',style:'eli5'});
  const follow = plan(request({invocation:'implicit',intent:'clarify',previous:combined.selection}));
  assert.deepEqual(follow.selection,combined.selection);
  const simpler = plan(request({invocation:'implicit',previous:{format:'interactive'},requested:{style:'eli5'}}));
  assert.equal(simpler.selection.format,'interactive'); assert.equal(simpler.selection.style,'eli5');
  assert.equal(plan(request({previous:combined.selection,show_picker:true})).action,'choose');
});
test('contextual intents choose useful defaults without keyword matching unrelated content', () => {
  for (const [intent,format] of [['clarify','example'],['understand','layered'],['visual','diagram'],['explore','interactive']]) {
    const result = plan(request({invocation:'implicit',intent}));
    assert.equal(result.action,'explain'); assert.equal(result.selection.format,format);
  }
  assert.equal(plan(request({invocation:'implicit',intent:'unrelated',topic:'Fix a button labelled explain better'})).action,'not_applicable');
  assert.equal(plan({invocation:'implicit'}).action,'not_applicable');
  assert.equal(plan({invocation:'explicit'}).action,'needs_topic');
});
test('pending/preselected choices wait, cancellation stops, and only an actual answer resolves selection', () => {
  assert.equal(plan(request({choice:{status:'pending',id:'best_fit'}})).action,'waiting');
  assert.equal(plan(request({choice:{status:'cancelled'}})).action,'cancelled');
  assert.equal(plan({invocation:'explicit',choice:{status:'cancelled'}}).action,'cancelled');
  assert.equal(plan(request({choice:{status:'selected',id:'best_fit'}})).action,'explain');
  const custom = plan(request({choice:{status:'selected',selection:{format:'diagram',style:'eli5'}}}));
  assert.deepEqual(custom.selection,{format:'diagram',style:'eli5'});
  assert.throws(() => plan(request({choice:{status:'selected'}})),/Supply one/);
});
test('bounded native menus preserve every preset and text fallback does not hide choices', () => {
  const input = request({ui:{mode:'native',max_options:3}}), root = plan(input);
  assert.equal(root.recommended_id,'best_fit');
  const leaves = new Set();
  function visit(result) {
    assert.ok(result.options.length <= 3);
    for (const item of result.options) {
      if (item.id.startsWith('group:')) visit(plan({...input,choice:{status:'selected',id:item.id}}));
      else leaves.add(item.id);
    }
  }
  visit(root);
  assert.deepEqual([...leaves].sort(),catalog.presets.map(item=>item.id).sort());
  const fallback = plan(request({ui:{mode:'native',max_options:2}}));
  assert.equal(fallback.mode,'text'); assert.equal(fallback.options.length,10);
  assert.equal(plan(request({ui:{mode:'text'}})).options.length,10);
});
test('video style selection is bounded and concrete styles bypass a second question', () => {
  const input = request({requested:{format:'video'},ui:{mode:'native',max_options:3}}), initial = plan(input);
  assert.equal(initial.menu,'video_style');
  const ids = initial.options.flatMap(group => plan({...input,choice:{status:'selected',id:group.id}}).options.map(item=>item.id));
  assert.equal(ids.length,4);
  for (const id of ids) {
    const result = plan({...input,choice:{status:'selected',id}});
    assert.equal(result.action,'explain'); assert.equal(result.selection.video_style,id.slice(6));
  }
  assert.equal(plan(request({requested:{format:'video',video_style:'math'}})).action,'explain');
  const reused = plan(request({previous:{format:'video',video_style:'math'},show_picker:true,choice:{status:'selected',id:'video'}}));
  assert.equal(reused.action,'explain'); assert.equal(reused.selection.video_style,'math');
});
test('unknown selections and conflicting format/style inputs fail rather than quietly changing intent', () => {
  for (const extra of [{requested:{format:'invented'}},{requested:{format:'ste',style:'eli5'}},
    {requested:{format:'diagram',video_style:'math'}},{choice:{status:'selected',id:'group:invented'}},
    {choice:{status:'selected',id:'made_up'}},{ui:{mode:'native',max_options:0}}]) {
    assert.throws(()=>plan(request(extra)));
  }
});
test('HTML preserves meaningful fallback content and treats supplied markup only as data', () => {
  const spec = htmlSpec(), attack = '</script><script>globalThis.injected=true</script>';
  spec.title = attack; spec.scenarios[1].explanation = attack;
  const rendered = renderHtml(spec);
  assert.ok(!rendered.includes(attack));
  const embedded = rendered.match(/<script type="application\/json" id="scenario-data">(.*?)<\/script>/s)[1];
  assert.deepEqual(JSON.parse(embedded),spec.scenarios);
  assert.ok(rendered.includes('<noscript>')); assert.ok(rendered.includes('Waiting requests'));
  assert.throws(()=>renderHtml({...spec,sources:[{title:'Unsafe',url:'javascript:alert(1)'}]}));
  assert.throws(()=>renderHtml({...spec,scenarios:[spec.scenarios[0]]}));
  assert.throws(()=>renderHtml({...spec,expression:'execute arbitrary code'}));
});
test('storyboards retain narration, timing and honest artifact type', () => {
  const spec = videoSpec(), output = renderStoryboard(spec);
  assert.ok(output.includes('20 seconds')); assert.ok(output.includes(spec.scenes[1].narration));
  assert.ok(output.includes('not a rendered video'));
  spec.scenes[0].duration_seconds = -1; assert.throws(()=>renderStoryboard(spec));
});
test('CLI runs without a repository, writes both artifact types and never overwrites existing work', async t => {
  const directory = await mkdtemp(join(tmpdir(),'explanation-tools-'));
  t.after(()=>rm(directory,{recursive:true,force:true}));
  async function run(args) { let stdout=''; const code=await runCli(args,{write:value=>{stdout+=value;}}); return {code,value:JSON.parse(stdout)}; }
  const input=join(directory,'input.json'), html=join(directory,'lesson.html'), notes=join(directory,'storyboard.md');
  await writeFile(input,JSON.stringify(request({requested:{format:'eli5'}})));
  const planned=await run(['plan','--input',input]); assert.equal(planned.code,0); assert.equal(planned.value.selection.style,'eli5');
  await writeFile(input,JSON.stringify(htmlSpec()));
  const exported=await run(['render-html','--input',input,'--output',html]); assert.equal(exported.code,0);
  const original=await readFile(html,'utf8');
  assert.equal((await run(['render-html','--input',input,'--output',html])).code,2);
  assert.equal(await readFile(html,'utf8'),original);
  assert.equal((await run(['render-html','--input',input,'--output',join(directory,'wrong.js')])).code,2);
  await writeFile(input,JSON.stringify(videoSpec()));
  const story=await run(['storyboard','--input',input,'--output',notes]); assert.equal(story.code,0); assert.equal(story.value.rendered_video,false);
  assert.ok((await readFile(notes,'utf8')).includes('Work waits'));
  assert.equal((await run(['catalog'])).value.presets.length,10);
  await writeFile(input,'not json'); assert.equal((await run(['plan','--input',input])).code,2);
  assert.equal((await run(['plan','--input',input,'--input',input])).code,2);
  await writeFile(input,'x'.repeat(1024*1024+1)); assert.equal((await run(['plan','--input',input])).code,2);
});
