#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[local-checks] Populating example secrets if missing"
if [ ! -d ./secrets ]; then
  if [ -d ./secrets.example ]; then
    mkdir -p ./secrets
    cp -n ./secrets.example/* ./secrets/ || true
  fi
fi

echo "[local-checks] Exporting POSTGRES_* and DATABASE_URL from secrets"
export POSTGRES_USER="$(cat ./secrets/postgres_user.txt)"
export POSTGRES_PASSWORD="$(cat ./secrets/postgres_password.txt)"
export POSTGRES_DB="$(cat ./secrets/postgres_db.txt)"
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
echo "[local-checks] DATABASE_URL=${DATABASE_URL}"

echo "[local-checks] Running CI preflight (smoke + migrations)"
./scripts/check_ci.sh --migrate

echo "[local-checks] Running Prisma generate in one-off container"
docker compose run --rm -e DATABASE_URL="$DATABASE_URL" app npx prisma generate

echo "[local-checks] Starting app container for health checks"
docker compose up -d app

echo "[local-checks] Waiting for app to become healthy (timeout 30s)"
SECS=0
MAX=30
until curl -sfS http://localhost:3000/ >/dev/null 2>&1 || [ "$SECS" -ge "$MAX" ]; do
  sleep 1
  SECS=$((SECS+1))
  printf "."
done
echo

if [ "$SECS" -ge "$MAX" ]; then
  echo "[local-checks] ERROR: app did not become healthy within ${MAX}s"
  docker compose logs app --tail=50
  docker compose down
  exit 4
fi

echo "[local-checks] App root responded; performing additional smoke requests"
curl -fS http://localhost:3000/ | head -n 5 || true

echo "[local-checks] All checks passed"
