const {browserScript,validURL}=require("./desktop-logic.js");

module.exports=function startBrowserURL(hs){
    let busy=false;
    const key=hs.hotkey.bind(["ctrl","alt"],"l",()=>{
        if(busy)return;
        const script=browserScript(hs.application.frontmost()?.bundleID);
        if(!script){hs.notify.show("Browser URL","Switch to a supported browser");return;}
        busy=true;
        try{
            hs.osascript.applescript(script).then(result=>{
                if(result.success&&validURL(result.result)&&hs.pasteboard.writeString(result.result)){
                    hs.notify.show("Browser URL","Link copied");
                }else hs.notify.show("Browser URL","No web URL; check browser Automation permission");
            }).catch(()=>hs.notify.show("Browser URL","Unable to read browser tab")).finally(()=>{busy=false;});
        }catch(_){busy=false;hs.notify.show("Browser URL","Unable to read browser tab");}
    });
    if(!key)throw Error("Browser URL shortcut unavailable");
    console.log("[Browser URL] READY — Ctrl+Option+L");
};
