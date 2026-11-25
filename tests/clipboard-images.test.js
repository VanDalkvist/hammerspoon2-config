const assert=require("node:assert/strict");
const {imageTypes,imageCost,rememberEntry}=require("../modules/desktop-logic.js");
global.HSSize=class {constructor(w,h){this.w=w;this.h=h;}};
const startClipboard=require("../modules/clipboard-history.js");
function verifyImage(ok,imageTypes,imageCost,rememberEntry,startClipboard){
    let n=0;const test=f=>{f();n++;};
    test(()=>{ok(imageTypes(["public.png"]));ok(imageTypes(["public.tiff"]));ok(!imageTypes(["public.file-url","public.png"]));ok(!imageTypes(["public.utf8-plain-text"]));});
    test(()=>{ok(imageCost(100,200)===320000);ok(imageCost(0,100)===Infinity);});
    test(()=>{const a={id:1,kind:"image",image:{},cost:20};const b={id:2,kind:"image",image:{},cost:20};const t={id:3,kind:"text",value:"hello"};let h=rememberEntry([],a,50,10,30);h=rememberEntry(h,t,50,10,30);h=rememberEntry(h,b,50,10,30);ok(h.map(x=>x.id).join()==="2,3");ok(rememberEntry(h,{...t,id:4}).map(x=>x.id).join()==="4,2");});
    test(()=>{const a={id:1,kind:"image",image:{},cost:20};const b={id:2,kind:"image",image:{},cost:20};ok(rememberEntry([a],b,50,1,100).length===1);ok(rememberEntry([a],{...b,cost:101},50,10,100)[0]===a);});
    test(()=>{
        let tick,press,rows=[],restored=null,notice="",value=null,types=[],seq=0,reads=0,pastes=0,pending=[],front={bundleID:"editor",pid:42},secure=false;
        const img={size:{w:100,h:100},duplicate(){return {size:{w:100,h:100}};}};
        const pb={get changeCount(){return seq;},types:()=>types,readString:()=>value,readImage(){reads++;return img;},writeString(v){restored=v;seq++;return true;},writeImage(v){restored=v;seq++;return true;}};
        const chooser={setChoices(v){rows=v;},show(){}};
        const hs={pasteboard:pb,chooser:{create:()=>chooser},application:{frontmost:()=>front},eventtap:{isSecureInputEnabled:()=>secure,keyStroke(mods,key,app){ok(mods[0]==="cmd"&&key===9&&app===null);pastes++;}},hotkey:{bind(m,k,f){ok(k===18);press=f;return {};}},timer:{doEvery(_,f){tick=f;},doAfter(_,f){pending.push(f);}},notify:{show(_,s){notice=s;}}};
        startClipboard(hs);
        value="hello";types=["public.utf8-plain-text"];seq++;tick();
        value=null;types=["public.png"];seq++;tick();
        press();ok(rows[0].text.startsWith("Image"));ok(rows[1].text==="hello");ok(rows[0].image.size.w===96);const selected=rows[0];chooser.onSelect({...selected,id:String(selected.id)});ok(restored===img&&pastes===0);pending.shift()();ok(pastes===1);tick();press();ok(rows.filter(x=>x.text.startsWith("Image")).length===1);
        types=["public.png","org.nspasteboard.ConcealedType"];seq++;tick();ok(reads===1);
        const textRow=rows.find(x=>x.text==="hello");chooser.onSelect(textRow);ok(restored==="hello");pending.shift()();ok(pastes===2);
        press();chooser.onSelect(rows.find(x=>x.text==="hello"));front={bundleID:"other",pid:99};while(pending.length)pending.shift()();ok(pastes===2&&notice.includes("Copied"));
        front={bundleID:"editor",pid:42};press();chooser.onSelect(rows.find(x=>x.text==="hello"));seq++;pending.shift()();ok(pastes===2);
        press();chooser.onSelect(rows.find(x=>x.text==="hello"));secure=true;pending.shift()();ok(pastes===2);secure=false;
        press();const clear=rows.find(x=>x.action==="clear");chooser.onSelect(clear);press();ok(rows.every(x=>x.action));ok(pastes===2);
    });
    return n;
}
console.log(verifyImage(assert.ok,imageTypes,imageCost,rememberEntry,startClipboard)+" clipboard image checks passed");
