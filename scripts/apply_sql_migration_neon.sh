#!/usr/bin/env bash
# Avoid -u (unset variable) to be robust inside minimal containers
set -eo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

MIGRATIONS_DIR="$ROOT_DIR/scripts/sql/migrations"
if [ ! -d "$MIGRATIONS_DIR" ]; then
  echo "No migrations directory found; creating and migrating baseline..."
  mkdir -p "$MIGRATIONS_DIR"
  if [ -f "$ROOT_DIR/scripts/sql/baseline.sql" ]; then
    cp "$ROOT_DIR/scripts/sql/baseline.sql" "$MIGRATIONS_DIR/0000000000_baseline.sql"
  fi
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL not set; set it to your Neon connection string" >&2
  exit 2
fi

echo "Running idempotent migrations from $MIGRATIONS_DIR against DATABASE_URL"

# If `docker` is available, run migrations inside a postgres client container.
if command -v docker >/dev/null 2>&1; then
  docker run --rm -e DATABASE_URL="$DATABASE_URL" -v "$MIGRATIONS_DIR:/migrations:ro" postgres:15 bash -lc '
  set -eo pipefail
  echo "Ensuring schema_migrations table exists"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "CREATE TABLE IF NOT EXISTS public.schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());"
  for f in /migrations/*.sql; do
    [ -e "$f" ] || continue
    name=$(basename "$f")
    echo "Checking migration: $name"
    found=$(psql "$DATABASE_URL" -tA -c "SELECT 1 FROM public.schema_migrations WHERE name = '$name' LIMIT 1;" || true)
    if [ "x$found" = "x1" ]; then
      echo "Skipping already-applied migration: $name"
    else
      echo "Applying migration: $name"
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "INSERT INTO public.schema_migrations(name) VALUES('$name');"
      echo "Applied: $name"
    fi
  done
  '
else
  # No docker available; run using local psql client inside this container
  echo "docker: command not found, running migrations using local psql"
  if ! command -v psql >/dev/null 2>&1; then
    echo "ERROR: psql client not found in container; please install postgresql client" >&2
    exit 3
  fi
  echo "Ensuring schema_migrations table exists"
  psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "CREATE TABLE IF NOT EXISTS public.schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now());"
  for f in "$MIGRATIONS_DIR"/*.sql; do
    [ -e "$f" ] || continue
    name=$(basename "$f")
    echo "Checking migration: $name"
    found=$(psql "$DATABASE_URL" -tA -c "SELECT 1 FROM public.schema_migrations WHERE name = '$name' LIMIT 1;" || true)
    if [ "x$found" = "x1" ]; then
      echo "Skipping already-applied migration: $name"
    else
      echo "Applying migration: $name"
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f "$f"
      psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -c "INSERT INTO public.schema_migrations(name) VALUES('$name');"
      echo "Applied: $name"
    fi
  done
fi

echo "Migrations complete."
