# Paprika Inc — read-only plugin kit

Version 0.1.0. Includes [Paprika Inc](skills/paprika-inc/SKILL.md) and [setup planning](skills/setup-paprika-inc/SKILL.md), a contained Node.js 24+ helper, the navy Paprika icon, and a pinned Messenger planning component. No additional npm dependencies or separate Messenger plugin installation are needed for these commands.

Inc adds only its own product identity and two Inc-namespaced skills. It does not install another Messenger product, icon or command. For Inc-only or Messenger-already-installed onboarding, version distinctions, shared-service preservation and the pending fresh-chat UI acceptance check, see [coexistence](skills/setup-paprika-inc/references/coexistence.md). A required backend App may separately appear as Paprika Service; this kit declares none.

Ask `$paprika-inc help`, “show company status”, “list role definitions”, or `$setup-paprika-inc`. With an explicitly selected local repository, the helper reads its manifest/contracts and prepares a plan. See [command reference](skills/paprika-inc/references/commands.md) and [definition profile](skills/paprika-inc/references/definition-profile.md).

This is an owner-neutral local skill kit, not a service-bound account plugin or a certified company runtime. It has no MCP server, remote endpoint, required App, live role bindings, private registry or always-on process. Hosts without local execution can show the command reference and planning prerequisites but cannot run repository inspection. Saving/installing the kit and binding a private service are separate later decisions, not actions performed by this package.

Setup/init returns a read-only plan with `applied: false`. Lifecycle, enrollment, adoption, verified project membership, authenticated Messenger discovery/binding and receiving are pending. Status reports unknowns without inferring that a company/service does not already exist. See [boundaries](skills/setup-paprika-inc/references/boundaries.md) and [third-party notices](THIRD_PARTY_NOTICES.md).
