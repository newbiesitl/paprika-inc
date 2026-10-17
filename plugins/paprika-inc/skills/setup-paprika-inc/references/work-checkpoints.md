# Flexible work tracking and checkpoints

Use this procedure for requested task tracking, progress reports and resumable
handoffs within an existing assignment. It adds no scheduler, runtime lock,
execution grant, messaging authority or automatic adoption. Existing company
instructions and human preferences govern its use.

## Select the company's records

Reuse the selected company's current work index and knowledge store. Agree a
work root, ID convention, timezone and canonical role/ownership sources only
when they are missing. Record those choices once in the company's work index;
these are documentation choices, not new CLI flags or manifest fields.
Do not create a second tracker when equivalent records already exist.
An existing issue or project item can be the canonical task record. Use the
file templates only for missing records or supporting knowledge; link back to
the existing task rather than duplicating its status, owner or acceptance.

A portable example layout is:

```text
<work-root>/
  README.md
  roles/<role-id>.md
  tasks/<work-id>/
    task.md
    findings.md
    checkpoints/
      README.md
      YYYY-MM-DD-NNN.md
```

Use [the templates](../assets/work-checkpoints/README.md) as prompts, adapting
paths and useful sections to the company. Templates contain logical roles and
relative-path placeholders, never live bindings. File creation must fall within
the human's actual request. Preserve existing records; reconcile collisions
instead of replacing them.

| Record | Canonical content |
| --- | --- |
| Work index | Priorities, dependencies, role/task links and the configured conventions |
| Role page | Links to the contract, owned/review tasks and current checkpoint |
| Task | Current scope, accountable owner, reviewers, status, acceptance and next action |
| Findings | Dated evidence, hypotheses, decisions, uncertainty and linked amendments |
| Checkpoint and index | Preserved resume history and the latest checkpoint pointer |

Task state lives in the selected canonical task record, whether an issue,
project item or file. Indexes and role pages link to it rather
than keeping competing status summaries. The coordinator consolidates cross-role
progress; task owners maintain their evidence.

## The small shared reporting minimum

A meaningful routine update needs only:

- Work ID and current objective.
- Progress or findings, with links to existing evidence.
- Blockers or decisions needed.
- Next action.

A short paragraph or four bullets is enough. Do not require a fixed reporting
timer, invented percentage complete, repeated findings or identical paperwork
from every role. This guidance does not suppress a host's required progress
updates or an explicit human reporting cadence. Short sessions may use a brief
linked update without a separate detailed checkpoint.

Task setup records authorized scope, one accountable owner, independent
reviewers, dependencies, inputs, acceptance criteria and artifact locations once;
update these when they change. A task record documents a grant; it cannot grant
authority to its writer.

## Choose evidence that fits the work

| Work | Useful evidence when relevant |
| --- | --- |
| Research | Question/hypothesis, methods, results, sources and uncertainty |
| Data | Provenance, transformations, split versions, quality and leakage checks |
| Inference | Model/settings, runtime/hardware, quality, performance and measurement conditions |
| Domain analysis | Relevant decisions, constraints, alternatives and uncertainty |
| Application engineering | Design decisions, changes, reproducer and validation |
| QA/review | Exact candidate, findings, failures, acceptance checks and coverage limits |
| Release | Artifact versions, dependencies, readiness, authorization and rollback |
| Coordination | Priorities, ownership, dependencies, decisions and outstanding review |

Omit irrelevant fields. Substantive claims still need traceable evidence.
Record exact source/data/model/runtime/artifact versions that matter to the claim,
and distinguish committed source from uncommitted changes. Mark required missing
evidence unverified. A manifest or DOI identifies an artifact; it does not prove
its contents or a claim are correct.

## Save and resume

1. Resume from the selected source's instructions, exact role contract/page,
   assigned task, findings and latest checkpoint. Check scope and prerequisites.
   If a pointer is missing or stale, inspect the index/history and reconcile it;
   do not silently discard unresolved work.
2. Save a detailed checkpoint at meaningful experiment completion, review
   submission, a significant blocker or a handoff. Link evidence already recorded
   and state what the next session needs to do.
3. Choose an unused date/sequence name in the recorded timezone. Preserve previous
   checkpoints. Correct a checkpoint with a new linked entry; amend a finding
   without erasing earlier evidence.
