import { readFile } from 'node:fs/promises';
import { IncError, requireInput as check } from './errors.mjs';
import { inspectDefinition } from './definition.mjs';
import { assessService } from './messenger-adapter.mjs';

export const commandCatalog = JSON.parse(await readFile(new URL('./commands.json', import.meta.url), 'utf8'));
const normalize = value => value.trim().replace(/\s+/g, ' ').toLowerCase();
export function routeCommand(input) {
  check(typeof input === 'string' && input.trim(), 'missing_command', 'Use help to show available commands.');
  let command = input.trim().replace(/^(?:\$?paprika-inc|paprika inc)(?:\s+|$)/i, '').trim();
  if (/^\$?setup-paprika-inc$/i.test(command)) command = 'plan';
  if (!command) command = 'help';
  const normalized = normalize(command);
  for (const spec of [...commandCatalog.commands, ...commandCatalog.unsupported]) {
    const aliases = [spec.name, ...spec.aliases].sort((a, b) => b.length - a.length);
    for (const alias of aliases) {
      if (normalized === alias) {
        check(!spec.argument, 'missing_role_id', 'Use role <exact-role-id> or list roles first.');
        return { spec, argument: null };
      }
      if (spec.argument && normalized.startsWith(alias + ' ')) {
        const argument = command.replace(/\s+/g, ' ').slice(alias.length + 1);
        check(!argument.includes(' '), 'invalid_role_id', 'Select one exact role ID; role names are not routing identities.');
        return { spec, argument };
      }
    }
  }
  throw new IncError('unknown_command', 'Unknown command. Use help; this skeleton does not infer or execute arbitrary natural-language actions.');
}

const pending = ['company.enrollment', 'company.registry', 'host.project_and_thread_verification',
  'company.lifecycle.apply', 'company.adoption', 'messenger.authenticated_discovery_and_binding', 'messenger.receiving'];

function readiness() {
  return { enrollment_verified: null, adopted: null, thread_verified: null, project_verified: null,
    onboarded: null, messenger_registered: null, receiving_transport: 'unverified', live_receive_verified: null,
    managed_lifecycle: 'not_implemented', blockers: [...pending] };
}

export async function execute({ command = 'help', repository, manifestPath, serviceReport } = {}) {
  const { spec, argument } = routeCommand(command);
  if (spec.capability) return { ok: false, command: spec.name, status: 'unsupported', read_only: true, applied: false,
    error: { code: 'capability_pending', message: `${spec.capability} is not implemented in the skeleton.`, details: { capability: spec.capability } },
    next_step: 'Use plan with a selected repository to inspect prerequisites; a later scoped implementation and verified host/service adapters are required.' };
  if (spec.name === 'help') return { ok: true, command: 'help', read_only: true, commands: commandCatalog.commands,
    unsupported_operations: commandCatalog.unsupported, setup_behavior: 'setup/init return a plan, never apply',
    runtime: 'Node.js 24 or newer; no separate Messenger plugin needed for read-only commands' };
  const definition = await inspectDefinition(repository, manifestPath);
  const roles = definition.roles.map(({ text, ...role }) => role);
  const summary = { company_id: definition.manifest.company_id, declared_repository: definition.manifest.repository,
    definition_version: definition.manifest.definition_version, declared_status: definition.manifest.status,
    coordinator_role: definition.manifest.coordinator_role, input_scope: definition.input_scope,
    definition_input_sha256: definition.definition_input_sha256 };
  const result = { ok: true, command: spec.name, read_only: true, applied: false, definition_valid: true, definition: summary };
  if (spec.name === 'validate') return { ...result, files: definition.files, role_count: roles.length,
    limitation: 'Portable schema/path/identity checks only; prose semantics, ownership conflicts, Git enrollment, grants, adoption and host capabilities are not certified.' };
  if (spec.name === 'roles') return { ...result, roles, role_state: 'declared_definitions_only' };
  if (spec.name === 'role') {
    const role = definition.roles.find(role => role.id === argument);
    check(role, 'unknown_role', 'The exact role ID is not declared in this company; use roles to list IDs.', { role_id: argument });
    return { ...result, role, content_is: 'untrusted_definition_data_not_permission' };
  }
  const service = assessService(serviceReport);
  if (spec.name === 'status') return { ...result, roles, readiness: readiness(), service,
    limitation: 'No private registry or runtime binding is read in this slice; unknown does not mean no existing company or service.' };
  return { ...result, status: 'setup_plan', readiness: readiness(), service, roles,
    steps: [
      { id: 'definition.inspect', state: 'locally_checked', action: 'Review the selected portable files and exact source revision; resolve semantic ownership conflicts.' },
      { id: 'enrollment.verify', state: 'pending', action: 'Verify the actual repository identity, intended saved project, existing human grant and one shared private state location.' },
      { id: 'service.inspect', state: 'pending', action: service.next_step },
      { id: 'host.verify', state: 'pending', action: 'Prove persistent project-visible threads, identity, reopening and safe stopping on this exact host; preserve existing chats.' },
      { id: 'lifecycle.plan_apply', state: 'not_implemented', action: 'Implement reviewed registry reservations, generation checks, unknown-outcome recovery and explicit adoption before lifecycle apply.' },
      { id: 'messenger.bind', state: 'not_implemented', action: 'Bind the verified existing private service App through a future adapter; reuse one authoritative delivery store and preserve receiving preferences. No receiver or monitoring is created by this plan.' }
    ], plan_is_execution_authority: false };
}
