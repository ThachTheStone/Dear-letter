# Architecture

## Current v0.1

```text
Browser
  index.html + style.css + app.js
           |
   crypto.js (Web Crypto AES-GCM)
           |
   share URL: #letter=v1.iv.ciphertext.key
           |
 Recipient browser decrypts in memory
```

The server delivers static HTML/CSS/JS; it receives no letter text through any application API. Recipient content travels inside a URL fragment and is decrypted locally. The decryption key is also in that link, **not** held separately, so anyone with the link can decrypt. Never claim the recipient is authenticated.

For local development, `scripts/server.mjs` provides static assets and basic security headers. Do not confuse it with a hardened production reverse proxy.

### Files

- `src/index.html`: semantic layout, editor, preview, reading dialog.
- `src/style.css`: responsive visual system; no external font/CDN.
- `src/app.js`: browser interactions and preview, opt-in drafts, link creation/opening.
- `src/crypto.js`: normalization, encoding, Web Crypto encrypt/decrypt.
- `scripts/server.mjs`: small local static server.
- `tests/crypto.test.mjs`: independent Node built-in tests.

## Proposed server architecture (ADR required before implementation)

```text
HTTPS / edge WAF / CDN
       | 
Next.js or equivalent UI + API gateway
       |
Auth & role policies ─── Letter services ─── PostgreSQL
       |                     |
Rate limit / audit     Object storage + CDN
       |
Metrics, alerting, tracing (redacted)
```

Requirements for the migration: data model (`users`, `letters`, `assets`, `reports`, `audit_events`, `transactions` only after billing review); ownership and access policies; expiration/revocation semantics; short links that do not leak keys to logs; explicit server/recipient threat model; encryption policy; backups; staged rollout. Do not silently re-architect to a large framework just because it is fashionable.

## API draft (not implemented)

- `POST /v1/letters` create letter metadata and return a revocable short token (auth and rate limits defined in contract).
- `GET /v1/letters/{token}` read according to capability, expiration, and access policy.
- `DELETE /v1/letters/{id}` author-only revoke and delete.
- `GET /v1/me/letters` owner-only management.
- `POST /v1/reports` report abuse; limit and moderate.

Use database migrations, endpoint integration tests, an OpenAPI contract and ADR before any server implementation. Do not store raw unlock keys on the same service holding ciphertext without explicit documented trade-off.
