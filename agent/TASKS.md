# Agent Task Board — 2026-11-19

| ID | Priority | Status | Owner role | Task | Gate |
|---|---|---|---|---|---|
| T-001 | P0 | DONE | Frontend | Build editor, responsive preview and themes | source + Node checks |
| T-002 | P0 | DONE | Security | Add browser AES-GCM link mechanism and tamper test | test passes, risk documented |
| T-003 | P0 | DONE | PM | Establish repo docs/agent instructions/roadmap | handoff available |
| T-004 | P0 | BLOCKED | QA | Playwright browser E2E in Chrome/Firefox/WebKit | `qa/e2e_real.py` authored; real navigation blocked by environment policy |
| T-005 | P0 | TODO | QA | Manual accessibility, focus/modal, mobile 320px and clipboard fallback | signed test report |
| T-006 | P0 | IN_PROGRESS | Infra | Push v0.2 branch and open PR | Main v0.1 committed; branch has v0.2 note only, code ZIP push pending |
| T-007 | P1 | TODO | PM | Define operational data retention and privacy policy | owner review |
| T-008 | P1 | TODO | Architect | Plan server-side short links and revocation ADR | security sign-off |
| T-009 | P1 | TODO | Frontend | Refine envelope interactions and independent design tokens | approved UI design + screenshot |
| T-010 | P1 | TODO | Infra | Static preview deploy and smoke verify | CI green, HTTPS |

| T-011 | P1 | DONE | Frontend | Multi-draft library: read/save/update/delete with v0.1 migration | 6 new unit tests + browser DOM smoke |
| T-012 | P1 | DONE | Frontend | CSS-based animated opening envelope and reduced-motion path | DOM smoke + manual source review; real E2E pending |
| T-013 | P1 | DONE | QA | HTTP security header and static module integration tests | 3 server checks pass |


| T-014 | P0 | DONE | Security | Optional password-protected v2 links + v1 backward compatibility | password roundtrip, incorrect password and tamper tests |
| T-015 | P1 | DONE | Backend | Strict public asset allowlist + CSP/COOP/CORP/Permissions Policy | HTTP negative and header tests |
| T-016 | P1 | DONE | Performance | Brotli/gzip, ETag, rAF preview | transfer-size benchmark + conditional-request checks |
| T-017 | P0 | BLOCKED | QA | True v1/v2 WebCrypto E2E in real HTTP browser | Chromium localhost blocked; run on developer workstation |
| T-018 | P0 | TODO | Security | Stage HTTPS, HSTS, authenticated revocable URLs, monitoring, abuse reporting | production security review |

## v0.4 active board (2026-11-19)

| ID | Priority | Status | Task | Evidence / Gate |
|---|---|---|---|---|
| T-019 | P0 | DONE local | Short-link ciphertext-only Node API and 7-day expiry | tests + restart verified |
| T-020 | P0 | DONE local | 256-bit secret owner revoke endpoint and sender UI | owner and invalid token integration tests |
| T-021 | P0 | DONE local | API abuse limits, bounded storage and hourly cleanup | automated tests, manual review |
| T-022 | P0 | DONE local | Local HTTPS TLS/API crypto roundtrip | `qa/https_smoke.mjs` PASS |
| T-023 | P0 | DONE partial | Accessibility contrast remediation and DOM smoke | targeted static audit PASS; axe/manual NOT done |
| T-024 | P0 | BLOCKED | Real Chrome/Firefox/WebKit over HTTPS | browser admin block; external staging not provisioned |
| T-025 | P0 | BLOCKED | Public staging deployment on DNS/VM | owner infrastructure access required |
| T-026 | P0 | TODO | Multi-tenant transactional DB, identity and reliable recovery | security architecture/approval |
| T-027 | P0 | TODO | Privacy/abuse moderation, backup restore, monitoring | commercial release gate |
| T-028 | P0 | TODO | Apply v0.4 source to GitHub branch, PR + CI | local patch archive created; remote SHA verification needed |
