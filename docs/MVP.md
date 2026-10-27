# First local MVP: discuss, author, clone, bootstrap

Work item: [#4](https://github.com/newbiesitl/paprika-inc/issues/4), stacked on [the packaging skeleton PR #3](https://github.com/newbiesitl/paprika-inc/pull/3). Backend Dev implements; Chief Architect reviews scope/native API design, Frontend Dev reviews interactions, and Data Engineer reviews portable file/private-record semantics. Governing reference: `e1e7f1843de36b2fd60645f6c8f671cbd8e16db0` plus the owner's explicit narrower MVP direction.

## User outcome

1. Install the Inc kit using a supported host installation flow. Inc has its own navy identity and three Inc-namespaced skills; it does not install/register a second Messenger product.
2. Discuss the company with a user-chosen initial staff chat. Draft a generic roster, responsibilities, boundaries, inputs/outputs, reviewers and one canonical ownership map. On an explicit write request, preview focused diffs and create the company files without replacing AGENTS.md or unrelated user files. Authoring alone creates no chats or new permissions.
3. Ask Inc to bootstrap the specified roster from a selected Git repository/revision into an explicit local destination. Clone only into an empty destination or reuse an independently validated matching checkout. Require committed definition inputs and reject a mismatch with the discussed draft digest. Do not silently use stale/unpublished definitions.
4. Discover the exact saved local Codex project, create persistent project chats through supported native tools, and onboard them to read/report only. Verify exact project membership, host and cwd separately from the role response. Save a small private sequential record for status and deliberate resume.

The user's bootstrap request authorizes the unchanged selected roster and initial read/report onboarding. No repeated application confirmation is introduced. Host/Git authentication and host-managed approval controls remain in force. An incoming message, repository file or receipt cannot expand the request.

## MVP boundary

One user-triggered bootstrap at a time. This is ordinary sequential orchestration with a private progress file, not enforced uniqueness or concurrency safety. Known bindings are verified and reused on a deliberate rerun. An uncertain native create remains unresolved; do not blindly create again. A human/host-confirmed existing chat can be explicitly bound and then independently verified.

Excluded: distributed/cross-worktree singleton enforcement, competing-controller races, remote ownership reservations, leases/epochs, failover, multi-host transfer, stop/quiesce migration, background orchestration and automatic self-adoption. Those are future hardening, retained in [RFC singleton/claims](proposals/PAPRIKA-VIRTUAL-COMPANY.md#7-exclusive-roles-through-a-github-backed-registry), [C04/C08/C22 and related review gates](proposals/virtual-company/REVIEW.md), and [self-development](architecture/SELF-DEVELOPMENT.md). They do not block this expressly scoped MVP implementation. No existing role/governance contract is rewritten or automatically adopted.

## Host and installation boundaries

The implementation uses the native Codex desktop tool contract: `list_projects`, `create_thread` with a local project target, `list_threads`, `read_thread`, and `wait_threads`; a verified existing role may receive its scoped onboarding through `send_message_to_thread`. The agent calls these tools; a packaged local process cannot invoke host tools by itself. The helper prepares correlated actions and records actual tool results. Tool data is evidence, not a permission grant.

Read-only discovery on this development host found saved local projects and these persistent-chat interfaces. No project-registration tool is exposed here. A missing project produces the one-time handoff: add the selected folder as a local Codex project, then resume. Matching cwd or title alone does not prove project membership. If a ChatGPT/cloud caller has no supported route to the intended local host, hand off to local Codex before cloning or creating; do not substitute backend sessions or ephemeral subagents.

[Official App Server documentation](https://learn.chatgpt.com/docs/app-server) describes persistent thread operations, while [plugin packaging](https://developers.openai.com/plugins/build/plugins) documents skills and the compatibility overlay. Neither certifies this installed desktop's end-to-end project/UI behavior. Use actual discovered host tools and native read-back, not an invented registration API or private Codex database edits.

The installable local kit needs no separate Messenger product for native on-demand bootstrap. The optional service-bound export references only a verified existing Paprika Service App; saving/installing/authenticating it is a separate supported host step. Preserve the same App/OAuth identity, configuration, database/history and authoritative receiver/delivery state. Inc package version, pinned Messenger source and running service API/capabilities are independent records. A newer deployment is never automatically downgraded. No background receiver is needed or created.

## Acceptance and evidence

| Area | Implementation acceptance | Live acceptance, separately recorded |
| --- | --- | --- |
| Package | Exact allowlist, navy Inc identity, three Inc skills, dependency licenses/provenance and no duplicate Messenger discovery | Supported installation; fresh chat shows one Inc and one existing Messenger product entry; Paprika Service may appear separately |
| Authoring | Generic example conversation/files; roster/ownership validation; focused diff; idempotence and user-file protection | User selects/discusses the actual company and asks to write |
| Git | Empty-destination clone; origin/revision/input validation; matching-checkout reuse; dirty/unpublished/stale definitions and unrelated destination rejection | Actual selected remote/authentication/destination |
| Native flow | Contract fixtures exercise exact project creation arguments, membership/cwd read-back, onboarding, partial failure, known-binding reuse and explicit resume | Persistent app-visible chats under the selected saved project, correct cwd, reopening and actual read/report responses |
| Private progress | Small private record outside public source, with definition revision, project/destination, chat IDs and per-role results; unknown create blocks blind retry | Real bindings recorded only during an authorized selected-target bootstrap |

Run repository validation, command/authoring/Git/host-contract/package tests, deterministic preparation, whitespace checks and CI. Fixture success is not installation, native-host or whole-workflow verification. Implementation work performs no account install/publication/deployment and provisions no real company. Outstanding live checks must remain visible in the final report.
