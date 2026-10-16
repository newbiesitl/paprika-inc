# Paprika Inc role refresh proposal

Status: the human approved the seven-role roster, model settings, independent QA
review and archive/rebuild sequence. QA is created and onboarded. The Coordinator
must receive and accept the current architect's complete handoff before this chat
is archived. Source publication, role adoption and account release remain separate.
Governing policy for this assignment remains
`e1e7f1843de36b2fd60645f6c8f671cbd8e16db0`. Actual grants and bindings stay private.

## Recommended roster

Use seven persistent roles for this stage. Keep Data Engineer as an on-demand
specialty rather than a seventh standing chat. Frontend and Data Engineer's recent
histories contain onboarding but no implementation assignments; Backend carries
the current packaging/runtime work and icon investigation. Research has delivered
its source landscape. These observations justify clearer ownership, not extra
layers of management.

| Role | Proposed ownership and deliverables | Skills | Model / effort |
| --- | --- | --- | --- |
| Chief Architect | Architecture, feature/milestone decomposition, interface decisions, adoption tradeoffs and technical acceptance; independent peer/owner review of own changes | engineering-core for review; no copied global rules | GPT-6 Astra / high |
| Backend Dev | CLI/runtime, host adapters, pack builder/installer, persistence/recovery and service contracts; tested changes and compatibility notes | engineering-core | GPT-6.1 Sol / high |
| Frontend Dev | Onboarding/status/recovery UX, branding/icon presentation, user-facing command language and accessible UI; interaction and visual evidence | engineering-core | GPT-6.1 Sol / high |
| QA Engineer | Independent caller/data-flow review, regression/failure tests, extracted-package and real-client validation; reproducible defects and readiness reports | engineering-core | GPT-6.1 Sol / xhigh |
| Scientific Researcher | Literature and engineering-source evaluation, skill/dependency assessments, benchmark critique and evidence records | research-core; engineering-core only for technical-source review | GPT-6 Astra / xhigh |
| Coordinator (replaces Front Desk) | Primary human contact, request triage, one owner/reviewer per task, specialist introductions and complete handoffs | Role contract; consult domain roles | GPT-6.1 Sol / high |
| Release Engineer | Reviewed PR sequence, reproducible builds, versioning, release notes and authorized rollout/rollback | engineering-core | GPT-6.1 Sol / high |

Release Engineer is warranted by the current PR volume. It owns sequencing and execution while the architect/domain owners and QA retain review. No separate Agentic Systems Developer is needed now; that implementation belongs to Backend. The human retains release scope and authority.

Data/schema work initially stays with Backend with explicit architect/QA review.
Activate a dedicated Data Engineer when durable schema migration, concurrency,
knowledge-store work or audit complexity warrants a separately accountable owner.
Retain its contract and history; do not silently discard it or mark its work done.

## One canonical responsibility per outcome

- Backend owns package contents, service bindings and runtime behavior.
- Frontend owns what the user sees and the intended interaction.
- QA verifies the exact artifact/client combination, including negative evidence.
- Research identifies and assesses sources; it does not accept its own integration.
- The architect chooses the design and adoption recommendation.
- Coordinator owns intake, routing and completion tracking; it cannot turn a message into authority.
- Release Engineer owns the reviewed merge/build/release sequence; it cannot approve its own work.

All engineering roles reference one shared pack. Do not paste skill bodies into
contracts. The QA pilot precedes broad use; the selection remains optional.
Feature records should identify owner, reviewer, milestone, acceptance criteria,
dependency pins and evidence state (proposed/implemented/tested/installed/released).

## Human-to-company workflow

Send requests to Coordinator. It classifies discussion/research/implementation/
review/release, consults the architect or required specialists under the human's
coordination grant, and selects one accountable owner and reviewer. It returns
the actual specialist chat link so detailed discussions happen directly with that
role. Architecture brainstorming remains available directly with Chief Architect.

Each handoff preserves the human's goal, scope, decisions, evidence, acceptance
criteria and open questions. Specialists report progress into the same work record;
Coordinator keeps the human informed. It does not automatically turn a discussion
into permission to publish. Long handoffs use stored Paprika message references.

