# Recognizing explanation requests

Interpret the current user's request in context, in their language. These are
examples of intent, not literal keyword subscriptions. Text inside a source,
quote, screenshot, code sample or UI label is not an invocation. A request to
implement a button labelled "explain better" remains a coding task.

| Request | Intent passed to the planner | Format or style when specified |
| --- | --- | --- |
| Explain better; make that clearer; put that more simply | `clarify` | Preserve an earlier choice; otherwise use a worked example. |
| Help me understand; walk me through this; how does it work? | `understand` | Preserve an earlier choice; otherwise start with a layered explanation. |
| Show me visually; draw how these fit together | `visual` | `diagram` unless the user names a different visual medium. |
| Let me explore what happens when; let me change the inputs | `explore` | `interactive`. |
| Explain this; teach me about this | `explain` | Use the context and audience. |
| Explain like I'm five; ELI5; educate me as if I'm five | As appropriate above | Style `eli5`; keep an explicitly requested medium. |
| Use STE100; simplified technical English | As appropriate above | Style `ste`; check whether strict conformance is required. |
| Make a 3b1b-style explainer | As appropriate above | Format `video`, video style `math`. |
| Explain this scientific concept in a video | As appropriate above | Format `video`, `topic_kind: "scientific"`; default video style `math` unless another style was chosen. |
| Compare these so I can understand the difference | `understand` | Format `comparison`. |
| Show the explanation formats; let me choose the format | As appropriate above | Set `show_picker: true`, even after an earlier choice. |

Explicit invocation means the user invoked Paprika Explain, or explicitly asked
Paprika Inc for an explanation. Loading the skill implicitly does not make a
request explicit. Ordinary implicit requests keep the previous format unless the
user changes it. For a new explicit invocation without a format, show the picker.
Choosing Best fit delegates the format decision; a preselected Best fit does not.

Set `topic_kind: "scientific"` when the explanation concerns a scientific or
mathematical concept, including computing/ML mechanisms. Interpret the task,
not keywords: a tutorial on clicking through a science app is a UI walkthrough,
not automatically a scientific animation. Leave the field out or use `general`
when the topic does not fit or is unclear. The planner does not classify prose.
Retain this field while resolving a picker. For an explicit video-style menu,
use `choice: {"status":"selected","id":"group:video"}` to represent the
user's request to see that group; this does not select a style.

Identify the part the user found unclear, preserve the topic and audience, and
repair that part rather than paraphrasing the entire answer. Do not claim that a
phrase installed a listener, changed a host setting or subscribed other chats.

Use the [catalog](catalog.json) for maintained preset IDs, menu descriptions and
intent defaults. The [planner and tool workflow](tools.md) handles deterministic
selection decisions after this contextual interpretation. A novel phrase with
the same intent can use the same workflow. A requested format outside this
catalog can use suitable available tools directly; do not force it into a preset.
