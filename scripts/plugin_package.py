"""Prepare/inspect the read-only Inc kit; no installation or service binding."""

import hashlib
import json
import os
from pathlib import Path
import re
import struct
import subprocess
import tempfile
from urllib.parse import unquote, urlsplit
import zipfile

ROOT = Path(__file__).resolve().parents[1]
PLUGIN = Path('plugins/paprika-inc')
DISTRIBUTION = 'local_mvp_skill_kit'
COMPONENTS = {
    'runtime/messenger/select-service-type.mjs':
        'plugins/paprika-messenger-private/skills/setup-paprika/scripts/select-service-type.mjs',
    'licenses/PAPRIKA-MESSENGER-MIT.txt': 'LICENSE',
}
# Reviewed distribution allowlist, deliberately independent of a recursive copy
# of vendor/ or an installed plugin. Expanding it requires package review/tests.
PACKAGE_FILES = frozenset({
    'plugin.json', '.codex-plugin/plugin.json', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md',
    'assets/paprika-inc-icon.png', 'licenses/PAPRIKA-MESSENGER-MIT.txt',
    'runtime/messenger/select-service-type.mjs',
    'runtime/paprika-inc/cli.mjs', 'runtime/paprika-inc/commands.json',
    'runtime/paprika-inc/definition.mjs', 'runtime/paprika-inc/engine.mjs',
    'runtime/paprika-inc/errors.mjs', 'runtime/paprika-inc/messenger-adapter.mjs',
    'runtime/paprika-inc/ownership.mjs', 'runtime/paprika-inc/authoring.mjs',
    'runtime/paprika-inc/checkout.mjs', 'runtime/paprika-inc/bootstrap.mjs', 'runtime/paprika-inc/mvp.mjs',
    'runtime/paprika-inc/skill-catalog.mjs', 'runtime/paprika-inc/skill-packs.mjs',
    'runtime/paprika-inc/message-presentation.mjs', 'runtime/paprika-inc/outbound.mjs',
    'skills/setup-paprika-inc/references/adaptive-delivery.md',
    'skills/paprika-inc/SKILL.md', 'skills/paprika-inc/agents/openai.yaml',
    'skills/paprika-inc/scripts/inc.mjs', 'skills/paprika-inc/references/commands.md',
    'skills/paprika-inc/references/definition-profile.md',
    'skills/setup-paprika-inc/SKILL.md', 'skills/setup-paprika-inc/agents/openai.yaml',
    'skills/setup-paprika-inc/references/boundaries.md',
    'skills/setup-paprika-inc/references/coexistence.md',
    'skills/setup-paprika-inc/references/mvp-workflow.md',
    'skills/setup-paprika-inc/assets/example-blueprint.json',
    'skills/setup-paprika-inc/assets/scientific-blueprint.json',
    'skills/setup-paprika-inc/references/research-core.md',
    'skills/setup-paprika-inc/references/engineering-core.md',
    'skills/setup-paprika-inc/references/native-message-presentation.md',
})
PUBLIC_SKILLS = ('paprika-inc', 'setup-paprika-inc')
MANIFEST_FIELDS = {'name', 'version', 'description', 'author', 'homepage', 'license', 'keywords', 'extensions'}
INTERFACE_FIELDS = {'displayName', 'shortDescription', 'longDescription', 'developerName', 'category',
                    'capabilities', 'websiteURL', 'supportURL', 'defaultPrompt', 'logo', 'composerIcon'}


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def read_json(path):
    return json.loads(path.read_text(encoding='utf-8'))


def profile_fields(value, allowed, location):
    require(isinstance(value, dict), f'{location} must be an object')
    require(set(value) <= allowed, f'Unsupported {location} fields: {sorted(set(value) - allowed)}')


def contained(root, relative):
    require(isinstance(relative, str) and relative and '\\' not in relative,
            'Package references must be relative POSIX paths')
    path = Path(relative)
    require(not path.is_absolute(), 'Absolute package reference')
    target = (root / path).resolve()
    require(target.is_relative_to(root.resolve()) and target.is_file(),
            f'Missing or escaping package reference: {relative}')
    return target


