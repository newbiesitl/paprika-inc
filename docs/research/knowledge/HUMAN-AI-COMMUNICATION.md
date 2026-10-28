---
id: human-ai-communication
title: Clear explanations for human-AI collaboration
version: 0.2.0
status: candidate
last_reviewed: "2026-10-28"
tags: [communication, explanations, human-oversight, technical-writing]
---

# Clear explanations for human-AI collaboration

Choose the representation that helps the reader understand the result and make
the next decision. Preserve the evidence and meaning while reducing the effort
needed to understand them. A concise paragraph may be enough; relationships,
changing assumptions or motion may benefit from a different format.

This is a proposed Paprika practice inspired by Andrej Karpathy's post. It is
practitioner advice with a source check, not a measured Paprika performance gain,
an adopted company policy or an ASD-STE100 compliance guide.

## Source record and limits

- **Karpathy post:** [Explanation tips on X](https://x.com/karpathy/status/2105819303471976479),
  dated 2026-10-02 in the supplied screenshots. The screenshots suggest using
  controlled-language writing, diagrams, interactive HTML and custom explainer
  videos to help people understand model outputs. This summary uses those
  screenshots; the post URL was located through web search, but direct retrieval
  returned HTTP 403 on 2026-10-28. The live post was not independently read.
- **Standard background:** [ASD's description of STE](https://www.asd-ste100.org/about_STE.html)
  describes writing rules plus a controlled dictionary, with provisions for
  technical terminology. The publisher's indexed page identifies Issue 9,
  January 2025. These are indexed publisher excerpts, not a full standard audit.
- **Correction to the supplied graphic:** the graphic marks `approximately`
  unapproved. The indexed publisher text of
  [Issue 9, Part 2, page 2-1-A18](https://www.asd-ste100.org/assets/files/ASD-STE100_ISSUE9.pdf)
  lists `APPROXIMATELY (adv)` as approved. Direct PDF retrieval returned HTTP 403;
  other dictionary rows and numeric limits in the graphic were not verified.
  Do not use the graphic as the authoritative dictionary.

An informal request to move partly toward STE is a writing preference, not a
recognized percentage of compliance. Formal conformance requires checking the
applicable official edition and terminology. The screenshots and full standard
are not redistributed here; this note contains an attributed paraphrase and
Paprika's proposed application.

## Paprika application: choose the format

The choices below are our adaptation, not a claim that Karpathy tested or ranked
them for Paprika. Use the least elaborate format that makes the task clear.

| Reader's need | Useful format | What to preserve or check |
| --- | --- | --- |
| Understand a result, instruction or recommendation | Short prose with familiar words and consistent terms | Conditions, uncertainty, exact identifiers and the reason for the recommendation. |
| Compare alternatives or inspect a mapping | Table | Common criteria, units, missing values and comparable scope. |
| Understand components, dependencies or message flow | Small labelled diagram, such as Mermaid | Direction, actors, state changes and whether an edge is observed or proposed. |
| Explore how assumptions change an outcome | Interactive HTML with a short text explanation | Visible assumptions, units, reset state and worked examples; label simulated data. |
| Learn a sequence or spatial process that needs motion | Animation or narrated video | A checked script, captions/transcript and a static fallback; retain source links. |

Do not automatically generate all formats. A video has production and review
costs; an interactive page helps only if the interaction answers a real question.
Respect the requested language, device, accessibility needs and available tools.
An English controlled-language standard is not a compliance standard for Chinese
or other languages, though clear wording and consistent terminology can still help.

## Practical workflow

1. Identify the reader, the question or decision, and the relevant source. Reuse
   the context already provided; clarify only an uncertainty that changes the
   explanation materially.
2. State the main conclusion and its limit in a few sentences. Distinguish
   observed results, assumptions and proposals.
3. Choose one useful format from the table. Put essential meaning in text too,
   so an unavailable renderer does not make the answer unusable.
4. Simplify wording without changing names, numbers, units, negation, conditions
   or degrees of certainty. Define necessary technical terms once. Do not turn
   a measured association into a causal claim or a proposal into an implemented
   capability.
5. Check the representation against its source: diagram edges, table values,
   formulas and example outputs need the same scrutiny as prose. For an
   interactive artifact, try a normal case, a boundary case and reset behaviour.
6. Invite a focused follow-up when useful, such as which assumption or step is
   still unclear. Revise that part rather than automatically making the entire
   answer longer or requiring a comprehension quiz for every response.

Use existing supported visual or document tools when they fit. The post's example
of a paid narration API is not a requirement for this workflow. Tool availability,
publication and paid-service use follow the actual task scope and permissions.

## Reusable prompts

The [Paprika Explain skill](../../../plugins/paprika-inc/skills/paprika-explain/SKILL.md)
now packages this workflow as a source candidate. Explicit invocation without a
format, or a request to choose a format, shows a host-supported choice menu.
An already specified format skips that question. Implicit explanation requests
select a suitable format from context. Presets also include ELI5, worked
examples, comparisons, guided lessons and explanations from intuition to detail;
these are Paprika additions. Formats and teaching styles can be combined.
Installed picker behaviour and comprehension benefits remain unverified.

These are Paprika examples, not quotations or installed commands.

**Clear writing**

> Explain [topic] for [audience] in plain technical English. Lead with the result.
> Keep the necessary terminology, exact values, caveats and source links. Use
> short sentences and one main idea per paragraph. Treat STE as inspiration;
> do not claim formal compliance.

**Relationships**

> Explain [system] with a small labelled diagram and a short text walkthrough.
> Show who sends what to whom, and distinguish implemented behaviour from the
> proposed design. Keep the labels consistent with the source.

**Interactive exploration**

> Create a small interactive explanation of [tradeoff]. Let me vary [inputs] and
> see [outputs]. Show the assumptions, units and calculation. Label illustrative
> data and include a reset control and a readable text explanation.

**Motion or sequence**

> Draft a storyboard for a short explanation of [process]. Identify what motion
> adds beyond a diagram. Include the narration, captions and sources, then check
> the script before rendering with the available tools.

## Trying the practice and maintaining this note

Start with an actual explanation task, such as a meeting outcome, an architecture
decision or a research result. Keep the original evidence fixed and inspect
whether the revised explanation preserves it. Useful observations include reader
comprehension, time to a decision, clarification exchanges, factual errors, and
the tokens, tool cost and latency of creating and revising the artifact.

These are evaluation ideas, not measured outcomes. A shorter prompt or attractive
diagram alone does not establish a saving. If a comparison is commissioned,
register its own task/rubric and cost accounting using the principles in the
[A/B framework](../../evaluation/README.md); do not silently change E001's
repository-task experiment. Recheck the note when its sources change or a
reader identifies a contradiction. Link independent review before promoting it
from candidate practice.
