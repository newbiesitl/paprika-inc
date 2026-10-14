# Contributing to Paprika Inc

Bug reports, design feedback, documentation, and focused code changes are welcome. Search existing issues, follow the [Code of Conduct](CODE_OF_CONDUCT.md), and report suspected vulnerabilities [privately](SECURITY.md).

Fork the repository, clone with `--recurse-submodules`, create a branch, and submit a PR targeting `main`. Collaborator access is not required. Explain the concrete problem, resulting behavior, related issue, and validation. Discuss significant lifecycle, permission, storage, packaging, or role-authority changes before implementation.

## Local validation

Use Git and Python 3.10 or newer:

```sh
git submodule update --init --recursive
python3 scripts/validate-repository.py
git diff --check
```

The validator checks the repository contracts, references, asset provenance, and exact Messenger checkout. It does not run a company, prove native host capabilities, or certify the proposed lifecycle. Runtime changes must add relevant behavior tests and update the workflow as the product develops. Messenger source changes belong upstream and follow its contribution checks.

## Review and adoption

The owner, [@newbiesitl](https://github.com/newbiesitl), maintains all paths through [CODEOWNERS](.github/CODEOWNERS). Changes use PRs and squash merges, passing `validate`, an up-to-date branch, resolved review conversations, and linear history. Force pushes and deletion of `main` are disallowed. The separate review ruleset requires one code-owner approval with a PR-only administrator exception, matching Messenger's policy. See [Maintaining](docs/MAINTAINING.md) for the configuration and bootstrap exception.

Agent review findings are evidence, not a substitute for GitHub review controls or human authority. The current approved company definition governs a proposed change to its successor. Merging definitions and adopting them in live roles are separate operations; follow [self-development](docs/architecture/SELF-DEVELOPMENT.md).

Keep private runtime information out of public issues, commits, screenshots, and logs. Use fictional fixtures. Cite third-party sources and preserve their notices. Contributions are distributed under [MIT](LICENSE). Source changes do not themselves authorize a release, installed plugin update, service deployment, or live role migration.
