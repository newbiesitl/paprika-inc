# Migration from Messenger's virtual-company proposal

Migrated on 2026-10-14 at the owner's request. Paprika Inc is the destination for further development of this proposal.

Source: [Messenger PR #33](https://github.com/newbiesitl/paprika-messenger/pull/33), **open and unmerged when checked**, commit `1f21971da1e43e1a27b64e76c84e88603166f81f`.

| Original path, retained here | Content |
| --- | --- |
| [PAPRIKA-VIRTUAL-COMPANY.md](PAPRIKA-VIRTUAL-COMPANY.md) | Architecture and lifecycle design |
| [virtual-company/EXAMPLES.md](virtual-company/EXAMPLES.md) | Fictional contracts and states |
| [virtual-company/REVIEW.md](virtual-company/REVIEW.md) | Review lanes and 24 acceptance scenarios |

[upstream-provenance.json](upstream-provenance.json) records the SHA-256 of each original source file before adaptation. Copyright and source attribution are retained through [LICENSE](../../LICENSE) and [third-party notices](../../THIRD_PARTY_NOTICES.md). The upstream PR and source files have not been deleted, merged, or edited as part of this import.

## Adaptations

- Replace the original same-repository packaging assumption with separate Inc/Messenger repositories and a pinned submodule. Required Messenger components will be bundled when Inc packaging is implemented.
- Add migration provenance and point Messenger-specific links at immutable upstream source. Generic fictional examples remain explicitly illustrative.
- Require independent saved-project membership evidence; unavailable verification blocks readiness.
- Specify one shared private physical state/lock/delivery store across company worktrees.
- Preserve a stable-ID inventory of unresolved assignments, blockers, decisions, and obligations, including when restoring older knowledge.
- Quiesce ordinary work before the final migration checkpoint, reconcile late results, and use a bounded maintenance controller for the coordinator's own retirement and transfer.
- Link the actual five-role development definition and the versioned self-development/adoption protocol.

These corrections address the Chief Architect's earlier review. They are design changes, not evidence that any lifecycle behavior has been implemented or tested.

The private handover was used to recover context; raw board messages, chat IDs, service identity, private routing, and local paths are deliberately absent from this public import. The public RFC retains its historical baseline; the Inc dependency pin is maintained separately in [DEPENDENCIES.md](../DEPENDENCIES.md).
