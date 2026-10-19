import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { requireInput as check } from './errors.mjs';

export const integrationId = /^[a-z][a-z0-9-]{0,95}$/;
const sourceId = /^[a-z][a-z0-9_-]{0,95}$/;
const digest = /^[0-9a-f]{64}$/;
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim() && value.length <= 2048 && !/[\x00-\x1f]/.test(value);
const fail = (condition, message) => check(condition, 'invalid_integration_registry', message);
const fields = (value, allowed) => fail(object(value) && Object.keys(value).every(key => allowed.includes(key)), 'Unexpected integration metadata fields.');
const ids = value => Array.isArray(value) && value.length <= 100 && new Set(value).size === value.length && value.every(id => typeof id === 'string' && integrationId.test(id));
const url = value => {
  try { const parsed = new URL(value); return text(value) && parsed.protocol === 'https:' && !parsed.username && !parsed.password && !parsed.search && !parsed.hash; }
  catch { return false; }
};

// Sources describe reviewed inputs. They are never fetched, imported or executed.
export function validateIntegrationSources(sources, allowUnpinned = false) {
  fail(object(sources) && Object.keys(sources).length > 0 && Object.keys(sources).length <= 32, 'Declare between 1 and 32 sources.');
  for (const [key, source] of Object.entries(sources)) {
    fail(sourceId.test(key), 'Invalid source ID.');
    fields(source, ['kind', 'url', 'revision', 'sha256']);
    fail(['git', 'artifact', 'service'].includes(source.kind) && url(source.url), 'Sources require a public HTTPS identity without credentials, query or fragment.');
    if (source.kind === 'git') {
      fail(source.sha256 === undefined && (typeof source.revision === 'string' && /^[0-9a-f]{40}$/.test(source.revision) || allowUnpinned && source.revision == null), 'Git sources require an immutable commit; candidates may leave it unpinned.');
    } else if (source.kind === 'artifact') {
      fail(source.revision === undefined && (typeof source.sha256 === 'string' && digest.test(source.sha256) || allowUnpinned && source.sha256 == null), 'Artifacts require SHA256; candidates may leave it unpinned.');
    } else fail(allowUnpinned && source.revision === undefined && source.sha256 === undefined, 'Live services belong in compatibility metadata, not installed skill payloads.');
  }
  return sources;
}

export function sourceDigests(sources) {
  validateIntegrationSources(sources);
  return Object.fromEntries(Object.entries(sources).sort(([a], [b]) => a.localeCompare(b)).map(([id, source]) => [id,
    createHash('sha256').update(JSON.stringify(Object.fromEntries(Object.entries(source).sort(([a], [b]) => a.localeCompare(b))))).digest('hex')]));
}

export function validateIntegrationRegistry(registry) {
  fields(registry, ['schema_version', 'adapters', 'integrations']);
  fail(registry.schema_version === 1 && object(registry.adapters) && Object.keys(registry.adapters).length <= 100, 'Unsupported integration registry or adapter catalog.');
  for (const [id, adapter] of Object.entries(registry.adapters)) {
    fail(integrationId.test(id), 'Invalid adapter ID.');
    fields(adapter, ['description', 'routes']);
    fail(text(adapter.description) && Array.isArray(adapter.routes) && adapter.routes.length > 0 && adapter.routes.length <= 32, 'Adapters require a description and bounded routes.');
    const hosts = new Set();
    for (const route of adapter.routes) {
      fields(route, ['host', 'mode', 'requires']);
      fail(typeof route.host === 'string' && integrationId.test(route.host) && !hosts.has(route.host), 'Duplicate or invalid adapter host.');
      hosts.add(route.host);
      fail(['native', 'adaptation-required', 'wrapper-required'].includes(route.mode) && ids(route.requires), 'Invalid adapter route or capability requirements.');
    }
  }
  fail(Array.isArray(registry.integrations) && registry.integrations.length <= 500, 'Registry must contain at most 500 integrations.');
  const entries = new Map();
  for (const entry of registry.integrations) {
    fields(entry, ['id', 'title', 'adapter', 'sources', 'license', 'maturity', 'capabilities', 'requires', 'notes']);
    fail(typeof entry.id === 'string' && integrationId.test(entry.id) && !entries.has(entry.id), 'Duplicate or invalid integration ID.');
    fail(text(entry.title) && text(entry.license) && typeof entry.adapter === 'string' && integrationId.test(entry.adapter), 'Missing integration title, license observation or adapter.');
    fail(['candidate', 'curated'].includes(entry.maturity) && ids(entry.capabilities) && ids(entry.requires), 'Invalid maturity, capabilities or dependencies.');
    fail(Array.isArray(entry.notes) && entry.notes.length <= 20 && entry.notes.every(text), 'Notes must be bounded plain text.');
    validateIntegrationSources(entry.sources, true);
    if (entry.maturity === 'curated') {
      const immutable = Object.fromEntries(Object.entries(entry.sources).filter(([, source]) => source.kind !== 'service'));
      if (Object.keys(immutable).length) validateIntegrationSources(immutable);
    }
    entries.set(entry.id, entry);
  }
  const visited = new Set(), active = new Set();
  function visit(id) {
    fail(!active.has(id), 'Integration dependencies contain a cycle.');
    if (visited.has(id) || !entries.has(id)) return;
    active.add(id);
    for (const dependency of entries.get(id).requires) visit(dependency);
    active.delete(id); visited.add(id);
  }
  for (const id of entries.keys()) visit(id);
  return registry;
}

