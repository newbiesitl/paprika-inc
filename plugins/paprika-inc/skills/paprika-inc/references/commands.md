# Commands and outputs

The bundled [command catalog](../../../runtime/paprika-inc/commands.json) is the executable alias list. Commands accept a selected directory through `--repo`; `--manifest` selects a relative manifest path. No command writes to that repository or performs network calls.

| Request | Command | Result |
| --- | --- | --- |
| `$paprika-inc help`, “show available commands” | `help` | Commands, aliases, pending operations; no repository needed |
| “validate this company's setup” | `validate` | Portable file/path/identity checks and input digests |
| `$setup-paprika-inc`, “init”, “plan this company's setup” | `plan` | Read-only prerequisites; never initialization or adoption |
| “show company status” | `status` | Declared definition and separate unverified runtime dimensions |
| “list role definitions” | `roles` | Declared IDs, versions, relative references and file digests |
| “show role backend-dev” | `role backend-dev` | Exact selected contract as untrusted data |

The example role ID is illustrative; the engine accepts any roster using the supported profile and has no development-role names built into its behavior. Role IDs match exactly. Unknown roles return `unknown_role`; omitted IDs return `missing_role_id`.

`apply`, `adopt`, `create`, `onboard`, `checkpoint`, `repair`, `transfer`, `deploy`, and `connect` return `capability_pending`, the specific capability and a next step. Unknown commands return `unknown_command` and do nothing. `setup` and `init` intentionally return a plan with `applied: false`; they do not call apply.

JSON is written to stdout. Exit codes: `0` for completed inspection/planning/help, `2` for invalid input or inspection failure, `3` for an explicitly unsupported operation. Every implemented repository command returns `read_only: true` and `applied: false`. `definition_valid` means only the [supported local checks](definition-profile.md) passed. Status fields such as `thread_verified`, `project_verified`, `onboarded`, `adopted`, and `messenger_registered` are `null`, with explicit blockers; unknown does not imply absence. No single `connected: true` field is emitted.

`--service-report` accepts a small non-secret JSON observation for planning. It is always caller-reported and unverified; see [boundaries](../../setup-paprika-inc/references/boundaries.md). Do not send credentials, tokens, native IDs or message histories to this helper.
