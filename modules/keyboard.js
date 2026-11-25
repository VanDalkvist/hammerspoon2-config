const createGesture = require("./fn-gesture.js");

function startKeyboard(api, log = console, now = Date.now) {
    const prefix = "[Fast Fn]";
    const disabled = api.fs.homeDirectory() + "/.config/Hammerspoon2/fast-fn.disabled";
    if (api.fs.attributes(disabled)) {
        log.log(prefix + " Disabled by local flag");
        return null;
    }
    const types = api.eventtap.eventTypes;
    const gesture = createGesture();
    function switchLayout() {
        const layouts = api.keycodes.layouts();
        const current = api.keycodes.currentLayout();
        if (layouts.length !== 2 || new Set(layouts).size !== 2 || !layouts.includes(current)) {
            log.warn(prefix + " Expected exactly two enabled keyboard layouts; use macOS input sources to configure them");
            return;
        }
        const target = layouts.find(name => name !== current);
        const started = now();
        const accepted = api.keycodes.setLayout(target);
        const observed = api.keycodes.currentLayout();
        if (!accepted || observed !== target) {
            log.warn(prefix + " Layout change not confirmed; use the normal input source shortcut");
        } else {
            log.log(prefix + " Layout changed; API/readback " + (now() - started) + " ms");
        }
    }
    const tap = api.eventtap.addWatcher(
        [types.flagsChanged, types.keyDown, types.keyUp, types.systemDefined],
        event => {
            try {
                // Only Fn's physical modifier transition is inspected; never read text.
                if (event.type === types.flagsChanged && event.keyCode === 63) {
                    const flags = event.flags;
                    const down = flags.includes("fn");
                    const eligible = flags.every(flag => flag === "fn" || flag === "capslock") &&
                        !api.eventtap.isSecureInputEnabled();
                    if (gesture(down ? "down" : "up", now(), eligible)) switchLayout();
                } else {
                    gesture("other", now());
                }
            } catch (_) {
                gesture("other", now());
                log.warn(prefix + " Event processing failed; check permissions and reload");
            }
            return api.eventtap.emit;
        },
        true
    );
    if (!tap) {
        log.warn(prefix + " Event tap unavailable; grant Accessibility and Input Monitoring if required, then reload");
        return null;
    }
    tap.start();
    if (!tap.isEnabled()) {
        api.eventtap.removeWatcher(tap);
        log.warn(prefix + " Event tap unavailable; check permissions, then reload");
        return null;
    }
    log.log(prefix + " READY — disable the built-in Globe press action in Keyboard settings");
    return tap;
}

module.exports = startKeyboard;
if (typeof hs !== "undefined") startKeyboard(hs);
