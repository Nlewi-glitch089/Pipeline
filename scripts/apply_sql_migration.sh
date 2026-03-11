#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT_DIR"

print() { echo "[apply-sql] $*"; }

SQL_FILE="$ROOT_DIR/tmp/prisma_apply_migration.sql"
mkdir -p "$(dirname "$SQL_FILE")"

cat > "$SQL_FILE" <<'SQL'
CREATE TABLE IF NOT EXISTS "User" (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname = 'public' AND indexname = 'User_email_key'
  ) THEN
    CREATE UNIQUE INDEX "User_email_key" ON "User" (email);
  END IF;
END $$;
SQL

if [ -z "${DATABASE_URL:-}" ]; then
  print "ERROR: DATABASE_URL not set; set it before running this script"
  exit 2
fi

print "Writing SQL to $SQL_FILE"

# Run the SQL using a transient Postgres client container. Mount the SQL file
# and set DATABASE_URL so psql can connect directly using the connection string.
print "Running SQL against DATABASE_URL (piping SQL to container to avoid mount issues)"
docker run --rm --network pipeline_default \
  -e DATABASE_URL="$DATABASE_URL" \
  postgres:15 sh -c 'psql "$DATABASE_URL" -f -' < "$SQL_FILE"

print "SQL applied."
