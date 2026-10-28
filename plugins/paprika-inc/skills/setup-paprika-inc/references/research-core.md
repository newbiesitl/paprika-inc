# Optional project-local research workflows

Inc 0.3.0 carries an internal, reviewed four-skill subset of Scientific Agent
Skills 2.72.0 at commit `a1043ef544e3a100c28e70a736b6cf32554d0677`:
paper-lookup, literature-review, citation-management and scientific-critical-thinking.
Installing Inc does not activate this collection or install the upstream plugin.
Only the three Inc skills are public plugin entry points. Project-local selected
skills may become visible to other chats in that project after host discovery.
Role selection guides use; it is not an access control.

Use the [fictional scientific blueprint](../assets/scientific-blueprint.json)
when discussing purpose, ownership, deliverables, reviewer and limits. Its lone
role uses human review; selecting a peer reviewer later does not create a chat.
The manifest alone stores `skill_sets: ["research-core"]`. Omitted/empty skill_sets
preserve legacy behavior. Unknown IDs, duplicate IDs and nonarrays are rejected.
Contracts reference the manifest and the canonical ownership map rather than
copying skill bodies. Do not alter the development company's live roster.

During researcher role discussion and initialization, follow the
[researcher model recommendation](role-recommendations.md#researcher-model-recommendation):
recommend `gpt-6-astra` / `xhigh` (extra-high effort) where the native host supports
it, while preserving the selected owner's explicit choice. Before an authorized
native action, validate the exact selected pair and supply model/thinking through
supported host parameters; the MVP helper does not automatically consume model
profiles. Preserve requested and host-confirmed applied settings separately.
A changed preference alone neither reconfigures nor recreates an existing chat.

After the agreed company files are written, committed and published, use the
existing checkout workflow. Before native read/report onboarding, explicitly
request installation into that selected Git project:

```sh
node <helper> skills plan --repo <selected-project-root>
node <helper> skills install --repo <selected-project-root>
node <helper> skills status --repo <selected-project-root>
```

By default the manifest selects the union of the roster's skill_sets; `--roles
<declared-role-ids>` narrows it. An explicit `--skill-set research-core` selects
that bundled set even before company authoring. No arbitrary URL, directory,
unknown selection, account-wide destination or full catalog is accepted.
The plan/status commands create no installation directories or journal.

Files go only to `.agents/skills/<skill-name>/` in the selected Git root.
Each includes SKILL.md, its original helpers/references/assets, an exact upstream
MIT license and INC-PORTABILITY.md. The package needs no submodules, source tree
or installed upstream cache at runtime. Source and emitted digests plus the
documented frontmatter-adjacent portability prelude are in the internal pack.json.
Upstream files in the submodule remain unchanged.

Existing unmanaged names conflict even if byte-identical. Modified, missing or
extra managed files conflict instead of being replaced. Symlinks and nonregular
targets are refused. Unchanged managed reruns do nothing. An interrupted install
preserves earlier skills and pending intent; rerun after inspecting status to
resume remaining work. Pending intent plus exact complete bytes can recover a
success; unrelated existing files cannot be adopted. Resolve user modifications
manually before retrying; there is no force/update/delete command. Temporary
staging is cleaned on ordinary failures. An abrupt process kill can leave a
private skill-install.lock or hidden .inc-* staging directory: inspect the
journal and remove only confirmed abandoned artifacts before explicit resume.
Never use a timer to steal an installation lock.

Private progress lives in `paprika-inc/skill-packs.json` under Git's common
directory, keyed per physical project destination. Worktrees share that physical
store and cooperating installs serialize through a private lock. This is not a
company lifecycle registry; external concurrent file mutations require manual
reconciliation. Public Git must not contain runtime journals or credentials.
Project skills are portable source files: decide deliberately whether to commit
them in that company's repository. Inc does not edit its ignore policy.

Every skill has an installation state and separate capability states:

| Skill | Baseline | Local dependencies / external limitations |
| --- | --- | --- |
| paper-lookup | Guidance and public-source procedures | Local parsers need Python 3.11+; curl route needs curl; network/access unverified |
| literature-review | Markdown synthesis and screening guidance | Record helper needs Python 3.10+; DOI checking also needs requests and permitted network access |
| citation-management | Bibliography guidance | Local formatting needs Python 3.9+; metadata/validation helpers also need requests and network access |
| scientific-critical-thinking | Analytical appraisal guidance | No network/package dependency for core appraisal; unselected diagram skill unsupported |

Checks observe Python version and requests/scholarly module presence, executable
presence and only named credential booleans. They do not make service calls,
authenticate, install packages, read credential files or print secret values.
Presence never proves successful execution or entitlement. PDF export
(pandoc/xelatex), AI figures (OpenRouter), Parallel, Scholar scraping and restricted
full text stay optional and disabled by this integration. Missing these does not
block basic Markdown work or appraisal. Retained optional helpers are not
permission to invoke them; later use needs the applicable human request and
actual access. No blanket research-ready flag is emitted.

Resolve scripts against the installed skill directory and keep output/CWD in the
research project. Use `python3 -B <absolute-installed-script> ...`. Do not execute
root-relative examples literally or assume other upstream skills are installed.
The companion guidance identifies unsupported cross-skill routes and included
public-source alternatives. Upstream tool names are compatibility metadata, not
new grants.

Ordinary bootstrap keeps its exact native project/host/cwd and completed-receipt
checks. For selected roles, it also supplies skill sets, installed SKILL.md and
companion paths, per-skill limitations and a report digest. The receipt must name
the paths actually read and the reviewed digest. Missing installation is reported
explicitly; read/report onboarding is distinct from research execution readiness.
Changing installed files while onboarding invalidates that report; reconcile and
obtain a scoped updated report instead of blindly resending an uncertain write.
No API call or skill installation happens as an onboarding side effect.

Native project skill discovery, picker refresh, fresh persistent-chat behavior,
real scholarly API authentication and optional integrations require separate
user-selected live checks. Local fixtures and ZIP extraction do not prove them.
