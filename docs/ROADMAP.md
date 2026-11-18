# ROADMAP — Dear Letter

All milestones are *targets*, not promises. Prioritize verified functionality over launch dates.

## Release strategy

| Milestone | Scope | Acceptance / exit gate | Status |
|---|---|---|---|
| M0 — Foundation | Independent brand, static app, writer, preview, themes, encrypted share link, unit tests, agent docs | local run and CI checks; no dependency install; clear security caveats | Implemented; browser QA pending |
| M1 — Usable public beta | Browser Playwright tests, accessibility, E2E failure states, uptime monitoring, actual static preview deployment, feedback channel, privacy policy | cross-browser and mobile smoke pass; no critical bugs | TODO |
| M2 — Real delivery | Backend API, relational DB, object storage as needed, durable short links, deletion, expiration, rate limiting, observability | threat model, API contract, migration and backup restore tested | TODO |
| M3 — Accounts & drafts | OAuth login, private mailbox, saved drafts on server, owner authorization, editing, sharing controls | authorization matrix tests, data deletion/export | TODO |
| M4 — Rich letter experience | Original 3D envelope, stickers, images, music, accessibility fallback, timed letters | file validation, licensing, performance budget and moderation plan | TODO |
| M5 — Commercial launch | Payments, clear pricing/refunds, admin moderation, compliance, support, domain/SSL, rollback, operational runbooks | business/legal sign-off; payment sandbox & reconciliation verified | TODO |

## Prioritized backlog

- P0-01: First real browser E2E flow (write -> preview -> encrypt -> copy -> recipient open); verify Chromium, Firefox, WebKit, Android Safari equivalents. Blocker: no browser automation dependency in offline environment.
- P0-02: Audit contrast, focus, input errors, dialog behavior, screen-reader flow, reduced motion. Run automated axe plus manual keyboard test.
- P0-03: Validate text length vs URL length with Vietnamese/emoji and popular messaging applications; design fallback.
- P0-04: Host static beta, test HTTPS, CSP, caches, actual link roundtrip on another device; ensure metadata previews do not accidentally expose letter data.
- P0-05: Prepare privacy policy, terms and support contact (business review required).
- P1-01: Backend ADR: compare Next.js + Postgres + object storage vs existing static JS + API. Retain static front-end until rewrite is justified.
- P1-02: API contract `POST /v1/letters`, `GET /v1/letters/:token`, `DELETE`, expiry, delivery authorization, max length; use authenticated roles appropriately.
- P1-03: Database schema, authorization and migration, encrypted storage/key handling, logging redaction, retention policy.
- P1-04: Abuse controls: reporting, block/removal, CAPTCHAs/rate limiting only where necessary.
- P2-01: OAuth, per-user draft list, access-controlled edit/delete, optional reminders and delayed opening.
- P2-02: Independently licensed 3D assets and reduced-motion 2D fallback.
- P2-03: Safe image/music uploads: MIME verification, antivirus or managed scanning, size limits, quotas, EXIF stripping, CDN policy, copyright checks.
- P3-01: Payment provider evaluation, sandbox, webhook signature verification, idempotency, ledger/reconciliation, refunds/support policies.
- P3-02: Operational SLOs, alerts, backups, incident response, cost controls and business launch readiness.

## Suggested organization

Issue label families: `P0/P1/P2/P3`, `frontend/backend/security/qa/docs/infra`, `blocked`, `ready-for-review`. One vertical deliverable per PR. Human review for platform selection, security changes and billing. Maintain a rolling change log in `handoffs/LATEST.md`.
