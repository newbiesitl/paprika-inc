# Paprika Inc

<img src="assets/paprika-inc-logo-navy-v1.png" alt="Paprika Inc — Paprika in a navy office suit" width="160" height="160">

An open-source virtual-company framework for repository-defined AI teams, built on [Paprika Messenger](https://github.com/newbiesitl/paprika-messenger).

**Status: first local MVP, with live installation/native-host acceptance pending.** Inc 0.2.0 adds conversational generic role/ownership authoring, protected Git checkout and a sequential supported-native-host project-chat bootstrap with private status/resume. The package remains independently installable; enforced singleton/race handling, transfer, background orchestration and automatic adoption are future hardening.

## What we are building

Paprika Inc will reconstruct a company from reviewed role definitions, assignments, and compact working knowledge. Its first target is persistent local Codex chats on one selected machine, with separately verified macOS and Windows support. Roles own work by stable logical ID; native chat identities stay in private runtime state.

Messenger remains an independent project. The current kit includes a pinned service-selection component and its license; its read-only commands need no separate Messenger plugin installation. Future service integration must inspect and reuse the owner's compatible private service before considering provisioning. Live service binding, lifecycle integration and coexistence remain acceptance gates.

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
python3 scripts/validate-plugin.py artifacts/plugin-skeleton/paprika-inc-0.2.0.zip
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
