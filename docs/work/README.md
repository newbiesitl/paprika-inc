# Company work and knowledge index

Status: candidate workflow integration; independent acceptance and role rollout
remain separate. Existing assignments and human grants continue to govern work.

Use the reusable [work-tracking procedure](../../plugins/paprika-inc/skills/setup-paprika-inc/references/work-checkpoints.md)
and [templates](../../plugins/paprika-inc/skills/setup-paprika-inc/assets/work-checkpoints/README.md)
when this company adopts the reviewed revision. This index links the maintained
procedure instead of duplicating its instructions.

## Local conventions

- Canonical task state: Existing GitHub issues and PRs, as specified in
  [development tracking](../DEVELOPMENT.md). Files here hold supporting knowledge
  and resume history; link to the live task instead of copying its status.
- Selected work root: `docs/work/`.
- Task ID: Use a unique ID allocated in the existing coordination process.
- Timezone: Record the actual timezone with each timestamp.
- Role contracts: `company/roles/ROLE_ID/agent.md`, indexed by
  [the manifest](../../company/company.json).
- Responsibilities: [Canonical ownership](../../company/ownership.json).
- Review/adoption: [Self-development procedure](../architecture/SELF-DEVELOPMENT.md).

Reuse existing tasks and their evidence. This candidate creates no live tasks,
role instances, monitoring, grants or notifications. The coordinator maintains
this index and links to authorized task records; task authors and reviewers
retain their existing responsibilities. Reconcile any ownership changes through
the current approved procedure before adopting them.

The default privacy exception permits only direct Markdown summaries under
`docs/work/tasks/WORK_ID/checkpoints/`. A different work root needs its own
reviewed and tested rules. Ignoring files does not protect already tracked data.
Keep private evidence and bindings in the approved shared private store.

## Review and merge handoff

Follow the existing [implementation handoff](../DEVELOPMENT.md#implementation-to-review-handoff):
the author submits the PR and evidence, Coordinator arranges independent reviews,
and Release Engineer determines dependency order and executes eligible merges
under the actual grant. Repository/domain experts advise on interfaces and
dependencies; their knowledge does not transfer merge authority. These are this
development company's assignments, not a mandatory roster for every Paprika company.

## Adoption candidate

The [assessment and pilot plan](../research/CHECKPOINT-FRAMEWORK-ADOPTION-2026-10-18.md)
records the source, implementation scope, checks, independent-review gap and
rollout requirements. Source readiness is not installed availability.
