# Messenger dependency adoption

Paprika Inc uses `vendor/paprika-messenger` as a Git submodule. The parent Git tree's gitlink is the authoritative source pin; [dependencies.json](../dependencies.json) records the intended plugin/service versions and upstream release provenance for validation.

The initial pin is **Messenger 1.6.0 / service 0.8.0**, tag `v1.6.0`, commit `776efe80eb801ca850b64516c003325833157240`. Its [stable release](https://github.com/newbiesitl/paprika-messenger/releases/tag/v1.6.0) was published on 2026-10-14. Both source manifests match. The release archives record their separate build-source commit `c91f966c146e94875b7ad5780a9c9de0231ae938`; the Inc gitlink uses the tagged release commit, which includes the release artifacts. Do not substitute a release candidate or current `main` for the declared version.

## Developer checkout

```sh
git submodule sync --recursive
git submodule update --init --recursive
```

Normal builds use the committed gitlink. Never run `git submodule update --remote` as part of a build. Keep the submodule clean. Reusable Messenger fixes go upstream and come back through an adoption PR, rather than local divergent edits.

## Release-note-driven updates

1. Review the upstream release notes, migration/compatibility guidance, known limitations, and exact source/version reference. Record why Inc needs the update and any deferred changes.
2. Open a dependency-adoption work item and branch. Fetch the chosen upstream tag/commit, inspect its manifests, and check out that exact commit in the submodule.
3. Update the gitlink and `dependencies.json` together. Never move the upstream tag or modify historical release artifacts to make a check pass.
4. Run repository checks and the relevant Inc integration, packaging, onboarding, coexistence, and state-migration tests as those features exist. Distinguish source validation from actual service/client evidence.
5. Review and merge the adoption PR. Publish a new Inc release only under the release decision; maintain the prior compatible Inc release and dependency pin for rollback.

No recurring Messenger monitor or automatic submodule update is enabled by this setup. Actions dependency maintenance is separate from Messenger adoption.

## Packaging and service boundary

The read-only Inc kit includes the exact pinned Messenger `select-service-type.mjs` component and MIT license. Preparation verifies the copied bytes against the clean gitlink checkout and records dependency provenance in the archive. Users of the prepared read-only kit do not resolve submodules or need a separate installed Messenger plugin. See [the skeleton package](PLUGIN-SKELETON.md). Full messaging/service source is not declared by this slice; add required components as those capabilities are implemented.

An explicit reviewed file allowlist bounds the Inc artifact. It excludes Messenger plugin/marketplace manifests, its public skills and release packages. Inc's root/compatibility metadata share one identity and its three Inc-namespaced public skills; installing alongside Messenger must not add a second Messenger product, icon or command. Future integration reuses the same compatible Paprika Service App/OAuth identity and authoritative state. See [onboarding/coexistence and pending UI acceptance](../plugins/paprika-inc/skills/setup-paprika-inc/references/coexistence.md). Artifact checks are not proof of live picker behavior.

Onboarding will reuse a compatible existing private Paprika service and its verified authentication, database, history, and receiving preferences; provision one only when needed. Reconfiguration must preserve service identity and be repeatable without duplicates. The source pin does not pin the running service: inspect compatibility and do not automatically downgrade a newer service.

When both plugins are installed, they must share authoritative delivery records and avoid duplicate receivers, notification routes, registrations, and retry stores. Those behaviors remain implementation acceptance gates. Refer to the [RFC](proposals/PAPRIKA-VIRTUAL-COMPANY.md) and [self-development protocol](architecture/SELF-DEVELOPMENT.md).

## Local MVP service binding

The 0.2.0 [local MVP](MVP.md) retains the same exact Messenger pin and internal component/license. Its default native on-demand bootstrap does not install Messenger or start a service. An optional private package export adds only one actual existing Paprika Service App reference, with matching Inc manifest pointers and caller-observed API/capability provenance; it cannot authenticate that report or create/deploy an App. Reuse the same App/OAuth/configuration/history and authoritative delivery state; preserve paused/off controls and never auto-downgrade a newer API. Inc release, bundled source and running API versions are distinct. See [binding and installation](../plugins/paprika-inc/skills/setup-paprika-inc/references/mvp-workflow.md#installation-and-existing-service-binding).

## Scientific Agent Skills selection

The optional research-core dependency is
[K-Dense-AI/scientific-agent-skills](https://github.com/K-Dense-AI/scientific-agent-skills)
at immutable commit `a1043ef544e3a100c28e70a736b6cf32554d0677`, manifest version
2.72.0. No corresponding release tag is assumed. The unchanged submodule is
`vendor/scientific-agent-skills/`; [the selection](../skill-packs/research-core.json)
contains exactly paper-lookup, literature-review, citation-management and
scientific-critical-thinking. The upstream plugin/full catalog is not installed.

The deterministic composer in `scripts/research_pack.py` reads every selected
file, parses every Python helper for an import audit and retains local resources,
actual per-skill license declarations and the exact root MIT notice. It copies
resources internally into Inc, adds INC-PORTABILITY.md, and inserts one documented
portability prelude after each original SKILL.md frontmatter. No other source
bytes are rewritten. pack.json records source/emitted digests, transformations,
helper imports, disabled cross-skill routes and the source revision. Packaging
compares every emitted byte with the pinned source and rejects extra resources.
Imported SKILL.md/helpers/references/assets retain upstream trailing whitespace
and blank EOF lines via narrowly scoped .gitattributes whitespace attributes.
The source/emitted digest comparison remains strict. Inc code, manifests and
companion guidance retain ordinary whitespace checks.

Update through a scoped dependency PR: review upstream changes, licenses, helpers,
cross-skill references, dependencies and network/privacy assumptions; choose an
immutable commit; update metadata/selection/composer/catalog intentionally; run
all relevant checks. Never float the pin or run update --remote during builds.
Retain old artifacts for rollback. Project installation refuses unmanaged or
modified files and has no automatic force-update/rollback operation.

## Curated engineering sources

Karpathy-inspired guidelines and Ponytail are separate pinned submodules. Their reviewed commits and selection are in dependencies.json and skill-packs/engineering-core.json. Run python3 scripts/skill_packs.py to verify all bundled sets. Reuse selected procedures and adapt ideas through [the adoption process](architecture/EXTERNAL-SKILL-ADOPTION.md); never activate upstream plugins, hooks or global guidance implicitly.
