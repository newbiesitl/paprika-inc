# Explanation formats

Use the section matching the user's selection. Presets can be combined: an
interactive webpage can use ELI5 language, and a worked example can use a
diagram. Keep language, medium and technical depth distinct when a combination
matters. Use the user's language unless they request otherwise.

## STE-inspired technical English

Use direct sentences, consistent terminology and one clear instruction at a
time. Keep technical names, units, conditions and uncertainty intact. This
preset is inspired by ASD-STE100; it is not a formal conformance certificate.
If the user specifically requires strict STE, consult the applicable official
edition and project terminology. If that evidence is unavailable, identify the
unverified conformance and provide a labelled draft rather than silently claiming
strict compliance. An English standard does not establish compliance in another
language.

The supplied overview graphic had at least one dictionary error: it marked
`approximately` unapproved, while the publisher-indexed Issue 9 dictionary
approves it. Use [ASD's official description](https://www.asd-ste100.org/about_STE.html)
and the applicable official standard rather than a generated cheat sheet.

## Explain like I'm five

Use familiar objects or a small story to build the central intuition. Avoid
baby talk and assuming the user is literally a child. Say where an analogy
stops matching the mechanism. Keep essential caveats; simplified wording must
not reverse the conclusion. Add the technical name once it helps connect the
intuition to later learning.

## Diagram or visual map

Choose a flowchart for a process, a sequence diagram for exchanges, a component
diagram for structure, or a concept map for relationships. Use a small number
of labelled elements and a short text walkthrough. Check arrow directions,
order and labels against the source; distinguish proposed and existing behaviour.
Use editable diagram tools or Mermaid where suitable, and verify rendering when
producing an artifact. A raster illustration is useful when the concept benefits
from it; it is not a substitute for readable labels and accurate relationships.

## Worked example

Choose one representative case, state the inputs and assumptions, and show the
intermediate steps and result. Verify arithmetic or executable examples. Add a
boundary case or counterexample only when it exposes a misconception. Label
invented numbers as illustrative rather than measured evidence.

## Comparison or decision table

Use the same criteria and units for every alternative. Distinguish unavailable
information from zero and separate observed performance from estimates. Explain
which criterion changes the decision instead of declaring a universal winner.

## Interactive webpage

Build a focused HTML explanation with controls tied to the question. Show
assumptions, labels, units, a useful initial state and reset behaviour. Keep
controls keyboard-accessible and labels readable on the user's device. Check a
normal input, a boundary input and reset. Include the essential interpretation
in text so the explanation survives a failed or unavailable renderer.

Prefer local, self-contained behaviour when live data is unnecessary. State when
a display is a simulation; fetching a real meeting's state or updating its budget
requires the existing authorized service interface, not invented endpoints.

## Video or animation

Select a style based on what motion adds:

| Style | Useful when |
| --- | --- |
| Mathematical animation, 3Blue1Brown-inspired | Geometry, transformations, probability or algebra benefit from synchronized shapes and equations. |
| Whiteboard or process animation | The order of events, causal steps or a system's changing state is the main lesson. |
| Narrated slides | A structured briefing needs figures, evidence and a reusable presentation sequence. |
| Screen walkthrough | The user needs to learn an actual UI or tool procedure from observed behaviour. |

Create an original script and visuals. For the mathematical option, use evolving
geometric intuition rather than claiming to be the named creator or reproducing
their voice. Preserve sources and labels; use captions or a transcript. Observe
the actual interface before depicting a screen walkthrough.

Check the storyboard/script, then render with available tools and inspect the
result when the user requested a video. Missing narration or video capabilities
must remain explicit. A storyboard is a useful fallback, not a completed video.
Choose a sensible duration from the task or reuse the user's duration; ask only
when it materially changes scope. Paid services and publication retain their
actual authorization requirements.

## Guided lesson

Introduce one idea, demonstrate it and let the user decide whether to go deeper.
Offer a question or small exercise when it helps; do not require a quiz after
every answer. Adapt to responses rather than continuing a fixed lecture after
the user has understood or changed direction.

## Layered explanation

Start with a concise intuition. Add a mechanism layer and optional equations,
implementation detail or evidence. Use progressive disclosure when the output
supports it. In plain chat, use short labelled layers and keep the initial
answer sufficient on its own.

## Provenance and evidence

The representation choices adapt the communication advice shown in supplied
screenshots of [Karpathy's post](https://x.com/karpathy/status/2105819303471976479),
dated 2026-10-02. Direct post and standard-PDF retrieval returned 403 during the
2026-10-28 source check; attribution rests on those screenshots and the standard
correction on publisher-indexed text. The additional learning presets are
Paprika recommendations, not a claim that Karpathy proposed or evaluated them.

The repository knowledge entry `human-ai-communication` records the fuller
source appraisal. This packaged reference is sufficient to use the workflow
without the repository. No comprehension gain, token saving or rendering-tool
availability is established by these instructions.
