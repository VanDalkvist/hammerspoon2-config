# Hammerspoon 2 Config

Modular JavaScript macOS automation.

- Screenshot Clipboard: preserves native screenshot shortcuts, saves to ~/Screenshots and copies images to the clipboard.
- Hot reload: optional live checkout integration.
- Clipboard history: Option+1, last 50 text/image entries in memory, searchable by text or image label; thumbnails and original image restoration; choose to copy and paste with Cmd+V. Image history is limited to 10 images, an estimated 128 MiB total and 64 MiB per image (16 bytes per logical square point; not a hard native memory cap). Clear or pause in the chooser. Sensitive types and common secret patterns are skipped on a best-effort basis; no guarantee all secrets are detected. No disk persistence. Image content is not inspected for secrets; file URLs are not opened for image capture. History starts with new clipboard changes after reload.
- PM2 status: menu-bar online count, per-process CPU/RAM/restarts, refreshed every 30 seconds. Read-only intent; no restart actions. Uses the existing PM2 daemon, standard executable paths and PM2_HOME (default ~/.pm2). PM2 jlist can start a daemon if it dies between the probe and the command; no intentional daemon startup. No env values are shown or logged.
- Browser URL: Option+2 copies the current HTTP(S) URL from Safari and common Chromium browsers via AppleScript. Grant Automation permission if prompted; browser focus is unchanged. Firefox is not supported in this version.

## Install

Install Hammerspoon 2: `brew install --cask hammerspoon/tap/hammerspoon2`.
Run `./install.sh` and choose Reload Config in Hammerspoon. Grant any permissions requested by Hammerspoon. Keyboard input source settings are left untouched.

## Live checkout / hot reload (recommended for development)

From a normal local Git checkout, run `node scripts/link.js` once and choose Reload Config. It preserves unrelated lines in the existing local init.js, backs it up, removes the two old standalone managed imports, and links the checkout with absolute CommonJS paths. Existing screenshot preferences stay unchanged; for a clean installation, run ./install.sh first to establish screenshot settings. Keep the checkout on a trusted branch. Git pull or editing runtime JS/JSON triggers reload; README/docs/.git changes are ignored. Watcher batches events for 750 ms after delivery and waits for Git's index lock. If an invalid change prevents loading, the watcher is started before the entrypoint; manual reload remains available. To unlink, restore the backed-up init.js and reload. Keep private overrides in the local configuration directory.

Do not run the copy installer while linked. The link installer needs Node.js and Git only at setup time.

## Desktop utilities

Disable an individual module by creating `~/.config/Hammerspoon2/clipboard-history.disabled`, `pm2-status.disabled` or `browser-url.disabled` and reloading. Re-enable by removing the respective file. History is cleared on reload. PM2 must be installed and accessible to Hammerspoon; use a standard executable path or launch Hammerspoon with an appropriate PATH/PM2_HOME.

## Verify

Run `node tests/hot-reload.test.js && node tests/desktop-logic.test.js && node tests/clipboard-images.test.js` (synthetic checks; Node is only needed for testing). Reload Config and verify screenshot paste. For live checkout, touch `modules/screenshots.js` and confirm the hot reload log. The installer prints a backup directory containing prior files.

## Module development

Add an explicit entry to init.js and the corresponding public runtime files to install.sh. Keep business logic testable independently, with real device smoke tests for system behavior. See AGENTS.md for privacy boundaries. Keep private settings outside Git, use macOS Keychain for future credentials, and inspect the staged diff. Enable the included opt-in secret guard: `brew install gitleaks`, then `git config --get core.hooksPath` to inspect existing hook configuration. If no custom hooks are configured and no existing pre-commit hook is installed, run `git config --local core.hooksPath .githooks` from the main checkout. The hook blocks known private paths and runs Gitleaks on staged changes; missing Gitleaks blocks commits. Existing hooks should be integrated manually. This local guard is bypassable and does not cover API-created commits; review public diffs as well.

Hammerspoon 2 API: https://www.hammerspoon.org/2/

Global Option+1/2 shortcuts reserve the corresponding special-character input combinations while enabled. Disable the modules if those keys are needed for typing.
