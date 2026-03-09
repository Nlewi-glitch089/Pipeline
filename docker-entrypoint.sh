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

exec "$@"
