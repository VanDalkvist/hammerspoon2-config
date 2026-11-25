# Cycle 1 — Fast Fn

Baseline: 360dfe785ca74dddd00b6c7925c6318e2223a9a3.
Scope and decisions: see ../superpowers/plans/2026-11-25-fast-fn.md.

Architecture: direct Hammerspoon 2 eventtap listen-only, pure bounded gesture, native keycodes readback. No keyboard event suppression, text capture, network or new runtime dependency. Screenshots module unchanged. Installer extends explicit entrypoints and backs up replaced modules. Privacy rules and local-only patterns added. Future modules follow the same small contract; no generic module framework.

Evidence: 15 synthetic checks executed against the authored gesture and adapter functions in a JavaScript isolate (mock Hammerspoon API); packaged Node invocation and physical device tests pending. Actual Fn hardware, Secure Input behavior, installation and screenshot regression pending. No independent reviewer was dispatched. Full S9 dual-circuit gate remains blocked. Candidate branch only; no merge. No claim of device latency or success until typing is verified.

Known risk: Globe events may be suppressed by macOS when the built-in action is disabled; a passive event tap cannot repair missing events. Restore native action if necessary. Also no complete rollback of screenshot defaults is implemented (existing installer behavior); backup preserves replaced source files. An opt-in .githooks/pre-commit now blocks private filenames and calls Gitleaks with redaction; no automatic activation. Earlier shell fixture PASS claims lacked a captured execution receipt and are withdrawn. Actual Gitleaks scan and shell fixture execution remain pending.
