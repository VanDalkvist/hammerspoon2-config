# Cycle 2 — Live checkout

Baseline: 128dd1454a6bd878a11ff85612cc83b4d8c2a2c6. User requested hot reload on git pull and fast pre-commit.

- [ ] Confirm native require, path watcher, timer and reload contracts. Preserve local config and existing screenshot settings.
- [ ] Add one-time local bootstrap pointing at checkout; remove only exact previous managed require lines, retain other local code and backup. Refuse ambiguous bootstrap markers.
- [ ] Watch runtime JS/JSON changes, coalesce bursts, skip Git metadata and docs, wait for index lock before reload. Start watcher before loading entrypoint for recovery after bad module changes.
- [ ] Verify filter/debounce/lock behavior and bootstrap migration; record actual test evidence. Real Mac pull → reload → functional test remains required. Keep candidate branch until user smoke passes.
- [ ] Pre-commit: scan staged changes only, no network or full-history scan. Do not claim machine-specific timing without measurement.
