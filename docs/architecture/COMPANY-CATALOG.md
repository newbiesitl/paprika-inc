# Company catalog contract — version 1 candidate

Work: CAT-BE-01, issue #30. This slice is stacked on draft foundation #29 at
49af108946ffc0c58792995302d1ea54ee40855b. Governing definition remains
ae6080186ceb83cbdfd1b23bbfe532f8c0a678f4. Contract review and independent QA are
pending; these interfaces are proposals, not release or native-host acceptance.

## Shared data and operations

The packaged `runtime/company-catalog/catalog.json` is the single catalog for
backend reads, frontend views and README generation. IDs are stable within each
entry kind. The contract is described by `runtime/company-catalog/contract.d.ts`.
JSON fixtures live in `tests/fixtures/company-catalog/`. The catalog has a semantic
version and a SHA-256 digest of recursively key-sorted JSON; ordering of arrays
remains significant. Consumers must retain both in every selection.

Implemented host-neutral operations:

| Operation | Input | Output |
| --- | --- | --- |
| `catalog list` / `catalog search` | optional kind/query | catalog identity and matching entries |
| `catalog read` | exact kind and ID | exact entry and catalog identity |
| `config validate` | selection; optional capability observations | diagnostics, roster, separate requirements/evidence dimensions |
| `config preview` | same selection plus chosen repository | validation and existing protected `author plan` diffs/conflicts |
| `config export` | same selection | portable selection and schema-1 authoring blueprint |

All six operations are read-only. There is no new remote filesystem writer or
automatic application endpoint. Preview delegates to existing protected authoring.
Export is a draft, not an application token: a consumer must revalidate its retained
selection against the current catalog and preview the actual destination before
separately authorized `author write`. Existing user files are never replaced.

## Composition and boundaries

Industry/preset, organization structure and business-model tags are independent
choices. The first usable presets are software-studio and scientific-research,
derived from the existing shipped blueprints. Their existing research-core and
engineering-core selections remain defaults. Planned entries remain browsable but
cannot be exported as usable templates. This does not implement the other issue
#30 connectors or assert their availability.

Each selected role specifies packs, workflow IDs, a reporting parent and independent
reviewer IDs. Required preset roles cannot be removed. Optional roles may be removed
only when all remaining references are valid. Adding roles uses the same catalog
templates. Reporting is a rooted acyclic tree; the coordinator is its sole root.
Flat structures require direct reporting to that root. Review cycles are allowed
(mutual independent review); self-review, duplicate edges and missing peers are
invalid. Empty reviewer lists explicitly require human review. An optional `title`
is nonempty single-line display text up to 160 characters and never changes role ID.
Preset ownership and its reviewer edges remain independent of role review edges.
Newly added roles use template ownership paths and selected peer reviewers. The
existing ownership validator rejects overlaps, dangling reviewers and unsafe paths.

The blueprint format has no reporting field. Export therefore preserves reporting,
display name, business tags and workflow choices in the portable selection beside
the authoring blueprint; it never silently claims they are implemented orchestration.

## Evidence and errors

Results keep catalog availability, bundled package presence, local configuration,
connection/authentication, native-host verification, task-quality acceptance and
release state distinct. Readable source files or declared capabilities cannot turn
all dimensions into ready. Capability observations are bounded non-secret IDs;
they are not authentication evidence. Unobserved requirements stay unknown, an
observed empty capability list means missing, and host exclusions mean unsupported.
Missing runtime prerequisites do not prevent exporting a valid portable draft.

No credential fields, native chat IDs, local machine paths or arbitrary executable
adapters are accepted in portable selection data. Unknown fields fail validation.
Invalid selections return path-addressed diagnostics and no partial blueprint.
Stale catalog version/digest fails before preview/export. Conflict previews retain
the draft and expose existing-file differences without changing any file.

## Review fixtures

Fixtures include both complete baseline selections, a missing capability context,
self-review, reporting cycle and stale catalog cases. Runtime tests cover
unknown/duplicate IDs, required-role removal, planned packs, hostile fields,
ownership conflicts and destination-file preservation. UI accessibility and
actual native rendering belong to the frontend/QA checkpoints, not this backend's
fixture results.
