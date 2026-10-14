#!/usr/bin/env python3
"""Build the deterministic source kit; never save, install or deploy it."""
import argparse
import json
import subprocess
import sys
from plugin_package import prepare

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', help='Output directory; defaults to ignored artifacts/plugin-skeleton')
args = parser.parse_args()
try:
    print(json.dumps(prepare(output=args.output), indent=2))
except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as error:
    print(f'Plugin preparation failed: {error}', file=sys.stderr)
    sys.exit(1)
