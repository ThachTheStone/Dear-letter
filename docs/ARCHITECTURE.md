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


### v0.3 client-side protection options

`v1` places ciphertext and raw encryption key in the URL fragment; this remains supported for old letters.

`v2` uses random 16-byte salt, PBKDF2-HMAC-SHA256 (600k) deriving an AES-GCM key from a user-supplied password, random 12-byte IV, and only puts salt+IV+ciphertext in the fragment. No API or server-side data. Strong password must be sent separately. No recovery, revocation, or recipient authentication.

The Node static server now serves an allowlist of app assets with bounded in-process cache and Brotli/gzip conditional revalidation; this is not a production deployment architecture. See v0.3 audit.

## v0.4 CURRENT IMPLEMENTATION (supersedes the earlier historical v0.1 diagram above)

```
Browser WebCrypto
  | encrypt letter; v1 AES key stays in #key fragment, v2 passphrase stays with reader
  v
POST /api/letters { sealed: 'v1.iv.cipher'|'v2.salt.iv.cipher', ttlDays: 7 }
  | 20 creations/hour/IP; max 24k JSON; 2k active records
  v
Node API + bounded single-process encrypted record store
  | .data/letters.json atomic rename on a persistent filesystem
  | only SHA-256 hash of revoke capability, NO AES key or passphrase
  v
GET /api/letters/:id → ciphertext, no-store    DELETE /api/letters/:id → bearer revoke capability
  ^
  | Browser /l/:id reads ciphertext and decrypts locally
```

`src/letters-api.js` holds client transport and local sender capability records. `scripts/letter-store.mjs` holds local file store; `scripts/letters-api.mjs` handles APIs; `scripts/server.mjs` handles TLS, static assets, healthz and API routing. HTTP app endpoint must be behind trusted HTTPS edge (or local test TLS). No multi-node process synchronization, DB transaction durability, identity, abuse controls, public staging validation, or user authorization beyond revocation capability.
