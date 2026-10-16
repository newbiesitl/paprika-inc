"""Deterministic composition of the reviewed four-skill research subset.

Never executes upstream code, installs dependencies, or registers a plugin.
"""
import ast
import hashlib
import json
from pathlib import Path
import re
import subprocess

PIN = 'a1043ef544e3a100c28e70a736b6cf32554d0677'
VERSION = '2.72.0'
SKILLS = ('paper-lookup', 'literature-review', 'citation-management', 'scientific-critical-thinking')
PREFIX = 'runtime/skill-packs/research-core/'
REQUIREMENTS = {
    'paper-lookup': {'baseline': 'analytical guidance', 'python_minimum': '3.11', 'packages': [], 'retrieval_executable': 'curl', 'network': 'required for retrieval; never checked during install', 'optional_credentials': ['NCBI_API_KEY', 'S2_API_KEY', 'CORE_API_KEY', 'OPENALEX_API_KEY']},
    'literature-review': {'baseline': 'Markdown review and screening guidance', 'python_minimum': '3.10', 'local_record_helper_packages': [], 'doi_helper_packages': ['requests'], 'network': 'required for searches/DOI checks, not local record processing', 'disabled_optional': ['pdf-export', 'paid-ai-diagrams', 'parallel-web']},
    'citation-management': {'baseline': 'bibliography guidance', 'python_minimum': '3.9', 'local_formatter_packages': [], 'metadata_and_validation_packages': ['requests'], 'network': 'required for metadata lookup/verification', 'disabled_optional': ['google-scholar', 'parallel-web']},
    'scientific-critical-thinking': {'baseline': 'analytical appraisal guidance', 'python_minimum': None, 'packages': [], 'network': 'not required for core appraisal', 'disabled_optional': ['scientific-schematics']},
}

GUIDANCE = '''# Paprika Inc portability and scope

This is the reviewed research-core subset, not an installation of the upstream
Scientific Agent Skills plugin. Read the selected SKILL.md and its local
references as procedures bounded by the current human assignment and host policy.
Upstream allowed-tools names are compatibility metadata, not permission grants.

Resolve scripts/, references/ and assets/ against THIS installed skill directory.
Replace repository-root examples such as `python scripts/tool.py` with the
absolute path to this skill's script. Keep the working directory/output paths in
the user-selected research project, not in the managed skill directory. Use
`python3 -B <absolute-skill-directory>/scripts/tool.py ...` to avoid bytecode caches.
Local helper imports resolve beside the script; no upstream checkout or installed
plugin cache is needed.

Only paper-lookup, literature-review, citation-management and
scientific-critical-thinking are included. References to parallel-web,
scientific-schematics, scientific-writing, venue-templates, pubmed-database,
matplotlib/seaborn or peer-review do not install or activate those skills.
Use included paper-lookup and permitted public/publisher sources for retrieval
and metadata enrichment; do not treat an optional paid provider as mandatory.
The explicit `skills/scientific-schematics/...` example is unsupported here.

PDF export, AI figures, Parallel, Google Scholar scraping and restricted full text
are optional capabilities, disabled by default by this integration. Their source
helpers/references are retained for completeness, not permission to execute them.
Missing these features does not block Markdown synthesis or analytical appraisal.
Never run paid-service calls, install account-wide packages, connect accounts,
read unrelated secrets or disclose confidential inputs as an installation/check
side effect. Any later optional use needs its actual dependencies/access and
the applicable human request. Check only named credential presence; never values.

Installation integrity and runtime capability reports are separate. A package,
Python module, executable or environment-variable presence is not authentication,
network success, full-text entitlement or scientific correctness. Onboarding is
read/report only and makes no scholarly API calls. Project-local skills can be
discovered by other chats in this project; role references guide use, not access.

Upstream notices and source text are preserved. SKILL.md has one deterministic
Inc portability prelude after its YAML frontmatter; no other upstream content is
rewritten. LICENSE.upstream.md is the exact root MIT license. pack.json records
original/emitted SHA-256 digests and the immutable source commit.
'''

PRELUDE = '''\n> **Paprika Inc project-local adapter:** Read [INC-PORTABILITY.md](INC-PORTABILITY.md)
> before using commands or integrations below. Resolve resources from this skill's
> installed directory. Only the four research-core skills are included; unselected
> cross-skill and optional paid/PDF/image routes are not baseline requirements.
> This adapter governs portability/selection, never human or host permissions.
\n'''

def require(condition, message):
    if not condition:
        raise ValueError(message)

def sha(data):
    return hashlib.sha256(data).hexdigest()

def encoded(value):
    return (json.dumps(value, indent=2, sort_keys=True) + '\n').encode()

