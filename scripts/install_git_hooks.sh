#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
HOOK_DIR="$ROOT_DIR/.git/hooks"
HOOK_FILE="$HOOK_DIR/pre-push"

echo "[install-hooks] Installing pre-push hook to run dependency installer"
mkdir -p "$HOOK_DIR"
cat > "$HOOK_FILE" <<'HOOK'
#!/usr/bin/env bash
set -euo pipefail
# Allow skipping slow integration checks by setting SKIP_INTEGRATION=1
if [ "${SKIP_INTEGRATION:-}" = "1" ]; then
	echo "[pre-push] SKIP_INTEGRATION=1 set — skipping install/tests"
	exit 0
fi
ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT_DIR"
echo "[pre-push] Running dependency installer (npm ci)"
./scripts/install_deps.sh
echo "[pre-push] Dependencies installed — running integration tests"
./scripts/integration_tests.sh
echo "[pre-push] Integration tests passed; continuing push"
HOOK
chmod +x "$HOOK_FILE"
echo "[install-hooks] pre-push hook installed at $HOOK_FILE"
