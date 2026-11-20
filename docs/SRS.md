# SRS v0.1 — Dear Letter (Working specification)

## Scope

Build an original digital-letter application for Vietnamese-speaking users. This is a **target requirements document**, not a representation that the source competitor has all features or that all items are implemented.

### Actors

- Author: compose, preview, customize, optionally save and share.
- Recipient: receive link, open envelope, read letter.
- Future: authenticated author, moderator, support, payment admin.

### Current functional requirements

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-001 | Author can enter recipient/sender/title/body. | Must | Implemented |
| FR-002 | Body must not be empty and is limited to 3,000 characters. | Must | Implemented |
| FR-003 | Preview updates when fields, colors, and typography change. | Must | Implemented |
| FR-004 | Choose among four paper themes and three fonts. | Must | Implemented |
| FR-005 | Author explicitly saves draft locally and can delete it. | Must | Implemented |
| FR-006 | Author can create a link for a letter encrypted in the browser. | Must | Implemented |
| FR-007 | Recipient can use the complete link to open and read that letter. | Must | Implemented (browser QA pending) |
| FR-008 | Reader can open a staged-envelope view; content not injected as HTML. | Must | Implemented (browser QA pending) |
| FR-009 | UI works on desktop and mobile widths. | Must | CSS implemented (browser QA pending) |
| FR-010 | Copy link with manual fallback if Clipboard API unavailable. | Must | Implemented (browser QA pending) |

### Planned functional requirements

| ID | Requirement | Priority | Status |
|---|---|---|---|
| FR-011 | Durable, short, server-hosted letter link with policy-driven expiration/revocation. | Must for commercial launch | TODO |
| FR-012 | Users can manage owned letters with strong authorization. | Should | TODO |
| FR-013 | Account authentication via trusted OAuth provider. | Should | TODO |
| FR-014 | Original 3D envelope and paper animation with 2D fallback. | Should | TODO |
| FR-015 | Moderation/reporting and abuse response process. | Must for commercial launch | TODO |
| FR-016 | Optional image, sticker, music and rich decorative assets with upload validation. | Could | TODO |
| FR-017 | Optional password and scheduled opening subject to clear threat model. | Could | TODO |
| FR-018 | Payment and entitlements with verified settlement and refund handling. | Could | TODO |

### Nonfunctional requirements

- NFR-001 Privacy: disclose access properties of links; no silent analytics or third-party pixels.
- NFR-002 Security: transport HTTPS, XSS-resistant rendering, content policy, input validation, secrets kept off client.
- NFR-003 Reliability: no loss of saved server data once cloud delivery is introduced; test backup/restore.
- NFR-004 Accessibility: WCAG 2.2 AA target, focus-visible, keyboard, alt/labels, reduced motion.
- NFR-005 Performance: target p75 LCP <2.5s and CLS <0.1 on appropriate real-world mobile baseline; measure rather than assert.
- NFR-006 Compatibility: modern Chrome, Firefox, Safari, Edge; test actual browsers.
- NFR-007 Maintainability: reviewed PRs, CI gates, documented ADR and handoffs.
- NFR-008 Localization: Vietnamese copy, proper Unicode normalization, no broken diacritics.

### Core acceptance scenarios

1. With an empty editor, submit refuses to generate a link and explains why.
2. With a valid Unicode letter, generated link decrypts correctly on a second browser session.
3. Tampering with encrypted data rejects safely, never displays attacker-controlled HTML.
4. Selecting each theme changes both writer preview and recipient reading view.
5. Draft is only stored after explicit click; clearing removes saved local storage and input.
6. User can navigate and operate primary controls using only keyboard.

### Critical open questions for owner

- Is the product private-user content only, or can recipients publish/share publicly?
- Should author be able to revoke links, delete viewed letters, or observe opened status? Each affects security/trust.
- Which provider, pricing, countries and tax/legal posture for payment?
- Retention defaults for unsent vs sent letters; child safety and moderation approach.
- How strictly should UI resemble dearr.app? Default: independent experience, similar interaction category only.

## Notes

The earlier competitor-analysis SRS is not substituted for verified requirements; re-validate competitor behaviors by permitted browsing and mark findings as observations. Avoid copying competitor implementation.

## v0.2 acceptance additions (planned)

> **Not implemented:** the code for this section was never committed to the repository (status corrected 2026-11-20). Planned design only.

- FR-005a: Saving a draft creates exactly one new entry; saving edits updates the same ID.
- FR-005b: Up to 12 drafts are allowed; attempt to save a 13th produces a message and does not overwrite data.
- FR-005c: A v0.1 single draft can be reopened; converting it writes v2 only after an explicit save.
- FR-005d: Confirm before discarding unsaved text when switching to another draft or creating a new letter.
- FR-008a: Opening the recipient envelope reveals the letter and focuses the title; reduced-motion setting bypasses animation.


## v0.3 security/performance amendment (planned)

> **Not implemented:** the code for this section was never committed to the repository (status corrected 2026-11-20). Planned design only.

- FR-SEC-01: Author MAY choose a password (12–128 chars); if chosen, app emits v2 link without raw AES key and warns to deliver password separately.
- FR-SEC-02: Recipient of v2 must input correct password before the letter is revealed; v1 remains readable without password.
- FR-SEC-03: App clears displayed decrypted text and input password when reader dialog closes.
- NFR-SEC-04: Allowlist all static HTTP resources; enable strict security headers; never cache HTML.
- NFR-PERF-05: Compress static text assets and support conditional ETag revalidation; batch preview changes to animation frames.
- Unresolved: user identities, revocable short links, backend, commercial compliance and browser E2E. See `docs/SECURITY_AUDIT_v0.3.md`.

## v0.4 backend functional slice (planned requirements)

> **Not implemented:** the code for this section was never committed to the repository (status corrected 2026-11-20). Planned design only.

| ID | Priority | Requirement | Acceptance |
|---|---|---|---|
| FR-B01 | P0 | Sender can publish encrypted letter and receive a 24-character opaque short ID | POST returns 201, ID, expiry and independent revoke credential |
| FR-B02 | P0 | Server never receives v1 AES key or v2 passphrase | Verified by integration test; only sealed format accepted |
| FR-B03 | P0 | Recipients open `/l/:id`, read stored ciphertext and decrypt locally | v1 uses URL fragment key, v2 password; old v1/v2 legacy fragments still supported |
| FR-B04 | P0 | Sender can revoke an unexpired letter using secret capability | DELETE succeeds for valid capability; GET afterwards 404, invalid capability 401/404 |
| FR-B05 | P0 | Server enforces expiry | UI requests 7 days, server caps 1–30, expired GET 404 and cleanup runs periodically |
| FR-B06 | P1 | Sender retains capabilities locally to revoke via sent list | Revocation list operates only on same browser; documented limitations |
| NFR-B01 | P0 | Bound abusive writes and body size | 20 creates/hour/IP, 24k request max, 2k active records, safe 4xx errors |
| NFR-B02 | P0 | Store only encrypted content and revoke hash | SHA-256 revoke digest, no raw decrypt key, 0600 file mode on supporting OS |
| NFR-B03 | P0 | HTTPS for external traffic | Local TLS tested; public staging TLS and browser acceptance remain blocked |
| NFR-B04 | P1 | Accessible controls and mobile | static WCAG contrast check, 44px targets, DOM smoke at 320/390/1280px; axe/manual audit pending |

**Deployment restriction:** Browser/HTTP E2E against trusted public HTTPS, privacy review and transactional durability are launch blockers. Current file store is a controlled-beta prototype.