def compose(repository):
    repository = Path(repository)
    dep = json.loads((repository / 'dependencies.json').read_text())['scientific_agent_skills']
    require(dep['commit'] == PIN and dep['package_version'] == VERSION and dep['path'] == 'vendor/scientific-agent-skills', 'Scientific dependency pin/version/path mismatch')
    require(dep['repository'] == 'https://github.com/K-Dense-AI/scientific-agent-skills.git' and 'tag' not in dep, 'Use the reviewed scientific commit, without an assumed release tag')
    selection = json.loads((repository / dep['selection']).read_text())
    require(selection == {'schema_version': 1, 'id': 'research-core', 'source_dependency': 'scientific_agent_skills', 'skills': list(SKILLS)}, 'research-core must explicitly select exactly the reviewed four skills')
    root = repository / dep['path']
    require(json.loads((root / 'plugin.json').read_text())['version'] == VERSION, 'Scientific upstream manifest/version mismatch')
    license_bytes = (root / 'LICENSE.md').read_bytes()
    require(b'MIT License' in license_bytes and b'Copyright (c) 2025 K-Dense Inc.' in license_bytes, 'Preserve the actual upstream MIT notice')
    payload, inventory, audit, licenses = {}, [], [], {}
    for skill in SKILLS:
        for path in sorted((root / 'skills' / skill).rglob('*')):
            require(not path.is_symlink(), 'Selected scientific source contains a symlink')
            if not path.is_file():
                continue
            relative = path.relative_to(root / 'skills').as_posix()
            require(path.suffix in {'.md', '.py', '.bib'} and path.name not in {'plugin.json', 'marketplace.json'}, 'Unexpected selected upstream payload: ' + relative)
            original = path.read_bytes()
            text = original.decode('utf-8')
            emitted = original
            if path.name == 'SKILL.md':
                require(relative == skill + '/SKILL.md' and text.startswith('---\n') and '\n---\n' in text, 'Unexpected nested skill or invalid frontmatter')
                header, body = text.split('\n---\n', 1)
                require(f'\nname: {skill}\n' in header, 'Scientific skill name mismatch')
                notice = re.search(r'^license:\s*(.+)$', header, re.M)
                require(notice and notice[1].lower() in {'mit', 'mit license'}, 'Review the selected skill license before packaging')
                licenses[skill] = notice[1]
                emitted = (header + '\n---\n' + PRELUDE + body).encode()
            if path.suffix == '.py':
                tree = ast.parse(text)
                imports = sorted({name for node in ast.walk(tree) if isinstance(node, (ast.Import, ast.ImportFrom)) for name in ([alias.name for alias in node.names] if isinstance(node, ast.Import) else [str(node.module)])})
                audit.append({'path': relative, 'imports': imports})
            payload[relative] = emitted
            inventory.append({'path': relative, 'sha256': sha(emitted), 'source_path': 'skills/' + relative, 'source_sha256': sha(original),
                              'transformation': 'inc-portability-prelude-v1' if emitted != original else 'none'})
        for name, data, source_path in [('LICENSE.upstream.md', license_bytes, 'LICENSE.md'), ('INC-PORTABILITY.md', GUIDANCE.encode(), None)]:
            relative = skill + '/' + name
            payload[relative] = data
            inventory.append({'path': relative, 'sha256': sha(data), 'source_path': source_path,
                              'source_sha256': sha(data) if source_path else None, 'transformation': 'exact-license-copy' if source_path else 'inc-companion-v1'})
    manifest = {'schema_version': 1, 'id': 'research-core', 'source_dependency': 'scientific_agent_skills',
                'source': {key: dep[key] for key in ['repository', 'commit', 'package_version']}, 'skills': list(SKILLS), 'licenses': licenses,
                'files': sorted(inventory, key=lambda item: item['path']), 'helper_audit': audit, 'requirements': REQUIREMENTS,
                'disabled_optional_integrations': ['parallel-web', 'scientific-schematics', 'scientific-writing', 'venue-templates', 'pubmed-database', 'peer-review', 'paid-ai-diagrams', 'google-scholar', 'pdf-export']}
    manifest_bytes = encoded(manifest)
    catalog = {'schema_version': 1, 'sets': {'research-core': {'manifest_sha256': sha(manifest_bytes),
               'source_commit': PIN, 'package_version': VERSION, 'skills': list(SKILLS)}}}
    return {**{PREFIX + path: data for path, data in payload.items()}, PREFIX + 'pack.json': manifest_bytes,
            'runtime/skill-packs/catalog.json': encoded(catalog)}

def verify_source(repository):
    repository = Path(repository)
    dep = json.loads((repository / 'dependencies.json').read_text())['scientific_agent_skills']
    def git(*args, cwd=repository):
        return subprocess.check_output(['git', *args], cwd=cwd, text=True).strip()
    require(git('ls-files', '--stage', dep['path']).split()[:3] == ['160000', PIN, '0'], 'Stage the exact scientific gitlink before validation')
    require(git('config', '--file', '.gitmodules', '--get', 'submodule.vendor/scientific-agent-skills.url') == dep['repository'], 'Scientific submodule URL mismatch')
    require(git('rev-parse', 'HEAD', cwd=repository / dep['path']) == PIN and not git('status', '--porcelain', cwd=repository / dep['path']), 'Scientific submodule must remain at its clean reviewed pin')


def verify(repository):
    repository = Path(repository)
    verify_source(repository)
    expected = compose(repository)
    plugin = repository / 'plugins/paprika-inc'
    actual = set()
    for path in (plugin / 'runtime/skill-packs').rglob('*'):
        require(not path.is_symlink(), 'Composed research resources cannot be symlinks')
        if path.is_file():
            actual.add(path.relative_to(plugin).as_posix())
    require(actual == set(expected), 'Composed research inventory differs from the selected source')
    for path, data in expected.items():
        require((plugin / path).read_bytes() == data, 'Scientific composed resource/source mismatch: ' + path)
    return {'source_commit': PIN, 'package_version': VERSION, 'selected_skills': list(SKILLS), 'file_count': len(expected)}


if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true', help='Regenerate only the explicit selected internal resources from the reviewed source')
    args = parser.parse_args()
    repository = Path(__file__).resolve().parents[1]
    if args.write:
        verify_source(repository)
        for path, data in compose(repository).items():
            target = repository / 'plugins/paprika-inc' / path
            target.parent.mkdir(parents=True, exist_ok=True)
            require(not target.is_symlink(), 'Refusing composed target symlink')
            target.write_bytes(data)
    print(json.dumps(verify(repository), sort_keys=True))
