# Flexible checkpoint framework: adoption candidate

- Work ID: `INC-CHECKPOINT-ADOPTION`
- Date/timezone: 2026-10-18, Asia/Tokyo
- Status: `awaiting review`; local validation passed, independent acceptance pending.
- Assignment: Human-requested adaptation of an existing checkpoint/progress/reporting framework into reusable Paprika Inc skills and workflow.
- Accountable assessment author: Scientific Researcher under this specific assignment.
- Canonical source responsibilities: frontend-dev for plugin skills; backend-dev for packaging/scripts; coordinator for the work index.
- Required independent assessment: qa and backend-dev for the packaged procedure and packaging; chief-architect for the research assessment and relevance. Reviewer execution and acceptance are pending, not inferred from these names.
- Governing source: `4b84637673a88b12bb99bae4be85ce75ab3943db`.
- Installed baseline inspected: account plugin 0.3.3. This source candidate is not an installed update.

## Source and adaptation

The [source framework](https://github.com/vvv-ai/PaprikaLegalStaff/blob/87d9a18714c07a60366f20e199ee2fc2abc3e571/docs/coordination/work/README.md)
was inspected at immutable revision
`87d9a18714c07a60366f20e199ee2fc2abc3e571`, including templates, knowledge/work
entrypoints, adoption/ownership records, the completed source task and
[checkpoint privacy tests](https://github.com/vvv-ai/PaprikaLegalStaff/blob/87d9a18714c07a60366f20e199ee2fc2abc3e571/tests/test_checkpoint_ignore.py).
The source's acceptance record identifies a corrected candidate after QA found
a Markdown-directory ignore bypass. Its review and rollout are evidence about
that source, not independent approval of this adaptation.

The new procedure and templates are original generic Paprika authoring informed
by those materials. Domain rules, concrete role rosters, work IDs, conversation
content and private bindings from the source are not redistributed. The source
tree has no root license file; this is not a vendored dependency or a claim that
the entire upstream repository has an open-source redistribution license.

## Resulting behavior

- One packaged [procedure](../../plugins/paprika-inc/skills/setup-paprika-inc/references/work-checkpoints.md),
  linked from both existing skill entrypoints and the onboarding workflow.
- Six [template resources](../../plugins/paprika-inc/skills/setup-paprika-inc/assets/work-checkpoints/README.md):
  template index, task, findings, checkpoint, checkpoint index and role page.
- A [company work/knowledge index](../work/README.md), linked from the company README,
  that reuses the existing ownership map and marks adoption pending.
- The package allowlist explicitly includes the procedure and every template.
- A narrow summary exception under `docs/work/tasks/WORK_ID/checkpoints/`,
  including protection against nested directories with a `.md` suffix.
- [Behavior tests](../../tests/test_work_checkpoints.py) use real files, isolated Git
  configuration, ignore checks and untracked discovery. A mutation check verifies
  that removing the last directory exclusion exposes the original failure class.

The shared update is objective, progress/findings, blockers/decisions and next
action. Detailed checkpoints are event-driven; evidence fields vary by role.
Host-required commentary and explicit human reporting preferences still apply.
There is no new command, manifest setting, automatic task creation, timer,
subscription, permission, model change or live-role rollout.

The prior local agent-efficiency review recommended independently checked
outcomes, retained decisions and bounded coordination. This candidate addresses
traceability and repeated reporting; it does not establish faster or better
agent results. Existing scientific and engineering skill packs remain pinned
and unmodified, avoiding a second copy of their procedures.

## Compatibility with Paprika's existing workflow

The complementary mechanisms are short shared updates, evidence appropriate to
each role, preserved resume history, traceable decisions, privacy boundaries and
separate review/adoption states. Importing the source's company-specific choices
verbatim would create the following conflicts; this candidate resolves them.

| Source assumption or possible conflict | Paprika rule retained and adaptation |
| --- | --- |
| File-based task status could duplicate existing work tracking | [GitHub issues and PRs remain canonical](../DEVELOPMENT.md). Templates supply missing records and supporting knowledge; indexes link to the selected task record. |
| Fixed source paths, work IDs and role roster | Generic templates use configurable logical conventions; this company's supporting knowledge root is `docs/work/`, with its existing ownership map. |
| Source Coordinator's particular merge grant | Paprika's author submits the PR, Coordinator arranges review, and [Release Engineer sequences eligible merges](../../company/roles/release-engineer/agent.md). Repository experts supply dependency evidence. No role-authority change is proposed. |
| Event-driven checkpoints read as suppressing required updates | Detailed checkpoints follow useful events; host-required commentary and explicit human reporting cadence continue. |
| One writer interpreted as exclusive file ownership | Temporary shared-file editing coordination only; responsibilities remain nonexclusive and no runtime lock is claimed. |
| A source rollout receipt treated as acceptance here | Independent review applies to this candidate's exact head; source, merge, release, installation and role adoption remain separate. |

No legal-domain policy, fixed roster, automatic reporting timer or new authority
is imported. The user's merge-sequence decision is implemented by retaining the
existing Coordinator/Release Engineer split, not changing the generic product's
role requirements.

## Acceptance and review

| Criterion | Evidence/state |
| --- | --- |
| Small shared minimum and optional domain evidence | Procedure and templates authored; independent assessment pending |
| Canonical task state and consistent resume pointers | Procedure specifies task/index/role update together; manual-authoring workflow, not runtime enforcement |
| Preserved findings/checkpoints and concurrent-write limits | Explicit correction and designated-writer guidance; no lock claim |
| Generic configured paths and roles | Portable templates; company-local root documented separately |
| Confidential/runtime checkpoint exclusion | Three real-Git tests, 21 paths, plus mutation demonstration passed locally |
| Package resources are included and standalone links resolve | Explicit seven-file allowlist; package and extracted-artifact checks recorded below |
| Concrete independent reviewer and exact candidate | Logical qa/backend-dev/chief-architect contracts identified; live review request/acceptance pending |
| Exact-version adoption and receipts | Pending independent review and authorized rollout; no receipts claimed |

The exact candidate is the eventual commit/PR head plus its changed artifacts.
Do not store a commit's own hash in its own content. Record independent review
against the actual head after it exists; a later changed head needs its applicable
review repeated.

## Light pilot plan

Use three existing roles covering research, engineering and QA/coordination on
six representative authorized tasks. First calibrate with fictional data; no
live communication or paid experiment is authorized by this plan.

1. **Resume:** After a meaningful pause, have the authorized role identify the
   correct scope, source revision, unresolved issues and next action from the
   task/findings/checkpoint. Record missing context and time to resume.
2. **Coordinator understanding:** Ask the coordinator to determine owner, current
   state, blocker and next action from linked records. Count contradictions and
   requests for duplicate reports.
3. **Traceability:** Sample substantive findings and review claims; verify their
   evidence and exact versions, including a correction and a failed check.
4. **Overhead:** Record time spent writing/reading records versus task work and
   an agreed baseline. Ask whether the chosen fields helped each role. Remove
   redundant prompts rather than forcing equal paperwork.
5. **Pointer/concurrency rehearsal:** Exercise a stale latest pointer and two
   colliding proposed checkpoint names in a fictional workspace. Reconcile all
   entries without silently losing history.
6. **Portability/privacy:** Repeat ignore/discovery checks on the intended target
   operating system. Keep raw evidence private; source tests do not establish
   Windows behavior or cross-role outcomes.

Set practical success thresholds before the pilot. Require no lost unresolved
work or private-data exposure; judge usefulness and overhead on observed tasks.
Do not claim productivity uplift from read/adoption receipts or fixture tests.

## Rollout after acceptance

Use the existing [self-development process](../architecture/SELF-DEVELOPMENT.md).
An authorized release owner selects the reviewed source/definition/package
references and rollback inputs. If a package is distributed, assign its release
version through the existing release process; this candidate retains the base
version and is not a replacement release archive.

At a suitable work boundary, use only the already-authorized delivery route to
send the adopted revision and procedure references to affected roles. Verify
each role's exact-version read/adoption response privately; keep it separate
from initial onboarding. Preserve unresolved assignments and old receipts.
Source readiness, merge, release, installation and actual role adoption remain
different states. This task has performed none of those rollout steps.

## Validation record and next action

Local checks passed on the candidate implementation:

- Repository validation: seven role contracts, local links, 24 acceptance
  scenarios and pinned dependency/skill payload consistency.
- Plugin validation: 135 contained package files.
- Package preparation: 136 archive entries including generated metadata; all
  seven checkpoint resources and their eight local links resolve in the export.
- Python suite: 33 passing tests, including three checkpoint privacy tests and
  deterministic archive/extracted-package checks.
- Node suite: 129 passing tests.
- Whitespace validation: `git diff --check` passed.

The source tests use fictional data. They establish no live adoption, messaging,
productivity gain or Windows certification. The final documentation checks and
candidate revision are recorded in the PR handoff.

Next action: submit the concrete candidate for independent assessment. Coordinator
arranges the relevant reviews; Release Engineer sequences and executes an eligible
merge under the existing grant. The author cannot supply that independent
acceptance. Release and live adoption remain separate from source integration.
