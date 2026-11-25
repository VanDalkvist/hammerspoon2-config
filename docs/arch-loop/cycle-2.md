# Cycle 2 — Live checkout

Baseline: c77f804e7c8fd1b3e89c521b72d84150ffefffd0. Plan: ../superpowers/plans/2026-11-25-live-checkout.md.

Native CommonJS absolute imports, hs.fs.createPathWatcher, hs.timer.doAfter and hs.reload verified in upstream Swift/JS source. Local bootstrap is backed up, no source copied into live config; explicit public entrypoint owns module registration. No Git polling or automatic remote pulls. Watcher filters runtime paths, debounces bursts and waits for index.lock for up to 30 retries. Node only at link setup/testing.

Evidence: 7 synthetic checks executed on the exact authored functions in a JS isolate; cover path filtering, debounce, lock wait and timeout, preservation/idempotency of migration, malformed marker rejection. Node CLI and real file migration not yet executed in available environment; macOS live checkout journey pending. Independent reviewer and dual S9 gate remain blocked. Pre-commit remains staged-only and opt-in; actual elapsed scan time pending.

Risk: watcher event delivery may be delayed/coalesced by macOS; no guarantee of exact latency. Git changes execute local trusted code on reload; no remote auto-pull. The checkout must remain at its original path. Changing installer/runtime directory layout requires updating the bootstrap contract. No merge until device verification.
