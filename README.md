# Hammerspoon 2 Config

Modular JavaScript macOS automation.

- Screenshot Clipboard: preserves native screenshot shortcuts, saves to ~/Screenshots and copies images to the clipboard.
- Fast Fn: a clean Fn tap toggles two keyboard layouts; Fn chords pass through. No automatic text correction or keystroke history.

## Install

Install Hammerspoon 2: `brew install --cask hammerspoon/tap/hammerspoon2`.
Run `./install.sh` and choose Reload Config in Hammerspoon. Grant Accessibility and, if requested, Input Monitoring. In macOS Keyboard settings set "Press Globe key to" to "Do Nothing". Leave the Globe modifier mapping unchanged. Keep the standard input-source shortcut available as a fallback.

## Verify and disable

Run `node tests/fast-fn.test.js` (synthetic checks; Node is only needed for testing).
On the Mac, check the console for [Fast Fn] READY. In a text editor tap Fn and immediately type; verify both directions. Test Fn+Delete, arrows and F-keys, and screenshot paste. The logged API/readback time is not end-to-end typing latency. Some macOS/keyboard combinations suppress Globe events; if Fn does not switch, disable Fast Fn and restore the system Globe action.

Disable: `touch ~/.config/Hammerspoon2/fast-fn.disabled` and Reload Config. Re-enable: `rm -f ~/.config/Hammerspoon2/fast-fn.disabled` and Reload Config. Restore the original Globe press action in Keyboard settings if disabling. The installer prints a backup directory containing prior files.

## Module development

Add an explicit entry to init.js and the corresponding public runtime files to install.sh. Keep business logic testable independently, with real device smoke tests for system behavior. See AGENTS.md for privacy boundaries. Keep private settings outside Git, use macOS Keychain for future credentials, and inspect the staged diff. Enable the included opt-in secret guard: `brew install gitleaks`, then `git config --get core.hooksPath` to inspect existing hook configuration. If no custom hooks are configured and no existing pre-commit hook is installed, run `git config --local core.hooksPath .githooks` from the main checkout. The hook blocks known private paths and runs Gitleaks on staged changes; missing Gitleaks blocks commits. Existing hooks should be integrated manually. This local guard is bypassable and does not cover API-created commits; review public diffs as well.

Hammerspoon 2 API: https://www.hammerspoon.org/2/