def payload_files(root, provenance_required=False, bound=False):
    result = []
    expected = expected_package_files(root) | ({'package-provenance.json'} if provenance_required else set())
    if bound:
        expected |= {'.app.json'}
    for path in sorted(root.rglob('*')):
        require(not path.is_symlink(), f'Package symlink: {path.name}')
        if not path.is_file():
            continue
        name = path.relative_to(root).as_posix()
        require(not any(part in {'.git', '.paprika', 'node_modules', '__pycache__'} for part in path.relative_to(root).parts),
                f'Private/generated directory in package: {name}')
        require(not path.name.startswith('.env') and path.name not in {'mcp.json', '.mcp.json', 'paprika-connection.json'} and (path.name != '.app.json' or bound),
                f'Only an explicitly prepared private bound kit may contain its one existing App reference: {name}')
        require(path.suffix in {'.json', '.md', '.mjs', '.txt', '.yaml', '.png'} or name == 'LICENSE' or
                name.startswith('runtime/skill-packs/research-core/') and path.suffix in {'.py', '.bib'},
                f'Unexpected package payload: {name}')
        require(name in expected, f'Payload is outside the reviewed build allowlist: {name}')
        result.append({'path': name, 'sha256': digest(path.read_bytes())})
    missing = expected - {entry['path'] for entry in result}
    require(not missing, f'Missing allowlisted package files: {sorted(missing)}')
    return result


def expected_package_files(root):
    prefix = 'runtime/skill-packs/research-core/'
    skills = ['paper-lookup', 'literature-review', 'citation-management', 'scientific-critical-thinking']
    catalog_path = 'runtime/skill-packs/catalog.json'
    catalog = read_json(contained(root, catalog_path))
    manifest_bytes = contained(root, prefix + 'pack.json').read_bytes()
    pack = json.loads(manifest_bytes)
    require(catalog['schema_version'] == 1 and set(catalog['sets']) == {'research-core', 'engineering-core'} and
            catalog['sets']['research-core'] == {'manifest_sha256': digest(manifest_bytes), 'source_commit': 'a1043ef544e3a100c28e70a736b6cf32554d0677', 'package_version': '2.72.0', 'skills': skills}, 'Invalid research catalog/pin')
    require(pack['schema_version'] == 1 and pack['id'] == 'research-core' and pack['skills'] == skills and
            pack['source'] == {'repository': 'https://github.com/K-Dense-AI/scientific-agent-skills.git', 'commit': 'a1043ef544e3a100c28e70a736b6cf32554d0677', 'package_version': '2.72.0'}, 'Invalid research source/selection')
    extra = set()
    for file in pack['files']:
        relative = file['path']
        require(isinstance(relative, str) and re.fullmatch(r'(paper-lookup|literature-review|citation-management|scientific-critical-thinking)/(?:[A-Za-z0-9_-]+/)*[A-Za-z0-9_.-]+\.(md|py|bib)', relative) and '..' not in relative,
                'Unexpected research resource path')
        require(not relative.endswith('/SKILL.md') or relative.count('/') == 1, 'Nested discovery skill in research payload')
        name = prefix + relative
        require(name not in extra and digest(contained(root, name).read_bytes()) == file['sha256'], 'Research resource digest mismatch: ' + relative)
        extra.add(name)
    for skill in skills:
        for name in ['SKILL.md', 'INC-PORTABILITY.md', 'LICENSE.upstream.md']:
            require(prefix + skill + '/' + name in extra, 'Missing research skill, portability guidance or license')
    return PACKAGE_FILES | extra | {catalog_path, prefix + 'pack.json'} | engineering_package_files(root, catalog)


def engineering_package_files(root, catalog):
    prefix = 'runtime/skill-packs/engineering-core/'
    skills = ['paprika-code-review']
    sources = {
        'karpathy_guidelines': {'repository': 'https://github.com/multica-ai/andrej-karpathy-skills.git', 'path': 'vendor/karpathy-guidelines', 'commit': '2c606141936f1eeef17fa3043a72095b4765b9c2'},
        'ponytail': {'repository': 'https://github.com/DietrichGebert/ponytail.git', 'path': 'vendor/ponytail', 'commit': '742e0abae1501e12d1254a81d05f16bba10d08c1'},
    }
    manifest_bytes = contained(root, prefix + 'pack.json').read_bytes()
    pack = json.loads(manifest_bytes)
    require(pack['schema_version'] == 1 and pack['id'] == 'engineering-core' and pack['skills'] == skills and pack['sources'] == sources, 'Invalid engineering source/selection')
    require(catalog['sets']['engineering-core'] == {'manifest_sha256': digest(manifest_bytes), 'source_commits': {key: value['commit'] for key, value in sources.items()}, 'skills': skills}, 'Invalid engineering catalog/pins')
    selected = {'paprika-code-review/' + name for name in ['SKILL.md', 'INC-PORTABILITY.md', 'LICENSE.upstream.md', 'references/engineering-guidance.md', 'references/connected-review.md', 'references/adoption.json']}
    require(len(pack['files']) == len(selected) and {file['path'] for file in pack['files']} == selected, 'Unexpected engineering resource inventory')
    for file in pack['files']:
        require(digest(contained(root, prefix + file['path']).read_bytes()) == file['sha256'], 'Engineering resource digest mismatch: ' + file['path'])
    adoption_bytes = contained(root, prefix + 'paprika-code-review/references/adoption.json').read_bytes()
    adoption = json.loads(adoption_bytes)
    require(digest(adoption_bytes) == pack['selection_sha256'] and adoption['sources'] == sources and adoption['id'] == 'engineering-core' and adoption['skills'] == skills, 'Engineering adoption record mismatch')
    return {prefix + path for path in selected} | {prefix + 'pack.json'}


