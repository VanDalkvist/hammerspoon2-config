# Cycle 6 — Startup troubleshooting

User reported utilities not working. Root cause remains unconfirmed without device console. Isolate screenshot and hot reload startup errors; preserve other modules. Report individual module initialization, disable status and failure messages; use filesystem existence API where available. 8 synthetic hot-reload/migration checks executed in JS isolate, including failure isolation; actual installed macOS app remains unverified. Re-run scripts/link.js to replace bootstrap, then restart app.
