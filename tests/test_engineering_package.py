import json
from pathlib import Path
import shutil
import sys
import tempfile
import unittest
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import engineering_pack as engineering
import plugin_package as package
import skill_packs

class EngineeringPackageTests(unittest.TestCase):
    def test_generation_is_deterministic_preserves_notice_and_selected_sections(self):
        files, entry = engineering.compose(ROOT)
        self.assertEqual((files, entry), engineering.compose(ROOT))
        prefix = engineering.PREFIX + engineering.SKILL + '/'
        self.assertEqual(files[prefix + 'LICENSE.upstream.md'], (ROOT / 'vendor/ponytail/LICENSE').read_bytes())
        review = (ROOT / 'vendor/ponytail/skills/ponytail-review/SKILL.md').read_text()
        composed = files[prefix + 'references/connected-review.md'].decode()
        for heading in engineering.SECTIONS:
            self.assertIn(engineering.section(review, heading), composed)
        self.assertNotIn('## 3. Check before you report', composed)
        self.assertNotIn('## 4. Output', composed)
        self.assertEqual(len(files), 7)
        self.assertNotIn('hooks', ''.join(files))
        self.assertEqual(skill_packs.verify(ROOT)['engineering-core'], entry)

    def test_source_drift_requires_review_instead_of_silent_rewrite(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            shutil.copytree(ROOT / 'skill-packs', root / 'skill-packs')
            selection = json.loads((root / 'skill-packs/engineering-core.json').read_text())
            for key, paths in selection['inputs'].items():
                for relative in paths:
                    target = root / engineering.SOURCES[key]['path'] / relative
                    target.parent.mkdir(parents=True, exist_ok=True)
                    shutil.copyfile(ROOT / engineering.SOURCES[key]['path'] / relative, target)
            engineering.compose(root)
            review = root / 'vendor/ponytail/skills/ponytail-review/SKILL.md'
            review.write_text(review.read_text() + '\nUnreviewed change.\n')
            with self.assertRaisesRegex(ValueError, 'source digest changed'):
                engineering.compose(root)
            with self.assertRaisesRegex(ValueError, 'Missing or ambiguous'):
                engineering.section('No selected section here.\n', engineering.SECTIONS[0])

    def test_extracted_artifact_installs_both_without_upstream_layout(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            report = package.prepare(ROOT, root / 'out')
            with zipfile.ZipFile(report['archive']) as archive:
                archive.extractall(root / 'extracted')
            kit = root / 'extracted/paprika-inc'
            project = root / 'project'
            project.mkdir()
            subprocess.run(['git', 'init', '--initial-branch=main'], cwd=project, check=True, capture_output=True)
            helper = kit / 'skills/paprika-inc/scripts/inc.mjs'
            args = ['node', str(helper), 'skills', 'install', '--repo', str(project), '--skill-set', 'research-core,engineering-core']
            result = json.loads(subprocess.check_output(args, cwd=root))
            self.assertEqual(len(result['skills']), 5)
            self.assertTrue(all(item['state'] == 'intact' for item in result['skills']))
            self.assertTrue(json.loads(subprocess.check_output(args, cwd=root))['no_op'])
            self.assertFalse((kit / 'vendor').exists())
            self.assertFalse((project / 'vendor').exists())
            self.assertEqual(package.verify_package(kit, True)['discovery']['public_skills'], ['paprika-inc','setup-paprika-inc'])

    def test_unselected_files_and_tampered_resources_are_rejected(self):
        for case in ['extra', 'changed', 'missing', 'duplicate']:
            with self.subTest(case=case), tempfile.TemporaryDirectory() as scratch:
                root = Path(scratch) / 'kit'
                shutil.copytree(ROOT / package.PLUGIN, root)
                folder = root / engineering.PREFIX
                path = folder / 'paprika-code-review/references/connected-review.md'
                if case == 'extra':
                    (folder / 'paprika-code-review/hooks.json').write_text('{}')
                elif case == 'changed':
                    path.write_text('Unreviewed procedure.')
                elif case == 'missing':
                    path.unlink()
                else:
                    manifest = folder / 'pack.json'
                    data = json.loads(manifest.read_text())
                    data['files'].append(data['files'][0])
                    manifest.write_text(json.dumps(data))
                    catalog_path = root / 'runtime/skill-packs/catalog.json'
                    catalog = json.loads(catalog_path.read_text())
                    catalog['sets']['engineering-core']['manifest_sha256'] = package.digest(manifest.read_bytes())
                    catalog_path.write_text(json.dumps(catalog))
                with self.assertRaises((ValueError, FileNotFoundError)):
                    package.verify_package(root)

if __name__ == '__main__':
    unittest.main()
