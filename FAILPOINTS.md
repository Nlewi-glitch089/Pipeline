Failpoints and Fixes
===================

This document tracks reproducible errors encountered during development, what they looked like, why they happened, and exactly how they were resolved.

Use this as a quick reference during demos and troubleshooting.

1) App Fails to Connect to Postgres (Docker Compose)

Symptom

ECONNREFUSED — "Connection refused" when the app container starts

Root Cause

The app starts before Postgres is fully ready. `DATABASE_URL` may be correct, but the DB is not yet accepting connections.

Fix

- Add a healthcheck to the Postgres service in `docker-compose.yml`.
- Use `depends_on` with a service_healthy condition:

```yaml
depends_on:
	db:
		condition: service_healthy
```

- Alternatively, use an entrypoint wait script that blocks until the DB accepts connections.

- Rebuild and restart:

```bash
docker compose up --build
```

2) Database migrations fail — "relation does not exist"

Symptom

Error: relation "X" does not exist

Root Cause

Database not initialized, migrations applied out of order, or incorrect `DATABASE_URL`.

Fix

Check the database and apply SQL migrations (this project provides an idempotent SQL runner):

```bash
# inspect DB from the host or within the compose network
docker compose exec db psql -U "$POSTGRES_USER" -d "$POSTGRES_DB" -c '\dt'

# apply migrations using the project's migration runner (uses DATABASE_URL)
export DATABASE_URL="postgresql://$POSTGRES_USER:$POSTGRES_PASSWORD@db:5432/$POSTGRES_DB"
./scripts/apply_sql_migration_neon.sh
```

If you are using a hosted provider (Neon), set `DATABASE_URL` to the provider's connection string and run `./scripts/apply_sql_migration_neon.sh`.

Verify `DATABASE_URL` before running migrations.

3) Secrets Exposed in Docker Image or Build Context

Symptom

Sensitive values visible in image layers or secrets accidentally pushed to GitHub.

Root Cause

`.env` files or `secrets/` were included in the Docker build context, or secrets were committed to Git.

Fix

Add to `.dockerignore`:

```text
secrets/
.env*
```

Add to `.gitignore`:

```text
secrets/
.env*
```

If secrets were exposed: rotate credentials immediately and, if necessary, remove them from Git history (see "Additional Notes").

4) CI Fails Due to Missing Repository Secrets

Symptom

GitHub Actions fails when trying to access `secrets.DATABASE_URL` (or similar).

Root Cause

The secret is missing from repository settings or was deleted accidentally.

Fix

Recreate the secret via the CLI or UI:

```bash
gh secret set DATABASE_URL --repo OWNER/REPO --body "<value>"
```

Use test/demo secrets during presentations to avoid exposing real credentials.

5) Large File Uploads Failing in CI Tests

Symptom

Upload timeouts or CI disk space errors.

Root Cause

Tests use the local filesystem (no object storage emulator) and CI has limited disk space.

Fix

Use an S3-compatible emulator in CI (e.g., `localstack` or `minio`) and keep test fixture assets small.

Additional Notes

- If a secret was committed to Git history, assume it is compromised: rotate immediately and consider rewriting history with `git filter-repo` or `bfg`.
- Keep `FAILPOINTS.md` updated whenever a new reproducible issue appears.

