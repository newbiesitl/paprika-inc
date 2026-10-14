# A company that develops its own implementation

Status: design proposal; bootstrap definitions are candidates. The runtime and adoption controller described below are not implemented.

Paprika Inc is both a product and a company using that product. Resolve the apparent recursion through versioning: **the currently approved system N develops candidate N+1; N+1 does not govern its own approval.** A human and ordinary Git/host tools remain the initial bootstrap and recovery path.

## Separate the layers

| Layer | In this repository | Change boundary |
| --- | --- | --- |
| Human authority and host policy | Actual owner grants, credentials, GitHub and host controls | Cannot be rewritten by a repo commit |
| Company definition | `company/` and `AGENTS.md` | Reviewed candidate, explicit adoption |
| Reusable product | Future engine, adapters, plugin, and build code | Versioned implementation, normal tests/review |
| Development instance | Private enrollment and runtime registry | One adopted revision, verified bindings, epochs |
| Work and knowledge | Issues/PRs and configured knowledge store | Evidenced updates, stable unresolved-item inventory |

The development company is a fixture and an early consumer, not a hard-coded dependency of the engine. A second fictional company must work without names such as `chief-architect` embedded in generic runtime logic. The human supervisor is outside the managed role roster and can recover the system when its coordinator fails.

## Bootstrap without circular prerequisites

1. The human reviews the portable contracts and explicitly assigns/adopts the intended existing chats. Current role requests remain valid; writing these files does not switch their policies automatically.
2. Record the selected repository, governing Git revision, role contract digests, actual authorization, and private bindings outside candidate source. Do not store a commit's own SHA inside the files whose commit SHA it would determine.
3. Use ordinary Git PRs and supported host tools to implement the first engine. Until a lifecycle is verified, label this manual team operation rather than certified managed orchestration.
4. Run a future engine candidate on fictional/private test identities and a separate test `company_id`. Test fixtures must never reuse production bindings or assume authority to create live chats.
5. Only after evidence and authorization, adopt a tested runtime to manage the existing company. Reconcile/adopt existing roles; do not create a parallel company as part of dogfooding.

This is a finite bootstrap. The product does not need a working copy of itself to build or repair its source.

## Develop, review, adopt

1. Open a scoped work item. Identify its owner, reviewer, acceptance criteria, and the **governing definition commit** under which the work was authorized.
2. Develop candidate code/contracts in a branch or isolated worktree. Pin governing policy inputs for the running assignment. A candidate `AGENTS.md`, role file, or policy loader is review data for this change, even if the host displays it. It cannot remove the old required reviewer or enlarge the grant.
3. Validate against both the proposed behavior and the current non-negotiable boundaries. Review policy loaders, validators, tests, CI, and manifests together so changing the check does not hide a changed rule. Run the known-good validator as an additional check where practical.
4. Obtain independent technical review. Any change to authority, role ownership, grants, supervision, or the adoption/recovery process needs the human owner's decision. The owner may use the documented PR review exception; an AI author cannot pretend that is independent agent approval.
5. Merge approved source. A merge makes a candidate available; it does not rewrite running role instructions, deploy a service, or activate new permissions.
6. Prepare an adoption plan with immutable source/dependency/definition references, compatibility checks, rollback inputs, affected roles, and the existing human grant or new approval required. Before applying it, recheck those inputs and authoritative state have not changed.
7. At a verified assignment boundary, checkpoint work and re-onboard affected roles in place. Block their new managed dispatch while they have incompatible or unverified inputs. Changes spanning interdependent contracts pause those roles together until all required receipts and native identities are verified.
8. Conditionally promote the new adopted bundle in private state. Reject stale adoption and keep unknown outcomes pending. Resume only roles whose effective contracts, capabilities, and grants match the promoted bundle.

Routine source changes that leave effective role/policy inputs unchanged do not require re-onboarding every role. Source, dependency, definition, and knowledge versions remain distinct. Adoption permission may be covered by a specific existing human grant; do not invent a fresh confirmation requirement for each unchanged authorized operation.

## Runtime self-upgrades and migration

A controller cannot replace its own executing code and assume it has stopped. Stage the candidate and let the old approved controller or a separately authorized, bounded maintenance controller checkpoint, drain, verify quiescence, and hand off. The maintenance controller has only transfer/recovery scope, not ordinary coordinator work, and does not count as a second active coordinator.

For a host transfer: freeze dispatch and receiving triggers; capture a preliminary checkpoint; drain or stop ordinary role work; reconcile late messages, commits, and unwritten results; publish the final snapshot and verify its complete unresolved-item inventory; retire old bindings; transfer the epoch; then activate and verify the destination. Use supported tools to verify stopping. An unreachable old host is not proof of termination.

One physical private state and mutex/journal location must be shared by all worktrees for the same company. A path under each checkout must not create separate locks or delivery histories. Git ref claims alone cannot stop raw operations or a process already running; document and test that enforcement boundary.

## Rollback and emergency repair

Keep the prior adopted definition, compatible runtime, dependency pin, schema compatibility, grants, and knowledge references recoverable. Rollback publishes a new adoption record pointing to known-good compatible code. It never rewinds an ownership epoch, recreates occupied role slots, downgrades a newer service blindly, or discards assignments/decisions created after the old snapshot.

The owner can suspend automation through supported host/service controls and repair with Git and a manually assigned helper using a known-good policy revision. That path must not require the broken Inc runtime. Record the reason, scope, evidence, and subsequent reconciliation. An agent cannot declare an emergency to bypass host policy or expand its authority.

## Required evidence before managed self-adoption

- Candidate role text attempts to remove its reviewer or self-authorize: old policy still governs; no live grant changes.
- Policy loader, tests, or CI change together with governance: old baseline and owner review expose the change rather than accepting a rewritten oracle.
- Two candidate adoptions race, or one returns an uncertain result: one authoritative successor; no blind retry or second role instance.
- One role fails re-onboarding: affected work remains paused; status names the exact failed evidence.
- Candidate registry/knowledge schema is incompatible with the prior runtime: rollback blocks or uses a tested compatibility migration.
- Restore old knowledge after newer unresolved work exists: every newer item survives or has evidenced resolution/transfer.
- Broken Inc runtime or coordinator: owner can stop and repair using the independent manual path.
- Definition update with no lifecycle replacement: existing verified role/chat identities remain unchanged.

These are implementation acceptance gates, not completed runtime tests.
