# Role model defaults and reset plans

The selected company's `company/model-preferences.json` role map (`thinking`) or
`company/model-profiles.json` role array (`reasoning_effort`) supplies defaults.
Both schema-1 formats normalize to the same pairs. Every active role needs one;
missing/duplicate/unknown roles fail validation. When both files exist, choose the
intended repository-relative file with `--model-profiles`.

When requested, capture actual current chat settings privately and use those pairs
as new role defaults. Native IDs and observations stay outside public Git.

```sh
node <helper> models list --repo <company-repository>
node <helper> models reset --repo <company-repository> --role-id <role-id> --model-context <private-context.json>
node <helper> models export --repo <company-repository>
```

Reset precedence is explicit chat override, then that company's exact role default.
Unavailable choices are reported without switching to a global Astra/Sol default.
Missing host observations remain unverified. The engine hard-codes no team roster.

Private context has schema_version 1, company_id, role_id, optional current_override
`{"model":"chosen-model","reasoning_effort":"high"}` and optional models
`[{"id":"chosen-model","reasoning_efforts":["high","xhigh"]}]`. Capture overrides
from actual settings under the human request. Context for another company/role is
rejected. A supplied catalog is not invocation, authentication or quality evidence.

All three commands are read-only. Reset returns a settings plan; it does not alter
native chats or send a task. When the human handles live changes, leave those
controls to them. This plugin cannot replace the desktop app's global reset button.

Export provides Codex profile TOML and desired ChatGPT settings. Save a Codex
profile as `<profile-name>.config.toml` in Codex home; select it explicitly with
`codex --profile <profile-name>`. It does not assign a profile to an existing chat.
ChatGPT values are desired settings for its supported UI, not an invented native
ChatGPT config-file format.

For a newly requested bootstrap, a present profile must be committed in the pinned
revision. Supply the observed models list above in the native capability report.
Optional model_overrides maps requested role IDs to explicit pairs. Bootstrap
freezes the profile digest and resolved settings, checks host support, and passes
the pair to new Codex chat creation. Existing chats retain their current settings
during read/report onboarding. Changed defaults block dependent actions, while
actual host results can still be recorded. Legacy journals preserve bindings and
require deliberate profile adoption rather than silent rewriting.

See [Codex profiles](https://learn.chatgpt.com/docs/config-file/config-advanced)
and the [configuration reference](https://learn.chatgpt.com/docs/config-file/config-reference).
