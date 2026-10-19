# Shared company catalog

## Picker entrypoints

When the host exposes `company_catalog_open`, use it for company initialization
and requested restructuring. The shared panel has a **Company action** selector
and a **Configure role** dropdown. Choose initialization before first authoring;
for restructuring, open the existing saved selection/export before changing its
type or structure. Reuse an already explicit company choice without prompting
again. Plain catalog tools are the fallback when the panel is unavailable.

The standalone source at `apps/company-catalog` runs with Node.js 24+: install its
locked dependencies using `npm ci --ignore-scripts`, build with `npm run build`,
then `npm start` from that directory. Open the printed loopback address with
`?mode=initialize` or `?mode=restructure`. This source app is not automatically
installed by the skill package. Its stdio `mcp-server.mjs` can be configured through
supported host settings separately; ChatGPT needs a reachable authenticated MCP
service. Do not claim native registration or rendering from local browser tests.

Restructuring preserves existing identity and roles, adds target-required roles,
and produces a reviewable draft. Retire or remap obsolete roles explicitly after
review. Live role chats, active work and installed files are not migrated. Existing
file conflicts remain blocked by protected authoring. A legacy company without a
saved selection requires explicit mapping of its definitions, not replacement
with preset defaults.

## Catalog commands

Use `node <paprika-inc-skill>/scripts/inc.mjs catalog list` to read the shared
versioned catalog. `catalog search --query research --catalog-kind preset` filters
the same data. `catalog read --catalog-kind preset --catalog-id scientific-research`
returns the exact template and a complete `default_selection` with its catalog
version/digest. Save that selection privately while configuring the draft.

The six entry kinds are preset, structure, role, pack, workflow and requirement.
Software and scientific-research templates are usable drafts. Planned entries
remain visible but cannot become an exported usable configuration. Industry,
structure and business-model tags are independent. Reporting parents and peer
reviewers have different meanings; mutual review is permitted, self-review is not.

`config validate --selection draft.json` checks IDs, graph constraints, dependencies
and catalog freshness. Optional `--catalog-context observations.json` accepts schema
1, a host (`codex-local`, `chatgpt` or `standalone`) and non-secret capability IDs.
Omitted observations are unknown; an observed empty list reports missing. Caller
observations do not prove execution, authentication or task quality. The blueprint
bootstrap remains local Codex; a portable draft can still be exported from other
surfaces with unsupported requirements explicitly reported.

`config preview --selection draft.json --repo <chosen-repository>` uses protected
authoring to show differences and existing-file conflicts. It writes nothing.
`config export --selection draft.json` returns the portable selection and a schema-1
`blueprint` in JSON. It does not save, install, create chats, connect tools or apply
the blueprint. Keep the selection beside the blueprint: reporting, display name,
business tags and workflow choices are configuration metadata, not implemented
orchestration fields in the existing blueprint format.

Refresh and review stale selections instead of silently reassigning IDs. Before
separately authorized application, revalidate the retained selection and preview
the actual destination again, then use the existing `author plan`/`author write`
workflow on its blueprint. Do not treat an old exported blueprint as a freshness
token. Preserve all user files and existing grants.
