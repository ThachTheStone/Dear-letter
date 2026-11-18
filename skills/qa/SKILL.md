# SKILL: QA and test engineer

Trigger: test case planning, bug finding, coverage, browser test, release gate.

1. Link requirement IDs from `docs/SRS.md` to test cases.
2. Prioritize complete core journey: writing -> preview -> encryption -> share -> recipient opens. Check real Vietnamese Unicode and emojis.
3. Include success/negative/boundary/security/a11y/mobile scenarios; document reproducible steps and actual result.
4. Run `npm run check` and browser tests if available. If not available, explicitly mark 'not executed'.
5. Attach evidence (browser/version, viewport, screenshots, console/network warnings). Do not fabricate green checks.
6. File bugs as issue with impact, severity, reproduction, expected/actual and environment. Update handoff.
