Branching Strategy
==================

Overview
--------

This document describes the branch naming and workflow conventions used by the team to keep production stable while enabling parallel development.

Branches
--------

- `main` (Production-ready):
  - Always contain production-ready code.
  - Protected branch: requires passing CI, at least one code review approval, and no direct pushes.
  - Releases are created from `main` and tagged (e.g., `v1.2.3`).

- `develop` (Integration):
  - Integration branch where completed feature branches are merged for integration testing.
  - CI runs full integration and staging tests on merges to `develop`.
  - Periodically merged into `main` via release PR when ready.

- `feature/*` (New features):
  - Naming: `feature/<short-description>` (e.g., `feature/course-comments`).
  - Branch off `develop`.
  - Keep PRs small and focused; rebase or merge `develop` frequently to stay current.
  - Require CI green and at least one review before merging to `develop`.

- `hotfix/*` (Emergency fixes):
  - Naming: `hotfix/<short-description>` (e.g., `hotfix/fix-login-bug`).
  - Branch off `main` for urgent fixes.
  - After validation, merge back to `main` (release) and also merge changes into `develop` to keep history linear.
  - Require CI where possible; if CI is unavailable, perform manual verification steps and follow up with an immediate PR for audit.

Pull Request & Merge Rules
--------------------------

- PR Checklist:
  - Title and description explaining purpose and testing steps.
  - Linked issue or ticket (if applicable).
  - Tests added/updated and all CI checks passing.
  - At least one approving review from a teammate.

- Merge Strategy:
  - Prefer squash merges for feature branches to keep history compact, unless preserving granular commits is valuable.
  - Do not merge to `main` directly; use PRs and release processes.

Release Process
---------------

- Create a release PR from `develop` to `main` once integration tests pass and release notes are prepared.
- Tag releases on `main` (e.g., `v1.2.3`) and document changelog.
- Deploy from `main` using CI/CD; monitor health checks and have rollback steps ready.

Emergency Process
-----------------

- For urgent security or production issues, create `hotfix/*` from `main`, run minimal tests, and deploy after approval.
- After deployment, merge the hotfix into `develop` to avoid regression.

Notes
-----

- Keep branch names short and descriptive.
- Use issue IDs in branch names if your team prefers (e.g., `feature/123-add-comments`).

