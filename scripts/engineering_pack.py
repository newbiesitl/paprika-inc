"""Compose a small, reviewed engineering pack; never execute upstream code."""
import hashlib
import json
from pathlib import Path
import subprocess

SOURCES = {
    'karpathy_guidelines': {'repository': 'https://github.com/multica-ai/andrej-karpathy-skills.git',
        'path': 'vendor/karpathy-guidelines', 'commit': '2c606141936f1eeef17fa3043a72095b4765b9c2'},
    'ponytail': {'repository': 'https://github.com/DietrichGebert/ponytail.git',
        'path': 'vendor/ponytail', 'commit': '742e0abae1501e12d1254a81d05f16bba10d08c1'},
}
SKILL = 'paprika-code-review'
PREFIX = 'runtime/skill-packs/engineering-core/'
LOCAL_FILES = ('SKILL.md', 'INC-PORTABILITY.md', 'references/engineering-guidance.md')
REVIEW_PATH = 'skills/ponytail-review/SKILL.md'
SECTIONS = ['## 1. Understand first', '## 2. Look for']

def require(condition, message):
    if not condition:
        raise ValueError(message)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encoded(value):
    return (json.dumps(value, indent=2, sort_keys=True) + '\n').encode()

def source_bytes(root, relative):
    path = root
    for part in Path(relative).parts:
        require(part not in {'.', '..'} and not Path(relative).is_absolute(), 'Unsafe engineering source path')
        path /= part
        require(not path.is_symlink(), 'Engineering source cannot be a symlink')
    require(path.is_file(), 'Missing engineering source: ' + relative)
    return path.read_bytes()

def section(text, heading):
    # Keep the complete selected section byte-for-byte, stopping at the next H2.
    marker = heading + '\n'
    require(text.count('\n' + marker) == 1, 'Missing or ambiguous selected engineering section: ' + heading)
    start = text.index('\n' + marker) + 1
    end = text.find('\n## ', start + len(marker))
    return text[start:] if end < 0 else text[start:end + 1]

def verify_source(repository):
    repository = Path(repository)
    deps = json.loads((repository / 'dependencies.json').read_text())
    def git(*args, cwd=repository):
        return subprocess.check_output(['git', *args], cwd=cwd, text=True).strip()
    for key, expected in SOURCES.items():
        dep = deps[key]
        require(dep == {**expected, 'selection': 'skill-packs/engineering-core.json'}, 'Engineering dependency differs from reviewed pin')
        require(git('ls-files', '--stage', dep['path']).split()[:3] == ['160000', dep['commit'], '0'], 'Stage the exact engineering gitlink')
        require(git('config', '--file', '.gitmodules', '--get', 'submodule.' + dep['path'] + '.url') == dep['repository'], 'Engineering submodule URL mismatch')
        require(git('rev-parse', 'HEAD', cwd=repository / dep['path']) == dep['commit'] and not git('status', '--porcelain', cwd=repository / dep['path']), 'Engineering submodule must remain at its clean reviewed pin')

def compose(repository):
    repository = Path(repository)
    selection_bytes = (repository / 'skill-packs/engineering-core.json').read_bytes()
    selection = json.loads(selection_bytes)
    require(selection['schema_version'] == 1 and selection['id'] == 'engineering-core' and selection['skills'] == [SKILL], 'Invalid engineering selection')
    require(selection['sources'] == SOURCES, 'Engineering adoption source mismatch')
    expected_inputs = {
        'karpathy_guidelines': ['skills/karpathy-guidelines/SKILL.md'],
        'ponytail': ['LICENSE', 'skills/ponytail/SKILL.md', REVIEW_PATH],
    }
    require(set(selection['inputs']) == set(expected_inputs), 'Unexpected engineering inputs')
    inputs = {}
    for key, paths in expected_inputs.items():
        require(set(selection['inputs'][key]) == set(paths), 'Unexpected engineering source files')
        for path in paths:
            data = source_bytes(repository / SOURCES[key]['path'], path)
            require(sha(data) == selection['inputs'][key][path], 'Engineering source digest changed: ' + path)
            inputs[(key, path)] = data
    require(selection['reuse'] == {'source': 'ponytail', 'path': REVIEW_PATH, 'sections': SECTIONS}, 'Unreviewed procedure selection')
    license_bytes = inputs[('ponytail', 'LICENSE')]
    require(b'MIT License' in license_bytes and b'Copyright (c) 2026 DietrichGebert' in license_bytes, 'Preserve Ponytail MIT notice')
    payload = {SKILL + '/' + path: source_bytes(repository / 'skill-packs/engineering-core' / SKILL, path + '.in' if path == 'SKILL.md' else path) for path in LOCAL_FILES}
    review = inputs[('ponytail', REVIEW_PATH)].decode('utf-8')
    excerpt = '# Selected connected-code review procedure\n\nSelected verbatim from Ponytail at the commit in adoption.json. Apply the\nPaprika SKILL.md scope and reporting rules; this reference grants no actions.\n\n' + '\n'.join(section(review, heading) for heading in SECTIONS)
    payload[SKILL + '/references/connected-review.md'] = (excerpt + '\nThe [upstream MIT notice](../LICENSE.upstream.md) accompanies this extract.\n').encode()
    payload[SKILL + '/references/adoption.json'] = selection_bytes
    payload[SKILL + '/LICENSE.upstream.md'] = license_bytes
    inventory = []
    for path, data in sorted(payload.items()):
        relative = path[len(SKILL) + 1:]
        if relative in LOCAL_FILES:
            origin = 'skill-packs/engineering-core/' + path + ('.in' if relative == 'SKILL.md' else '')
            transform = 'paprika-authored'
        elif relative == 'references/connected-review.md':
            origin = 'ponytail:' + REVIEW_PATH
            transform = 'complete-selected-h2-sections-v1'
        elif relative == 'LICENSE.upstream.md':
            origin = 'ponytail:LICENSE'
            transform = 'exact-license-copy'
        else:
            origin = 'skill-packs/engineering-core.json'
            transform = 'exact-adoption-record'
        inventory.append({'path': path, 'sha256': sha(data), 'origin': origin, 'transformation': transform})
    pack = {'schema_version': 1, 'id': 'engineering-core', 'skills': [SKILL],
            'sources': SOURCES, 'selection_sha256': sha(selection_bytes),
            'files': inventory, 'requirements': {'network': False, 'executables': [], 'hooks': False},
            'excluded': selection['excluded']}
    manifest = encoded(pack)
    catalog = {'manifest_sha256': sha(manifest), 'source_commits': {key: source['commit'] for key, source in SOURCES.items()}, 'skills': [SKILL]}
    return {**{PREFIX + path: data for path, data in payload.items()}, PREFIX + 'pack.json': manifest}, catalog
