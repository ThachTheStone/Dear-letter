# LATEST HANDOFF — 2026-11-20

- Date: 2026-11-20
- Agent / role: Claude Code (Release/QA)
- Task ID: T-029 (fix CI), T-028 (now BLOCKED)
- Branch: `feat/v0.4-backend-https-staging` (based on `82750af`). Commit SHA: see `git log` for this branch; it was not recorded in the file because the commit includes this file.

## What happened

CI run 44546732675 on `82750af` failed before any test ran:

```
node --check src/drafts.js
Error: Cannot find module '.../src/drafts.js'  (MODULE_NOT_FOUND)
```

Commit `82750af` changed `package.json` to check `src/drafts.js`, `src/drafts-ui.js`, `src/letters-api.js`, `scripts/letter-store.mjs` and `scripts/letters-api.mjs`, but none of those files were committed. The commit only added docs and deploy config. The previous handoff said the v0.4 source existed only in a "generated downloadable package and patch". That package could not be found on the owner's machine (project folder, `D:\`, user profile) or on GitHub (branches, stashes, releases, workflow artifacts, issues, PRs). `feat/v0.2-multi-drafts` is also docs-only.

**The code in this repository is still v0.1.** The "35/35 tests passed" and other v0.2–v0.4 evidence in older docs came from another environment and is **not verified**.

## Changes in this commit

- `package.json`, `README.md`: restored from `main` (v0.1 `check` script and version). Removed the `bench` and `test:e2e` scripts because `scripts/benchmark.mjs` and `qa/` don't exist. Added a README section that points to the planned work.
- `docs/RELEASE_NOTES_v0.2.md`, `v0.3`, `v0.4`, `docs/SECURITY_AUDIT_v0.3.md`, `docs/DEPLOYMENT_STAGING_v0.4.md`: added a "Not implemented" banner.
- `docs/ARCHITECTURE.md`, `ROADMAP.md`, `SECURITY.md`, `SRS.md`, `TEST_PLAN.md`: v0.2–v0.4 sections relabelled as planned. SRS FR-005/FR-008 restored to their v0.1 wording.
- `docs/DECISIONS.md`: ADR-004/005/006 status changed to "Proposed — not implemented".
- `agent/TASKS.md`: T-011–T-016 and T-019–T-023 reset from DONE to TODO, T-028 set to BLOCKED, T-029 added.
- `Dockerfile`, `compose.staging.yml` and `deploy/Caddyfile` were left unchanged. **The Compose healthcheck calls `/healthz`, which the v0.1 server doesn't provide**, so the staging recipe won't work until the backend is built.

## Verification

- `npm run check` locally (Node ≥20): syntax checks pass, **6/6 tests pass**.
- Browser QA: not applicable (no UI change).

## Next highest-priority task

1. If the original v0.4 archive turns up, apply it on this branch, run `npm run check`, and remove the "Not implemented" banners for whatever ships.
2. Otherwise, rebuild from the specs in small PRs with tests. Start with T-011 (multi-draft library), then T-014/T-015 (v0.3 security), then T-019+ (backend). Each needs its own ADR confirmation and passing tests before its docs are marked DONE.

## Human approvals needed

- Decide whether to rebuild v0.2–v0.4 or drop those branches.
- Review and merge this branch. Not pushed to `main`.
