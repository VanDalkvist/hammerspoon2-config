function createGesture(maxMs = 700) {
    let phase = "idle", started = 0;
    return function accept(kind, now, eligible = true) {
        if (kind === "down") {
            if (phase === "idle") {
                phase = eligible ? "held" : "cancelled";
                started = now;
            }
            return false;
        }
        if (kind === "up") {
            const elapsed = now - started;
            const toggle = phase === "held" && eligible && elapsed >= 0 && elapsed <= maxMs;
            phase = "idle";
            return toggle;
        }
        if (phase === "held") phase = "cancelled";
        return false;
    };
}

module.exports = createGesture;
