import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import plugin_package as package


class CompanyCatalogPackageTests(unittest.TestCase):
    def test_extracted_catalog_exports_both_baselines_and_preserves_destination(self):
        with tempfile.TemporaryDirectory(prefix='inc-catalog-package-') as temporary:
            root = Path(temporary)
            report = package.prepare(ROOT, root / 'build')
            extracted = root / 'extracted'
            with zipfile.ZipFile(report['archive']) as archive:
                archive.extractall(extracted)
            plugin = extracted / 'paprika-inc'
            package.verify_package(plugin, provenance_required=True)
            helper = plugin / 'skills/paprika-inc/scripts/inc.mjs'

            def invoke(*args, exit_code=0):
                result = subprocess.run(['node', str(helper), *map(str, args)], cwd=root,
                                        capture_output=True, text=True, encoding='utf-8', timeout=30)
                self.assertEqual(result.returncode, exit_code, result.stdout + result.stderr)
                return json.loads(result.stdout)

            listing = invoke('catalog', 'list', '--catalog-kind', 'preset')
            self.assertEqual(len(listing['entries']), 45)
            self.assertEqual(sum(e['tier'] == 'extension' for e in listing['entries']), 43)
            for preset, roles in [('software-studio', 5), ('scientific-research', 4), ('law-firm', 4), ('marketing-agency', 5)]:
                selection = invoke('catalog', 'read', '--catalog-kind', 'preset', '--catalog-id', preset)['default_selection']
                draft = root / (preset + '.json')
                draft.write_text(json.dumps(selection), encoding='utf-8')
                exported = invoke('config', 'export', '--selection', draft)
                self.assertEqual(len(exported['blueprint']['roles']), roles)
                self.assertEqual(exported['selection'], selection)
                files = {f['path']: f['content'] for f in exported['repository_files']}
                self.assertEqual(json.loads(files['company/company.json'])['company_id'], selection['company']['id'])
                self.assertEqual(json.loads(files['company/catalog-selection.json']), selection)
                for role in selection['roles']:
                    self.assertIn('company/roles/' + role['role_id'] + '/agent.md', files)
                self.assertTrue(all(p['state'] == 'bundled' for p in exported['evidence']['package_presence']))
                self.assertEqual(exported['evidence']['native_host_verification'], 'unverified')
                destination = root / preset
                (destination / 'company').mkdir(parents=True)
                preserved = destination / 'company/company.json'
                preserved.write_bytes(b'{"existing":"user-edit"}\n')
                preview = invoke('config', 'preview', '--selection', draft, '--repo', destination, exit_code=2)
                self.assertEqual(preview['authoring']['conflicts'], ['company/company.json'])
                self.assertEqual(preserved.read_bytes(), b'{"existing":"user-edit"}\n')
                self.assertEqual(list((destination / 'company').iterdir()), [preserved])
                selection['catalog']['sha256'] = '0' * 64
                draft.write_text(json.dumps(selection), encoding='utf-8')
                stale = invoke('config', 'export', '--selection', draft, exit_code=2)
                self.assertTrue(any(d['code'] == 'stale_catalog' for d in stale['diagnostics']))
                self.assertNotIn('blueprint', stale)


if __name__ == '__main__':
    unittest.main()
