import {readFile, open, writeFile} from 'node:fs/promises';
import {resolve, extname} from 'node:path';
import {pathToFileURL} from 'node:url';
import {renderHtml, renderStoryboard} from './render.mjs';

export const catalog = JSON.parse(await readFile(new URL('../references/catalog.json', import.meta.url), 'utf8'));
const formats = ['text', 'diagram', 'example', 'comparison', 'interactive', 'video', 'guided', 'layered'];
const styles = ['plain', 'ste', 'eli5'];
const groups = {
  root: ['best_fit', 'group:text', 'group:visual'],
  text: ['group:language', 'group:practice', 'group:depth'],
  language: ['ste', 'eli5'], practice: ['example', 'comparison'], depth: ['guided', 'layered'],
  visual: ['diagram', 'interactive', 'video'],
  video: ['group:animation', 'group:presentation'],
  animation: ['video:math', 'video:whiteboard'], presentation: ['video:slides', 'video:walkthrough'],
};
const groupLabels = {text:'Text and learning', visual:'Visual and media', language:'Language style',
  practice:'Examples and comparisons', depth:'Lessons and depth', video:'Video styles', animation:'Animation', presentation:'Presentations and walkthroughs'};
const routes = {
  text:['chat_markdown'], example:['chat_markdown', 'calculation_if_needed'],
  comparison:['chat_markdown'], guided:['chat_markdown'], layered:['chat_markdown'],
  diagram:['mermaid_or_svg', 'visual_inspection'],
  interactive:['interactive_html', 'browser_inspection'], video:['storyboard', 'video_renderer', 'media_inspection'],
};
const check = (condition, message) => { if (!condition) throw new Error(message); };
function object(value, fields, name) {
  check(value && typeof value === 'object' && !Array.isArray(value), `${name} must be an object.`);
  check(Object.keys(value).every(key => fields.includes(key)), `Unknown ${name} field.`);
}
function selection(value = {}) {
  object(value, ['format','style','video_style'], 'selection');
  const result = {...value};
  if (['ste','eli5'].includes(result.format)) {
    check(!result.style || result.style === result.format, 'Conflicting style selections.');
    result.style = result.format; result.format = 'text';
  }
  if (result.video_style && !result.format) result.format = 'video';
  check(!result.format || formats.includes(result.format), 'Unknown explanation format.');
  check(!result.style || styles.includes(result.style), 'Unknown explanation style.');
  check(!result.video_style || catalog.video_styles.some(item => item.id === result.video_style), 'Unknown video style.');
  check(!result.video_style || result.format === 'video', 'Video style requires video format.');
  check(Object.values(result).every(value => typeof value === 'string' && value.length > 0), 'Selection values must be nonempty strings.');
  return result;
}
function option(id) {
  if (id.startsWith('group:')) return {id, label:groupLabels[id.slice(6)], description:'Choose a format in this group.'};
  if (id.startsWith('video:')) {
    const item = catalog.video_styles.find(item => item.id === id.slice(6));
    return {id, label:item.label, description:item.description};
  }
  const item = catalog.presets.find(item => item.id === id);
  return {id, label:item.label, description:item.description};
}
export function menu(topic, ui = {}, group = 'root', topicKind = 'general') {
  check(['scientific','general'].includes(topicKind), 'Topic kind must be scientific or general.');
  object(ui, ['mode','max_options'], 'UI');
  check(ui.mode === undefined || ['native','text'].includes(ui.mode), 'UI mode must be native or text.');
  const max = ui.max_options ?? 10;
  check(Number.isInteger(max) && max >= 1 && max <= 100, 'UI option limit must be an integer from 1 to 100.');
  check(Object.hasOwn(groups, group), 'Unknown menu group.');
  const video = ['video','animation','presentation'].includes(group);
  const native = ui.mode === 'native' && max >= 3;
  const all = group === 'root' ? catalog.presets.map(item => item.id)
    : group === 'video' ? catalog.video_styles.map(item => `video:${item.id}`)
    : group === 'text' ? catalog.presets.filter(item => ['language','practice','depth'].includes(item.group)).map(item => item.id)
    : groups[group];
  const grouped = group === 'video' && topicKind === 'scientific'
    ? ['video:math', 'video:whiteboard', 'group:presentation'] : groups[group];
  const options = (native && all.length > max ? grouped : all).map(option);
  const recommended = topicKind === 'scientific' && options.some(item => item.id === 'video:math') ? 'video:math' : null;
  const recommendedId = group === 'root' ? 'best_fit' : recommended;
  return {action:'choose', menu:video ? 'video_style' : 'format', topic, mode:native ? 'native' : 'text', group,
    question:`How would you like me to explain ${topic}? Choose ${video ? 'a video style' : 'a preset'} or describe a combination.`,
    options, recommended_id:recommendedId, accepts_custom:true,
    text_menu:options.map((item, index) => `${index + 1}. ${item.label}${item.id === recommendedId ? ' (Recommended)' : ''} — ${item.description}`).join('\n'),
    requires_user_answer:true};
}

