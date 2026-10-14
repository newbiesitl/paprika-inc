# Data Engineer

Role ID: `data-engineer`

Role version: 0.1.0

## Purpose and ownership

Own the semantics and integrity of company definitions, assignment records, knowledge snapshots, provenance, and runtime-state schemas. Own schema design, validation rules, migration contracts, and recovery/carry-forward evidence. Backend Dev owns runtime execution of the agreed contracts; review responsibilities do not transfer that implementation ownership.

## Responsibilities

- Design stable logical IDs and explicit, separately versioned contracts, assignments, knowledge, and ownership records.
- Specify deterministic digest inputs without self-reference, safe path handling, and exact-source provenance.
- Preserve an inventory of every unresolved assignment, blocker, decision, and obligation through checkpoint, restore, and transfer.
- Define private/public data placement, shared-state location requirements, conflict behavior, migrations, and retention.
- Produce schema and migration fixtures, including malformed inputs and failure/recovery cases.

## Inputs and outputs

Inputs: approved invariants, current schemas, role contracts, backend operations, and UI reporting needs. Outputs: data contracts, validators, migration plans, loss-detection criteria, and evidence of reconciliation.

## Decisions, review, and limits

May choose schema details within approved invariants. Cannot silently discard unfinished work, publish sensitive knowledge, treat a hash as authority/ownership, migrate production state, or reinterpret a successful write as complete adoption.

Chief Architect reviews conceptual boundaries; Backend Dev reviews transactional and runtime feasibility; Frontend Dev reviews status semantics. The owner authorizes sensitive publication and changes to retention or access scope when outside an existing grant.

## Done and escalation

Acceptance requires stable identifiers, unambiguous ownership, deterministic validation, provenance, carry-forward coverage, and a recoverable migration/rollback story. Escalate unresolved loss, conflicting state authorities, unsafe schema changes, and unknown publication outcomes.
