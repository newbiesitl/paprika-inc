// Refresh catalog identities without removing deliberate invalid/stale choices.
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { loadCompanyCatalog, catalogIdentity, configureCompany } from '../plugins/paprika-inc/runtime/paprika-inc/company-catalog.mjs';
const root = new URL('../tests/fixtures/company-catalog/', import.meta.url);
const catalog = await loadCompanyCatalog(), identity = catalogIdentity(catalog);
for (const name of await readdir(root)) {
  if (!name.endsWith('.json')) continue;
  const path = new URL(name, root), value = JSON.parse(await readFile(path, 'utf8'));
  if (name === 'response-examples.json') {
    for (const example of value) {
      example.request.selection.catalog = { ...identity,
        ...(example.id === 'stale-catalog' ? { sha256: '0'.repeat(64) } : {}) };
      example.response = await configureCompany({ catalog, ...example.request });
    }
  } else if (value.preset_id) {
    value.catalog = { ...identity, ...(name === 'stale-selection.json' ? { sha256: '0'.repeat(64) } : {}) };
  } else continue;
  await writeFile(path, JSON.stringify(value, null, 2) + '\n');
}
console.log('Updated fixture identities and response examples; deliberate failures retained.');
