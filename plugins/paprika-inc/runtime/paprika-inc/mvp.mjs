import { authorCompany } from './authoring.mjs';
import { checkoutCompany } from './checkout.mjs';
import { beginBootstrap, nextBootstrap, recordBootstrap, bindBootstrapRole, bootstrapStatus } from './bootstrap.mjs';
import { projectSkills } from './skill-packs.mjs';
import { integrationCommand } from './integration-registry.mjs';
import { companyCatalogCommand } from './company-catalog.mjs';
import { modelCommand } from './model-profiles.mjs';

import {startOutbound,nextOutbound,recordOutbound,outboundStatus,reconcileOutbound} from './outbound.mjs';

export async function executeMvp(options) {
  const command = options.command;
  if (command.startsWith('models ')) return modelCommand(options);
  if (command.startsWith('catalog ') || command.startsWith('config ')) return companyCatalogCommand(options);
  if (command.startsWith('integrations ')) return integrationCommand(options);
  if(command.startsWith('message ')) return ({'message start':startOutbound,'message next':nextOutbound,
    'message record':recordOutbound,'message status':outboundStatus,'message reconcile':reconcileOutbound})[command](options);
  if (command.startsWith('skills ')) return projectSkills(options);
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
