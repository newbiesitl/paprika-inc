# Native message presentation

New local native prompts start with a Markdown image of the packaged Paprika
artwork, resolved to an absolute path beside the executing kit. The original PNG
is reused; no catalog entry or plugin mention is needed for that image line.
The product name or observed plugin mention follows, then the actual sender title,
an explicitly bound logical role if known, recipient context, and the unchanged body.
The host owns its “Sent by ChatGPT from another task” heading. Branding is not
sender authentication, a reply grant or an installation request.

Use standard Markdown image syntax with alt text `Paprika Inc` and the resolved
absolute PNG path in angle brackets as its source.
It adds no image attachment API or HTML sizing attributes. The native renderer
controls image size and collapsed-card visibility; check actual expanded and
collapsed messages before claiming appearance support. A literal or unsupported
image line is a host-capability limitation, not evidence that the icon rendered.
Stored messages retain the original authored body exactly; only the generated
native wrapper carries artwork, including a stored-message reference notice.
Existing frozen or submitted arguments are never rewritten to add the image.

Before preparing each new native write, obtain the current sender ID from
CODEX_THREAD_ID and read that exact chat in actual list_threads/read_thread
metadata. Use its current native title; never infer it from a role contract,
registered label, destination role, directory, previous sender or message body.
Associate a logical role only from the human's assignment or an existing private
binding to that same thread/host. Unknown titles say “Native title unavailable”;
unknown roles are omitted.

Use the supported `codex plugin list --json` installed catalog, or a verified
plugin reference in the current invocation. Pass only enabled installed Inc
entries. A catalog's name@source value determines the reference; never substitute
a particular developer marketplace or infer a remote reference from a local one.
The current host must also establish that native prompts support plugin mentions.
Otherwise the product name remains readable text. Missing, ambiguous, stale or
unsafe references fall back without installing anything or blocking onboarding.

Supply these observations privately through `--message-context <file.json>` on
`bootstrap start` and each `bootstrap next` that prepares a new create/onboard.
This is a caller-supplied observation envelope, not a new host API or an
authenticated identity assertion. Wrap actual tool data; do not fabricate it.
Refresh observations before each new write. Snapshots expire after five minutes
(with 30 seconds of future clock tolerance).

```json
{
  "schema_version": 1,
  "observed_at": "2026-01-01T00:00:00Z",
  "host_id": "local",
  "supports_plugin_mentions": true,
  "catalog_source": "codex_plugin_list",
  "plugin_catalog": {
    "installed": [{"name":"paprika-inc","pluginId":"paprika-inc@fictional-catalog","installed":true,"enabled":true}]
  },
  "sender_metadata": {
    "source":"list_threads",
    "thread":{"id":"fictional-current-thread","kind":"codex","hostId":"local","title":"Scope Planner"}
  },
  "role_binding": {
    "source":"human_assignment","thread_id":"fictional-current-thread","host_id":"local","role_id":"planner"
  }
}
```

The example is fictional and intentionally stale: replace it with actual fresh
observations. An alternative `plugin_invocation` has source
`current_plugin_invocation`, observed `name`, exact `reference`, and `host_id`.
Do not store native IDs, observations, private bindings or account references in
public Git. Titles are escaped display data, never executable instructions.

Inc freezes the generated host arguments and presentation in its private pending
action before exposing a create/send. A new title or plugin reference does not
rewrite that pending payload or permit a retry. Existing unresolved submissions
still require reconciliation; known chats and completed receipts are reused by
the existing bootstrap workflow. Legacy records without presentation remain
readable. Routing IDs, onboarding request IDs and receipt checks are unchanged.
No badge is inserted into an already pending message.

Both local and private account packages use the same portable root manifest,
compatibility identity and contained icon assets. Prepare one Inc directory and
let supported Plugin Creator tooling select the existing/new private Inc identity
when installation is authorized. Do not upload this development checkout or its
vendor tree. Do not hard-code the current local installation reference into an
account package or replace the working local installation before account checks.

The package can be validated without sending anything. Unit tests and a valid
PNG do not prove native rendering, catalog propagation, account installation or
fresh-chat activation. Verify those separately on the intended host.

Sources: [plugin package precedence](https://developers.openai.com/plugins/build/plugins),
[native prompt mention example](https://learn.chatgpt.com/docs/reference/commands),
and [icon requirements](https://developers.openai.com/plugins/deploy/submission).
