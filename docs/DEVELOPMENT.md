# Track development by outcomes

GitHub issues and PRs are the live work records. Group work by **feature**, plan delivery through **milestones**, and distinguish improvements, bugs, research, and dependency adoption. Keep role ownership separate from issue assignees, which are GitHub accounts.

## Work hierarchy

- **Feature:** a user-visible outcome, with boundaries and acceptance criteria. Use a parent issue and link implementation tasks.
- **Task:** one reviewable deliverable owned by one logical role, with dependencies and a reviewer.
- **Improvement or bug:** a concrete change to existing behavior, linked to the affected feature where useful.
- **Milestone:** a demonstrable product outcome with exit evidence, not a folder or role name.
- **PR:** implementation/review evidence linked to the work item; merged code alone does not establish runtime readiness.

Use the repository's [work-item form](../.github/ISSUE_TEMPLATE/work_item.yml). Recommended fields for a future GitHub Project are Type, Feature, Milestone, Owner role, Reviewer role, Priority, Status, Dependency, and Evidence. This document does not claim that a Project board or live assignments have been created.

Suggested states: Backlog → Ready → In progress → In review → Done, with Blocked recorded explicitly. Done requires the item's acceptance evidence. A role contract alone is not an active assignment. Use stable issue/work IDs, and record pending decisions and blockers with stable IDs as well.

## Initial milestone proposals

The owner has now requested a smaller **local MVP** in [work item #4](https://github.com/newbiesitl/paprika-inc/issues/4): installable Inc skills, conversational role/ownership authoring, protected repository cloning and sequential native project-chat bootstrap with a private resume record. See [scope and acceptance](MVP.md). The MVP explicitly defers singleton/race/claim protocols and transfer/self-adoption machinery. The broader M1–M5 proposals below remain future hardening, not prerequisites for this narrower assignment. Live installation and selected-host/project evidence remain separate from fixture tests and source delivery.

| Milestone | Outcome | Exit evidence |
| --- | --- | --- |
| M0 — Repository foundation | Open-source setup, branding, proposal, contracts, pinned Messenger | Repository validation, reviewed contents, successful publication |
| M1 — Host feasibility | Persistent project-visible local roles and reliable stop/reopen | Authorized two-role pilot, native project/identity evidence, no duplicate bootstrap; Mac/Windows separately |
| M2 — Portable contracts and state | Validated definitions, assignments, knowledge, and ownership protocol | Schema/path/digest checks, unresolved-item preservation, real registry conflict/fault tests |
| M3 — Company lifecycle | Create/adopt/re-onboard/repair with safe recovery | Unknown outcomes, singleton, partial failure, shared-worktree state, and adoption tests |
| M4 — Standalone Inc delivery | Bundled Messenger integration, onboarding, and whole-company portability | Installation/coexistence, same-service preservation, quiesce/final-checkpoint/transfer, rollback evidence |
| M5 — Self-development pilot | Inc manages this development company under a known-good definition | Candidate N+1 developed under N, reviewed adoption, safe recovery when candidate fails |

M1–M5 are proposed future work, not activated assignments or completed functionality. Start with feasibility before committing to a lifecycle architecture that the host cannot support.

## Ownership and reporting

Chief Architect decomposes approved outcomes and resolves interfaces. Backend Dev owns runtime delivery, Frontend Dev owns interactions, Data Engineer owns state semantics, and Front Desk handles attributed intake and authorized external status. Cross-role review follows their [contracts](../company/README.md).

A progress report links the relevant issue/PR/commit, explains what is verified, lists remaining blockers and decisions, and identifies the next action. Keep private instance bindings and sensitive knowledge in the configured private state location, not in public issue descriptions.
