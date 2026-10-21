# Agent harness roadmap

Status: candidate plan from the October 21, 2026 design agreement. This document
records the agreed direction and proposed delivery gates. It does not start an
experiment, staff a role, adopt a definition or establish measured savings.

## Product direction

Build Paprika Inc into a reusable framework that understands a task, selects a
capable specialist, supplies focused knowledge and skills, validates the result,
and preserves reusable findings. Improve accepted-task quality and whole-system
efficiency together.

The virtual company is a configurable operating model and the first evaluation
environment. Paprika Messenger remains the independent communication layer;
supported hosts supply execution, tools and permissions. Keep portable company
definitions, the reusable harness and host adapters separate. Inc cannot create
capabilities or grants that the selected host does not provide.

The first proposed user is a repository maintainer coordinating specialist chats
who repeatedly rediscovers source material or loses context at handoffs. This is
a pilot hypothesis; external demand has not been validated.

## Operating loop and knowledge stewardship

Understand task → select eligible specialist → load focused source-linked context
→ execute → validate independently → preserve reviewed knowledge.

Domain specialists retain their source indexes, skills and domain knowledge.
Shared methods provide navigation, context packaging, provenance, freshness,
traceability and reuse. Preserve source revisions, uncertainty, contradictions
and unresolved obligations when condensing knowledge. Here, knowledge
distillation means structured source-linked knowledge, not model distillation.
A graph or ontology is an option to evaluate, not a prerequisite.

Existing foundations include role definitions, onboarding, selected skill packs,
Messenger and meetings, work checkpoints and the company catalog. A general task
router, knowledge-distillation engine and measured optimization are future work.
Neither this plan nor the role contract upgrades their implementation status.

## First workflow

Start with one bounded repository bug-fix workflow:

1. Record the issue and acceptance criteria using existing work IDs.
2. Produce a source-backed diagnosis and plan.
3. Implement a bounded patch and regression test.
4. Deliberately checkpoint, interrupt and resume through supported controls.
5. Obtain independent acceptance against the frozen criteria.
6. Preserve a reviewed knowledge update without losing unresolved work.

Reuse [work checkpoints](../work/README.md) and the issue/PR record. Do not create
a parallel task tracker. Stop rules, resource caps and reconciliation of unknown
external actions belong in the first implementation slice.

## Gated delivery windows

Windows begin after staffing, scope, resources and a start are approved. Calendar
elapsed time does not pass a gate. The existing [M1–M5 lifecycle proposals](../DEVELOPMENT.md#initial-milestone-proposals)
remain separate hardening work; this plan does not declare them completed.

| Window | Deliverables | Exit evidence |
| --- | --- | --- |
| Days 0–30: baseline and contracts | Role charter and dependency map; task/context/knowledge/provenance/trace contracts; curated source/skill index; supported telemetry feasibility; fixed task suite and rubric; E001 protocol; safe stop/resume and budget handling. | A bounded task resumes without losing unresolved work or duplicating an action. Research/QA examine fixtures, grading, usage coverage and protocol; architecture/data review covers interfaces and lineage. Missing telemetry remains an explicit blocker to complete savings claims. |
| Days 31–60: focused context and routing | Simple capability/role routing and focused context; frozen candidate; matched held-out comparisons including all agents, failures and setup/maintenance overhead. | Reproducible exploratory quality, cost, latency and rework evidence. Decide whether to fund a separately sized confirmatory study with thresholds frozen before testing. |
| Days 61–90: limited pilot hardening | Stale/missing/conflicting knowledge; cancellation, partial failure, duplicate/unknown delivery and recovery; a second portable company fixture. | Independent acceptance and a limited-rollout or further-work recommendation with exact compatibility, rollback and recovery inputs. |
| After the pilot gates | Another workflow/domain and supported host; richer navigation, adaptive routing/model selection and integrations as separately scoped experiments. | Each expansion demonstrates its capabilities, quality and benefit with a benchmark and regression gates. Generality is not assumed from E001. |

## Ownership and interfaces

The proposed [Agent Systems Engineer](../../company/roles/agent-systems-engineer/agent.md)
owns this workstream's roadmap, common knowledge/context methods, experiment
packages, explicitly assigned prototypes and measured outcome reports. Each
concrete implementation task still has one accountable owner and reviewer.

| Role | Retained responsibility |
| --- | --- |
| Agent Systems Engineer | Roadmap/dependencies, E001 protocol and evaluation package, comparative report and rollout recommendation. |
| Backend Dev | Separately assigned runner, telemetry and shared runtime/service implementation. |
| Chief Architect | Architecture, cross-component interfaces and technical acceptance. |
| Scientific Researcher | Methods, statistical design and evidence appraisal. |
| Data Engineer, on demand | Schema semantics, provenance, lineage and migration review. |
| QA | Independent behavior, grading, leakage, accounting and failure validation. |
| Coordinator | Authorized dispatch, scheduling, dependencies and handoffs. |
| Domain specialists | Domain sources, knowledge freshness, skills and contradictions. |
| Marketing & Brand Lead, when assigned | Positioning and claims bounded by accepted evidence. |
| Human owner | Priorities, staffing, resources, adoption and release decisions. |

One additional persistent role is proposed initially. Add a separate Knowledge
Engineer only if sustained workload justifies the split. Source ownership is
guidance for assignments and review, not exclusive access or a live grant.

## First evaluation and decisions still needed

The [A/B framework](../evaluation/README.md) compares the baseline with the
knowledge/context-management and routing bundle. [E001](../evaluation/E001.json)
fixes the exploratory size at **4 development issues + 8 held-out issues, with
3 paired repeats per held-out issue: 24 pairs / 48 scored task-runs**.
Calibration and setup require additional, disclosed resources. This is a
feasibility/variance pilot, not a powered confirmatory study.

Track acceptance, defects/rework, all-agent tokens and cost per accepted task,
latency, retrieval usefulness, maintenance burden, usage completeness and recovery.
A smaller prompt or a cheaper failed task does not establish a benefit.

Next gates, in order:

1. Approve the role's exact source revision, staffing and pilot scope through
   [self-development](../architecture/SELF-DEVELOPMENT.md); preserve existing chats.
2. Verify a supported usage source for every participating model call.
3. Select and pin task fixtures, arms, model/effort, host and evaluator versions.
4. Approve the total resource cap, rubric, margins, analysis and stop rules.
5. Calibrate on four development tasks, then freeze the candidate and protocol.
6. Execute the 48 scored runs, independently review the report, and decide whether
   confirmation is warranted.

Role adoption, a supported telemetry path, exact tasks/releases/host, budgets,
quality and benefit margins, latency guardrails and confirmatory sample size are
still open. The repository addition supplies reviewable definitions and planning
artifacts; runtime implementation, experiment execution and deployment require
their own scoped assignments.
