# Company catalog UI candidate

The setup picker groups **Essential** templates and **Extensions · In development**.
Essential retains 2 presets and 7 personas; Extensions adds the 43 researched
company families and 130 additional personas (Release Engineer is shared).
Use Template collection to narrow company types, and Role collection to browse
selected, Essential or Extension personas. All can be configured/exported as
drafts. Extension contracts need refinement and qualified review; domain tool
access and task quality remain unverified. See [maturity](../../docs/research/COMPANY-CATALOG-MATURITY.md).

CAT-FE-01 for [#30](https://github.com/newbiesitl/paprika-inc/issues/30), connected to the shared Backend catalog in draft #31 and the foundation in draft #29. Governing definition: ae6080186ceb83cbdfd1b23bbfe532f8c0a678f4.

This is the catalog/configuration slice of [the standalone GUI](https://github.com/newbiesitl/paprika-inc/issues/15). It does not implement agent hosting. One component and one backend inventory serve the standalone route and native MCP App resource. Existing plugin identity, credentials, service, hosting and installed configuration remain unchanged.

## Run locally

Use Node.js 24 or newer, from the repository root:

```sh
npm --prefix apps/company-catalog ci --ignore-scripts
npm --prefix apps/company-catalog run build
npm --prefix apps/company-catalog start
```

Open the printed loopback URL. Only reads, validation, preview and portable export are exposed. The service checks Host/Origin, limits JSON input and exposes no filesystem writer. Project selection is unavailable in the panel; enter a portable repository owner/name, then select the actual destination through the authorized host workflow when applying.

## Initialization and restructuring

For initialization, open `http://127.0.0.1:4317/?mode=initialize`. Choose a company,
select **Configure this template**, and edit the company identity, organization
structure and roles. **Configure role** is a dropdown for focusing a role card;
select **All roles** to view the roster. Cards provide role inclusion, display
title, reporting-parent dropdown, independent reviewers, skills and workflows.
Review the configuration and retain its complete selection for future edits.
The intended authoring sequence is picker, blueprint, LLM refinement, validation
and human/peer review, then repository files. **Download AI refinement brief**
packages the blueprint and company context for your chosen LLM chat. When a native
host advertises text-message support, **Refine with AI in this chat** explicitly
hands the same brief to the current conversation. This is a handoff, not proof of
LLM completion, validation or acceptance. No API key or background LLM call is used.

**Download repository files (starter)** generates a ZIP with the real canonical
layout, including `company/company.json`, `company/ownership.json`, shared policy
files, every `company/roles/<role-id>/agent.md`, and `company/catalog-selection.json`.
These deterministic files contain template prose until refined. The refinement
brief instructs the LLM to preserve IDs/relationships, tailor the role text, then
use `author plan --spec <refined-blueprint.json> --repo <chosen-repository>` to
validate and preview the actual contracts before application. Keep the refined
blueprint separately: reopening a catalog selection does not import polished prose.

Extract starter files into a scratch directory for review. Add reviewed files under
the repository's `company/` directory; do not blindly extract over existing files.
For a real destination diff, set `PAPRIKA_CATALOG_REPO` to its absolute directory
before starting the local server. This setting stays local and is not accepted
from browser inputs. Existing-file conflicts remain visible; a structurally valid
proposal can still be exported without overwriting them. Authoring definitions and
bootstrapping chats remain separate actions in the existing setup workflow.

For restructuring, open `http://127.0.0.1:4317/?mode=restructure`, or select
**Restructure an existing company** in **Company action**. Open that company's
saved draft or export first. Changing type retains its identity, structure, tags,
existing roles and edits, and adds any missing required roles. Review obsolete
roles, reporting relationships, reviewers and ownership explicitly. Changing
structure never silently rewires the organization. Incompatible choices are
reported by validation; stale catalog identities require explicit revalidation.

This is a configuration proposal, not a live migration. Existing definition
conflicts must be reviewed; protected `author write` does not replace them.
Live chat reassignment, removal, work transfer and automatic migration are not
implemented. Companies created without a saved selection need an explicit
mapping from their current definitions first; do not initialize a replacement
company to simulate restructuring. All these controls also appear in the MCP App.

## Native integration

`mcp-server.mjs` exposes the provider over supported MCP stdio transport. `mcp.mjs` exports `createCatalogMcpServer` for integration into an authorized server process. The `company_catalog_open` tool declares the UI resource and a thread entrypoint. Read-only list/read/validate/preview/export tools remain available for plain-tool fallback.

The UI uses the official MCP Apps App bridge, detects server-tool capabilities, applies host styling and safe-area data, and renders a fallback when the bridge is absent. The built HTML is self-contained with no CDN scripts. A browser render does not prove native rendering. The resource is not installed into the current plugin. ChatGPT requires an authorized reachable MCP service; local stdio alone does not establish that route.

References: [MCP Apps](https://github.com/modelcontextprotocol/ext-apps), [Extensions entrypoints](https://github.com/openai/mcp-extensions/blob/main/docs/spec.md), [integration patterns](https://github.com/openai/mcp-extensions/blob/main/docs/patterns.md).

## Draft and evidence boundaries

- Selection creates no chats, messages, subscriptions, installations or connections.
- Save/open retains full versioned selections, including incomplete graph choices. Blueprint export requires current backend validation.
- Reporting trees, reviewers, ownership, packs and workflows remain separate.
- Refresh never silently updates the saved digest. Explicit revalidation retains edits and surfaces invalid references.
- Editing invalidates preview. Late results cannot authorize newer content.
- Recovery uses this tab's session storage; a downloaded draft is the portable durable copy.
- Catalog availability, package presence, local configuration, authentication, native-host verification, task-quality acceptance and release remain distinct.
- Integrations use backend-provided status; RDKit remains optional/deferred and is never automatically selected.
- Application uses existing protected author plan/write and separately requested bootstrap.

## Verification

```sh
npm --prefix apps/company-catalog test
npm --prefix apps/company-catalog run readme:check
npm --prefix apps/company-catalog run test:browser
npm --prefix apps/company-catalog run test:production
```

The browser suites use Playwright and axe. Install Chromium if absent, or set
PLAYWRIGHT_CHANNEL=msedge for an available Edge installation. `test:browser`
covers fixture states and a simulated host using the official AppBridge.
`test:production` starts the actual backend on port 4318 and checks initialization,
role editing, export and restructuring draft preservation. Actual Codex/ChatGPT
acceptance is separate. QA's [matrix](https://github.com/newbiesitl/paprika-inc/issues/30#issuecomment-6260944113) remains the independent gate.

The build embeds the original Paprika logo unchanged. UI source remains outside the existing skill-plugin distribution.
