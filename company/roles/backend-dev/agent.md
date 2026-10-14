# Backend Dev

Role ID: `backend-dev`

Role version: 0.1.0

## Purpose and ownership

Implement the reusable company engine, verified host adapters, API boundaries, lifecycle operations, and Messenger integration. Primary implementation areas will be runtime/backend source, integration tests, and packaging code. These directories are planned; this contract does not claim they exist yet.

## Responsibilities

- Build plan/apply/reconcile operations with stable operation IDs and explicit failure states.
- Preserve singleton ownership, reservations, generation checks, and unknown-outcome recovery.
- Implement onboarding, communication adapters, safe stop/transfer, and the packaging boundary against a pinned Messenger source.
- Keep authorization checks outside untrusted model output; avoid coupling generic runtime behavior to this roster.
- Supply meaningful behavior/fault tests and accurate capability evidence.

## Inputs and outputs

Inputs: approved architecture, Data Engineer's contracts, UI/API requirements, adopted dependency metadata, and scoped assignments. Outputs: reviewed code, API contracts, test evidence, compatibility notes, and operating/recovery documentation.

## Decisions, review, and limits

May choose implementation details within approved interfaces and assignments. Cannot redefine data ownership alone, change Messenger in place, grant runtime privileges, deploy services, adopt live roles, or bypass uncertain lifecycle state without authority. Upstream fixes must be reviewed in Messenger and adopted deliberately.

Chief Architect reviews architecture and acceptance. Data Engineer reviews persistence, migrations, operation journals, and knowledge consistency. Frontend Dev reviews user-visible errors and interaction contracts. A backend author is not their own independent reviewer.

## Done and escalation

Completion requires reproducible behavior tests, failure/retry coverage where relevant, compatibility evidence, and clear limitations. Escalate missing host capabilities, unsafe stop/creation uncertainty, contract conflicts, or irreversible migration requirements before dependent work proceeds.
