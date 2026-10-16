#!/usr/bin/env python3
"""Validate this repository foundation; not a company runtime/capability test."""

import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]


def require(condition, message):
    if not condition:
        raise ValueError(message)


def git(*args, cwd=ROOT):
    return subprocess.check_output(["git", *args], cwd=cwd, text=True).strip()


def document(path):
    require(isinstance(path, str), "Document paths must be strings")
    relative = Path(path)
    require(not relative.is_absolute() and ".." not in relative.parts,
            f"Unsafe document path: {path}")
    target = (ROOT / relative).resolve()
    require(target.is_relative_to(ROOT) and target.is_file(),
            f"Missing or escaping document: {path}")
    # Resolve case differences explicitly for case-insensitive developer disks.
    parent = ROOT
    for part in relative.parts:
        require(part in {item.name for item in parent.iterdir()},
                f"Case mismatch: {path}")
        parent /= part
    return target


def main():
    from skill_packs import verify as verify_packs
    packs = verify_packs(ROOT)
    research = packs['research-core']
    for path in ("README.md", "AGENTS.md", "LICENSE", "CONTRIBUTING.md",
                 "SECURITY.md", "SUPPORT.md", "CODE_OF_CONDUCT.md",
                 "THIRD_PARTY_NOTICES.md", ".github/CODEOWNERS"):
        document(path)

    company = json.loads(document("company/company.json").read_text())
    require(company["schema_version"] == 1, "Unsupported company schema")
    require(company["repository"] == "newbiesitl/paprika-inc", "Wrong repository")
    require(company["topology"] == "single_host", "Only single-host design is defined")
    roles = company["roles"]
    ids = [role["id"] for role in roles]
    require(len(ids) == len(set(value.casefold() for value in ids)),
            "Duplicate or case-colliding role IDs")
    require(all(re.fullmatch(r"[a-z][a-z0-9-]*", value) for value in ids),
            "Role IDs must be stable lowercase identifiers")
    require(company["coordinator_role"] in ids, "Coordinator role is missing")
    require(len({role["definition"] for role in roles}) == len(roles),
            "Each role must have a canonical contract")
    for role in roles:
        contract = document(role["definition"]).read_text()
        require(f"Role ID: `{role['id']}`" in contract, "Role ID/contract mismatch")
        require(f"Role version: {role['version']}\n" in contract,
                "Role version/contract mismatch")
    for key in ("constitution", "work_tracking"):
        document(company[key])
    document(company["adoption"]["policy"])
    require(company["adoption"]["automatic"] is False, "Adoption must be explicit")
    require(company["messaging"]["background_monitoring"] is False,
            "The bootstrap must not enable monitoring")
    require(company["lifecycle"]["max_instances_per_role"] == 1,
            "The design requires one instance per role")

    dep = json.loads(document("dependencies.json").read_text())["paprika_messenger"]
    require(re.fullmatch(r"[0-9a-f]{40}", dep["commit"]), "Invalid dependency SHA")
    require(dep["tag"] == "v" + dep["plugin_version"], "Version/tag mismatch")
    require(dep["path"] == "vendor/paprika-messenger", "Unexpected submodule path")
    submodule = ROOT / dep["path"]
    require(git("config", "--file", ".gitmodules", "--get",
                "submodule.vendor/paprika-messenger.url") == dep["repository"],
            "Submodule URL mismatch")
    entry = git("ls-files", "--stage", dep["path"]).split()
    require(entry[:3] == ["160000", dep["commit"], "0"],
            "Stage the exact declared submodule gitlink before validation")
    require((submodule / ".git").exists(),
            "Run git submodule update --init --recursive first")
    require(git("rev-parse", "HEAD", cwd=submodule) == dep["commit"],
            "Submodule checkout does not match its declared pin")
    require(not git("status", "--porcelain", cwd=submodule),
            "Messenger must be unmodified; contribute source changes upstream")
    for path, field in (("plugin-public/plugin.json", "plugin_version"),
                        ("package.json", "service_version")):
        require(json.loads((submodule / path).read_text())["version"] == dep[field],
                f"Dependency version mismatch: {path}")
    release = json.loads((submodule / "releases" / dep["plugin_version"] /
                          "artifacts.json").read_text())
    require(release["source_commit"] == dep["release_build_source_commit"],
            "Release build-source provenance mismatch")
    for field in ("plugin_version", "service_version"):
        require(release[field] == dep[field], f"Release {field} mismatch")

    logo = document("assets/paprika-inc-logo-navy-v1.png").read_bytes()
    require(logo[:8] == b"\x89PNG\r\n\x1a\n", "Logo is not a PNG")
    require(struct.unpack(">II", logo[16:24]) == (1254, 1254),
            "Approved logo dimensions changed")
    require(hashlib.sha256(logo).hexdigest() ==
            "c66ead32fc5d6dcf09207fb5c3f1d23becd9355e8ac8507c6eae4ae168e7d902",
            "Approved logo bytes changed; version intentional replacements")
    document("assets/paprika-inc-logo-navy-v1.prompt.txt")
    provenance = json.loads(document("docs/proposals/upstream-provenance.json").read_text())
    for path, digest in provenance["source_sha256"].items():
        document(path)
        require(re.fullmatch(r"[0-9a-f]{64}", digest), "Invalid proposal provenance")
    review = document("docs/proposals/virtual-company/REVIEW.md").read_text()
    require(set(re.findall(r"\| (C\d{2}) \|", review)) ==
            {f"C{number:02}" for number in range(1, 25)},
            "The 24 original acceptance scenarios must remain traceable")

    files = git("ls-files", "--cached", "--others", "--exclude-standard", "-z").split("\0")
    links_checked = 0
    for name in filter(None, files):
        require(not name.startswith(".paprika/"), "Private runtime state is tracked")
        if name.startswith("vendor/"):
            continue
        path = ROOT / name
        if not path.is_file() or path.suffix not in (".md", ".txt", ".json", ".yml"):
            continue
        text = path.read_text()
        require("\r" not in text, f"Use LF line endings: {name}")
        require("/Users/" not in text and "C:\\Users\\" not in text,
                f"Private local path in {name}")
        if path.suffix != ".md":
            continue
        require(len(re.findall(r"^```", text, re.MULTILINE)) % 2 == 0,
                f"Unbalanced code fences: {name}")
        for raw in re.findall(r"\[[^\]\n]*\]\(([^)\n]+)\)", text):
            url = urlsplit(raw.strip("<>"))
            if url.scheme or url.netloc or not url.path:
                continue
            target = (path.parent / unquote(url.path)).resolve()
            require(target.is_relative_to(ROOT) and target.exists(),
                    f"Broken/escaping local link in {name}: {raw}")
            links_checked += 1
    print(f"Validated {len(roles)} role contracts, {links_checked} local links, "
          f"24 acceptance scenarios, logo provenance, and Messenger "
          f"{dep['plugin_version']} ({dep['commit'][:12]}).")
    print("Foundation checks only; run MVP command/package checks separately. Advanced managed lifecycle remains future work.")
    print(f"Skill packs: {', '.join(sorted(packs))}; composed files match reviewed immutable sources. No API, UI or review-quality certification.")


if __name__ == "__main__":
    try:
        main()
    except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as error:
        print(f"Repository validation failed: {error}", file=sys.stderr)
        sys.exit(1)
