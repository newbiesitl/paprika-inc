#!/usr/bin/env python3
"""Validate a source kit or built archive; not a host installation test."""
import argparse
from pathlib import Path
import sys
from plugin_package import ROOT, PLUGIN, verify_archive, verify_package

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('path', nargs='?', default=str(ROOT / PLUGIN), help='Plugin directory or ZIP')
args = parser.parse_args()
try:
    target = Path(args.path)
    result = verify_archive(target) if target.suffix == '.zip' else verify_package(target)
    print(f'Validated {result["name"]} {result["version"]}: {len(result["files"])} contained files. Local package checks only; not installed, deployed, adopted or host-certified.')
except (ValueError, KeyError, OSError) as error:
    print(f'Plugin validation failed: {error}', file=sys.stderr)
    sys.exit(1)
