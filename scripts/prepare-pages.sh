#!/usr/bin/env bash
set -euo pipefail

destination="_pages-source"

rm -rf "${destination}"
mkdir -p "${destination}"
cp -R _config.yml _layouts assets index.html plans "${destination}/"
