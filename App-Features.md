App Features
============

Core Features
-------------

- User Authentication: secure sign-up, login, logout, password reset, and session management so students can access their accounts and resume progress.
- Course Catalog & Enrollment: browse available courses, view course details, and enroll or unenroll from courses.
- Progress Dashboard: view completed lessons, quiz scores, course progress percentage, and actionable next steps.
- Discussions & Comments: ask questions on lesson pages and participate in threaded discussions with peers and instructors.

System Needs (Technical Requirements)
------------------------------------

- Persistent Database: a relational database (Postgres recommended) available via `DATABASE_URL` to store users, courses, lessons, progress, and grades.
- Secure Configuration: runtime-managed secrets (environment variables or secret manager), TLS for web traffic, and least-privilege credentials.
- CI / Test Runner: automated CI that runs unit, integration, and end-to-end tests on PRs before merge.

Developer-facing Notes
----------------------

- Keep a `.env.example` in the repo with placeholder keys; never commit real secrets.
- Local dev can use docker-compose to bring up the DB and local object storage emulator when needed.
- Add new features behind feature flags when possible to enable safe rollout.