export function assessIntegrations(registry, context = {}, selection) {
  validateIntegrationRegistry(registry);
  fields(context, ['host', 'capabilities']);
  fail(context.host === undefined || typeof context.host === 'string' && integrationId.test(context.host), 'Invalid observed host ID.');
  fail(context.capabilities === undefined || ids(context.capabilities), 'Capabilities must be distinct observed capability IDs.');
  fail(selection === undefined || ids(selection) && selection.length > 0, 'Select distinct integration IDs.');
  const entries = new Map(registry.integrations.map(entry => [entry.id, entry]));
  fail(!selection || selection.every(id => entries.has(id)), 'Unknown selected integration.');
  const selected = new Set();
  function include(id) { if (selected.has(id) || !entries.has(id)) return; selected.add(id); for (const dependency of entries.get(id).requires) include(dependency); }
  for (const id of selection || entries.keys()) include(id);
  const assessed = new Map();
  function assess(id) {
    if (assessed.has(id)) return assessed.get(id);
    const entry = entries.get(id), adapter = Object.hasOwn(registry.adapters, entry.adapter) ? registry.adapters[entry.adapter] : undefined;
    const route = context.host && adapter?.routes.find(item => item.host === context.host);
    const reasons = [];
    if (!adapter) reasons.push('adapter-not-described');
    else if (!context.host) reasons.push('host-not-observed');
    else if (!route) reasons.push('host-route-not-described');
    const missing = route ? route.requires.filter(capability => !context.capabilities?.includes(capability)) : [];
    if (missing.length) reasons.push('host-capabilities-missing');
    if (entry.maturity !== 'curated') reasons.push('curation-pending');
    const unpinned = Object.entries(entry.sources).filter(([, source]) => source.kind === 'git' ? !source.revision : source.kind === 'artifact' ? !source.sha256 : false).map(([key]) => key);
    if (unpinned.length) reasons.push('source-pin-missing');
    const dependencies = entry.requires.map(dependency => ({ id: dependency, state: entries.has(dependency) ? assess(dependency).state : 'missing' }));
    if (dependencies.some(dependency => dependency.state !== 'declared-compatible')) reasons.push('dependency-not-compatible');
    if (route && route.mode !== 'native') reasons.push(route.mode);
    const result = { id, adapter: entry.adapter, declared_route: route || null,
      state: reasons.length ? 'requirements-pending' : 'declared-compatible', reasons,
      missing_capabilities: missing, unpinned_sources: unpinned, dependencies,
      runtime_verified: false, authentication_verified: false, installed: false };
    assessed.set(id, result); return result;
  }
  return [...selected].sort().map(assess);
}

export async function integrationCommand(options) {
  const registry = options.spec || JSON.parse(await readFile(new URL('../integrations/registry.json', import.meta.url), 'utf8'));
  validateIntegrationRegistry(registry);
  const results = assessIntegrations(registry, options.integrationContext, options.integrationIds?.split(','));
  return { ok: true, command: options.command, read_only: true, applied: false,
    registry_valid: true, compatibility_is: 'declared_requirements_only', integrations: options.command === 'integrations list' ? registry.integrations.filter(entry => results.some(result => result.id === entry.id)) : results,
    adapters: options.command === 'integrations list' ? registry.adapters : undefined,
    limits: ['No download, installation, command execution, network probe, authentication, host registration or permission change.', 'A declared route is not a tested connector; unknown adapters and missing observations remain pending.'] };
}
