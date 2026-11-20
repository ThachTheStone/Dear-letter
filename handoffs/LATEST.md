# LATEST HANDOFF — 2026-11-20

- Date: 2026-11-20
- Agent / role: Claude Code (Frontend + QA)
- Task: T-011, multi-draft library (FR-005)
- Branch: `feat/t011-draft-library`, based on `main` `1ffe40d`. Commit SHA: see the branch's `git log`; it isn't recorded here because the commit includes this file.

## Context

The v0.2–v0.4 code described on `feat/v0.2-multi-drafts` and `feat/v0.4-backend-https-staging` was never committed (see the handoff on the v0.4 branch). This branch rebuilds v0.2's draft library from scratch, starting from v0.1 `main`.

## Changed paths

- `src/drafts.js` (new): pure storage module that takes any Storage-like object. Key `dear-letter:drafts:v2` (`{version:2, drafts:[…]}`), maximum 12 drafts, 32-hex-character IDs from `crypto.getRandomValues`, which also works on plain-HTTP origins. Fields are sanitised against the existing theme/font allowlists and length caps. Stored data that is corrupt, wrong-shaped or over 200k characters is reported and never overwritten.
- `src/app.js`: replaced the single draft with the library UI: save (create/update), "Thư mới", per-row "Mở"/"Xóa", "Xóa tất cả", unsaved-change confirmation, cross-tab `storage` sync, and a message when storage is blocked. All draft text is set with `textContent` or `createElement`; no `innerHTML`.
- `src/index.html`: "Xóa nháp" replaced by "Thư mới" plus a "Bản nháp đã lưu" section. The privacy text now says drafts aren't encrypted.
- `src/style.css`: draft list styles, 44px targets, stacked layout under 630px.
- `tests/drafts.test.mjs` (new): 12 unit tests.
- `qa/drafts-smoke.mjs` (new): headless Chrome smoke test over the DevTools protocol. No dependencies; needs Node ≥22.
- `package.json` (`check` now includes `src/drafts.js`), `README.md`, `docs/SRS.md` (FR-005 plus acceptance criteria a–f), `docs/TEST_PLAN.md`, `agent/TASKS.md`.

## Behaviour decisions

- The editor is **not** auto-filled on load (v0.1 restored the draft automatically). Drafts are listed and the author opens one. This avoids surprise content and any writes on load.
- A v0.1 draft shows as "Bản nháp cũ". It converts to the new format only when the author saves it, and the old key is removed only after that write succeeds. If storage is full, the old draft is kept.
- Deleting the draft that's open in the editor keeps the editor text but marks it unsaved, so the next save creates a new draft.
- "Xóa tất cả" deletes saved drafts only and keeps the letter being written.
- Confirmations use native `window.confirm`.

## Verification

- `npm run check`: syntax OK, **18/18 tests pass** (6 crypto + 12 drafts).
- `node qa/drafts-smoke.mjs "C:/Program Files/Google/Chrome/Application/chrome.exe" http://127.0.0.1:4180/` against `npm run dev`: **19/19 pass** on headless Chrome 157. Includes legacy migration, update, confirm and cancel paths, HTML injection shown as text, the 12-draft cap, delete and clear, corrupt storage, encrypt → open link → read, and layout at 1280/390/320px (rows inside the panel, no horizontal scroll, targets ≥44px) with no console errors.
- The screenshots showed draft rows overflowing the panel (a grid `min-width:auto` issue). It's fixed, and the smoke test now checks containment.
- **Not done:** real screen reader, Firefox/WebKit, manual keyboard-only pass. The Claude in Chrome extension wasn't connected, so the test ran headless rather than interactively.

## Known issues

- Drafts are plaintext in `localStorage` (documented in the UI and SRS).
- T-012 (new, pre-existing since v0.1): Vietnamese diacritics render detached in the Georgia/italic preview text (for example "mến" shows as "mê´n"). The static template text has it too, so this branch didn't introduce it.

## Next

1. Review and merge this branch into `main` via PR.
2. Then T-012 (diacritics) or T-005 (manual accessibility pass).
3. Decide what happens to the docs-only `feat/v0.2-multi-drafts` and `feat/v0.4-backend-https-staging` branches. Their v0.2 claims are now covered by this branch.
