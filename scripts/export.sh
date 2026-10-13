#!/usr/bin/env sh
# Ręczne uruchomienie na systemach z powłoką sh:
# sh scripts/export.sh
# npm run export używa bezpośrednio Node.js, aby działało też na Windows.
set -eu
cd "$(dirname "$0")/.."
node scripts/export-project.mjs
