const assert = require("node:assert/strict");
const {isRuntimePath,startReload} = require("../modules/hot-reload.js");
const {buildConfig} = require("../scripts/link.js");

function verify(assert, isRuntimePath, startReload, buildConfig) {
    let count = 0;
    function test(fn) { fn(); count++; }
    const root = "/test checkout", lock = root + "/.git/index.lock";
    test(()=>{assert(isRuntimePath(root, root+"/init.js"));assert(isRuntimePath(root,root+"/modules/new.js"));assert(isRuntimePath(root,root+"/modules/sub/x.json"));});
    test(()=>{for(const p of ["/README.md","/.git/index","/docs/x.js","/modules/a.local.js","/modules/.hidden/x.js","/modules/a.js.bak"])assert(!isRuntimePath(root,root+p));assert(!isRuntimePath(root,root+"2/init.js"));});
    function fixture() {
        let callback, pending, locked=false, reloads=0, stopped=0;
        const api={fs:{attributes:()=>locked?{}:null,createPathWatcher(){return {setCallback(fn){callback=fn;},start(){}};}},timer:{doAfter(delay,fn){pending={delay,fn};return {stop(){stopped++;pending=null;}};}},reload(){reloads++;}};
        startReload(api,root,lock,{log(){},warn(){}});
        return {fire(paths){callback(paths);},tick(){const fn=pending.fn;pending=null;fn();},lock(v){locked=v;},get pending(){return pending;},get reloads(){return reloads;},get stopped(){return stopped;}};
    }
    test(()=>{const f=fixture();f.fire([root+"/README.md"]);assert(!f.pending);f.fire([root+"/init.js"]);f.fire([root+"/modules/new.js"]);assert(f.pending.delay===0.75&&f.stopped===1);f.tick();assert(f.reloads===1&&!f.pending);});
    test(()=>{const f=fixture();f.lock(true);f.fire([root+"/init.js"]);f.tick();assert(f.reloads===0&&f.pending.delay===1);f.lock(false);f.tick();assert(f.reloads===1);});
    test(()=>{const f=fixture();f.lock(true);f.fire([root+"/init.js"]);for(let i=0;i<31;i++)f.tick();assert(!f.pending&&f.reloads===0);});
    test(()=>{const original='hs.notify.show("a", "b");\nrequire("./modules/screenshots.js");\nrequire(\'./modules/keyboard.js\')\nrequire("./local.js");\n';const result=buildConfig(original,root,lock);assert(result.includes('hs.notify.show'));assert(result.includes('require("./local.js")'));assert(!result.includes('require("./modules/screenshots.js")'));assert(!result.includes("./modules/keyboard.js"));assert(result.includes(JSON.stringify(root+"/init.js")));assert(result.indexOf("hot-reload.js")<result.indexOf(root+"/init.js"));assert(buildConfig(result,root,lock)===result);});
    test(()=>{let threw=false;try{buildConfig("// BEGIN managed Hammerspoon checkout\n",root,lock);}catch(_){threw=true;}assert(threw);});
    test(()=>{const src=buildConfig("",root,lock);let loaded=false, logged=false; new Function("hs","require","console",src)({},p=>{if(p.endsWith("hot-reload.js"))throw Error("fixture failure");if(p.endsWith("/init.js"))loaded=true;},{error(){logged=true;}});assert(loaded&&logged);});
    return count;
}
console.log(`${verify(assert.ok, isRuntimePath, startReload, buildConfig)} hot reload checks passed`);
