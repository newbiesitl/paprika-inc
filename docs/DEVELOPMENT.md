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

Chief Architect decomposes approved outcomes and resolves interfaces. Backend Dev owns runtime delivery, Frontend Dev owns interactions, Data Engineer owns state semantics, and Coordinator handles attributed intake and authorized status reporting. Cross-role review follows their [contracts](../company/README.md).

A progress report links the relevant issue/PR/commit, explains what is verified, lists remaining blockers and decisions, and identifies the next action. Keep private instance bindings and sensitive knowledge in the configured private state location, not in public issue descriptions.

## Implementation-to-review handoff

For an authorized implementation assignment, the implementation owner carries the
change through proportionate local verification, a scoped commit and PR submission.
The handoff to Coordinator includes the work ID, PR URL, exact head, validation
evidence, reviewer and remaining acceptance gates. A local commit, ZIP or report
alone is not a submitted implementation handoff when PR access is available.

Open a draft PR as soon as the concrete candidate is ready for independent review;
do not wait for QA or a visual release gate to pass before hosting the change.
Coordinator arranges the independent review and records acceptance. The author
addresses findings and identifies updated heads; changed review inputs need the
appropriate new review. Release Engineer receives the reviewed PR and sequences
only the merges, builds and releases covered by the actual human grant. Release
holds and publication/installation restrictions remain in force after PR creation.

If PR creation fails or permission is unavailable, report the exact failure and
candidate commit/patch to Coordinator. Coordinator explicitly assigns an alternate
submitter; ownership does not silently transfer to Coordinator or Release Engineer.
These delivery duties do not grant new communication, merge or release authority.

## Research-core follow-up

[Issue #6](https://github.com/newbiesitl/paprika-inc/issues/6) follows the scoped
MVP under definition `e1e7f1843de36b2fd60645f6c8f671cbd8e16db0`; see the
[unchanged proposal](proposals/SCIENTIFIC-RESEARCH-SKILLS.md). It adds only selected
project skills, generic role references, capability reporting and fictional
examples. The development roster and live grants stay outside this candidate.

After initializing both pinned submodules, `python3 scripts/research_pack.py`
verifies composition. `python3 scripts/research_pack.py --write` deterministically
regenerates the explicit internal payload after a reviewed source/adapter change.
Run repository validation, the Node behavior suite, Python package tests, plugin
validation, deterministic package preparation and git diff --check. Tests cover
legacy definitions, strict selection, integrity/conflicts/symlinks, partial resume,
private common-dir state, native onboarding reports and extracted-artifact
materialization. Local source/package checks do not certify live skill discovery
or external API access.
