# The company developing Paprika Inc

This is the portable definition of Paprika Inc's own development team. It is one consumer of the future company engine, which must also work with other repositories and rosters. The engine must not hard-code these five roles.

**Definition status: bootstrap candidate, version 0.1.0.** These files create no live agents, perform no onboarding, and do not replace existing human-assigned chat responsibilities. Runtime lifecycle enforcement is not implemented.

| Stable role ID | Contract | Primary outcome |
| --- | --- | --- |
| `chief-architect` | [Chief Architect](roles/chief-architect/agent.md) | Coherent design, scope, interfaces, and acceptance gates |
| `front-desk` | [Front Desk](roles/front-desk/agent.md) | Accurate intake and authorized communication outside the project |
| `backend-dev` | [Backend Dev](roles/backend-dev/agent.md) | Reliable company engine, host adapters, and service integration |
| `frontend-dev` | [Frontend Dev](roles/frontend-dev/agent.md) | Clear setup, status, and recovery interactions |
| `data-engineer` | [Data Engineer](roles/data-engineer/agent.md) | Durable contracts, assignments, knowledge, and migration integrity |

[company.json](company.json) is the machine-readable index; individual `agent.md` files are the canonical job descriptions. [The constitution](CONSTITUTION.md) defines shared boundaries. Assignment ownership belongs to a logical role, not a machine or native chat ID.

## Bootstrap today

The human selects the repository/project and assigns existing chats to roles. A role reads the contract and shared policy, reports responsibilities, boundaries, known work, and missing evidence, and continues only within its existing grant. Record any actual chat binding and adopted definition revision privately. No automated provisioning or managed-singleton claim is made by this repository setup.

Existing chats can be adopted after identity, intended project membership, authorization, and conflicts are checked. Do not recreate them just because the manifest has a new version. A matching directory or display name alone is insufficient evidence.

## Improve the company itself

Use the approved version to develop a candidate successor through the normal issue/PR workflow. New files are proposed source, not live authority. [Self-development](../docs/architecture/SELF-DEVELOPMENT.md) specifies review, testing, adoption, rollback, and manual recovery.

Public Git contains portable contracts and safe design knowledge. Private deployment state contains enrollment, actual grants, host/thread bindings, operation journals, and sensitive knowledge. The public `company_id` is a logical name; enrollment must also bind the actual repository identity. A fork is not the original company's runtime.
