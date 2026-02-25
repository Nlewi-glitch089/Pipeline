#!/bin/sh
# Entry point to inject secrets as env vars before starting the app
if [ -f /run/secrets/database_url ]; then
  export DATABASE_URL="$(cat /run/secrets/database_url)"
fi

exec "$@"
