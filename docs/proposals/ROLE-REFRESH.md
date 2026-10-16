# Paprika Inc role refresh proposal

Status: proposed roster refresh; model choices confirmed by the human. The new QA
role is separately authorized for creation. Existing role replacements await the
owner's review of this proposal. Governing policy remains
`e1e7f1843de36b2fd60645f6c8f671cbd8e16db0`.

## Recommended roster

Use six persistent roles for this stage. Keep Data Engineer as an on-demand
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
| Scientific Researcher | Literature and engineering-source evaluation, skill/dependency assessments, benchmark critique and evidence records | research-core; engineering-core only for technical-source review | GPT-6.1 Sol / high |
| Front Desk | Attributed intake, backlog/status summaries, milestone tracking and authorized routing; complete handoffs with outstanding items | Role contract; no engineering or research pack by default | GPT-6 Luna / medium |

No separate Release Manager or Agentic Systems Developer is needed now: those
implementation responsibilities belong to Backend, acceptance to the architect,
and independent verification to QA. The human retains release and scope authority.

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
- Front Desk records status from evidence; it cannot turn a message into authority.

All engineering roles reference one shared pack. Do not paste skill bodies into
contracts. The QA pilot precedes broad use; the selection remains optional.
Feature records should identify owner, reviewer, milestone, acceptance criteria,
dependency pins and evidence state (proposed/implemented/tested/installed/released).

## Models at creation and initialization

[model-preferences.json](../../company/model-preferences.json) records the selected
native creation parameters. QA's authorized initialization uses them now. Other
roles use them when their replacement definitions and handoffs are approved.
These are workload-based choices, not measured claims of comparative performance.

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

1. Owner reviews the candidate responsibilities, Data Engineer consolidation and
   affected review relationships. No candidate governs its own adoption.
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

The user has requested eventual recreation. This proposal is the concrete review
step required by the adopted [self-development procedure](../architecture/SELF-DEVELOPMENT.md).
It does not claim any existing role has already been replaced.
