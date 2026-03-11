# Architecture Overview

This document is a living template to help contributors and agents rapidly understand the codebase structure, key components, data flows, and operational considerations. Update this file as the project evolves.

Last updated: 2026-02-27

## 1. Project Structure

The repository is primarily a full-stack Next.js application with Prisma for data persistence and Docker tooling for local development and deployment.

[Project Root]/
- App-Features.md
- BRANCHING-STRATEGY.md
The repository is primarily a full-stack Next.js application that uses PostgreSQL for data persistence and Docker tooling for local development and deployment.
- docker-compose.yml
- package.json
- scripts/sql/           # SQL migrations and baseline
- README.md
- ARCHITECTURE.md        # (this file)
This document is a living template to help contributors and agents rapidly understand the codebase structure, key components, data flows, and operational considerations. Update this file as the project evolves.
Notes:
- The presence of `pages/` suggests Next.js for the UI and possibly server-side/API routes.
This repository includes a minimal Next.js app plus a PostgreSQL service and a Docker Compose setup configured for reliable local development.
- `Dockerfile` and `docker-compose.yml` provide containerized development and deployment patterns.

## 2. High-Level System Diagram

Text diagram (simple):

[User] <--> [Next.js Frontend (pages/)] <--> [Server/API (Next.js API routes or separate Node service)] <--> [Postgres (Prisma)]

Description: Handles business logic and data access. This can be implemented as Next.js API routes (inside `pages/api` if present) or as a separate Node/Express service. It accesses the primary PostgreSQL database directly using SQL or a lightweight DB client.

## 3. Core Components

### 3.1. Frontend
Type: PostgreSQL (compatible with Neon or other hosted Postgres providers)
Name: Web Application (Next.js)

Key Schemas/Tables: users, sessions, any domain entities defined in the SQL baseline files under `scripts/sql/migrations`.

Technologies: Next.js, React, HTML/CSS/JS
Database Migrations (SQL baseline):

Migrations are provided as SQL files under `scripts/sql/migrations` and applied idempotently by `scripts/apply_sql_migration_neon.sh`. To apply locally or to Neon, set `DATABASE_URL` and run the script.

```bash
export DATABASE_URL="postgresql://<user>:<pw>@<host>:5432/<db>"
./scripts/apply_sql_migration_neon.sh
```

Description: Handles business logic and data access. This can be implemented as Next.js API routes (inside `pages/api` if present) or as a separate Node/Express service. It uses Prisma to access the primary database.

Technologies: Node.js, Next.js API routes or Node/Express, Prisma ORM

Deployment: Docker container(s), or serverless functions (if using platform-specific deployment).

## 4. Data Stores

### 4.1. Primary Database

Name: Application Database

Type: PostgreSQL (inferred from Prisma and common Docker Compose setups)

Purpose: Stores application data such as users, application state, and domain models defined in `prisma/schema.prisma`.

Key Schemas/Tables: (examples you should find in `prisma/schema.prisma`) users, sessions, any domain entities defined there.

### 4.2. Local Secrets / Files

Name: Local secrets folder

Type: Files (not committed)

Purpose: Holds local plaintext helper files (e.g., `secrets/database_url.txt`). Keep this out of version control and use environment variables / secret managers in production.

## 5. External Integrations / APIs

No explicit third-party integrations are visible in the repository listing. Typical candidates to add here if used:
- Stripe (payments)
- SendGrid / Mailgun (email)
- SSO providers (OAuth/OIDC)

Integration method: REST APIs or vendor SDKs.

## 6. Deployment & Infrastructure

Cloud Provider: Not specified in repo — deployment is cloud-agnostic.

Key Services / Patterns:
- Containerization: `Dockerfile` and `docker-compose.yml` for local development and production builds.
- ORM: Prisma manages DB schema and migrations.

CI/CD: No CI pipeline files were detected in the root listing. Recommended: GitHub Actions workflows or a Docker-based CI pipeline.

Monitoring & Logging: Not present in repo — consider integrating tools like Prometheus, Grafana, or hosted solutions (Datadog, Sentry) depending on needs.

## 7. Security Considerations

- Secrets: Do not commit files from `secrets/`. Use environment variables and a secrets manager for production.
- Transport: Use TLS for all external traffic in production.
- Authentication/Authorization: Not explicitly present. Recommended patterns: JWT or session cookies with CSRF protections for web routes; RBAC for internal permissions.
- Database credentials: Store in environment variables or secret store (e.g., AWS Secrets Manager, HashiCorp Vault).

## 8. Development & Testing Environment

Local Setup (quick steps):

1. Install Node.js and Docker.
2. Copy or configure environment variables (example files in `secrets/` are local artifacts).
3. Start DB and app via Docker Compose:

```bash
docker-compose up --build
```

4. Run app locally (if not using Docker):

```bash
npm install
npm run dev
```

Database Migrations (Prisma):

```bash
npx prisma migrate dev
npx prisma generate
```

Testing Frameworks: Not present in the listing; common choices: Jest for JS/TS unit tests, Playwright or Cypress for E2E.

Code Quality Tools: ESLint, Prettier, TypeScript (optional) recommended.

## 9. Future Considerations / Roadmap

- If the app grows, consider splitting UI and API into separate services (microservices) or deploying backend functions separately for better scaling.
- Add CI/CD pipelines, automated tests, and monitoring.
- Consider replacing plaintext `secrets/` usage with a proper secret management system.

## 10. Project Identification

Project Name: BrightPath Pipeline

Repository URL: (insert repository URL)

Primary Contact/Team: Nakerra (Nikki)

Date of Last Update: 2026-02-27

## 11. Glossary / Acronyms

Prisma: A modern ORM for Node.js and TypeScript.

SSR: Server-Side Rendering.

SSG: Static Site Generation.

DB: Database.

API: Application Programming Interface.

---

Notes and next steps:
- Add more specific component lists and diagrams as the codebase grows (draw a C4 diagram if helpful).
