# Evaluation report template

Status: unfilled template. Replace placeholders with evidence; an empty field
means unknown, not a passed gate. Follow the [framework](README.md).

## Identity and scope

- Experiment ID, issue/PR, protocol version/digest and frozen timestamp:
- Accountable owner and independent reviewers:
- Exploratory or confirmatory; intended workload/population and claim:
- A/B common base, source/build/config/dependency pins and treatment-diff audit:
- Task/knowledge/role/prompt/model/host/tool/evaluator versions:
- Approved resource cap, actual execution grant reference (private) and study dates:
- Setup scope, actual reuse N and cold knowledge/provider-cache distinctions:
- Protocol amendments, reasons and affected runs:

## Validity and accounting

- Isolation/reset, order randomization and held-out leakage checks:
- Usage source, coverage by arm/role/model and missingness:
- Request deduplication, cumulative/subset reconciliation and ledger digest:
- Grading rubric/version, reviewer independence/blinding and adjudication:
- Attempted/completed/failed/cancelled/unstarted task trials; retries and exclusions:
- Operational versus study-only cost allocation and shared setup treatment:

| Result | Arm A | Arm B | Paired effect / uncertainty |
| --- | --- | --- | --- |
| Attempted task trials / independently accepted | Pending | Pending | Pending |
| Acceptance rate and rubric/defect severity | Pending | Pending | Pending |
| Operational setup / execution / maintenance tokens | Pending | Pending | Pending |
| Total operational tokens / tokens per accepted task | Pending | Pending | Pending |
| Billed money / rate-based estimate (separate) | Pending | Pending | Pending |
| Tool/compute fees and human labor (separate units) | Pending | Pending | Pending |
| Rework and latency distribution | Pending | Pending | Pending |
| Critical faults / unknown actions / recovery | Pending | Pending | Pending |

Report raw tokens saved and acceptance-normalized savings, retaining negative and
undefined values. Give the estimator, clustering unit, confidence procedure,
analysis revision and reproducibility inputs. Do not count repeats as extra
independent tasks. Incomplete telemetry forbids complete savings claims.

## Whole study resources

Record development/calibration, instrumentation, evaluation-only grading/analysis
and other overhead separately from operational comparisons. Reconcile experiment
grand totals by tokens, money and labor without double counting or mixing units.

## Decision and bounded claim

| Gate | Frozen criterion | Evidence and result |
| --- | --- | --- |
| Telemetry/isolation/grading | Complete and valid | Pending |
| Quality noninferiority plus rubric | Preregistered delta_Q / confidence procedure | Pending |
| Practical benefit | Preregistered delta_T / confidence procedure | Pending |
| Latency/resource limits | Preregistered limits | Pending |
| Permission/data integrity/recovery | No critical faults, lost work or duplicate actions | Pending |

- Decision: pass / fail / inconclusive / stopped, with rationale.
- Remaining uncertainty, unsupported environments, faults and unresolved work:
- Exact claim supported by independent evidence, and its scope limits:
- Next recommendation and separate adoption/release decision, if applicable:

An exploratory E001 result can support feasibility or confirmation planning; it
does not establish a broadly reliable savings claim or authorize rollout.
