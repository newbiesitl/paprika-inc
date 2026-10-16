# Curated external skill adoption

Status: implemented pilot candidate. Governing assignment policy: definition
commit `e1e7f1843de36b2fd60645f6c8f671cbd8e16db0`. Candidate changes cannot expand
their own authority. See [self-development](SELF-DEVELOPMENT.md).

## Source and adaptation boundary

The [selection](../../skill-packs/engineering-core.json) pins Karpathy-inspired
guidelines and Ponytail through Git submodules. Source commits and selected file
digests are explicit. Keep vendor checkouts unmodified.

- **Reuse:** generate complete named Ponytail review sections from pinned bytes,
  preserving its MIT notice. Reject missing sections, changed digests or pins.
- **Adapt:** write concise original Paprika guidance and record source/section,
  rationale and canonical home. Upstream updates prompt review, never automatic
  rewriting of our guidance.

Karpathy declares MIT in metadata but lacks a standalone license file at this pin.
We adapt ideas in original wording; no Karpathy prose is redistributed in the pack.
Resolve licensing before changing this choice.

One skill, paprika-code-review, covers shared principles and connected-code review.
Ponytail's persona, hooks, commands and output slogans are excluded. Paprika keeps
autonomous progress on reasonable reversible assumptions. Skills grant no access.

## Build and install

Run `python3 scripts/skill_packs.py --write` after editing reviewed selection and
adaptation inputs. This deterministically generates the bounded catalog/resources.
The compatibility command `research_pack.py --write` uses the combined writer.
Verification rejects stale/extra generated files without deleting them silently.
Commit source pins, selection, adaptation and generated files together.

The package allowlist includes selected resources/licenses only. Release users
need no vendor checkouts. Project-local plan/install/status accepts either known
set or both. Existing research-core manifest bytes and journal provenance remain
compatible. Engineering provenance records both source commits. This integration
does not force-replace skills or upgrade account plugins.

QA is the initial consumer. Other roles can reference the same pack after the pilot
without copying instructions or stacking global skills. Role refresh and company
adoption remain separate decisions.

## Reviewed updates

1. Inspect selected upstream/support files, licenses and relevant release changes.
2. Propose immutable pins and adoption changes: reuse, adapt, already covered or
   excluded. Give each rule a single canonical home.
3. Regenerate; run repository, runtime, extracted-package and integrity tests.
4. Compare representative work to the adopted baseline using
   [the pilot protocol](../qa/ENGINEERING-SKILL-PILOT.md).
5. Obtain independent technical review and applicable human adoption authority.
   The current installer reports managed-version conflicts; migration is explicit.

Rollback retains the previous source/pack and private provenance. Preserve local
modifications and unresolved work. This pilot makes no measured quality, speed or
token-cost improvement claim.
