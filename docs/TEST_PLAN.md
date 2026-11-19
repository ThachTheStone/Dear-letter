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

## v0.4 test matrix

| Test | Command | Evidence/limitation |
|---|---|---|
| Syntax, crypto, draft, server, storage, API integration | `npm run check` | 35/35 passed in Node 22 |
| Local HTTP real encryption and short-link revocation | `npm test` (`tests/letters-api.test.mjs`) | Passed for v1, v2, wrong password, owner revoke, restart |
| TLS full API roundtrip | `NODE_EXTRA_CA_CERTS=qa/certs/local.crt DEAR_URL=https://127.0.0.1:4174 node qa/https_smoke.mjs` | Passed with explicitly trusted local self-signed cert |
| Semantic labels + targeted WCAG contrast | `python qa/a11y_audit.py` | Passed targeted static rules; not full WCAG compliance |
| Chromium DOM UI 1280, 390, 320 px | `python qa/browser_smoke.py` | Passed via `set_content` and mocked storage, NOT real navigation |
| Real browser HTTPS short-link v1/v2 + revoke | `DEAR_URL=https://staging.example.com python qa/e2e_real.py` | BLOCKED here: `ERR_BLOCKED_BY_ADMINISTRATOR`; run on real staging |
| Screen readers, axe, keyboard-only, customer environment | manual QA | NOT performed; remains blocking |

Do not report E2E/a11y fully passed from Node and DOM-only tests.
