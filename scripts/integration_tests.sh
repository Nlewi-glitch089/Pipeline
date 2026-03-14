#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

echo "[integration] Ensure example secrets present"
if [ ! -d ./secrets ]; then
  if [ -d ./secrets.example ]; then
    mkdir -p ./secrets
    cp -n ./secrets.example/* ./secrets/ || true
  fi
fi

export POSTGRES_USER="$(cat ./secrets/postgres_user.txt)"
export POSTGRES_PASSWORD="$(cat ./secrets/postgres_password.txt)"
export POSTGRES_DB="$(cat ./secrets/postgres_db.txt)"
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"

echo "[integration] Building app image (ensure latest files included)"
docker compose build app

echo "[integration] Starting db and app"
docker compose up -d db app

echo "[integration] Waiting for app HTTP on localhost:3000 (30s)"
SECS=0
MAX=30
until curl -sfS http://localhost:3000/ >/dev/null 2>&1 || [ "$SECS" -ge "$MAX" ]; do
  sleep 1
  SECS=$((SECS+1))
  printf "."
done
echo
if [ "$SECS" -ge "$MAX" ]; then
  echo "[integration] ERROR: app did not respond within ${MAX}s"
  docker compose logs app --tail=100
  docker compose down
  exit 1
fi

echo "[integration] HTTP root check"
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/)
echo "[integration] GET / returned ${STATUS}"
if [ "$STATUS" != "200" ]; then
  echo "[integration] ERROR: unexpected root status: $STATUS"
  docker compose logs app --tail=100
  docker compose down
  exit 2
fi

echo "[integration] Run Prisma client smoke test inside app container"
echo "[integration] Generate Prisma client and run smoke test in one container"
docker compose run --rm -e DATABASE_URL="$DATABASE_URL" app sh -lc "npx prisma generate && node scripts/prisma_smoke.js"

EXIT_CODE=$?
docker compose down
if [ $EXIT_CODE -ne 0 ]; then
  echo "[integration] Prisma smoke test failed (exit $EXIT_CODE)"
  exit $EXIT_CODE
fi

echo "[integration] All tests passed"
exit 0
