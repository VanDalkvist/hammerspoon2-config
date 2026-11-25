const {remember,shouldSkip}=require("./desktop-logic.js");

module.exports=function startClipboard(hs){
    const pb=hs.pasteboard;
    let history=[], paused=false, count=pb.changeCount, warned=false;
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
            const text=pb.readString();
            if(pb.changeCount!==next||shouldSkip(types,bundle,secure,text))return;
            history=remember(history,text);
        }catch(_){if(!warned){warned=true;console.warn("[Clipboard] Read unavailable; check permissions");}}
    }
    const hotkey=hs.hotkey.bind(["cmd","alt"],"1",()=>{
        sample();
        const snapshot=history.slice();
        // Keep choice indices stable while the picker is open.
        chooser.setChoices([
            ...snapshot.map((s,index)=>({text:s.slice(0,120).replace(/\s+/g," "),subText:s.slice(0,350),value:s,index})),
            {text:"Clear history",action:"clear"},
            {text:paused?"Resume history":"Pause and clear history",action:"pause"}
        ]);
        chooser.query="";
        chooser.show();
    });
    if(!hotkey)throw Error("Clipboard shortcut unavailable");
    // Selection carries its own snapshot text; the clipboard may change while the picker is open.
    chooser.onSelect=choice=>{
        if(!choice)return;
        if(choice.action==="clear"){history=[];chooser.setChoices([]);return;}
        if(choice.action==="pause"){paused=!paused;if(paused)history=[];chooser.setChoices([]);count=pb.changeCount;return;}
        if(typeof choice.value==="string"&&pb.writeString(choice.value)){
            count=pb.changeCount;history=remember(history,choice.value);
            hs.notify.show("Clipboard","Copied — paste with Cmd+V");
        }
    };
    hs.timer.doEvery(0.5,sample);
    console.log("[Clipboard] READY — Cmd+Option+1");
};