def verify_package(root, provenance_required=False):
    root = Path(root).resolve()
    require(root.is_dir(), 'Plugin root must be a directory')
    bound = provenance_required and (root / '.app.json').is_file()
    files = payload_files(root, provenance_required, bound)
    manifest = read_json(contained(root, 'plugin.json'))
    profile_fields(manifest, MANIFEST_FIELDS | {'$schema'}, 'portable manifest')
    require(manifest.get('$schema') == 'https://agent-plugins.org/schemas/1.0.0/plugin.schema.json',
            'Portable manifest must declare the Agent Plugins 1.0 schema')
    require(manifest['name'] == 'paprika-inc' and re.fullmatch(r'\d+\.\d+\.\d+', manifest['version']),
            'Invalid Inc package identity/version')
    profile_fields(manifest['extensions'], {'com.openai'}, 'portable extensions')
    extension = manifest['extensions']['com.openai']
    profile_fields(extension, {'interface', 'onboardingSkill'} | ({'apps'} if bound else set()), 'OpenAI extension')
    listing = extension['interface']
    profile_fields(listing, INTERFACE_FIELDS, 'listing interface')
    require(listing.get('displayName') == 'Paprika Inc', 'The product entry must retain the Paprika Inc identity')
    require(listing.get('logo') == './assets/paprika-inc-icon.png' and listing.get('composerIcon') == listing['logo'],
            'The Inc product must use its own navy icon')
    for field, maximum in [('displayName', 30), ('shortDescription', 30), ('longDescription', 4000), ('developerName', 80)]:
        value = listing[field]
        require(isinstance(value, str) and 0 < len(value) <= maximum, f'Invalid listing field: {field}')
    prompts = listing['defaultPrompt']
    prompts = [prompts] if isinstance(prompts, str) else prompts
    require(isinstance(prompts, list) and 1 <= len(prompts) <= 3 and
            all(isinstance(prompt, str) and 0 < len(prompt) <= 128 for prompt in prompts), 'Invalid default prompts')
    require(extension['onboardingSkill'] == './skills/setup-paprika-inc/SKILL.md', 'Incorrect onboarding skill')
    contained(root, extension['onboardingSkill'])
    overlay = read_json(contained(root, '.codex-plugin/plugin.json'))
    profile_fields(overlay, MANIFEST_FIELDS | {'skills', 'interface'}, 'compatibility manifest')
    profile_fields(overlay['extensions'], {'com.openai'}, 'compatibility extensions')
    profile_fields(overlay['extensions']['com.openai'], {'onboardingSkill'} | ({'apps'} if bound else set()), 'compatibility OpenAI extension')
    require(overlay['name'] == manifest['name'] and overlay['version'] == manifest['version'] and
            overlay['interface'] == listing and overlay['skills'] == './skills/' and
            overlay['extensions']['com.openai']['onboardingSkill'] == extension['onboardingSkill'] and
            overlay.get('apps') is None and (bound or overlay['extensions']['com.openai'].get('apps') is None),
            'Compatibility overlay must match portable metadata without a service binding')
    if bound:
        require(extension.get('apps') == './.app.json' and overlay['extensions']['com.openai'].get('apps') == './.app.json', 'Both manifests must reference the same existing App binding')
        apps = read_json(root / '.app.json')
        require(isinstance(apps, dict) and set(apps) == {'apps'} and isinstance(apps['apps'], dict) and set(apps['apps']) == {'paprika-service'}, 'A bound kit references exactly one Paprika Service App, never a Messenger product')
        require(isinstance(apps['apps']['paprika-service'], dict) and set(apps['apps']['paprika-service']) == {'id'} and valid_app_id(apps['apps']['paprika-service']['id']), 'Use the actual existing native App ID')
    icon = contained(root, listing['logo']).read_bytes()
    require(listing['composerIcon'] == listing['logo'], 'Composer icon must match the navy logo')
    require(icon[:8] == b'\x89PNG\r\n\x1a\n' and len(icon) >= 24, 'Icon must be PNG')
    width, height = struct.unpack('>II', icon[16:24])
    require(width == height and 48 <= width <= 4096 and len(icon) <= 5 * 1024 * 1024, 'Invalid icon dimensions/size')
    require(digest(icon) == 'c66ead32fc5d6dcf09207fb5c3f1d23becd9355e8ac8507c6eae4ae168e7d902',
            'The kit must preserve the approved navy icon')
    discovered_skills = tuple(sorted(path.parent.name for path in root.glob('skills/*/SKILL.md')))
    require(discovered_skills == PUBLIC_SKILLS, 'Only Inc-namespaced public skills may be exported')
    for name in discovered_skills:
        skill = contained(root, f'skills/{name}/SKILL.md').read_text()
        require(skill.startswith(f'---\nname: {name}\ndescription: ') and '\n---\n' in skill, 'Invalid skill frontmatter')
        agent = contained(root, f'skills/{name}/agents/openai.yaml').read_text()
        for reference in re.findall(r'icon_(?:small|large): "([^"]+)"', agent):
            contained(root / 'skills' / name, reference) if '..' not in reference else contained(root, f'skills/{name}/{reference}')
    for required in ['README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.md', 'runtime/paprika-inc/commands.json',
                     'runtime/paprika-inc/engine.mjs', 'runtime/paprika-inc/definition.mjs', 'runtime/paprika-inc/cli.mjs',
                     'runtime/paprika-inc/messenger-adapter.mjs', 'skills/paprika-inc/scripts/inc.mjs', *COMPONENTS]:
        contained(root, required)
    for entry in files:
        path = root / entry['path']
        if path.suffix not in {'.md', '.mjs', '.json', '.yaml', '.txt', '.py', '.bib'}:
            continue
        text = path.read_text(encoding='utf-8')
        require('/Users/' not in text and 'C:\\Users\\' not in text and '.codex/plugins/cache/' not in text,
                f'Private or installed-cache path in package: {entry["path"]}')
        if path.suffix == '.md':
            for raw in re.findall(r'\[[^\]\n]*\]\(([^)\n]+)\)', text):
                url = urlsplit(raw.strip('<>'))
                if not url.scheme and not url.netloc and url.path:
                    target = (path.parent / unquote(url.path)).resolve()
                    require(target.is_relative_to(root) and target.is_file(), f'Broken package link in {entry["path"]}: {raw}')
        if path.suffix == '.mjs':
            for module in re.findall(r"(?:from\s+|import\s+)[\"']([^\"']+)[\"']", text):
                if module.startswith('node:'):
                    continue
                require(module.startswith('.'), f'Unbundled external module in {entry["path"]}: {module}')
                target = (path.parent / module).resolve()
                require(target.is_relative_to(root) and target.is_file(), f'Missing module in {entry["path"]}: {module}')
            for reference in re.findall(r"new URL\([\"']([^\"']+)[\"'], import.meta.url\)", text):
                target = (path.parent / reference).resolve()
                require(target.is_relative_to(root) and target.is_file(), f'Missing runtime data in {entry["path"]}: {reference}')
    discovery = {'plugin_name': manifest['name'], 'display_name': listing['displayName'],
                 'manifest_paths': ['.codex-plugin/plugin.json', 'plugin.json'],
                 'public_skills': list(discovered_skills), 'live_picker_verified': False}
    if provenance_required:
        provenance = read_json(contained(root, 'package-provenance.json'))
        inventory = [entry for entry in files if entry['path'] != 'package-provenance.json']
        require(provenance['format'] == 1 and provenance['plugin_name'] == manifest['name'] and
                provenance['plugin_version'] == manifest['version'] and provenance['distribution'] == DISTRIBUTION,
                'Incorrect package provenance')
        require(provenance['files'] == inventory and provenance['payload_sha256'] == digest(json.dumps(inventory, sort_keys=True, separators=(',', ':')).encode()),
                'Package payload/provenance mismatch')
        require(provenance.get('discovery') == discovery, 'Package discovery inventory/provenance mismatch')
        require(provenance.get('skill_packs') == read_json(root / 'runtime/skill-packs/catalog.json')['sets'], 'Skill pack provenance mismatch')
        require(provenance.get('research_core') == read_json(root / 'runtime/skill-packs/catalog.json')['sets']['research-core'], 'Research provenance mismatch')
        require(bool(provenance.get('existing_service_binding')) == bound, 'Service binding/provenance mismatch')
        if bound:
            binding = validate_service_binding(provenance['existing_service_binding'])
            require(binding['app_id'] == apps['apps']['paprika-service']['id'], 'Existing App ID/provenance mismatch')
        require(provenance['messenger']['commit'] == '776efe80eb801ca850b64516c003325833157240' and
                provenance['messenger']['plugin_version'] == '1.6.0' and provenance['messenger']['service_version'] == '0.8.0',
                'Unexpected Messenger provenance')
    return {'name': manifest['name'], 'version': manifest['version'], 'files': files,
            'icon': {'width': width, 'height': height}, 'discovery': discovery}


