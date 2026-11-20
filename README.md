# Dear Letter

A distinct, independent Vietnamese-language digital-letter web app. **Current status: v0.1 MVP / not yet approved for commercial release.** Built to help an agent team develop and eventually publish a production-quality product inspired by the general category of interactive letters, without copying third-party source, branding, illustrations, content, or assets.

## Run locally

Requires Node.js >=20 (Node 22 recommended), no npm dependencies.

```sh
npm run dev
# Open http://127.0.0.1:4173
npm run check
```

## What works today

- Responsive home page and guided letter editor.
- Fields: recipient, sender, title, body (up to 3,000 characters).
- Four paper themes, three font styles, immediate preview.
- **Opt-in** browser-local draft library: save up to 12 drafts, reopen, update or delete each, or delete all (plaintext, this browser only).
- AES-256-GCM encrypt/decrypt in the browser; recipient opens the complete share URL to reveal an animated-envelope-style reading modal.
- Basic security headers on the local Node server; static assets are deployable.
- 18 automated unit tests, a dependency-free headless Chrome smoke test (`qa/drafts-smoke.mjs`), and a GitHub Actions CI workflow.

## Important limitations

- No user accounts, database, cloud storage, analytics, payment, upload, reporting, admin panel, or real 3D engine **yet**.
- URL-based transport contains encrypted message AND decryption key inside URL **fragment**. This fragment is not sent to the web server in the HTTP request but anyone holding or accessing the complete link can read the letter. Links cannot be revoked; previews, browser history, screenshots, copied links or extensions may expose them. Do **not** market the current MVP as secure end-to-end messaging.
- Long messages create long share links; some services truncate URLs. Set max URL 12,000 characters; not a replacement for permanent database storage.
- Drafts saved locally are **plain text**, in browser localStorage. This is clearly opt-in, not a secure local vault.
- Not certified for customer use. Browser E2E testing, operational compliance, review and threat modeling remain necessary.

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
