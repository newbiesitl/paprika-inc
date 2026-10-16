#!/usr/bin/env python3
"""Build the deterministic source kit; never save, install or deploy it."""
import argparse
import json
import subprocess
import sys
from pathlib import Path
from plugin_package import prepare

parser = argparse.ArgumentParser(description=__doc__)
parser.add_argument('--output', help='Output directory; defaults to ignored artifacts/plugin-skeleton')
parser.add_argument('--service-binding', help='Private JSON report for the verified existing Paprika Service App; no App/service is created')
args = parser.parse_args()
try:
    binding = json.loads(Path(args.service_binding).read_text()) if args.service_binding else None
    print(json.dumps(prepare(output=args.output, service_binding=binding), indent=2))
except (ValueError, KeyError, OSError, subprocess.CalledProcessError) as error:
    print(f'Plugin preparation failed: {error}', file=sys.stderr)
    sys.exit(1)
