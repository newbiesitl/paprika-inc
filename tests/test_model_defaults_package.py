import json
from pathlib import Path
import subprocess
import sys
import tempfile
import tomllib
import unittest
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import plugin_package as package


class ModelDefaultsPackageTests(unittest.TestCase):
    def test_extracted_reset_preserves_override_and_exports_parseable_codex_profiles(self):
        with tempfile.TemporaryDirectory(prefix='inc-model-defaults-package-') as temporary:
            root = Path(temporary)
            report = package.prepare(ROOT, root / 'build')
            with zipfile.ZipFile(report['archive']) as archive:
                archive.extractall(root / 'extracted')
            plugin = root / 'extracted/paprika-inc'
            package.verify_package(plugin, provenance_required=True)
            helper = plugin / 'skills/paprika-inc/scripts/inc.mjs'

            def invoke(*args):
                result = subprocess.run(['node', str(helper), *map(str, args)], cwd=root,
                                        capture_output=True, text=True, encoding='utf-8', timeout=30)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                return json.loads(result.stdout)

            company = root / 'fictional-company'; company.mkdir()
            spec = plugin / 'skills/setup-paprika-inc/assets/example-blueprint.json'
            blueprint = json.loads(spec.read_text(encoding='utf-8'))
            invoke('author', 'write', '--repo', company, '--spec', spec)
            profiles = {'schema_version': 1, 'roles': {role['id']: {'model': 'fictional-default', 'thinking': 'high'} for role in blueprint['roles']}}
            (company / 'company/model-preferences.json').write_text(json.dumps(profiles), encoding='utf-8')
            role = blueprint['roles'][0]['id']
            context = root / 'context.json'
            context.write_text(json.dumps({'schema_version': 1, 'company_id': blueprint['company_id'], 'role_id': role,
                                          'current_override': {'model': 'fictional-override', 'reasoning_effort': 'max'},
                                          'models': [{'id': 'fictional-override', 'reasoning_efforts': ['max']}]}), encoding='utf-8')
            reset = invoke('models', 'reset', '--repo', company, '--role-id', role, '--model-context', context)
            self.assertEqual(reset['resolved']['selected_from'], 'explicit_chat_override')
            self.assertEqual(reset['resolved']['model'], 'fictional-override')
            self.assertFalse(reset['applied']); self.assertFalse(reset['native_settings_changed'])
            exported = invoke('models', 'export', '--repo', company, '--role-id', role, '--model-context', context)
            self.assertEqual(tomllib.loads(exported['exports'][0]['codex_toml']), {'model': 'fictional-override', 'model_reasoning_effort': 'max'})
            self.assertEqual(exported['exports'][0]['chatgpt_desired_settings']['model'], 'fictional-override')


if __name__ == '__main__':
    unittest.main()
