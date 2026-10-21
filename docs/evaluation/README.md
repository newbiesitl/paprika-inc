# Agent harness A/B evaluation framework

Protocol family version: 0.1.0. Status: candidate specification from the October
21, 2026 design agreement. The framework consists of this protocol, the draft
[E001 registry entry](E001.json) and a [report template](REPORT-TEMPLATE.md).
No experiment runner, usage collector or automatic release gate is implemented
by these documents. No comparison has run and no savings have been measured.

## Question and treatment

Does knowledge/context management plus task routing reduce whole-system tokens
per independently accepted repository task while preserving the declared quality
standard and operational guardrails?

| Arm | Definition |
| --- | --- |
| A | Pinned baseline without the optimization bundle. |
| B | Pinned candidate with knowledge/context management and routing enabled. |

Pin a common base, each source SHA and built artifact digest, dependencies,
configuration, task-repository snapshots, role/definition and prompt versions,
knowledge/index versions, model/revision/effort, host/runtime, tool permissions,
resource limits and evaluator versions. Branch names alone are not identities.

Audit the treatment diff. Prefer builds from a common base differing only in the
treatment. Unrelated changes limit the conclusion to a comparison of those two
releases; they cannot establish a causal effect of knowledge management/routing.
Later 2×2 ablations (knowledge off/on × routing off/on) can examine component
effects and interactions, but are not a prerequisite for E001.

Fix model/effort conditions initially. Later heterogeneous model-routing studies
must report per-model usage and money; different tokenizers and prices make
unqualified cross-model token comparisons inadequate.

## E001: exploratory default

- **12 distinct issues: 4 development/calibration and 8 held-out.**
- **3 paired repeats per held-out issue = 24 A/B pairs = 48 scored task-runs.**
- Setup, calibration, instrumentation and analysis are additional resources,
  disclosed in the approved budget and experiment grand total.
- Cover ordinary fixes, source discovery/multifile diagnosis, regression repair,
  stale/conflicting evidence and interruption/resume.
- This is a feasibility/variance pilot with **8 task clusters**, not 24 independent
  tasks or a powered confirmatory study.

Choose actual issues and snapshots before testing. Use the four development
issues to calibrate the runner, metering and rubric. Freeze the candidate,
protocol and pre-test index before exposing held-out outcomes. Gold answers and
held-out solutions must not enter development prompts or the index.

## Isolation, execution and grading

1. Give both arms the same approved underlying source inputs; B may construct an
   index through measured setup. Record all preprocessing and curation.
2. Use separate chats, workspaces, knowledge stores and test state for each arm.
   Restore the pinned starting state for each independent task/repeat. Preserve
   artifacts and failures before reset; never carry one arm's history to another.
3. E001 uses frozen pre-test knowledge and no learning from held-out outcomes.
   Declare the initialization/accounting scope before execution: what is built
   once for a workload, rebuilt per trial, or restored from a snapshot. Charge
   actual setup once at its declared scope; cloning a snapshot neither creates
   extra model usage nor removes the original build cost.
4. Randomize or counterbalance A/B order within each task/repeat and record the
   schedule and actual order. Record seeds only where supported; they do not
   guarantee deterministic model execution.
5. Apply the same task, attempt and resource limits and supported permissions.
   Retain failures and cancelled attempts; do not retry selected failures until a
   preferred outcome appears. A retry belongs to its original task trial.
6. Use fixed correctness tests, a quality rubric, defect severity and independent
   grading of patches, evidence and handoffs. Blind reviewers to arm where
   feasible and record when blinding fails. Self-reported success is not acceptance.
7. Record provider-cache observations and only use supported controls. A fresh
   chat or cold knowledge store does not establish a cold provider cache.
   Unobservable cache effects remain a limitation, not an invented reset.
8. Stop at the declared resource cap or a critical failure. Quarantine unknown
   external write outcomes and reconcile them before any retry or dependent action.

## Supported telemetry gate

Demonstrate a supported usage source covering **every participating agent/model
call**, correlated to the experiment, arm, task and attempt. Documentation for an
API is not evidence of native Codex-host telemetry availability. Do not query
private host databases or invent missing counters.

If coverage is incomplete, report quality/latency, observed usage and the gaps.
Do not claim complete total-token savings. A separately approved instrumented API
study is a different execution environment and must be labelled accordingly.

