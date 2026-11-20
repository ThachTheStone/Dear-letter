# Agent Task Board — 2026-11-20

| ID | Priority | Status | Owner role | Task | Gate |
|---|---|---|---|---|---|
| T-001 | P0 | DONE | Frontend | Build editor, responsive preview and themes | source + Node checks |
| T-002 | P0 | DONE | Security | Add browser AES-GCM link mechanism and tamper test | test passes, risk documented |
| T-003 | P0 | DONE | PM | Establish repo docs/agent instructions/roadmap | handoff available |
| T-004 | P0 | BLOCKED | QA | Playwright browser E2E in Chrome/Firefox/WebKit | Chromium navigation blocked by administrator policy |
| T-005 | P0 | TODO | QA | Manual accessibility, focus/modal, mobile 320px and clipboard fallback | signed test report |
| T-006 | P0 | BLOCKED | Infra | Push files to GitHub and open PR | connector 403 write permission |
| T-007 | P1 | TODO | PM | Define operational data retention and privacy policy | owner review |
| T-008 | P1 | TODO | Architect | Plan server-side short links and revocation ADR | security sign-off |
| T-009 | P1 | TODO | Frontend | Refine envelope interactions and independent design tokens | approved UI design + screenshot |
| T-010 | P1 | TODO | Infra | Static preview deploy and smoke verify | CI green, HTTPS |
| T-011 | P1 | DONE | Frontend | Multi-draft library: save/update/open/delete/clear, 12-draft cap, v0.1 migration on explicit save | 12 unit tests (`tests/drafts.test.mjs`) + 19-check headless Chrome smoke (`qa/drafts-smoke.mjs`) |
| T-012 | P2 | DONE | Frontend | Vietnamese diacritics render detached in Georgia/italic preview text (e.g. "mến" → "mê´n"); pre-existing since v0.1 | NFC unit test + 8-check `qa/diacritics-smoke.mjs`, screenshots at 1280/390px |
| T-015 | P1 | DONE | Frontend | Translate the whole UI to English (ADR-007); keep Unicode input support | `npm run check`, both smoke tests, no Vietnamese left in `src/`, screenshots 1280/390px |
| T-013 | P3 | TODO | Frontend | Paper corner ✿ overlaps the heading ♡ in the preview (pre-existing) | screenshot at 1280/390px |
| T-014 | P1 | TODO | Architect | Bring proposed ADR-004/005/006 and staging compose/Caddy notes from `feat/v0.4-backend-https-staging` into `main` as *Proposed* input for T-008/T-010, then delete that branch | docs PR reviewed |
