#!/bin/sh
set -e
# Entry point to inject secrets as env vars before starting the app.
# If a file at /run/secrets/database_url exists we load it. Otherwise the
# app can rely on an existing DATABASE_URL env var. If neither is present
# we print a clear error and exit so failures are obvious in logs.
if [ -f /run/secrets/database_url ]; then
  DATABASE_URL="$(cat /run/secrets/database_url)"
  export DATABASE_URL
fi

# If DATABASE_URL is still not set, try to build it from postgres_* secrets (if present).
if [ -z "${DATABASE_URL:-}" ]; then
  if [ -f /run/secrets/postgres_user ] && [ -f /run/secrets/postgres_password ] && [ -f /run/secrets/postgres_db ]; then
    POSTGRES_USER="$(cat /run/secrets/postgres_user)"
    POSTGRES_PASSWORD="$(cat /run/secrets/postgres_password)"
    POSTGRES_DB="$(cat /run/secrets/postgres_db)"
    # Use the compose service hostname 'db' and default port 5432
    DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@db:5432/${POSTGRES_DB}"
    export DATABASE_URL
  else
    echo "ERROR: DATABASE_URL is not set. Provide a secret file at /run/secrets/database_url or set the DATABASE_URL environment variable." >&2
    echo "Examples: mount ./secrets/database_url to /run/secrets/database_url or use 'docker run -e DATABASE_URL=...'" >&2
    exit 1
  fi
fi

# If DATABASE_URL exists but doesn't start with the expected protocol, bail with an explanatory error
case "${DATABASE_URL}" in
  postgresql://*|postgres://*) ;;
  *)
    echo "ERROR: DATABASE_URL is invalid: must start with 'postgresql://' or 'postgres://'" >&2
    exit 1
    ;;
esac

# Load NEXTAUTH_SECRET from secrets file if present
if [ -f /run/secrets/nextauth_secret ]; then
  NEXTAUTH_SECRET="$(cat /run/secrets/nextauth_secret)"
  export NEXTAUTH_SECRET
fi

if [ -z "${NEXTAUTH_SECRET:-}" ]; then
  echo "WARNING: NEXTAUTH_SECRET is not set. Sessions will not work correctly." >&2
fi

# Apply Prisma DB migrations on every container start.
# If prisma/migrations/ has migration files use 'migrate deploy' (recommended for production).
# If no migration files exist yet (first run / schema-only workflow) fall back to 'db push'.
echo "Applying database schema..."
if [ -d "./prisma/migrations" ] && ls ./prisma/migrations/*.sql >/dev/null 2>&1; then
  echo "Running prisma migrate deploy..."
  npx prisma migrate deploy
else
  echo "No migration files found; running prisma db push to sync schema..."
  npx prisma db push --accept-data-loss
fi

exec "$@"
