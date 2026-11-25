const config=hs.fs.homeDirectory()+"/.config/Hammerspoon2/";
for(const name of ["clipboard-history","pm2-status","browser-url"]){
    try{
        const flag=config+name+".disabled";
        const disabled=typeof hs.fs.exists==="function"?hs.fs.exists(flag):!!hs.fs.attributes(flag);
        if(disabled){console.log("[Desktop utilities] "+name+" DISABLED");continue;}
        require("./"+name+".js")(hs);
        console.log("[Desktop utilities] "+name+" LOADED");
    }catch(error){console.error("[Desktop utilities] "+name+" FAILED: "+String(error));}
}
