# Paprika Inc portability and scope

This is the reviewed research-core subset, not an installation of the upstream
Scientific Agent Skills plugin. Read the selected SKILL.md and its local
references as procedures bounded by the current human assignment and host policy.
Upstream allowed-tools names are compatibility metadata, not permission grants.

Resolve scripts/, references/ and assets/ against THIS installed skill directory.
Replace repository-root examples such as `python scripts/tool.py` with the
absolute path to this skill's script. Keep the working directory/output paths in
the user-selected research project, not in the managed skill directory. Use
`python3 -B <absolute-skill-directory>/scripts/tool.py ...` to avoid bytecode caches.
Local helper imports resolve beside the script; no upstream checkout or installed
plugin cache is needed.

Only paper-lookup, literature-review, citation-management and
scientific-critical-thinking are included. References to parallel-web,
scientific-schematics, scientific-writing, venue-templates, pubmed-database,
matplotlib/seaborn or peer-review do not install or activate those skills.
Use included paper-lookup and permitted public/publisher sources for retrieval
and metadata enrichment; do not treat an optional paid provider as mandatory.
The explicit `skills/scientific-schematics/...` example is unsupported here.

PDF export, AI figures, Parallel, Google Scholar scraping and restricted full text
are optional capabilities, disabled by default by this integration. Their source
helpers/references are retained for completeness, not permission to execute them.
Missing these features does not block Markdown synthesis or analytical appraisal.
Never run paid-service calls, install account-wide packages, connect accounts,
read unrelated secrets or disclose confidential inputs as an installation/check
side effect. Any later optional use needs its actual dependencies/access and
the applicable human request. Check only named credential presence; never values.

Installation integrity and runtime capability reports are separate. A package,
Python module, executable or environment-variable presence is not authentication,
network success, full-text entitlement or scientific correctness. Onboarding is
read/report only and makes no scholarly API calls. Project-local skills can be
discovered by other chats in this project; role references guide use, not access.

Upstream notices and source text are preserved. SKILL.md has one deterministic
Inc portability prelude after its YAML frontmatter; no other upstream content is
rewritten. LICENSE.upstream.md is the exact root MIT license. pack.json records
original/emitted SHA-256 digests and the immutable source commit.
