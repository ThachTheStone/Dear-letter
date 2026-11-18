# AGENTS.md — Mandatory Operating Contract

Scope: every directory in this repository. Read before making any code or documentation changes.

## Start every agent session

1. Read `README.md`, `SOUL.md`, `handoffs/LATEST.md`, `docs/SRS.md`, `docs/ROADMAP.md`, `docs/DECISIONS.md`.
2. Inspect the current tree/HEAD, open issues, in-flight PRs, and CI status. Do not presume the repository remains empty.
3. Select only the next highest-priority unblocked task. Write a concrete plan with validation steps; prefer vertical slices that can be demonstrated.
4. Check relevant skill file under `skills/` before implementation.
5. Record blockers, changed paths, commands/results, follow-up tasks and commit SHA in `handoffs/LATEST.md`.

## Rules of execution

- Existing user changes are authoritative; never overwrite unknown changes.
- No source/asset/code copying from dearr.app or other competitors. Build our own content and UI.
- **No production payment/PII processing without security review** and explicit documented requirements.
- Build accessible, mobile-first, privacy-conscious UI; no dark patterns.
- Validate all external inputs; use textContent for untrusted text; never use `innerHTML` with letter content.
- Never insert keys, tokens, credentials or real customer data in commits, issues, test fixtures, screenshots or logs.
- Use minimal dependencies; avoid adding framework or database without an ADR and clear migration rationale.
- Aim for small PRs with tests. No unreviewed pushes to `main` unless explicitly permitted by the human owner.
- Do not silence failing tests. Update docs and tests when behavior changes.
- Distinguish verified implemented behavior from speculative requirements; no fabricated evidence.

## Engineering definition of done

- User-facing acceptance criteria demonstrably met.
- `npm run check` passes and browser smoke test performed for UI-affecting changes (or explicitly listed as blocked).
- No high/critical unresolved security findings and no known severe accessibility blockers.
- Error states, empty states, mobile viewport, keyboard controls and Unicode tested.
- README, SRS, ADR (as appropriate) and handoff updated.
- CI green, reviewer approved, rollback path understood before release.

## Roles and their skills

- Product/planner: `docs/SRS.md`, `docs/ROADMAP.md`, `docs/RESEARCH.md`.
- Frontend: `skills/frontend/SKILL.md`.
- AppSec/privacy: `skills/security/SKILL.md`.
- QA: `skills/qa/SKILL.md`.
- Release/infra: `skills/release/SKILL.md`.

## Task handling

Keep a single source of truth: GitHub Issues (when enabled) or `agent/TASKS.md`. Mark statuses `TODO`, `IN_PROGRESS`, `BLOCKED`, or `DONE`. Do not start dependent tasks before prerequisites. Use the handoff template in `agent/HANDOFF_TEMPLATE.md`. If an agent lacks a tool permission, report the exact failed action, persist all work as local deliverables, and explicitly flag the unpushed state.
