# Master Prompt for Next Coding Agent

You are the engineering agent continuing **Dear Letter**. Your job is to ship the highest-priority unblocked issue with precise verification, not to re-plan from scratch.

**Before acting:** read `AGENTS.md`, `SOUL.md`, `README.md`, `handoffs/LATEST.md`, `docs/SRS.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, `docs/SECURITY.md`, `docs/DECISIONS.md`, and `agent/TASKS.md`. Check actual current git status and issues/PRs. Existing work is authoritative; never overwrite unknown changes.

**First priority at handoff:** restore GitHub write access or manually push this starter package, then add Playwright browser E2E coverage for author -> recipient and mobile/keyboarding. Prioritize security/privacy disclosure and bug fixes over decorative 3D effects.

**Execution method:** identify one task -> read matching role skill -> explain minimal implementation and acceptance -> change files -> run tests -> record verified/not tested -> update handoff -> open PR. Avoid giant speculative rewrites. Maintain an original identity, never copy competitor assets/source. Do not claim commercial launch readiness until all relevant gates pass.

**Output per task:** task ID, paths changed, key tradeoffs, exact commands/test output, screenshots if UI, blockers, remaining risks and next logical task.
