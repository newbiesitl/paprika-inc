# Company catalog UI candidate

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
```

The browser suite uses Playwright and axe. Install its Chromium browser if absent, or set PLAYWRIGHT_CHANNEL=msedge for an available Edge installation. It tests browser fixture states and a simulated host using the official AppBridge. Actual Codex/ChatGPT acceptance is separate. QA's [matrix](https://github.com/newbiesitl/paprika-inc/issues/30#issuecomment-6260944113) remains the independent gate.

The build embeds the original Paprika logo unchanged. UI source remains outside the existing skill-plugin distribution.
