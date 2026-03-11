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

# If no `secrets/` directory exists (e.g. in CI), populate it from the
# committed `secrets.example/` files so docker-compose can mount secrets.
if [ ! -d ./secrets ]; then
  if [ -d ./secrets.example ]; then
    print "No secrets/ found — copying example secrets for CI"
    mkdir -p ./secrets
    cp -n ./secrets.example/* ./secrets/ || true
  else
    print "No secrets/ or secrets.example/ found — continuing without secrets"
  fi
fi

if [ "${1:-}" = "--migrate" ]; then
  print "Skipping app image build for migrate-only run"
else
  print "Building images (only app image will be built)..."
  docker compose build --pull
fi

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
  print "Running Prisma migrations (one-off run with DATABASE_URL passed)"
  # Create a temporary Prisma config file containing the concrete DATABASE_URL
  # (Prisma v7 requires a literal datasource.url in the config when running
  # certain CLI commands inside containers). We will mount this file into the
  # one-off container and point the CLI at it, avoiding committing secrets.
  print "Running prisma migrate deploy using schema.prisma (reads DATABASE_URL from env)"
  # Create a temporary Prisma config file inside the one-off app container
  # using the DATABASE_URL env var, then run migrate deploy against it.
  # Ensure any bundled prisma package under node_modules doesn't shadow the
  # CLI installed by npx. Remove it, create the temp config, run migrations,
  # then clean up.
  # Encode the DATABASE_URL to base64 to avoid shell/quoting issues on Windows
  # when passing it through docker compose. Decode inside the container.
  # Use SQL-applier fallback to run migrations directly (avoids Prisma v7 CLI
  # runtime config parsing issues in CI/local). This applies the baseline SQL
  # from prisma/migrations and keeps secrets out of the repo.
  print "Applying SQL migrations using scripts/apply_sql_migration.sh"
  bash ./scripts/apply_sql_migration.sh
  EXIT_CODE=$?

  docker compose down
  exit $EXIT_CODE
else
  print "Smoke check complete — DB reachable. To run migrations: ./scripts/check_ci.sh --migrate"
  docker compose down
  exit 0
fi
