---
name: paprika-explain
description: Explain a topic or previous answer when the user asks to explain better, help me understand, show visually, explore what happens, or choose an explanation format. Supports ELI5, STE-inspired English, diagrams, interactive webpages and video explainers; excludes ordinary website implementation and copywriting.
---

Help the user understand the current topic using an appropriate representation.
Reuse the conversation's topic, sources, language, audience and chosen format.
Ask for the topic only when it cannot be inferred. Do not read the whole company
knowledge collection to answer one explanation request.

Interpret [trigger phrases](references/triggers.md) in context. For deterministic
menu decisions or artifact export, use the contained [tools](references/tools.md):
`node <this-skill-directory>/scripts/explain.mjs`. Its `plan` command preserves
picker state, option limits and format/style combinations; `render-html` exports
interactive scenario pages and `storyboard` exports video plans with transcripts.
The helper does not install a renderer or invoke native host tools itself.

## Invocation and format selection

- If the user asks for a picker or format menu, show it, even if an earlier
  answer used a particular format.
- If the user explicitly invokes this skill, or asks Paprika Inc to explain a
  topic, and supplies no format, show the picker.
- If a request specifies a format, use it directly. Do not reconfirm an already
  clear choice. For example, an interactive ELI5 explanation combines a medium
  and a teaching style; preserve both.
- For implicit requests such as "explain better" or "help me understand", choose
  a suitable format from context without automatically opening a menu. An
  ordinary follow-up retains the chosen format unless the user changes it.

The picker presents presets, because STE and ELI5 describe language/depth while
a webpage or video describes the medium. Let the user combine or customize them.

| Preset | Short menu description |
| --- | --- |
| Best fit | Let the agent choose the simplest useful format. |
| STE-inspired technical English | Precise wording, consistent terms and short instructions. |
| Explain like I'm five | Everyday language and a concrete analogy, with limits preserved. |
| Diagram or visual map | Show components, relationships, flow or sequence. |
| Worked example | Follow one concrete case from inputs to result. |
| Comparison or decision table | Compare alternatives using the same criteria. |
| Interactive webpage | Change inputs and explore the resulting behaviour. |
| Video or animation | Learn through motion, narration or a screen walkthrough. |
| Guided lesson | Build understanding step by step with optional questions. |
| Layered explanation | Start with intuition, then reveal mechanism and technical detail. |

### Presenting the picker

Use an available general-purpose structured user-input or choice tool permitted
in the current host/mode. Ask one question: "How would you like me to explain
[topic]? Choose a preset or describe a combination." Put Best fit first and
identify it as the recommendation. Offer the other presets with their short
descriptions. The host controls whether this appears as a popup, panel or inline
menu; a skill cannot force a particular presentation.

Respect the tool's option limit. If it cannot hold the menu, first offer three
choices (Best fit; Text and learning; Visual and media), then show the selected
group's choices, splitting again if necessary. Keep Best fit available at the
first step, preserve every preset and accept a custom answer. Do not use
onboarding-only pickers for this ordinary workflow or
switch modes solely to unlock a picker. If no general-purpose choice UI is
available, say so briefly and offer the same choices as a numbered chat menu.

Wait for the actual selection. With an asynchronous input tool, a pending or
preselected option is not the user's answer; do not begin the format-dependent
artifact or silently choose after a timeout. A cancellation ends selection.
"Best fit" is an actual choice to delegate the format decision.

When the user requests video without a style, use the topic's recommendation:

- Scientific concepts: original 3Blue1Brown-inspired animation, building visual
  intuition through evolving diagrams, models and equations where useful.
- Legal concepts: original Sprouts-inspired illustrated stories, using simple
  cartoon characters, concrete scenarios and plain-language narration.

Preserve an explicitly requested style or the user's existing style choice on
a follow-up. These defaults select a video style; subject matter alone does not
request video. Pass `topic_kind: "scientific"` or `topic_kind: "legal"` to the
planner after interpreting the topic in context.

For other video topics without a specified style, offer a second choice:
3Blue1Brown-inspired animation, Sprouts-inspired illustrated stories,
whiteboard/process animation, narrated slides, or screen walkthrough. An explicit
request to choose video styles still opens that menu; put the topic's
recommendation first without treating it as an
answer. Use the same host-limit handling and allow free text.
Read only the relevant section of [format guidance](references/formats.md).

## Producing the explanation

Lead with the idea the user needs to understand. Preserve source values,
conditions, uncertainty and exact technical identifiers when changing wording.
Keep the explanation proportionate; do not create every possible format.

Use existing tools that fit the selected medium. An interactive local HTML
explanation needs no new MCP service; reading or changing real service data is
a separate integration requirement. Keep illustrative inputs labelled.
Use the [tool routes and schemas](references/tools.md) when an artifact needs
exporting or a rendering capability must be checked. Prefer the contained HTML
exporter for precomputed scenario comparisons; author a model-specific
interaction when the question needs continuous calculations or other behaviour.

For requested English speech or narrated video, default to installed Microsoft
David on Windows and Daniel (`en_GB`, 175 words per minute) on macOS. Explicit
voice, provider and speaking-rate choices take precedence. Follow the
[voice selection guidance](references/tools.md#narration-and-synchronization)
to resolve availability on the host that renders the audio. These preferences
do not add narration to an otherwise text-only explanation.

For requested HTML, images or video, deliver the actual artifact when supported
and inspect it. If rendering or another required capability is unavailable,
identify the gap and provide a clearly labelled fallback such as a diagram,
storyboard or source file. Do not describe a script or storyboard as a rendered
video. Keep the essential idea available in text as well.

Check meaning against the sources and behaviour against the selected format.
Use the [format guidance](references/formats.md) for STE limits, animation choices
and format-specific checks. A knowledge note or skill instruction is not evidence
that the host picker, rendering tools or improved comprehension have been tested.
