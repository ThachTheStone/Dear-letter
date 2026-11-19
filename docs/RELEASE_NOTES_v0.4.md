# Dear Letter v0.4 — Revocable short links and staging readiness

Date: 2026-11-19. Status: **code complete for controlled local beta; NOT public-production ready**. Exact command results and current blocker are in `handoffs/LATEST.md`.

## Shipped locally

- `POST /api/letters`: accepts only bounded `v1.IV.ciphertext` or `v2.salt.IV.ciphertext`, never raw keys or passwords. Generates 144-bit random ID and 256-bit revoke secret. Validates TTL 1–30 days; UI uses 7 days.
- `GET /api/letters/:id`: returns sealed ciphertext and expiry, `Cache-Control: no-store`; revoked/expired letters return 404.
- `DELETE /api/letters/:id`: requires revocation secret via Authorization bearer; stores only SHA-256 hash and compares in constant time.
- `GET /l/:id`: serves app reader shell; v1 key stays in `#key=...` fragment, v2 requires a separately sent password. Legacy `#letter=v1/v2` URLs still decode.
- Single-process atomic JSON storage with bounded records and hourly expiry cleanup (not durable/fault-tolerant across replicas).
- UI lists sent letters and allows revocation, with capability stored in browser localStorage. If localStorage fails during publication, attempts immediate revocation rather than publishing an irrecoverable link.
- Basic per-IP quotas, payload cap, stricter static routes, API CSP connect-src self; Node optional TLS, TLS/edge production gate, Compose/Caddy staging recipe.
- WCAG contrast remediation for sampled critical text; 44px interaction targets; static semantic audit.

## Evidence

- `npm run check`: 35/35 Node tests passed.
- `python qa/browser_smoke.py`: mocked DOM interactions 1280/390/320px passed; **not actual network/WebCrypto browser E2E**.
- `python qa/a11y_audit.py`: static semantic checks + selected contrast checks passed; axe, screen reader and full keyboard test **not done**.
- `NODE_EXTRA_CA_CERTS=... DEAR_URL=https://127.0.0.1:4174 node qa/https_smoke.mjs`: TLS handshake, same-origin API, WebCrypto encrypt/decrypt + revoke passed. Certificate self-signed and explicitly trusted only by the test process.
- Browser HTTPS E2E attempted: Chromium `ERR_BLOCKED_BY_ADMINISTRATOR`; **blocked**, not a pass.
- Brotli static payload 8 assets: **17,333 bytes** v0.4 versus 7 assets: **14,367 bytes** v0.3 (+20.6%) due to new functionality. Asset sets differ. These are transfer bytes on local Node, NOT LCP/INP/TTFB/Core Web Vitals.

## Residual issues blocking customer launch

1. No authenticated sender account: anyone who loses their local revocation token cannot regain it; no sender/recipient identity verification.
2. Persistent JSON is for ONE server instance, not transactional production data storage; storage capacity, crash consistency, backups, disaster recovery, retention and purge must be reviewed.
3. No public HTTPS staging deployment (DNS/host not connected here), no real browser E2E, axe, keyboard or assisted technology completion, no independent security review.
4. Abuse reporting/moderation, support process, privacy/terms consent, audit/monitoring and operational controls not complete.
5. v1 bearer link key in fragment can be copied/leaked; v2 weak passphrase can be cracked offline; neither mode can erase copies a recipient has already opened.
6. Local draft plaintext, revocation capabilities in localStorage, CSP and extension/browser compromise limitations remain.
