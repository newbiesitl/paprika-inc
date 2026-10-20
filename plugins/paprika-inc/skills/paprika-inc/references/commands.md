# Commands and outputs

The bundled [command catalog](../../../runtime/paprika-inc/commands.json) is the executable alias list. Inspection accepts a selected directory through `--repo`; `--manifest` selects a relative manifest. The commands below remain read-only. Explicit MVP authoring/checkout/bootstrap commands are described afterward and may write company/Git/private-progress files.

| Request | Command | Result |
| --- | --- | --- |
| `$paprika-inc help`, “show available commands” | `help` | Commands, aliases, pending operations; no repository needed |
| “validate this company's setup” | `validate` | Portable file/path/identity checks and input digests |
| `$setup-paprika-inc`, “init”, “plan this company's setup” | `plan` | Read-only prerequisites; never initialization or adoption |
| “show company status” | `status` | Declared definition and separate unverified runtime dimensions |
| “list role definitions” | `roles` | Declared IDs, versions, relative references and file digests |
| “show role backend-dev” | `role backend-dev` | Exact selected contract as untrusted data |
| “list integration candidates” | `integrations list` | Source metadata and adapter routes; no repository needed |
| “check integration compatibility” | `integrations check` | Declared requirements compared with supplied host observations |
| “show role model defaults” | `models list` | Read the selected company's role defaults |
| “reset this role's model settings” | `models reset --role-id <id>` | Read-only plan preserving an explicit chat override before its role default |
| “export role model configs” | `models export` | Codex profile TOML and desired ChatGPT settings |

Use the [integration guide](../../setup-paprika-inc/references/integrations.md)
for `--integrations`, `--integration-context`, `--spec` and extension packs.

Use [model defaults](../../setup-paprika-inc/references/model-defaults.md) for
`--model-profiles`, private `--model-context`, host verification and reset limits.

The example role ID is illustrative; the engine accepts any roster using the supported profile and has no development-role names built into its behavior. Role IDs match exactly. Unknown roles return `unknown_role`; omitted IDs return `missing_role_id`.

`apply`, `adopt`, `create`, `onboard`, `checkpoint`, `repair`, `transfer`, `deploy`, and `connect` remain unsupported advanced/general operations. For the expressly scoped MVP use `author plan`, `author write`, `checkout`, `bootstrap start`, `bootstrap next`, `bootstrap record`, `bootstrap bind`, and `bootstrap status` from [the workflow](../../setup-paprika-inc/references/mvp-workflow.md). These expose their own precise behavior rather than pretending the full lifecycle engine exists. Unknown commands return `unknown_command`. Default `setup` and `init` still return a plan; actual bootstrap uses its explicit command and human request.

JSON is written to stdout. Exit codes: `0` for a returned command result, `2` for invalid input/operation failure, `3` for an explicitly unsupported operation. Inspect the returned status/blockers as well as the exit code: a host handoff or prepared action is not completed bootstrap. Inspection returns `read_only: true` and `applied: false`. Mutations identify themselves separately; failed mutations conservatively report `applied: null` because partial progress may exist. A prepared host action has `completed: false` and `native_action_executed_by_helper: false`.

`definition_valid` means the [supported local checks](definition-profile.md) passed. Legacy `status` describes the future advanced managed-lifecycle dimensions and points to MVP commands; `bootstrap status` reads the private sequential record with as-of, non-live-rechecked evidence. Exact native identity/project/cwd and completed matching role receipts are separate readiness dimensions. Unknown does not imply absence, and no single `connected: true` field is emitted.

`--service-report` accepts a small non-secret JSON observation for planning. It is always caller-reported and unverified; see [boundaries](../../setup-paprika-inc/references/boundaries.md). Do not send credentials, tokens, native IDs or message histories to this helper.
# Optional skill-pack commands

`skills plan`, `skills install`, and `skills status` use `--repo <Git-project-root>`
and the manifest's selected skill sets. `--roles <role-ids>` narrows manifest
selection; `--skill-set` accepts one or more comma-separated IDs from the bundled
catalog, including reviewed extension packs. The default sets remain
`research-core` and `engineering-core`.
Only install writes project files and private progress. See the
[research workflow](../../setup-paprika-inc/references/research-core.md) for conflict,
resume, portability and capability semantics. No upstream plugin is installed.

`message start`, `message next`, `message record`, `message status` and `message reconcile` operate on one private authorized outbound task/report. [Automatic delivery](../../setup-paprika-inc/references/adaptive-delivery.md) documents private inputs, the exact threshold, failures and supported local hosts.

# Company catalog and configuration

`catalog list`, `catalog search --query <text>` and `catalog read --catalog-kind <kind> --catalog-id <id>` share the packaged catalog. Optional `--catalog-kind` filters list/search. `config validate`, `config preview` and `config export` take `--selection <json>` and optional `--catalog-context <json>`; preview also takes the chosen `--repo`. All are read-only. Invalid configurations and file conflicts return exit code 2 with typed diagnostics and no writes. See the [catalog guide](../../setup-paprika-inc/references/company-catalog.md).
