# The company developing Paprika Inc

This is the portable definition of Paprika Inc's own development team. It is one consumer of the future company engine, which must also work with other repositories and rosters. The engine must not hard-code this roster.

**Definition status: bootstrap candidate, version 0.5.0.** These files create no live agents, perform no onboarding, and do not replace existing human-assigned chat responsibilities. Runtime lifecycle enforcement is not implemented.

| Stable role ID | Contract | Primary outcome |
| --- | --- | --- |
| `chief-architect` | [Chief Architect](roles/chief-architect/agent.md) | Coherent design, scope, interfaces, and acceptance gates |
| `backend-dev` | [Backend Dev](roles/backend-dev/agent.md) | Reliable company engine, host adapters, and service integration |
| `agent-systems-engineer` | [Agent Systems Engineer](roles/agent-systems-engineer/agent.md) | Candidate harness roadmap owner: knowledge/context methods, experiments and measured outcomes |
| `frontend-dev` | [Frontend Dev](roles/frontend-dev/agent.md) | Clear setup, status, and recovery interactions |
| `scientific-researcher` | [Scientific Researcher](roles/scientific-researcher/agent.md) | Traceable research and evidence appraisal |
| `qa` | [QA Engineer](roles/qa/agent.md) | Independent validation and release-readiness evidence |
| `coordinator` | [Coordinator](roles/coordinator/agent.md) | Human intake, owner selection and complete handoffs |
| `release-engineer` | [Release Engineer](roles/release-engineer/agent.md) | Reviewed merge order, reproducible builds and authorized release execution |

[company.json](company.json) is the machine-readable index; individual `agent.md` files are the canonical job descriptions. [The constitution](CONSTITUTION.md) defines shared boundaries. Assignment ownership belongs to a logical role, not a machine or native chat ID.

## Harness roadmap candidate

Version 0.5.0 proposes Agent Systems Engineer as an eighth persistent role. The
[gated harness roadmap](../docs/roadmap/AGENT-HARNESS.md) and
[A/B evaluation framework](../docs/evaluation/README.md) define its initial
workstream, interfaces and evidence gates. This source addition has not staffed
or adopted the role, started an experiment or promoted a generic catalog persona.

The candidate [model preferences](model-preferences.json) give it the same
proposed model/effort pair as Backend Dev because the loader requires a complete
roster. Existing role defaults remain unchanged. Review this new pair before
adoption; its presence does not change any chat or prove host availability.

## Bootstrap today

The human selects the repository/project and assigns existing chats to roles. A role reads the contract and shared policy, reports responsibilities, boundaries, known work, and missing evidence, and continues only within its existing grant. Record any actual chat binding and adopted definition revision privately. No automated provisioning or managed-singleton claim is made by this repository setup.

Existing chats can be adopted after identity, intended project membership, authorization, and conflicts are checked. Do not recreate them just because the manifest has a new version. A matching directory or display name alone is insufficient evidence.

## Reviewed merges

The owner delegates reviewed PR merges to Release Engineer under the actual
private grant, after independent related-role acceptance and QA where required by
[company QA engagement](CONSTITUTION.md#company-qa-engagement). Follow
[delegated merge authority](CONSTITUTION.md#delegated-merge-authority), keeping
GitHub identity, host approvals and every remaining protection distinct from
role responsibilities. An unchanged standing grant needs no repeated approval.

## Work and knowledge

The [work and knowledge index](../docs/work/README.md) links the candidate
checkpoint procedure, reusable templates and adoption assessment. Reuse current
assignments and the canonical ownership map. Source changes do not adopt a new
workflow into live roles; independent review and exact-version adoption remain
separate under the existing self-development procedure.

## Task reports

Under the owner's established coordination and reporting grant, assigned roles
report completion and known blockers to the dispatching Coordinator. Each task
brief names the return recipient; reports preserve the work ID, result, evidence
and remaining limits. Follow [the shared reporting rule](CONSTITUTION.md#task-dispatch-and-reports).
Reporting does not replace independent review or acceptance, and this file alone
grants no permission to communicate.

## Receiver continuity

Re-onboarded chats retain their verified receiver; recreated chats receive a new
immutable receiver. Preserve handoffs/history and retire only the exact obsolete
receiver under the owner's actual grant, following
[receiver continuity and retirement](CONSTITUTION.md#receiver-continuity-and-retirement).

## Improve the company itself

Use the approved version to develop a candidate successor through the normal issue/PR workflow. New files are proposed source, not live authority. [Self-development](../docs/architecture/SELF-DEVELOPMENT.md) specifies review, testing, adoption, rollback, and manual recovery.

Public Git contains portable contracts and safe design knowledge. Private deployment state contains enrollment, actual grants, host/thread bindings, operation journals, and sensitive knowledge. The public `company_id` is a logical name; enrollment must also bind the actual repository identity. A fork is not the original company's runtime.

The previously owner-approved seven-role roster replaced Front Desk with Coordinator and kept Data Engineer on demand. This candidate proposes adding Agent Systems Engineer; source publication does not adopt that eighth role. The former [Front Desk](roles/front-desk/agent.md) and [Data Engineer](roles/data-engineer/agent.md) contracts remain available as historical/specialist definitions, outside the persistent roster. Preserve their unresolved work during handoff. See [the refresh proposal](../docs/proposals/ROLE-REFRESH.md). The canonical ownership map includes research, QA, coordination and release deliverables; it is not a record of live permissions.
