# Dear Letter v0.2 — Draft Library & Recipient Envelope

Date: 2026-11-19. Status: **local implementation verified; production release NOT approved**.

## Shipped behavior

- Explicitly save up to **12 local drafts**, with stable IDs and individual update/load/delete actions.
- Confirm before discarding unsaved changes, deleting a draft or deleting all drafts.
- Migrate the previous `dear-letter:draft:v1` on a user's next explicit save; no automatic storage writes on page load.
- Recipient envelope built from original CSS layers, animates on opening, honors reduced-motion preferences.
- Restored keyboard focus into opened letter content; dialog can be closed using Escape.
- 15 Node tests (Web Crypto, drafts, HTTP security), plus DOM-based Chromium smoke at 1280/390/320px.

## Known limitations

- Drafts are **plaintext in browser localStorage**, not encrypted and not synced between devices. Clear site data to remove them. Maximum 12 saved drafts.
- Browser E2E via real localhost + WebCrypto remains blocked by the execution environment's `ERR_BLOCKED_BY_ADMINISTRATOR` policy. The DOM smoke uses mocked storage and UUID solely to test UI behavior and layout.
- No server storage, short links, deletion of previously shared letters, authentication, or payments.
- Copying the entire link shares both ciphertext and its decryption key. Anyone with the complete link can open it. Do not claim true end-to-end secure messaging.
- This release does not establish WCAG 2.2 AA certification or cross-browser compatibility.

## Next priorities

1. Run `python qa/e2e_real.py` in an environment with local browser navigation, plus Firefox/WebKit and keyboard screen reader QA.
2. Design server-backed short links with deletion, rate limiting, and threat model; prepare ADR and testable API contract.
3. Deploy a staging preview over HTTPS with explicit release acceptance and support channel.
