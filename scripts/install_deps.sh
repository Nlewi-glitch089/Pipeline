#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[install-deps] Installing project dependencies with npm ci"
# Use npm ci for reproducible installs when package-lock.json is present
if [ -f package-lock.json ]; then
  npm ci
else
  npm install
fi

echo "[install-deps] Dependencies installed"
