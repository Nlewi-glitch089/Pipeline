#!/usr/bin/env bash
set -euo pipefail

# Local CI preflight check
# - Validates secrets / DATABASE_URL
# - Builds images and starts only the DB service
# - Waits for DB readiness (pg_isready)
# - Optionally runs migrations if --migrate provided

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

print() { echo "[ci-check] $*"; }

DB_USER="${POSTGRES_USER:-}"
DB_PASS="${POSTGRES_PASSWORD:-}"
DB_NAME="${POSTGRES_DB:-}"
DB_URL="${DATABASE_URL:-}"

if [ -z "$DB_URL" ]; then
  if [ -n "$DB_USER" ] && [ -n "$DB_PASS" ] && [ -n "$DB_NAME" ]; then
    DB_URL="postgresql://${DB_USER}:${DB_PASS}@db:5432/${DB_NAME}"
    print "Constructed DATABASE_URL from POSTGRES_* env vars"
  else
    print "ERROR: No DATABASE_URL and missing POSTGRES_* env vars"
    print "Set one of: DATABASE_URL or POSTGRES_USER+POSTGRES_PASSWORD+POSTGRES_DB"
    exit 2
  fi
fi

# Export DATABASE_URL so docker compose picks it up for container env interpolation
export DATABASE_URL="$DB_URL"

case "$DB_URL" in
  postgresql://*|postgres://*) print "DATABASE_URL format OK" ;;
  *) print "ERROR: DATABASE_URL must start with 'postgresql://' or 'postgres://'"; exit 2 ;;
esac

print "Checking docker and docker compose availability..."
if ! command -v docker >/dev/null 2>&1; then
  print "ERROR: docker not found in PATH"; exit 2
fi
if ! docker compose version >/dev/null 2>&1; then
  print "ERROR: docker compose not available or not configured"; exit 2
fi

print "Building images (only app image will be built)..."
docker compose build --pull

print "Starting DB service only..."

# If a previous volume exists, docker will reuse it and previous credentials
# may differ from the current env. Detect and optionally reset.
EXTRA_RESET="false"
for a in "$@"; do
  if [ "$a" = "--reset-db" ]; then
    EXTRA_RESET="true"
  fi
done

EXISTING_VOLUMES=$(docker volume ls --format '{{.Name}}' --filter name=db-data)
if [ -n "$EXISTING_VOLUMES" ] && [ "$EXTRA_RESET" != "true" ]; then
  print "Warning: existing docker volume(s) for DB found:\n$EXISTING_VOLUMES"
  print "These may contain different DB credentials. To reset the DB volume and reinitialize, re-run with --reset-db"
fi

if [ "$EXTRA_RESET" = "true" ] && [ -n "$EXISTING_VOLUMES" ]; then
  print "Removing existing DB volume(s) before starting (reset requested)"
  # stop any running compose services that may be using the volume
  print "Stopping existing docker-compose services (if any) to release volumes"
  docker compose down -v || true
  echo "$EXISTING_VOLUMES" | xargs -r docker volume rm || true
fi

docker compose up -d db

print "Waiting for DB to become ready (timeout 60s)..."
SECS=0
MAX=60
until docker compose exec -T db pg_isready -U "${DB_USER:-postgres}" >/dev/null 2>&1 || [ "$SECS" -ge "$MAX" ]; do
  sleep 1
  SECS=$((SECS+1))
  printf "."
done
echo

if [ "$SECS" -ge "$MAX" ]; then
  print "ERROR: DB did not become ready within ${MAX}s"
  docker compose logs db --tail=50
  docker compose down
  exit 3
fi

print "DB ready after ${SECS}s"

if [ "${1:-}" = "--migrate" ]; then
  print "Running Prisma migrations inside app container"
  docker compose up -d app
  # give the app container a moment to initialize before running migrations
  sleep 2
  docker compose exec -T app npx prisma migrate deploy
  EXIT_CODE=$?
  docker compose down
  exit $EXIT_CODE
else
  print "Smoke check complete — DB reachable. To run migrations: ./scripts/check_ci.sh --migrate"
  docker compose down
  exit 0
fi
