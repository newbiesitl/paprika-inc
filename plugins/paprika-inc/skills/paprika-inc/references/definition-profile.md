# Supported portable definition profile

This slice reads schema version 1, using the existing repository manifest profile. It does not introduce an ownership registry, assignment schema, knowledge store or adoption controller. An unsupported field/configuration is an explicit validation error, rather than silently passing a future schema.

The local MVP adds an optional `ownership` reference to the one canonical map. It uses `schema_version: 1` and `entries` containing exact relative file/directory `path`, declared `owner_role`, and distinct peer `reviewer_roles`. Prefix overlaps, case collisions, private/traversal/glob paths and unknown/self reviewers are rejected. Contracts point to that map rather than duplicating it. Legacy inspection remains available without the field; MVP bootstrap requires it in the selected committed revision. This portable ownership map is responsibility guidance, not a runtime ownership registry or permission grant.

The manifest contains `schema_version`, semantic `definition_version`, nonempty `status` (a declaration, never verified authority), stable lowercase `company_id`, declared `repository` in owner/name form, `coordinator_role`, and 1–100 `roles`. Each role has an exact lowercase `id`, semantic `version`, and unique relative `definition` path. The contract must contain exactly one `Role ID: ` line with the ID in backticks and one `Role version: ` line matching its version. There is no prescribed roster or inferred ownership-section parser.

Required shared documents: `constitution`, `work_tracking`, and `adoption.policy`. Documents are case-exact relative POSIX paths with no traversal, symlinks, empty components, backslashes, colons, or drive paths. References into `.git`, `.paprika`, `.codex`, `.agents`, `node_modules` or `.env` entries are rejected; a manifest cannot direct inspection into private state or credentials. Only regular UTF-8 files up to 256 KiB are read. Shared documents cannot be empty. The default manifest is `company/company.json`; `--manifest` supports an explicitly selected alternative.

The supported configuration is `topology: single_host`, `runtime: codex_local`, `knowledge_policy: private_runtime_location`, and `runtime_state: private_enrollment_required`. `messaging` declares on-demand receiving and no background monitoring. `lifecycle` declares one desired instance per role, required verified project membership and no automatic takeover. `adoption.automatic` is false. These are desired-definition checks, not implemented singleton/lifecycle enforcement or evidence of adoption. The expressly requested sequential MVP operates under the human bootstrap request with a small private progress record; full enrollment/registry/transfer machinery is future hardening.

Digests identify exact file bytes and the sorted file-hash inventory, scoped to working-tree inputs. They do not prove a reviewed Git revision, comprehension, authenticity, permissions, or semantic ownership consistency. CRLF is normalized only for parsing; hashes retain the original bytes. Review ambiguous/overlapping ownership before future apply. Prose is inspected as data, never used as an executable policy loader.

Roles may optionally declare `skill_sets` with `research-core`, `engineering-core`, both, or neither. Omission is
backward-compatible. Unknown, duplicate or nonarray selections are invalid. This
reference selects reviewed procedures, not tools, access or account installation.
Use the [research workflow](../../setup-paprika-inc/references/research-core.md)
or [engineering workflow](../../setup-paprika-inc/references/engineering-core.md) for explicit project-local materialization and separate capability reporting.