def dependency_inputs(repository):
    # This also checks every emitted byte against the unchanged pinned submodule.
    import sys
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    from skill_packs import verify as verify_packs
    verify_packs(repository)
    dep = read_json(repository / 'dependencies.json')['paprika_messenger']
    require(dep['path'] == 'vendor/paprika-messenger' and dep['commit'] == '776efe80eb801ca850b64516c003325833157240' and
            dep['plugin_version'] == '1.6.0' and dep['service_version'] == '0.8.0', 'Skeleton baseline differs from adopted dependency metadata')
    vendor = repository / dep['path']
    def git(*args, cwd=repository):
        return subprocess.check_output(['git', *args], cwd=cwd, text=True).strip()
    require(git('ls-files', '--stage', dep['path']).split()[:3] == ['160000', dep['commit'], '0'], 'Messenger gitlink does not match the pin')
    require(git('rev-parse', 'HEAD', cwd=vendor) == dep['commit'], 'Populate the exact pinned Messenger submodule first')
    require(not git('status', '--porcelain', cwd=vendor), 'Messenger source must remain unmodified')
    require(read_json(vendor / 'plugin-public/plugin.json')['version'] == dep['plugin_version'] and
            read_json(vendor / 'package.json')['version'] == dep['service_version'], 'Messenger source/version mismatch')
    for bundled, upstream in COMPONENTS.items():
        require((repository / PLUGIN / bundled).read_bytes() == (vendor / upstream).read_bytes(), f'Copied Messenger component differs: {bundled}')
    require((repository / PLUGIN / 'LICENSE').read_bytes() == (repository / 'LICENSE').read_bytes(), 'Inc license must be preserved')
    require((repository / PLUGIN / 'assets/paprika-inc-icon.png').read_bytes() == (repository / 'assets/paprika-inc-logo-navy-v1.png').read_bytes(), 'Approved icon must be copied exactly')
    return dep


