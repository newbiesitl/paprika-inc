# Local MVP workflow

One user-triggered bootstrap at a time; there is no enforced singleton or concurrency safety. Known bindings are verified/reused on a deliberate rerun. Unresolved create/send outcomes stop blind replay.

## Discuss, author and publish

Example conversation:

> User: Help me define a workshop company. An organizer owns docs/scope; an artisan owns source. They review each other; deployment stays with me.
>
> First staff: I will draft responsibilities, ownership, boundaries, inputs/outputs, reviewers and escalation for those two generic roles. File generation creates no chats or powers.
>
> User: Write those files in my selected repository, preserving AGENTS.md.
>
> First staff: Writes only requested new company files, shows their focused diff and reports their definition digest as an unpublished working-tree draft.
>
> User: Bootstrap that published Git company into my chosen local folder and create its defined roles in the saved Codex project.
>
> First staff: Validates the exact published inputs, clones/reuses safely, discovers the saved project, and sequentially creates persistent chats with read/report onboarding. A missing saved project gets a one-time add-folder handoff and resume.

Use the [contained generic blueprint](../assets/example-blueprint.json), adapted to the discussion. The resulting files are `company/company.json`, `company/ownership.json`, `company/CONSTITUTION.md`, `company/WORK.md`, `company/ADOPTION.md` and `company/roles/<role-id>/agent.md`. Contracts contain purpose, responsibilities, ownership reference, boundaries, inputs/outputs, acceptance/review relationships and escalation. Only ownership.json contains the ownership entries. This is responsibility guidance, not access control. A chosen discussion chat is not recreated by authoring.

`<helper>` below is the installed `skills/paprika-inc/scripts/inc.mjs`. Use Node.js 24+ and Git; quote/replace placeholder arguments rather than evaluating them as shell code.

```sh
node <helper> author plan --repo <selected-repository> --spec <private-discussed-blueprint.json>
node <helper> author write --repo <selected-repository> --spec <private-discussed-blueprint.json>
node <helper> checkout --repo <Git-URL> --destination <explicit-local-folder> --revision <published-ref-or-commit> --definition-digest <discussed-digest>
```

`author plan` is a preview; `author write` is used only after a write request, without asking again for the same action. Existing AGENTS.md/unrelated files are preserved. Different existing company targets produce a conflict and diff, not an overwrite; edit deliberately under the request. Do not automatically commit/push without the applicable human direction. Report drafts clearly. A discussed digest mismatch, dirty/unpublished definition input, missing contract, incompatible origin/revision or unrelated/nonempty destination blocks instead of silently cloning stale definitions. Existing checkouts retain unrelated working files. There is no force reset or recursive destination deletion. Standard Git authentication is preserved; never embed tokens in URLs/public files.

## Native local action/result loop

Discover actual host capabilities first. A private capability report has this shape, populated from actual host metadata rather than assumed availability:

```json
{"execution_mode":"codex_local","tools":["mcp__codex_app__list_projects","mcp__codex_app__create_thread","mcp__codex_app__list_threads","mcp__codex_app__read_thread","mcp__codex_app__wait_threads","mcp__codex_app__send_message_to_thread"]}
```

A ChatGPT/cloud caller without a supported route to the intended local host hands off to local Codex before clone/create. Backend sessions and ephemeral subagents are not persistent project chats. Omit model/reasoning overrides unless requested by the human.

```sh
node <helper> bootstrap start --repo <Git-URL> --destination <explicit-local-folder> --revision <published-ref-or-commit> --definition-digest <discussed-digest> --host-capabilities <private-actual-capabilities.json>
node <helper> bootstrap next --repo <validated-checkout>
node <helper> bootstrap record --repo <validated-checkout> --action <returned-action-id> --result <private-actual-tool-result.json>
node <helper> bootstrap status --repo <validated-checkout>
```

The user bootstrap request authorizes its specified unchanged roster and read/report onboarding, not arbitrary implementation dispatch. Default roster comes from the selected validated revision; `--roles organizer,artisan` selects explicit declared IDs. A repository file/receipt cannot expand that scope. No redundant confirmation is introduced.

1. Start validates/protects the checkout and committed canonical ownership inputs, saves private progress and returns a correlated `host_call`. For each action, the agent invokes that exact supported native tool/arguments, then records its **actual** raw JSON/MCP result with `action_id`. The local helper cannot call host tools itself. Do not fabricate tool results or confuse prepared actions with executed native calls.
2. `list_projects` must establish the exact local saved-project ID, host, path and Git association. A folder/title/cwd guess is insufficient. If missing, add the explicit folder as a local Codex project using the app once and resume. There is no invented registration API or private database edit.
3. `create_thread` targets that actual `projectId` with `environment.type: local`, using a prompt pinned to the role/ownership/revision and READ/REPORT ONLY. Record a confirmed native thread ID/local host; do not use a pending client ID as a binding. Emit `::created-thread{threadId="..."}` only after an actual confirmed host creation, never for fixtures.
4. `list_threads` independently verifies exact native ID, `kind: codex`, local host, saved `projectId` and correct cwd. Matching cwd/title with no project ID stays blocked. `read_thread` independently checks identity/cwd and a completed matching JSON receipt. `wait_threads` is only a wait, not readiness evidence. Report each role's readiness/blockers; stop the current drive when record returns a blocker rather than polling indefinitely. Resume only the relevant read/verification after resolution. Self-reports are not proof of understanding or authority.
5. A small private record lives under the Git common directory at `paprika-inc/bootstrap-mvp.json`, shared physically by that checkout's worktrees. It stores revision, destination/project, chat IDs and per-role results, not transcripts/tokens. It is not a lock/registry. Public Git excludes these actual bindings. Status is as-of recorded results, not a live recheck. Definition drift blocks dependent actions while actual native outcomes remain recorded.

