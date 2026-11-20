# Quality and Test Plan

## Automated now

`npm run check`: syntax check + `node --test tests/*.test.mjs`. Current tests cover empty body, input limits/allowlists, encoding round-trip, Unicode encryption, tamper rejection and invalid links.

## Mandatory browser acceptance (M1)

| ID | Steps | Expected |
|---|---|---|
| E2E-01 | Fill recipient/sender/title/body, select theme/font | Preview reflects all changes with line breaks |
| E2E-02 | Submit empty body | Required input error; no link |
| E2E-03 | Write Unicode + emoji, generate URL, open in clean browser context | Recipient can open and read exact text |
| E2E-04 | Corrupt fragment bytes | Safe error, no HTML injection |
| E2E-05 | Save draft, reload, clear | Draft restored then removed only when explicitly requested |
| E2E-06 | Disable Clipboard permission | Manual selection fallback works |
| E2E-07 | Test 320/375/768/1280 px | No critical overflow; interactive controls usable |
| E2E-08 | Keyboard Tab/Shift-Tab/Enter/Escape | Dialog keyboard accessible, visible focus, logical order |
| E2E-09 | `prefers-reduced-motion: reduce` | No unnecessary motion |
| E2E-10 | 3,000-char Vietnamese/emoji message | Clear URL size feedback when necessary |
| E2E-11 | Cross-browser Chromium/Firefox/WebKit | Core flows consistent |
| E2E-12 | Inspect network for letter content | No plaintext letter API requests in v0.1 |

## Future tests

API contract tests, property-based input fuzzing, auth/ownership negatives, abuse/rate-limit controls, media security tests, backup restore, payment webhook signature/idempotency/reconciliation, load testing and canary rollback.

## Quality gates

No severity 1/2 known defects, CI green, keyboard review done, mobile browser checked, privacy notices reviewed, no credentials or customer data in logs. Test report must include platform/browser/version and real evidence — do not mark unexecuted browser tests as passed.

## Draft library (T-011 / FR-005)

| Test | Command | Coverage |
|---|---|---|
| Unit | `npm run check` (`tests/drafts.test.mjs`, 13 tests) | create/update, 12-draft cap, legacy migration, no write on load, delete/clear, corrupt/oversized storage, untrusted entries, storage quota failure |
| Browser smoke | `npm run dev`, then `node qa/drafts-smoke.mjs "<chrome path>"` | 19 checks in headless Chrome: legacy migration, update, confirm/cancel flows, HTML-as-text, 12-cap, delete/clear, corrupt data, encrypt→open link, 1280/390/320px layout and 44px targets, no console errors |

Not covered: real screen reader, Firefox/WebKit, manual keyboard-only pass.

## Vietnamese diacritics (T-012 / NFR-008)

| Test | Command | Coverage |
|---|---|---|
| Unit | `npm run check` (`tests/drafts.test.mjs`) | NFD input saved and returned as NFC |
| Browser smoke | `npm run dev`, then `node qa/diacritics-smoke.mjs "<chrome path>"` | 8 checks in headless Chrome: NFD input previewed as NFC, no combining marks left, serif stack not led by Georgia, font Chrome actually used (`CSS.getPlatformFontsForNode`) is not Georgia for body/title/signature, no horizontal scroll at 390px, no console errors; screenshots at 1280/390px plus a Georgia "before" for comparison |

Not covered: macOS/iOS/Android font availability (stack falls back to Noto Serif / Cambria / Palatino Linotype), Firefox/WebKit. Links created before this fix from NFD input are decrypted as-is (not re-normalized).
