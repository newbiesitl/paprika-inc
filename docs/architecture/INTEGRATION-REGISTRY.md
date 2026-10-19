# Generic integrations and company personas

Work ID: integration-registry-foundation.
Governing definition: ae6080186ceb83cbdfd1b23bbfe532f8c0a678f4.
Research snapshot: 2026-10-19.
Status: implementation candidate; no live connector certification or adoption.

The human authorized compatibility research and implementation of the registry
foundation. This candidate changes product code and documentation, not the active
development roster, governance, Messenger dependency or installed plugins.

## Architecture

Company presets should compose four independent pieces:

1. Role contracts: responsibilities, review relationships and boundaries.
2. Workflow packs: reusable instructions and selected supporting files.
3. Integration declarations: sources, adapters, capabilities and dependencies.
4. Private bindings: actual accounts, endpoints, credentials and host observations.

This avoids implementing a new execution engine for every industry. An investment
company, law practice and manufacturer can share GitHub, document and analysis
capabilities while selecting different procedures and domain tools. A persona
taxonomy and preset composer are future work; this change supplies the integration
and pack foundation.

The shipped registry lists candidates and evaluates declarations against supplied
host observations. Adapter IDs and host routes are data. Unknown requirements
stay pending, and the evaluator never executes commands or installs third-party
code. The bundled skill catalog is a separate reviewed distribution boundary:
adding candidate metadata does not make its source installable.

## Native compatibility assessment

