import { authorCompany } from './authoring.mjs';
import { checkoutCompany } from './checkout.mjs';
import { beginBootstrap, nextBootstrap, recordBootstrap, bindBootstrapRole, bootstrapStatus } from './bootstrap.mjs';

export async function executeMvp(options) {
  const command = options.command;
  if (command === 'author plan' || command === 'author write') return authorCompany({ ...options, write: command === 'author write' });
  if (command === 'checkout') {
    const result = await checkoutCompany({ source: options.repository, ...options });
    return { ok: true, command, read_only: false, applied: true, checkout_action: result.checkout_action,
      destination: result.root, revision: result.commit, repository_identity: result.repository_identity,
      definition_input_sha256: result.definition.definition_input_sha256, role_ids: result.definition.roles.map(role => role.id), live_roles_created: false };
  }
  if (command === 'bootstrap start') return beginBootstrap(options);
  if (command === 'bootstrap next') return nextBootstrap(options);
  if (command === 'bootstrap record') return recordBootstrap(options);
  if (command === 'bootstrap bind') return bindBootstrapRole(options);
  if (command === 'bootstrap status') return bootstrapStatus(options);
}
