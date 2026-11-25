# Automation modules

Keep init.js entrypoints explicit. Each runtime module owns its events and effects; add its files to install.sh and tests for meaningful behavior. Preserve unrelated local config and existing screenshot behavior. Pure logic should be testable without Hammerspoon; device verification is required for system effects. Avoid logging keystrokes, clipboard contents, paths, tokens or personal data. No network calls or background uploads without an explicit feature requirement.

Public repository: do not commit actual local configs, credentials, VPN profiles, screenshots, personal paths, backup files, or logs. Use environment variables or Keychain for future secret-bearing integrations; keep private configuration outside this checkout. Inspect staged diff and run a redacted secret scan before pushing. Do not auto-merge a change with an unverified real macOS journey.
