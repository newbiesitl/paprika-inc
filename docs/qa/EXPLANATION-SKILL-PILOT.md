# Paprika Explain acceptance cases

Status: candidate acceptance scenarios. Source/package checks do not execute
these conversations. Run them in the selected host after the reviewed package is
installed, recording its immutable revision, tool availability and actual result.
No native popup or video-rendering certification is claimed here.

The [skill](../../plugins/paprika-inc/skills/paprika-explain/SKILL.md) uses a
general-purpose host choice tool. Its presentation can be a panel, popup or
inline menu. These cases apply to the workflow rather than a particular widget.

| Request or condition | Expected observable result |
| --- | --- |
| Explicitly invoke Paprika Explain on an established topic, with no format | One format question appears using the available general-purpose choice UI. The agent waits for a response before producing the artifact. |
| Ask Paprika Inc to explain a topic and show the format menu | Route to Paprika Explain and show the same choices without requiring a board or service. |
| Ask to explain the topic as an interactive ELI5 webpage | Preserve both medium and teaching style; skip the picker and produce/inspect the supported artifact. |
| Say "explain better" or "help me understand" as an ordinary follow-up | Reuse the topic and improve the explanation without opening the picker automatically. |
| Ask for a format menu after choosing a diagram previously | Reopen selection rather than assuming the previous choice. |
| Select Video without a style | Offer mathematical animation, process/whiteboard, narrated slides or a screen walkthrough, respecting host option limits. |
| A general-purpose choice tool is absent or mode-restricted | Say native selection is unavailable and show a numbered menu; do not use onboarding-only tools or change modes to unlock one. |
| The host accepts only three options per question | Group choices without losing any preset, with Best fit available in the first question. |
| The choice is pending, preselected, cancelled or answered with a custom combination | Pending/preselection does not start an artifact; cancellation stops; a custom combination is preserved. |
| Strict ASD-STE100 is requested but the applicable standard is unavailable | Explain the conformance gap; do not label the output formally compliant. |
| A rendered video is requested but the host cannot render it | Identify the missing capability and label a storyboard/source fallback accurately. |
| An unrelated request asks to fix a production website bug | Do not route the task into an explanation-format picker. |

For a supported artifact, assess fidelity to sources, fit to the requested depth,
readability, accessibility and working interactions. For a package-only review,
verify the extracted skill, metadata, icon and references without the repository
or a new MCP dependency. Keep actual host results separate from these expected
outcomes, and preserve negative or inconclusive results.
