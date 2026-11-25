# Hammerspoon 2 Config

Modular, JavaScript-based macOS automation.

## Features

### Screenshot Clipboard

- Uses native macOS screenshot shortcuts.
- Saves screenshots to `~/Screenshots`.
- Automatically copies new screenshots to the clipboard.
- Disables the floating screenshot thumbnail.
- Preserves original screenshot files.

## Installation

Install Hammerspoon 2:

    brew install --cask hammerspoon/tap/hammerspoon2

Clone this repository and run:

    ./install.sh

Select Reload Config from the Hammerspoon menu.

## Structure

    init.js
    install.sh
    modules/
      screenshots.js

## Documentation

- https://www.hammerspoon.org/2/
- https://github.com/Hammerspoon/Hammerspoon2
