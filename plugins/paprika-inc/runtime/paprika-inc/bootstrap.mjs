import { mkdir, readFile, writeFile, rename, realpath } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { randomUUID } from 'node:crypto';
import { checkoutCompany, inspectCheckout, git } from './checkout.mjs';
import { IncError, requireInput as check } from './errors.mjs';
import { projectSkills } from './skill-packs.mjs';
import { sha } from './skill-catalog.mjs';
import { requireNativeSenderPresentation, presentMessage, companyCommunicationGuidance } from './message-presentation.mjs';
import { readModelProfiles, resolveRoleModel } from './model-profiles.mjs';
import { readDocument } from './definition.mjs';

import {chooseDelivery,startOutbound,nextOutbound,recordOutbound} from './outbound.mjs';

const prefix = 'mcp__codex_app__';
export const requiredHostTools = ['list_projects', 'create_thread', 'list_threads', 'read_thread', 'wait_threads'].map(name => prefix + name);
const now = () => new Date().toISOString();

export function unwrapHostResult(raw) {
  check(raw && typeof raw === 'object' && !raw.isError, 'host_result_error', 'The native tool did not confirm success.');
  if (raw.structuredContent) return raw.structuredContent;
  if (Array.isArray(raw.content)) {
    for (const item of raw.content) if (item.type === 'text') {
      try { return JSON.parse(item.text); } catch { /* Some host tools return explanatory text. */ }
    }
    throw new IncError('host_result_error', 'Native tool data was unavailable; do not infer success from a message.');
  }
  return raw;
}

