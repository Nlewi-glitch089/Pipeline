# Secrets: Short and simple

What the container does at startup

- If a file exists at `/run/secrets/database_url`, the entrypoint reads that file and sets the `DATABASE_URL` environment variable to its contents.
- After that the entrypoint starts the app (runs `npm start` by default).

Why this matters

- The app needs `DATABASE_URL` to connect to the database. If the value is missing or wrong, the app will fail to connect.

How you can give the secret to the container

- Use Docker Swarm secrets (recommended): create a secret called `database_url` and attach it to the service. Docker will place it at `/run/secrets/database_url` inside the container.
- Or mount a plain file into the container at `/run/secrets/database_url` (read-only). Good for local testing.
- Or set `DATABASE_URL` directly as an environment variable (e.g. `docker run -e DATABASE_URL=...`).

Quick examples

docker-compose (local file):

```yaml
services:
  app:
    image: your-image
    volumes:
      - ./secrets/database_url:/run/secrets/database_url:ro
    ports:
      - "3000:3000"
```

Create a Swarm secret and run (example):

```bash
echo -n "postgres://user:pass@db:5432/dbname" | docker secret create database_url -
docker service create --name app --secret database_url your-image
```

Quick checks when something goes wrong

- Look for the secret file inside the container:

```bash
docker exec -it <container> sh -c 'ls -l /run/secrets || true'
docker exec -it <container> sh -c 'cat /run/secrets/database_url 2>/dev/null || echo "no file"'
```

- Check if `DATABASE_URL` was set:

```bash
docker exec -it <container> sh -c 'printenv DATABASE_URL || echo "DATABASE_URL not set"'
```

If the secret file exists but `DATABASE_URL` is not set, make sure `docker-entrypoint.sh` is the image entrypoint and is executable.

What to do to fix common problems

- Missing file: add the secret (Swarm secret or mount the file).
- Wrong content: update the file/secret with the correct connection string.
- Permission denied: make the file readable by the container (mount as read-only is fine, but it must be readable).
- App still failing: check app logs for database connection errors.

How to test locally

```bash
mkdir -p ./secrets
echo -n "postgres://user:pass@db:5432/dbname" > ./secrets/database_url
docker run --rm -v "$PWD/secrets/database_url:/run/secrets/database_url:ro" your-image sh -c 'printenv DATABASE_URL'
```

If the command prints the URL, the entrypoint exported the secret correctly.

Notes and suggestions

- The entrypoint only handles `database_url`. Other secrets are not automatically read.
- Keep secret files out of source control and limit who can read them.
