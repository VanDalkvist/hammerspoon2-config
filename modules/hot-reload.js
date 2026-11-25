function isRuntimePath(root, path) {
    const rel = path.startsWith(root + "/") ? path.slice(root.length + 1) : "";
    return rel === "init.js" || rel === "modules" ||
        (rel.startsWith("modules/") && !rel.split("/").some(x => x.startsWith(".")) &&
         !/\.local\.(js|json)$/.test(rel) && /\.(js|json)$/.test(rel));
}

function startReload(api, root, indexLock, log = console) {
    let timer = null, retries = 0;
    function schedule(delay) {
        if (timer) timer.stop();
        timer = api.timer.doAfter(delay, attempt);
    }
    function attempt() {
        timer = null;
        if (api.fs.attributes(indexLock)) {
            if (++retries <= 30) schedule(1);
            else log.warn("[Hot Reload] Git is still busy; reload manually after Git completes");
            return;
        }
        retries = 0;
        log.log("[Hot Reload] Runtime changed; reloading");
        api.reload();
    }
    const watcher = api.fs.createPathWatcher(root);
    watcher.setCallback(paths => {
        if (!paths.some(path => isRuntimePath(root, path))) return;
        retries = 0;
        schedule(0.75);
    });
    watcher.start();
    log.log("[Hot Reload] Watching checkout");
    return watcher;
}

module.exports = { isRuntimePath, startReload };
