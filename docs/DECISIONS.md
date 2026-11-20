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

## ADR-007: English-only user interface

**Status:** Accepted (owner decision, 2026-11-20). Numbered 007 because ADR-004 to 006 are proposed on `feat/v0.4-backend-https-staging` (see T-014).

**Context:** v0.1 shipped Vietnamese UI copy for Vietnamese-speaking users. The owner no longer needs Vietnamese.

**Decision:** All UI copy, `lang`, dates and messages are English (`lang="en"`, `en-GB` date format). No i18n framework; strings stay inline. Letters may still be written in any language, so NFC normalization and the Unicode-capable serif stack from T-012 stay, and Unicode/Vietnamese/emoji input remains test data.

**Risks:** Existing share links and drafts are unaffected (no format or key changes). Copy tone must stay as explicit about privacy as before.

**Rollback:** Revert the T-015 PR.

## ADR template

`ADR-NNN: Title`; Status; Context; Options; Decision; Risks; Test/rollback; Owner and Date.
