# SKILL: Security / Privacy reviewer

Trigger: encryption, URL handling, storage, login, API, file uploads, payments, CSP or telemetry changes.

1. Read `docs/SECURITY.md`, `docs/ARCHITECTURE.md`, `docs/DECISIONS.md` and this skill.
2. State asset being protected, attacker capabilities, trust boundaries, and residual risk.
3. Verify crypto primitives, randomness, key retention, HTML injection, input limits and error handling.
4. Test intentionally malformed fragments, XSS payload strings and Unicode extremes; secrets must never appear in logs.
5. For backend proposals, mandate access control tests, retention/deletion semantics, rate limiting, safe audit events, secret rotation and backup restore.
6. For payment, require signed webhook, replay detection, idempotent ledger updates, manual reconciliation and legal review.
7. Document severity and whether release is blocked. No false 'end-to-end secure' or privacy guarantees.
