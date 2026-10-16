# Maintaining Paprika Inc

[@newbiesitl](https://github.com/newbiesitl) maintains the repository and owns all paths in [CODEOWNERS](../.github/CODEOWNERS). Anyone may contribute through a fork and PR. AI role names are responsibilities, not GitHub permission principals.

## Bootstrap and branch policy

An empty repository needs one initial commit on `main` before branch protection and required checks can be established. The owner-authorized repository bootstrap is that one-time exception; later changes follow PR review.

Mirror Messenger's two independent controls:

| Control | Requirements | Exception |
| --- | --- | --- |
| Classic `main` protection | PR, GitHub Actions `validate`, up-to-date branch, resolved conversations, linear history, no force pushes or deletion | None, including administrators |
| [Owner review ruleset](../.github/rulesets/owner-review.json) | One code-owner approval, stale approvals dismissed | Administrators may bypass only through a PR |

GitHub does not allow PR authors to approve their own PR. The owner may use the PR-only review exception after reviewing the complete diff; CI and history protections still apply. The exception also applies when the owner merges someone else's PR. Use squash merges and delete merged branches. Automatic merging stays disabled.

Versioned JSON documents the settings; editing it does not apply GitHub controls. Verify live settings after setup or changes. Reassess the administrator exception before moving the repo or granting additional admin access.

## Validation and dependency maintenance

The required `validate` job checks portable definitions, documentation references, logo provenance, the exact Messenger gitlink/manifests, inspection/authoring, protected Git checkout, sequential native-host contracts, package completeness and deterministic preparation. These local checks are not a substitute for future live host, service/coexistence, lifecycle, installation and migration evidence. See [the MVP scope and live acceptance](MVP.md) and [the initial skeleton boundary](PLUGIN-SKELETON.md).

GitHub Actions dependencies are pinned to full commit SHAs. Dependabot checks them weekly on Monday at 10:00 Asia/Tokyo, up to three open PRs. Messenger is updated through the manual [adoption process](DEPENDENCIES.md), not a floating branch or automated merge. Enable private vulnerability reporting, dependency alerts, and supported secret scanning/push protection through repository settings.

## Definitions, releases, and recovery

Role definitions and governance use the [self-development protocol](architecture/SELF-DEVELOPMENT.md). Keep the human-granted authority and adopted runtime references outside candidate source. Source review, runtime adoption, plugin publication, installation, and service deployment are separate states.

Before the first Inc release, implement and verify packaging from a clean recursive checkout, owner-neutral contents, complete license notices, source/version provenance, compatibility, and rollback. Preserve published artifacts and tags. Do not label the repository bootstrap as an installable release.

Use [Security](../SECURITY.md) for private reports and [the Code of Conduct](../CODE_OF_CONDUCT.md) for moderation. Keep private operation and recovery evidence out of public Git.
