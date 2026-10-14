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

Onboarding will reuse a compatible existing private Paprika service and its verified authentication, database, history, and receiving preferences; provision one only when needed. Reconfiguration must preserve service identity and be repeatable without duplicates. The source pin does not pin the running service: inspect compatibility and do not automatically downgrade a newer service.

When both plugins are installed, they must share authoritative delivery records and avoid duplicate receivers, notification routes, registrations, and retry stores. Those behaviors remain implementation acceptance gates. Refer to the [RFC](proposals/PAPRIKA-VIRTUAL-COMPANY.md) and [self-development protocol](architecture/SELF-DEVELOPMENT.md).
