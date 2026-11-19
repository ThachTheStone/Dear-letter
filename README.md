# Dear Letter

A distinct, independent Vietnamese-language digital-letter web app. **Current status: v0.4 single-instance staging prototype / not yet approved for commercial release.** Built to help an agent team develop and eventually publish a production-quality product inspired by the general category of interactive letters, without copying third-party source, branding, illustrations, content, or assets.

## Run locally

Requires Node.js >=20 (Node 22 recommended), no npm dependencies.

```sh
npm run dev
# Open http://127.0.0.1:4173
npm run check
```

## What works in v0.4

- Responsive Vietnamese letter editor, preview, four themes, three fonts, and opt-in local multi-draft library (12 drafts, **plaintext** `localStorage`).
- Web Crypto AES-256-GCM: v1 link has a 256-bit decrypt key in URL fragment; optional v2 password mode uses PBKDF2-HMAC-SHA256 600,000 iterations (strong password required).
- **New:** encrypted-only server API, short URLs `/l/<id>`; v1 key retained in `#key=...` fragment, v2 password provided separately. Server never receives plaintext body, raw v1 decrypt key, or v2 password.
- 7-day default letter expiration; sender revocation using separate random token stored in this browser; old v1/v2 long-fragment links remain readable.
- Node static+API server with CSP, compressed assets, ETags, request/record caps, optional local TLS and a persistent single-instance JSON store. Do not scale it across multiple processes.
- 33 Node tests, targeted static accessibility contrast audit and a local HTTPS API crypto roundtrip. Docker/Caddy staging deployment recipe included.

## Run / test

```sh
node --version                   # >= 20, recommended 22
npm run dev                      # http://127.0.0.1:4173
npm run check                    # 33 automated Node tests
python qa/a11y_audit.py         # targeted static checks, requires beautifulsoup4
python qa/browser_smoke.py      # optional Playwright Chromium DOM-only checks
```

See [`docs/DEPLOYMENT_STAGING_v0.4.md`](docs/DEPLOYMENT_STAGING_v0.4.md) for local HTTPS and real public staging instructions. **Static-only hosting is no longer sufficient** because publication requires `/api/letters`. The server needs a persistent writable `DATA_DIR`. Docker Compose and publicly reachable Caddy HTTPS are provided as a recipe but have NOT been deployed or verified here.

### Verification and release restrictions

- `npm run check`: **35/35** passed on Node 22.
- Local HTTPS integration with self-signed cert trusted by the test process: **PASS** (`qa/https_smoke.mjs`). This is TLS + WebCrypto + HTTP API via Node, not browser end-to-end.
- Chromium DOM smoke at 1280/390/320px and static semantic/targeted contrast audit: **PASS** (limited scope).
- Real Chromium HTTPS navigation: **BLOCKED** by `ERR_BLOCKED_BY_ADMINISTRATOR`. Public staging deployment, axe/assistive tech/full keyboard QA and independent security review **NOT completed**.
- The browser stores plaintext drafts and revocation capabilities; if author clears browser storage they cannot revoke a shared link. Revocation does not retract a copy already read. There is no user login, identity proof, payments, content moderation or transaction-safe multi-instance database.
- This prototype must NOT be described as a commercial production-ready service or independently audited end-to-end encryption.

See [v0.4 release notes](docs/RELEASE_NOTES_v0.4.md), [architecture ADR-006](docs/DECISIONS.md), [security controls](docs/SECURITY.md) and [handoff](handoffs/LATEST.md).

## Project navigation

- [AGENTS.md](AGENTS.md): binding instructions for all future agents.
- [SOUL.md](SOUL.md): product principles, quality bar, non-goals.
- [docs/ROADMAP.md](docs/ROADMAP.md): release milestones and backlog.
- [docs/SRS.md](docs/SRS.md): actionable product requirements.
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md): current architecture and recommended next architecture.
- [docs/SECURITY.md](docs/SECURITY.md): privacy and security guardrails.
- [docs/TEST_PLAN.md](docs/TEST_PLAN.md): test strategy and QA checklist.
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md): deploying a static preview and production gates.
- [docs/DECISIONS.md](docs/DECISIONS.md): architecture decision records.
- [docs/RESEARCH.md](docs/RESEARCH.md): competitor-inspired requirements vs confirmed implementation.
- [docs/WORKFLOW.md](docs/WORKFLOW.md): issues, branches, PRs and agent handoffs.
- [agent/](agent/): execution prompts and task management.
- [skills/](skills/): role-specific skills for agent reuse.
- [handoffs/LATEST.md](handoffs/LATEST.md): current project status and next agent task.

## Development constraints

Run `npm run check` before every change handoff. Avoid secrets and personal information in Git. Never claim production readiness based solely on unit tests. Product roadmap is subject to business and regulatory validation.
