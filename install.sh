#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$HOME/.config/Hammerspoon2"

if [ -f "$CONFIG/init.js" ] && grep -Fq "// BEGIN managed Hammerspoon checkout" "$CONFIG/init.js"; then
  echo "Live checkout is linked; use git pull or restore the local init.js backup." >&2
  exit 1
fi

mkdir -p "$CONFIG/modules" "$HOME/Screenshots"
BACKUP="$(mktemp -d "$CONFIG/backup.XXXXXX")"
if [ -f "$CONFIG/init.js" ]; then
  cp "$CONFIG/init.js" "$BACKUP/"
fi
mkdir -p "$BACKUP/modules"

# Explicit public runtime files; keep local overrides outside this list.
for name in screenshots.js; do
  test -f "$ROOT/modules/$name"
  if [ -f "$CONFIG/modules/$name" ]; then
    cp "$CONFIG/modules/$name" "$BACKUP/modules/"
  fi
  cp "$ROOT/modules/$name" "$CONFIG/modules/$name"
done

touch "$CONFIG/init.js"
# Remove the exact legacy Fast Fn entrypoint from copy-mode installations.
TMP="$BACKUP/init.next.js"
awk '$0 != "require(\"./modules/keyboard.js\");"' "$CONFIG/init.js" > "$TMP"
cat "$TMP" > "$CONFIG/init.js"
rm -f "$TMP"
# Source-of-truth entrypoints in the repository; preserve other local code.
while IFS= read -r line; do
  [ -n "$line" ] || continue
  if ! grep -Fxq "$line" "$CONFIG/init.js"; then
    printf '\n%s\n' "$line" >> "$CONFIG/init.js"
  fi
done < "$ROOT/init.js"

defaults write com.apple.screencapture location -string "$HOME/Screenshots"
defaults write com.apple.screencapture location-screenshot -string "$HOME/Screenshots"
defaults write com.apple.screencapture show-thumbnail -bool false

open -a "Hammerspoon 2"
echo "Configuration installed. Backup: $BACKUP"
echo "Reload Config from the Hammerspoon menu."
