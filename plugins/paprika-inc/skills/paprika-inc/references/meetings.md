# Meeting room pilot

Use for an explicitly requested round-based meeting. The meeting chat facilitates
discussion; backend tools validate submissions and advance rounds. This source
pilot requires the meeting tools on the selected private service. It deploys no
service and enables no receiver.

Use the established company board and verified coordinator/participant addresses.
`create_meeting` takes an immutable meeting_id, title, goals, expectations,
participant_ids, round_limit (1–12), and deadline_minutes (default 30). Select
1–12 participants besides the facilitator. It stores invitations without sending.

Participants read `get_meeting` and `get_meeting_round` round 0, then call
`accept_meeting_invitation`. Relay their acceptance notices through Inc. Start
with `control_meeting` after everyone accepts. The roster and brief freeze at
start. Configuration uses expected_revision; reload after a conflict.
Change the configured round budget only on the human's configuration request;
the coordinator must not automatically extend its own meeting.

Each ROUND_START names the previous published input round. Everyone reads that
same snapshot. Submit one `submit_meeting_round` bundle per participant/round:
kind comments, or explicit pass with no comments. Each comment has text,
recipients, optional kind (comment/question/answer/conclusion), and optional
reply_to referencing a published comment. All comments are visible; recipients
designate responders. A bundle permits 8 comments and 4096 UTF-8 bytes of text.
Preserve original wording. Reads and receipts are never passes.

After submitting, relay the stored SUBMISSION_RECEIVED notice to the coordinator.
The last submission atomically publishes the complete batch, consumes one round,
and prepares next-round signals or closes at zero. The coordinator shows the
attributed batch in the meeting chat and relays pending signals. Deadline expiry
pauses without fabricated passes. Resume preserves submissions and resets the
deadline without consuming a round. Identical retries are safe; conflicting or
stale submissions fail. Final-round questions may remain unresolved. Closed
meetings cannot restart. Existing collaboration-chain limits remain independent.

## Delivery through Inc

Save the actual get_meeting result privately. Choose a stored notification whose
sender is this chat's verified participant address, within the human meeting
grant. Send only notices relevant to current state, never obsolete invitations
or old round signals simply because their receipts are missing.

```text
node <inc-helper> meeting message --repo <repo> --meeting-report <private-report.json> --notification <notification-id>
node <inc-helper> message next --repo <repo> --operation <operation-id> --delivery-context <private-routes.json> --message-context <current-sender.json>
```

Follow message next/record/reconcile for each exact returned host action. Stored
board, sender and recipient are enforced. Stable operation IDs preserve pending
native uncertainty after restarts. Notices contain references and round budget;
contributions stay on the private board. Inc keeps its sender presentation and
existing transport; no new daemon or subscription is introduced.

After confirmed delivery, run `meeting receipt --repo <repo> --operation <id>`
and invoke its returned record_meeting_notification operation against the same
service. Native acceptance or stored_events_only does not prove reading. Never
clear an uncertain journal or blindly resend a native prompt. Notices do not
grant host permissions.

## Notes and export

At closure, read published rounds and any retained incomplete round. The
coordinator synthesizes conclusions, decisions, action_items, unresolved
questions/disagreements, and additional_notes through update_meeting_notes with
the current revision. The backend runs no model and infers no consensus.

Save the export_meeting_notes result privately, then run:

```text
node <inc-helper> meeting export --repo <repo> --meeting-report <private-export.json>
```

It saves meetings/YYYY-MM-DD-topic/notes.md and summary.md (dates labelled UTC).
Use --export-name YYYY-MM-DD-other-topic for a collision or revised export.
Identical retries are safe; edited or incomplete files are preserved. The raw
transcript and routing IDs are omitted; provenance stays in the shared Git common
directory. Review curated content before committing/publishing. No commit/push
is created.

The private board's Meeting rooms page supports setup, participant multiselect,
acceptance, round controls, contributions, notes and export-bundle download.
Browser actions store state; native chat delivery uses the Inc workflow above.