def valid_app_id(value):
    return isinstance(value, str) and re.fullmatch(r'(?:asdk_app_|connector_|templated_apps_)[A-Za-z0-9][A-Za-z0-9_-]*', value)


def validate_service_binding(value):
    profile_fields(value, {'schema_version', 'app_id', 'service_origin', 'service_api_version', 'service_type', 'capabilities', 'observation'}, 'existing service binding')
    require(value.get('schema_version') == 1 and valid_app_id(value.get('app_id')), 'Binding requires the exact host-observed existing App ID, not a plugin ID or invented endpoint')
    origin = urlsplit(value.get('service_origin', ''))
    require(origin.scheme == 'https' and origin.netloc and not origin.username and not origin.password and origin.path in ('', '/') and not origin.query and not origin.fragment, 'Use the actual HTTPS service origin without credentials')
    require(isinstance(value.get('service_api_version'), str) and re.fullmatch(r'\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?', value['service_api_version']), 'Record the running API version separately from Inc and bundled source')
    require(value.get('service_type') in {'chatgpt-codex', 'dot-chatgpt-codex'}, 'Preserve the observed existing service type')
    require(isinstance(value.get('capabilities'), list) and all(isinstance(item, str) for item in value['capabilities']) and {'get_service_config', 'list_boards', 'get_inbox'} <= set(value['capabilities']), 'Existing service capability observations are required; a version alone is insufficient')
    require(value.get('observation') == 'caller_supplied_native_metadata_not_verified_by_builder', 'Builder cannot certify authentication or ownership from caller-supplied metadata')
    return value


