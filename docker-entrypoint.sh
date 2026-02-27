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

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Provide a secret file at /run/secrets/database_url or set the DATABASE_URL environment variable." >&2
  echo "Examples: mount ./secrets/database_url to /run/secrets/database_url or use 'docker run -e DATABASE_URL=...'." >&2
  exit 1
fi

exec "$@"
