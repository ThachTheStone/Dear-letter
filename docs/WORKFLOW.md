# Collaboration Workflow (humans + AI agents)

## Work intake

Issue contains goal, requirement ID, screenshots/reference when applicable, out-of-scope, acceptance criteria, test commands and risk. Work only on issues marked `ready`. Pick one task; do not parallel-edit the same files without coordination.

## Branches and pull requests

`feat/<issue>-short-title`, `fix/<issue>-short-title`, `docs/<issue>-short-title`. PR description: summary, requirements covered, changed files, test evidence, screenshots for visual changes, security/accessibility implications, migration/rollback and open risks. Human review before merge. Prefer squash merge.

## Agent concurrency

Planner owns backlog/docs; frontend owns `src/index.html`,`style.css`,`app.js`; security reviews `crypto.js`, auth and privacy; QA owns `tests/` and browser evidence; release agent owns deployment. Shared code changes require explicit coordination via issue/PR. Never assume absence of conflict based on chat context alone.

## Handoff

Every agent updates `handoffs/LATEST.md` and links PR/issue + commit. Include what was verified vs unverified, exact commands and next task, avoiding generic 'everything works' statements.

## Conflict resolution

Security > correctness > accessibility > performance > aesthetic polish. Escalate scope additions, backend/storage model changes, licensing issues and real customer billing to project owner for approval.
