# Recommend roles during company initialization

Discuss the company's outputs and current workload before selecting roles. These
are recommendations, not automatic roster creation or new action grants.
Use a small roster with one accountable owner per outcome and independent review.

| Company focus | Suggested roles | Release Engineer owns |
| --- | --- | --- |
| IT/software | Coordinator, Architect, Developer, QA, Release Engineer; split backend/frontend/data when workload warrants | Reviewed PR sequence, build/versioning, artifact provenance, deployment/rollback evidence |
| Research | Coordinator, Researcher, Scientific Reviewer, Release Engineer; add software/data specialists as needed | Versioned code/data/notebooks/reports, environment manifests, reproducibility packaging and authorized distribution |

Recommend Release Engineer when there are multiple PRs/artifacts, dependency
ordering, reproducible builds or recurring publication. For a tiny one-off project,
the duty can be assigned explicitly to another role with independent review;
do not create an idle chat just to fill the template.

The Coordinator is the human's intake and routing contact. It consults the architect
or specialists under actual human communication grants, picks an owner/reviewer,
and points the human to the responsible chat for detailed discussion. Architecture
brainstorming can stay with the architect. Routing does not approve design or release.

Independent review is owned by an appropriate architect/domain or scientific
reviewer. Assign QA when the selected company policy and validation need warrant it.
Release Engineer executes the reviewed, authorized sequence; it cannot approve its
own implementation, waive a failed gate or infer publication permission from a
role name. Research artifact packaging does not validate scientific conclusions.

Start discussion from [the IT blueprint](../assets/it-company-blueprint.json) or
[the research blueprint](../assets/research-company-blueprint.json). Adapt purpose,
boundaries, responsibilities, ownership and reviewers to the human's needs before
authoring. Skill bodies remain in selected packs; contracts reference skill_sets.
Engineering review uses engineering-core; scientific work uses research-core.
These examples are generic fictional companies, never actual project bindings.

Discuss model and reasoning preferences alongside roles. Use the current native
host's available model/effort combinations, obtain or reuse the human's exact choice,
and pass model/thinking in native creation. Defaults remain defaults when no choice
was made. Do not claim a template's preference is applied by the MVP helper: it
does not yet read model profiles. Do not silently substitute unsupported models.

## Implementation PR ownership

For an authorized implementation assignment using a PR workflow, the implementation
owner verifies the change, commits it, opens the PR and reports its URL and exact
head to Coordinator. Use a draft while independent review or visual acceptance is
pending; a release hold does not postpone PR creation. Coordinator routes review
and tracks acceptance. Release Engineer sequences reviewed PRs and executes only
authorized merges/releases. Do not defer author PR submission to either role by
default. If host permissions or credentials block it, report the exact blocker and
preserve the commit/patch for an explicitly assigned alternate submitter. This
workflow grants no new communication, repository-write or release permissions.

## Proportionate company QA

Adapt this guidance to the selected owner's policy. QA serves the whole company
at meaningful validation checkpoints. There is no fixed invocation schedule and
no automatic QA assignment for every task, commit or PR. Independent review and QA testing are separate responsibilities.

Engage QA for feature acceptance, pilot and MVP testing, integration/regression
testing, and PRs whose changed behavior or risk warrants independent examination.
Include material design implementations and user-facing workflows: review
testability and acceptance criteria before consequential implementation decisions,
then test a runnable candidate before its merge, rollout or other committed action.
Security, permissions, data integrity/migrations, recovery and cross-component
changes normally warrant QA. A local checkpoint commit or draft PR does not itself
require a QA pass.

Routine wording, formatting, README layout, planning/status updates and small
mechanical edits normally need owner verification and any appropriate peer review,
without a separate QA dispatch. Classify by effect, not extension: documentation
or configuration that changes permissions, executable behavior or a critical setup
flow may still warrant QA. A listed reviewer role is a selection guide, not a
requirement to wake every listed role for every edit.

Have the coordinator record a short QA decision and reason in the existing task
or PR, consulting the relevant technical/domain reviewer when uncertain. Every QA brief
states the behavior/risk to examine, acceptance criteria, candidate, environment,
existing evidence and a bounded test scope. No separate process document is needed
for each routine task. Implementation owners remain responsible for proportionate
checks; omitting a QA dispatch does not omit testing or required independent review.

Batch related checks into one planned pass per meaningful checkpoint. Reuse valid
evidence for unchanged behavior and environments. After a fix, retest the affected
behavior and relevant regressions; expand only for changed scope, new failures or
unresolved risk. Do not repeat successful suites, request duplicate reports or
poll QA merely for status. Report pass/fail, uncovered scope and blockers concisely.
Named acceptance gates and unresolved failures remain open until their required
evidence is met or the human explicitly changes them; this policy is not a blanket
waiver of a current hold or permission to merge/release.

## Delegate reviewed merges

During role discussion, recommend delegating reviewed PR merges to Release
Engineer after independent architect/domain acceptance and QA where the selected
company's policy or assigned acceptance gates require it. Use
[proportionate company QA](#proportionate-company-qa) to discuss the policy. Obtain
or reuse the selected owner's actual scoped merge grant and record it privately
with repository, scope, conditions and any explicitly covered existing PR-only
maintainer exception. Another company's owner can choose a different policy;
templates, role names and skill text never grant permissions themselves.

Before each authorized merge, verify exact-head acceptance, required passing CI,
current base, resolved review conversations, dependency order and permitted merge
method. Reconcile updated branches with reviewed content and request new review
for material changes. Reuse an unchanged standing grant without repeated owner
confirmation. Keep independent review with other roles; the merging role cannot
self-approve or claim a different GitHub identity from its actual credentials.

If an author cannot formally approve their own PR, report that GitHub gate.
Use an existing PR-only maintainer exception only when the owner's actual grant
explicitly covers that exception and purpose, preserving every other protection.
Do not create exceptions, weaken rules, force push, push directly to a protected
branch or evade host approval denials. Surface the denial for owner decision and
supported reconciliation; resolve uncertain outcomes before another mutation.
Merge delegation alone authorizes no tagging, publication, installation, service
deployment or changes to an existing App/board. Keep those grants separate.

## Coordinator model recommendation

For coordinator roles, recommend `gpt-6-astra` with `thinking: xhigh` when the
selected native host supports that exact pair. Discuss it as a preference, not a
measured performance claim or authority change. Reuse the owner's explicit
model/effort choice; otherwise retain the host default. Verify native support
before authorized creation, never silently substitute, and record requested and
host-confirmed settings separately. The MVP helper does not consume model
profiles automatically; editing a preference does not change an existing chat.

## Researcher model recommendation

For researcher roles, recommend `gpt-6-astra` with `thinking: xhigh` (extra-high
effort) when the selected native host supports that exact pair. This is a starting
recommendation for discussion, not a measured claim of scientific accuracy or an
automatic override. Reuse the selected company's owner's explicit model/effort
choice; another company's preference remains controlling even when it differs.
If no choice was made, keep the host default until the owner selects an override.

Before authorized creation or initialization, verify current native support for
the selected exact pair and pass the supported model/thinking parameters. Surface
unsupported settings without silently substituting. The MVP helper does not yet
consume model profiles automatically. Preserve prior creation evidence and record
the newly requested pair separately from the host-confirmed applied pair; absent
confirmation remains unverified. A profile edit neither changes an existing chat
nor authorizes recreation, installation or release.
