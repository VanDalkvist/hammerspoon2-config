const assert = require("node:assert/strict");
const createGesture = require("../modules/fn-gesture.js");
const startKeyboard = require("../modules/keyboard.js");

function verify(assert, createGesture, startKeyboard) {
    let checks = 0;
    function test(name, fn) {fn(); checks++; }
    test("isolated tap toggles once",()=>{const g=createGesture();assert(!g("down",0));assert(g("up",80));assert(!g("up",90));});
    test("modifier chord cancels",()=>{const g=createGesture();g("down",0);g("other",30);assert(!g("up",80));});
    test("existing modifier cancels",()=>{const g=createGesture();g("down",0,false);assert(!g("up",50));});
    test("long hold and negative elapsed cancel",()=>{const g=createGesture();g("down",0);assert(!g("up",701));g("down",1000);assert(!g("up",999));});
    test("duplicate down cannot rearm cancelled gesture",()=>{const g=createGesture();g("down",0);g("other",30);g("down",40);assert(!g("up",80));});
    test("rapid distinct taps",()=>{const g=createGesture();g("down",0);assert(g("up",20));g("down",30);assert(g("up",50));});
    test("secure input at release cancels",()=>{const g=createGesture();g("down",0);assert(!g("up",30,false));});
    test("release after reload ignored",()=>{assert(!createGesture()("up",50));});
    function fixture({disabled=false,enabled=true,secure=false,layouts=["A","B"],accept=true}={}) {
        let callback, current="A", selected=[], msgs=[], time=0, passive=false, removed=0;
        const tap={start(){},isEnabled(){return enabled;}};
        const types={flagsChanged:12,keyDown:10,keyUp:11,systemDefined:14};
        const hs={fs:{homeDirectory:()=>"/synthetic",attributes:()=>disabled?{}:null},eventtap:{eventTypes:types,emit:true,isSecureInputEnabled:()=>secure,addWatcher(t, cb, p){callback=cb;passive=p;assert(t.includes(types.systemDefined));return tap;},removeWatcher(){removed++;}},keycodes:{layouts:()=>layouts,currentLayout:()=>current,setLayout(x){selected.push(x);if(accept)current=x;return accept;}}};
        const watcher=startKeyboard(hs,{log:x=>msgs.push(x),warn:x=>msgs.push(x)},()=>time++);
        function fire(type,flags=[],keyCode=63){return callback({type,flags,keyCode});}
        const press=()=>{fire(types.flagsChanged,["fn"]);fire(types.flagsChanged);};
        return {watcher,fire,press,types,selected,msgs,get current(){return current;},passive,get removed(){return removed;}};
    }
    test("adapter calls layout API and observes state, passes all events",()=>{const f=fixture();assert(f.passive);assert(f.fire(f.types.flagsChanged,["fn"]));assert(f.fire(f.types.flagsChanged));assert(f.current==="B"&&f.selected.length===1);f.press();assert(f.current==="A"&&f.selected.length===2);});
    test("Fn+system key does not switch",()=>{const f=fixture();f.fire(f.types.flagsChanged,["fn"]);f.fire(f.types.systemDefined);f.fire(f.types.flagsChanged);assert(f.selected.length===0);});
    test("Fn+normal key does not switch",()=>{const f=fixture();f.fire(f.types.flagsChanged,["fn"]);f.fire(f.types.keyDown,["fn"],51);f.fire(f.types.flagsChanged);assert(f.selected.length===0);});
    test("secure input never switches",()=>{const f=fixture({secure:true});f.press();assert(f.selected.length===0);});
    test("invalid layouts fail closed",()=>{const f=fixture({layouts:["A"]});f.press();assert(f.selected.length===0);assert(f.msgs.some(x=>x.includes("exactly two")));});
    test("failed native call not reported as success",()=>{const f=fixture({accept:false});f.press();assert(f.current==="A");assert(f.msgs.some(x=>x.includes("not confirmed")));assert(!f.msgs.some(x=>x.includes("Layout changed")));});
    test("disabled flag and permission failure",()=>{const a=fixture({disabled:true});assert(a.watcher===null);const b=fixture({enabled:false});assert(b.watcher===null&&b.removed===1);});
    return checks;
}

console.log(`${verify(assert.ok, createGesture, startKeyboard)} Fast Fn checks passed`);
