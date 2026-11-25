console.log("[Config] Loading desktop modules");
try { require("./modules/screenshots.js"); }
catch (error) { console.error("[Screenshots] FAILED: "+String(error)); }
try { require("./modules/desktop-utilities.js"); }
catch (error) { console.error("[Desktop utilities] Loader FAILED: "+String(error)); }
console.log("[Config] Startup complete");
