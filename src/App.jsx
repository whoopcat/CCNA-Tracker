import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { QUESTIONS } from "../questions.js";
import { COURSE, TOTAL_VIDEOS } from "../course.js";

const SB_URL=import.meta.env.VITE_SUPABASE_URL,SB_KEY=import.meta.env.VITE_SUPABASE_ANON_KEY;
const USE_SB=!!(SB_URL&&SB_KEY&&SB_URL!=="undefined");
let _sb=null;
const getSB=async()=>{if(_sb)return _sb;if(!USE_SB)return null;try{const{createClient}=await import("@supabase/supabase-js");_sb=createClient(SB_URL,SB_KEY);return _sb;}catch{return null;}};
const loadS=async(key,fb)=>{const db=await getSB();if(db){try{const{data}=await db.from("kv_store").select("value").eq("key",key).maybeSingle();if(data?.value)return JSON.parse(data.value);}catch{}}try{const v=localStorage.getItem(key);return v?JSON.parse(v):fb;}catch{return fb;}};
const saveS=async(key,val)=>{const str=JSON.stringify(val);const db=await getSB();if(db){try{await db.from("kv_store").upsert({key,value:str,updated_at:new Date().toISOString()});return;}catch{}}try{localStorage.setItem(key,str);}catch{}};

function UserAuth({onUser}){
  const[mode,setMode]=useState("login"),[email,setEmail]=useState(""),[pass,setPass]=useState(""),[err,setErr]=useState(""),[busy,setBusy]=useState(false);
  const submit=async e=>{e.preventDefault();setErr("");setBusy(true);const db=await getSB();if(!db){setErr("Supabase not configured");setBusy(false);return;}const fn=mode==="login"?db.auth.signInWithPassword.bind(db.auth):db.auth.signUp.bind(db.auth);const{data,error}=await fn({email,password:pass});if(error){setErr(error.message);setBusy(false);return;}if(data?.user)onUser(data.user);setBusy(false);};
  return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",minHeight:"80vh",background:"#0d1117",fontFamily:'"Courier New",Courier,monospace',color:"#e2e8f0"}}>
    <div style={{background:"#111827",border:"1px solid #1e2a3a",borderRadius:12,padding:"32px 28px",width:"100%",maxWidth:360}}>
      <div style={{fontSize:16,fontWeight:700,color:"#00c896",letterSpacing:"0.1em",marginBottom:4}}>CCNA 200-301</div>
      <div style={{fontSize:11,color:"#4a5568",marginBottom:24,letterSpacing:"0.07em",textTransform:"uppercase"}}>{mode==="login"?"sign in":"create account"}</div>
      <form onSubmit={submit} style={{display:"flex",flexDirection:"column",gap:14}}>
        <div><label style={lbl}>Email</label><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} required autoFocus/></div>
        <div><label style={lbl}>Password</label><input style={inp} type="password" value={pass} onChange={e=>setPass(e.target.value)} required minLength={6}/></div>
        {err&&<div style={{fontSize:12,color:"#f43f5e",background:"#210a10",borderRadius:6,padding:"8px 10px"}}>{err}</div>}
        <button type="submit" disabled={busy} style={{background:"#00c896",color:"#0a2018",border:"none",borderRadius:8,padding:"10px",fontSize:13,fontWeight:700,cursor:busy?"not-allowed":"pointer",letterSpacing:"0.05em",fontFamily:"inherit"}}>{busy?"...":(mode==="login"?"Sign in":"Create account")}</button>
        <div style={{textAlign:"center",fontSize:12,color:"#4a5568"}}>{mode==="login"?"No account? ":"Have an account? "}<button type="button" onClick={()=>{setMode(m=>m==="login"?"signup":"login");setErr("");}} style={{background:"none",border:"none",cursor:"pointer",color:"#00c896",fontSize:12,fontFamily:"inherit",textDecoration:"underline"}}>{mode==="login"?"Sign up":"Sign in"}</button></div>
      </form>
    </div>
  </div>);
}

const BASE_PHASES=[
  {id:1,label:"Consolidation & gap-fill",short:"Phase 1",color:"#7c6df0",dim:"#1a1430",weight:0.15,topics:["Quick review: VLANs, trunking, STP","Quick review: OSPF single-area","Quick review: HSRP, PAgP/LACP","NAT/PAT  -  concepts + config","IPv6 addressing & routing basics","IP services: NTP, DHCP, DNS roles","Subnetting speed drills (aim <90s)","Packet Tracer: end-to-end lab walkthrough"]},
  {id:2,label:"Network security",short:"Phase 2",color:"#00c896",dim:"#0a2018",weight:0.28,topics:["Device hardening: passwords, SSH, banners","AAA with RADIUS & TACACS+","Standard & extended ACLs","Named ACLs & troubleshooting","Port security on switches","DHCP snooping & Dynamic ARP Inspection","802.1X port-based authentication","VPN concepts: site-to-site & remote access","IPsec fundamentals","Firewall concepts: stateful vs stateless","Common threats: VLAN hopping, spoofing, MITM","Security programme concepts (CIA triad)"]},
  {id:3,label:"Wireless",short:"Phase 3",color:"#f59e0b",dim:"#211a08",weight:0.27,topics:["802.11 standards: a/b/g/n/ac/ax","RF fundamentals: SSID, BSSID, bands, channels","Infrastructure vs ad-hoc modes","Autonomous APs vs WLC-managed APs","WLC architecture: data & control plane","CAPWAP protocol","Wireless roaming & client association","WPA, WPA2, WPA3  -  key differences","EAP methods overview","Common wireless threats & mitigations","Basic WLC config concepts (GUI-based)","Wireless site survey basics"]},
  {id:4,label:"Labs, mocks & weak spots",short:"Phase 4",color:"#f97316",dim:"#211208",weight:0.24,topics:["Full mock exams (Boson or Pearson)","Packet Tracer: security scenario labs","Packet Tracer: wireless config labs","Timed subnetting drills","Review all missed mock questions","CLI command recall flashcards","Weak topic deep-dives (from mock results)","End-to-end troubleshooting scenarios"]},
  {id:5,label:"Final review & exam",short:"Phase 5",color:"#f43f5e",dim:"#210a10",weight:0.06,topics:["Review your personal weak-spot notes","One final full mock exam","Quick-read: Cisco config command sheet","Light lab: security + wireless scenario","Rest 48 hrs before exam day","Exam day: read fully, flag & return"]},
];
const TOTAL_TOPICS=BASE_PHASES.reduce((s,p)=>s+p.topics.length,0);

