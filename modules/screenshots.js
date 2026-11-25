const folder = hs.fs.homeDirectory() + "/Screenshots";

console.log("[Screenshots] Initializing");

const seen = new Set(hs.fs.list(folder) || []);

function scan(attempt = 0) {
    const files = (hs.fs.list(folder) || [])
        .filter(name => !seen.has(name))
        .filter(name => !name.startsWith("."))
        .filter(name => /\.(png|jpe?g|heic|heif|tiff)$/i.test(name));

    for (const name of files) {
        try {
            const image = HSImage.fromPath(`${folder}/${name}`);

            if (image && hs.pasteboard.writeImage(image)) {
                seen.add(name);
                console.log("[Screenshots] Copied: " + name);
            } else {
                throw new Error("Image not ready");
            }
        } catch (error) {
            if (attempt < 5) {
                hs.timer.doAfter(0.2, () => scan(attempt + 1));
                return;
            }
            console.error("[Screenshots] " + error);
        }
    }
}

const watcher = hs.fs.createPathWatcher(folder);

watcher.setCallback(() => scan());
watcher.start();

console.log("[Screenshots] READY: " + folder);
