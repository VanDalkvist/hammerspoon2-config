const {summarizePM2}=require("./desktop-logic.js");

// Only inspect a live daemon. jlist itself may start PM2 if the daemon disappears in the race window.
const command='export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:$PATH"; command -v pm2 >/dev/null 2>&1 || exit 41; home="${PM2_HOME:-$HOME/.pm2}"; [ -S "$home/rpc.sock" ] && [ -r "$home/pm2.pid" ] || exit 42; pid=$(cat "$home/pm2.pid"); case "$pid" in ""|*[!0-9]*) exit 42;; esac; kill -0 "$pid" 2>/dev/null || exit 42; exec pm2 jlist';

module.exports=function startPM2(hs){
    const item=hs.menubar.create(false);
    let processes=[], status="Loading", active=null;
    function render(){
        const online=processes.filter(x=>x.status==="online").length;
        item.title=status==="Ready"?(processes.length?"PM2 "+online+"/"+processes.length:"PM2 0"):"PM2 ?";
        item.setTooltip("PM2 local process status — "+status);
        const rows=[{title:status==="Ready"?"Processes · "+online+"/"+processes.length+" online":status,disabled:true}];
        if(status==="Ready"){
            if(!processes.length)rows.push({title:"No managed processes",disabled:true});
            for(const p of processes){
                const cpu=p.cpu===null?"—":p.cpu+"%";
                const ram=p.memory===null?"—":Math.round(p.memory/1048576)+" MB";
                rows.push({title:(p.status==="online"?"● ":"○ ")+p.name+" · "+p.status,menu:[{title:"CPU "+cpu+" · RAM "+ram,disabled:true},{title:"Restarts: "+(p.restarts??"—"),disabled:true}]});
            }
        }
        rows.push({title:"-"},{title:active?"Refreshing…":"Refresh now",disabled:!!active,fn:refresh});
        item.setMenu(rows);
    }
    function refresh(){
        if(active)return;
        let output="", overflow=false, timer=null, task=null;
        status=status==="Ready"?"Ready":"Loading";
        const finish=code=>{
            if(timer)timer.stop();
            active=null;
            try{
                if(overflow)throw Error("Too much output");
                if(code===41){status="PM2 executable unavailable";processes=[];}
                else if(code===42){status="PM2 daemon offline";processes=[];}
                else if(code!==0){status="PM2 query failed";processes=[];}
                else{processes=summarizePM2(output);status="Ready";}
            }catch(_){status="PM2 response unavailable";processes=[];}
            output="";
            render();
        };
        try{
            task=hs.task.create("/bin/sh",["-c",command],finish,null,(stream,data)=>{
                if(stream!=="stdout"||overflow)return;
                if(output.length+data.length>4000000){overflow=true;output="";return;}
                output+=data;
            });
            active=task;
            timer=hs.timer.doAfter(8,()=>{if(active===task){task.kill9();}});
            task.start();
            task.closeInput();
            if(active===task&&!task.isRunning){/* termination callback handles normal quick exit */}
            render();
        }catch(_){if(timer)timer.stop();active=null;status="PM2 query unavailable";processes=[];render();}
    }
    render();
    refresh();
    hs.timer.doEvery(30,refresh);
    console.log("[PM2] READY");
};
