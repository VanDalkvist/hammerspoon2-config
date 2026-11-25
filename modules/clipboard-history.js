const {shouldSkip,imageTypes,imageCost,rememberEntry}=require("./desktop-logic.js");

module.exports=function startClipboard(hs){
    const pb=hs.pasteboard;
    let history=[], paused=false, count=pb.changeCount, nextId=0, warned=false;
    let target=null, generation=0;
    const chooser=hs.chooser.create();
    chooser.placeholder="Clipboard history";
    chooser.visibleRows=10;
    chooser.searchSubText=true;
    function sample(){
        const next=pb.changeCount;
        if(next===count)return;
        count=next;
        if(paused)return;
        try{
            const bundle=hs.application.frontmost()?.bundleID;
            const types=pb.types();
            const secure=hs.eventtap.isSecureInputEnabled();
            if(shouldSkip(types,bundle,secure,null))return;
            const value=pb.readString();
            if(shouldSkip(types,bundle,secure,value))return;
            let entry=null;
            if(imageTypes(types)){
                const image=pb.readImage();
                if(image){
                    const {w,h}=image.size;
                    const cost=imageCost(w,h);
                    if(cost<=64*1024*1024){
                        entry={id:++nextId,kind:"image",image,w,h,cost};
                    }else console.log("[Clipboard] Large image skipped");
                }
            }
            if(!entry&&typeof value==="string")entry={id:++nextId,kind:"text",value};
            if(pb.changeCount!==next)return;
            history=rememberEntry(history,entry);
        }catch(_){if(!warned){warned=true;console.warn("[Clipboard] Read unavailable; check permissions");}}
    }
    function row(entry){
        if(entry.kind==="text")return {id:entry.id,text:entry.value.slice(0,120).replace(/\s+/g," "),subText:entry.value.slice(0,350)};
        const result={id:entry.id,text:"Image · "+Math.round(entry.w)+" × "+Math.round(entry.h),subText:"Image / screenshot"};
        try{
            const thumb=entry.image.duplicate();
            const scale=Math.min(1,96/Math.max(entry.w,entry.h));
            if(thumb){
                thumb.size=new HSSize(Math.max(1,Math.round(entry.w*scale)),Math.max(1,Math.round(entry.h*scale)));
                result.image=thumb;
            }
        }catch(_){/* Image can still be restored without a thumbnail. */}
        return result;
    }
    const hotkey=hs.hotkey.bind(["alt"],18,()=>{
        console.log("[Clipboard] HOTKEY FIRED");
        try{
            if(chooser.isVisible)return;
            generation++;
            target=hs.application.frontmost();
            sample();
            chooser.setChoices([
                ...history.map(row),
                {text:"Clear history",action:"clear"},
                {text:paused?"Resume history":"Pause and clear history",action:"pause"}
            ]);
            chooser.query="";
            chooser.show();
            console.log("[Clipboard] Chooser opened");
        }catch(error){console.error("[Clipboard] Open FAILED: "+String(error));}
    },null,null);
    if(!hotkey)throw Error("Clipboard shortcut unavailable");
    chooser.onSelect=choice=>{
        console.log("[Clipboard] Selection callback: "+(choice?"selected":"dismissed"));
        const app=target;
        target=null;
        const token=++generation;
        try{
            chooser.setChoices([]);
            if(!choice)return;
            if(choice.action==="clear"){history=[];return;}
            if(choice.action==="pause"){paused=!paused;if(paused)history=[];count=pb.changeCount;return;}
            const entry=history.find(x=>String(x.id)===String(choice.id));
            if(!entry){console.warn("[Clipboard] Selection ID missing or expired");hs.notify.show("Clipboard","Entry expired");return;}
            const ok=entry.kind==="image"?pb.writeImage(entry.image):pb.writeString(entry.value);
            if(ok){
                count=pb.changeCount;
                history=rememberEntry(history,entry);
                console.log("[Clipboard] Restored "+entry.kind);
                const expectedCount=count;
                // The chooser hides before onSelect; wait for native focus restoration.
                const fallback=reason=>{console.warn("[Clipboard] Paste skipped: "+reason);hs.notify.show("Clipboard","Copied — paste with Cmd+V");};
                const paste=attempt=>{
                    if(token!==generation){console.log("[Clipboard] Paste cancelled: newer selection");return;}
                    if(pb.changeCount!==expectedCount){console.warn("[Clipboard] Paste cancelled: clipboard changed");return;}
                    try{
                        if(!app||!app.pid){fallback("no original app");return;}
                        if(hs.eventtap.isSecureInputEnabled()){fallback("secure input");return;}
                        if(chooser.isVisible||hs.application.frontmost()?.pid!==app.pid){
                            if(attempt<4)hs.timer.doAfter(0.1,()=>paste(attempt+1));
                            else fallback("focus not restored");
                            return;
                        }
                        // Physical ANSI V (9), independent of the current input source.
                        hs.eventtap.keyStroke(["cmd"],9,null);
                        console.log("[Clipboard] Paste shortcut sent");
                    }catch(_){fallback("key event failed");}
                };
                hs.timer.doAfter(0.12,()=>paste(0));
            }else {console.warn("[Clipboard] Pasteboard write failed");hs.notify.show("Clipboard","Unable to restore entry");}
        }catch(_){console.warn("[Clipboard] Selection handler failed");}
    };
    hs.timer.doEvery(0.5,sample);
    console.log("[Clipboard] READY — Option+1 (text + images)");
};
