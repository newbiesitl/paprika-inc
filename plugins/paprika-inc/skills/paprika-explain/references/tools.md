# Explanation tools

The contained Node.js 24+ helper handles menu planning and artifact export. It
does not call a model, contact a service, install dependencies or open a host UI.
It works from the extracted plugin without a company repository or board.
Use the actual skill directory in these commands; quote paths. Keep input files
containing conversation material in the task's private or ignored working area.

```sh
node "<skill-directory>/scripts/explain.mjs" catalog
node "<skill-directory>/scripts/explain.mjs" plan --input request.json
node "<skill-directory>/scripts/explain.mjs" render-html --input explanation.json --output explanation.html
node "<skill-directory>/scripts/explain.mjs" storyboard --input video.json --output storyboard.md
```

Inputs are UTF-8 JSON, at most 1 MiB. Artifact destinations must have an existing
parent directory and use `.html` or `.md` respectively. Export refuses to replace
an existing file; select a new output path or edit an existing artifact through
the normal authorized file workflow. The helper is a local tool, not a registered
MCP endpoint or an automatic skill-discovery hook.

## Planning and native selection

After interpreting the [trigger](triggers.md), create a request such as:

```json
{
  "topic": "How a queue affects response latency",
  "invocation": "explicit",
  "intent": "understand",
  "ui": {"mode": "native", "max_options": 3}
}
```

Set `ui.mode` from actual permitted general-purpose choice-tool availability;
do not claim native support from the planner output. Its default is a text menu.
Read the current tool schema, map the returned question, labels and descriptions
to that schema, and retain the IDs locally for interpreting the answer. Output
objects are not native tool arguments and must not be passed blindly. Do not use
onboarding-only pickers. If a host permits fewer than three choices, the helper
uses a text menu so that no option is lost.

| Planner result | Agent's next action |
| --- | --- |
| `not_applicable` | Continue the user's original task. |
| `needs_topic` | Ask only for the missing topic. |
| `choose` | Present the returned options using the allowed host UI or `text_menu`. |
| `waiting` | Keep the pending question open; do no format-dependent work. |
| `cancelled` | Stop selection without starting an artifact. |
| `explain` | Follow the selected format guidance and the capability routes below. |

For an actual answer, rerun `plan` with the same request and one `choice`:

```json
{"status":"selected","id":"eli5"}
```

Group IDs such as `group:text` return a smaller menu. `video` selects the video
medium: for scientific topics without a chosen style it uses `math`; otherwise
it preserves a chosen style or opens the style menu. `group:video` explicitly
opens that menu even for a scientific topic; a style ID such as `video:math`
completes it. When presenting a menu, mark its `recommended_id` as recommended.
A custom combination is
`{"status":"selected","selection":{"format":"interactive","style":"eli5"}}`.
Pending/preselected choices use `status: "pending"`; cancellation uses
`status: "cancelled"`. Never convert elapsed time or the default highlight into
`selected`. If a user asks for a different medium while choosing, interpret that
actual answer rather than continuing an obsolete menu.

For a format already named in the request, supply
`requested: {"format":"interactive","style":"eli5"}`. For an ordinary
follow-up, use `invocation: "implicit"` and pass the last selection as `previous`.
Styles are `plain`, `ste` and `eli5`. Video styles are `math`, `whiteboard`,
`slides` and `walkthrough`. Format IDs are listed in the catalog; `text` is also
accepted for plain prose. Use `show_picker: true` to reopen selection.

Set `topic_kind: "scientific"` for scientific/mathematical concepts identified
from the task context. The optional field otherwise defaults to `general` and
does not scan the topic for keywords. For example:

```json
{
  "topic": "How gradient descent updates model weights",
  "topic_kind": "scientific",
  "invocation": "explicit",
  "requested": {"format":"video"}
}
```

This returns `explain` with `video_style: "math"`. A requested or previous style
takes priority, pending/cancelled menus still wait/stop, and non-video selections
are unchanged. Keep `topic_kind` when rerunning a picker request. This default
does not imply a renderer or speech provider is installed.

## Capability routes and completion checks

These are capability names, not invented tool APIs. Discover the actual tools
and follow their instructions. Read only the guidance for the selected format.

| Route | Tool choice and deliverable | Check before delivery |
| --- | --- | --- |
| Text, STE, ELI5, worked example, comparison, guided or layered | Produce the explanation in chat/Markdown; use a calculator or executable example when needed. | Meaning, units, examples and depth. Strict STE needs the applicable official standard. |
| Diagram | Mermaid for a small technical diagram; SVG or an available visualization tool for other structured visuals; image generation when a raster illustration helps. | Rendered labels, arrows, reading order and source fidelity. |
| Interactive HTML | Use the exporter below for discrete scenarios; use an available visualization skill or authored HTML/JS for continuous models, plots or other interactions. | Normal and boundary inputs, reset, keyboard use and a narrow viewport. |
| Video / animation | Export a storyboard, then use an available renderer. Mathematical animation can use Manim if installed; slides/process animation can use an available animation or video pipeline. | Actual video file, duration, representative frames and audio/caption timing if present. |
| Screen walkthrough | Observe the actual application with available browser/computer tools, then use supported capture/recording tools. | Recorded steps match the observed UI; no invented screens or private information exposed. |

