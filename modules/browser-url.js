const {browserScript,validURL}=require("./desktop-logic.js");

module.exports=function startBrowserURL(hs){
    let busy=false;
    const key=hs.hotkey.bind(["alt"],19,()=>{
        console.log("[Browser URL] HOTKEY FIRED");
        if(busy)return;
        try {
        const script=browserScript(hs.application.frontmost()?.bundleID);
        if(!script){hs.notify.show("Browser URL","Switch to a supported browser");return;}
        busy=true;
            hs.osascript.applescript(script).then(result=>{
                if(result.success&&validURL(result.result)&&hs.pasteboard.writeString(result.result)){
                    console.log("[Browser URL] Copied");
                    hs.notify.show("Browser URL","Link copied");
                }else {console.warn("[Browser URL] No readable web URL");hs.notify.show("Browser URL","No web URL; check browser Automation permission");}
            }).catch(()=>{console.warn("[Browser URL] Script failed");hs.notify.show("Browser URL","Unable to read browser tab");}).finally(()=>{busy=false;});
        }catch(error){busy=false;console.error("[Browser URL] Handler FAILED: "+String(error));hs.notify.show("Browser URL","Unable to read browser tab");}
    },null,null);
    if(!key)throw Error("Browser URL shortcut unavailable");
    console.log("[Browser URL] READY — Option+2");
};
