# Project principles

- The Python API and web app define Whombat's supported user behavior.
- Test intended behavior through those interfaces, with assertions about observable results and meaningful failures.
- Keep tests focused on the contracts users rely on. Add lower-level tests when a lower-level API is itself a supported contract.
- Test behavior Whombat introduces, including its integration choices; rely on built-in and third-party libraries' own tests for their behavior.
- Add tests that protect meaningful behavior or regressions; weigh their value against runtime and maintenance cost.
- Keep operational logging in REST API routes, not in lower-level Python API registration methods; return structured results to Python callers instead.

## Agent skills

### Issue tracker

Tasks for this repo live in Aven. Use the `aven` CLI to find, inspect, and update them. See `docs/agents/issue-tracker.md`.

### Triage labels

Use `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Use the single-context layout. See `docs/agents/domain.md`.