const BUILT_IN_CARDS=[
  {q:"What layer does a router operate at and what does it use to forward?",a:"Layer 3 (Network). Uses destination IP address and routing table to make forwarding decisions."},
  {q:"OSPF Router ID selection order?",a:"1) Manually configured (router-id), 2) Highest loopback IP, 3) Highest active interface IP."},
  {q:"DHCP DORA  -  what are the 4 steps?",a:"Discover (client broadcast) -> Offer (server) -> Request (client) -> Acknowledge (server)."},
  {q:"RADIUS vs TACACS+  -  3 key differences?",a:"RADIUS: UDP 1812/1813, open standard, combines auth+authz. TACACS+: TCP 49, Cisco, full encryption, separates auth/authz/accounting."},
  {q:"Port security violation modes?",a:"shutdown (err-disable  -  default, most secure), restrict (drop + log), protect (drop silently, no log)."},
  {q:"What DSCP value is used for voice (EF)?",a:"DSCP 46 = Expedited Forwarding (EF). Used for voice to ensure lowest latency queuing."},
  {q:"Non-overlapping 2.4GHz Wi-Fi channels?",a:"Channels 1, 6, and 11. Only these three do not overlap in the 2.4 GHz band."},
  {q:"CAPWAP ports between LAP and WLC?",a:"UDP 5246 = control plane (encrypted). UDP 5247 = data plane."},
  {q:"EUI-64 process from MAC to IPv6 Interface ID?",a:"1) Split 48-bit MAC in half. 2) Insert FFFE in middle (making 64 bits). 3) Flip bit 7 (universal/local bit)."},
  {q:"OSPF neighbour states in order?",a:"Down -> Init -> 2-Way -> ExStart -> Exchange -> Loading -> Full"},
  {q:"WPA2 Personal vs Enterprise difference?",a:"Personal: pre-shared key (PSK). Enterprise: 802.1X with RADIUS server for per-user authentication."},
  {q:"What does DHCP Snooping prevent?",a:"Rogue DHCP servers. Trusted ports can send offers; untrusted (client) ports cannot. Builds binding table used by DAI."},
  {q:"What does DAI (Dynamic ARP Inspection) prevent?",a:"ARP spoofing/poisoning (MITM). Validates ARP packets against DHCP Snooping binding table on untrusted ports."},
  {q:"Standard ACL: match on what, place where?",a:"Match: source IP only. Place: close to destination (can't filter by dest, so apply near where traffic is going)."},
  {q:"Extended ACL: match on what, place where?",a:"Match: src IP, dst IP, protocol, port. Place: close to source (drop traffic early to save bandwidth)."},
  {q:"Implicit rule at end of every ACL?",a:"Implicit deny any  -  all traffic not explicitly permitted is denied. This is invisible but always present."},
  {q:"Which FHRP load-balances across multiple routers?",a:"GLBP (Gateway Load Balancing Protocol)  -  up to 4 Active Virtual Forwarders. HSRP and VRRP only have one active router."},
  {q:"How does STP elect the root bridge?",a:"Lowest Bridge ID wins. Bridge ID = Priority (default 32768, in multiples of 4096) + MAC address."},
  {q:"What is PortFast and when to use it?",a:"Skips STP listening/learning states for immediate forwarding. Use ONLY on access ports connected to end devices (PCs, printers, not switches)."},
  {q:"What does BPDU Guard do?",a:"Immediately err-disables a port if it receives a BPDU. Protects PortFast-enabled ports from rogue switches being connected."},
  {q:"EAP-TLS vs PEAP  -  which needs client cert?",a:"EAP-TLS: BOTH server AND client need certificates (most secure). PEAP: only server cert; client uses username/password inside encrypted tunnel."},
  {q:"Syslog severity levels 0-4?",a:"0=Emergency, 1=Alert, 2=Critical, 3=Error, 4=Warning. Mnemonic: Every Awesome Cisco Engineer Will..."},
  {q:"What does 'ip helper-address' do?",a:"DHCP relay  -  configures a router interface to forward DHCP client broadcasts as unicast to the specified DHCP server IP."},
  {q:"How does PAT differ from dynamic NAT?",a:"Dynamic NAT: one public IP per host from a pool. PAT (overload): MANY hosts share ONE public IP, differentiated by unique source port numbers."},
  {q:"IPv6 link-local prefix and properties?",a:"FE80::/10. Auto-configured on every IPv6 interface. NOT routable beyond the local link. Required for NDP/neighbour discovery."},
  {q:"STP path cost for 1 Gbps link?",a:"Cost = 4 (with default reference bandwidth 20000). Older default was 100Mbps ref -> GigE=4. Set 'auto-cost reference-bandwidth 1000' for accuracy."},
  {q:"What are the 3 OSPF LSA types for CCNA?",a:"Type 1 (Router LSA  -  every router), Type 2 (Network LSA  -  DR on broadcast segment), Type 3 (Summary LSA  -  ABR between areas)."},
  {q:"HSRP hello timer and hold timer defaults?",a:"Hello: 3 seconds. Hold (dead): 10 seconds. HSRPv2 allows millisecond timers for faster failover."},
  {q:"What is 802.1X and its three roles?",a:"Port-based network access control. Supplicant (client device), Authenticator (switch/AP  -  passes EAP to RADIUS), Authentication Server (RADIUS  -  makes the decision)."},
  {q:"NTP stratum levels  -  what do they mean?",a:"Stratum 0 = atomic clock (reference). Stratum 1 = directly connected to stratum 0. Each hop adds 1. Stratum 16 = unsynchronised/invalid."},
];

