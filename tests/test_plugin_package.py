import sys
import json
from pathlib import Path
import shutil
import subprocess
import tempfile
import unittest
from unittest.mock import patch
import zipfile

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / 'scripts'))
import plugin_package as package


class PluginPackageTests(unittest.TestCase):
    def file_symlink(self, link, target):
        try:
            link.symlink_to(target)
        except OSError as error:
            if isinstance(error, PermissionError) or getattr(error, 'winerror', None) == 1314:
                self.skipTest('Host does not permit file symlinks')
            raise

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

    def test_payload_inventory_order_is_independent_of_native_path_comparison(self):
        source = ROOT / package.PLUGIN
        # Exercise Windows-like Path comparison even on Linux CI. Provenance
        # and ZIP inventories must retain the same case-sensitive POSIX order.
        with patch.object(type(source), '__lt__', lambda left, right: left.as_posix().casefold() < right.as_posix().casefold()):
            names = [entry['path'] for entry in package.payload_files(source)]
        self.assertEqual(names, sorted(names))
        self.assertLess(names.index('README.md'), names.index('assets/paprika-inc-icon.png'))

    def test_discovery_inventory_has_one_inc_identity_and_only_inc_skills(self):
        result = package.verify_package(ROOT / package.PLUGIN)
        self.assertEqual(result['discovery'], {
            'plugin_name': 'paprika-inc', 'display_name': 'Paprika Inc',
            'manifest_paths': ['.codex-plugin/plugin.json', 'plugin.json'],
            'public_skills': ['paprika-inc', 'setup-paprika-inc'], 'live_picker_verified': False,
        })
        self.assertEqual({entry['path'] for entry in result['files']}, package.expected_package_files(ROOT / package.PLUGIN))

    def test_each_skill_uses_its_own_approved_icon(self):
        approved = (ROOT / 'assets/paprika-inc-logo-navy-v1.png').read_bytes()
        for skill in package.PUBLIC_SKILLS:
            with self.subTest(skill=skill):
                root = ROOT / package.PLUGIN / 'skills' / skill
                metadata = (root / 'agents/openai.yaml').read_text()
                for field in ['icon_small', 'icon_large']:
                    self.assertIn(f'  {field}: "./assets/paprika-inc-icon.png"\n', metadata)
                self.assertEqual((root / 'assets/paprika-inc-icon.png').read_bytes(), approved)

    def test_skill_icons_reject_escaping_and_noncanonical_paths(self):
        for skill in package.PUBLIC_SKILLS:
            other = next(name for name in package.PUBLIC_SKILLS if name != skill)
            for field in ['icon_small', 'icon_large']:
                for reference in ['../../assets/paprika-inc-icon.png',
                                  f'../{other}/assets/paprika-inc-icon.png',
                                  '/assets/paprika-inc-icon.png', 'assets/paprika-inc-icon.png',
                                  './assets/../assets/paprika-inc-icon.png',
                                  './assets//paprika-inc-icon.png', './assets\\paprika-inc-icon.png']:
                    with self.subTest(skill=skill, field=field, reference=reference), tempfile.TemporaryDirectory(dir=self.base) as scratch:
                        target = Path(scratch) / 'paprika-inc'
                        shutil.copytree(ROOT / package.PLUGIN, target)
                        path = target / 'skills' / skill / 'agents/openai.yaml'
                        text = path.read_text()
                        path.write_text(text.replace(f'  {field}: "./assets/paprika-inc-icon.png"',
                                                     f'  {field}: {json.dumps(reference)}'))
                        with self.assertRaises(ValueError):
                            package.verify_package(target)

    def test_skill_icon_metadata_cannot_be_missing_duplicated_or_nonstring(self):
        for skill in package.PUBLIC_SKILLS:
            for field in ['icon_small', 'icon_large']:
                for replacement in ['', f'  {field}: null\n', f'  {field}: []\n',
                                    f'  {field}: "./assets/paprika-inc-icon.png"\n' * 2]:
                    with self.subTest(skill=skill, field=field, replacement=replacement), tempfile.TemporaryDirectory(dir=self.base) as scratch:
                        target = Path(scratch) / 'paprika-inc'
                        shutil.copytree(ROOT / package.PLUGIN, target)
                        path = target / 'skills' / skill / 'agents/openai.yaml'
                        path.write_text(path.read_text().replace(f'  {field}: "./assets/paprika-inc-icon.png"\n', replacement))
                        with self.assertRaises(ValueError):
                            package.verify_package(target)

    def test_each_skill_icon_must_be_present_regular_and_approved(self):
        for skill in package.PUBLIC_SKILLS:
            for kind in ['missing', 'symlink', 'tampered']:
                with self.subTest(skill=skill, kind=kind), tempfile.TemporaryDirectory(dir=self.base) as scratch:
                    target = Path(scratch) / 'paprika-inc'
                    shutil.copytree(ROOT / package.PLUGIN, target)
                    path = target / 'skills' / skill / 'assets/paprika-inc-icon.png'
                    if kind == 'tampered':
                        path.write_bytes(path.read_bytes() + b'changed')
                    else:
                        path.unlink()
                        if kind == 'symlink':
                            self.file_symlink(path, target / 'assets/paprika-inc-icon.png')
                    with self.assertRaises(ValueError):
                        package.verify_package(target)

    def test_rehashed_archive_cannot_restore_escaping_skill_icon_paths(self):
        report = package.prepare(ROOT, self.base / 'build')
        with zipfile.ZipFile(report['archive']) as original:
            original_entries = {info.filename: original.read(info) for info in original.infolist()}
        for skill in package.PUBLIC_SKILLS:
            for field in ['icon_small', 'icon_large']:
                with self.subTest(skill=skill, field=field):
                    entries = dict(original_entries)
                    relative = f'skills/{skill}/agents/openai.yaml'
                    key = 'paprika-inc/' + relative
                    entries[key] = entries[key].replace(f'  {field}: "./assets/paprika-inc-icon.png"'.encode(),
                                                        f'  {field}: "../../assets/paprika-inc-icon.png"'.encode())
                    provenance = json.loads(entries['paprika-inc/package-provenance.json'])
                    for entry in provenance['files']:
                        if entry['path'] == relative:
                            entry['sha256'] = package.digest(entries[key])
                    provenance['payload_sha256'] = package.digest(json.dumps(provenance['files'], sort_keys=True, separators=(',', ':')).encode())
                    entries['paprika-inc/package-provenance.json'] = json.dumps(provenance).encode()
                    tampered = self.base / 'escaping-icon.zip'
                    with zipfile.ZipFile(tampered, 'w') as archive:
                        for name, data in entries.items():
                            archive.writestr(name, data)
                    with self.assertRaisesRegex(ValueError, 'Unsafe skill icon reference'):
                        package.verify_archive(tampered)

    def test_extra_messenger_skills_and_nested_plugin_or_marketplace_manifests_fail(self):
        extras = [
            'skills/paprika-messenger/SKILL.md', 'skills/setup-paprika/SKILL.md',
            'runtime/messenger/plugin.json', 'runtime/messenger/.codex-plugin/plugin.json',
            'runtime/messenger/.claude-plugin/plugin.json', '.agents/plugins/marketplace.json',
            '.claude-plugin/marketplace.json', 'vendor/paprika-messenger/plugin-public/plugin.json',
            'skills/paprika-inc/commands/paprika-messenger.md',
        ]
        for relative in extras:
            with self.subTest(relative=relative), tempfile.TemporaryDirectory(dir=self.base) as scratch:
                target = Path(scratch) / 'paprika-inc'
                shutil.copytree(ROOT / package.PLUGIN, target)
                extra = target / relative
                extra.parent.mkdir(parents=True, exist_ok=True)
                extra.write_text('---\nname: paprika-messenger\ndescription: Accidental duplicate.\n---\n'
                                 if extra.name == 'SKILL.md' else '{}')
                with self.assertRaisesRegex(ValueError, 'reviewed build allowlist'):
                    package.verify_package(target)

    def test_manifest_profiles_reject_other_product_registration_and_visibility_flags(self):
        for kind in ['product-label', 'plugin-registration', 'compatibility-registration',
                     'extension-visibility', 'listing-visibility', 'missing-schema']:
            with self.subTest(kind=kind), tempfile.TemporaryDirectory(dir=self.base) as scratch:
                target = Path(scratch) / 'paprika-inc'
                shutil.copytree(ROOT / package.PLUGIN, target)
                portable_path = target / 'plugin.json'
                compatibility_path = target / '.codex-plugin/plugin.json'
                portable = json.loads(portable_path.read_text())
                compatibility = json.loads(compatibility_path.read_text())
                if kind == 'product-label':
                    portable['extensions']['com.openai']['interface']['displayName'] = 'Paprika Messenger'
                    compatibility['interface']['displayName'] = 'Paprika Messenger'
                elif kind == 'plugin-registration':
                    portable['plugins'] = [{'name': 'paprika-messenger-private'}]
                elif kind == 'compatibility-registration':
                    compatibility['plugins'] = [{'name': 'paprika-messenger-private'}]
                elif kind == 'extension-visibility':
                    portable['extensions']['com.openai']['visibility'] = 'hidden'
                elif kind == 'listing-visibility':
                    portable['extensions']['com.openai']['interface']['visibility'] = 'hidden'
                    compatibility['interface']['visibility'] = 'hidden'
                else:
                    del portable['$schema']
                portable_path.write_text(json.dumps(portable))
                compatibility_path.write_text(json.dumps(compatibility))
                with self.assertRaises(ValueError):
                    package.verify_package(target)

    def test_rehashed_archive_cannot_smuggle_a_second_messenger_skill(self):
        report = package.prepare(ROOT, self.base / 'build')
        with zipfile.ZipFile(report['archive']) as original:
            entries = {info.filename: original.read(info) for info in original.infolist()}
        extra = 'skills/paprika-messenger/SKILL.md'
        content = b'---\nname: paprika-messenger\ndescription: Accidental duplicate.\n---\n'
        entries['paprika-inc/' + extra] = content
        provenance = json.loads(entries['paprika-inc/package-provenance.json'])
        provenance['files'].append({'path': extra, 'sha256': package.digest(content)})
        provenance['files'].sort(key=lambda entry: entry['path'])
        provenance['payload_sha256'] = package.digest(json.dumps(provenance['files'], sort_keys=True, separators=(',', ':')).encode())
        if 'discovery' in provenance:
            provenance['discovery']['public_skills'].append('paprika-messenger')
        entries['paprika-inc/package-provenance.json'] = json.dumps(provenance).encode()
        tampered = self.base / 'duplicate-discovery.zip'
        with zipfile.ZipFile(tampered, 'w') as archive:
            for name, data in entries.items():
                archive.writestr(name, data)
        with self.assertRaisesRegex(ValueError, 'reviewed build allowlist'):
            package.verify_archive(tampered)

    def test_inc_and_pinned_messenger_export_distinct_product_and_skill_inventories(self):
        report = package.prepare(ROOT, self.base / 'build')
        extracted = self.base / 'extracted'
        with zipfile.ZipFile(report['archive']) as archive:
            archive.extractall(extracted)
        inc = extracted / 'paprika-inc'
        messenger = ROOT / 'vendor/paprika-messenger/plugins/paprika-messenger-private'
        products, public_skills = {}, {}
        for root in [inc, messenger]:
            portable = json.loads((root / 'plugin.json').read_text())
            compatibility = json.loads((root / '.codex-plugin/plugin.json').read_text())
            self.assertEqual(portable['name'], compatibility['name'])
            self.assertEqual(portable['extensions']['com.openai']['interface']['displayName'], compatibility['interface']['displayName'])
            products[portable['name']] = portable['extensions']['com.openai']['interface']['displayName']
            public_skills[portable['name']] = {
                next(line.removeprefix('name: ') for line in path.read_text().splitlines() if line.startswith('name: '))
                for path in root.glob('skills/*/SKILL.md')
            }
        self.assertEqual(products, {'paprika-inc': 'Paprika Inc', 'paprika-messenger-private': 'Paprika Messenger'})
        self.assertEqual(public_skills['paprika-inc'], {'paprika-inc', 'setup-paprika-inc'})
        self.assertEqual(public_skills['paprika-messenger-private'], {'paprika-messenger', 'setup-paprika'})
        self.assertFalse(public_skills['paprika-inc'] & public_skills['paprika-messenger-private'])
        self.assertFalse(report['discovery']['live_picker_verified'])
        self.assertFalse(report['installed'])
        self.assertFalse(report['deployed'])

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
                    self.file_symlink(target / 'escape.md', ROOT / 'README.md')
                with self.assertRaises(ValueError):
                    package.verify_package(target)

    def test_pinned_source_components_and_license_are_exact(self):
        dep = package.dependency_inputs(ROOT)
        self.assertEqual(dep['commit'], '776efe80eb801ca850b64516c003325833157240')
        self.assertEqual(dep['plugin_version'], '1.6.0')

    def test_private_bound_kit_references_one_existing_app_without_messenger_discovery(self):
        binding = {'schema_version': 1, 'app_id': 'connector_FictionalService', 'service_origin': 'https://service.example.invalid',
                   'service_api_version': '0.9.0', 'service_type': 'dot-chatgpt-codex',
                   'capabilities': ['get_service_config', 'list_boards', 'get_inbox'],
                   'observation': 'caller_supplied_native_metadata_not_verified_by_builder'}
        report = package.prepare(ROOT, self.base / 'bound', service_binding=binding)
        verified = package.verify_archive(Path(report['archive']))
        self.assertTrue(report['references_existing_service_app'])
        self.assertFalse(report['service_authentication_verified_by_builder'])
        self.assertFalse(report['installed']); self.assertFalse(report['deployed'])
        self.assertEqual(verified['discovery']['public_skills'], ['paprika-inc', 'setup-paprika-inc'])
        with zipfile.ZipFile(report['archive']) as archive:
            apps = json.loads(archive.read('paprika-inc/.app.json'))
            self.assertEqual(apps, {'apps': {'paprika-service': {'id': binding['app_id']}}})
            for name in ['plugin.json', '.codex-plugin/plugin.json']:
                manifest = json.loads(archive.read('paprika-inc/' + name))
                self.assertEqual(manifest['name'], 'paprika-inc')
                self.assertEqual(manifest['extensions']['com.openai']['apps'], './.app.json')
            provenance = json.loads(archive.read('paprika-inc/package-provenance.json'))
            self.assertEqual(provenance['existing_service_binding']['service_api_version'], '0.9.0')
            self.assertEqual(provenance['messenger']['service_version'], '0.8.0')
        self.assertFalse((ROOT / package.PLUGIN / '.app.json').exists())

    def test_service_binding_rejects_plugin_ids_credentials_and_unverified_claims(self):
        valid = {'schema_version': 1, 'app_id': 'connector_FictionalService', 'service_origin': 'https://service.example.invalid',
                 'service_api_version': '0.8.1', 'service_type': 'chatgpt-codex',
                 'capabilities': ['get_service_config', 'list_boards', 'get_inbox'],
                 'observation': 'caller_supplied_native_metadata_not_verified_by_builder'}
        for changes in [{'app_id': 'plugins_fictional'}, {'service_origin': 'https://secret@service.example.invalid'},
                        {'capabilities': []}, {'capabilities': [{}]}, {'observation': 'builder_verified_authentication'},
                        {'second_app_id': 'connector_AnotherService'}]:
            with self.subTest(changes=changes), self.assertRaises(ValueError):
                package.validate_service_binding({**valid, **changes})

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
        plugin = extracted / 'paprika-inc'
        approved = (ROOT / 'assets/paprika-inc-logo-navy-v1.png').read_bytes()
        for skill in package.PUBLIC_SKILLS:
            root = plugin / 'skills' / skill
            metadata = (root / 'agents/openai.yaml').read_text()
            for field in ['icon_small', 'icon_large']:
                self.assertIn(f'  {field}: "./assets/paprika-inc-icon.png"\n', metadata)
            self.assertEqual((root / 'assets/paprika-inc-icon.png').read_bytes(), approved)
        helper = plugin / 'skills/paprika-inc/scripts/inc.mjs'
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

    def test_extracted_mvp_authors_generic_files_without_source_or_messenger_installation(self):
        report = package.prepare(ROOT, self.base / 'build')
        extracted, target = self.base / 'standalone-kit', self.base / 'selected-company'
        target.mkdir()
        (target / 'AGENTS.md').write_text('# Existing user directions\n')
        with zipfile.ZipFile(report['archive']) as archive:
            archive.extractall(extracted)
        plugin = extracted / 'paprika-inc'
        helper = plugin / 'skills/paprika-inc/scripts/inc.mjs'
        blueprint = plugin / 'skills/setup-paprika-inc/assets/example-blueprint.json'
        authored = subprocess.run(['node', str(helper), 'author', 'write', '--repo', str(target), '--spec', str(blueprint)], cwd=self.base, capture_output=True, text=True, check=True)
        data = json.loads(authored.stdout)
        self.assertTrue(data['applied'])
        self.assertFalse(data['live_roles_created'])
        self.assertEqual((target / 'AGENTS.md').read_text(), '# Existing user directions\n')
        roles = subprocess.run(['node', str(helper), 'roles', '--repo', str(target)], cwd=self.base, capture_output=True, text=True, check=True)
        self.assertEqual([role['id'] for role in json.loads(roles.stdout)['roles']], ['organizer', 'artisan'])
        self.assertTrue((target / 'company/ownership.json').is_file())
        self.assertFalse((plugin / '.app.json').exists())

    def test_builder_refuses_outputs_that_overlap_source(self):
        for path in [ROOT, ROOT.parent, ROOT / 'plugins/paprika-inc', ROOT / 'tests']:
            with self.subTest(path=path), self.assertRaises(ValueError):
                package.prepare(ROOT, path)


if __name__ == '__main__':
    unittest.main()
