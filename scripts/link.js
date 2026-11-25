const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");
const { execFileSync } = require("node:child_process");

function buildConfig(original, root, indexLock) {
    const start = "// BEGIN managed Hammerspoon checkout";
    const end = "// END managed Hammerspoon checkout";
    const lines = original.split(/\r?\n/);
    let inside = false, blocks = 0;
    const retained = [];
    for (const line of lines) {
        if (line === start) {
            if (inside || blocks++) throw new Error("Ambiguous managed config markers");
            inside = true;
            continue;
        }
        if (line === end) {
            if (!inside) throw new Error("Unmatched managed config end");
            inside = false;
            continue;
        }
        if (inside) continue;
        if (/^\s*require\((["'])\.\/modules\/(?:screenshots|keyboard)\.js\1\)\s*;?\s*$/.test(line)) continue;
        retained.push(line);
    }
    if (inside) throw new Error("Unclosed managed config block");
    const block = [
        start,
        "require(" + JSON.stringify(root + "/modules/hot-reload.js") + ").startReload(hs, " +
            JSON.stringify(root) + ", " + JSON.stringify(indexLock) + ");",
        "require(" + JSON.stringify(root + "/init.js") + ");",
        end
    ].join("\n");
    return retained.join("\n").trimEnd() + "\n\n" + block + "\n";
}

function main() {
    const root = fs.realpathSync(path.join(__dirname, ".."));
    const config = path.join(os.homedir(), ".config", "Hammerspoon2");
    const target = path.join(config, "init.js");
    for (const file of ["init.js", "modules/hot-reload.js", "modules/screenshots.js", "modules/keyboard.js", "modules/fn-gesture.js"]) {
        if (!fs.statSync(path.join(root, file)).isFile()) throw new Error("Missing runtime file: " + file);
    }
    const lockPath = execFileSync("git", ["rev-parse", "--git-path", "index.lock"], {cwd:root, encoding:"utf8"}).trim();
    const indexLock = path.resolve(root, lockPath);
    fs.mkdirSync(config, {recursive:true});
    let stat;
    try { stat=fs.lstatSync(target); } catch(e) { if(e.code!=="ENOENT") throw e; }
    if (stat && !stat.isFile()) throw new Error("Local init.js must be a regular file; inspect it before migration");
    const original = stat ? fs.readFileSync(target,"utf8") : "";
    const next = buildConfig(original, root, indexLock);
    if(next===original) { console.log("Already linked; reload Hammerspoon if needed."); return; }
    const backup=fs.mkdtempSync(path.join(config,"backup."));
    fs.chmodSync(backup,0o700);
    if(stat) fs.copyFileSync(target,path.join(backup,"init.js"));
    const temp=path.join(backup,"init.next.js");
    fs.writeFileSync(temp,next,{mode:0o600,flag:"wx"});
    fs.renameSync(temp,target);
    console.log("Checkout linked. Backup: " + backup);
    console.log("Reload Config in Hammerspoon once.");
}
module.exports = { buildConfig };
if (require.main === module) {
    try { main(); } catch(e) { console.error(e.message); process.exitCode=1; }
}
