# Shared company catalog

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