async function recordPath(root) {
  const common = resolve(root, await git(['rev-parse', '--git-common-dir'], root));
  return join(await realpath(common), 'paprika-inc', 'bootstrap-mvp.json');
}
async function save(root, state) {
  const path = await recordPath(root), folder = resolve(path, '..');
  await mkdir(folder, { recursive: true, mode: 0o700 });
  state.updated_at = now();
  const temporary = path + '.' + randomUUID() + '.tmp';
  await writeFile(temporary, JSON.stringify(state, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  await rename(temporary, path);
}
async function load(root) {
  let state, content;
  try { content = await readFile(await recordPath(root), 'utf8'); }
  catch (error) {
    if (error.code === 'ENOENT') throw new IncError('missing_bootstrap_record', 'No private MVP record exists for this checkout. Start an explicitly requested bootstrap first.');
    throw new IncError('invalid_bootstrap_record', 'The existing private record cannot be read; preserve and reconcile it before any creation.');
  }
  try { state = JSON.parse(content); }
  catch { throw new IncError('invalid_bootstrap_record', 'The existing private record is invalid; preserve and reconcile it before any creation.'); }
  check(state.format === 1 && state.mode === 'sequential_mvp' && Array.isArray(state.roles), 'invalid_bootstrap_record', 'The private bootstrap record is not a supported MVP record.');
  return state;
}
async function verifiedState(repository, checkInputs = true) {
  const root = await realpath(resolve(repository));
  const state = await load(root);
  check(root === state.destination, 'bootstrap_record_mismatch', 'This private record belongs to another destination.');
  const checkout = checkInputs ? await inspectCheckout(root, { revision: state.revision, expectedDigest: state.definition_digest, manifestPath: state.manifest_path }) : null;
  check(!checkout || checkout.repository_identity === state.repository_identity,
    'bootstrap_record_mismatch', 'This private record belongs to another checkout/destination.');
  if (checkInputs && state.model_profiles_source) {
    const profile = await readDocument(root, state.model_profiles_source.path);
    check(profile.sha256 === state.model_profiles_source.sha256, 'model_profiles_changed', 'Pinned model defaults changed; reconcile pending actions before adopting different settings.');
  }
  return { root, state };
}

export function bootstrapSummary(state) {
  return { ok: true, command: 'bootstrap status', status: state.phase, read_only: true, applied: false,
    readiness_scope: 'requested_roster_read_report_onboarding_only',
    revision: state.revision, definition_input_sha256: state.definition_digest, destination: state.destination,
    project_id: state.project_id, host_id: 'local', roles: state.roles.map(role => ({ role_id: role.id, thread_id: role.thread_id,
      status: role.phase, project_verified: role.project_verified, thread_verified: role.thread_verified,
      onboarded: role.phase === 'ready', blockers: role.blockers, skill_sets: role.skill_sets || [], skill_report: role.skill_report || null,
      skill_report_sha256: role.skill_report_sha256 || null, skill_sources: role.skill_sources || [], model_settings: role.model_settings || null })),
    as_of: state.updated_at, evidence: 'recorded_native_tool_results_not_live_rechecked',
    limits: { one_user_bootstrap_at_a_time: true, singleton_enforced: false, concurrency_safe: false, background_receiving: false, automatic_adoption: false } };
}

export async function beginBootstrap(options, env = process.env) {
  const capabilities = options.hostCapabilities;
  const available = Array.isArray(capabilities?.tools) ? capabilities.tools : [];
  const missing = requiredHostTools.filter(tool => !available.includes(tool));
  if (capabilities?.execution_mode !== 'codex_local' || missing.length) return { ok: false, command: 'bootstrap start', status: 'local_host_handoff', applied: false,
    missing_capabilities: missing, next_step: 'Open the selected target in local Codex with the supported persistent project-chat tools and resume there. No cloud/ephemeral substitute or clone was performed.' };
  check(options.roles === undefined || typeof options.roles === 'string', 'invalid_requested_roster', 'Requested roles must be an explicit comma-separated list of role IDs.');
  check(Boolean(options.initialRole) === Boolean(options.initialThreadId), 'invalid_initial_binding', 'An initial binding needs both the chosen role and its actual native chat ID.');
  const checkout = await checkoutCompany({ source: options.repository, destination: options.destination, revision: options.revision,
    expectedDigest: options.expectedDigest, manifestPath: options.manifestPath });
  check(checkout.definition.ownership, 'ownership_required', 'MVP bootstrap needs a canonical ownership map in the selected revision. Author, commit and publish it first.');
  const requested = options.roles ? options.roles.split(',').map(id => id.trim()) : checkout.definition.roles.map(role => role.id);
  check(requested.length > 0 && new Set(requested).size === requested.length && requested.every(id => checkout.definition.roles.some(role => role.id === id)),
    'invalid_requested_roster', 'Select distinct role IDs from the validated definition; omitted --roles means the defined roster.');
  const profiles = await readModelProfiles(checkout.root, checkout.definition, options.manifestPath, options.modelProfilesPath);
  const modelSettings = new Map();
  if (profiles) {
    const document = await readDocument(checkout.root, profiles.source.path);
    let committed;
    try { committed = await git(['show', `${checkout.commit}:${profiles.source.path}`], checkout.root); } catch { /* Missing/untracked profiles cannot control creation. */ }
    check(committed?.replace(/\r\n?/g, '\n').trim() === document.text.trim(), 'unpublished_model_profiles', 'Commit and publish the selected role model defaults before native provisioning.');
    const overrides = capabilities.model_overrides ?? {};
    check(overrides && typeof overrides === 'object' && !Array.isArray(overrides) && Object.keys(overrides).every(id => requested.includes(id)), 'invalid_model_context', 'Model overrides must name only requested roles.');
    for (const id of requested) {
      const settings = resolveRoleModel(profiles, id, { schema_version: 1, company_id: profiles.company_id, role_id: id,
        ...(Object.hasOwn(overrides, id) ? { current_override: overrides[id] } : {}), ...(capabilities.models === undefined ? {} : { models: capabilities.models }) });
      if (!(id === options.initialRole && options.initialThreadId)) check(settings.availability.usable,
        settings.availability.state === 'unverified' ? 'model_catalog_required' : settings.availability.state,
        'The configured model/effort needs current host support; no global-model substitution is allowed.', { role_id: id, model: settings.model, reasoning_effort: settings.reasoning_effort });
      modelSettings.set(id, settings);
    }
  }
  check(!options.initialThreadId || (options.initialRole && requested.includes(options.initialRole) && available.includes(prefix + 'send_message_to_thread')),
    'invalid_initial_binding', 'An existing initial chat needs an explicit requested role and the native scoped onboarding tool.');
  let state;
  try { state = await load(checkout.root); }
  catch (error) { if (error.code !== 'missing_bootstrap_record') throw error; }
  if (state) {
    check(!profiles || state.model_profiles_source?.sha256 === profiles.source.sha256,
      'model_profile_adoption_required', 'This existing bootstrap did not freeze these model defaults. Preserve its bindings and deliberately reconcile adoption; no chat settings were changed.');
    check(state.destination === checkout.root && state.repository_identity === checkout.repository_identity && state.revision === checkout.commit &&
      state.definition_digest === checkout.definition.definition_input_sha256 && JSON.stringify(state.roles.map(role => role.id)) === JSON.stringify(requested),
    'bootstrap_record_conflict', 'The existing private record has different inputs/roster. Inspect it deliberately; do not recreate or replace its bindings.');
    check(!state.pending_action || !['create', 'onboard'].includes(state.pending_action.kind), 'creation_unresolved', 'A host submission is unresolved. Inspect/bind its confirmed chat before another create or send.');
    state.phase = 'discover_project';
    if (options.projectId) state.selected_project_id = options.projectId;
    if (options.initialThreadId) check(state.roles.find(role => role.id === options.initialRole)?.thread_id === options.initialThreadId,
      'binding_conflict', 'The requested initial chat differs from the existing private role binding.');
    state.pending_action = null;
    for (const role of state.roles) {
      role.project_verified = false;
      role.thread_verified = false;
      if (role.thread_id) role.phase = 'verify_membership';
    }
  } else {
    const ownershipPath = checkout.definition.manifest.ownership;
    state = { format: 1, mode: 'sequential_mvp', bootstrap_id: randomUUID(), revision: checkout.commit,
      definition_digest: checkout.definition.definition_input_sha256, repository_identity: checkout.repository_identity,
      model_profiles_source: profiles?.source ?? null,
      destination: checkout.root, manifest_path: options.manifestPath || 'company/company.json', company_id: checkout.definition.manifest.company_id,
      ownership_path: ownershipPath, ownership_sha256: checkout.definition.files.find(file => file.path === ownershipPath).sha256,
      phase: 'discover_project', project_id: null, selected_project_id: options.projectId ?? null, pending_action: null, created_at: now(),
      roles: requested.map(id => {
        const role = checkout.definition.roles.find(role => role.id === id), initial = options.initialRole === id && options.initialThreadId;
        return { id, version: role.version, definition: role.definition, contract_sha256: role.sha256, request_id: randomUUID(), skill_sets: role.skill_sets,
          thread_id: initial || null, phase: initial ? 'verify_membership' : 'pending', onboarding_submitted: false,
          project_verified: false, thread_verified: false, blockers: [], model_settings: modelSettings.get(id) ?? null };
      }) };
  }
  state.delivery_policy ??= options.deliveryPolicy;
  await save(checkout.root, state);
  return { ...await nextBootstrap({ repository: checkout.root, messageContext: options.messageContext, deliveryContext:options.deliveryContext, deliveryPolicy:options.deliveryPolicy }, env), checkout_action: checkout.checkout_action };
}

function onboardingPrompt(state, role) {
  return `The human requested this roster's local MVP bootstrap. This assignment is READ/REPORT ONLY, not implementation dispatch or a permission expansion. Respect existing human and host instructions.\n\n` +
    `Selected checkout: ${state.destination}\nPinned revision: ${state.revision}\nRole: ${role.id} / ${role.version}\n` +
    `Read ${state.manifest_path}, ${state.ownership_path}, and ${role.definition}, plus applicable shared instructions. Ownership is canonical only in ${state.ownership_path}. Do not write files, create chats, deploy, subscribe, message others or perform arbitrary implementation work.\n\n` +
    (role.skill_report ? `Selected skill sets: ${JSON.stringify(role.skill_sets)}. Read these installed skill/portability paths too: ${JSON.stringify(role.skill_sources)}. Local installation/capability observations: ${JSON.stringify(role.skill_report)}. Report missing installation, missing dependencies, unsupported cross-skill routes and unverified external access separately. Optional research PDF/paid/figures/Scholar routes remain disabled. Engineering guidance needs no external service. Do not run API calls, helpers or review assignments during onboarding. Installation does not certify native discovery, research readiness or review quality. Include skill_report_sha256=${role.skill_report_sha256} in the receipt to identify the report you reviewed.\n\n` : '') +
    companyCommunicationGuidance + '\n\n' +
    `Report responsibilities, ownership, boundaries, inputs/outputs, review relationships and blockers in this chat. Then return one JSON object in a fenced JSON block with: request_id=${role.request_id}, role_id=${role.id}, role_version=${role.version}, source_revision=${state.revision}, contract_sha256=<computed SHA256 of the role file>, ownership_sha256=<computed SHA256 of the ownership map>, sources_read=<relative source paths actually read>, state=ready or blocked, blockers=<array>. Expected contract hash ${role.contract_sha256}; ownership hash ${state.ownership_sha256}. A response is not adoption or new authority. The caller independently checks native project/host/cwd evidence.`;
}

async function actionOutput(state, action, messageContext, env = process.env, deliveryContext, deliveryPolicy, retryStorage = false) {
  const role = state.roles.find(role => role.id === action.role_id);
  let tool, args;
  if (['create','onboard'].includes(action.kind) && !action.host_call) {
    role.onboarding_body ??= onboardingPrompt(state,role);
    role.onboarding_policy ??= chooseDelivery(role.onboarding_body, deliveryPolicy ?? state.delivery_policy);
    action.delivery_policy ??= role.onboarding_policy;
    if (action.delivery_policy.mode === 'reference') {
      if (action.kind === 'create') { action.bootstrap_only = true; role.bootstrap_only = true; }
      else {
        action.delivery_operation_id ??= 'bootstrap-' + action.id;
        await startOutbound({repository:state.destination,deliveryInput:{request_id:action.delivery_operation_id,body:role.onboarding_body,
          topic:'Read/report onboarding',delivery_policy:{short_message_limit:action.delivery_policy.short_message_limit,force_reference:action.delivery_policy.force_reference}}},env);
        if (deliveryContext?.recipient?.thread_id !== role.thread_id) return {ok:false,status:'delivery_setup_required',action_id:action.id,
          detail:'Resolve the already verified role chat on the selected existing service; do not create a duplicate recipient or inline the large task.'};
        const output=await nextOutbound({repository:state.destination,operationId:action.delivery_operation_id,deliveryContext,messageContext,retryStorage},env);
        return {...output,action_id:action.id,delivery_action_id:output.action_id,role_id:role.id,delivery_operation_id:action.delivery_operation_id};
      }
    }
  }
  if (action.kind === 'projects') { tool = 'list_projects'; args = {}; }
  if (action.kind === 'create') { tool = 'create_thread'; args = { title: `${state.company_id} · ${role.id}`,
    ...(role.model_settings ? role.model_settings.native_parameters : {}),
    target: { type: 'project', projectId: state.project_id, environment: { type: 'local' } }, prompt: action.bootstrap_only ? 'READ/REPORT ONLY bootstrap. The human requested this persistent role chat. Wait for the sender to provide one confirmed Messenger board/message reference after verifying this chat and its recipient address. Do not start onboarding, implement work, message others or create subscriptions. Ownership is canonical only in the later pinned read/report assignment. If no retrievable assignment arrives, report onboarding pending.' : role.onboarding_body }; }
  if (action.kind === 'membership') { tool = 'list_threads'; args = {}; }
  if (action.kind === 'onboard') { tool = 'send_message_to_thread'; args = { threadId: role.thread_id, hostId: 'local', prompt: role.onboarding_body }; }
  if (action.kind === 'wait') { tool = 'wait_threads'; args = { targets: [{ threadId: role.thread_id, hostId: 'local' }], timeoutMs: 10000 }; }
  if (action.kind === 'read') { tool = 'read_thread'; args = { threadId: role.thread_id, hostId: 'local', turnLimit: 1, includeOutputs: false, maxOutputCharsPerItem: 8000 }; }
  if (['create', 'onboard'].includes(action.kind) && !action.host_call) {
    let presentation;
    try { presentation = requireNativeSenderPresentation({ context: messageContext, product: 'Paprika Inc', pluginNames: ['paprika-inc'], senderThreadId: env.CODEX_THREAD_ID }); }
    catch(error) { return {ok:false,status:error.code,detail:error.message}; }
    args.prompt = presentMessage(args.prompt, presentation, { recipientLabel: role.id, recipientRole: role.id });
    action.presentation = presentation;
    action.host_call = { tool: prefix + tool, arguments: args };
  }
  return { ok: true, command: 'bootstrap next', status: 'host_action', action_id: action.id, role_id: action.role_id ?? null,
    read_only: false, applied: true, completed: false, native_action_executed_by_helper: false,
    host_call: action.host_call || { tool: prefix + tool, arguments: args }, presentation: action.presentation || null, call_once: ['create', 'onboard'].includes(action.kind),
    next_step: 'Invoke this supported host tool under the existing user bootstrap request, then record its actual result with this action ID. Do not fabricate tool results.' };
}

export async function nextBootstrap({ repository, messageContext, deliveryContext, deliveryPolicy, retryStorage }, env = process.env) {
  const { root, state } = await verifiedState(repository);
  for (const role of state.roles.filter(role => role.skill_sets?.length && role.phase !== 'ready')) {
    const report = await projectSkills({ repository: root, command: 'skills status', roles: role.id, manifestPath: state.manifest_path });
    role.skill_report = { skills: report.skills, local_observations: report.local_observations, limits: report.limits };
    role.skill_report_sha256 = sha(JSON.stringify(role.skill_report));
    role.skill_sources = report.skills.filter(skill => skill.state === 'intact').flatMap(skill => [skill.path + '/SKILL.md', skill.path + '/INC-PORTABILITY.md']);
  }
  if (state.pending_action) {
    if (state.pending_action.delivery_operation_id) {
      const output=await actionOutput(state,state.pending_action,messageContext,env,deliveryContext,deliveryPolicy,retryStorage);
      if(['submitted','stored_events_only'].includes(output.status)) {
        const role=state.roles.find(role=>role.id === state.pending_action.role_id);
        role.onboarding_submitted=true; role.phase='awaiting_onboarding'; state.pending_action=null;
      }
      await save(root,state); return output;
    }
    if (['create', 'onboard'].includes(state.pending_action.kind)) return { ok: false, command: 'bootstrap next', status: 'submission_unresolved', action_id: state.pending_action.id,
      next_step: 'The write was prepared before native submission. Its outcome is unresolved; inspect native records and explicitly bind the confirmed chat. Do not blindly issue it again.' };
    return actionOutput(state, state.pending_action);
  }
  let kind, role;
  if (['discover_project', 'awaiting_project'].includes(state.phase)) kind = 'projects';
  else {
    role = state.roles.find(role => role.phase !== 'ready');
    if (!role) { state.phase = 'ready'; await save(root, state); return bootstrapSummary(state); }
    if (['creation_unresolved', 'onboarding_submission_unresolved'].includes(role.phase)) return { ...bootstrapSummary(state), ok: false, status: role.phase,
      next_step: 'Inspect the exact existing native chat/project evidence, then resume or explicitly bind it. No replacement role was created.' };
    kind = role.phase === 'pending' ? 'create' : ['verify_membership', 'membership_blocked'].includes(role.phase) ? 'membership' : !role.onboarding_submitted ? 'onboard' : ['read_onboarding', 'onboarding_blocked'].includes(role.phase) ? 'read' : 'wait';
  }
  const action = { id: randomUUID(), kind, role_id: role?.id ?? null };
  const output = await actionOutput(state, action, messageContext, env, deliveryContext, deliveryPolicy, retryStorage);
  // Missing sender observations have not prepared a native write. Keep the
  // operation resumable instead of turning that read requirement into uncertainty.
  if (output.status === 'host_action' || action.delivery_operation_id) state.pending_action = action;
  await save(root, state); // Persist before exposing a create/send action, including on crash.
  return output;
}

function receiptFromThread(result) {
  const turn = result.turns?.[0];
  if (!turn || turn.status !== 'completed') return null;
  const finals = (turn.items ?? []).filter(item => item.type === 'agentMessage' && item.phase === 'final' && typeof item.text === 'string');
  const text = finals.at(-1)?.text;
  if (!text) return null;
  try { return JSON.parse(text.match(/```json\s*([\s\S]*?)```/i)?.[1] ?? text); }
  catch { return null; }
}

export async function recordBootstrap({ repository, actionId, deliveryActionId, hostResult }) {
  // Always retain an actual native outcome even if definition files drifted
  // while that call was in flight. nextBootstrap blocks dependent actions.
  const { root, state } = await verifiedState(repository, false), action = state.pending_action;
  check(action && action.id === actionId, 'stale_host_result', 'The result must match the one pending native action ID.');
  const role = state.roles.find(role => role.id === action.role_id);
  if (action.delivery_operation_id) {
    const common=resolve(root,await git(['rev-parse','--git-common-dir'],root));
    const outbound=JSON.parse(await readFile(join(common,'paprika-inc','outbound',action.delivery_operation_id+'.json'),'utf8'));
    check(deliveryActionId === outbound.pending?.id,'stale_host_result','Record the exact delivery action ID as well as the bootstrap action ID.');
    const outcome=await recordOutbound({repository:root,operationId:action.delivery_operation_id,actionId:outbound.pending?.id,hostResult});
    if (outcome.status === 'stored') { await save(root,state); return {...bootstrapSummary(state),status:'onboarding_stored'}; }
    if (['submitted','stored_events_only'].includes(outcome.status)) {
      role.onboarding_submitted=true; role.phase='awaiting_onboarding'; state.pending_action=null;
    }
    await save(root,state); return {...bootstrapSummary(state),ok:['submitted','stored_events_only'].includes(outcome.status),status:outcome.status};
  }
  let result;
  try { result = unwrapHostResult(hostResult); }
  catch {
    if (action.kind === 'wait' && hostResult && !hostResult.isError) result = {}; // Wait text is advisory; read-back is the evidence.
    else {
    if (role && ['create', 'onboard'].includes(action.kind)) {
      if (action.kind === 'onboard') role.onboarding_submitted = true; // May already have been submitted; never blindly resend.
      role.phase = action.kind === 'create' ? 'creation_unresolved' : 'onboarding_submission_unresolved';
      role.blockers = ['native_submission_outcome_unresolved']; state.pending_action = null; await save(root, state);
      return { ...bootstrapSummary(state), ok: false, status: role.phase };
    }
      throw new IncError('host_result_error', 'Read-only host result failed; the same read can be retried.');
    }
  }
  if (action.kind === 'projects') {
    check(Array.isArray(result.projects), 'invalid_host_result', 'Expected actual list_projects data.');
    const matches = [];
    for (const project of result.projects) if (project.projectKind === 'local' && project.hostId === 'local' && project.isGitRepository === true &&
      typeof project.projectId === 'string' && (!state.selected_project_id || project.projectId === state.selected_project_id)) {
      try { if (await realpath(project.path) === state.destination) matches.push(project); } catch { /* Not this accessible local destination. */ }
    }
    check(matches.length <= 1, 'ambiguous_saved_project', 'Several saved local projects match; explicitly select a project ID from the actual catalog.');
    state.pending_action = null;
    if (!matches.length) {
      state.phase = 'awaiting_project'; await save(root, state);
      return { ...bootstrapSummary(state), ok: false, status: 'awaiting_project',
        next_step: `Add ${state.destination} as a local Codex project using the app, then resume bootstrap. No supported project-registration API is assumed and no role was created.` };
    }
    if (state.project_id) check(state.project_id === matches[0].projectId, 'project_binding_changed', 'The saved project identity changed; review the existing bindings before proceeding.');
    state.project_id = matches[0].projectId; state.phase = 'onboarding';
  } else if (action.kind === 'create') {
    if (typeof result.threadId !== 'string' || !result.threadId || result.hostId !== 'local' || result.ephemeral === true ||
      (result.kind !== undefined && result.kind !== 'codex') || (result.projectId !== undefined && result.projectId !== state.project_id) ||
      state.roles.some(other => other !== role && other.thread_id === result.threadId)) {
      role.phase = 'creation_unresolved'; role.blockers = ['native_thread_id_or_host_unconfirmed'];
    } else {
      role.thread_id = result.threadId; role.phase = 'verify_membership'; role.onboarding_submitted = !action.bootstrap_only;
    }
  } else if (action.kind === 'membership') {
    check(Array.isArray(result.threads) && Array.isArray(result.pinnedThreads), 'invalid_host_result', 'Expected actual list_threads catalog data.');
    const match = [...result.pinnedThreads, ...result.threads].find(item => item.id === role.thread_id && item.kind === 'codex' && item.ephemeral !== true && item.hostId === 'local' && item.projectId === state.project_id);
    let cwdMatches = false;
    try { cwdMatches = match && await realpath(match.cwd) === state.destination; } catch { /* Missing independent cwd evidence. */ }
    if (!cwdMatches) { role.phase = 'membership_blocked'; role.blockers = ['exact_project_and_cwd_not_verified']; }
    else { role.project_verified = true; role.phase = 'awaiting_onboarding'; role.blockers = []; }
  } else if (action.kind === 'onboard') {
    // Host success confirms submission only; actual identity/receipt still needs read-back.
    role.onboarding_submitted = true;
    role.phase = result.threadId === role.thread_id ? 'awaiting_onboarding' : 'onboarding_submission_unresolved';
  } else if (action.kind === 'wait') role.phase = 'read_onboarding';
  else if (action.kind === 'read') {
    let nativeVerified = false;
    try { nativeVerified = result.thread?.id === role.thread_id && result.thread.kind === 'codex' && result.thread.ephemeral !== true && result.thread.hostId === 'local' && await realpath(result.thread.cwd) === state.destination; } catch { /* Unverified. */ }
    check(nativeVerified && role.project_verified, 'native_identity_mismatch', 'Native read-back did not independently verify the selected thread, local host, project and cwd.');
    role.thread_verified = true;
    let skillReportCurrent = true;
    if (role.skill_report) {
      try {
        const current = await projectSkills({ repository: root, command: 'skills status', roles: role.id, manifestPath: state.manifest_path });
        skillReportCurrent = sha(JSON.stringify({skills: current.skills, local_observations: current.local_observations, limits: current.limits})) === role.skill_report_sha256;
      } catch { skillReportCurrent = false; }
    }
    const receipt = receiptFromThread(result), requiredSources = [state.manifest_path, state.ownership_path, role.definition, ...(role.skill_sources || [])];
    const matches = receipt && receipt.request_id === role.request_id && receipt.role_id === role.id && receipt.role_version === role.version &&
      receipt.source_revision === state.revision && receipt.contract_sha256 === role.contract_sha256 && receipt.ownership_sha256 === state.ownership_sha256 &&
      Array.isArray(receipt.sources_read) && requiredSources.every(path => receipt.sources_read.includes(path)) &&
      skillReportCurrent && (!role.skill_report || receipt.skill_report_sha256 === role.skill_report_sha256) &&
      ['ready', 'blocked'].includes(receipt.state) && Array.isArray(receipt.blockers) && receipt.blockers.every(item => typeof item === 'string' && item.length <= 1000);
    if (matches && receipt.state === 'ready' && receipt.blockers.length === 0) { role.phase = 'ready'; role.blockers = []; }
    else {
      const finished = ['completed', 'failed', 'interrupted'].includes(result.turns?.[0]?.status);
      role.phase = finished ? 'onboarding_blocked' : 'awaiting_onboarding';
      role.blockers = !skillReportCurrent ? ['skill_report_changed_since_request'] : matches && receipt.blockers.length ? receipt.blockers.slice(0, 10) : [finished ? 'completed_matching_read_report_receipt_required' : 'matching_read_report_receipt_pending'];
    }
  }
  state.pending_action = null;
  await save(root, state);
  const blocked = role && ['creation_unresolved', 'onboarding_submission_unresolved', 'membership_blocked', 'onboarding_blocked'].includes(role.phase);
  return { ...bootstrapSummary(state), command: 'bootstrap record', ok: !blocked, status: blocked ? role.phase : state.phase, read_only: false, applied: true,
    next_step: blocked ? 'Report this blocker and stop the current drive. Resume read-only verification after it is resolved; do not create or resend a replacement.' : 'Continue the next sequential action.',
    created_thread_id: action.kind === 'create' && role?.phase === 'verify_membership' ? role.thread_id : null };
}

export async function bindBootstrapRole({ repository, roleId, threadId }) {
  const { root, state } = await verifiedState(repository, false), role = state.roles.find(role => role.id === roleId);
  check(role && typeof threadId === 'string' && threadId.trim(), 'invalid_role_binding', 'Select a requested role and an actual human/host-observed native thread ID.');
  check(!role.thread_id || role.thread_id === threadId, 'binding_conflict', 'An existing native binding cannot be silently replaced.');
  check(!state.roles.some(other => other !== role && other.thread_id === threadId), 'binding_conflict', 'Another requested role already uses that native chat.');
  check(!state.pending_action || state.pending_action.role_id === roleId, 'pending_other_role', 'Resolve the current native action before binding a different role.');
  check(!state.pending_action?.delivery_operation_id,'delivery_unresolved','Reconcile the existing outbound operation before binding; do not bypass a stored or uncertain task.');
  if (['create', 'onboard'].includes(state.pending_action?.kind) || ['creation_unresolved', 'onboarding_submission_unresolved'].includes(role.phase)) role.onboarding_submitted = !role.bootstrap_only;
  role.thread_id = threadId; role.phase = 'verify_membership'; role.project_verified = false; role.thread_verified = false; role.blockers = [];
  state.pending_action = null; state.phase = state.project_id ? 'onboarding' : 'discover_project';
  await save(root, state);
  return { ...bootstrapSummary(state), command: 'bootstrap bind', read_only: false, applied: true,
    next_step: 'Resume to verify exact native project/cwd membership and the scoped onboarding result; this binding declaration alone establishes no readiness.' };
}

export async function bootstrapStatus({ repository }) {
  const { state } = await verifiedState(repository, false);
  try { await verifiedState(repository); return { ...bootstrapSummary(state), definition_inputs_current: true }; }
  catch (error) { return { ...bootstrapSummary(state), status: 'definition_changed', definition_inputs_current: false,
    next_step: 'Recorded native results are preserved. Reconcile the selected definition revision before resuming.', blocker: error.code }; }
}
