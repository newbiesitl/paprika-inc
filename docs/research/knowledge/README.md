# Reusable company knowledge

This index collects public, source-linked knowledge that can help Paprika agents
and their human collaborators. Entries are reviewable reference material, not
new role instructions or evidence that an optimization has worked. This follows
the [harness roadmap's knowledge stewardship](../../roadmap/AGENT-HARNESS.md#operating-loop-and-knowledge-stewardship).

| Entry | Use it when | Maturity |
| --- | --- | --- |
| [Human-AI communication](HUMAN-AI-COMMUNICATION.md) | Choosing an explanation format, simplifying technical writing, or making agent results easier to review. | Candidate practice; source checks have explicit limits; Paprika benefit is unmeasured. |

## Format and maintenance

Use one Markdown file per reusable topic, with small YAML front matter for a
stable ID, version, status, review date and tags. Keep these fields descriptive;
they are not executable settings or authorization. Put source links, dates,
verification limits, the useful takeaway, applications and open questions in the
body. Separate source claims from Paprika's own recommendations.

Keep the ID stable when revising an entry. Use Git history for changes and link
any successor when a note becomes obsolete. Record contradictions rather than
silently replacing evidence. Recheck a source when its version changes, a claim
is challenged, or the intended use requires stronger evidence; a date alone is
not a freshness guarantee. Link independent review before describing an entry
as reviewed. Use existing issues and PRs for ownership and review status.

The [ownership map](../../../company/ownership.json) already covers this directory
under `docs/research/`. Domain specialists maintain their evidence; shared
knowledge methods belong to the proposed Agent Systems Engineer workstream.
This index creates no live assignment. Keep private conversation content,
attachments, native identifiers and bindings in the existing private store.

## Knowledge, skills and MCP

| Layer | Purpose | Recommendation for this material |
| --- | --- | --- |
| Markdown knowledge | Preserve the explanation, sources, uncertainty and revisions. | Canonical record now, with this small index for discovery. |
| Skill | Apply a repeatable explanation workflow when the task calls for it. | A useful next step after trying the practice; keep the instructions short and load the relevant reference on demand. |
| MCP service | Expose live data and controlled operations to connected agents. | Consider when shared remote search, access control or concurrent updates require a service. A static note does not require one. |

These layers can complement each other. OpenAI documents skills as reusable
instructions/resources and MCP servers as providers of live information and
controlled actions; skills can operate without MCP. See the
[official skills documentation](https://developers.openai.com/plugins/concepts/skills)
(checked 2026-10-28).

Today, ask an agent to read the selected entry by repository path or link. Adding
these files does not automatically load them into every chat. Keep the index
small and retrieve only the relevant note instead of copying the whole collection
into each role prompt. A later packaged skill should carry a pinned reference
with its source ID/revision; it must not assume the repository is present in the
installed plugin. Any future MCP interface would serve the same versioned
knowledge rather than become a competing source of truth.
