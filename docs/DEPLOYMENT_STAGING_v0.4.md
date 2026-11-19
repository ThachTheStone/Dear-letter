# v0.4 staging deployment — single-instance, encrypted letter delivery

**Status:** deployment recipe + local HTTPS integration verified, not a deployed public staging site. All credentials/DNS/cloud infrastructure must be supplied by the owner. This implementation is for controlled beta, **NOT commercial production**. Do not copy competitor code or assets.

## Architecture

```
Public browser --HTTPS--> Caddy (HSTS/TLS, ports 80/443)
                                  |
                           private Docker network
                                  |
                       Node application (4173)
                                  |
                     named volume letter_data
```

The client encrypts with AES-256-GCM before posting. For v1 bearer-link mode, it submits `v1.IV.ciphertext` (NO key), creates `/l/<opaque-id>#key=<raw-key>`; the key is never sent in HTTP requests. For v2 password mode, it submits `v2.salt.IV.ciphertext` (NO passphrase) and creates `/l/<opaque-id>`; recipient enters a separate passphrase. Owner revocation token is 256 random bits, returned only once by POST, hashed in storage and saved only in creator browser `localStorage`. Do not log HTTP authorization headers, letter contents or URL fragments.

## Local development

```
npm run dev
npm run check
python qa/a11y_audit.py
python qa/browser_smoke.py
```

Local HTTPS check (requires OpenSSL):

```
mkdir -p qa/certs
openssl req -x509 -newkey rsa:2048 -nodes -keyout qa/certs/local.key -out qa/certs/local.crt -days 1 -subj '/CN=localhost' -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1'
TLS_CERT_FILE=$PWD/qa/certs/local.crt TLS_KEY_FILE=$PWD/qa/certs/local.key PORT=4174 node scripts/server.mjs
# Separate terminal; NODE_EXTRA_CA_CERTS trusts the local certificate only in this test process:
NODE_EXTRA_CA_CERTS=$PWD/qa/certs/local.crt DEAR_URL=https://127.0.0.1:4174 node qa/https_smoke.mjs
```

Run browser E2E on an unrestricted workstation: `DEAR_URL=https://staging.example.com/ python qa/e2e_real.py`. **This runner blocks Chromium network navigation with `ERR_BLOCKED_BY_ADMINISTRATOR`; no real browser-HTTPS E2E has passed here.** Do not bypass this verification requirement in a release checklist.

## Public staging with Docker Compose and a domain

1. Provision a dedicated Linux VM with Docker Engine and Compose, a persistent disk, and a registered DNS name. Point its A/AAAA record to the VM. Permit inbound TCP 80/443 and UDP 443; keep Node port 4173 private.
2. Set `DOMAIN=staging.your-domain.tld` in a local `.env` file (never commit secrets); ensure the name resolves correctly.
3. Run `docker compose -f compose.staging.yml up -d --build`. Caddy obtains and renews the TLS certificate automatically if publicly reachable.
4. Verify trusted TLS, DNS, redirect 80→443, `curl -I https://staging.your-domain.tld/`, `/healthz`, caching, CSP and HSTS. Then run the full Playwright E2E on desktop and mobile widths and accessibility checks.
5. Validate restart persistence: publish a dummy letter, `docker compose -f compose.staging.yml restart app`, read it again, revoke it, then verify GET returns 404.
6. Back up the **entire** `letter_data` volume with encryption and controlled access. Perform a restore drill before inviting external testers. Test loss of author revocation token separately.

## Security gates

- `DATA_DIR` MUST be a writeable, persistent volume; do not deploy to an ephemeral filesystem, or links will be lost on redeploy.
- The file-backed store uses atomic replace/serialized writes **within a single process**. It is not safe across multiple replicas or shared volumes, and there is no fsync durability guarantee. Migration to PostgreSQL with a transactional schema is required before high traffic and commercial production.
- No login or identity proof. Revocation is *capability-based*; browsers that lose `localStorage` lose the revocation token. Revocation stops future fetches, but cannot erase plaintext already seen, saved, or cached by a recipient.
- 7-day default expiry, max 30-day server TTL, 2,000 active records cap, 20 new letters/hour/IP and 240 reads/minute/IP; rate limiting is per-process memory. Add edge-level limits, abuse reporting, and monitoring in production.
- Proxy must not log letter contents, authorization headers, or tokens. Avoid general analytics/tracking; server only stores ciphertext and dates/IDs.
- Implement backups/restore, on-call and alerting, incident response, audit, privacy notice/retention policy, abuse workflow, CSRF/CORS review, independent application security assessment and browser E2E before public launch.
- No paid features or user PII processing until legal, payment and authorization requirements are reviewed.

## Rollback

Deploy previous reviewed image without deleting the `letter_data` volume, retain compatible API schema, and verify existing short links can still be read or revoked. Since v0.3 static-only builds cannot read stored links, **do not rollback the backend to v0.3** while active short links exist.
