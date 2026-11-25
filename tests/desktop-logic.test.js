const assert=require("node:assert/strict");
const {remember,shouldSkip,summarizePM2,browserScript,validURL}=require("../modules/desktop-logic.js");
function verify(ok,remember,shouldSkip,summarizePM2,browserScript,validURL){
    let n=0;const test=f=>{f();n++;};
    test(()=>{let x=remember([], "a");x=remember(x,"b");x=remember(x,"a");ok(x.join(",")==="a,b");});
    test(()=>{ok(remember(["a"]," ").length===1);ok(remember(["a"],"x".repeat(20001)).length===1);ok(remember(["a","b"],"c",2).join(",")==="c,a");});
    test(()=>{ok(shouldSkip(["org.nspasteboard.ConcealedType"],"editor",false,"hi"));ok(shouldSkip([],"com.1password.1password",false,"hi"));ok(shouldSkip([],"editor",true,"hi"));ok(!shouldSkip(["public.utf8-plain-text"],"editor",false,"hello"));});
    test(()=>{ok(shouldSkip([],"editor",false,"api_key=synthetic"));ok(shouldSkip([],"editor",false,"-----BEGIN PRIVATE KEY-----"));});
    test(()=>{const d=summarizePM2(JSON.stringify([{name:"worker",pm2_env:{status:"online",restart_time:3,env:{SECRET:"fixture"}},monit:{cpu:5,memory:1048576}}]));ok(d[0].cpu===5&&d[0].memory===1048576&&d[0].restarts===3);ok(!JSON.stringify(d).includes("SECRET"));});
    test(()=>{ok(summarizePM2("[]").length===0);let e=false;try{summarizePM2("{}");}catch(_){e=true;}ok(e);});
    test(()=>{const x=summarizePM2('[{"name":"worker","pm2_env":{"status":"stopped"}}]')[0];ok(x.cpu===null&&x.memory===null&&x.restarts===null);});
    test(()=>{ok(browserScript("com.google.Chrome").includes("active tab"));ok(browserScript("com.apple.Safari").includes("current tab"));ok(browserScript("unknown")===null);ok(browserScript('com.google.Chrome" bad')===null);});
    test(()=>{ok(validURL("https://example.com/path?q=a"));ok(validURL("http://localhost:8080"));ok(!validURL("javascript:alert(1)"));ok(!validURL("https://"));});
    return n;
}
console.log(verify(assert.ok,remember,shouldSkip,summarizePM2,browserScript,validURL)+" desktop logic checks passed");
