"""Compose and verify the bounded optional packs and their shared catalog."""
import json
from pathlib import Path
import research_pack
import engineering_pack
import extension_pack

CATALOG = 'runtime/skill-packs/catalog.json'

def compose(repository):
    files = research_pack.compose(repository)
    catalog = json.loads(files[CATALOG])
    engineering, entry = engineering_pack.compose(repository)
    files.update(engineering)
    catalog['sets']['engineering-core'] = entry
    extensions, entries = extension_pack.compose(repository)
    selected = [skill for entry in [*catalog['sets'].values(), *entries.values()] for skill in entry['skills']]
    research_pack.require(len(selected) == len(set(selected)), 'Selected packs contain duplicate skill names')
    files.update(extensions)
    catalog['sets'].update(entries)
    files[CATALOG] = research_pack.encoded(catalog)
    return files

def verify(repository):
    repository = Path(repository)
    research_pack.verify_source(repository)
    engineering_pack.verify_source(repository)
    expected = compose(repository)
    plugin = repository / 'plugins/paprika-inc'
    actual = set()
    for path in (plugin / 'runtime/skill-packs').rglob('*'):
        research_pack.require(not path.is_symlink(), 'Composed skill resources cannot be symlinks')
        if path.is_file():
            actual.add(path.relative_to(plugin).as_posix())
    research_pack.require(actual == set(expected), 'Composed skill inventory differs from reviewed selections')
    for path, data in expected.items():
        research_pack.require((plugin / path).read_bytes() == data, 'Composed skill resource/source mismatch: ' + path)
    return json.loads(expected[CATALOG])['sets']

def write(repository):
    repository = Path(repository)
    research_pack.verify_source(repository)
    engineering_pack.verify_source(repository)
    for path, data in compose(repository).items():
        target = repository / 'plugins/paprika-inc' / path
        # Check parent links too before creating or overwriting generated files.
        current = repository / 'plugins/paprika-inc'
        for part in Path(path).parts:
            current /= part
            research_pack.require(not current.is_symlink(), 'Refusing composed target symlink')
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(data)
    return verify(repository)

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    repository = Path(__file__).resolve().parents[1]
    print(json.dumps(write(repository) if args.write else verify(repository), sort_keys=True))
