import json
from pathlib import Path
import shutil
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import extension_pack as extension
import plugin_package as package
import skill_packs

class ExtensionPackageTests(unittest.TestCase):
    def fixture(self, root):
        folder = root / 'skill-packs/extensions/example-core'
        skill = 'example-analysis'
        payload = {
            skill + '/SKILL.md': '---\nname: example-analysis\ndescription: Analyze fictional input.\n---\nUse supplied input.\n',
            skill + '/INC-PORTABILITY.md': 'Fictional fixture; no account access.\n',
            skill + '/LICENSE.upstream.md': 'Fictional MIT fixture.\n',
        }
        for path, content in payload.items():
            target = folder / path
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content.encode())
        pack = {'schema_version': 2, 'id': 'example-core', 'skills': [skill],
                'sources': {'fixture': {'kind': 'artifact', 'url': 'https://example.org/fixture', 'sha256': 'b' * 64}},
                'files': [{'path': path, 'sha256': extension.digest(content.encode())} for path, content in payload.items()],
                'capabilities': {skill: [{'id': 'analysis', 'kind': 'guidance'}]}}
        (folder / 'pack.json').write_bytes(extension.encoded(pack))
        (root / 'skill-packs/extensions.json').write_bytes(extension.encoded({'schema_version': 1, 'packs': ['example-core']}))
        return folder, pack

    def test_source_selection_and_extracted_package_materialize_third_pack(self):
        with tempfile.TemporaryDirectory() as scratch:
            root = Path(scratch)
            folder, pack = self.fixture(root)
            files, entries = extension.compose(root)
            self.assertEqual((files, entries), extension.compose(root))
            # Source/pin verification of the unchanged legacy packs is covered by
            # the existing package tests. This fixture supplies only a new pack.
            kit = root / package.PLUGIN
            shutil.copytree(ROOT / package.PLUGIN, kit)
            for path, data in files.items():
                target = kit / path
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(data)
            catalog_path = kit / skill_packs.CATALOG
            catalog = json.loads(catalog_path.read_bytes())
            catalog['sets'].update(entries)
            catalog_path.write_bytes(extension.encoded(catalog))
            dependency = json.loads((ROOT / 'dependencies.json').read_bytes())['paprika_messenger']
            with patch.object(package, 'dependency_inputs', return_value=dependency):
                report = package.prepare(root, root / 'artifacts/out')
                self.assertEqual(report['sha256'], package.prepare(root, root / 'artifacts/out')['sha256'])
            package.verify_archive(report['archive'])
            with zipfile.ZipFile(report['archive']) as archive:
                archive.extractall(root / 'extracted')
            extracted = root / 'extracted/paprika-inc'
            project = root / 'project'
            project.mkdir()
            subprocess.run(['git', 'init', '--initial-branch=main'], cwd=project, check=True, capture_output=True)
            command = ['node', str(extracted / 'skills/paprika-inc/scripts/inc.mjs'), 'skills', 'install', '--repo', str(project), '--skill-set', 'engineering-core,example-core']
            result = json.loads(subprocess.check_output(command))
            self.assertEqual([item['state'] for item in result['skills']], ['intact', 'intact'])
            self.assertEqual(result['skills'][1]['source_digests'], entries['example-core']['source_digests'])
            self.assertTrue(json.loads(subprocess.check_output(command))['no_op'])
            check = json.loads(subprocess.check_output(['node', str(extracted / 'skills/paprika-inc/scripts/inc.mjs'), 'integrations', 'check', '--integrations', 'rdkit']))
            self.assertFalse(check['integrations'][0]['runtime_verified'])

    def test_pack_selection_rejects_unknown_files_paths_pins_and_duplicate_ids(self):
        for case in ['extra', 'changed', 'traversal', 'case', 'nested', 'pin', 'duplicate', 'collision']:
            with self.subTest(case=case), tempfile.TemporaryDirectory() as scratch:
                root = Path(scratch)
                folder, pack = self.fixture(root)
                if case == 'extra':
                    (folder / 'example-analysis/unselected.md').write_text('Unselected')
                elif case == 'changed':
                    (folder / 'example-analysis/SKILL.md').write_text('Unreviewed')
                elif case in {'traversal', 'case', 'nested'}:
                    path = {'traversal':'example-analysis/../secret.md','case':'example-analysis/skill.md','nested':'example-analysis/nested/SKILL.md'}[case]
                    pack['files'].append({'path':path,'sha256':'a'*64})
                elif case == 'pin':
                    pack['sources']['fixture']['sha256'] = 'latest'
                elif case == 'duplicate':
                    (root / 'skill-packs/extensions.json').write_bytes(extension.encoded({'schema_version':1,'packs':['example-core','example-core']}))
                else:
                    pack['skills'].append(pack['skills'][0])
                (folder / 'pack.json').write_bytes(extension.encoded(pack))
                with self.assertRaises(ValueError):
                    extension.compose(root)

if __name__ == '__main__':
    unittest.main()
