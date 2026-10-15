# Read-only Paprika Inc plugin skeleton

Work item: [#2](https://github.com/newbiesitl/paprika-inc/issues/2). Version 0.1.0 is the first implementation slice, built under the existing Backend Dev assignment and definition revision `e1e7f1843de36b2fd60645f6c8f671cbd8e16db0`. It changes no role contract, grant, private registry or live role binding. Chief Architect reviews command/API design and acceptance; Frontend Dev reviews interaction contracts; Data Engineer reviews future persistence/state changes. No state schema or managed lifecycle adoption is introduced here.

## Implemented behavior

The [Paprika Inc skill](../plugins/paprika-inc/skills/paprika-inc/SKILL.md) and [setup skill](../plugins/paprika-inc/skills/setup-paprika-inc/SKILL.md) use a contained Node.js 24+ command helper. The [command catalog](../plugins/paprika-inc/runtime/paprika-inc/commands.json) is the executable alias source. The generic inspector has no dependency on this company's five roles.

| Invocation | Implemented outcome |
| --- | --- |
| `$paprika-inc help` / “show available commands” | Help and aliases without setup or registration |
| “validate this company's setup” | Schema 1 manifest, case/path safety, role ID/version and required shared-file checks |
| `$setup-paprika-inc` / “init” / “plan setup” | Read-only plan; `applied: false` |
| “show company status” | Declared definition plus separate unverified runtime dimensions |
| “list role definitions” / “show role backend-dev” | Exact declared role references or selected contract as data |
| `apply`, `adopt`, `create`, `onboard`, `checkpoint`, `repair`, `transfer`, `deploy`, `connect` | Specific `capability_pending` result and next prerequisite; no mutation |

Select a repository with `--repo`. The plugin installation folder is not a fallback company. `--manifest` selects an alternative relative manifest. Missing/invalid repositories, JSON, fields, role references, versions, unsafe paths, symlinks, case mismatches and oversized/invalid UTF-8 documents have structured errors. See [profile limits](../plugins/paprika-inc/skills/paprika-inc/references/definition-profile.md).

A file digest identifies working-tree input, not an approved revision or permission. Semantic ownership conflicts require review before future apply. The CLI reads no private ownership registry and performs no network calls; status unknowns do not mean the company/service is absent. Setup guidance can inspect already available authenticated read-only host tools separately, but cannot mark initialization complete. A minimal caller-provided service report remains unverified and never enables provisioning.

## Source and package

```text
plugins/paprika-inc/
  plugin.json                  portable identity/listing/onboarding
  .codex-plugin/plugin.json    synchronized Codex compatibility metadata
  skills/                     paprika-inc and setup-paprika-inc
  runtime/paprika-inc/         generic command/definition/planning helpers
  runtime/messenger/           exact pinned service-selection component
  assets/                     approved navy icon
  licenses/                   Messenger MIT license
scripts/plugin_package.py     source/archive validation and deterministic build
scripts/prepare-plugin.py     preparation entry point
scripts/validate-plugin.py    source/archive validation entry point
```

Build from a recursive checkout using Python 3.10+:

```sh
python3 scripts/prepare-plugin.py
python3 scripts/validate-plugin.py artifacts/plugin-skeleton/paprika-inc-0.1.0.zip
```

The archive has one `paprika-inc/` root, fixed timestamps/modes, sorted entries, hidden compatibility metadata and a complete hashed payload inventory in `package-provenance.json`. An explicit reviewed file allowlist rejects extra Messenger skills, nested plugin/marketplace manifests and other payload additions. Root/compatibility discovery metadata must share the Inc identity/navy icon and export only `paprika-inc` and `setup-paprika-inc`. Provenance records that discovery inventory with `live_picker_verified: false`. Input bytes determine the archive; no native IDs, machine paths, owner binding, secrets or volatile timestamps are included. Source validation checks declared assets/references, skills, imports, runtime data and license files. Preparation verifies the clean pinned Messenger gitlink/version and exact copied component/license. It writes only the selected build output; source and company inputs are untouched.

No npm install is needed. The read-only kit bundles all code it declares and never imports another installed plugin cache. It declares no MCP server, service template, remote endpoint or required App. A separate Messenger plugin is not a prerequisite for inspection/planning. Live messaging will need a later verified existing service/App binding; this archive is not yet a service-bound account plugin. Building/saving/installation/publication/deployment remain distinct states; this assignment performs only source development and package preparation.

[Inc-only and Messenger-already-installed onboarding](../plugins/paprika-inc/skills/setup-paprika-inc/references/coexistence.md) preserve one compatible Paprika Service App/OAuth identity, database/history and authoritative receiver/delivery state. Inc adds only its own navy product and namespaced skills, with no second Messenger product/icon/command. Inc package version, exact bundled Messenger source and actual running service API/capabilities are separate records. Authenticated discovery/binding remains pending; no second App/service or downgrade is a recovery shortcut. A required Paprika Service backend App may appear separately, without unsupported visibility flags.

## Verification and later gates

```sh
python3 scripts/validate-repository.py
node --test tests/*.test.mjs
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/validate-plugin.py
python3 scripts/prepare-plugin.py
git diff --check
```

Tests cover aliases, a fictional roster, deterministic input evidence, errors, read-only file preservation, truthful unsupported actions, unverified service reports, package completeness/tampering/unsafe archives, deterministic ZIP bytes and an extracted helper independent of source/package caches. CI runs these checks on Node 24. This is local behavior/package evidence, not live macOS/Windows certification or installation evidence.

Package regression tests also reject duplicate-discovery contamination and compare Inc's exported product/skill inventory with pinned Messenger metadata, without installing either product. The [fresh-chat UI acceptance procedure](../plugins/paprika-inc/skills/setup-paprika-inc/references/coexistence.md#future-fresh-chat-ui-acceptance--pending-not-run) remains unrun: under separate installation authorization, verify one Messenger product entry and one Inc product entry with both enabled, no duplicate Messenger commands/icon, and allow a separately displayed Paprika Service App. Artifact assertions do not certify ChatGPT's picker. This author self-review does not replace independent architectural review.

Host identity/project visibility and stopping, private enrollment/registry, singleton races and uncertain outcomes, onboarding/adoption, knowledge carry-forward, Messenger authentication and coexistence, shared-worktree authoritative state, transfer/rollback and self-adoption remain the [RFC review gates](proposals/virtual-company/REVIEW.md) and [self-development gates](architecture/SELF-DEVELOPMENT.md). Future implementations must use verified adapters under existing authority; fixture success does not satisfy those gates. Unknown creation/stopping must retain its occupied slot, and a candidate cannot approve itself.