// The agent interprets the current user's intent in context. This planner never
// treats a keyword in a quote, document or code block as a user instruction.
export function plan(input) {
  object(input, ['topic','topic_kind','invocation','intent','requested','previous','show_picker','choice','ui'], 'request');
  const topicKind = input.topic_kind === undefined ? 'general' : input.topic_kind;
  check(['scientific','general'].includes(topicKind), 'Topic kind must be scientific or general.');
  check(['explicit','implicit'].includes(input.invocation), 'Invocation must be explicit or implicit.');
  check(input.intent === undefined || input.intent === 'unrelated' || catalog.intents.some(item => item.id === input.intent), 'Unknown explanation intent.');
  check(input.show_picker === undefined || typeof input.show_picker === 'boolean', 'show_picker must be boolean.');
  const choice = input.choice;
  if (choice !== undefined) {
    object(choice, ['status','id','selection'], 'choice');
    check(['pending','cancelled','selected'].includes(choice.status), 'Choice status is required.');
    if (choice.status !== 'selected') return {action:choice.status === 'pending' ? 'waiting' : 'cancelled', read_only:true};
  }
  const intent = catalog.intents.find(item => item.id === input.intent);
  if (input.invocation === 'implicit' && !intent && !input.show_picker) return {action:'not_applicable', read_only:true};
  check(input.topic === undefined || typeof input.topic === 'string', 'Topic must be text.');
  const topic = input.topic?.trim();
  if (!topic) return {action:'needs_topic', read_only:true};
  check(topic.length <= 2000, 'Keep the topic within 2000 characters.');
  const requested = selection(input.requested), previous = selection(input.previous);
  let selected = {...previous, ...requested};
  if (choice !== undefined) {
    check(Boolean(choice.id) !== Boolean(choice.selection), 'Supply one selected preset ID or a custom selection.');
    if (choice.selection) {
      selected = selection(choice.selection);
      check(selected.format || selected.style, 'A custom choice needs a format or style.');
      selected.format ??= 'text';
    } else {
      check(typeof choice.id === 'string', 'Choice ID must be text.');
      if (choice.id.startsWith('group:')) {
        const group = choice.id.slice(6);
        check(Object.hasOwn(groupLabels, group), 'Unknown selected group.');
        return {...menu(topic, input.ui, group, topicKind), read_only:true};
      }
      if (choice.id.startsWith('video:')) selected = selection({...selected, format:'video', video_style:choice.id.slice(6)});
      else {
        const preset = catalog.presets.find(item => item.id === choice.id);
        check(preset, 'Unknown selected preset.');
        if (preset.id !== 'best_fit') selected = {format:preset.format, style:preset.style ?? selected.style,
          ...(preset.format === 'video' && selected.video_style ? {video_style:selected.video_style} : {})};
      }
    }
  } else if (input.show_picker || (input.invocation === 'explicit' && !requested.format && !requested.style)) {
    return {...menu(topic, input.ui, 'root', topicKind), read_only:true};
  }
  selected.format ??= requested.style ? 'text' : intent?.default_format ?? 'layered';
  selected.style ??= 'plain';
  if (selected.format !== 'video') delete selected.video_style;
  if (selected.format === 'video' && !selected.video_style && topicKind === 'scientific') selected.video_style = 'math';
  if (selected.format === 'video' && !selected.video_style) return {...menu(topic, input.ui, 'video', topicKind), selection:selected, read_only:true};
  return {action:'explain', topic, selection:selected, goal:intent?.goal ?? 'Explain the topic in the selected format.',
    guidance:'references/formats.md', tool_guidance:'references/tools.md', tools:routes[selected.format], read_only:true};
}

async function readInput(path) {
  const handle = await open(path, 'r');
  try {
    check((await handle.stat()).isFile(), 'Input must be a regular JSON file.');
    const buffer = Buffer.alloc(1024 * 1024 + 1);
    let length = 0;
    while (length < buffer.length) {
      const {bytesRead} = await handle.read(buffer, length, buffer.length - length, null);
      if (!bytesRead) break;
      length += bytesRead;
    }
    check(length <= 1024 * 1024, 'Input must be at most 1 MiB.');
    return JSON.parse(new TextDecoder('utf-8', {fatal:true}).decode(buffer.subarray(0,length)).replace(/^\uFEFF/, ''));
  } finally { await handle.close(); }
}
export async function runCli(args = process.argv.slice(2), output = process.stdout) {
  try {
    const [command = 'help', ...rest] = args, options = {};
    for (let i = 0; i < rest.length; i += 2) {
      check(['--input','--output'].includes(rest[i]) && !Object.hasOwn(options, rest[i]), 'Unknown or duplicate option.');
      check(rest[i + 1] && !rest[i + 1].startsWith('--'), 'Option requires a value.');
      options[rest[i]] = rest[i + 1];
    }
    check(['help','catalog','plan','render-html','storyboard'].includes(command), 'Unknown command. Use help.');
    let result;
    if (command === 'help' || command === 'catalog') {
      check(!rest.length, 'This command takes no options.');
      result = command === 'catalog' ? catalog : {commands:['catalog','plan --input request.json','render-html --input explanation.json --output explanation.html','storyboard --input video.json --output storyboard.md'], installs_dependencies:false};
    } else {
      check(options['--input'], '--input is required.');
      const input = await readInput(options['--input']);
      if (command === 'plan') {
        check(!options['--output'], 'plan returns JSON and takes no --output.');
        result = plan(input);
      } else {
        check(options['--output'], '--output is required.');
        const destination = resolve(options['--output']);
        check(extname(destination).toLowerCase() === (command === 'render-html' ? '.html' : '.md'), 'Output extension does not match the artifact.');
        const content = command === 'render-html' ? renderHtml(input) : renderStoryboard(input);
        await writeFile(destination, content, {encoding:'utf8', flag:'wx'});
        result = {artifact:destination, type:command === 'render-html' ? 'interactive_html' : 'storyboard', rendered_video:false};
      }
    }
    output.write(JSON.stringify({ok:true, ...result}, null, 2) + '\n');
    return 0;
  } catch (error) {
    output.write(JSON.stringify({ok:false, error:error.code === 'EEXIST' ? 'Output already exists; choose a new path.' : error.message}) + '\n');
    return 2;
  }
}
if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) process.exitCode = await runCli();
