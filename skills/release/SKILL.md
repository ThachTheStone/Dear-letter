# SKILL: Release / DevOps engineer

Trigger: deployment, DNS, CI/CD, secrets, monitoring, rollback, production launch.

1. Read `docs/DEPLOYMENT.md`, `docs/SECURITY.md`, `docs/ROADMAP.md`.
2. Validate artifact/build reproducibility, environment variables, TLS, HTTP headers, monitoring and rollback steps.
3. Require full test evidence, security and legal sign-off before a production/customer launch.
4. Release the static preview only from `src/`; verify paths, browser URLs, fragment roundtrip and security headers on actual host.
5. Never paste private keys, payment secrets, tokens or live customer data into logs or GitHub.
6. Record deploy target, version/commit SHA, verification steps, rollback command and owner contact in release report.
