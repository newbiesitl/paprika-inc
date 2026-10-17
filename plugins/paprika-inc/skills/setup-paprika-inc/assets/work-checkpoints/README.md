# Work record templates

Use the [shared procedure](../../references/work-checkpoints.md). These are
manual authoring prompts, not an installer or a runtime state schema.

Choose or reuse the company's work root and conventions before creating records.
An existing issue or project item remains the canonical task when the company
already uses one. Copy only records needed for authorized work:

| Template | Destination relative to the selected work root |
| --- | --- |
| [Task](task.md) | `tasks/WORK_ID/task.md` |
| [Findings](findings.md) | `tasks/WORK_ID/findings.md` |
| [Checkpoint](checkpoint.md) | `tasks/WORK_ID/checkpoints/YYYY-MM-DD-NNN.md` |
| [Checkpoint index](checkpoint-index.md) | `tasks/WORK_ID/checkpoints/README.md` |
| [Role page](role.md) | `roles/ROLE_ID.md` |

Replace placeholders, link existing issue/project records by URL and files with
relative links, and verify the links resolve from the destination.
Never overwrite a current task or earlier checkpoint
with a template. A task ID or file does not create an assignment.

Routine progress needs only objective, progress/findings, blockers/decisions and
next action. Add supporting sections that help the role; omit irrelevant ones.
Keep setup facts in the task and link them rather than repeating them in every
update. Update related pointers together. Apply and test the selected company's
privacy rules before adding files to Git.
