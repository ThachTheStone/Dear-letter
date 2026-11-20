# Architectural Decision Records

## ADR-001: Dependency-free static MVP

**Status:** Accepted for M0 (2026-11-18).

**Context:** Repository was empty. The fastest verifiable foundation is a static HTML/CSS/JS app with Node's built-in HTTP server and tests. This permits offline development and easy agent handoff.

**Decision:** No framework or build step for M0. Add tests and CI before changing the stack.

**Trade-off:** No backend, account, revocation or durable short-link delivery. A subsequent ADR is required for server architecture.

## ADR-002: Encrypt letter in browser, transport via URL fragment

**Status:** Provisional / review before wider release.

**Context:** Need simple cross-device sharing without a backend.

**Decision:** AES-GCM with per-letter random key and IV; place ciphertext + key in fragment. No server stores letters.

**Trade-off:** Bearer-link secrecy only, very long URLs, no revocation, no confidentiality against anyone accessing complete link, local drafts plaintext. Document openly and replace with better design for commercial release.

## ADR-003: Independent product identity

**Status:** Accepted.

Use original HTML, CSS, copy, graphics and name. The category is inspired by Dearr but do not copy source code, images, logos or paid materials.

## ADR template

`ADR-NNN: Title`; Status; Context; Options; Decision; Risks; Test/rollback; Owner and Date.


## ADR-004: Optional password-protected v2 URL

**Status:** Proposed — not implemented (code never committed; corrected 2026-11-20).

**Decision:** Keep v1 decoding, add opt-in v2 with PBKDF2-HMAC-SHA256 600,000 rounds and AES-GCM, salt+IV+ciphertext in fragment, no key. Avoid additional dependencies. Password cannot be recovered; require sender to communicate it out of band.

**Trade-off:** Offline guessing of weak passwords still possible, no revocation, no identities, no server storage; expensive PBKDF2 adds latency for v2.

## ADR-005: Static asset allowlist, conditional caching and compression

**Status:** Proposed — not implemented (code never committed; corrected 2026-11-20).

**Decision:** Whitelist public files explicitly, do not expose other paths, cache small assets with ETags, support Brotli/gzip, keep HTML no-store. Add modern browser isolation headers.

**Trade-off:** In-process assets may consume memory up to the size of the allowlisted resources; production CDN/edge must be audited separately.

## ADR-006: v0.4 minimal ciphertext-only short-link backend

**Status:** Proposed — not implemented (code never committed; corrected 2026-11-20). Design reviewed for initial threat boundaries only.

**Problem:** v0.3 places the entire ciphertext in long URLs without expiry/revocation, and some messengers truncate those URLs.

**Decision:** Retain browser WebCrypto, store *only* sealed ciphertext and expiry on server. For v1, generate `/l/{random-id}#key={raw-key}`, with key kept out of API; v2 uses password-derived encryption and `/l/{random-id}`. Generate a 256-bit random revocation capability, store its SHA-256 digest in server store, return capability only on creation, store locally for author's convenience. Default expiry 7 days. Bound length, quotas, and stored record count. Persist atomic JSON on a single persistent volume without external dependencies; fail closed on corrupt storage. Periodic expiry cleanup.

**Security assumptions:** HTTPS mandatory outside localhost, HTTP Referrer-Policy no-referrer, no service/provider logs containing Authorization/keys, distinct secure browser origin, sender controls browser profile. Recipient can keep plaintext copies. Revocation does not delete previously received copies. Local capability theft grants revoke authority; complete link grants v1 reading authority.

**Rejected for initial slice:** Login/OAuth, Postgres migration, uploaded media and payments; those require separate design/authorization/data review. The JSON store is **not a final database** and MUST NOT run in multiple application replicas. No crash-level fsync guarantee; backups and restores not implemented.

**Migration:** Add relational database (id PK, sealed, expiry, revoke_hash, created_at, status), DB transactions, cleanup worker, consistent rate limiting and operational controls. Keep GET/DELETE paths and old v1/v2 links until TTL lapses. Never silently delete valid customer data.

**Rollback:** Restore previous v0.4 container image while preserving persistent volume. Do not roll back to static v0.3 while v0.4 links remain active.