Check renderer availability with its supported help/version interface before
claiming it can run. This package does not bundle Manim, FFmpeg, speech services
or a video recorder. Use their current official instructions when needed; do not
guess package APIs or silently install tools. A video task is complete only when
the requested rendered output exists and has been inspected. If a capability is
missing, identify it and offer the clearly labelled storyboard or source fallback.
Do not send data to a paid service or publish an artifact without applicable scope.

### Narration and synchronization

Speech generation is a separate capability from animation. Check the actual
host/provider before promising a narrated video. Reuse a configured supported
speech tool or API; a new MCP server is unnecessary for a local script workflow.
Do not assume that a chat subscription supplies speech API credentials.

For a hosted implementation, OpenAI's [Speech API](https://developers.openai.com/api/docs/guides/text-to-speech)
is a candidate: `gpt-4o-mini-tts` supports delivery instructions and WAV output;
the official guide recommends trying `marin` or `cedar` for quality. Verify
current model/voice availability and actual account access. Use a standard
synthetic voice, disclose AI-generated narration and keep keys outside artifacts.
For a local Windows fallback, an installed voice can write WAV through
[System.Speech](https://learn.microsoft.com/en-us/dotnet/api/system.speech.synthesis.speechsynthesizer.setoutputtowavefile).
Check the voice/language and sample quality on that host; availability does not
establish naturalness or suitability for a finished explainer.

Generate a short sample containing the lesson's difficult terms before the full
track. Then synthesize per scene, measure the resulting audio duration, and use
that duration to time the animation and captions. Keep the mathematical notation
in the visuals while writing a pronounceable narration script. Retain the script
and reusable audio keyed by text, provider/model, voice, language and delivery
settings so visual edits do not require synthesizing unchanged speech again.

When Manim is available, [Manim Voiceover](https://voiceover.manim.community/en/stable/quickstart.html)
offers audio-duration tracking, subcaptions and bookmarks for synchronization;
its [speech-service interface](https://voiceover.manim.community/en/stable/services.html)
supports provider adapters. Check the installed adapter's API/model support;
listing a provider does not prove support for every current speech model.
Other renderers can consume the same measured audio/scene timeline.

Inspect the final media's audio track and listen for terminology, pauses,
clipping and alignment; check caption timing as well. Do not pad a silent file
or claim browser playback controls provide a narrated MP4. If speech fails,
identify the failure and offer the existing animation with captions/transcript
as an explicitly unnarrated fallback. These routes are guidance, not bundled
speech adapters or evidence of an end-to-end narration test. Official references
checked 2026-10-28; recheck interfaces before implementation.

## Interactive HTML input

The exporter makes a self-contained, keyboard-accessible scenario selector,
reset control, expandable explanation sections, source links and a no-JavaScript
fallback. It switches between authored scenarios; it does not calculate a hidden
model, execute supplied expressions or fetch live data. Verify the values before
export. Label invented examples and distinguish measurements from simulations.

```json
{
  "title": "Why requests wait",
  "summary": "Compare the effect of two workloads on one service.",
  "data_notice": "Illustrative precomputed scenarios, not measured service data.",
  "control_label": "Choose the workload",
  "sections": [{"heading":"The mechanism","body":"Work waits while the service is busy."}],
  "scenarios": [
    {"label":"Light load","explanation":"Requests can start promptly.","values":[{"label":"Waiting requests","value":0}]},
    {"label":"Heavy load","explanation":"Requests wait for capacity.","values":[{"label":"Waiting requests","value":12}]}
  ],
  "sources": []
}
```

Supply 2–30 scenarios, each with a label, explanation and values list. Optional
`sections` contain headings and bodies. Optional `sources` contain `title` and
HTTP(S) `url`. Input strings are rendered as text, including anything that looks
like HTML or JavaScript. Keep the essential explanation in the chat too.

## Storyboard input

```json
{
  "title": "How a queue grows",
  "summary": "Show why work waits when arrivals exceed capacity.",
  "style": "Original mathematical animation",
  "scenes": [
    {"title":"Arrivals","duration_seconds":8,"visual":"Dots enter a service station.","narration":"Work arrives over time."},
    {"title":"Waiting","duration_seconds":12,"visual":"Extra dots form a queue.","narration":"Work waits when the service is busy."}
  ],
  "sources": []
}
```

The exporter validates scene durations and includes the narration as a transcript.
It produces Markdown explicitly labelled as a storyboard, not a video. Use the
storyboard as input to an actual renderer and keep captions/narration aligned
when producing video. A generated source file or a planned duration does not
prove successful rendering.