Preserve raw usage, source and collection time, model/role, unique request
identity, cumulative-versus-delta semantics and missingness reasons. Reconcile
call/turn/session overlap; never add a cumulative session total to calls already
counted. Cached input and reasoning output may be subsets of input/output: count
each token once according to the verified provider semantics. Transcript word
counts and estimates are not actual metered usage.

## Accounting and metrics

Let x denote arm A or B over the same fixed attempted workload W. A task trial
includes all its attempts; a retry is not another accepted task.

```text
T_x = setup_x + execution_x + maintenance_x        # disjoint token entries
q_x = accepted_task_trials_x / attempted_task_trials_x
U_x = T_x / accepted_task_trials_x

raw_tokens_saved = T_A - T_B
raw_savings_percent = 100 * (T_A - T_B) / T_A
acceptance_normalized_savings_percent = 100 * (1 - U_B / U_A)
cost_per_accepted_task_x = C_x / accepted_task_trials_x
```

The primary benefit metric is acceptance-normalized token savings. Report raw
totals, acceptance, defects/severity, rework, elapsed time and latency distribution
alongside it. Normalizing by acceptance does not replace the quality rubric.

Include all agents and failed/cancelled attempts: coordination/routing, retrieval,
index creation/upkeep, operational review, retries and recovery. State the cost
of tools/compute and human curation/review separately; neither becomes a model
token. Keep actual billed charges separate from estimates calculated from dated
model rates, currency and billing semantics. A provider's reported token count
does not by itself establish the final invoice.

Use a disjoint study ledger:

| Bucket | In arm efficiency comparison? | In experiment grand total? |
| --- | --- | --- |
| Operational setup, execution, maintenance, including ordinary workflow review | Yes; allocate once to the actual arm/workload | Yes, once |
| Development/calibration and evaluation-only grading/analysis/instrumentation | Report separately from operational comparison | Yes, once |
| Tool/compute fees and human labor | Separate monetary/time columns; specify allocation | Yes, once in the corresponding units |

Predeclare this allocation, including shared overhead. Do not remove expensive
production review by calling it evaluation-only, or add a subtotal twice.
An experiment grand total reports separate token, money and labor totals rather
than adding incompatible units.

Negative savings remain negative. Missing usage is unknown, not zero. Zero or
nonfinite denominators make a ratio undefined; they do not imply perfect savings.
Undefined ratios/intervals prevent the corresponding benefit claim.

Hypothetical illustration: A uses 120,000 tokens and accepts 10 tasks; B uses
90,000 and accepts 6. Raw savings are 25%, but U_A=12,000 and U_B=15,000, yielding
**−25%** acceptance-normalized savings. These are not Paprika measurements.

## Cold initialization and measured reuse

```text
T_x(N) = setup_x + maintenance_x(N) + sum(actual_run_tokens_x, 1..N)
```

State the actual N-task schedule and initialization scope. Count setup once;
never amortize it over hypothetical future users/tasks or amortize it twice.
Publish separate cold-initialization and declared-reuse results. Projections are
estimates, not measured warm savings.

E001's independent trials use fixed pre-test knowledge. A later reuse study
preregisters an ordered sequence, starting knowledge, actual reuse N and equal
schedules, with separate stores for each arm and resets between independent
sequence repeats. If knowledge evolves within a sequence, analyze independent
sequences, not their dependent tasks. Learning from earlier outcomes needs a
separate leakage-aware protocol; it cannot silently modify E001.

## Registry and implementation contracts

[E001.json](E001.json) is a planning record, **not an executable configuration or
an authorization receipt**. Null values, empty fixture lists and pending decisions
mean incomplete evidence. A future runner must reject an unfrozen or incomplete
execution manifest and verify the actual grant independently of any status string.
Use existing issue IDs for work tracking; do not put native chat IDs in public Git.

| Record | Minimum required information |
| --- | --- |
| Protocol | Experiment/issue ID, version, owner/reviewers, hypothesis, immutable arm/base/artifact/config/dependency pins, task/knowledge/prompt/definition snapshots, host/model/tools, metrics/rubric, sample/order, exclusions, margins, resource/stop rules and analysis revision. |
| Task trial/attempt | Experiment/task/arm/pair/repeat/attempt/run IDs; order; timestamps/status; environment/knowledge digests; patch/test/trace references; failures, cancellations and unknown outcomes; independent verdict/reviewer. |
| Usage/cost event | Unique request/event identity, run/task/arm/role/model, raw usage and subset/delta semantics, category, source/time, coverage/missingness, rate/currency version and actual versus estimated charges. |
| Report/decision | Raw totals and acceptance counts, quality/latency/rework, setup/reuse basis, paired effects/uncertainty, faults, exclusions/amendments, metering gaps, decision and permitted claim scope. |

