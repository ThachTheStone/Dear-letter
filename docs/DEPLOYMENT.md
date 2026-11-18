# Deployment

## Local

Node.js >=20, then `npm run dev`; browse `http://127.0.0.1:4173`. `npm run check` before changes. All assets are inside `src/`; no dependency installation required.

## Static preview

Serve **only** the contents of `src/` from an HTTPS static hosting provider (Cloudflare Pages, Netlify, Vercel static hosting, GitHub Pages with project-root URL adjustment). Build command: none; publish directory: `src`. The app uses absolute home route `/` and path relative asset imports; for subpath hosting, change home links or use a custom root domain. No environment secrets needed for M0.

### Static host headers

Replicate equivalent headers: `Content-Security-Policy: default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: no-referrer`, `X-Frame-Options: DENY`. Configure HSTS on HTTPS and avoid third-party scripts. Test these on actual hosting; local server headers do not automatically deploy with `src/`.

## Commercial release checklist

- Domain ownership/DNS/TLS, correct OG/social metadata, legal consent and contact; original logos/assets.
- Product terms, privacy/data retention, content moderation/reporting process, user support.
- E2E browser matrix and accessibility review; real-device mobile validation.
- CDN and caching review; errors/uptime alerting; incident runbook.
- Backend migration only if durable short links, revocation and accounts are required; no claims of this in M0.
- Security and legal go/no-go documented in a human-owned release issue.
- Rollback: redeploy previous immutable static build; preserve release artifact checksum and tag.

## Note

An MVP preview may be published for controlled testing, but do not label it a payment-ready or production-safe customer platform without M1–M5 gates.
