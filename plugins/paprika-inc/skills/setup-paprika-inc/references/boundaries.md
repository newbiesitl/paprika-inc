# Service and lifecycle boundaries

Messenger plugin 1.6.0 / service 0.8.0 is pinned at `776efe80eb801ca850b64516c003325833157240`. This package includes the exact maintained `select-service-type.mjs` component and its MIT license at build time. It preserves an existing `dot-chatgpt-codex` service type without invoking Dot; Inc itself targets local Codex and introduces no Dot workflow. No code imports another installed plugin cache, and read-only Inc commands need no separate Messenger plugin installation.

See [installation coexistence](coexistence.md) for the Inc-only and Messenger-already-installed paths, separate version records, the no-duplicate-product/command requirement, and the pending fresh-chat picker check. Bundled reusable source never registers Messenger's plugin or exports its public skills.

The service adapter must use the owner's existing authenticated private service where compatible. Inc package version, exact bundled Messenger source, Site publication number and running API are distinct. Check ownership/privacy, configuration, authenticated capabilities and existing bindings first. Unavailable metadata remains unverified. Do not provision, redeploy, reconfigure or downgrade an existing service to satisfy a local version check. Preserve App/OAuth identity, database/history, receivers, authoritative delivery state and paused/off preferences. The default local kit needs no service/App for native on-demand bootstrap; [an optional private bound export](mvp-workflow.md#installation-and-existing-service-binding) references the one existing App without creating/authenticating it.

The local adapter accepts only a caller-supplied report:

```json
{"service_version":"0.8.0","service_type":"dot-chatgpt-codex","supported_clients":["codex_local"]}
```

Stable 0.8.x plus reported `codex_local` support yields `reported_compatible`, always with `verification: unverified` and `provisioning_allowed: false`. Older, prerelease, newer-minor or other-client-only reports require capability review; none authorizes an upgrade or a second service. Authentication, observed tool output, saved owner-private service binding and live reads remain distinct host evidence outside this helper. Invalid/extra fields fail explicitly. The report is a planning aid, not a durable private-state contract.

The MVP adds generic authoring and a sequential native-host adapter that independently checks saved-project/thread/cwd metadata and read/report responses, with a small private progress record. Reservations/generations, competing-controller races, stop/transfer and automatic adoption remain future work, not MVP prerequisites. The Messenger binding/export boundary references an existing App; live authentication and messaging/receiver integration remain separately checked. Source publication, installation, deployment, adoption, onboarding and receiving are separate states.

Retain the broader RFC feasibility, singleton/race, shared-state, transfer and self-adoption gates for future hardening. They do not block the expressly scoped user-triggered MVP. Fixture success is not live macOS/Windows certification. Unknown native creation remains unresolved with no blind retry; no automatic takeover is offered. Candidate source cannot approve itself or expand authority. The private MVP record is progress, not an ownership registry or concurrency guarantee.
