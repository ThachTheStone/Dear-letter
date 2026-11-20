# LATEST HANDOFF — 2026-11-20

- Date: 2026-11-20
- Agent / role: Claude Code (planner, reviewer, QA). Code for T-012 written by DeepSeek (`deepseek-v4-flash`) through the Cline CLI 3.0.74, from a scoped brief, then reviewed and verified by Claude Code.
- Task: T-012, Vietnamese diacritics in the serif preview (NFR-008)
- Branch: `feat/t012-vietnamese-diacritics`, based on `main` `246bbb7` (merge of PR #1). Commit SHA: see the branch's `git log`; it isn't recorded here because the commit includes this file.

## Done today

- PR #1 (T-011 draft library) merged into `main` as merge commit `246bbb7`, with the owner's approval in the session. CI was green.
- T-012 implemented and verified (below).
- Old branches reviewed:
  - `feat/v0.2-multi-drafts`: one release-notes file that T-011 supersedes. It also claims an envelope animation that was never built. Archived as tag `archive/feat-v0.2-multi-drafts`, and the remote branch was deleted.
  - `feat/v0.4-backend-https-staging`: kept. It has proposed ADR-004/005/006 and staging `compose.staging.yml` and `deploy/Caddyfile`. Those reference a Dockerfile and `/healthz` that don't exist. New task T-014 moves the useful docs into `main` as *Proposed*, then deletes the branch.

## Root cause

The source text was already NFC. Georgia has no glyphs for Vietnamese precomposed letters (U+1EA0–U+1EF9, e.g. `ế` U+1EBF), so the browser built them from a base glyph plus a separately positioned mark. That produced "mê´n".

## Changed paths

- `src/style.css`: new `--serif-vi` token on `:root` (`'Times New Roman','Noto Serif','Cambria','Palatino Linotype',Georgia,serif`). All 11 Georgia-first `font-family` declarations now use it. No other rules changed.
- `src/app.js`: `read()` returns `.normalize('NFC')`, so preview, save, dirty-check and encryption all get NFC.
- `src/drafts.js`: `clip()` normalizes to NFC before capping length, so stored drafts are NFC.
- `tests/drafts.test.mjs`: one new test (NFD in, NFC out, including the raw stored JSON).
- `qa/drafts-smoke.mjs` unchanged; `qa/diacritics-smoke.mjs` (new): 8-check headless Chrome test. It uses `CSS.getPlatformFontsForNode` to confirm the font actually used isn't Georgia, and saves before/after screenshots.
- `README.md`, `docs/SRS.md` (NFR-008 note), `docs/TEST_PLAN.md`, `agent/TASKS.md` (T-012 DONE; T-013 and T-014 added).

## Verification

- `npm run check`: syntax OK, **19/19 tests pass** (6 crypto + 13 drafts).
- `node qa/drafts-smoke.mjs "C:/Program Files/Google/Chrome/Application/chrome.exe" http://127.0.0.1:4180/`: **19/19 pass** (no T-011 regressions).
- `node qa/diacritics-smoke.mjs ... http://127.0.0.1:4180/`: **8/8 pass**. Chrome on Windows draws the preview body, title and signature with Times New Roman. The screenshots show "Mến", "mến" and "ế ữ ặ ỗ ị" intact at 1280px and 390px. The forced-Georgia "before" screenshot reproduces "Mê´n".
- **Not done:** macOS, iOS and Android font availability (the stack falls back to Noto Serif, Cambria, then Palatino), Firefox/WebKit, and a manual screen-reader check.

## Known issues

- Links created before this fix from NFD input aren't re-normalized when decrypted. They now show in the Vietnamese-capable font, so they should render correctly anyway.
- T-013 (new, pre-existing): the paper corner ✿ overlaps the heading ♡.
- Drafts are plaintext in `localStorage` (documented).

## Next

1. Review and merge the T-012 PR.
2. T-005: manual accessibility pass (needs a human tester to sign it off).
3. T-014: move the v0.4 proposed ADRs into `main`, then delete that branch.
