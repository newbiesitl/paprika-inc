import importlib.util
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('research_package_test', ROOT / 'scripts/plugin_package.py')
package = importlib.util.module_from_spec(spec)
spec.loader.exec_module(package)


class ResearchPackageTests(unittest.TestCase):
    def test_repository_verifier_rejects_modified_vendor_and_composed_bytes_in_isolated_fixture(self):
        spec = importlib.util.spec_from_file_location('research_pack_isolated_fixture', ROOT / 'scripts/research_pack.py')
        composer = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(composer)
        with tempfile.TemporaryDirectory(prefix='inc-source-pin-fixture-') as scratch:
            root = Path(scratch)
            vendor = root / 'vendor/scientific-agent-skills'
            vendor.mkdir(parents=True)
            original = ROOT / 'vendor/scientific-agent-skills'
            for name in ['plugin.json', 'LICENSE.md']:
                shutil.copyfile(original / name, vendor / name)
            for name in composer.SKILLS:
                shutil.copytree(original / 'skills' / name, vendor / 'skills' / name)
            def git(directory, *args):
                return subprocess.check_output(['git', *args], cwd=directory, text=True, stderr=subprocess.DEVNULL).strip()
            git(root, 'init', '--initial-branch=main')
            git(vendor, 'init', '--initial-branch=main')
            git(vendor, 'config', 'user.name', 'Fictional Fixture')
            git(vendor, 'config', 'user.email', 'fixture@example.invalid')
            git(vendor, 'add', '.')
            git(vendor, '-c', 'commit.gpgsign=false', 'commit', '-m', 'Isolated selected source fixture')
            # The fixture has its own immutable commit. Only this isolated imported
            # verifier receives that pin; production source constants stay fixed.
            composer.PIN = git(vendor, 'rev-parse', 'HEAD')
            deps = json.loads((ROOT / 'dependencies.json').read_text())
            deps['scientific_agent_skills']['commit'] = composer.PIN
            (root / 'dependencies.json').write_text(json.dumps(deps))
            (root / '.gitmodules').write_text('[submodule "vendor/scientific-agent-skills"]\n path = vendor/scientific-agent-skills\n url = https://github.com/K-Dense-AI/scientific-agent-skills.git\n')
            shutil.copytree(ROOT / 'skill-packs', root / 'skill-packs')
            git(root, 'update-index', '--add', '--cacheinfo', '160000,' + composer.PIN + ',vendor/scientific-agent-skills')
            for relative, data in composer.compose(root).items():
                path = root / package.PLUGIN / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
            composer.verify(root)
            path = vendor / 'skills/paper-lookup/SKILL.md'
            original_bytes = path.read_bytes()
            path.write_bytes(original_bytes + b'\nUnreviewed upstream change.\n')
            with self.assertRaisesRegex(ValueError, 'clean reviewed pin'):
                composer.verify(root)
            path.write_bytes(original_bytes)
            emitted = root / package.PLUGIN / 'runtime/skill-packs/research-core/paper-lookup/SKILL.md'
            emitted.write_text('Unreviewed composed change.')
            with self.assertRaisesRegex(ValueError, 'resource/source mismatch'):
                composer.verify(root)

    def test_extracted_artifact_materializes_selected_resources_and_runs_offline_helper_without_upstream_layout(self):
        with tempfile.TemporaryDirectory(prefix='inc-research-artifact-') as scratch:
            root = Path(scratch)
            report = package.prepare(ROOT, root / 'output')
            with zipfile.ZipFile(report['archive']) as archive:
                archive.extractall(root / 'extracted')
            kit = root / 'extracted/paprika-inc'
            project = root / 'fictional-project'
            project.mkdir()
            subprocess.run(['git', 'init', '--initial-branch=main'], cwd=project, capture_output=True, check=True)
            helper = kit / 'skills/paprika-inc/scripts/inc.mjs'
            def command(name):
                return json.loads(subprocess.check_output(['node', str(helper), 'skills', name, '--repo', str(project), '--skill-set', 'research-core'], cwd=root))
            self.assertTrue(all(skill['state'] == 'not_installed' for skill in command('plan')['skills']))
            result = command('install')
            self.assertTrue(all(skill['state'] == 'intact' for skill in result['skills']))
            self.assertFalse(result['source_fallback'])
            self.assertTrue(command('install')['no_op'])
            self.assertFalse((project / 'vendor').exists())
            self.assertFalse((kit / 'vendor').exists())
            pack = json.loads((kit / 'runtime/skill-packs/research-core/pack.json').read_text())
            for file in pack['files']:
                self.assertEqual(package.digest((project / '.agents/skills' / file['path']).read_bytes()), file['sha256'])
            # Exercise a bundled local import and real transformation using synthetic
            # input outside the installed skill directory. No network operation.
            input_file = root / 'synthetic-openalex.json'
            input_file.write_text(json.dumps({'id': 'synthetic:1', 'title': 'Synthetic fixture', 'abstract_inverted_index': {'bounded': [0], 'evidence': [1]}}))
            script = project / '.agents/skills/paper-lookup/scripts/openalex_abstract.py'
            text = subprocess.check_output(['python3', '-B', str(script), str(input_file), '--text-only'], cwd=root, text=True)
            self.assertIn('bounded evidence', text)
            self.assertTrue(all(skill['state'] == 'intact' for skill in command('status')['skills']))

    def test_extra_unselected_or_discovery_resources_are_not_allowlisted(self):
        for relative in ['runtime/skill-packs/research-core/parallel-web/SKILL.md',
                         'runtime/skill-packs/research-core/paper-lookup/plugin.json',
                         'runtime/skill-packs/research-core/paper-lookup/.codex-plugin/plugin.json',
                         'runtime/skill-packs/research-core/paper-lookup/scripts/unreviewed.py']:
            with self.subTest(relative=relative), tempfile.TemporaryDirectory() as scratch:
                target = Path(scratch) / 'kit'
                shutil.copytree(ROOT / package.PLUGIN, target)
                path = target / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_text('{}')
                with self.assertRaisesRegex(ValueError, 'reviewed build allowlist'):
                    package.verify_package(target)

    def test_changed_selected_helper_and_missing_transitive_resource_are_rejected(self):
        for mutation in ['changed', 'missing']:
            with self.subTest(mutation=mutation), tempfile.TemporaryDirectory() as scratch:
                target = Path(scratch) / 'kit'
                shutil.copytree(ROOT / package.PLUGIN, target)
                path = target / 'runtime/skill-packs/research-core/paper-lookup/scripts/_common.py'
                if mutation == 'changed':
                    path.write_text('# Unreviewed change\n')
                else:
                    path.unlink()
                with self.assertRaises(ValueError):
                    package.verify_package(target)

    def test_catalog_cannot_authorize_traversal_or_nested_discovery(self):
        for relative in ['../README.md', '/tmp/escape.md', 'paper-lookup/../escape.md', 'paper-lookup/nested/SKILL.md']:
            with self.subTest(relative=relative), tempfile.TemporaryDirectory() as scratch:
                target = Path(scratch) / 'kit'
                shutil.copytree(ROOT / package.PLUGIN, target)
                path = target / 'runtime/skill-packs/research-core/pack.json'
                pack = json.loads(path.read_text())
                pack['files'][0]['path'] = relative
                path.write_text(json.dumps(pack))
                catalog_path = target / 'runtime/skill-packs/catalog.json'
                catalog = json.loads(catalog_path.read_text())
                catalog['sets']['research-core']['manifest_sha256'] = package.digest(path.read_bytes())
                catalog_path.write_text(json.dumps(catalog))
                with self.assertRaises(ValueError):
                    package.verify_package(target)

    def test_all_four_licenses_and_the_only_documented_source_transform_are_preserved(self):
        kit = ROOT / package.PLUGIN
        pack = json.loads((kit / 'runtime/skill-packs/research-core/pack.json').read_text())
        source = ROOT / 'vendor/scientific-agent-skills'
        for name in pack['skills']:
            root = kit / 'runtime/skill-packs/research-core' / name
            self.assertEqual((root / 'LICENSE.upstream.md').read_bytes(), (source / 'LICENSE.md').read_bytes())
            upstream = (source / 'skills' / name / 'SKILL.md').read_text()
            composed = (root / 'SKILL.md').read_text()
            header, body = upstream.split('\n---\n', 1)
            self.assertTrue(composed.startswith(header + '\n---\n'))
            self.assertTrue(composed.endswith(body))
            self.assertIn('Inc portability', (root / 'INC-PORTABILITY.md').read_text())
        self.assertEqual(len(pack['helper_audit']), 18)


if __name__ == '__main__':
    unittest.main()
