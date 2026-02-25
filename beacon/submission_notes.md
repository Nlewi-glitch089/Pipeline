# Beacon Submission Notes

This folder contains artifacts and the notes required for the Beacon submission demonstrating Level-10 look-fors.

Artifacts generated here:

- `docker_compose_ps.txt` — output of `docker compose ps` showing services and health status.
- `app_logs.txt` — recent `docker compose logs app` output confirming app started.
- `images.txt` — `docker images` showing built images (pipeline-app).

Suggested screenshots to capture (filenames):
- `screenshot_compose_ps.png` — capture terminal with `docker compose ps` showing both services healthy.
- `screenshot_app_browser.png` — browser screenshot of http://localhost:3000 showing the app.
- `screenshot_compose_logs.png` — terminal screenshot showing `docker compose logs -f` with app ready and db healthy.

Commands to capture text artifacts (already executed):

```bash
docker compose ps --no-color > beacon/docker_compose_ps.txt
docker compose logs --no-color --tail=200 app > beacon/app_logs.txt
docker images --no-trunc > beacon/images.txt
```

How to take screenshots on Windows:

- Open a terminal and run `docker compose ps` then use Snipping Tool or PrtSc to capture and save as `screenshot_compose_ps.png`.
- Open http://localhost:3000 in a browser and capture `screenshot_app_browser.png`.
- In terminal run `docker compose logs -f` and capture `screenshot_compose_logs.png`.

Notes to include in Beacon submission:

- Short description of branching strategy: trunk-based with short-lived feature branches and protected `main`.
- Steps to reproduce: copy `.env.example` -> `.env` (or set Docker secrets per README), `docker compose build`, `docker compose up -d`, wait for services to be healthy.
- Confirmation that migrations can be run inside the container: `docker compose exec app npm run prisma:generate` and `docker compose exec app npx prisma migrate dev`.
