# Round-based meeting room pilot

Work: MR-PILOT-001. Status: implementation candidate; live adoption/deployment
and independent acceptance remain separate. The direct human assignment covers
this implementation. Existing governing definitions remain in force; this
feature changes no role contract, grant or dependency pin. The human owner is
the candidate reviewer. QA should examine the integrated private-service pilot
before rollout, including concurrency, recovery, privacy and host delivery.

The meeting chat facilitates a fixed roster. Invitations and explicit acceptance
precede discussion. Every participant reads the previous published round and
submits one bundle or explicit pass. All submissions publish together. Recipients
designate intended responders; every contribution is visible to every participant.
The last submission consumes exactly one round. At zero, publish the last batch
and close; final questions remain unresolved rather than creating free rounds.

The private-service implementation belongs upstream in Paprika Messenger:
MeetingService, the additive meetings migration, MCP/HTTP meeting tools, and the
board's Meeting rooms page. It uses one revisioned document per meeting and a
conditional write to commit submissions, publication, budget and notification
records together. Pilot bounds: 12 participants, 12 rounds, 8 comments and 4096
UTF-8 bytes per submission, 16000 bytes of curated notes. The default deadline
is 30 minutes per round. Timeout pauses without inventing passes; resume keeps
submissions and resets the deadline. Settings use revision checks. Roster and
brief freeze at start; closed meetings cannot restart. Early closure retains
incomplete work on the private board.

Inc's meeting message prepares a stored notice through its existing outbound
journal. message next/record/reconcile use the supported host route and observed
sender presentation. meeting receipt prepares the service receipt. No Codex
queue daemon or extra event subscription is introduced. Board creation and
clicks do not send native prompts. Coordinator and participants relay their own
actionable notices using Inc. Superseded notices do not request new turns.
Acceptance of delivery differs from reading and round submission.

The coordinator reads the transcript and records curated conclusions, decisions,
actions, disagreements and unanswered questions. Backend code performs no
synthesis and infers no agreement. Export writes notes.md and summary.md under
meetings/YYYY-MM-DD-topic/. Raw contributions and routing IDs stay private;
provenance stays under the shared Git common directory. Identical retries are
safe; edited, linked and incomplete export destinations are preserved. Review
the curated content before committing or publishing it.

## Run and acceptance

Use the compatible Messenger candidate source to run `npm run dev` with Node 24+.
Its loopback development board uses fixture authentication and local SQLite.
Open `/meetings.html`, select a board and registered facilitator, then create a
meeting using the participant multiselect. The preview does not change the live
service. Follow the [Inc meeting procedure](../plugins/paprika-inc/skills/paprika-inc/references/meetings.md)
for invitations, signals, submissions and export commands.

Required checks: concurrent final submissions/retries seal and decrement once;
invitation acceptances gate start; staged comments stay hidden; reply links target
published comments; deadline/resume/restart preserve work; final closure creates
no next round; export omits raw transcript/routing; existing files survive
conflicts; Inc routes match stored notices; UI/APIs retain owner/origin checks.
Browser acceptance exercises create/join/two rounds/pass/closure/notes/export and
a small screen. Fixture host results do not establish live chat delivery.

The in-chat entry is `@Paprika Inc, show meeting participants`. The companion
`show_meeting_participant_picker` tool serves an inline MCP App with a searchable
multi-select, pagination, retained selections and a 12-participant cap. It uses
the company's selected board, optionally excludes the verified coordinator,
revalidates every address on Apply, and attaches the roster to chat via
`ui/update-model-context`. Choosing alone creates no meeting or invitations.
The Inc skill consumes the attached IDs when the human requests the meeting.
The private-board setup page remains available as well. Native host rendering
requires the updated service/plugin connection and is distinct from local
bridge-fixture tests.

Reusable service changes are reviewed upstream before Inc adopts their exact
commit through docs/DEPENDENCIES.md. This candidate leaves vendor/ unchanged and
does not imply the installed/live service exposes meeting tools. Live chat
exchange and production deployment need evidence after the integrated candidate
is available.

Companion Messenger candidate: [PR #43](https://github.com/newbiesitl/paprika-messenger/pull/43),
commit `9d8d97c69729aaffd736246880a7ba17a0905426` on `codex/meeting-room`.
It requires upstream review and service rollout; this reference is not an
adopted dependency pin. The live service and installed Inc plugin must both
expose the compatible meeting workflow before native chat acceptance.
