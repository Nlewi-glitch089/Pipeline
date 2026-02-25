# Troubleshooting Lab Notes

This project is used for hands-on failure and recovery drills. The notes below summarize common failure modes observed during the labs I did, going into brief detail for how to diagnose and fix them.

## Scenario: Wrong database port
- Symptom: app repeatedly restarts; db shows healthy.
- Why db is healthy: Postgres' healthcheck (`pg_isready`) talks to the DB process on the DB container's internal port (usually 5432) — the DB itself is fine.
- Why app fails: app reads `DATABASE_URL` at runtime. If that URL uses the wrong port (e.g. 9999) connections fail with "connection refused" or timeout.
- Why restart doesn't fix it: Restart policy restarts the container but re-applies the same (wrong) configuration so the failure repeats.

Quick commands:

```bash
docker compose down
docker compose up -d
docker compose ps
docker compose logs app
```

## Scenario: Inspecting runtime env inside the container

Fix: restore `DATABASE_URL` to correct value (port 5432) in your secrets and restart the stack.

Login and inspect:

```bash
docker compose exec app sh
env | grep DATABASE_URL
exit
```

Note: environment variables are injected at container start and live in the running process environment (they are runtime values, not baked into the image).

## Scenario: Stop DB while app runs

Commands:

```bash
docker ps            # find db container name
docker stop <db_name>
docker compose ps
docker compose logs app
docker start <db_name>
```

Explain: restart policies bring back containers after external kills; if configuration is correct the app will reconnect. Production failures differ when persistent misconfig or data corruption exists.

## Scenario: Volume drift and data persistence

`docker compose down` keeps named volumes. `docker compose down -v` removes volumes and their data.

Use `down -v` intentionally when you need a clean DB; otherwise stale data (old schema/rows) may mask bugs.

## Scenario: Corrupt/missing secret (DATABASE_URL with no password)

- Symptom: authentication failures in logs.
- Fix: restore the correct `DATABASE_URL` in your secrets and restart. Restart policy cannot fix bad credentials.

## Scenario: Healthcheck removal

Without a healthcheck Docker can report containers as `Up` while the service inside is not ready.

Running vs Healthy: `Running` = container process exists; `Healthy` = healthcheck probe succeeded and service is ready to serve.

## Scenario: Image drift and dependency install

If `node_modules` are removed locally and the image is rebuilt, the `Dockerfile` must run `npm install` during build so the image is self-contained.

Beware mounting the host directory in development — it can overwrite container-installed `node_modules` and break the app.

## Scenario: Manual container kill

`docker kill <app>` triggers the restart policy which will recreate the container and (if config is correct) it will reconnect successfully.

This demonstrates restart policies heal transient crashes, but they do not fix broken configuration.

## Troubleshooting quick checklist

- Use `docker compose ps` to inspect state and restart counters.
- Use `docker compose logs <service>` and `docker logs <container>` to read errors; look for "connection refused" vs "authentication failed".
- Use `docker compose exec <service> sh` then `env` to confirm runtime environment values.
- Use `docker compose down -v` when you explicitly want to reset named volumes (destructive).
- Restore config/secrets and then restart. Sidenote: restarts alone won't fix configuration errors.
