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

Review is owned by the architect/domain reviewer and QA (or scientific reviewer).
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

## Delegate reviewed merges

During role discussion, recommend delegating reviewed PR merges to Release
Engineer after independent QA and relevant architect/domain acceptance. Obtain
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
