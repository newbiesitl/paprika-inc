# Optional project-local engineering review

Select `skill_sets: ["engineering-core"]` for a role agreed with the human.
It installs one skill, `paprika-code-review`, with shared engineering principles
and selected connected-code review sections. It installs no upstream plugin/hooks.

Use `skills plan --repo <Git-project-root> --roles <role-id>`, then the requested
`skills install`, and `skills status`. Explicit `--skill-set engineering-core`
selects this pack; `--skill-set research-core,engineering-core` selects both.
Omitted sets preserve legacy behavior. Installation refuses unmanaged, modified
or different-version managed directories; it never replaces a user's skill.
See [research-core](research-core.md) for common journal/conflict/recovery behavior.
Existing research files and manifests retain their identity.

Read the installed SKILL.md, INC-PORTABILITY.md and references. Integrity means
files match the reviewed pack. Guidance needs no network or optional tools;
effectiveness and project test/tool availability remain unverified. Project
discovery is shared, not role-restricted.

Immutable commits, file hashes, selected sections, adaptations and exclusions are
recorded. Releases bundle selected resources and notices; users need no submodule.
Installation never fetches remote updates. QA gives independent evidence and
readiness recommendations, not publication approval. Initial onboarding is
read/report only; later actions need the actual assignment and permissions.
