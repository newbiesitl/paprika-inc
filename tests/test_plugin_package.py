import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('plugin_package', ROOT / 'scripts/plugin_package.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class PluginPackageTests(unittest.TestCase):
    def setUp(self):
        self.scratch = tempfile.TemporaryDirectory(prefix='inc-package-test-')
        self.addCleanup(self.scratch.cleanup)
        self.base = Path(self.scratch.name)

    def copy_source(self):
        target = self.base / 'paprika-inc'
        shutil.copytree(ROOT / package.PLUGIN, target)
        return target

    def test_source_is_complete_and_metadata_matches(self):
        result = package.verify_package(ROOT / package.PLUGIN)
        self.assertEqual(result['name'], 'paprika-inc')
        self.assertEqual(result['icon'], {'width': 1254, 'height': 1254})
        self.assertTrue(any(file['path'] == 'runtime/messenger/select-service-type.mjs' for file in result['files']))

    def test_missing_assets_modules_and_runtime_data_fail(self):
        for relative in ['assets/paprika-inc-icon.png', 'runtime/paprika-inc/errors.mjs', 'runtime/paprika-inc/commands.json',
                         'skills/paprika-inc/references/commands.md', 'runtime/messenger/select-service-type.mjs']:
            with self.subTest(relative=relative), tempfile.TemporaryDirectory(dir=self.base) as scratch:
                target = Path(scratch) / 'paprika-inc'
                shutil.copytree(ROOT / package.PLUGIN, target)
                (target / relative).unlink()
                with self.assertRaises((ValueError, OSError)):
                    package.verify_package(target)

    def test_overlay_drift_private_binding_and_symlink_fail(self):
        for kind in ['overlay', 'binding', 'symlink']:
            with self.subTest(kind=kind), tempfile.TemporaryDirectory(dir=self.base) as scratch:
                target = Path(scratch) / 'paprika-inc'
                shutil.copytree(ROOT / package.PLUGIN, target)
                if kind == 'overlay':
                    path = target / '.codex-plugin/plugin.json'
                    data = json.loads(path.read_text())
                    data['version'] = '99.0.0'
                    path.write_text(json.dumps(data))
                elif kind == 'binding':
                    (target / '.app.json').write_text('{}')
                else:
                    (target / 'escape.md').symlink_to(ROOT / 'README.md')
                with self.assertRaises(ValueError):
                    package.verify_package(target)

    def test_pinned_source_components_and_license_are_exact(self):
        dep = package.dependency_inputs(ROOT)
        self.assertEqual(dep['commit'], '776efe80eb801ca850b64516c003325833157240')
        self.assertEqual(dep['plugin_version'], '1.6.0')

    def test_build_is_byte_deterministic_and_extracted_helper_works_without_source(self):
        first = package.prepare(ROOT, self.base / 'one')
        second = package.prepare(ROOT, self.base / 'two')
        self.assertEqual(first['sha256'], second['sha256'])
        self.assertEqual(Path(first['archive']).read_bytes(), Path(second['archive']).read_bytes())
        verified = package.verify_archive(Path(first['archive']))
        self.assertEqual(len(verified['files']), first['file_count'])
        extracted = self.base / 'extracted'
        with zipfile.ZipFile(first['archive']) as archive:
            archive.extractall(extracted)
            self.assertTrue(all(info.date_time == (1980, 1, 1, 0, 0, 0) for info in archive.infolist()))
            self.assertTrue(all(name.startswith('paprika-inc/') for name in archive.namelist()))
        helper = extracted / 'paprika-inc/skills/paprika-inc/scripts/inc.mjs'
        result = subprocess.run(['node', str(helper), 'help'], cwd=self.base, capture_output=True, text=True, check=True)
        self.assertEqual(json.loads(result.stdout)['command'], 'help')
        result = subprocess.run(['node', str(helper), 'validate', '--repo', str(ROOT)], cwd=self.base, capture_output=True, text=True, check=True)
        self.assertTrue(json.loads(result.stdout)['definition_valid'])
        self.assertFalse(first['installed'])
        self.assertFalse(first['deployed'])

    def test_payload_tampering_and_unsafe_archives_fail(self):
        report = package.prepare(ROOT, self.base / 'build')
        tampered = self.base / 'tampered.zip'
        with zipfile.ZipFile(report['archive']) as original, zipfile.ZipFile(tampered, 'w') as changed:
            for info in original.infolist():
                content = original.read(info)
                if info.filename.endswith('/runtime/paprika-inc/commands.json'):
                    content += b'\n'
                changed.writestr(info, content)
        with self.assertRaisesRegex(ValueError, 'provenance mismatch'):
            package.verify_archive(tampered)
        for name in ['../escape', 'paprika-inc/../../escape', 'other/plugin.json', '/paprika-inc/plugin.json', 'paprika-inc/./plugin.json']:
            with self.subTest(name=name):
                unsafe = self.base / 'unsafe.zip'
                with zipfile.ZipFile(unsafe, 'w') as archive:
                    archive.writestr(name, '{}')
                with self.assertRaises(ValueError):
                    package.verify_archive(unsafe)

    def test_builder_refuses_outputs_that_overlap_source(self):
        for path in [ROOT, ROOT.parent, ROOT / 'plugins/paprika-inc', ROOT / 'tests']:
            with self.subTest(path=path), self.assertRaises(ValueError):
                package.prepare(ROOT, path)


if __name__ == '__main__':
    unittest.main()
