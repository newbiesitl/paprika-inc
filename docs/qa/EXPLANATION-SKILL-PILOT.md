# Paprika Explain acceptance cases

Status: candidate acceptance scenarios. Source/package checks do not execute
these conversations. Run them in the selected host after the reviewed package is
installed, recording its immutable revision, tool availability and actual result.
No native popup or video-rendering certification is claimed here.

The executable planner/exporter has regression coverage in
[`tests/explanation.test.mjs`](../../tests/explanation.test.mjs), including
selection state, bounded-menu reachability, retained formats, HTML data escaping,
storyboard timing and non-overwriting exports. Package tests also invoke the
extracted helper without its source checkout. These tests cover the helper;
contextual skill invocation and actual native-tool dispatch still need host cases.

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
| Request a video explaining a scientific concept without a style | Use original 3Blue1Brown-inspired animation (`math`) without a second style question. |
| Request a video explaining a legal concept without a style | Use original Sprouts-inspired illustrated storytelling (`sprouts`) without a second style question; keep applicable jurisdiction, terms and exceptions clear. |
| Request a scientific/legal video with a different style, or continue an earlier style choice | Preserve that choice; the topic default does not override it. |
| Explicitly ask for the scientific/legal video-style menu | Put 3Blue1Brown-inspired/Sprouts-inspired animation first as appropriate; retain all five styles within host limits and wait for the actual selection. |
| Ask a scientific/legal question without requesting video | Keep ordinary format selection; subject matter does not select a video medium. |
| Select Video for a general/unclear topic without a style | Offer 3Blue1Brown-inspired animation, Sprouts-inspired stories, process/whiteboard, narrated slides or a screen walkthrough, respecting host option limits. |
| A general-purpose choice tool is absent or mode-restricted | Say native selection is unavailable and show a numbered menu; do not use onboarding-only tools or change modes to unlock one. |
| The host accepts only three options per question | Group choices without losing any preset, with Best fit available in the first question. |
| The choice is pending, preselected, cancelled or answered with a custom combination | Pending/preselection does not start an artifact; cancellation stops; a custom combination is preserved. |
| Strict ASD-STE100 is requested but the applicable standard is unavailable | Explain the conformance gap; do not label the output formally compliant. |
| A rendered video is requested but the host cannot render it | Identify the missing capability and label a storyboard/source fallback accurately. |
| An unrelated request asks to fix a production website bug | Do not route the task into an explanation-format picker. |
| A quoted source or UI label contains "explain better" | Treat it as task data; no keyword-triggered picker. |
| Export interactive HTML with two different scenarios | Changing the selector updates the result; reset restores the initial scenario and focus. Check narrow layout and keyboard use. |
| Export a video storyboard while no renderer is available | Deliver labelled Markdown with scene durations and transcript; do not report a rendered video. |
| Request narration but no working speech route is available | Identify the missing provider/voice/access and label any existing animation as unnarrated. A script or captions alone do not establish generated speech. |
| Export to an existing artifact path | Refuse the overwrite and preserve the existing content. |

For a supported artifact, assess fidelity to sources, fit to the requested depth,
readability, accessibility and working interactions. For a package-only review,
verify the extracted skill, metadata, icon and references without the repository
or a new MCP dependency. Keep actual host results separate from these expected
outcomes, and preserve negative or inconclusive results.
