# Evaluation and release-branch A/B experiment framework

Status: accepted meeting recommendation, October 21, 2026. This is an implementation specification; no runner, release comparison or paid experiment was executed. No token savings have been measured.

## Question and treatment

Does the knowledge-management plus task-routing bundle reduce whole-system tokens per independently accepted repository task while preserving the predeclared quality standard and operational guardrails?

| Arm | Definition |
| --- | --- |
| A: baseline | Pinned Paprika release without the optimization bundle. |
| B: candidate | Pinned Paprika release with knowledge/context management and task routing enabled. |

Pin the common base, commit SHA, artifact and dependency digests, feature configuration, role/definition versions, prompts, task-repository snapshots, knowledge snapshots, model/version/effort, host/runtime, tools/permissions, task limits and evaluator versions. Branch names alone are not reproducible identifiers.

Audit the A/B diff. Prefer two builds from a common base whose intended difference is the treatment. If unrelated changes remain, label the result a comparison of those two releases; do not attribute the effect specifically to knowledge management/routing. Later 2×2 ablations—knowledge off/on × routing off/on—can diagnose component effects and interactions. They are not required for the first bundled comparison.

The first study fixes the model/effort conditions to avoid conflating context/routing with a model change. Later heterogeneous model-routing studies also report money and per-model token breakdowns because token units and prices can differ.

## E001: agreed exploratory default

- **12 issues total:** 4 development/calibration issues and 8 distinct held-out issues.
- **3 paired repeats per held-out issue:** 24 A/B pairs, or **48 scored task-runs**.
- Setup, calibration, instrumentation and study-analysis resources are additional and appear in the approved budget and experiment grand total.
- Include source discovery, multi-file diagnosis/regression repair, stale/conflicting evidence and interruption/resume cases.
- This is a feasibility/variance pilot. Eight distinct task clusters are not 24 independent tasks. It does not establish a broadly reliable release-savings claim.

Use the development issues to validate the runner, metering and rubric, then freeze the candidate and protocol before revealing held-out outcomes. Research sizes a new confirmatory study from task-level variation, acceptance correlation, the minimum useful benefit and quality margin, accounting for uncertainty in the small pilot. Do not claim that this default is statistically powered.

## Isolation and execution

1. Give both arms the same approved starting source material. B may derive an index through measured setup. Hold out target solutions and gold answers.
2. Use isolated chats, workspaces, knowledge stores and test state. Reset to the pinned starting state for each independent pair/repeat. Preserve artifacts and failures before reset.
3. Freeze the pre-test index for held-out E001 tasks; no cross-arm history or held-out answers enter it.
4. Randomize or counterbalance A/B order within task/repeat; record order, supported seeds and actual conditions. A seed does not guarantee deterministic model execution.
5. Use equal task/attempt/resource limits and the same supported tool permissions. Do not rerun selected failures until a preferred result appears.
6. Grade patches, tests, evidence and handoffs independently against frozen criteria, blind to arm where practical. The agent's self-report is not acceptance.
7. Record provider-cache observations and use only supported controls. A fresh chat or cold knowledge store does not establish a cold provider cache. Undetected cache confounding remains a stated validity gap.

