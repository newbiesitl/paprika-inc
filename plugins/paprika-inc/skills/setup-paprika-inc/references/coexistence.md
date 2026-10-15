# Inc and Messenger installation boundaries

Installing Paprika Inc must add only the Inc product identity and its navy icon. Its public skills are `paprika-inc` and `setup-paprika-inc`. It must not install/register another Paprika Messenger plugin, add another Messenger icon/product entry, or export `paprika-messenger` / `setup-paprika` commands. The portable manifest and Codex compatibility manifest describe the same Inc identity; neither is a second product. Actual host discovery remains a live acceptance check.

## Onboarding paths

| Starting point | This read-only slice | Future service-bound onboarding |
| --- | --- | --- |
| Inc only; Messenger product is not installed | Native on-demand authoring/checkout/bootstrap work without installing Messenger or starting a service. | For requested service access, inspect the selected owner-private service/App and prepare the optional private existing-App export described in [the MVP workflow](mvp-workflow.md). Do not provision a service or claim authentication from a report. |
| Messenger already installed | Add Inc's identity and two Inc skills only; preserve existing Messenger commands/icon/configuration. | Reuse the same compatible Paprika Service App/OAuth/database/history and authoritative receiver/delivery state. Never copy stores, install another Messenger package, recreate the App, or add duplicate receivers/routes. Preserve paused/off preferences. |

An unavailable tool, failed authentication, uncertain mapping, or several plausible services is not evidence that a new service is needed. Resolve the exact existing identity and compatibility before any future mutation. A required backend connector may separately appear as **Paprika Service**. Do not invent visibility flags, disable a required connector, or rename it to conceal that entry.

## Three independent version/evidence records

| Record | Current reference | Meaning |
| --- | --- | --- |
| Inc package/release version | `0.2.0` | Local MVP skill kit version; not the service version |
| Bundled Messenger source | Plugin `1.6.0`, source service `0.8.0`, commit `776efe80eb801ca850b64516c003325833157240` | Exact maintained source input; only the allowlisted selection helper and MIT license are included |
| Running service API/capabilities | Unverified in this slice | Must come from authenticated runtime metadata and real capability checks; not inferred from either package version or a Site publication number |

A newer service requires compatibility review rather than downgrade, replacement App or second database. Source inclusion does not start/deploy a service. The optional export references the existing App; live authentication/messaging and full managed lifecycle remain separately verified. Native MVP bootstrap needs no new background receiver. Both products reuse compatible service/authoritative state without competing receiver or retry stores.

## Build boundary and evidence

Preparation uses an exact reviewed file allowlist. No Messenger plugin/marketplace manifests, public Messenger skills, upstream release packages or installed plugin-cache source are exported. The only two product discovery manifests are Inc's root and synchronized compatibility overlay. A private service-bound flavor may additionally contain exactly one `.app.json` for the existing backend App, with matching manifest pointers and provenance; it creates no product/App. Source/version/hash/discovery provenance is retained and Messenger stays unmodified.

The recursive repository checkout is a developer build input, not a plugin marketplace. A future supported local installation must select the prepared Inc kit or its explicit `plugins/paprika-inc` source directory; it must not register the repository root, `vendor/`, or vendored plugin catalogs for discovery.

Artifact tests can inspect inventories, reject contamination and compare names against the pinned Messenger source. They cannot certify ChatGPT's picker or installation behavior.

## Future fresh-chat UI acceptance — pending, not run

Run only under a separately authorized installation/test scope; this source assignment installs nothing. Record exact Inc/Messenger package revisions, host build/client, and running service evidence separately.

1. In an Inc-only environment, install the verified Inc package through the supported host flow. Open a fresh chat. Confirm one **Paprika Inc** product entry with the navy icon and its two Inc skills; confirm that no Messenger product, icon or command was added as an Inc side effect.
2. In an environment with one existing **Paprika Messenger**, add Inc through the supported flow and open a fresh chat with both products enabled. Confirm exactly one **Paprika Messenger** product entry and one **Paprika Inc** product entry. Messenger's commands remain single and unchanged; Inc adds only its two namespaced skills. A separate **Paprika Service** backend App entry is allowed and must not be hidden with unsupported flags.
3. When service-bound integration exists, independently verify the same selected App/OAuth/service/database/history and authoritative delivery/receiver state before/after. Check preserved configuration and paused/off receiving, with no duplicate registrations, routes, notifications or stores.
4. Record actual observed picker/skill inventory and authenticated evidence. Until these checks run, report UI/service coexistence as unverified, regardless of artifact-test results. This is also separate from independent architectural review and lifecycle certification.
