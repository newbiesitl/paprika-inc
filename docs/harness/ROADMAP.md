# Paprika Inc: transition to an optimized agent harness

Status: roadmap recommendation from the October 21, 2026 planning meeting (Asia/Tokyo). The human subsequently requested the Agent Systems Engineer definition and chat; this candidate records that role while roadmap execution remains separately scoped.

## Vision and positioning

Build Paprika Inc into a reusable framework that understands a task, selects suitable specialists, supplies focused knowledge and skills, validates outcomes, and preserves reusable findings. Improve accepted-task quality and whole-system efficiency together.

The virtual company is a configurable operating model and the first proving ground. Paprika Messenger provides communication; supported hosts provide agents and execution tools. Keep portable company/role definitions, the shared harness runtime, and host/connector adapters separate.

Initial proposed user: a repository maintainer coordinating specialist chats who repeatedly rediscovers source material and loses context during handoffs. Validate this need through the pilot before expanding market claims.

Suggested positioning: **Give every agent the knowledge and skills its task needs.** Publicly describe the product as building toward an optimized agent harness until bounded measurements justify a more specific claim.

## Operating loop

Understand task → select eligible specialist → load focused source-linked context → execute → validate independently → preserve reviewed knowledge.

Specialists steward their own domain knowledge and skills. The shared harness supplies navigation, context packaging, provenance, freshness checks, traceability and recovery. Knowledge distillation means concise structured knowledge with source links; it does not mean model distillation. A tree, graph or ontology is an option to test, not a prerequisite.

## Gated transition

Planning windows start after staffing and scope approval. A date alone does not pass a gate.

| Window | Deliverable | Exit evidence |
| --- | --- | --- |
| Days 0–30: establish the baseline | Proposed role charter; one bounded repository bug-fix workflow; task/context/knowledge/trace contracts; curated source/skill index; verified metering path; baseline and E001 protocol. Include stop/budget rules and unknown-action handling from the first slice. | One task can be interrupted and resumed without losing unresolved work or duplicating an action. QA/Research review the task suite, rubric, telemetry coverage and experiment protocol. |
| Days 31–60: test focused routing/context | Compare deterministic capability/role routing and focused context with the baseline. Keep the initial model/effort conditions fixed, preserve held-out tasks, and report all-agent overhead. | Reproducible exploratory report, followed by a separately sized confirmatory study if warranted. Quality, cost, latency and rework are reported together. |
| Days 61–90: harden a limited pilot | Test stale/conflicting knowledge, cancellation, partial failure, duplicate/unknown delivery and recovery. Demonstrate portability using a second company fixture. | Independent acceptance evidence and an explicit limited-rollout or further-work recommendation, including rollback/recovery inputs. |
| After the pilot gates | Replicate benefits in another workflow/domain and supported host; evaluate adaptive routing/model selection, richer knowledge navigation and additional integrations incrementally. | Each expansion has a benchmark, accountable owner, supported capability evidence and regression/quality gates. Generality and benefit are demonstrated rather than assumed. |

## First executable work package

Use existing issue/checkpoint IDs for one small bug-fix workflow: issue and acceptance criteria → source-backed diagnosis/plan → bounded patch and regression test → deliberate checkpoint/resume → independent acceptance → reviewed knowledge update.

The proposed Agent Systems Engineer owns the experiment package and outcome report. Backend Dev owns separately assigned runner/telemetry and shared-runtime tasks. Chief Architect reviews interfaces; Scientific Researcher reviews methods; Data Engineer reviews lineage; QA independently validates behavior, grading and accounting; Coordinator handles authorized scheduling.

Start by verifying a supported usage source and selecting the exact task fixtures and release arms. Then approve the resource cap and rubric, calibrate on development tasks, freeze the protocol, and run the exploratory comparison described in [evaluation-framework.md](EVALUATION-FRAMEWORK.md).

## Success and next decision

Track accepted-task rate, defects/rework, all-agent tokens and cost per accepted task, latency, retrieval usefulness, knowledge maintenance overhead and recovery correctness. Set numeric improvement thresholds from baseline evidence before confirmatory testing. A smaller prompt or cheaper failure is not success.

The next human decisions are adoption/staffing of the [Agent Systems Engineer](../../company/roles/agent-systems-engineer/agent.md), exact pilot scope/versions/host, resources and evaluation margins. No new role, implementation task, release or experiment execution was created by this meeting.