def prepare(repository=ROOT, output=None, service_binding=None):
    repository = Path(repository).resolve()
    output = Path(output or repository / 'artifacts/plugin-skeleton').resolve()
    require(not repository.is_relative_to(output), 'Output must not be the repository or one of its parents')
    if output.is_relative_to(repository):
        require(output.relative_to(repository).parts[0] == 'artifacts', 'In-repository output must be under ignored artifacts/')
    dep = dependency_inputs(repository)
    source = repository / PLUGIN
    verified = verify_package(source)
    inventory = verified['files']
    require(all(entry['path'] != 'package-provenance.json' for entry in inventory), 'Generated provenance belongs in the artifact, not source')
    entries = {entry['path']: (source / entry['path']).read_bytes() for entry in inventory}
    binding = validate_service_binding(service_binding) if service_binding is not None else None
    if binding:
        for path in ['plugin.json', '.codex-plugin/plugin.json']:
            metadata = json.loads(entries[path])
            metadata['extensions']['com.openai']['apps'] = './.app.json'
            entries[path] = (json.dumps(metadata, indent=2) + '\n').encode()
        entries['.app.json'] = (json.dumps({'apps': {'paprika-service': {'id': binding['app_id']}}}, indent=2) + '\n').encode()
    inventory = [{'path': path, 'sha256': digest(content)} for path, content in sorted(entries.items())]
    provenance = {'format': 1, 'plugin_name': verified['name'], 'plugin_version': verified['version'], 'distribution': DISTRIBUTION,
                  'messenger': {key: dep[key] for key in ['repository', 'tag', 'commit', 'plugin_version', 'service_version']},
                  'components': COMPONENTS, 'files': inventory, 'discovery': verified['discovery'],
                  'research_core': read_json(source / 'runtime/skill-packs/catalog.json')['sets']['research-core'],
                  'skill_packs': read_json(source / 'runtime/skill-packs/catalog.json')['sets'],
                  'payload_sha256': digest(json.dumps(inventory, sort_keys=True, separators=(',', ':')).encode()), 'existing_service_binding': binding}
    output.mkdir(parents=True, exist_ok=True)
    archive = output / f'{verified["name"]}-{verified["version"]}.zip'
    fd, temporary = tempfile.mkstemp(prefix='.inc-package-', suffix='.zip', dir=output)
    os.close(fd)
    try:
        entries['package-provenance.json'] = (json.dumps(provenance, indent=2, sort_keys=True) + '\n').encode()
        with zipfile.ZipFile(temporary, 'w', compression=zipfile.ZIP_STORED) as package:
            for name, content in sorted(entries.items()):
                info = zipfile.ZipInfo(f'{verified["name"]}/{name}', (1980, 1, 1, 0, 0, 0))
                info.create_system = 3
                info.external_attr = 0o100644 << 16
                package.writestr(info, content)
        verify_archive(Path(temporary))
        os.replace(temporary, archive)
    finally:
        Path(temporary).unlink(missing_ok=True)
    report = {'archive': str(archive), 'version': verified['version'], 'sha256': digest(archive.read_bytes()),
              'file_count': len(entries), 'distribution': DISTRIBUTION, 'discovery': verified['discovery'],
              'references_existing_service_app': bool(binding), 'service_authentication_verified_by_builder': False,
              'installed': False, 'deployed': False}
    return report


def verify_archive(archive):
    with tempfile.TemporaryDirectory(prefix='inc-package-check-') as scratch:
        with zipfile.ZipFile(archive) as package:
            names = package.namelist()
            require(len(names) == len(set(name.casefold() for name in names)), 'Duplicate or case-colliding archive entries')
            require(len(names) <= 1000 and sum(info.file_size for info in package.infolist()) <= 10 * 1024 * 1024, 'Package exceeds inspection budget')
            for info in package.infolist():
                parts = Path(info.filename).parts
                require(parts and parts[0] == 'paprika-inc' and not Path(info.filename).is_absolute() and
                        '..' not in parts and '\\' not in info.filename and not info.is_dir() and
                        info.filename == Path(info.filename).as_posix(), 'Unsafe archive member')
                require((info.external_attr >> 16) & 0o170000 != 0o120000, 'Archive symlink')
                target = Path(scratch) / info.filename
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(package.read(info))
        return verify_package(Path(scratch) / 'paprika-inc', provenance_required=True)
