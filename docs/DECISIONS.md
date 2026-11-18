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