4. Update the checkpoint index, task's latest pointer/status/next action, and
   applicable role pointers together in one reviewable change. Keep a pointer
   absent with an explicit reason rather than inventing a checkpoint.
5. Before review or acceptance, freeze the candidate revision or immutable
   artifact digest and record what was actually checked. Author completion,
   independent acceptance, merge, publication, installation, delivery submission,
   recipient read and recipient adoption are distinct evidence states.

A checkpoint is a resume description, not a source checkout or model checkpoint.
Recovery still needs the referenced inputs, environment, private artifacts and
actual grant. Reverify another host rather than claiming portability from a
local test.

## Task states and review

Suggested states are `proposed`, `authorized`, `in progress`, `blocked`,
`awaiting review` and `accepted`; map them to an existing tracker if needed.
Record why work is blocked, what resolves it and the intended resume state.
Progress means acceptance evidence achieved. Finished author work becomes
awaiting review; acceptance names the independent reviewer, exact candidate,
result and applicable decision. Preserve rejected reviews when a new candidate
is submitted. Do not supply your own independent approval or infer release
permission from acceptance.

Use the company's canonical ownership map and current role contracts. If the
required reviewer is unavailable, record the gap and use the company's existing
human-review/escalation path. Do not invent a replacement role or communication
grant. Reopening accepted work requires an authorized follow-up or scope amendment.

## Concurrent work and privacy

Coordinate one active writer for a shared task file while editing. This temporary
editing arrangement does not change ownership or grant exclusive file access.
Other contributors provide proposed
findings through the existing review process or an authorized message. Sequence
numbers are names, not locks. Resolve concurrent edits before merging, preserve
every entry and update links if a newly created checkpoint must be renamed.
Do not infer lifecycle or multi-host concurrency enforcement from these files.

Commit only sanitized summaries. Keep confidential inputs, private annotations,
credentials, native IDs, service/board bindings, model weights and runtime journals
in the company's approved private store shared by its worktrees. Use logical
artifact references in Git, resolve real paths privately, and exclude private
evidence from plugin exports.

Ignore rules are a precaution, not access control or a way to remove previously
tracked data. Inspect staged/untracked files before committing. If a company
chooses this layout, adapt and test the following example for its work root:

```gitignore
# Keep runtime/model checkpoint trees private.
checkpoints/
# Permit only direct Markdown summaries in the chosen task directories.
!docs/work/tasks/*/checkpoints/
docs/work/tasks/*/checkpoints/*
!docs/work/tasks/*/checkpoints/*.md
# A directory ending in .md must not expose its children.
docs/work/tasks/*/checkpoints/*/
```

Test real files in an isolated Git repository, with ambient GIT_ variables
cleared and system/global config disabled. Check both ignore results and
untracked discovery. Include another task, nested Markdown, binary/private
files, misleading `archive.md/` directories, and unrelated checkpoint trees.
Do not assume a changed work root is protected by this example.

## Reports and versioned adoption

For an authorized outbound report, use the existing
[task dispatch and delivery workflow](adaptive-delivery.md#task-dispatch-and-reports),
the verified private return recipient and dedicated company board. Preserve
reply/chain state and uncertain outcomes. If the grant or route is absent,
surface the report in the current chat. Never turn a checkpoint into a new
subscription, background poll, automatic reply or broadcast.

A source adaptation is a review candidate. After independent review and the
applicable human adoption decision, select an immutable revision, retain rollback
inputs, and use the existing authorized onboarding/notice route. Record each
role's exact-version read/adoption receipt privately. Do not replace initial
onboarding receipts or treat message storage, submission or a read receipt as
adoption. An old installed plugin does not gain this procedure because source
changed.

## Provenance and evidence limits

This is original generic Paprika guidance informed by the human-requested
[checkpoint framework](https://github.com/vvv-ai/PaprikaLegalStaff/blob/87d9a18714c07a60366f20e199ee2fc2abc3e571/docs/coordination/work/README.md)
and its
[privacy regression](https://github.com/vvv-ai/PaprikaLegalStaff/blob/87d9a18714c07a60366f20e199ee2fc2abc3e571/tests/test_checkpoint_ignore.py).
The source's role names, task IDs, private records and domain-specific rules are
not packaged. Its observed rollout is not evidence of productivity gains here.

Pilot resumability, accurate coordinator status, traceable findings and reporting
overhead before claiming improvement. A local fixture proves only the behavior
it checks; cross-role operation and other operating systems need their own
evidence.
