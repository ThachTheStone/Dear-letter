# Dear Letter v0.3: Security and Performance Hardening

> **⚠ Not implemented — status corrected 2026-11-20.** The source code this document describes was never committed to this repository; the branch contains v0.1 code only (`src/app.js`, `src/crypto.js`, `scripts/server.mjs`, 6 tests). Treat this as a design/specification. Test results and evidence below were reported from another environment and could not be verified here.

Status: **Development release; not approved for production deployment.**

## Delivered

- Optional password-protected shares (v2) built with PBKDF2 (600k) and AES-256-GCM, backwards compatible with original v1 links.
- Reader unlock screen, explicit warning to send password separately, clear decrypted letter/password from DOM when the dialog closes.
- Server static allowlist, HTTP security isolation headers, no-store HTML, Brotli/gzip and ETag/304 for assets, bounded cache and request limits.
- Prevent overlarge/malformed local draft JSON from being parsed; keep backwards compatibility.
- Batch live preview updates via `requestAnimationFrame` instead of synchronous per-keystroke updates.
- Security regression tests, compressed-asset tests, transfer-size benchmark, and 3 viewport Chromium DOM-only smoke checks.

## Validation

- Run `npm run check` and `python qa/browser_smoke.py`.
- Run `node scripts/benchmark.mjs` to inspect compressed transfer sizes.
- **Blocked:** real HTTP Playwright flow via localhost (`ERR_BLOCKED_BY_ADMINISTRATOR` here); must be run on a workstation before merge/release.

## Remaining risks

- v1 remains a bearer URL with the key in the fragment; v2 offline dictionary attack possible for weak passwords.
- Drafts remain unencrypted in browser localStorage.
- No server persistence, short links, deletion/revocation, accounts, audit logs, monitoring or moderation.
- This work is a targeted code review and automated test suite, not a complete penetration test or measured production performance audit.
