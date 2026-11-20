> Planned v0.3 audit: [SECURITY_AUDIT_v0.3.md](SECURITY_AUDIT_v0.3.md) — describes code not present in this repository. The sections below describe the current v0.1 threat boundary.

# Security, Privacy and Threat Model

## Existing protection and scope

- AES-256-GCM via Web Crypto with randomly generated key and 96-bit IV per link.
- Ciphertext, IV and raw key included inside the `#fragment`, so they are not transmitted as part of ordinary HTTP request paths. The link **is a bearer secret**.
- No server-side letter storage in v0.1.
- User text displayed with `.textContent` and CSS `white-space: pre-wrap` (no HTML interpretation).
- Static dev server applies a restrictive CSP, `nosniff`, `no-referrer` and frame denial.
- Browser local draft is plaintext and opt-in; device access and malicious extensions can expose it.

## Threats, tradeoffs and mandatory mitigations

| Risk | What happens | Mitigation / release requirement |
|---|---|---|
| Shared URL is forwarded or logged externally | Anyone holding it reads the message | Explicit bearer-link disclosure, no public analytics; revocation requires backend redesign |
| Browser extension / malware / XSS | Reads plaintext/key from page | strict CSP, dependency review, trusted rendering, browser QA; cannot defend against compromised device |
| Browser history, screen recording and previews | Full link or plaintext may be exposed | educate users; design short-token architecture and secure sharing semantics before commercial launch |
| Drafts in localStorage | Plain text accessible to local browser context | opt-in, explicit clear; do not promise encrypted local drafts |
| Long URLs | Truncated by apps; letter fails | length warning and tests; move encrypted content to backend store with appropriate key distribution |
| Content abuse | Harassment and prohibited content without moderation | report endpoint, removal workflow and incident response for public production |
| Media uploads | executable files, XSS/SVG, malware, IP leakage, copyright | upload scanning, MIME sniffing, size limits, CDN isolation and EXIF stripping |
| Authz bypass on future backend | Other users' letters accessible | RBAC/ABAC, per-object policies and negative tests |
| Payment webhook forgery | Free entitlements or fraud | provider-signature validation, replay protection, idempotent processing and reconciliation |

## Do not do

- Do not call this end-to-end secure messaging: encryption does not authenticate senders or revoke shared keys.
- Do not send user letter text to AI, analytics, logging or error trackers by default.
- Do not store credentials in frontend, repository or telemetry.
- Do not accept external HTML/scripts in rich text without robust sanitation and security review.

## Pre-production security gates

Threat model signed off; SAST/dependency scans; pen test proportional to scope; HTTPS verified; backend authZ negative tests; content abuse response; privacy policy and retention; restore drills; signed payment callbacks if billing exists; secret rotation and incident runbook.

## v0.4 short-link threat boundary (planned)

> **Not implemented:** the code for this section was never committed to the repository (status corrected 2026-11-20). Planned design only.

Server API stores only authenticated-encryption ciphertext, IV and (for v2) salt, along with expiry, random ID and SHA-256 revoke-token hash. Browser retains decryption material in URL fragment (v1) or sender-supplied passphrase (v2). A browser extension, copied URL, XSS/compromised origin, or recipient copying the revealed content can bypass intended privacy; DO NOT claim independently verified E2EE or guaranteed destruction of viewed letters.

`localStorage` stores plaintext drafts and, separately, bearer **revocation** credentials. The author loses revocation ability if the browser profile is cleared. Invalid/missing revoke capability produces 401/404 without revealing whether a guessed letter exists. Storage writes use atomic replacement but are NOT equivalent to a transactional database/backup guarantee.

Production controls still required: transactional DB, encrypted backups and tested restore, abuse moderation/rate limits at edge, persistent per-user quotas, owner authentication or recovery design, privacy policy/retention controls, visibility and incident response, domain/TLS/HSTS verification, CSP/OWASP review, and real Chrome/Firefox/WebKit E2E plus accessibility audit. See `docs/DEPLOYMENT_STAGING_v0.4.md` and `docs/RELEASE_NOTES_v0.4.md`.
