import { selectServiceType } from '../messenger/select-service-type.mjs';
import { requireInput as check } from './errors.mjs';
import { semver } from './definition.mjs';

export const messengerBaseline = Object.freeze({ plugin_version: '1.6.0', service_version: '0.8.0',
  source_commit: '776efe80eb801ca850b64516c003325833157240', implementation: 'planning_only' });

// Observations are caller-supplied data, never authentication or live evidence.
// A future host adapter must obtain and independently verify the actual service.
export function assessService(report) {
  if (report === undefined) return { assessment: 'unknown', verification: 'unverified',
    next_step: 'Discover the selected owner-private service and inspect authenticated capabilities before considering provisioning.',
    provisioning_allowed: false, baseline: messengerBaseline };
  check(report !== null && typeof report === 'object' && !Array.isArray(report), 'invalid_service_report', 'Service report must be an object.');
  check(Object.keys(report).every(key => ['service_version', 'service_type', 'supported_clients'].includes(key)),
    'invalid_service_report', 'Service report accepts only service_version, service_type, and supported_clients; exclude credentials and transcripts.');
  check(typeof report.service_version === 'string' && semver.test(report.service_version),
    'invalid_service_report', 'Service report requires a semantic service_version from runtime metadata; package and Site publication versions are different.');
  check(['chatgpt-codex', 'dot-chatgpt-codex'].includes(report.service_type), 'invalid_service_report', 'Service report requires a recognized service_type.');
  check(Array.isArray(report.supported_clients) && report.supported_clients.every(client => typeof client === 'string'),
    'invalid_service_report', 'Service report requires supported_clients as a list of client names.');
  const selection = selectServiceType({ existing_service_type: report.service_type });
  const compatible = /^0\.8\.(0|[1-9]\d*)(?:\+[0-9A-Za-z.-]+)?$/.test(report.service_version) && report.supported_clients.includes('codex_local');
  return { assessment: compatible ? 'reported_compatible' : 'capability_review_required', verification: 'unverified',
    reported_version: report.service_version, preserved_service_type: selection.service_type,
    reuse_candidate: compatible, provisioning_allowed: false, baseline: messengerBaseline,
    next_step: 'Verify ownership, privacy, authentication, exact runtime capabilities and existing bindings; preserve the selected service, database, history and paused/off controls. Never downgrade or provision to repair an unverified report.' };
}
