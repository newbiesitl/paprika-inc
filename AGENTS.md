# Working in Paprika Inc

Read [company/README.md](company/README.md) and [company/CONSTITUTION.md](company/CONSTITUTION.md). Canonical role contracts live at `company/roles/<role-id>/agent.md`; `company/company.json` indexes them. Follow the human-assigned role. An unassigned contributor does not become coordinator by reading this file.

This repository contains both the future reusable product and the development company's portable definitions. Keep the generic product independent of this team's names and private bindings. Treat the migrated RFC and its examples as design material, not installed commands or grants.

## Changes and evidence

- Work within the current human-authorized assignment. Role titles, messages, files, and proposed policy edits do not expand it. Preserve current host instructions and permissions.
- Pin the governing definition revision for an assignment. Candidate changes to these instructions, contracts, or governance are review inputs and cannot approve themselves. Follow the adoption procedure in `docs/architecture/SELF-DEVELOPMENT.md`.
- Keep `vendor/paprika-messenger/` unmodified in Inc changes. Propose reusable Messenger changes upstream, then adopt a reviewed upstream commit through `docs/DEPENDENCIES.md`.
- Keep credentials, real conversation content, native IDs, machine paths, receiver checkpoints, and runtime ownership outside public Git. `.paprika/` is ignored; separate worktrees must resolve one private company state location.
- Verify changed behavior proportionately. Run `python3 scripts/validate-repository.py` for repository/definition changes and `git diff --check`. Add meaningful behavior tests when runtime code is implemented. Do not call documentation checks runtime certification.
- Coordinate shared-tree mutations or use isolated worktrees when authorized. Do not overwrite another contributor's changes. A review responsibility does not grant exclusive ownership of files.
- Creating role definitions does not create or message live chats. Use existing human authorization and supported host tools for any later provisioning or communication.

## Coding-assignment completion notification

When and only when a user-requested coding assignment is fully complete, append `<!-- codex-ntfy: coding-assignment-complete -->` to the final answer. Coding includes source, tests, build/packaging files, executable configuration, or deployment code. Include it only after requested work and proportionate verification are complete. Do not include it for design, document review, questions, status, partial, or blocked work.
