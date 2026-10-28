const check = (condition, message) => { if (!condition) throw new Error(message); };
function text(value, name) {
  check(typeof value === 'string' && value.trim() && value.length <= 20000, `${name} needs nonempty text up to 20000 characters.`);
  return value;
}
function fields(value, allowed, name) {
  check(value && typeof value === 'object' && !Array.isArray(value), `${name} must be an object.`);
  check(Object.keys(value).every(key => allowed.includes(key)), `Unknown ${name} field.`);
}
const escape = value => String(value).replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
const json = value => JSON.stringify(value).replace(/[<>&\u2028\u2029]/g, character => '\\u' + character.charCodeAt(0).toString(16).padStart(4,'0'));
function sources(items = []) {
  check(Array.isArray(items) && items.length <= 50, 'Sources must be a list of at most 50 items.');
  return items.map(item => {
    fields(item, ['title','url'], 'source'); text(item.title, 'Source title'); text(item.url, 'Source URL');
    const url = new URL(item.url);
    check(['http:','https:'].includes(url.protocol) && !url.username && !url.password, 'Source URLs must be HTTP(S) without credentials.');
    return {title:item.title, url:url.href};
  });
}
export function renderHtml(spec) {
  fields(spec, ['title','summary','data_notice','control_label','sections','scenarios','sources'], 'HTML specification');
  text(spec.title, 'Title'); text(spec.summary, 'Summary'); text(spec.data_notice, 'Data notice');
  if (spec.control_label !== undefined) text(spec.control_label, 'Control label');
  const sections = spec.sections ?? [];
  check(Array.isArray(sections) && sections.length <= 30, 'Sections must be a list of at most 30 items.');
  for (const section of sections) { fields(section,['heading','body'],'section'); text(section.heading,'Section heading'); text(section.body,'Section body'); }
  check(Array.isArray(spec.scenarios) && spec.scenarios.length >= 2 && spec.scenarios.length <= 30, 'Provide 2–30 precomputed scenarios.');
  for (const scenario of spec.scenarios) {
    fields(scenario, ['label','explanation','values'], 'scenario'); text(scenario.label,'Scenario label'); text(scenario.explanation,'Scenario explanation');
    check(Array.isArray(scenario.values) && scenario.values.length <= 20, 'Scenario values must be a list of at most 20 items.');
    for (const value of scenario.values) {
      fields(value,['label','value'],'value'); text(value.label,'Value label');
      if (typeof value.value === 'number') check(Number.isFinite(value.value), 'Values must be finite.');
      else text(value.value,'Value');
    }
  }
  const refs = sources(spec.sources);
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; base-uri 'none'; form-action 'none'">
<title>${escape(spec.title)}</title><style>
:root{color-scheme:light;--ink:#172b4d;--accent:#245eb5}*{box-sizing:border-box}body{margin:0;background:#f2f5fa;color:var(--ink);font:18px/1.6 system-ui,sans-serif}main{max-width:800px;margin:auto;padding:44px 24px}h1{font-size:clamp(1.9rem,5vw,2.8rem);line-height:1.15;margin:8px 0 24px}h2{font-size:1.2rem}.eyebrow{font-size:.75rem;letter-spacing:.15em;font-weight:700}p{white-space:pre-wrap;overflow-wrap:anywhere}.panel,details{background:white;border:1px solid #ccd7e6;border-radius:14px;padding:22px;margin:24px 0}.controls{display:flex;gap:12px;align-items:end;flex-wrap:wrap}label{display:block;font-weight:650}select,button{font:inherit;padding:10px 14px;border:1px solid #8499b6;border-radius:8px;background:white;color:var(--ink);max-width:100%}select{width:100%}.select-wrap{flex:1;min-width:0}button{cursor:pointer;background:var(--accent);color:white}button:focus-visible,select:focus-visible,summary:focus-visible,a:focus-visible{outline:3px solid #cf6700;outline-offset:3px}dl{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px 16px}dt,dd{margin:0;overflow-wrap:anywhere}dd{font-weight:650}summary{cursor:pointer;font-weight:700}.notice,footer{font-size:.85rem;color:#4a607a}a{color:#245eb5;overflow-wrap:anywhere}@media(max-width:480px){main{padding:24px 16px}.panel,details{padding:16px}dl{grid-template-columns:1fr}dd{margin-bottom:8px}}@media(prefers-reduced-motion:reduce){*{scroll-behavior:auto}}
</style></head><body><main><div class="eyebrow">PAPRIKA · EXPLAIN</div><h1>${escape(spec.title)}</h1><p>${escape(spec.summary)}</p>
<section class="panel" aria-label="Explore scenarios"><div class="controls"><div class="select-wrap"><label for="scenario">${escape(spec.control_label ?? 'Choose a scenario')}</label><select id="scenario" aria-controls="result">${spec.scenarios.map((item,index) => `<option value="${index}">${escape(item.label)}</option>`).join('')}</select></div><button id="reset" type="button">Reset</button></div>
<div id="result" aria-live="polite" aria-atomic="true"><h2 id="scenario-title">${escape(spec.scenarios[0].label)}</h2><p id="explanation">${escape(spec.scenarios[0].explanation)}</p><dl id="values">${spec.scenarios[0].values.map(item => `<dt>${escape(item.label)}</dt><dd>${escape(item.value)}</dd>`).join('')}</dl></div><p class="notice">${escape(spec.data_notice)}</p></section>
${sections.map(section => `<details><summary>${escape(section.heading)}</summary><p>${escape(section.body)}</p></details>`).join('\n')}
${refs.length ? `<footer><h2>Sources</h2><ul>${refs.map(item => `<li><a href="${escape(item.url)}" rel="noreferrer">${escape(item.title)}</a></li>`).join('')}</ul></footer>` : ''}
<noscript><p>JavaScript is disabled. All scenarios are listed below.</p>${spec.scenarios.map(item => `<h2>${escape(item.label)}</h2><p>${escape(item.explanation)}</p><ul>${item.values.map(value => `<li>${escape(value.label)}: ${escape(value.value)}</li>`).join('')}</ul>`).join('')}</noscript>
</main><script type="application/json" id="scenario-data">${json(spec.scenarios)}</script><script>
const scenarios=JSON.parse(document.getElementById('scenario-data').textContent);
const chooser=document.getElementById('scenario');
function update(){const item=scenarios[Number(chooser.value)];document.getElementById('scenario-title').textContent=item.label;document.getElementById('explanation').textContent=item.explanation;const values=document.getElementById('values');values.replaceChildren();for(const value of item.values){const term=document.createElement('dt');term.textContent=value.label;const definition=document.createElement('dd');definition.textContent=String(value.value);values.append(term,definition);}}
chooser.addEventListener('change',update);document.getElementById('reset').addEventListener('click',()=>{chooser.value='0';update();chooser.focus();});
</script></body></html>\n`;
}
export function renderStoryboard(spec) {
  fields(spec, ['title','summary','style','scenes','sources'], 'storyboard');
  text(spec.title,'Title'); text(spec.summary,'Summary'); text(spec.style,'Style');
  check(Array.isArray(spec.scenes) && spec.scenes.length > 0 && spec.scenes.length <= 100, 'Provide 1–100 scenes.');
  let duration = 0;
  const scenes = spec.scenes.map((scene,index) => {
    fields(scene, ['title','duration_seconds','visual','narration'], 'scene');
    for (const key of ['title','visual','narration']) text(scene[key],key);
    check(Number.isFinite(scene.duration_seconds) && scene.duration_seconds > 0 && scene.duration_seconds <= 600, 'Each scene needs a duration from above zero to 600 seconds.');
    duration += scene.duration_seconds;
    return `## ${index + 1}. ${scene.title}\n\nDuration: ${scene.duration_seconds} seconds\n\nVisual: ${scene.visual}\n\nNarration / captions:\n\n${scene.narration}`;
  });
  const refs = sources(spec.sources);
  return `# ${spec.title}\n\nArtifact: storyboard and transcript — not a rendered video.\n\nStyle: ${spec.style}\n\nPlanned duration: ${duration} seconds\n\n${spec.summary}\n\n${scenes.join('\n\n')}\n${refs.length ? '\n## Sources\n\n' + refs.map(item => `- ${item.title}: ${item.url}`).join('\n') + '\n' : ''}`;
}
