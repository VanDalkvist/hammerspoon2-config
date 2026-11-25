# Cycle 4 — Desktop utilities

Baseline: e27d99cfcbd0386a6f73d10fcf2fbc3c1f4a7826. Three independent modules: in-memory text clipboard history, read-only PM2 status, active browser URL. Preserve existing screenshot and live reload paths. No automatic keyboard switching, persistent clipboard storage, network requests or process restart controls.

- [ ] Verify upstream Hammerspoon 2 native interfaces.
- [ ] Test pure clipboard filtering/history, PM2 summary and browser mapping using synthetic data.
- [ ] Wire three modules with isolated initialization errors and independent disable flags; update install and documentation.
- [ ] Inspect candidate and verify actual macOS journeys: copy/select/paste, concealed clipboard, PM2 online/offline/unavailable, Chrome URL permission and no focus change, screenshot regression. Record limitations; no merge until real device review.
