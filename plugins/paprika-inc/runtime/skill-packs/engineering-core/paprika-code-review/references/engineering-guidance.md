# Engineering guidance

Use one shared set of principles across engineering and QA. Do not copy these
rules into each role contract or stack the original upstream global skills.

- Turn the requested outcome into observable acceptance criteria. Make important
  assumptions visible and finish authorized work, including verification.
- Prefer an existing project helper, standard library or supported host feature
  before adding a dependency or abstraction. Preserve required validation,
  security, accessibility, recovery and error handling when simplifying.
- Keep changes tied to the request. Fix cleanup caused by the change; report
  unrelated problems without silently expanding the assignment.
- Read affected callers and data flow. Test behavior that can break, with inputs
  and failures that distinguish a correct implementation from a plausible one.
- Judge completion by required behavior and evidence. Smaller diffs, fewer tokens
  and faster work are secondary benefits, never substitutes for correctness.

These are Paprika-authored adaptations of the pinned Karpathy guidelines and
Ponytail core. The adoption record maps their sources, overlap and exclusions.
They add no permissions and do not replace the currently adopted company policy.
