# Dear Letter v0.3 — Security and Performance Audit

> **⚠ Not implemented — status corrected 2026-11-20.** The source code this document describes was never committed to this repository; the branch contains v0.1 code only (`src/app.js`, `src/crypto.js`, `scripts/server.mjs`, 6 tests). Treat this as a design/specification. Test results and evidence below were reported from another environment and could not be verified here.

Date: 2026-11-19. Scope: this repository's static client and Node development server, excluding third-party production hosting. This is a manual source review with automated regression coverage; **not** an independent penetration test.

## Findings and mitigations

| ID | Severity | Finding in v0.2 | v0.3 mitigation | Residual risk |
|---|---|---|---|---|
| SEC-01 | HIGH | The v1 share URL includes the AES-GCM raw key and encrypted text in the fragment; anyone obtaining the complete URL can decrypt. | Added optional **v2 password-protected links**: PBKDF2-HMAC-SHA-256 (600,000 iterations, random 128-bit salt) derives a 256-bit AES-GCM key; the URL only contains salt, nonce and ciphertext; no key or passphrase. v1 remains supported. | v1 remains bearer-link; user can choose v1; v2 can be cracked offline if users choose weak passwords; no recipient identity verification; password must travel separately |
| SEC-02 | MEDIUM | The dev server serves arbitrary publicDir files based on paths; accidentally placed secrets could become public. | Explicit route allowlist, disallow symlinks/unlisted names, request length cap, 405/414/404 with safe headers, server timeouts. | Production static hosting configuration must be reviewed independently |
| SEC-03 | MEDIUM | Browser isolation/security headers incomplete. | Add `frame-ancestors 'none'`, COOP, CORP, Permissions-Policy; retain strict self-only CSP, nosniff, no-referrer and frame denial. | HSTS/HTTPS must be configured at the public TLS edge, not for HTTP localhost; CSP depends on deployment |
| SEC-04 | MEDIUM | Browser `localStorage` may contain malicious/corrupt giant JSON causing expensive parsing. | Bound text size before JSON.parse, handle invalid draft letter types safely and cap serialized size. | Existing local drafts remain **plaintext**; extensions, XSS on origin, or users of same browser profile can read them |
| SEC-05 | LOW | Decrypted letter remains in the DOM after reader dialog closes. | Clear reader text and password input on dialog close, guard delayed envelope animation. | Browser history/complete URLs remain available to the device owner and extensions |
| SEC-06 | LOW | The UI renders preview on every input event; expensive extra work on rapid keystrokes. | Batch preview render to one animation frame; avoid unneeded `className` writes and `FormData` creation. | Not yet profiled under large DOM stress in real HTTP browser |
| PERF-01 | MEDIUM | All static content sent uncompressed with `Cache-Control: no-store`. | Cache bounded allowlisted static files in server memory with Brotli/gzip, ETag/304 and revalidation; keep HTML `no-store`. | Needs CDN/staging metrics, memory budget monitoring and cache invalidation review when using another host |

### Cryptography specifics

* `v1`: `#letter=v1.<iv>.<ciphertext>.<rawKey>` — **no passphrase required**. It is encrypted but not confidential against someone who receives the full link.
* `v2`: `#letter=v2.<salt>.<iv>.<ciphertext>` — password is not embedded in link, key derived from user-entered passphrase by WebCrypto PBKDF2-SHA-256 600k and AES-GCM. Salt is random 16 bytes, IV random 12 bytes. Wrong password or tampered content fails authenticated decryption.
* Minimum password length 12, maximum 128 characters; length **alone is not a password strength guarantee**. Recommend long random passwords or 5+ randomly selected words. No password is stored or recoverable by the server.
* No account identity proof, link revocation, expiry, moderation, or server-side persistence. A secure commercial product still requires a backend design and independent threat model.

### Browser/app safety

* Untrusted letter and draft text is set with `textContent`, not HTML parsing; allowlisted themes/fonts prevent use as code; CSP prevents inline scripts/eval.
* `sessionStorage` is not used for password caching. Browser password managers/extensions and compromised devices remain outside the security boundary.
* Local drafts remain plain text only after explicit save, which is communicated near the UI.
* `connect-src 'none'` blocks application fetch/XHR; future APIs require CSP review.

## Performance measurement

Run: `BASELINE_DIR=/path/to/v0.2 node scripts/benchmark.mjs` (on Windows PowerShell: `$env:BASELINE_DIR='C:\path\to\v0.2'; node scripts/benchmark.mjs`).

Measurement at local Node 22.16.0, 7 GETs (`/`, 5 JS/CSS assets, `favicon.svg`) advertising Brotli and gzip, measuring **payload bytes only** (no request/response header overhead):

| Metric | v0.2 baseline | v0.3 |
|---|---:|---:|
| Transferred bytes | 40,843 | 14,367 |
| Relative reduction | — | **64.8%** |

This is a reproducible transfer-size comparison, **not** a site speed/Core Web Vitals/throughput guarantee. Browser network, mobile CPU and CDN results may differ. Brotli compresses repeated text well; large media uploads are out of scope.

## Verification evidence

* `npm run check` (Node 22): 24 tests passed after security feature changes (re-run for final numbers).
* `python qa/browser_smoke.py` using local HTML/CSS and mocked storage in Chromium: 1280px, 390px, 320px passed. This does not validate network or browser WebCrypto.
* `python qa/e2e_real.py` was attempted against local server but Chromium navigation failed with `ERR_BLOCKED_BY_ADMINISTRATOR`. **Real HTTP/browser end-to-end is NOT validated here.**

## Production security acceptance criteria (BLOCKING)

1. Real Chrome/Firefox/Safari HTTPS E2E for v1, v2 success/failure, assistive technology and keyboard focus.
2. HTTPS with HSTS at edge (after verifying HTTPS domain), CSP as deployed, safe permissions, secrets scanning and independent dependency/SAST/DAST review.
3. Abuse reports/content moderation, retention/deletion policy, consent and privacy notice approved.
4. Short, revocable links and owner-controlled retention with documented backend threat model.
5. Monitoring alerting without logging sensitive query/hash/letter/password contents, backup/restore drills and incident response.

References: [OWASP Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) (600k PBKDF2-HMAC-SHA256) and [OWASP Secure Headers Project](https://secure-headers-project.owasp.org/best-practices/).
