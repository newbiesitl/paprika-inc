# Paprika Inc

<p align="center">
  <img src="assets/paprika-inc-logo-navy-v1.png" alt="Paprika Inc — Paprika in a navy office suit" width="360" />
</p>

An open-source virtual-company framework for repository-defined AI teams, built on [Paprika Messenger](https://github.com/newbiesitl/paprika-messenger).

**Status: first local MVP, with live installation/native-host acceptance pending.** Inc 0.3.1 adds conversational generic role/ownership authoring, protected Git checkout and a sequential supported-native-host project-chat bootstrap with private status/resume. The package remains independently installable; enforced singleton/race handling, transfer, background orchestration and automatic adoption are future hardening.

## What we are building

Paprika Inc will reconstruct a company from reviewed role definitions, assignments, and compact working knowledge. Its first target is persistent local Codex chats on one selected machine, with separately verified macOS and Windows support. Roles own work by stable logical ID; native chat identities stay in private runtime state.

Messenger remains an independent project. The current kit includes a pinned service-selection component and its license; its read-only commands need no separate Messenger plugin installation. Future service integration must inspect and reuse the owner's compatible private service before considering provisioning. Live service binding, lifecycle integration and coexistence remain acceptance gates.

## The company developing Paprika Inc

Our own [development company](company/README.md) is a single-host, local Codex
bootstrap candidate. Its manifest names the Coordinator as the coordinating role;
the contracts below define responsibilities, not live agents or permissions.

| Role | Stable ID | Main responsibility |
| --- | --- | --- |
| [Chief Architect](company/roles/chief-architect/agent.md) | `chief-architect` | Design, interfaces, and acceptance gates |
| [Backend Dev](company/roles/backend-dev/agent.md) | `backend-dev` | Company engine, host adapters, and integrations |
| [Frontend Dev](company/roles/frontend-dev/agent.md) | `frontend-dev` | Setup, status, and recovery interactions |
| [Scientific Researcher](company/roles/scientific-researcher/agent.md) | `scientific-researcher` | Research and evidence appraisal |
| [QA Engineer](company/roles/qa/agent.md) | `qa` | Independent validation and acceptance evidence |
| [Coordinator](company/roles/coordinator/agent.md) | `coordinator` | Human intake and task handoffs |
| [Release Engineer](company/roles/release-engineer/agent.md) | `release-engineer` | Reviewed merge order and reproducible releases |

<!-- company-catalog:start -->
## Company catalog preview

Browse and configure a portable company draft in the [shared catalog UI](apps/company-catalog/README.md). One component supports a standalone local interface and an MCP App resource for supported native hosts. This candidate is not installed or deployed; actual Codex/ChatGPT rendering remains unverified.

### Company types

| Starting template | Version | Catalog state | Default roles | Default structure |
| --- | --- | --- | --- | --- |
| Software studio | 0.1.0 | template | Coordinator, Architect, Developer, QA, Release Engineer | Lean team |
| Scientific research | 0.1.0 | template | Coordinator, Researcher, Scientific Reviewer, Release Engineer | Research lab |
| Marketing agency | 0.1.0 | planned | — | — |

### Organization structures

| Structure | Stable ID | Reporting shape | Catalog state |
| --- | --- | --- | --- |
| Lean team | lean-team | Direct to coordinator | template |
| Functional departments | functional-departments | Reporting tree | template |
| Research lab | research-lab | Reporting tree | template |

Structures are independent of company type and business-model tags. Review relationships are configured separately from reporting lines.

### Role templates

| Role | Stable ID | Purpose | Catalog state |
| --- | --- | --- | --- |
| Coordinator | coordinator | Route human requests and preserve task handoffs. | template |
| Architect | architect | Own design and technical acceptance. | template |
| Developer | developer | Implement the selected software outcome. | template |
| QA | qa | Provide company quality evidence for meaningful feature, pilot, MVP, PR and design-implementation validation. | template |
| Release Engineer | release-engineer | Sequence reviewed changes and prepare reproducible releases. | template |
| Researcher | researcher | Investigate scoped questions and synthesize evidence. | template |
| Scientific Reviewer | scientific-reviewer | Independently appraise claims, methods and evidence. | template |

Role selection defines a draft roster; it does not create live chats or grant permissions.

| Available pack source | Version | Included guidance |
| --- | --- | --- |
| Engineering core | 0.1.0 | paprika-code-review |
| Research core | 0.1.0 | paper-lookup, literature-review, citation-management, scientific-critical-thinking |

Pack source availability does not establish local installation, authentication, native-host verification, task-quality acceptance or release.

**Other planned catalog entries:** Marketing core. The broader [industry and integration roadmap](https://github.com/newbiesitl/paprika-inc/issues/30) is tracked separately.

Generated from the version 0.1.0 [backend catalog](plugins/paprika-inc/runtime/company-catalog/catalog.json); check with npm --prefix apps/company-catalog run readme:check.
<!-- company-catalog:end -->

## Try the implemented commands

Node.js 24 or newer runs the contained helper without additional npm dependencies:

```sh
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs help
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs validate --repo .
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs plan --repo .
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs status --repo .
node plugins/paprika-inc/skills/paprika-inc/scripts/inc.mjs roles --repo .
```

Use the chosen existing first-staff chat to discuss the company. The skills support `$paprika-inc help`, author plan/write, protected checkout and bootstrap start/next/record/status. Default setup/init still prepares a plan. Actual user-requested bootstrap uses native saved-project creation tools and separate identity/read-report evidence; file generation alone creates no chats or permissions. See [MVP scope and acceptance](docs/MVP.md), [the concrete workflow](plugins/paprika-inc/skills/setup-paprika-inc/references/mvp-workflow.md), and [generic resulting files](examples/workshop/company/company.json).

Prepare a self-contained source kit with Python 3.10 or newer:

```sh
python3 scripts/prepare-plugin.py
python3 scripts/validate-plugin.py artifacts/plugin-skeleton/paprika-inc-0.3.1.zip
```

The deterministic archive is a local MVP skill kit; preparation performs no installation/publication/deployment. An optional private export can reference one existing Paprika Service App without registering another product/service. Native on-demand bootstrap requires no separate Messenger product. See [MVP scope and acceptance](docs/MVP.md) and [the original skeleton/package boundary](docs/PLUGIN-SKELETON.md).

## Get the source

```sh
git clone --recurse-submodules https://github.com/newbiesitl/paprika-inc.git
cd paprika-inc
```

For an existing checkout:

```sh
git submodule sync --recursive
git submodule update --init --recursive
```

The submodule is pinned by commit, not a floating branch. See [dependency adoption](docs/DEPENDENCIES.md) for its version and update process. Downloading the GitHub source ZIP alone does not populate submodules. These are developer checkout instructions, not plugin installation commands.

## Explore

| Location | Purpose |
| --- | --- |
| [Company definition](company/README.md) | The team using this repository to develop Paprika Inc |
| [Governance](company/CONSTITUTION.md) | Authority, review, and adoption rules |
| [Self-development design](docs/architecture/SELF-DEVELOPMENT.md) | How version N develops version N+1 |
| [Migrated proposal](docs/proposals/PAPRIKA-VIRTUAL-COMPANY.md) | Portable roles, knowledge, and lifecycle design |
| [Proposal provenance](docs/proposals/MIGRATION.md) | Original source and migration corrections |
| [Development tracking](docs/DEVELOPMENT.md) | Features, improvements, tasks, milestones, and evidence |
| [Local MVP](docs/MVP.md) | First-staff authoring, protected clone, sequential native bootstrap and live acceptance |
| [Plugin skeleton](docs/PLUGIN-SKELETON.md) | Original packaging boundary and future hardening |
| [Assets](assets/README.md) | Approved logo and its exact generation prompt |
| `vendor/paprika-messenger/` | Independently maintained messaging dependency |

## Contribute

Read [Contributing](CONTRIBUTING.md), [Support](SUPPORT.md), [Security](SECURITY.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and [Maintaining](docs/MAINTAINING.md). Repository definitions describe roles; they do not create chats, grant permissions, or start autonomous work.

Paprika Inc is distributed under the [MIT license](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md) for Messenger and imported documentation.

## Optional scientific research workflows

Inc 0.3.1 adds an explicitly selected `research-core` set for project-local
installation: paper lookup, literature review, citation management and critical
appraisal. Source is pinned as a second unchanged submodule; only four selected
skills and their resources are bundled internally. Installing Inc does not install
the upstream plugin or activate research skills globally. See
[setup and capability boundaries](plugins/paprika-inc/skills/setup-paprika-inc/references/research-core.md),
[the fictional researcher and public pilot](examples/scientific-research/README.md),
and [the governing proposal](docs/proposals/SCIENTIFIC-RESEARCH-SKILLS.md).

Inc 0.3.1 adds [native product/sender presentation](plugins/paprika-inc/skills/setup-paprika-inc/references/native-message-presentation.md) for newly prepared onboarding prompts. Actual native observations select a plugin mention and sender title; missing metadata uses plain text. Pending writes retain frozen payloads.
