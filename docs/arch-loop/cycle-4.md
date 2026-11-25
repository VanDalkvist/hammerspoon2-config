# Cycle 4 — Desktop utilities

Baseline: 16b89684fa1e0fb83035f7ab119f8bea0e464c50. See ../superpowers/plans/2026-11-25-desktop-utilities.md.

Added three independent modules, explicit activation through desktop-utilities.js, local disable flags, no external dependency. Screenshot module and hot-reload unchanged. Verified upstream Hammerspoon 2 pasteboard, chooser, hotkey, application, task, menubar and osascript APIs. 9 synthetic checks passed on authored pure functions in JavaScript isolate. Actual macOS integration, packaged tests, independent review and S9 gate pending. No claim of measured performance or fully safe clipboard detection. Clipboard history text-only, volatile, best-effort sensitive filtering. PM2 jlist guard avoids intentional daemon startup, with a residual race if daemon dies before command; raw JSON contains environment data and remains transient in memory, never logged. Browser URL supports explicit allowlist and HTTP(S). No main merge.
