# Scientific researcher role and skill integration

Status: proposed implementation; no skills or researcher chats are installed by this document.

Date: 2026-10-16. Implementation owner: Backend Dev. Design reviewer: Chief Architect.

Tracking: [issue #6](https://github.com/newbiesitl/paprika-inc/issues/6), following the [bootstrap MVP in PR #5](https://github.com/newbiesitl/paprika-inc/pull/5). PR #5 is stacked on PR #3; this proposal does not approve or merge either PR.

The assignment follows the repository definition at `e1e7f1843de36b2fd60645f6c8f671cbd8e16db0` and the human's explicit request to begin scientific-role integration. The narrower MVP scope continues to defer singleton, race-condition, and advanced lifecycle implementation. Candidate role definitions do not grant themselves authority or change the live development roster.

## 1. Outcome and implementation decision

A user can discuss a scientific researcher role with the first staff member, save the agreed role and ownership definitions, choose the `research-core` skill set, and bootstrap the role in a local Codex project. Onboarding reports exactly which research workflows are available and which need dependencies or external access.

Use **one pinned Git submodule as the upstream source**, then explicitly package and install a selected subset. A submodule is a development dependency, not an installed plugin, running service, or automatic skill activation.

Keep these concerns separate:

| Layer | Responsibility |
| --- | --- |
| Company role contract | Purpose, ownership, deliverables, review relationships, and limits |
| Skill-set manifest | Which reusable procedures that role should use |
| Source dependency pin | Exactly which upstream files were reviewed and packaged |
| Project installation | Which selected skill files were materialized locally |
| Runtime readiness | Whether required tools, packages, and access are available |

This is an optional Inc capability. Installing Inc alone must not activate the scientific collection for every project or install the upstream Scientific Agent Skills plugin.

## 2. Upstream source and starter selection

Repository: <https://github.com/K-Dense-AI/scientific-agent-skills>

- Proposed submodule path: `vendor/scientific-agent-skills/`.
- Initial candidate commit: `a1043ef544e3a100c28e70a736b6cf32554d0677`.
- Package version reported by that commit's `plugin.json`: `2.72.0`.
- This is a commit pin; do not invent or assume a corresponding release tag.
- Keep the submodule unchanged. Record the gitlink, repository, package version, and selection in dependency metadata, extending the existing schema compatibly.
- Preserve the root `LICENSE.md` and selected skills' license declarations. The reviewed starter skills declare MIT, with spelling/capitalization variations; preserve the actual notices rather than reconstructing attribution from README prose.

The first skill set contains exactly these four upstream directories:

| Skill | Core use | Baseline requirements from the inspected definitions |
| --- | --- | --- |
| `paper-lookup` | Scholarly search, identifiers, source retrieval, and provenance | Python 3.11+ for bundled helpers, curl, network; some routes have optional credentials or restricted full-text access |
| `literature-review` | Search protocol, screening, extraction, synthesis, and limitations | Python 3.10+ and requests for helpers; network for searches and DOI checks |
| `citation-management` | Metadata checks, DOI/identifier resolution, and bibliography generation | Python 3.9+ and requests; network; scholarly is optional for Google Scholar |
| `scientific-critical-thinking` | Methodology, bias, confounders, and evidence appraisal | Core analytical guidance has no network dependency |

Recheck requirements at the selected commit during implementation. The upstream repository's development-tool Python requirement is not a blanket requirement for every skill.

Optional PDF export, AI diagrams, Parallel, OpenRouter, Google Scholar support, and restricted full-text access are separate capabilities. They must not block a basic literature-and-evidence workflow when an appropriate supported alternative exists. Conversely, do not report these optional capabilities as available without their actual dependencies and access.

Statistical analysis, peer review, laboratory tools, clinical workflows, and the rest of the upstream collection are not part of this first selection.

## 3. Scientific researcher role template

Provide a fictional example/template using the stable role ID `scientific-researcher`; do not add a live role to this development company automatically. The user can rename or specialize the template through ordinary company authoring.

The template should define:

- **Purpose:** produce evidence-traceable answers to scoped scientific questions.
- **Responsibilities:** define the research question and search scope; retrieve relevant sources; screen and synthesize findings; check citations; assess methodological limitations; distinguish established findings, disputed claims, and hypotheses.
- **Inputs:** the assigned question, domain, date range, inclusion/exclusion criteria, permitted sources/data, output location, and requested level of depth.
- **Deliverables:** a research brief, source/bibliography records, a claim-to-evidence table, search provenance, and explicit limitations or unresolved questions. Preserve identifiers and retrieval dates when relevant.
- **Ownership:** the task's designated research artifacts and source records. Ownership must reference the company's canonical ownership map rather than duplicate conflicting path declarations in prompts.
- **Review:** a configured reviewer assesses claim/source support and scope. The researcher's own checks are not independent acceptance. Do not create an extra reviewer chat merely to satisfy this template.
- **Limits:** role and skill files do not expand host permissions, authorize purchases, install unrelated software, upload confidential material, publish research, or dispatch arbitrary company work.
- **Skill selection:** reference `research-core` once. Do not paste the four complete skill bodies into the role contract.

For the MVP, a single researcher may perform all four procedures. Additional analyst/reviewer roles can be defined later without changing the source dependency model.

## 4. Proposed repository and package layout

The following paths and schema fields are a proposed implementation interface, not currently available commands or files:

```text
vendor/scientific-agent-skills/       # upstream Git submodule, unchanged
skill-packs/research-core.json        # explicit selection and source reference
dependencies.json                    # authoritative pin metadata alongside gitlink
examples/scientific-company/         # fictional role, ownership, and company definitions
docs/proposals/SCIENTIFIC-RESEARCH-SKILLS.md
```

An illustrative skill-set manifest is:

```json
{
  "schema_version": 1,
  "id": "research-core",
  "source_dependency": "scientific_agent_skills",
  "skills": [
    "paper-lookup",
    "literature-review",
    "citation-management",
    "scientific-critical-thinking"
  ]
}
```

The source dependency record resolves the immutable commit, source path, and upstream package version. Generate a deterministic inventory of the actual packaged files and their digests. Role references such as `skill_sets: ["research-core"]` are proposed schema additions: validate them and keep pre-existing role definitions working.

Include the selected skill directories and required support files under an internal package resource directory, for example `runtime/skill-packs/research-core/`. Do not register this internal directory as Inc's public plugin skill root.

Exclude upstream plugin/marketplace manifests and unrelated skill directories from the emitted Inc artifact. Inc retains its existing public command/setup skills and identity. There is no additional upstream plugin installation or extra Messenger installation.

End-user packages must contain the needed payload; users must not fetch submodules or have the Inc development checkout available to activate the starter set.

## 5. Plan, installation, and status behavior

Extend Inc's existing command interface with skill-set planning, project installation, and status. Backend may choose concrete aliases consistent with PR #5; document only aliases actually implemented.

1. **Resolve:** validate the target company, selected roles, skill-set IDs, source pin, and target project. An absent skill selection preserves existing MVP behavior.
2. **Plan:** list selected skills, destination paths, licenses/provenance, file changes, existing-name conflicts, and missing runtime capabilities. Planning has no installation side effects.
3. **Install on request:** materialize complete selected directories into the chosen project's `.agents/skills/<skill-name>/`. Preserve scripts, references, and assets needed by their workflows. Do not use account-wide skill directories.
4. **Record:** retain managed-file inventory, digests, source commit, and per-skill results in private project/company state. Never publish actual local paths, native IDs, credentials, or research queries through the portable manifest.
5. **Check:** report installation integrity and capability readiness separately. Do not turn a dependency check into a paid API call or claim that package presence proves authentication or live service success.
6. **Onboard:** include the role's selected skill names, their installed locations, and known limitations in the existing bootstrap onboarding flow. Preserve the actual saved-project and native-thread checks from the MVP.

An unchanged managed installation is a no-op on a deliberate rerun. A skill with the same name but different or unmanaged contents is a conflict requiring an explicit resolution; never overwrite it silently. Resume after partial failures should preserve successful results and report the exact remaining work.

Project-local skills are discoverable by other chats using that project. A role's skill-set reference guides use; it is not per-role access control or exclusive skill visibility. Individual skills may appear in Codex's skill selector even though no separate upstream plugin is installed.

## 6. Source portability and dependency boundaries

Inspect every selected `SKILL.md`, helper, and local reference before packaging. In particular:

- Upstream paths may assume execution from the upstream repository root. Resolve helper paths against installed resources; never assume the target company contains the upstream repository layout.
- Identify cross-skill references. Include required transitive resources deliberately or report the affected feature unsupported. Optional references to other skills must not silently import the full catalog.
- Keep the submodule untouched. Put Inc-specific setup/path handling in an adapter or companion guidance. If a source transformation is unavoidable, document it explicitly and retain both upstream provenance and emitted-file digests.
- Treat host-specific tool names and `allowed-tools` metadata as compatibility inputs, not grants. Skills remain bounded by the host and the user's current assignment.
- Preflight should distinguish at least: not installed, installed/intact, local dependency missing, external access unverified, and optional feature disabled. Do not use one blanket `ready` flag for all routes.
- Check relevant declared credentials by presence only through supported configuration; never dump environment state, copy credentials into Git, or read unrelated secrets.
- Public source access can be used when permitted without a paid provider. Installing a skill does not authorize a new external-service connection or disclosure of private research material.

Keep existing Messenger code, source pin, App binding, and service unchanged. This feature adds research procedures, not another messaging or company-ownership backend.

## 7. Implementation sequence and acceptance

### A. Source pin and selection

Add the submodule, dependency metadata, starter selection, notices, and fictional role example. Verify that gitlink, source manifest, selected licenses, and file inventory agree. Repository validation must reject an inconsistent pin or modified selected upstream payload.

### B. Portable package and project installer

Extend the deterministic package builder and existing CLI workflow. An extracted artifact must plan and materialize the starter set into a temporary project without access to submodules, the Inc source checkout, or an installed upstream plugin.

Test unknown selections, invalid manifests, missing resources, unsafe path traversal/symlinks, existing-name conflicts, unchanged reruns, partial failure/resume, modified installed files, and selected-file digest verification. Preserve duplicate-plugin-discovery checks from the skeleton.

### C. Role authoring and onboarding

Extend generic company/role validation and the first-staff authoring workflow with optional skill-set references. Demonstrate the scientific researcher template and ordinary bootstrap onboarding using the existing host adapter contract. Do not replace persistent project chats with ephemeral subagents.

Test backward compatibility, unknown skill-set references, selected-role propagation, and truthful per-skill capability output. Baseline analytical workflows must remain distinguishable from optional PDF/image/paid-service features.

### D. Evidence and review

Run repository validation, `git diff --check`, targeted behavior/package tests, and CI. Record source, package, dependency, and actual host-discovery evidence separately. A fixture does not prove that a newly created native chat can discover the installed skills.

Provide a small public/synthetic research example for the eventual user-selected live pilot: a bounded literature question, source identifiers, a bibliography, a claim/evidence table, and limitations. No paid-service or confidential-input testing is required for this first change. Clearly list live installation/discovery/API checks that remain unperformed.

Deliver a separate follow-up PR linked to issue #6 and PR #5, with the pinned inputs, implemented commands, tests, known limitations, and unperformed live checks. Do not merge, publish, install into the human's account, or provision real researcher chats as part of this implementation assignment.

## 8. Updates and deferred work

Adopt updates through a dependency PR: inspect the upstream changes, select a new immutable commit, review the four skills and any changed dependencies/licenses, rebuild the file inventory, and run the relevant tests. Do not track a floating branch or run `git submodule update --remote` during ordinary builds.

Retain the prior package/pin for rollback, but never overwrite user-modified installed skills or rewind private runtime state automatically.

Deferred: the entire upstream catalog, a hosted research service, automatic skill selection from unreviewed repositories, researcher permissions enforced by the host, account-wide installations, paid-provider onboarding, additional agent roles, task-marketplace features, and singleton/concurrency orchestration. Preserve the existing [future lifecycle design](PAPRIKA-VIRTUAL-COMPANY.md) and [self-development boundaries](../architecture/SELF-DEVELOPMENT.md).

## Sources

- [Pinned upstream package manifest](https://github.com/K-Dense-AI/scientific-agent-skills/blob/a1043ef544e3a100c28e70a736b6cf32554d0677/plugin.json)
- [Pinned upstream license](https://github.com/K-Dense-AI/scientific-agent-skills/blob/a1043ef544e3a100c28e70a736b6cf32554d0677/LICENSE.md)
- [Paper lookup](https://github.com/K-Dense-AI/scientific-agent-skills/blob/a1043ef544e3a100c28e70a736b6cf32554d0677/skills/paper-lookup/SKILL.md)
- [Literature review](https://github.com/K-Dense-AI/scientific-agent-skills/blob/a1043ef544e3a100c28e70a736b6cf32554d0677/skills/literature-review/SKILL.md)
- [Citation management](https://github.com/K-Dense-AI/scientific-agent-skills/blob/a1043ef544e3a100c28e70a736b6cf32554d0677/skills/citation-management/SKILL.md)
- [Scientific critical thinking](https://github.com/K-Dense-AI/scientific-agent-skills/blob/a1043ef544e3a100c28e70a736b6cf32554d0677/skills/scientific-critical-thinking/SKILL.md)
- [Codex local skill discovery](https://learn.chatgpt.com/docs/build-skills)
- [Existing dependency adoption process](../DEPENDENCIES.md)