const todayStr=()=>new Date().toISOString().split("T")[0];
const fmtDate=d=>{try{return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"});}catch{return d;}};
const fmtShort=d=>{try{return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"});}catch{return d;}};
const daysUntil=d=>Math.ceil((new Date(d+"T00:00:00")-Date.now())/86400000);
const pad2=n=>String(n).padStart(2,"0");
const shuffle=arr=>{const a=[...arr];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const tk=(pid,i)=>`p${pid}_t${i}`;

function getPhases(examDate){
  if(!examDate)return BASE_PHASES.map((p,i)=>({...p,startDate:"",endDate:""}));
  const today=new Date();today.setHours(0,0,0,0);
  const exam=new Date(examDate+"T00:00:00");
  const totalDays=Math.max(1,Math.ceil((exam-today)/86400000));
  let cursor=new Date(today);
  return BASE_PHASES.map(p=>{
    const phaseDays=Math.round(totalDays*p.weight);
    const start=new Date(cursor);
    cursor.setDate(cursor.getDate()+phaseDays);
    const end=new Date(cursor);end.setDate(end.getDate()-1);
    return{...p,startDate:start.toISOString().split("T")[0],endDate:end.toISOString().split("T")[0]};
  });
}
function getStreak(sessions){if(!sessions.length)return 0;const days=[...new Set(sessions.map(s=>s.date))].sort().reverse();let c=0,cur=new Date();cur.setHours(0,0,0,0);for(const d of days){const dt=new Date(d+"T00:00:00");const diff=Math.round((cur-dt)/86400000);if(diff>1)break;c++;cur=dt;}return c;}

const card={background:"#111827",borderRadius:10,padding:"14px 16px",border:"1px solid #1e2a3a"};
const inp={background:"#111827",border:"1px solid #1e2a3a",borderRadius:8,color:"#e2e8f0",padding:"10px 12px",fontSize:13,fontFamily:"monospace",width:"100%",boxSizing:"border-box",outline:"none"};
const lbl={fontSize:11,color:"#4a5568",display:"block",marginBottom:6,textTransform:"uppercase",letterSpacing:"0.07em"};

function Ring({pct,size=80,stroke=7,color="#00c896"}){const r=(size-stroke)/2,circ=2*Math.PI*r,dash=pct/100*circ;return(<svg width={size} height={size} style={{transform:"rotate(-90deg)"}}><circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2a3a" strokeWidth={stroke}/><circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.5s"}}/></svg>);}

function Heatmap({sessions}){
  const today=new Date();today.setHours(0,0,0,0);const weeks=18,ndays=weeks*7;const map={};sessions.forEach(s=>{map[s.date]=(map[s.date]||0)+s.hrs;});
  const start=new Date(today);start.setDate(start.getDate()-ndays+1);const cells=[];for(let i=0;i<ndays;i++){const d=new Date(start);d.setDate(start.getDate()+i);cells.push(d.toISOString().split("T")[0]);}
  const color=h=>h<=0?"#1e2a3a":h<1?"#1a3a2a":h<2?"#0d6e4a":h<4?"#00a870":"#00c896";const sz=11,gap=2,step=sz+gap,W=weeks*step,H=7*step+18;
  const seenM=new Set(),mL=[];cells.forEach((d,i)=>{const col=Math.floor(i/7);const m=new Date(d+"T12:00:00").toLocaleDateString("en-GB",{month:"short"});if(!seenM.has(m)){seenM.add(m);mL.push({col,m});}});
  return(<div style={{overflowX:"auto"}}><svg width={W} height={H} style={{display:"block"}}>{mL.map(({col,m})=><text key={m} x={col*step} y={10} style={{fill:"#4a5568",fontSize:9,fontFamily:"monospace"}}>{m}</text>)}{cells.map((d,i)=>{const col=Math.floor(i/7),row=i%7,hrs=map[d]||0,isT=d===todayStr();return<rect key={d} x={col*step} y={row*step+16} width={sz} height={sz} rx={2} fill={color(hrs)} stroke={isT?"#00c896":"none"} strokeWidth={isT?1:0}><title>{d}: {hrs>0?hrs+"h":"no study"}</title></rect>;})}{["","M","","W","","F",""].map((l,i)=>l&&<text key={i} x={-2} y={i*step+16+sz/2+4} textAnchor="end" style={{fill:"#4a5568",fontSize:8,fontFamily:"monospace"}}>{l}</text>)}</svg><div style={{display:"flex",gap:8,alignItems:"center",marginTop:6,fontSize:10,color:"#4a5568"}}><span>Less</span>{[0,0.5,2,3,5].map(h=><div key={h} style={{width:10,height:10,borderRadius:2,background:color(h)}}/>)}<span>More</span></div></div>);
}

function Dashboard({checked,sessions,examDate,setExamDate,setTab,phases}){
  const topicsDone=BASE_PHASES.reduce((s,p)=>s+p.topics.filter((_,i)=>checked[tk(p.id,i)]).length,0);
  const pct=Math.round(topicsDone/TOTAL_TOPICS*100);
  const streak=getStreak(sessions),total=sessions.reduce((s,x)=>s+x.hrs,0);
  const weekHrs=sessions.filter(s=>(Date.now()-new Date(s.date+"T12:00:00"))<7*86400000).reduce((s,x)=>s+x.hrs,0);
  const vidsDone=COURSE.filter(v=>checked[`vid_${v.day}`]).length;
  const countdown=examDate?daysUntil(examDate):null;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {examDate&&countdown!==null?(
        <div style={{...card,display:"flex",alignItems:"center",gap:16,borderColor:countdown<30?"#f43f5e44":"#1e2a3a"}}>
          <div style={{textAlign:"center",minWidth:56}}>
            <div style={{fontSize:30,fontWeight:700,color:countdown<30?"#f43f5e":countdown<60?"#f59e0b":"#00c896",fontFamily:"monospace"}}>{Math.max(0,countdown)}</div>
            <div style={{fontSize:10,color:"#4a5568"}}>days</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:"#94a3b8"}}>Exam: <span style={{color:"#e2e8f0"}}>{fmtDate(examDate)}</span></div>
            <div style={{height:3,background:"#1e2a3a",borderRadius:2,marginTop:8,overflow:"hidden"}}><div style={{width:`${pct}%`,height:"100%",background:countdown<30?"#f43f5e":countdown<60?"#f59e0b":"#00c896",borderRadius:2,transition:"width 0.5s"}}/></div>
            <div style={{fontSize:11,color:"#4a5568",marginTop:3}}>{pct}% topics * phases auto-scaled to your date</div>
          </div>
          <button onClick={()=>setExamDate("")} style={{background:"none",border:"none",color:"#2d3748",cursor:"pointer",fontSize:18}} onMouseEnter={e=>e.target.style.color="#f43f5e"} onMouseLeave={e=>e.target.style.color="#2d3748"}>x</button>
        </div>
      ):(
        <div style={{...card,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,fontSize:12,color:"#4a5568"}}>Set your exam date  -  phases auto-schedule around it</div>
          <input type="date" onChange={e=>setExamDate(e.target.value)} style={{background:"#1e2a3a",border:"1px solid #2d3748",borderRadius:6,color:"#e2e8f0",padding:"7px 10px",fontSize:12,fontFamily:"monospace"}}/>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[{label:"Streak",val:`${streak}d`,color:"#f59e0b"},{label:"This week",val:`${weekHrs.toFixed(1)}h`,color:"#7c6df0"},{label:"Total hrs",val:`${total.toFixed(1)}h`,color:"#00c896"},{label:"Videos",val:`${vidsDone}/${TOTAL_VIDEOS}`,color:"#f97316"}].map(s=>(
          <div key={s.label} style={card}><div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{s.label}</div><div style={{fontSize:22,fontWeight:700,color:s.color,fontFamily:"monospace"}}>{s.val}</div></div>
        ))}
      </div>
      <div style={card}>
        <div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Phase progress</div>
        {phases.map(p=>{const d=p.topics.filter((_,i)=>checked[tk(p.id,i)]).length;return(
          <div key={p.id} onClick={()=>setTab("phases")} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
            <div style={{flex:1,minWidth:0}}><div style={{fontSize:11,color:"#94a3b8",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.label}</div>{p.startDate&&<div style={{fontSize:10,color:"#2d3748"}}>{fmtShort(p.startDate)} - {fmtShort(p.endDate)}</div>}</div>
            <div style={{width:90,height:3,background:"#1e2a3a",borderRadius:2,flexShrink:0,overflow:"hidden"}}><div style={{width:`${Math.round(d/p.topics.length*100)}%`,height:"100%",background:p.color,borderRadius:2,transition:"width 0.4s"}}/></div>
            <div style={{fontSize:10,color:"#4a5568",minWidth:28,textAlign:"right",fontFamily:"monospace"}}>{d}/{p.topics.length}</div>
          </div>
        );})}
      </div>
      <div style={card}><div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Activity  -  18 weeks</div><Heatmap sessions={sessions}/></div>
    </div>
  );
}

function Phases({checked,notes,weak,toggleTopic,setNotes,setWeak,openPhase,setOpenPhase,phases}){
  const [editNote,setEditNote]=useState(null),[noteVal,setNoteVal]=useState("");
  return(<div style={{display:"flex",flexDirection:"column",gap:8}}>{phases.map(p=>{
    const done=p.topics.filter((_,i)=>checked[tk(p.id,i)]).length,isOpen=openPhase===p.id,weakCount=p.topics.filter((_,i)=>weak[tk(p.id,i)]).length;
    return(<div key={p.id} style={{border:`1px solid ${isOpen?p.color+"55":"#1e2a3a"}`,borderRadius:10,overflow:"hidden"}}>
      <div onClick={()=>setOpenPhase(isOpen?null:p.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer",background:isOpen?p.dim:"transparent"}}>
        <div style={{width:9,height:9,borderRadius:"50%",background:p.color,flexShrink:0}}/>
        <div style={{flex:1}}><div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{p.label}</div><div style={{fontSize:11,color:"#4a5568"}}>{p.startDate&&p.endDate?`${fmtShort(p.startDate)} - ${fmtShort(p.endDate)}`:"Set exam date to see schedule"}</div></div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>{weakCount>0&&<span style={{fontSize:10,color:"#f97316",background:"#211208",borderRadius:10,padding:"2px 7px"}}>{weakCount} weak</span>}<span style={{fontSize:11,color:p.color,fontFamily:"monospace"}}>{done}/{p.topics.length}</span><span style={{fontSize:10,color:"#4a5568"}}>{isOpen?"^":"v"}</span></div>
      </div>
      <div style={{height:2,background:"#1e2a3a"}}><div style={{width:`${Math.round(done/p.topics.length*100)}%`,height:"100%",background:p.color,transition:"width 0.4s"}}/></div>
      {isOpen&&(<div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:2}}>{p.topics.map((t,i)=>{const k=tk(p.id,i),isDone=checked[k],isWeak=weak[k],hasNote=notes[k];return(
        <div key={i} style={{borderRadius:6,overflow:"hidden"}}>
          <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",background:isDone?p.dim:"transparent"}}>
            <div onClick={()=>toggleTopic(p.id,i)} style={{width:15,height:15,borderRadius:3,border:`1.5px solid ${isDone?p.color:"#2d3748"}`,background:isDone?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>{isDone&&<span style={{fontSize:9,color:"#0d1117",fontWeight:700}}>✓</span>}</div>
            <span onClick={()=>toggleTopic(p.id,i)} style={{flex:1,fontSize:12,color:isDone?"#64748b":"#cbd5e1",textDecoration:isDone?"line-through":"none",cursor:"pointer",lineHeight:1.4}}>{t}</span>
            <button onClick={()=>setWeak({...weak,[k]:!isWeak})} style={{background:"none",border:"none",cursor:"pointer",fontSize:12,padding:"0 2px",opacity:isWeak?1:0.3,color:"#f97316"}}>!</button>
            <button onClick={()=>editNote===k?setEditNote(null):(setEditNote(k),setNoteVal(notes[k]||""))} style={{background:"none",border:"none",cursor:"pointer",fontSize:11,padding:"0 2px",color:hasNote?"#7c6df0":"#4a5568",opacity:hasNote?1:0.5}}>📝</button>
          </div>
          {editNote===k&&(<div style={{padding:"6px 8px 8px 31px",background:"#111827"}}><textarea value={noteVal} onChange={e=>setNoteVal(e.target.value)} rows={2} placeholder="Notes..." style={{...inp,resize:"vertical"}}/><div style={{display:"flex",gap:6,marginTop:4}}><button onClick={()=>{setNotes({...notes,[k]:noteVal});setEditNote(null);}} style={{background:"#00c896",border:"none",borderRadius:5,color:"#0d1117",fontSize:11,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"monospace"}}>save</button><button onClick={()=>setEditNote(null)} style={{background:"#1e2a3a",border:"none",borderRadius:5,color:"#4a5568",fontSize:11,padding:"4px 10px",cursor:"pointer",fontFamily:"monospace"}}>cancel</button></div></div>)}
          {editNote!==k&&notes[k]&&(<div onClick={()=>{setEditNote(k);setNoteVal(notes[k]);}} style={{padding:"4px 8px 6px 31px",background:"#111827",fontSize:11,color:"#64748b",cursor:"pointer",lineHeight:1.5}}>{notes[k]}</div>)}
        </div>
      );})}</div>)}
    </div>);
  })}</div>);
}

function RecallCard({q,a,color}){const[show,setShow]=useState(false);return(<div style={{background:"#111827",border:`1px solid ${color}33`,borderRadius:8,padding:"10px 12px"}}><div style={{fontSize:12,color:"#e2e8f0",marginBottom:8,lineHeight:1.5}}>{q}</div>{a&&<button onClick={()=>setShow(s=>!s)} style={{background:show?color+"22":"#1e2a3a",border:`1px solid ${color}44`,borderRadius:6,color:show?color:"#4a5568",fontSize:11,padding:"4px 12px",cursor:"pointer",fontFamily:"monospace"}}>{show?"hide":"reveal answer"}</button>}{show&&a&&<div style={{fontSize:12,color:"#94a3b8",marginTop:8,lineHeight:1.6,borderTop:`1px solid ${color}22`,paddingTop:8}}>{a}</div>}</div>);}

function Course({checked,toggleVid,notes,setNotes}){
  const[open,setOpen]=useState(null),[vtab,setVtab]=useState("summary");
  const done=COURSE.filter(v=>checked[`vid_${v.day}`]).length;
  const byPhase={1:[],2:[],3:[],4:[]};COURSE.forEach(v=>{if(byPhase[v.phase])byPhase[v.phase].push(v);});
  const PC={1:"#7c6df0",2:"#00c896",3:"#f59e0b",4:"#f97316"};
  const PL={1:"Phase 1  -  Consolidation",2:"Phase 2  -  Security & Routing",3:"Phase 3  -  Wireless & Cloud",4:"Phase 4  -  Automation"};
  return(<div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}><div style={{fontSize:12,color:"#4a5568"}}>Jeremy's IT Lab  -  CCNA Full Course</div><div style={{fontSize:11,color:"#00c896",fontFamily:"monospace"}}>{done}/{TOTAL_VIDEOS} watched</div></div>
    <div style={{height:3,background:"#1e2a3a",borderRadius:2,marginBottom:16,overflow:"hidden"}}><div style={{width:`${Math.round(done/TOTAL_VIDEOS*100)}%`,height:"100%",background:"#00c896",borderRadius:2,transition:"width 0.4s"}}/></div>
    {[1,2,3,4].map(ph=>{const vids=byPhase[ph]||[],phDone=vids.filter(v=>checked[`vid_${v.day}`]).length;return(<div key={ph} style={{marginBottom:16}}>
      <div style={{fontSize:11,color:PC[ph],textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:8,display:"flex",justifyContent:"space-between"}}><span>{PL[ph]}</span><span style={{fontFamily:"monospace"}}>{phDone}/{vids.length}</span></div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>{vids.map(v=>{const k=`vid_${v.day}`,isDone=checked[k],isOpen=open===v.day;return(<div key={v.day} style={{border:`1px solid ${isOpen?PC[ph]+"55":"#1e2a3a"}`,borderRadius:10,overflow:"hidden"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:isOpen?PC[ph]+"11":"transparent"}}>
          <div onClick={()=>toggleVid(v.day)} style={{width:15,height:15,borderRadius:3,border:`1.5px solid ${isDone?PC[ph]:"#2d3748"}`,background:isDone?PC[ph]:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer"}}>{isDone&&<span style={{fontSize:9,color:"#0d1117",fontWeight:700}}>✓</span>}</div>
          <div onClick={()=>setOpen(isOpen?null:v.day)} style={{flex:1,cursor:"pointer"}}><div style={{fontSize:12,fontWeight:600,color:isDone?"#64748b":"#e2e8f0",textDecoration:isDone?"line-through":"none"}}>Day {v.day}: {v.title}</div><div style={{fontSize:10,color:"#4a5568"}}>{v.mins} min</div></div>
          <a href={v.url} target="_blank" rel="noopener noreferrer" onClick={e=>e.stopPropagation()} style={{fontSize:10,color:PC[ph],textDecoration:"none",background:PC[ph]+"22",borderRadius:6,padding:"4px 8px",flexShrink:0}}>Watch</a>
          <div onClick={()=>setOpen(isOpen?null:v.day)} style={{fontSize:10,color:"#4a5568",cursor:"pointer",marginLeft:4}}>{isOpen?"^":"v"}</div>
        </div>
        {isOpen&&(<div style={{padding:"12px 14px",borderTop:"1px solid #1e2a3a"}}>
          <div style={{display:"flex",gap:4,marginBottom:12}}>{["summary","recall","notes"].map(t=><button key={t} onClick={()=>setVtab(t)} style={{background:vtab===t?PC[ph]:"#1e2a3a",border:"none",borderRadius:6,color:vtab===t?"#0d1117":"#4a5568",fontSize:11,padding:"5px 12px",cursor:"pointer",fontFamily:"monospace",fontWeight:vtab===t?700:400}}>{t}</button>)}</div>
          {vtab==="summary"&&<ul style={{margin:0,padding:0,listStyle:"none",display:"flex",flexDirection:"column",gap:6}}>{v.summary.map((s,i)=><li key={i} style={{display:"flex",gap:8,fontSize:12,color:"#94a3b8",lineHeight:1.5}}><span style={{color:PC[ph],flexShrink:0,marginTop:2}}>›</span>{s}</li>)}</ul>}
          {vtab==="recall"&&<div style={{display:"flex",flexDirection:"column",gap:8}}>{v.recall.map((q,i)=><RecallCard key={i} q={q} color={PC[ph]}/>)}</div>}
          {vtab==="notes"&&<div><textarea value={notes[k]||""} onChange={e=>setNotes({...notes,[k]:e.target.value})} rows={4} placeholder="Your notes for this video..." style={{...inp,resize:"vertical",lineHeight:1.6}}/><div style={{fontSize:10,color:"#4a5568",marginTop:4}}>Notes auto-saved</div></div>}
        </div>)}
      </div>);})}</div>
    </div>);})}
  </div>);
}

function Quiz({quizHistory,setQuizHistory}){
  const[active,setActive]=useState(false),[qSet,setQSet]=useState([]),[idx,setIdx]=useState(0),[sel,setSel]=useState([]),[rev,setRev]=useState(false),[score,setScore]=useState(0),[showRes,setShowRes]=useState(false);
  const SIZE=20;
  const start=()=>{setQSet(shuffle(QUESTIONS).slice(0,SIZE));setIdx(0);setSel([]);setRev(false);setScore(0);setActive(true);setShowRes(false);};
  const toggleOpt=o=>{if(rev)return;const q=qSet[idx];if(!q.multi)setSel([o]);else setSel(s=>s.includes(o)?s.filter(x=>x!==o):[...s,o]);};
  const isOK=()=>{const q=qSet[idx];return[...q.ans].sort().join(",")===[...sel].sort().join(",");};
  const next=()=>{const c=isOK()?1:0,ns=score+c;if(idx+1>=SIZE){setScore(ns);setQuizHistory([{date:todayStr(),correct:ns,total:SIZE,pct:Math.round(ns/SIZE*100)},...quizHistory]);setShowRes(true);setActive(false);}else{setScore(s=>s+c);setIdx(i=>i+1);setSel([]);setRev(false);}};
  if(showRes){const pct=Math.round(score/SIZE*100);const clr=pct>=85?"#00c896":pct>=70?"#f59e0b":"#f43f5e";return(<div style={{textAlign:"center",padding:"30px 0"}}><div style={{fontSize:48,fontWeight:700,color:clr,fontFamily:"monospace",marginBottom:8}}>{pct}%</div><div style={{fontSize:14,color:"#94a3b8",marginBottom:4}}>{score}/{SIZE} correct</div><div style={{fontSize:12,color:"#4a5568",marginBottom:24}}>{pct>=85?"Exam-ready 🎯":pct>=70?"Good  -  keep going":"Review weak areas"}</div><button onClick={start} style={{background:"#00c896",border:"none",borderRadius:8,color:"#0d1117",fontWeight:700,fontSize:13,padding:"11px 24px",cursor:"pointer",fontFamily:"monospace"}}>new quiz →</button></div>);}
  if(!active){const best=quizHistory.length?Math.max(...quizHistory.map(h=>h.pct)):0,avg=quizHistory.length?Math.round(quizHistory.reduce((s,h)=>s+h.pct,0)/quizHistory.length):0;return(<div><div style={{...card,marginBottom:16,textAlign:"center"}}><div style={{fontSize:13,color:"#4a5568",marginBottom:4}}>300 real exam questions from your question bank</div><div style={{fontSize:12,color:"#4a5568",marginBottom:16}}>20 random questions per quiz * multi-select supported</div><button onClick={start} style={{background:"#00c896",border:"none",borderRadius:8,color:"#0d1117",fontWeight:700,fontSize:13,padding:"11px 24px",cursor:"pointer",fontFamily:"monospace"}}>start quiz →</button></div>{quizHistory.length>0&&(<div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>{[{l:"Best",v:`${best}%`,c:"#00c896"},{l:"Average",v:`${avg}%`,c:"#7c6df0"}].map(s=><div key={s.l} style={card}><div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",marginBottom:4}}>{s.l}</div><div style={{fontSize:22,fontWeight:700,color:s.c,fontFamily:"monospace"}}>{s.v}</div></div>)}</div>{quizHistory.slice(0,5).map((h,i)=>{const clr=h.pct>=85?"#00c896":h.pct>=70?"#f59e0b":"#f43f5e";return(<div key={i} style={{...card,display:"flex",alignItems:"center",gap:12,marginBottom:6}}><div style={{fontSize:20,fontWeight:700,color:clr,fontFamily:"monospace",minWidth:44}}>{h.pct}%</div><div style={{flex:1,fontSize:12,color:"#64748b"}}>{h.correct}/{h.total} correct</div><div style={{fontSize:11,color:"#4a5568"}}>{fmtDate(h.date)}</div></div>);})}</div>)}</div>);}
  const q=qSet[idx];
  return(<div>
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}><div style={{fontSize:11,color:"#4a5568",fontFamily:"monospace"}}>Q {idx+1}/{SIZE}</div><div style={{fontSize:11,color:"#00c896",fontFamily:"monospace"}}>{score} ✓</div><div style={{fontSize:11,color:"#4a5568"}}>{q.multi?"multi-select":"single"}</div></div>
    <div style={{height:3,background:"#1e2a3a",borderRadius:2,marginBottom:16,overflow:"hidden"}}><div style={{width:`${(idx/SIZE)*100}%`,height:"100%",background:"#00c896",transition:"width 0.3s"}}/></div>
    <div style={{...card,marginBottom:12}}><div style={{fontSize:13,color:"#e2e8f0",lineHeight:1.6}}>{q.q}</div></div>
    <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:12}}>{Object.entries(q.opts).map(([k,v])=>{const isSel=sel.includes(k),isAns=q.ans.includes(k);let bg="#111827",border="1px solid #1e2a3a",color="#cbd5e1";if(rev){if(isAns){bg="#0a2018";border="1px solid #00c89655";color="#00c896";}else if(isSel){bg="#210a10";border="1px solid #f43f5e55";color="#f43f5e";}}else if(isSel){bg="#1a1430";border="1px solid #7c6df055";}return(<div key={k} onClick={()=>toggleOpt(k)} style={{background:bg,border,borderRadius:8,padding:"10px 14px",cursor:rev?"default":"pointer",display:"flex",gap:10,alignItems:"flex-start",transition:"all 0.15s"}}><div style={{width:18,height:18,borderRadius:4,border:`1.5px solid ${rev&&isAns?"#00c896":rev&&isSel&&!isAns?"#f43f5e":isSel?"#7c6df0":"#2d3748"}`,background:rev&&isAns?"#00c896":rev&&isSel&&!isAns?"#f43f5e":isSel&&!rev?"#7c6df0":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>{(isSel||rev&&isAns)&&<span style={{fontSize:9,color:"#0d1117",fontWeight:700}}>{rev&&isAns?"✓":rev&&isSel&&!isAns?"✗":"✓"}</span>}</div><span style={{fontSize:12,color,lineHeight:1.5}}><strong style={{color:"#4a5568",marginRight:4}}>{k}.</strong>{v}</span></div>);})}</div>
    {!rev&&<button onClick={()=>setRev(true)} disabled={!sel.length} style={{background:sel.length?"#7c6df0":"#1e2a3a",border:"none",borderRadius:8,color:sel.length?"#0d1117":"#4a5568",fontWeight:700,fontSize:13,padding:"11px",cursor:sel.length?"pointer":"not-allowed",fontFamily:"monospace",width:"100%"}}>check answer</button>}
    {rev&&<div><div style={{...card,marginBottom:8,borderColor:isOK()?"#00c89633":"#f43f5e33",background:isOK()?"#0a2018":"#210a10"}}><div style={{fontSize:13,color:isOK()?"#00c896":"#f43f5e",fontWeight:600}}>{isOK()?"✓ Correct!":"✗ Incorrect"}</div><div style={{fontSize:12,color:"#64748b",marginTop:4}}>Answer: {q.ans.join(", ")}  -  {q.ans.map(a=>q.opts[a]).join("; ")}</div></div><button onClick={next} style={{background:"#00c896",border:"none",borderRadius:8,color:"#0d1117",fontWeight:700,fontSize:13,padding:"11px",cursor:"pointer",fontFamily:"monospace",width:"100%"}}>{idx+1>=SIZE?"see results →":"next question →"}</button></div>}
  </div>);
}

function Flashcards({srsData,setSrsData}){
  const[mode,setMode]=useState("review"),[cardIdx,setCardIdx]=useState(0),[flipped,setFlipped]=useState(false),[newQ,setNewQ]=useState(""),[newA,setNewA]=useState("");
  const userCards=srsData.userCards||[];
  const allCards=[...BUILT_IN_CARDS,...userCards];
  const getDue=()=>{const now=Date.now();return allCards.map((c,i)=>{const st=srsData[`c${i}`]||{interval:0,ease:2.5,due:0};return{...c,idx:i,...st,overdue:st.due<=now};}).filter(c=>c.overdue||!(srsData[`c${c.idx}`]));};
  const due=getDue();const card=due[cardIdx%Math.max(1,due.length)];
  const rate=q=>{const i=card.idx,cur=srsData[`c${i}`]||{interval:1,ease:2.5};let{interval,ease}=cur;if(q>=3){interval=interval<1?1:interval<6?6:Math.round(interval*ease);ease=Math.max(1.3,ease+(0.1-(5-q)*(0.08+(5-q)*0.02)));}else interval=1;setSrsData({...srsData,[`c${i}`]:{interval,ease,due:Date.now()+interval*86400000,lastRated:q}});setFlipped(false);setCardIdx(c=>c+1);};
  const addCard=()=>{if(!newQ.trim()||!newA.trim())return;setSrsData({...srsData,userCards:[...userCards,{q:newQ.trim(),a:newA.trim()}]});setNewQ("");setNewA("");};
  const ModeBar=()=>(<div style={{display:"flex",gap:6,marginBottom:16}}>{["review","browse","add"].map(m=><button key={m} onClick={()=>setMode(m)} style={{background:mode===m?"#7c6df0":"#1e2a3a",border:"none",borderRadius:6,color:mode===m?"#0d1117":"#4a5568",fontSize:11,padding:"6px 12px",cursor:"pointer",fontFamily:"monospace",fontWeight:mode===m?700:400}}>{m}</button>)}<div style={{marginLeft:"auto",fontSize:11,color:"#00c896",fontFamily:"monospace"}}>{due.length} due</div></div>);
  if(mode==="add")return(<div><ModeBar/><div style={card}><div style={{fontSize:11,...lbl}}>Question</div><textarea value={newQ} onChange={e=>setNewQ(e.target.value)} rows={3} placeholder="e.g. What is the STP root bridge election criteria?" style={{...inp,resize:"vertical",marginBottom:12}}/><div style={{fontSize:11,...lbl}}>Answer</div><textarea value={newA} onChange={e=>setNewA(e.target.value)} rows={3} placeholder="e.g. Lowest Bridge ID (priority + MAC address) wins." style={{...inp,resize:"vertical",marginBottom:12}}/><button onClick={addCard} disabled={!newQ||!newA} style={{background:newQ&&newA?"#7c6df0":"#1e2a3a",border:"none",borderRadius:8,color:newQ&&newA?"#0d1117":"#4a5568",fontWeight:700,fontSize:13,padding:"11px",cursor:newQ&&newA?"pointer":"not-allowed",fontFamily:"monospace",width:"100%"}}>add card</button></div><div style={{fontSize:11,color:"#4a5568",marginTop:12,textAlign:"center"}}>{userCards.length} custom * {BUILT_IN_CARDS.length} built-in</div></div>);
  if(mode==="browse")return(<div><ModeBar/><div style={{display:"flex",flexDirection:"column",gap:6}}>{allCards.map((c,i)=>{const st=srsData[`c${i}`];const clr=st?.lastRated>=3?"#00c896":st?.lastRated?"#f43f5e":"#4a5568";return(<div key={i} style={card}><div style={{fontSize:11,fontWeight:600,color:clr,marginBottom:4}}>{st?"reviewed":"new"}</div><div style={{fontSize:12,color:"#94a3b8",marginBottom:4}}>{c.q}</div><div style={{fontSize:11,color:"#4a5568",fontStyle:"italic"}}>{c.a.length>100?c.a.slice(0,100)+"...":c.a}</div></div>);})}</div></div>);
  return(<div><ModeBar/>{due.length===0?(<div style={{textAlign:"center",padding:"40px 0",color:"#4a5568"}}><div style={{fontSize:24,marginBottom:8}}>✓</div><div style={{fontSize:13}}>All cards reviewed! Come back tomorrow.</div><div style={{fontSize:11,marginTop:4}}>{allCards.length} total cards</div><button onClick={()=>setMode("add")} style={{background:"#7c6df0",border:"none",borderRadius:8,color:"#0d1117",fontWeight:700,fontSize:12,padding:"10px 20px",cursor:"pointer",fontFamily:"monospace",marginTop:16}}>add more cards →</button></div>):(
    <div><div style={{fontSize:11,color:"#4a5568",marginBottom:10,textAlign:"right"}}>{Math.min(cardIdx%due.length+1,due.length)}/{due.length}</div>
      <div onClick={()=>setFlipped(f=>!f)} style={{...card,minHeight:180,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",userSelect:"none",textAlign:"center",borderColor:"#7c6df055"}}>
        {!flipped?(<div><div style={{fontSize:10,color:"#7c6df0",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>tap to reveal</div><div style={{fontSize:14,color:"#e2e8f0",lineHeight:1.7}}>{card?.q}</div></div>):(<div><div style={{fontSize:10,color:"#00c896",textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:12}}>answer</div><div style={{fontSize:13,color:"#94a3b8",lineHeight:1.7}}>{card?.a}</div></div>)}
      </div>
      {flipped&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:6,marginTop:12}}>{[{q:0,l:"Again",c:"#f43f5e"},{q:2,l:"Hard",c:"#f97316"},{q:3,l:"Good",c:"#7c6df0"},{q:5,l:"Easy",c:"#00c896"}].map(r=><button key={r.q} onClick={()=>rate(r.q)} style={{background:r.c+"22",border:`1px solid ${r.c}44`,borderRadius:8,color:r.c,fontSize:12,fontWeight:700,padding:"10px 6px",cursor:"pointer",fontFamily:"monospace"}}>{r.l}</button>)}</div>}
    </div>
  )}</div>);
}

const TMODES=[{id:"work",label:"Focus",secs:25*60,color:"#00c896"},{id:"short",label:"Short break",secs:5*60,color:"#7c6df0"},{id:"long",label:"Long break",secs:15*60,color:"#f59e0b"}];
function Timer({onAutoLog}){
  const[mode,setMode]=useState(0),[secs,setSecs]=useState(TMODES[0].secs),[running,setRunning]=useState(false),[pomos,setPomos]=useState(0),[done,setDone]=useState(false),[lp,setLp]=useState(1);
  const ref=useRef();const m=TMODES[mode];
  const reset=(idx=mode)=>{setSecs(TMODES[idx].secs);setRunning(false);setDone(false);};
  const sw=idx=>{setMode(idx);reset(idx);};
  useEffect(()=>{if(!running)return;ref.current=setInterval(()=>{setSecs(s=>{if(s<=1){clearInterval(ref.current);setRunning(false);setDone(true);if(m.id==="work")setPomos(p=>p+1);return 0;}return s-1;});},1000);return()=>clearInterval(ref.current);},[running,mode]);
  const min=Math.floor(secs/60),sec=secs%60,pct=(1-secs/m.secs)*100;
  return(<div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
    <div style={{display:"flex",gap:4,background:"#111827",borderRadius:8,padding:4}}>{TMODES.map((t,i)=><button key={t.id} onClick={()=>sw(i)} style={{background:mode===i?t.color:"transparent",color:mode===i?"#0d1117":"#4a5568",border:"none",borderRadius:6,padding:"6px 12px",fontSize:11,fontFamily:"monospace",cursor:"pointer",fontWeight:mode===i?700:400,transition:"all 0.2s"}}>{t.label}</button>)}</div>
    <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}><Ring pct={pct} size={160} stroke={10} color={m.color}/><div style={{position:"absolute",textAlign:"center"}}><div style={{fontSize:36,fontWeight:700,color:"#e2e8f0",fontFamily:"monospace",letterSpacing:2}}>{pad2(min)}:{pad2(sec)}</div><div style={{fontSize:11,color:"#4a5568"}}>{m.label}</div></div></div>
    <div style={{display:"flex",gap:10}}>
      <button onClick={()=>reset()} style={{background:"#1e2a3a",border:"1px solid #2d3748",borderRadius:8,color:"#94a3b8",fontSize:12,padding:"10px 16px",cursor:"pointer",fontFamily:"monospace"}}>reset</button>
      <button onClick={()=>setRunning(r=>!r)} style={{background:running?"#1e2a3a":m.color,border:"none",borderRadius:8,color:running?"#94a3b8":"#0d1117",fontSize:13,fontWeight:700,padding:"10px 28px",cursor:"pointer",fontFamily:"monospace",transition:"all 0.2s"}}>{running?"pause":"start"}</button>
      <button onClick={()=>sw((mode+1)%3)} style={{background:"#1e2a3a",border:"1px solid #2d3748",borderRadius:8,color:"#94a3b8",fontSize:12,padding:"10px 16px",cursor:"pointer",fontFamily:"monospace"}}>skip →</button>
    </div>
    <div style={{display:"flex",gap:6,alignItems:"center"}}>{[0,1,2,3].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<pomos%4?"#00c896":"#1e2a3a"}}/>)}<span style={{fontSize:11,color:"#4a5568",marginLeft:6}}>{pomos} pomodoro{pomos!==1?"s":""}</span></div>
    {done&&m.id==="work"&&(<div style={{...card,width:"100%",textAlign:"center",borderColor:"#00c89633",background:"#0a2018"}}><div style={{fontSize:14,color:"#00c896",fontWeight:600,marginBottom:8}}>Focus session complete ✓</div><div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}><span style={{fontSize:12,color:"#64748b"}}>Phase:</span><select value={lp} onChange={e=>setLp(Number(e.target.value))} style={{background:"#111827",border:"1px solid #2d3748",borderRadius:6,color:"#e2e8f0",padding:"5px 8px",fontSize:12,fontFamily:"monospace"}}>{BASE_PHASES.map(p=><option key={p.id} value={p.id}>Phase {p.id}  -  {p.label}</option>)}</select></div><div style={{display:"flex",gap:8,justifyContent:"center"}}><button onClick={()=>{onAutoLog(lp,25/60);setDone(false);reset();}} style={{background:"#00c896",border:"none",borderRadius:7,color:"#0d1117",fontWeight:700,fontSize:12,padding:"8px 20px",cursor:"pointer",fontFamily:"monospace"}}>log it</button><button onClick={()=>setDone(false)} style={{background:"#1e2a3a",border:"none",borderRadius:7,color:"#4a5568",fontSize:12,padding:"8px 14px",cursor:"pointer",fontFamily:"monospace"}}>skip</button></div></div>)}
  </div>);
}

function LogSession({onAdd}){
  const[date,setDate]=useState(todayStr()),[hrs,setHrs]=useState(""),[phase,setPhase]=useState(1),[nts,setNts]=useState(""),[ok,setOk]=useState(false);
  const submit=async()=>{if(!hrs||isNaN(parseFloat(hrs)))return;await onAdd({date,hrs:parseFloat(hrs),phase,notes:nts.trim()});setHrs("");setNts("");setOk(true);setTimeout(()=>setOk(false),2000);};
  return(<div style={{display:"flex",flexDirection:"column",gap:14}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><div><label style={lbl}>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div><div><label style={lbl}>Hours</label><input type="number" min={0.5} max={12} step={0.5} value={hrs} onChange={e=>setHrs(e.target.value)} placeholder="e.g. 1.5" style={inp}/></div></div>
    <div><label style={lbl}>Phase</label><select value={phase} onChange={e=>setPhase(Number(e.target.value))} style={{...inp,cursor:"pointer"}}>{BASE_PHASES.map(p=><option key={p.id} value={p.id}>Phase {p.id}  -  {p.label}</option>)}</select></div>
    <div><label style={lbl}>Notes</label><textarea value={nts} onChange={e=>setNts(e.target.value)} placeholder="What did you cover?" rows={3} style={{...inp,resize:"vertical",lineHeight:1.6}}/></div>
    <button onClick={submit} disabled={!hrs} style={{background:ok?"#0a2018":hrs?"#00c896":"#1e2a3a",border:ok?"1px solid #00c89633":"none",color:ok?"#00c896":hrs?"#0d1117":"#4a5568",fontWeight:700,fontSize:13,padding:"12px",cursor:hrs?"pointer":"not-allowed",borderRadius:8,fontFamily:"monospace",transition:"all 0.2s"}}>{ok?"✓ logged!":"Log session →"}</button>
  </div>);
}

function History({sessions,onDelete}){
  const total=sessions.reduce((s,x)=>s+x.hrs,0);
  if(!sessions.length)return<div style={{textAlign:"center",padding:"40px 0",color:"#4a5568",fontSize:13}}>No sessions yet.</div>;
  return(<div style={{display:"flex",flexDirection:"column",gap:10}}>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}><div style={card}><div style={lbl}>Sessions</div><div style={{fontSize:22,fontWeight:700,color:"#00c896",fontFamily:"monospace"}}>{sessions.length}</div></div><div style={card}><div style={lbl}>Total hours</div><div style={{fontSize:22,fontWeight:700,color:"#7c6df0",fontFamily:"monospace"}}>{total.toFixed(1)}h</div></div></div>
    <div style={{display:"flex",flexDirection:"column",gap:6}}>{sessions.map((s,i)=>{const ph=BASE_PHASES.find(p=>p.id===s.phase);return(<div key={i} style={{...card,display:"flex",gap:10,alignItems:"flex-start"}}><div style={{width:8,height:8,borderRadius:"50%",background:ph?.color||"#4a5568",flexShrink:0,marginTop:5}}/><div style={{flex:1,minWidth:0}}><div style={{display:"flex",justifyContent:"space-between",gap:8}}><span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{s.hrs}h  -  Phase {s.phase}</span><span style={{fontSize:11,color:"#4a5568",flexShrink:0}}>{fmtDate(s.date)}</span></div>{s.notes&&<div style={{fontSize:11,color:"#64748b",marginTop:4,lineHeight:1.5}}>{s.notes}</div>}</div><button onClick={()=>onDelete(i)} style={{background:"none",border:"none",color:"#2d3748",cursor:"pointer",fontSize:16,padding:"0 2px",flexShrink:0}} onMouseEnter={e=>e.target.style.color="#f43f5e"} onMouseLeave={e=>e.target.style.color="#2d3748"}>x</button></div>);})}
  </div></div>);
}

const TABS=[{id:"dashboard",label:"Dashboard"},{id:"phases",label:"Phases"},{id:"course",label:"Course"},{id:"quiz",label:"Quiz"},{id:"cards",label:"Flashcards"},{id:"timer",label:"Timer"},{id:"log",label:"Log"},{id:"history",label:"History"}];

export default function App(){
  const[tab,setTab]=useState("dashboard"),[checked,setChecked]=useState({}),[notes,setNotes]=useState({}),[weak,setWeak]=useState({}),[sessions,setSessions]=useState([]),[examDate,setExamDate]=useState(""),[openPhase,setOpenPhase]=useState(1),[quizHistory,setQuizHistory]=useState([]),[srsData,setSrsData]=useState({}),[loaded,setLoaded]=useState(false),[syncing,setSyncing]=useState(false),[user,setUser]=useState(null),[authReady,setAuthReady]=useState(!USE_SB);
  const phases=useMemo(()=>getPhases(examDate),[examDate]);
  useEffect(()=>{if(!USE_SB){setAuthReady(true);return;}(async()=>{const db=await getSB();if(!db){setAuthReady(true);return;}const{data:{session}}=await db.auth.getSession();if(session?.user)setUser(session.user);setAuthReady(true);const{data:{subscription}}=db.auth.onAuthStateChange((_,s)=>{setUser(s?.user??null);});return()=>subscription.unsubscribe();})();},[]);
  useEffect(()=>{if(!authReady)return;if(USE_SB&&!user){setLoaded(false);return;}(async()=>{const p=user?`${user.id}:`:"";setChecked(await loadS(`${p}ccna:checked`,{}));setNotes(await loadS(`${p}ccna:notes`,{}));setWeak(await loadS(`${p}ccna:weak`,{}));setSessions(await loadS(`${p}ccna:sessions`,[]));setExamDate(await loadS(`${p}ccna:examdate`,""));setQuizHistory(await loadS(`${p}ccna:quizhistory`,[]));setSrsData(await loadS(`${p}ccna:srsdata`,{}));setLoaded(true);})();},[authReady,user]);
  const persist=useCallback(async(key,setter,val)=>{setter(val);setSyncing(true);await saveS(user?`${user.id}:${key}`:key,val);setSyncing(false);},[user]);
  const signOut=useCallback(async()=>{const db=await getSB();if(db)await db.auth.signOut();setUser(null);setChecked({});setNotes({});setWeak({});setSessions([]);setExamDate("");setQuizHistory([]);setSrsData({});setLoaded(false);},[]);
  const updC=useCallback(v=>persist("ccna:checked",setChecked,v),[persist]);
  const updN=useCallback(v=>persist("ccna:notes",setNotes,v),[persist]);
  const updW=useCallback(v=>persist("ccna:weak",setWeak,v),[persist]);
  const updS=useCallback(v=>persist("ccna:sessions",setSessions,v),[persist]);
  const updE=useCallback(v=>persist("ccna:examdate",setExamDate,v),[persist]);
  const updQH=useCallback(v=>persist("ccna:quizhistory",setQuizHistory,v),[persist]);
  const updSRS=useCallback(v=>persist("ccna:srsdata",setSrsData,v),[persist]);
  const toggleTopic=useCallback((pid,i)=>updC({...checked,[tk(pid,i)]:!checked[tk(pid,i)]}),[checked,updC]);
  const toggleVid=useCallback(day=>updC({...checked,[`vid_${day}`]:!checked[`vid_${day}`]}),[checked,updC]);
  const addSession=useCallback(s=>updS([s,...sessions]),[sessions,updS]);
  const delSession=useCallback(i=>updS(sessions.filter((_,j)=>j!==i)),[sessions,updS]);
  const autoLog=useCallback((phase,hrs)=>addSession({date:todayStr(),hrs:parseFloat(hrs.toFixed(2)),phase,notes:"Pomodoro  -  auto"}),[addSession]);
  const topicsDone=BASE_PHASES.reduce((s,p)=>s+p.topics.filter((_,i)=>checked[tk(p.id,i)]).length,0);
  const pct=Math.round(topicsDone/TOTAL_TOPICS*100),streak=getStreak(sessions);
  if(!authReady)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:"#4a5568",fontFamily:"monospace",fontSize:13}}><div style={{textAlign:"center"}}><div style={{fontSize:20,marginBottom:8}}>📡</div>loading...</div></div>);
  if(USE_SB&&!user)return(<UserAuth onUser={setUser}/>);
  if(!loaded)return(<div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:"#4a5568",fontFamily:"monospace",fontSize:13}}><div style={{textAlign:"center"}}><div style={{fontSize:20,marginBottom:8}}>📡</div>loading...</div></div>);
  return(<div style={{background:"#0d1117",borderRadius:12,overflow:"hidden",fontFamily:'"Courier New",Courier,monospace',color:"#e2e8f0",minHeight:"80vh"}}>
    <div style={{padding:"16px 20px 0",borderBottom:"1px solid #1e2a3a",position:"sticky",top:0,background:"#0d1117",zIndex:10}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
        <div><span style={{fontSize:14,fontWeight:700,color:"#00c896",letterSpacing:"0.1em"}}>CCNA 200-301</span><span style={{fontSize:11,color:"#4a5568",marginLeft:10}}>tracker</span></div>
        <div style={{display:"flex",gap:6,alignItems:"center"}}>{syncing&&<span style={{fontSize:10,color:"#4a5568"}}>saving...</span>}{!USE_SB&&<span style={{fontSize:10,color:"#f59e0b",background:"#211a08",borderRadius:20,padding:"3px 8px"}}>local</span>}{USE_SB&&user&&<span style={{fontSize:10,color:"#4a5568",maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.email}</span>}{USE_SB&&user&&<button onClick={signOut} style={{background:"none",border:"1px solid #1e2a3a",borderRadius:20,padding:"3px 10px",fontSize:10,color:"#4a5568",cursor:"pointer",fontFamily:"inherit"}}>sign out</button>}{streak>0&&<span style={{background:"#211a08",border:"1px solid #f59e0b44",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#f59e0b"}}>🔥 {streak}d</span>}<span style={{background:"#0a2018",border:"1px solid #00c89644",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#00c896"}}>{pct}%</span></div>
      </div>
      <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>{TABS.map(t=><button key={t.id} onClick={()=>setTab(t.id)} style={{background:"none",border:"none",cursor:"pointer",whiteSpace:"nowrap",padding:"8px 14px",fontSize:11,letterSpacing:"0.07em",textTransform:"uppercase",color:tab===t.id?"#00c896":"#4a5568",borderBottom:tab===t.id?"2px solid #00c896":"2px solid transparent",transition:"color .15s",fontFamily:"inherit",flexShrink:0}}>{t.label}</button>)}</div>
    </div>
    <div style={{padding:"18px 20px",overflowY:"auto"}}>
      {tab==="dashboard"&&<Dashboard checked={checked} sessions={sessions} examDate={examDate} setExamDate={updE} setTab={setTab} phases={phases}/>}
      {tab==="phases"   &&<Phases checked={checked} notes={notes} weak={weak} toggleTopic={toggleTopic} setNotes={updN} setWeak={updW} openPhase={openPhase} setOpenPhase={setOpenPhase} phases={phases}/>}
      {tab==="course"   &&<Course checked={checked} toggleVid={toggleVid} notes={notes} setNotes={v=>{updN(v);}}/>}
      {tab==="quiz"     &&<Quiz quizHistory={quizHistory} setQuizHistory={updQH}/>}
      {tab==="cards"    &&<Flashcards srsData={srsData} setSrsData={updSRS}/>}
      {tab==="timer"    &&<Timer onAutoLog={autoLog}/>}
      {tab==="log"      &&<LogSession onAdd={addSession}/>}
      {tab==="history"  &&<History sessions={sessions} onDelete={delSession}/>}
    </div>
  </div>);
}