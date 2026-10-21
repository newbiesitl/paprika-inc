# Company catalog maturity

This change imports the 2026-10-19 research table in [issue #30](https://github.com/newbiesitl/paprika-inc/issues/30)
as selectable starter content. The [retained source snapshot](company-persona-landscape-2026-10-19.json)
contains all 43 family rows, their 139 role mentions (131 distinct exact names),
skill candidates and example workflows. It imports no third-party skill payload.
Governing source revision for this assignment: `9a6f3f775a33b5f7f2e686d18c3a3e08917b4f52`.
Source publication does not adopt different instructions into live roles.

## Collections

| Collection | Company presets | Unique role templates | Meaning |
| --- | --- | --- | --- |
| Essential | 2 | 7 | Existing software/research starter templates and bundled optional guidance |
| Extensions · In development | 43 | 130 additional | Research-derived starters that can be configured and exported for refinement |
| Combined | 45 | 137 | All selectable templates |

Release Engineer is one of the research's 131 distinct names and already belongs
to Essential. Its stable ID and established contract are reused. Marketing agency
keeps its previous ID and moves from planned to an Extension starter; Marketing
core remains planned and is not selected. Similar titles such as QA and QA Engineer
remain distinct IDs; the source count deduplicates exact names only.

Essential describes the existing collection, not universal professional competence
or live-tool certification. Availability (`template`, `available`, `planned`) and
collection tier (`essential`, `extension`) are independent. Legacy entries without
a tier display under Essential. The catalog version/digest changes, so old drafts
need explicit refresh/revalidation while preserving their edits.

## Definition depth

The original research supplies a family label, three or four role names, suggested
skills and one example workflow per family. It has no complete professional role
contracts, jurisdiction-specific rules, tool bindings or task-quality benchmarks.
The imported personas add an individually written role focus, purpose,
responsibilities, inputs, expected evidence, boundaries and escalation guidance.
Each family has a default coordinator/team, an ordered workflow and disjoint
deliverable ownership paths. These are first-pass definitions, not independent
domain acceptance. The same role name is shared across families and must be
refined for the selected company's context.

Extension defaults select no skill packs or integrations. The existing research
and engineering packs are optional guidance, not implementations of the source's
domain skill candidates. Empty reviewer lists explicitly require human review;
do not infer that two catalog personas are qualified to review one another.
Select a qualified reviewer and applicable standards before adopting a refined
contract. Reporting lines organize drafts; they do not implement a new supervisor.

## Remaining work and blockers

There is no data-model blocker to selecting and exporting these starters through
the existing setup UI. The normal 100-role limit applies to one company roster;
it does not limit the size of the browsable catalog.

Operational maturity requires a separate scoped task for each intended workflow:

1. Refine responsibilities, domain, inputs/outputs and acceptance criteria.
2. Specify qualified review, jurisdiction, privacy and applicable operating rules.
3. Select and review procedure packs; implement or reuse actual tool adapters.
4. Configure private credentials, tenants, endpoints and host capabilities.
5. Evaluate representative tasks, failure paths and output quality independently.

Catalog export and contract validation can be tested now. They do not establish
professional qualifications, solver/model validity, authenticated service access,
or native Codex/ChatGPT rendering. Publishing an updated plugin or deploying the
UI remains separate from this repository change.

## Maintenance

`node scripts/expand-company-catalog.mjs` deterministically regenerates Extension
content from the retained snapshot and the maintained first-pass role focuses.
`--check` detects drift. Essential contracts are preserved. New research rows or
role focuses need review rather than an implicit upstream import. The generated
catalog remains the single packaged/UI inventory. README generation reads the
same catalog through `node apps/company-catalog/readme.mjs`.