Matched task blocks and randomized order control task and run-condition differences; this follows the principles of [NIST randomized block designs](https://www.itl.nist.gov/div898/handbook/pri/section3/pri332.htm) and [paired observations](https://www.itl.nist.gov/div898/handbook/prc/section3/prc311.htm). Applying those principles here is the proposed Paprika study design.

## Telemetry readiness gate

Before a total-token claim, demonstrate a **supported** usage source for every participating agent/model call, with request/run/arm correlation and reconciliation of totals. API documentation alone does not prove native Codex-host telemetry access. Do not use private databases or invent counters.

If complete native usage is unavailable, report quality/latency and explicit metering gaps. A separately approved instrumented API study is a different execution environment and must be labelled accordingly.

Preserve raw fields, collection time/source, call identity, model and role, cumulative-versus-delta semantics, category, and coverage/missingness. Deduplicate call/turn/session overlap. Cached-input and reasoning-output fields may be subsets: count them once according to the verified source's semantics. Never add session totals to already counted calls.

## Metrics and accounting

For arm x over the same fixed attempted workload W:

- T_x = setup tokens + execution tokens + maintenance tokens, using disjoint ledger entries.
- All agents and failed/cancelled attempts count: routing/coordination, retrieval, index creation/upkeep, operational reviews, retries and recovery.
- q_x = independently accepted task-trials / all attempted task-trials.
- U_x = T_x / independently accepted task-trials.
- Report accepted-task rate, correctness/severity-weighted defects, rework, elapsed time and latency distribution alongside token/cost totals.

**Raw net tokens saved:** T_A − T_B.
**Raw savings (%):** 100 × (T_A − T_B) / T_A.
**Acceptance-normalized savings (%), the primary benefit metric:** 100 × (1 − U_B / U_A).

Compute analogous cost-per-accepted-task results from a monetary ledger. Keep billed/actual charges, rate-based estimates, dated rates/currency, tool/compute fees and human curation/review time distinct. Report experimental setup/calibration/analysis overhead separately and include an experiment grand total; predeclare which operational ledger feeds each comparison.

Do not clamp negative savings. Zero/nonfinite denominators make a ratio undefined; they do not imply zero cost or perfect savings. Missing usage is unknown, not zero. Partial observed totals cannot be called complete system savings. U_x is acceptance-normalized, not a substitute for the quality rubric.

Illustration only: A uses 120,000 tokens and accepts 10 tasks; B uses 90,000 and accepts 6. Raw reduction is 25%, but U_A=12,000 and U_B=15,000, so acceptance-normalized savings are −25%. A quality gate would also fail the acceptance regression. These are hypothetical numbers, not Paprika results.

## Cold start and knowledge reuse

Publish separate cold-start and declared-reuse ledgers:

T_x(N) = setup_x + maintenance_x(N) + sum of actual run tokens for the declared N-task schedule.

Count setup once, disclose actual reuse volume, and do not amortize over hypothetical use. Projections are estimates, not measured warm savings.

E001 uses independent task trials and fixed pre-test knowledge. A later E002 reuse study preregisters an ordered task sequence, reuse N, starting knowledge and equal schedules for both arms, with separate stores and resets between sequence repeats. An N=8 sequence was suggested as a later option, not approved execution. Shared evolving knowledge changes the statistical unit: analyze independent sequences, not individual reused tasks. Any learning from earlier outcomes needs a separate leakage-aware protocol.

## Registry and minimum framework deliverables

| Record | Required fields |
| --- | --- |
| Experiment/protocol | Issue-linked experiment ID; protocol version; hypothesis; accountable owner/reviewers; arm/base/artifact/config/dependency hashes; task split/snapshot and knowledge hashes; model/host/tools; primary/secondary metrics; rubric; quality/benefit/latency margins; sample/repeats/order; exclusions; resource/stop rules; analysis version. |
| Run/attempt | Experiment/task/arm/pair/repeat/attempt IDs; run order; timestamps/status; environment and knowledge hashes; artifacts/tests; failure/cancellation/unknown-outcome reasons; independent verdict/reviewer; trace references. |
| Usage/cost event | Unique request identity; run/task/arm/role/model; raw usage and subset/delta semantics; category; source/time; coverage/missingness; rate/currency version; actual versus estimated cost. |
| Decision/claim report | Raw totals and accepted-task counts; quality/latency/rework; cold/reuse basis; paired effects/uncertainty; faults; exclusions/amendments; telemetry gaps; decision and scope of any permissible claim. |

Implement a versioned manifest, isolated paired-run adapter and fixtures, append-only deduplicated ledger, frozen grading package and reproducible analysis/report. Keep sensitive raw traces private; share sanitized aggregates with provenance. Protocol changes create new versions. Retain failed and inconclusive experiments.

## Analysis and decision gates

Preregister the estimator, primary metric, cluster definition, exclusions, sample size and stop rules before confirmation. Analyze paired task effects with repeats nested within each task; resample complete paired task blocks where that estimator is justified. Cluster evolving reuse experiments by independent sequence/scenario. Do not treat retries or dependent calls as extra independent samples. Small-pilot intervals are exploratory.

Before the confirmatory study, freeze quality noninferiority margin δ_Q, minimum useful normalized savings δ_T (%), latency/resource limits, confidence procedure and sample size. A claim requires all of:

- Complete, reconciled telemetry and valid isolation/grading.
- Independent quality: lower 95% confidence bound for q_B−q_A ≥ −δ_Q, plus the frozen correctness rubric.
- Benefit: lower 95% confidence bound for normalized savings ≥ δ_T.
- Latency/resource guardrails and zero critical authority/data-integrity failures, lost unresolved work or duplicate external actions.

Unmet or undefined criteria produce fail/inconclusive according to the preregistered rule, not an optimization win. Stop at the resource cap or critical fault and quarantine unknown external outcomes. No opportunistic stopping when significance first appears. A positive exploratory pilot supports planning confirmation, not automatic release.

## Ownership and next authorized steps

Agent Systems Engineer owns protocol, registry, evaluation package and report. Backend Dev owns the distinct runner/telemetry implementation task. Research reviews methods/statistics; Chief Architect interfaces/isolation; Data Engineer lineage; QA independently checks fixtures, grading, leakage and accounting; Marketing limits claims to accepted evidence; Coordinator tracks authorized work.

Sequence: approve role/pilot scope → select/pin arms and task fixtures → verify metering → approve resource cap, rubric/margins and analysis → develop on four tasks → freeze → execute 48 scored runs → independent review/report → decide whether to fund confirmation.

The exact branch commits, task set, supported host, resource cap, role adoption and numerical margins remain human/reviewer choices. Framework implementation, experiment execution, release and spending are not authorized by this design meeting.
