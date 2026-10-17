# Contributing to Paprika Inc

Bug reports, design feedback, documentation, and focused code changes are welcome. Search existing issues, follow the [Code of Conduct](CODE_OF_CONDUCT.md), and report suspected vulnerabilities [privately](SECURITY.md).

Fork the repository, clone with `--recurse-submodules`, create a branch, and submit a PR targeting `main`. Collaborator access is not required. Explain the concrete problem, resulting behavior, related issue, and validation. Discuss significant lifecycle, permission, storage, packaging, or role-authority changes before implementation.

The implementation owner creates the branch, commits the change, opens the PR,
and reports its URL and exact head to Coordinator. Open a draft when the candidate
is ready for review but independent QA, visual acceptance or another gate remains
pending. A release hold does not defer PR creation. Coordinator routes review and
tracks acceptance; Release Engineer sequences and executes authorized merges and
releases. Neither role is the default substitute for the author's PR submission.
If credentials or host permissions block submission, report that exact blocker
and preserve the commit/patch for an explicitly assigned alternate submitter.
See [the implementation handoff](docs/DEVELOPMENT.md#implementation-to-review-handoff).

## Local validation

Use Git, Python 3.10 or newer, and Node.js 24 or newer:

```sh
git submodule update --init --recursive
python3 scripts/validate-repository.py
node --test tests/*.test.mjs
python3 -m unittest discover -s tests -p 'test_*.py' -v
python3 scripts/validate-plugin.py
python3 scripts/prepare-plugin.py
git diff --check
```

The foundation validator checks contracts, references, artwork and the exact Messenger checkout. Command tests exercise inspection, generic authoring, protected local Git checkout and the sequential native-host contract with fictional fixtures; package tests check standalone authoring, containment, exact dependency copies, optional existing-App export and deterministic archives. These checks do not install a plugin, create real native chats or certify live host/service coexistence. The explicitly scoped local MVP is separate from future singleton/race/transfer/self-adoption hardening. See [the plugin skeleton](docs/PLUGIN-SKELETON.md). Messenger source changes belong upstream and follow its contribution checks.

## Review and adoption

The owner, [@newbiesitl](https://github.com/newbiesitl), maintains all paths through [CODEOWNERS](.github/CODEOWNERS). Changes use PRs and squash merges, passing `validate`, an up-to-date branch, resolved review conversations, and linear history. Force pushes and deletion of `main` are disallowed. The separate review ruleset requires one code-owner approval with a PR-only administrator exception, matching Messenger's policy. See [Maintaining](docs/MAINTAINING.md) for the configuration and bootstrap exception.

Agent review findings are evidence, not a substitute for GitHub review controls or human authority. The current approved company definition governs a proposed change to its successor. Merging definitions and adopting them in live roles are separate operations; follow [self-development](docs/architecture/SELF-DEVELOPMENT.md).

Keep private runtime information out of public issues, commits, screenshots, and logs. Use fictional fixtures. Cite third-party sources and preserve their notices. Contributions are distributed under [MIT](LICENSE). Source changes do not themselves authorize a release, installed plugin update, service deployment, or live role migration.
