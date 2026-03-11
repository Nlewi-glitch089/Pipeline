# Pipeline App : Local Docker Compose Setup

[![CI Build & Smoke Test](https://github.com/Nlewi-glitch089/Pipeline/actions/workflows/ci.yml/badge.svg)](https://github.com/Nlewi-glitch089/Pipeline/actions/workflows/ci.yml)


This repository contains a minimal Next.js app plus a PostgreSQL service and a Docker Compose setup configured for reliable local development. PIE

Quick features implemented to meet Level-10 look-fors:
- Multistage `Dockerfile` to produce a small production image.
- `docker-compose.yml` with `healthcheck` for Postgres and `depends_on` using service health.
- `restart: unless-stopped` for auto-recovery of critical services.
- `prisma` schema included and scripts to generate client and run migrations inside container.
- `secrets/` example files included to demonstrate Docker secrets for local development.

Getting started

1. Using Docker secrets (recommended local/dev secure approach)

 - Example secret files are provided in `secrets/` for local development. Replace with secure values in real environments.

```bash
docker compose build
docker compose up -d
```

2. Alternative (quick start using `.env`):

- Copy `.env.example` to `.env` and adjust secrets (not recommended for committing to VCS).

3. Apply database schema migrations

This project no longer uses Prisma for migrations. A SQL baseline is provided and can be applied to any Postgres-compatible host (including Neon).

Locally (applies baseline SQL using the `postgres` client container):

```bash
# set your DATABASE_URL to point at your DB (Neon or other)
export DATABASE_URL="postgresql://<user>:<pw>@<host>:5432/<db>"
./scripts/apply_sql_migration_neon.sh
```

Or run the idempotent migration runner which tracks applied migrations in the database:

```bash
export DATABASE_URL="postgresql://<user>:<pw>@<host>:5432/<db>"
./scripts/apply_sql_migration_neon.sh
```

Verify

- Check containers: `docker compose ps`
- Tail logs: `docker compose logs -f`
- Visit `http://localhost:3000`

See detailed troubleshooting drills: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

Troubleshooting / Failpoints

- Common errors and how I resolved them are collected in [FAILPOINTS.md](FAILPOINTS.md). Review that file for examples you can reference.

Secrets

- For CI/production use Docker secrets or your cloud provider secret manager.
- This repository includes example files under `secrets/` for local testing. Do NOT commit real secrets.
- `docker-compose.yml` is configured to mount secrets to `/run/secrets/<name>`. The app's entrypoint will load `DATABASE_URL` from `/run/secrets/database_url` if present.

Branching strategy (recommended for Level 10)

- Trunk-based approach with short-lived feature branches:
  - `main` (protected): always deployable; PRs required with at least one reviewer.
  - Feature branches: `feature/<ticket>-short-desc` created off `main` and merged via PR.
  - Release/Hotfix branches used rarely, merged back into `main` if used.

Why this helps teams

- Clear branch names and a PR process reduce merge conflicts and onboarding time.
- A protected `main` ensures CI runs and that builds are reproducible.

Notes on Compose healthchecks and `depends_on`

- This setup uses Compose `2.4` syntax to allow `depends_on` with a `service_healthy` condition so the `app` will wait for the `db` healthcheck to pass before starting.
- Some Compose versions differ; if your environment uses the newer Compose spec (v3+), you may instead implement an explicit wait (e.g., in the app entrypoint) or use a small wait script.

**Screenshots**

- **Command:** `docker compose down` — output captured after stopping services.
- **Evidence:**

  ![docker-compose down](screenshots/docker-compose-down.png)

- **Command:** `docker compose ps` — shows running containers and their status.
- **Evidence:**

  ![compose ps](screenshots/image-1.png)

- **Command:** `docker compose logs --tail=200 app` — shows recent app logs confirming the server started and handled requests.
- **Evidence:**

  ![app logs](screenshots/image-2.png)

These images are evidence that the containers started, the database became healthy, and the app served requests on `http://localhost:3000`.


## CI / GitHub Actions

This repo includes a CI workflow at `.github/workflows/ci.yml` that:

- Runs build, starts services, runs migrations, and runs tests in `build-and-test`.
- Deploys to production via SSH in `deploy` (only runs on `main`).

Secrets (add these in your repo: Settings → Secrets and variables → Actions):

- `DATABASE_URL` — used by the `build-and-test` job.

Note: The repository previously included an automated SSH `deploy` job that pushed containers to an EC2 host. That job has been removed to simplify CI and local development. To reintroduce an EC2 SSH deploy in future, you can add a `deploy` job that uses an SSH action and the following secrets: `EC2_HOST`, `EC2_USER`, `EC2_KEY`.

Suggested future-implementation (example):

1. Add repository secrets: `EC2_HOST`, `EC2_USER`, `EC2_KEY` (private key).
2. Add a `deploy` job (runs-on: `ubuntu-latest`) which runs after `build-and-test` and only on `main`.
3. Use a well-maintained SSH action (e.g., `appleboy/ssh-action`) to run a small deploy script on the EC2 host:

```bash
# Example actions step (conceptual):
## - name: Deploy to EC2
##   uses: appleboy/ssh-action@v1
##   with:
##     host: ${{ secrets.EC2_HOST }}
##     username: ${{ secrets.EC2_USER }}
##     key: ${{ secrets.EC2_KEY }}
##     script: |
##       cd ~/my-app || git clone https://github.com/YOUR-ORG/YOUR-REPO.git ~/my-app
##       cd ~/my-app && git pull origin main
##       docker compose down && docker compose up --build -d
```

Security notes for future EC2 deploys:
- Use a dedicated deploy user/key and restrict key access to the runner only.
- Consider using a bastion host or temporary short-lived credentials instead of a long-lived private key.
- Prefer cloud provider deployment primitives (ECS, EKS, or managed App Runner) or a CI/CD-specific deploy runner where possible.

Important notes:

- Do NOT commit `.env.production` or any real credentials — it is ignored (`.gitignore` includes `.env.production`).
- The workflow injects secrets into the runner as `${{ secrets.NAME }}`; names must match exactly.

Simulating a failing pipeline (evidence step):

1. Introduce a deliberate, reversible break (example: rename the `db` service in `docker-compose.yml`).
2. Commit and push to `main` and observe a red ✗ in Actions on the `build-and-test` job (capture a screenshot).
3. Revert the commit with `git revert HEAD`, push, and observe the pipeline turn green ✓ (capture a screenshot).

### CI evidence — failing run
![CI: Invalid workflow file](screenshots/db-failure.png)

Caption: Red ✗ run showing "Invalid workflow file" error in the Actions UI.



