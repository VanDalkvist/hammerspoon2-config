const config=hs.fs.homeDirectory()+"/.config/Hammerspoon2/";
for(const name of ["clipboard-history","pm2-status","browser-url"]){
    try{
        if(!hs.fs.attributes(config+name+".disabled"))require("./"+name+".js")(hs);
    }catch(_){console.warn("[Desktop utilities] "+name+" unavailable; check API and permissions");}
}
