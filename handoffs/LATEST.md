# LATEST HANDOFF — Dear Letter v0.4 (2026-11-19)

## Source-of-truth and remote

Source for v0.4 in the generated downloadable package and patch; **GitHub main was previously verified at v0.1**, with a v0.2 release-note-only branch. Do not claim v0.4 code is remotely committed until SHA and GitHub tree are verified. The current environment cannot reach GitHub via `git`; it can read some GitHub data via connector, but cannot upload local source files using the container's git CLI.

## Implemented in this batch

- `scripts/letter-store.mjs`: bounded ciphertext-only JSON store (atomic file writes, one Node process, 2000 active records, 7d default TTL, hourly expiry sweeps, hashed revoke secret).
- `scripts/letters-api.mjs`: POST/GET/DELETE endpoints, bearer revocation, content type/size validation, per-IP quotas, no-store response.
- `scripts/server.mjs`: route /l/:id and /api/letters, optional HTTPS via local cert/key, reject non-TLS production without explicit trusted reverse-proxy flag, healthz, CSP connect-src 'self'.
- `src/letters-api.js`, `src/app.js`, `src/index.html`, `src/style.css`: short-link publication, v1 key kept in # fragment, v2 password path, sent list + revocation, error states, contrast, 44px targets. Legacy v1/v2 fragment read retained.
- `tests/letter-store.test.mjs`, `tests/letters-api.test.mjs`, `qa/https_smoke.mjs`, updated `qa/e2e_real.py`, `qa/a11y_audit.py`, `qa/browser_smoke.py`.
- `Dockerfile`, `compose.staging.yml`, `deploy/Caddyfile`, `docs/DEPLOYMENT_STAGING_v0.4.md`, release notes, ADR and SRS updates.

## Verification (precise)

- Node v22.16.0: `npm run check` **35 tests passed, 0 failed**; includes v1/v2 WebCrypto roundtrip via Node, persistence across process restart and revocation.
- Real TLS local (self-signed certificate explicitly trusted): `qa/https_smoke.mjs` PASS HTTPS + API create/get/decrypt/revoke.
- `python qa/a11y_audit.py`: PASS static semantic checks and 8 targeted color-contrast pairs all >=4.5:1; NOT full axe/manual a11y.
- `python qa/browser_smoke.py`: PASS DOM-only 1280/390/320 px, no horizontal scroll, draft interactions; mocked storage, NOT real HTTP/browser E2E.
- Chromium direct HTTPS navigation `https://127.0.0.1:4174`: FAIL `net::ERR_BLOCKED_BY_ADMINISTRATOR` in this tool environment.
- Brotli static transfer 8 current assets 17,333 bytes; 7 v0.3 assets 14,367 bytes. New functionality adds 20.6% transfer; no Core Web Vitals measurement.
- Compose/Docker NOT executed (Docker not installed in this environment). No public DNS/VM/HTTPS staging account supplied. No public deployment claimed.

## Important security / operational gaps

No sender identity, recipient identity, recovery for lost revoke token, moderation, transactional database, multi-instance support, fsync guarantee, measured high-load scaling, encrypted backup/restore, independent threat review, verified public domain/staging, axe or cross-browser/assistive-tech E2E. Browser-local drafts plaintext. Key-containing v1 URL fragments accessible to anyone with full link; weak v2 passwords vulnerable to offline guessing. Revocation stops *new* fetches, not copies already seen.

## Next agent task

1. Apply vetted v0.1→v0.4 patch to a branch created from current GitHub main (verify actual remote HEAD). Run `npm run check`, `python qa/a11y_audit.py`; push PR without touching workflow files if OAuth lacks workflow scope.
2. Provision genuine public staging with TLS/DNS and persistent volume, then run `qa/e2e_real.py` on a workstation with unrestricted browser navigation, plus axe/keyboard/assistive-technology testing. Validate restore and rollback.
3. Design Postgres migration/owner identity/recovery, abuse reporting, monitoring, legal privacy retention and incident response prior to customer onboarding.
