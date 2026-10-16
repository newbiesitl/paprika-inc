---
name: paprika-code-review
description: Review an engineering change across callers, data flow, failure paths and tests, with reproducible findings and explicit evidence limits. Use for code or PR review, regression checks and release-readiness assessment in a Paprika project.
license: MIT
---

# Paprika code review

Read [INC-PORTABILITY.md](INC-PORTABILITY.md) and the short
[engineering guidance](references/engineering-guidance.md). Follow the current
human assignment and adopted role contract. This skill supplies a method, not
authority to change files, message agents, publish, install or deploy.

1. Identify the requested artifact, revision and acceptance criteria. State
   material assumptions; proceed with reasonable reversible choices within the
   assignment. Ask only when missing information blocks correctness, changes
   authority or creates a material irreversible risk. Continue independent work.
2. Apply the selected [connected-code procedure](references/connected-review.md)
   to the diff and relevant callers, persistence, UI and tests. Judge load and
   failure behavior against the supported scope. Deferred features are findings
   only when the promised behavior already depends on them.
3. Reproduce each suspected defect or show the concrete reachable input and
   consequence. Check surrounding code before reporting. A documented shortcut
   is still a defect when it violates required behavior. Choose checks that would
   fail for the defect, including failure/retry paths when relevant.
4. Report actionable findings first: severity, file/line or artifact, trigger,
   observed versus expected behavior, evidence and the smallest adequate remedy.
   Avoid style-only findings and speculative redesigns. If no defects are found,
   say what was checked and what remains untested.
5. Separate **passed**, **failed**, **not tested** and **blocked** checks. Name the
   revision/package and environment. Keep source checks, extracted-package tests,
   actual client UI and live service behavior distinct. A valid icon file does
   not prove a picker renders it; a local dependency does not prove authentication.

Give a readiness recommendation with unresolved blockers and evidence limits.
This is not publication approval. Do not certify your own implementation as an
independent review; identify that limitation and use an authorized peer/owner.
Review requests produce findings; implement fixes only within a separate or
already-existing implementation grant.

The [adoption record](references/adoption.json) identifies pinned sources,
selected sections and intentional differences. No upstream persona, hook or
global instruction file is activated.
