# Integration catalog and optional packs

The integration catalog describes compatibility requirements. It does not download
sources, install connectors, register tools, authenticate users or grant access.

From this plugin directory:

~~~sh
node skills/paprika-inc/scripts/inc.mjs integrations list
node skills/paprika-inc/scripts/inc.mjs integrations check --integrations marketing-skills,github-mcp --integration-context observed-host.json
~~~

The context file contains caller-supplied observations, for example:

~~~json
{"host":"codex-local","capabilities":["plugin-skills","mcp-http"]}
~~~

Only include capabilities actually observed on the target host. The bundled host
labels are codex-local, chatgpt and github-ci; adapter metadata can describe other
hosts. Missing observations remain pending. This helper does not discover hosts.
Use --spec registry.json to check a complete alternative catalog without changing
the bundled one. --integrations selects comma-separated IDs and their dependencies.

Each integration declares its sources, license observation, adapter, capabilities,
integration dependencies, maturity and notes. Each adapter describes host routes,
their required capabilities, and native/adaptation-required/wrapper-required mode.
Unknown adapters and host routes remain pending. Dependency cycles and malformed
metadata are rejected. A candidate with no immutable source pin cannot report
declared-compatible. Even declared-compatible means only that supplied declarations
match: runtime_verified, authentication_verified and installed remain false.

Company personas should select role contracts, workflow packs and connector
requirements separately. Installing a skill does not provision a role, attach a
service, verify professional competence or grant permissions. Research and
engineering packs retain their existing source pins and install-record formats.

New bundled packs use a version-2 pack.json with exactly these fields:

- schema_version: 2.
- id: a lowercase, hyphenated identifier up to 64 characters.
- skills: distinct skill IDs, unique across the whole bundled catalog.
- sources: named immutable inputs; each is either kind git with a public HTTPS url
  and a 40-character revision, or kind artifact with url and a SHA256 sha256.
- files: exact selected relative paths and SHA256 hashes.
- capabilities: one list per skill, each item containing id and kind. Kinds are
  guidance, local-tool or remote-tool. Tools remain requirements_unverified.

Every selected skill includes SKILL.md, INC-PORTABILITY.md and LICENSE.upstream.md.
SKILL.md begins with YAML frontmatter in name, then description order, using the
selected skill ID; the version-2 validator checks this bounded profile.
Include the applicable license and required notices for each selected upstream;
a license filename is not evidence of legal review. The portability document
explains host assumptions, dependency replacements and disabled features.

The initial version-2 payload supports md, json, yaml, txt, py, bib and mjs files.
It rejects traversal, reserved Windows names, nested SKILL.md files, case collisions,
unselected content and symlinks. Limits are 500 files, 1 MiB per file and 8 MiB per
pack. Executables, binary models, containers and credentials belong in separately
implemented services or workers. Helpers are copied as reviewed files, never run
by the registry or installer.

For a source-repository adoption, place the reviewed payload and pack.json under
skill-packs/extensions/PACK-ID/, add PACK-ID to skill-packs/extensions.json, then
run python3 scripts/skill_packs.py --write from the source repository. This
deterministically emits the payload and catalog entry. Adding a pack requires no
runtime ID change. The catalog binds manifest bytes, selected names and a digest
of each immutable source descriptor. These hashes detect drift; they do not
authenticate the upstream or establish that a reviewer approved it.

After rebuilding and reviewing the plugin, roles may reference the new ID in
skill_sets. The existing skills plan/install/status commands use the catalog.
Installation remains explicit, project-local and resumable, and preserves
unmanaged or edited files. No arbitrary external path is accepted as an install
source. Removing or upgrading an already installed pack is not automatic.

Native integration choices follow the current host documentation:

- [Skills](https://developers.openai.com/plugins/build/skills) carry procedures.
- [MCP servers](https://developers.openai.com/plugins/build/mcp-server) carry live
  data and controlled actions.
- [Codex MCP](https://developers.openai.com/codex/mcp) supports local process and
  remote service configuration; web access requires a reachable service.
- [Plugin adaptation](https://developers.openai.com/plugins/guides/submit-claude-plugin)
  describes how to convert provider-specific commands and agent procedures.
- [GitHub MCP](https://github.com/github/github-mcp-server) provides repository
  tools; prefer an existing native connection when it meets the requirement.

The bundled candidates are research leads, not installed dependencies. Source
selection, license review, provider adaptation, host registration, authentication,
domain evaluation and a live task on each supported host remain adoption work.
