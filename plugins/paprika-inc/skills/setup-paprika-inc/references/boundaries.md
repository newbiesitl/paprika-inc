# Service and lifecycle boundaries

Messenger plugin 1.6.0 / service 0.8.0 is pinned at `776efe80eb801ca850b64516c003325833157240`. This package includes the exact maintained `select-service-type.mjs` component and its MIT license at build time. It preserves an existing `dot-chatgpt-codex` service type without invoking Dot; Inc itself targets local Codex and introduces no Dot workflow. No code imports another installed plugin cache, and read-only Inc commands need no separate Messenger plugin installation.

The future service adapter must use the owner's existing authenticated private service where compatible. Package version, Site publication number and runtime service version are distinct. Check ownership/privacy, configuration, actual authenticated runtime capabilities and existing bindings first. Unavailable metadata remains unverified. Do not provision, redeploy, reconfigure or downgrade an existing service to satisfy a local version check. Preserve its App/OAuth identity, database, history, receivers, delivery store and paused/off preferences. No service source, hosting config, endpoint, App binding or authentication is declared by this read-only package.

The local adapter accepts only a caller-supplied report:

```json
{"service_version":"0.8.0","service_type":"dot-chatgpt-codex","supported_clients":["codex_local"]}
```

Stable 0.8.x plus reported `codex_local` support yields `reported_compatible`, always with `verification: unverified` and `provisioning_allowed: false`. Older, prerelease, newer-minor or other-client-only reports require capability review; none authorizes an upgrade or a second service. Authentication, observed tool output, saved owner-private service binding and live reads remain distinct host evidence outside this helper. Invalid/extra fields fail explicitly. The report is a planning aid, not a durable private-state contract.

Extension points: the generic engine consumes validated definitions; a future verified host adapter will prove project/thread identity and stop outcomes; a private registry adapter will implement reservations/generations/unknown-outcome reconciliation; the Messenger adapter will acquire authenticated observations and share authoritative delivery state. All must remain within the existing human grant. Source publication, installation, service deployment, runtime adoption, onboarding and receiving are separate states.

Before lifecycle enablement, retain the RFC's host feasibility, singleton race/crash, shared-worktree state, safe transfer, private-state, package coexistence and self-adoption gates. Fixture success is not live macOS/Windows certification. Unknown role creation/stopping retains occupancy; no timer takeover or blind retry. Current version N reviews proposed N+1; candidate source cannot expand its powers or approve itself. This package reads no private registry and changes no company ownership or role bindings.