Minimum future implementation: versioned manifest and fixtures; an isolated
paired runner with reset/stop/budget controls; supported usage collection with
coverage checks; an append-only deduplicated run/attempt/usage/artifact/verdict
ledger; independent grading artifacts; and reproducible analysis/reporting.

Keep sensitive raw traces private. Public reports carry sanitized aggregates and
safe provenance. Correct ledger events by linked superseding records, preserving
history. Protocol amendments create a new version and identify affected runs;
retain failed and inconclusive experiments.

## Analysis and decision gates

Preregister the hypothesis, primary metric, estimator, uncertainty procedure,
paired task mix, splits, sample/repeats/order, exclusions and stop rules before
held-out testing. Apply the same accounting and quality rubric to both arms.
Aggregate paired differences by task with repeats nested within task. If using a
bootstrap, resample whole paired task blocks with both arms and their repeats;
justify that estimator for the sample and shared setup costs. Evolving reuse
studies require sequence-level clustering. Retries and dependent calls are not
independent samples.

Small E001 intervals are exploratory. Research must size a **new preregistered
confirmatory study** using task-level variance/correlation, quality and practical
benefit margins, and sensitivity to uncertain pilot estimates. Prefer additional
independent tasks over pretending repeats increase task diversity.

Before confirmation, freeze quality noninferiority margin delta_Q, minimum useful
normalized savings delta_T (percentage units), confidence procedure, latency and
resource guardrails and sample size. The proposed confirmatory claim gate requires:

- Complete, reconciled telemetry and valid isolation/grading.
- Quality: lower 95% confidence bound for q_B − q_A ≥ −delta_Q, plus the rubric.
- Benefit: lower 95% confidence bound for normalized savings ≥ delta_T.
- Latency/resource guardrails, and zero critical permission/data-integrity faults,
  duplicate external actions or lost unresolved work.

Margins and estimators are not approved by this framework. Undefined intervals,
insufficient evidence or unmet criteria produce the preregistered fail/inconclusive
outcome. Do not change thresholds after seeing held-out results without a new
study, stop opportunistically for a win, or release automatically after a positive
exploratory pilot. The [report template](REPORT-TEMPLATE.md) records these limits.

## Owners and next gate

Agent Systems Engineer owns the protocol, registry/package and outcome report.
Backend Dev owns separately assigned runner/telemetry work; Research reviews
methods/statistics; Chief Architect interfaces/isolation; Data Engineer lineage;
QA independently validates fixtures, grading, leakage and accounting. Coordinator
tracks authorized work; Marketing uses accepted evidence; the human approves
scope/resources and adoption/release.

Follow the [roadmap's ordered gates](../roadmap/AGENT-HARNESS.md#first-evaluation-and-decisions-still-needed):
staff/scope → supported metering → pin arms/tasks/host → approve cap/rubric/analysis
→ four development tasks → freeze → 48 scored runs → independent report.
The exact revisions, task set, host, resource cap and numerical margins remain
open; no paid study or runtime implementation has been dispatched here.

## Method references

The E001 allocation, accounting and decision rules above are Paprika's proposed
design, not vendor-certified performance or a host capability guarantee.

- [OpenAI evaluation best practices](https://developers.openai.com/api/docs/guides/evaluation-best-practices):
  task-specific representative cases and human-calibrated grading.
- [OpenAI Agents API observability](https://developers.openai.com/api/docs/guides/agents-api/observability):
  usage semantics, cached/reasoning subsets and metering limitations. This is
  API documentation, not proof that Codex desktop exposes equivalent telemetry.
- [Anthropic statistical approach to model evaluations](https://www.anthropic.com/research/statistical-approach-to-model-evals):
  paired comparisons, repeated observations, clustered uncertainty and study sizing.

References reviewed October 21, 2026; verify the selected provider's current
semantics during implementation. The protocol remains portable across supported
runners and does not depend on a hosted evaluation product.
