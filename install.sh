#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
CONFIG="$HOME/.config/Hammerspoon2"

mkdir -p "$CONFIG/modules" "$HOME/Screenshots"

# Backup existing configuration
BACKUP="$(mktemp -d "$CONFIG/backup.XXXXXX")"

if [ -f "$CONFIG/init.js" ]; then
  cp "$CONFIG/init.js" "$BACKUP/"
fi

if [ -f "$CONFIG/modules/screenshots.js" ]; then
  cp "$CONFIG/modules/screenshots.js" "$BACKUP/"
fi

cp "$ROOT/modules/screenshots.js" \
   "$CONFIG/modules/screenshots.js"

touch "$CONFIG/init.js"

if ! grep -Fq 'require("./modules/screenshots.js")' \
  "$CONFIG/init.js"; then
  printf '\nrequire("./modules/screenshots.js");\n' \
    >> "$CONFIG/init.js"
fi

defaults write com.apple.screencapture location \
  -string "$HOME/Screenshots"

defaults write com.apple.screencapture location-screenshot \
  -string "$HOME/Screenshots"

defaults write com.apple.screencapture show-thumbnail \
  -bool false

open -a "Hammerspoon 2"

echo "Configuration installed."
echo "Backup: $BACKUP"
echo "Reload Config from the Hammerspoon menu."