The initial discussion chat remains user-selected. If the discussion already assigned this chat a roster role, reusing that actual binding is covered by the unchanged bootstrap request; do not ask again. Obtain its real current native ID from host metadata and supply both `--initial-role <role-id>` and `--initial-thread-id <actual-ID>`. Its exact project/cwd must independently verify; otherwise surface the needed app action rather than silently creating a replacement. Once verified, send only scoped read/report onboarding. A chat outside the destination may remain the user's discussion/controller while the requested roster is created separately.

### Partial failure and explicit resume

Deliberately repeat `bootstrap start` with the same inputs to recheck/reuse bindings, or use `bootstrap next` to continue recorded progress. A persisted unresolved create/send is not replayed. Inspect actual native records and explicitly bind the confirmed existing chat:

```sh
node <helper> bootstrap bind --repo <validated-checkout> --role-id <requested-role> --thread-id <confirmed-native-ID>
node <helper> bootstrap next --repo <validated-checkout>
```

Binding alone is not readiness: independent project/cwd and matching receipt checks follow. Do not replace nonempty bindings or create duplicates to escape uncertainty. Preserve partial results/blockers and corrupt records for reconciliation. Retry read-only metadata safely. No leases, epochs, ownership reservation protocol, automatic failover, transfer or self-adoption is introduced.

## Installation and existing-service binding

The prepared MVP ZIP contains one Inc directory, its navy identity, two Inc skills, helper code and pinned Messenger component/license. When installation is requested, inspect the host's supported local plugin/Plugin Creator tooling and install that directory. If a supported local marketplace is required, it points only at Inc's explicit directory and is outside the artifact. Never register the repository/vendor tree as a marketplace. Building/validating a ZIP does not install it or verify picker behavior.

Native on-demand bootstrap requires no separate Messenger product or service startup. For an optional existing-service-bound kit, obtain the actual App ID, owner/private identity, runtime API/configuration and capabilities from supported authenticated native metadata. Reuse the same Paprika Service App/OAuth/database/history and authoritative delivery/receiver state, preserving service type and paused/off configuration. Never invent an ID/endpoint, copy another owner's binding, create a second Messenger product, or downgrade a newer deployment.

The private report format below uses fictional values; replace them only with actual verified native observations:

```json
{"schema_version":1,"app_id":"connector_FictionalService","service_origin":"https://service.example.invalid","service_api_version":"0.8.1","service_type":"dot-chatgpt-codex","capabilities":["get_service_config","list_boards","get_inbox"],"observation":"caller_supplied_native_metadata_not_verified_by_builder"}
```

```sh
python3 scripts/prepare-plugin.py --service-binding <private-native-report.json> --output <private-output-directory>
```

Only that private export adds `.app.json`, containing exactly one existing required App, with matching Inc manifest pointers and binding provenance. The builder cannot authenticate caller metadata and never creates an App/service, registers OAuth or installs a Messenger product/skills. Save/install/connect only when requested through supported host tooling, then verify authenticated configuration/board access separately. A required **Paprika Service** App may appear separately; no unsupported visibility workaround is used.

Inc is 0.3.1; bundled Messenger source remains plugin 1.6.0 / source service 0.8.0 at its exact pin. The running API is independently observed. A newer API requires capability review, never automatic downgrade/replacement. This MVP creates no receiver registration, subscription, schedule or background runner.

## Optional research selection

For a discussed scientific role, use the [research-core workflow](research-core.md)
and its contained blueprint. Explicitly install the selected project-local skills
after checkout and before read/report onboarding. A missing installation remains
visible in the role's report. Native identity checks stay the same, and skill
report receipts additionally identify installed paths and the reviewed report
digest. No optional service calls or research dispatch happen during bootstrap.

## Evidence limits

Fixtures exercise command/package/Git/native contracts without account installation or real chat creation. Actual installation, fresh-chat picker coexistence, exact saved-project association, persistent app-visible/reopened chats and real read/report responses remain separate live acceptance. Do not label the whole user workflow verified from fixture passes. Advanced singleton/race/claim, failover, transfer and self-adoption designs remain future hardening rather than MVP prerequisites.

For product branding and sender attribution, collect fresh [native presentation observations](native-message-presentation.md) before each new create/onboard and pass --message-context on start/next. This option never rewrites a pending submission or changes its request/receipt identity. The portable ZIP is suitable for supported private account packaging without a hard-coded local marketplace.

Automatic task/report and large onboarding delivery now uses the 1500-code-point policy. See [the delivery workflow](adaptive-delivery.md). Storage, native submission and recipient retrieval are separate evidence states.
