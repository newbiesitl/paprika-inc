"""Validate and compose explicitly selected, immutable version-2 skill packs."""
import hashlib
import json
from pathlib import Path
import re
from urllib.parse import urlsplit

def require(condition, message):
    if not condition:
        raise ValueError(message)

def encoded(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()

def digest(data):
    return hashlib.sha256(data).hexdigest()

def is_link(path):
    return path.is_symlink() or getattr(path, 'is_junction', lambda: False)()

def safe_id(value):
    return isinstance(value, str) and re.fullmatch(r'[a-z][a-z0-9-]{0,63}', value) and not re.match(r'^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)', value, re.I)

def fields(value, keys):
    return isinstance(value, dict) and set(value) == set(keys)

def source_digests(sources):
    require(isinstance(sources, dict) and 1 <= len(sources) <= 32, 'Invalid extension sources')
    result = {}
    for key, source in sorted(sources.items()):
        require(re.fullmatch(r'[a-z][a-z0-9_-]{0,95}', key) and isinstance(source, dict), 'Invalid extension source')
        kind = source.get('kind')
        pin = 'revision' if kind == 'git' else 'sha256'
        require(kind in {'git', 'artifact'} and fields(source, ['kind', 'url', pin]), 'Sources require an immutable Git or artifact identity')
        require(isinstance(source[pin], str) and re.fullmatch(r'[0-9a-f]{40}' if kind == 'git' else r'[0-9a-f]{64}', source[pin]), 'Invalid source pin')
        value = source['url']
        require(isinstance(value, str) and 0 < len(value) <= 2048 and not re.search(r'[\x00-\x20]', value), 'Invalid source URL')
        url = urlsplit(value)
        require(url.scheme == 'https' and url.hostname and not url.username and not url.password and not url.query and not url.fragment, 'Source URL must be public HTTPS without credentials')
        result[key] = digest(json.dumps(source, sort_keys=True, ensure_ascii=False, separators=(',', ':')).encode())
    return result

def resource_path(path, skills):
    if not isinstance(path, str) or len(path) > 240 or not re.search(r'\.(md|json|yaml|txt|py|bib|mjs)$', path):
        return False
    parts = path.split('/')
    return (2 <= len(parts) <= 8 and parts[0] in skills and
            all(re.fullmatch(r'[A-Za-z0-9_-][A-Za-z0-9_.-]*', part) and '..' not in part and not part.endswith('.') and
                not re.match(r'^(con|prn|aux|nul|com[0-9]|lpt[0-9])(?:\.|$)', part, re.I) for part in parts) and
            (parts[-1].lower() != 'skill.md' or len(parts) == 2))

def load(root, entry=None):
    root = Path(root)
    require(root.is_dir() and not is_link(root), 'Invalid extension root')
    path = root / 'pack.json'
    require(path.is_file() and not is_link(path) and path.stat().st_size <= 1024 * 1024, 'Invalid extension manifest file')
    raw = path.read_bytes()
    pack = json.loads(raw)
    require(fields(pack, ['schema_version', 'id', 'skills', 'sources', 'files', 'capabilities']) and pack['schema_version'] == 2 and safe_id(pack['id']), 'Invalid extension manifest')
    skills = pack['skills']
    require(isinstance(skills, list) and 1 <= len(skills) <= 100 and all(safe_id(skill) for skill in skills) and len(set(skills)) == len(skills), 'Invalid extension skills')
    expected_entry = {'manifest_sha256': digest(raw), 'source_digests': source_digests(pack['sources']), 'skills': skills}
    require(entry is None or entry == expected_entry, 'Extension catalog provenance mismatch')
    require(fields(pack['capabilities'], skills), 'Each extension skill requires capabilities')
    for capabilities in pack['capabilities'].values():
        require(isinstance(capabilities, list) and 1 <= len(capabilities) <= 32, 'Invalid extension capabilities')
        seen = set()
        for capability in capabilities:
            require(fields(capability, ['id', 'kind']) and safe_id(capability['id']) and capability['id'] not in seen and capability['kind'] in {'guidance', 'local-tool', 'remote-tool'}, 'Invalid extension capability')
            seen.add(capability['id'])
    require(isinstance(pack['files'], list) and 3 <= len(pack['files']) <= 500, 'Invalid extension inventory')
    expected, folded, path_cases = {}, set(), {}
    for file in pack['files']:
        require(fields(file, ['path', 'sha256']) and resource_path(file['path'], skills) and isinstance(file['sha256'], str) and re.fullmatch(r'[0-9a-f]{64}', file['sha256']), 'Unsafe extension resource')
        require(file['path'].lower() not in folded, 'Duplicate extension resource')
        expected[file['path']] = file['sha256']
        folded.add(file['path'].lower())
        parts = file['path'].split('/')
        for count in range(1, len(parts) + 1):
            prefix = '/'.join(parts[:count])
            require(prefix.lower() not in path_cases or path_cases[prefix.lower()] == prefix, 'Case-colliding extension path')
            path_cases[prefix.lower()] = prefix
    for skill in skills:
        for name in ['SKILL.md', 'INC-PORTABILITY.md', 'LICENSE.upstream.md']:
            require(skill + '/' + name in expected, 'Missing skill, portability guidance or upstream license')
    actual, total = {}, 0
    for path in root.rglob('*'):
        require(not is_link(path), 'Extension symlinks and junctions are not allowed')
        relative = path.relative_to(root).as_posix()
        if path.is_dir():
            require(any(name.startswith(relative + '/') for name in expected), 'Unselected extension directory')
            continue
        require(path.is_file() and (relative == 'pack.json' or relative in expected), 'Unselected extension resource')
        size = path.stat().st_size
        total += size
        require(size <= 1024 * 1024 and total <= 8 * 1024 * 1024, 'Extension exceeds inspection budget')
        actual[relative] = path.read_bytes()
    require(set(actual) == set(expected) | {'pack.json'}, 'Missing extension resource')
    for path, value in expected.items():
        require(digest(actual[path]) == value, 'Extension resource digest mismatch: ' + path)
        if path.endswith('/SKILL.md'):
            text = actual[path].decode('utf-8').replace('\r\n', '\n')
            require(text.startswith('---\nname: ' + path.split('/')[0] + '\ndescription: ') and '\n---\n' in text, 'Extension skill frontmatter must match its selected name')
    return pack, expected_entry, actual

def compose(repository):
    repository = Path(repository)
    selection_path = repository / 'skill-packs/extensions.json'
    require(not is_link(selection_path.parent) and not is_link(selection_path) and selection_path.stat().st_size <= 65536, 'Invalid extension selection')
    selection = json.loads(selection_path.read_bytes())
    require(fields(selection, ['schema_version', 'packs']) and selection['schema_version'] == 1 and isinstance(selection['packs'], list) and len(selection['packs']) <= 98, 'Invalid extension selection')
    files, entries, skills = {}, {}, set()
    for identity in selection['packs']:
        require(safe_id(identity) and identity not in entries and identity not in {'research-core', 'engineering-core'}, 'Invalid or duplicate extension selection')
        folder = repository / 'skill-packs/extensions' / identity
        require(not is_link(folder.parent), 'Extension selection cannot traverse a symlink')
        pack, entry, payload = load(folder)
        require(pack['id'] == identity and not skills.intersection(pack['skills']), 'Extension identity or skill collision')
        skills.update(pack['skills'])
        entries[identity] = entry
        files.update({'runtime/skill-packs/' + identity + '/' + path: data for path, data in payload.items()})
    return files, entries
