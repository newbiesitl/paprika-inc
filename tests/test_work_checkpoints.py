"""Check the task-summary exception using real Git discovery, not pattern matching."""

import os
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest

ROOT = Path(__file__).resolve().parents[1]
GIT = shutil.which("git")
FIRST = "docs/work/tasks/EXAMPLE-A/checkpoints"
SECOND = "docs/work/tasks/EXAMPLE-B/checkpoints"
PUBLIC = (
    f"{FIRST}/README.md",
    f"{FIRST}/2026-01-01-001.md",
    f"{SECOND}/2026-01-02-001.md",
)
PRIVATE = (
    f"{FIRST}/weights.safetensors",
    f"{FIRST}/private.json",
    f"{FIRST}/run.log",
    f"{FIRST}/nested/summary.md",
    f"{FIRST}/nested/weights.bin",
    f"{FIRST}/archive.md/private.json",
    f"{FIRST}/archive.md/summary.md",
    f"{FIRST}/archive.md/deeper/summary.md",
    f"{SECOND}/archive.md/summary.md",
    f"{SECOND}/archive.md/weights.bin",
    "checkpoints/private.md",
    "checkpoints/model.bin",
    "training/checkpoints/private.md",
    "docs/unrelated/checkpoints/summary.md",
    "custom/work/tasks/EXAMPLE-A/checkpoints/summary.md",
    ".paprika/checkpoints/private.md",
    ".paprika/receivers/example.json",
    "artifacts/private.md",
)


@unittest.skipUnless(GIT, "Git is required for checkpoint-boundary checks")
class WorkCheckpointIgnoreTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="inc-work-checkpoints-")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.env = {k: v for k, v in os.environ.items() if not k.startswith("GIT_")}
        self.env.update(GIT_CONFIG_NOSYSTEM="1", GIT_CONFIG_GLOBAL=os.devnull)
        self.run_git("init", "--quiet")
        (self.directory / ".gitignore").write_bytes((ROOT / ".gitignore").read_bytes())
        for name in PUBLIC + PRIVATE:
            path = self.directory / name
            path.parent.mkdir(parents=True, exist_ok=True)
            path.write_text("Fictional fixture.\n", encoding="utf-8")

    def run_git(self, *args, check=True):
        return subprocess.run(
            [GIT, *args], cwd=self.directory, env=self.env,
            capture_output=True, text=True, check=check,
        )

    def test_direct_summaries_only_are_discoverable(self):
        actual = set(self.run_git("ls-files", "--others", "--exclude-standard").stdout.splitlines())
        self.assertEqual(actual, {".gitignore", *PUBLIC})

    def test_all_boundaries_with_check_ignore(self):
        for name in PUBLIC + PRIVATE:
            with self.subTest(path=name):
                result = self.run_git("check-ignore", "--quiet", "--", name, check=False)
                self.assertEqual(result.returncode, 1 if name in PUBLIC else 0)

    def test_markdown_directory_regression_is_detected(self):
        # Demonstrate that removing the final child-directory exclusion leaks
        # nested Markdown, so the tests fail for the original class of mistake.
        path = self.directory / ".gitignore"
        path.write_text(
            path.read_text().replace("docs/work/tasks/*/checkpoints/*/\n", ""),
            encoding="utf-8",
        )
        discovered = set(self.run_git("ls-files", "--others", "--exclude-standard").stdout.splitlines())
        self.assertIn(f"{FIRST}/archive.md/summary.md", discovered)
        self.assertNotEqual(discovered, {".gitignore", *PUBLIC})


if __name__ == "__main__":
    unittest.main()
