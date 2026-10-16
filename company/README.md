# The company developing Paprika Inc

This is the portable definition of Paprika Inc's own development team. It is one consumer of the future company engine, which must also work with other repositories and rosters. The engine must not hard-code this roster.

**Definition status: bootstrap candidate, version 0.4.0.** These files create no live agents, perform no onboarding, and do not replace existing human-assigned chat responsibilities. Runtime lifecycle enforcement is not implemented.

| Stable role ID | Contract | Primary outcome |
| --- | --- | --- |
| `chief-architect` | [Chief Architect](roles/chief-architect/agent.md) | Coherent design, scope, interfaces, and acceptance gates |
| `backend-dev` | [Backend Dev](roles/backend-dev/agent.md) | Reliable company engine, host adapters, and service integration |
| `frontend-dev` | [Frontend Dev](roles/frontend-dev/agent.md) | Clear setup, status, and recovery interactions |
| `scientific-researcher` | [Scientific Researcher](roles/scientific-researcher/agent.md) | Traceable research and evidence appraisal |
| `qa` | [QA Engineer](roles/qa/agent.md) | Independent validation and release-readiness evidence |
| `coordinator` | [Coordinator](roles/coordinator/agent.md) | Human intake, owner selection and complete handoffs |
| `release-engineer` | [Release Engineer](roles/release-engineer/agent.md) | Reviewed merge order, reproducible builds and authorized release execution |

[company.json](company.json) is the machine-readable index; individual `agent.md` files are the canonical job descriptions. [The constitution](CONSTITUTION.md) defines shared boundaries. Assignment ownership belongs to a logical role, not a machine or native chat ID.

## Bootstrap today

The human selects the repository/project and assigns existing chats to roles. A role reads the contract and shared policy, reports responsibilities, boundaries, known work, and missing evidence, and continues only within its existing grant. Record any actual chat binding and adopted definition revision privately. No automated provisioning or managed-singleton claim is made by this repository setup.

Existing chats can be adopted after identity, intended project membership, authorization, and conflicts are checked. Do not recreate them just because the manifest has a new version. A matching directory or display name alone is insufficient evidence.

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

The owner-approved steady roster replaces Front Desk with Coordinator and keeps Data Engineer on demand. The former [Front Desk](roles/front-desk/agent.md) and [Data Engineer](roles/data-engineer/agent.md) contracts remain available as historical/specialist definitions, outside the persistent roster. Preserve their unresolved work during handoff. See [the refresh proposal](../docs/proposals/ROLE-REFRESH.md). The canonical ownership map includes research, QA, coordination and release deliverables; it is not a record of live permissions.
