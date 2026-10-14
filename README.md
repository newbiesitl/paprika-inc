# Paprika Inc

<img src="assets/paprika-inc-logo-navy-v1.png" alt="Paprika Inc — Paprika in a navy office suit" width="160" height="160">

An open-source virtual-company framework for repository-defined AI teams, built on [Paprika Messenger](https://github.com/newbiesitl/paprika-messenger).

**Status: repository foundation and architecture.** This repository contains the company proposal, development-team role contracts, brand assets, and a pinned Messenger source dependency. The company engine, automatic role provisioning, migration, and installable Inc plugin are not implemented yet.

## What we are building

Paprika Inc will reconstruct a company from reviewed role definitions, assignments, and compact working knowledge. Its first target is persistent local Codex chats on one selected machine, with separately verified macOS and Windows support. Roles own work by stable logical ID; native chat identities stay in private runtime state.

Messenger remains an independent project. Inc will bundle the required Messenger components at build time and use the same onboarding practice to reuse or initialize the owner's private Paprika service. A separate Messenger plugin installation will not be a prerequisite. Packaging, service compatibility, and coexistence still require implementation and testing.

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
| [Assets](assets/README.md) | Approved logo and its exact generation prompt |
| `vendor/paprika-messenger/` | Independently maintained messaging dependency |

## Contribute

Read [Contributing](CONTRIBUTING.md), [Support](SUPPORT.md), [Security](SECURITY.md), the [Code of Conduct](CODE_OF_CONDUCT.md), and [Maintaining](docs/MAINTAINING.md). Repository definitions describe roles; they do not create chats, grant permissions, or start autonomous work.

Paprika Inc is distributed under the [MIT license](LICENSE). See [third-party notices](THIRD_PARTY_NOTICES.md) for Messenger and imported documentation.
