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
| FR-005 | Author explicitly saves up to 12 local drafts, can reopen/update/delete each or delete all; no auto-saving; a v0.1 draft migrates only on explicit save. | Must | Implemented (T-011; unit + headless Chrome smoke) |
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

## FR-005 acceptance criteria (T-011, implemented 2026-11-20)

- FR-005a: Saving a new letter creates exactly one draft; saving again updates the same draft.
- FR-005b: At most 12 drafts. Saving a 13th shows a message and changes nothing.
- FR-005c: A v0.1 single draft is listed and can be opened; it's converted to the new format, and the old key removed, only when the author saves it.
- FR-005d: Opening another draft or starting a new letter asks before discarding unsaved changes. Deleting one draft or all drafts asks first.
- FR-005e: Loading the page never writes to storage and doesn't auto-fill the editor.
- FR-005f: Corrupt or oversized stored data is reported, never silently overwritten; "Xóa tất cả" recovers.
- Drafts stay plaintext in this browser's `localStorage` and aren't synced. The UI says so.