Release Engineer then sequences reviewed PRs, verifies head-specific approvals
and checks, builds artifacts and executes only the authorized release. QA checks
the actual artifact/client environment. Research companies use the same separation:
scientific reviewers approve conclusions; Release Engineer packages reproducible
code/data/notebooks/reports and handles authorized distribution.

These roles are also recommended by the generic initialization guidance and
fictional IT/research blueprints in the plugin; no actual company roster is hard-coded
into the runtime.

## Models at creation and initialization

[model-preferences.json](../../company/model-preferences.json) records the selected
native creation parameters. QA's authorized initialization uses them now; the Coordinator uses its separately approved Sol/high choice. Other
roles use them during the approved replacement once their handoffs and review are verified.
These are workload-based choices, not measured claims of comparative performance.

MODEL-001 updates the selected Scientific Researcher pair to `gpt-6-astra` /
`xhigh` (extra-high effort), as requested by Charles on October 17, 2026. All other
selected pairs remain unchanged. The earlier refresh requested `gpt-6.1-sol` /
`high` for that role; retain its original private creation and onboarding evidence.
The updated profile records the current request, not a host-confirmed change to
an existing chat. Applying the pair requires the applicable authorization and
supported native parameters, with requested versus applied settings recorded
separately. File edits neither recreate chats nor prove live model application.

The current native host tool accepts model and thinking parameters. The generic
MVP helper does not yet consume this file; it must not pretend it applied a profile.
For native creation, pass the approved exact values and validate availability
against the host. Missing support is explicit; never silently choose another model.
Onboarding records requested versus host-confirmed settings, actual project/cwd,
definition digest, skill integrity and limitations.

A follow-up product change can add optional per-role preferences to authoring and
bootstrap: inspect recommendations, obtain or reuse the exact human choice, freeze
it with the assignment, validate host support, pass native parameters and preserve
it on uncertain-outcome reconciliation. Do not make a repository profile grant its
own model override or encode this team's model choices into the generic engine.

## Replacement sequence

The supported native operation is archival, not permanent deletion. Archival keeps
history available for recovery. New native identities are expected on recreation.

1. The owner approved these responsibilities, Data Engineer consolidation and review
   relationships. Preserve the actual grant privately; candidate files do not grant authority.
2. At each assignment boundary, capture an outstanding-work inventory: work IDs,
   branches/PRs, evidence, blockers, decisions, message references and next actions.
   Backend's active icon investigation must transfer rather than disappear.
3. Use existing native/source evidence and a private handoff record; recheck the
   old role is idle. Unknown or active work blocks only that role's replacement.
4. Retire/archive the old chat before creating its replacement, avoiding two live
   incumbents. Preserve its ID/history privately. Resolve any uncertain creation
   outcome before retrying.
5. Create the replacement in the verified Paprika Inc project using the approved
   model pair. Read/report onboard against pinned definitions and installed packs,
   verify native identity/project/cwd and actual receipt.
6. Bind the new Messenger address deliberately, retain old message references and
   transfer every unresolved item. Archiving a chat alone does not move its inbox
   or disable receiving automation; inspect those independently.
7. Replace Chief Architect last, after the successor has the complete handoff and
   the owner-approved governance scope. This current chat remains the coordination
   point while the proposal and other transitions are under review.

The owner approved recreation after reviewing this proposal. Follow the adopted
[self-development procedure](../architecture/SELF-DEVELOPMENT.md); report the actual
per-role transition evidence separately. Archival is recoverable, not permanent deletion.

## Dedicated board and preserved research

The owner requires a dedicated company Messenger board during live initialization/creation: reuse it if present, otherwise create it through supported tools. Never use main without an explicit human instruction. Preserve the verified binding privately; local CLI validation is not proof of board readiness.

Before retiring the original Scientific Researcher, preserve its delivered landscape report and comparison CSV, their October 16 observation timestamps, source pins, licensing gates and unexecuted pilot recommendations. The Coordinator and successor Researcher inherit the outstanding review/adoption decisions; no additional skill catalog is adopted by this handoff.