OpenAI's current [plugin packaging](https://developers.openai.com/plugins/build/plugins)
and [skills guidance](https://developers.openai.com/plugins/build/skills) support
procedures packaged with skills and live operations exposed through MCP.
[Codex MCP configuration](https://developers.openai.com/codex/mcp) supports process
and HTTP transports. A local Python dependency is not, by itself, a ChatGPT web
connector. The web route needs a reachable MCP service and an execution worker
where necessary; a supported private tunnel may supply reachability during private
development. Public submission has separate hosting and review requirements.

These are feasible integration paths, not evidence that the user's account has
every capability or that an upstream tool has passed a Paprika task evaluation.

| Example | Proposed wrapper or connector | Codex path | ChatGPT path | GitHub path |
| --- | --- | --- | --- | --- |
| Marketing or financial procedures | Native skill wrapper adapting prompts, input/output contracts and dependencies | Bundled skills | Bundled skills where supported | Versioned source and fixtures |
| Repository work | Reuse official GitHub connector; add only missing Paprika task mapping | Existing GitHub tools or MCP | Existing GitHub tools or MCP | Issues, PRs and Actions with scoped access |
| RDKit molecular analysis | Proposed molecular_descriptors(smiles) typed tool with bounded input and structured results | Local Python helper or MCP process | Hosted MCP and Python worker | Pinned wrapper source and tests |
| OR-Tools manufacturing schedules | Proposed solve_schedule, job_status and job_result tools with limits | Local worker or remote MCP | Hosted MCP and solver worker | Reproducible fixtures and optional batch workflow |
| MLflow experiments | Proposed search_runs and get_run_metrics read tools | MCP or local supported SDK wrapper | Authenticated MCP service adapter | Wrapper source and CI |
| ERPNext operations | Proposed inventory and work-order read tools over Frappe APIs | MCP service adapter | Authenticated MCP service adapter | Reviewed schemas and tests |
| Long-running repository automation | Workflow adapter with dispatch, status and artifact retrieval | GitHub tools or MCP | GitHub tools or MCP | Pinned Actions workflow |

The proposed domain operation names above are interface examples, not installed
tool names. Each implementation must define input/output schemas, auth ownership,
pagination, timeouts, errors, cancellation, result provenance and write behavior.
Reuse [GitHub's official MCP server](https://github.com/github/github-mcp-server)
where it suffices; its [configuration guide](https://github.com/github/github-mcp-server/blob/main/docs/server-configuration.md)
documents tool selection and read-only mode. The
[Codex GitHub Action](https://github.com/openai/codex-action) runs in CI; it is not
an API for controlling an existing desktop role chat.

Representative upstream APIs:
[RDKit](https://www.rdkit.org/docs/GettingStartedInPython.html),
[OR-Tools](https://developers.google.com/optimization/introduction),
[MLflow](https://mlflow.org/docs/latest/api_reference/rest-api.html),
[Frappe REST](https://docs.frappe.io/framework/user/en/api/rest).
The wrapper designs are engineering proposals based on these surfaces.

## Initial role and skill candidates

These seven prior research leads are included as candidate entries. Top-level
license observations are preliminary; select an exact commit and review the
actual files and transitive dependencies before redistribution.

| Source | Observed license | Initial compatibility work |
| --- | --- | --- |
| [Knowledge work plugins](https://github.com/anthropics/knowledge-work-plugins) | Apache-2.0 | Select finance, legal, marketing, operations or other procedures; translate host-specific commands/tools |
| [Financial services](https://github.com/anthropics/financial-services) | Apache-2.0 | Extract models and research workflows; separate managed-agent runtime and licensed data |
| [Scientific Agent Skills](https://github.com/K-Dense-AI/scientific-agent-skills) | MIT | Extend the selected four-skill precedent; audit each additional script and dependency |
| [Marketing Skills](https://github.com/coreyhaines31/marketingskills) | MIT | Resolve shared marketing context, cross-skill dependencies and optional connectors |
| [Agency Agents](https://github.com/msitarzewski/agency-agents) | MIT | Translate personas into Paprika contracts and reusable procedures |
| [HR Skills](https://github.com/tuanductran/hr-skills) | MIT | Check procedure quality, host assumptions and jurisdiction-specific content |
| [Legal Agents](https://github.com/judicialmind/legal-agents) | MIT | Map roles and workflows; define jurisdiction and professional-review expectations |

The [official conversion guidance](https://developers.openai.com/plugins/guides/submit-claude-plugin)
supports adapting reusable commands and agent procedures into skills. Provider
names, unsupported hooks, config variables, artifacts and runtime delegation must
be inspected individually. Open-source licensing does not establish portability.

## Implemented foundation

The packaged [integration guide](../../plugins/paprika-inc/skills/setup-paprika-inc/references/integrations.md)
documents commands and the version-2 pack contract. The
[registry](../../plugins/paprika-inc/runtime/integrations/registry.json) contains
eight adapter descriptions and thirteen candidates. A custom registry may add
adapter or host IDs without changes to the evaluator.

Role skill_sets validation now reads the bundled catalog. Additional packs are
explicit selections in [extensions.json](../../skill-packs/extensions.json);
the initial selection is empty. Existing research-core and engineering-core
payloads, pins and provenance formats remain unchanged. New packs use immutable
source-descriptor digests, exact file inventories, collision checks and declared
capability reports. Build-time and extracted-runtime checks enforce that boundary.

This is not a universal importer. New service execution, binary dependencies,
authentication and host registration still need implementations. The extensible
metadata and pack path provide consistent places to describe and test that work.

## First adoption sequence

1. Choose one workflow, preferably a marketing skill with user-supplied inputs.
   Pin its commit and select only the needed files, license notices and dependencies.
2. Adapt it into a version-2 pack. Test authoring, packaging, extraction, install,
   conflict handling, resume and a representative task.
3. Pair it with the existing GitHub connector for one read-only repository task.
   Record actual host discovery, schema, auth and result evidence separately.
4. Build one typed compute wrapper, such as RDKit descriptors, and exercise the
   same operation via local Codex and hosted MCP in ChatGPT.
5. Only after those three patterns pass, expand industry presets and source packs.

Use separate evidence for metadata validity, local installation integrity, native
discovery, authenticated connectivity and task quality. A catalog flag cannot
substitute for any of the latter checks. Independent review and any authorized
release/adoption steps remain separate from this implementation.
