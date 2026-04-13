import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ── Supabase ──────────────────────────────────────────────────────────────────
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

const loadS = async (key, fallback) => {
  try {
    const { data } = await supabase.from("kv_store").select("value").eq("key", key).maybeSingle();
    return data?.value ? JSON.parse(data.value) : fallback;
  } catch { return fallback; }
};

const saveS = async (key, val) => {
  try {
    await supabase.from("kv_store").upsert({ key, value: JSON.stringify(val), updated_at: new Date().toISOString() });
  } catch {}
};

// ── Data ──────────────────────────────────────────────────────────────────────
const PHASES = [
  { id:1, label:"Consolidation & gap-fill", short:"Phase 1", dates:"Apr 12 – May 31", color:"#7c6df0", dim:"#1a1430",
    topics:["Quick review: VLANs, trunking, STP","Quick review: OSPF single-area","Quick review: HSRP, PAgP/LACP","NAT/PAT — concepts + config","IPv6 addressing & routing basics","IP services: NTP, DHCP, DNS roles","Subnetting speed drills (aim <90s)","Packet Tracer: end-to-end lab walkthrough"]},
  { id:2, label:"Network security", short:"Phase 2", dates:"Jun 1 – Jul 31", color:"#00c896", dim:"#0a2018",
    topics:["Device hardening: passwords, SSH, banners","AAA with RADIUS & TACACS+","Standard & extended ACLs","Named ACLs & troubleshooting","Port security on switches","DHCP snooping & Dynamic ARP Inspection","802.1X port-based authentication","VPN concepts: site-to-site & remote access","IPsec fundamentals","Firewall concepts: stateful vs stateless","Common threats: VLAN hopping, spoofing, MITM","Security programme concepts (CIA triad)"]},
  { id:3, label:"Wireless", short:"Phase 3", dates:"Aug 1 – Sep 30", color:"#f59e0b", dim:"#211a08",
    topics:["802.11 standards: a/b/g/n/ac/ax","RF fundamentals: SSID, BSSID, bands, channels","Infrastructure vs ad-hoc modes","Autonomous APs vs WLC-managed APs","WLC architecture: data & control plane","CAPWAP protocol","Wireless roaming & client association","WPA, WPA2, WPA3 — key differences","EAP methods overview","Common wireless threats & mitigations","Basic WLC config concepts (GUI-based)","Wireless site survey basics"]},
  { id:4, label:"Labs, mocks & weak spots", short:"Phase 4", dates:"Oct 1 – Nov 30", color:"#f97316", dim:"#211208",
    topics:["Full mock exams (Boson or Pearson)","Packet Tracer: security scenario labs","Packet Tracer: wireless config labs","Timed subnetting drills","Review all missed mock questions","CLI command recall flashcards","Weak topic deep-dives (from mock results)","End-to-end troubleshooting scenarios"]},
  { id:5, label:"Final review & exam", short:"Phase 5", dates:"December", color:"#f43f5e", dim:"#210a10",
    topics:["Review your personal weak-spot notes","One final full mock exam","Quick-read: Cisco config command sheet","Light lab: security + wireless scenario","Rest 48 hrs before exam day","Exam day: read fully, flag & return"]},
];
const TOTAL_TOPICS = PHASES.reduce((s,p) => s + p.topics.length, 0);

const BADGES = [
  {id:"first_session", icon:"⚡", label:"First session",   desc:"Logged your first study session"},
  {id:"streak_3",      icon:"🌱", label:"Getting started", desc:"3-day study streak"},
  {id:"streak_7",      icon:"🔥", label:"On fire",         desc:"7-day study streak"},
  {id:"streak_14",     icon:"💥", label:"Unstoppable",     desc:"14-day study streak"},
  {id:"hours_10",      icon:"⏱️", label:"10 hours in",     desc:"Logged 10 hours total"},
  {id:"hours_25",      icon:"💪", label:"25 hours in",     desc:"Logged 25 hours total"},
  {id:"hours_50",      icon:"🏋️", label:"50 hours in",     desc:"Logged 50 hours total"},
  {id:"phase1_done",   icon:"🔧", label:"Foundation set",  desc:"Completed all Phase 1 topics"},
  {id:"phase2_done",   icon:"🛡️", label:"Security guard",  desc:"Completed all Phase 2 topics"},
  {id:"phase3_done",   icon:"📡", label:"Wireless wizard", desc:"Completed all Phase 3 topics"},
  {id:"phase4_done",   icon:"🔬", label:"Lab rat",         desc:"Completed all Phase 4 topics"},
  {id:"mock_pass",     icon:"🎯", label:"Mock master",     desc:"Scored 85%+ on a practice exam"},
  {id:"mock_triple",   icon:"👑", label:"Exam ready",      desc:"Three consecutive 85%+ mock scores"},
  {id:"all_topics",    icon:"🏆", label:"Full coverage",   desc:"Completed every topic"},
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const tk        = (pid,i) => `p${pid}_t${i}`;
const todayStr  = () => new Date().toISOString().split("T")[0];
const fmtFull   = d => { try { return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"2-digit"}); } catch { return d; }};
const fmtShort  = d => { try { return new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"short"}); } catch { return d; }};
const daysUntil = d => Math.ceil((new Date(d+"T00:00:00") - Date.now()) / 86400000);
const pad2      = n => String(n).padStart(2,"0");

function getStreak(sessions) {
  if(!sessions.length) return 0;
  const days=[...new Set(sessions.map(s=>s.date))].sort().reverse();
  let c=0, cur=new Date(); cur.setHours(0,0,0,0);
  for(const d of days){
    const dt=new Date(d+"T00:00:00");
    const diff=Math.round((cur-dt)/86400000);
    if(diff>1) break;
    c++; cur=dt;
  }
  return c;
}

function computeBadges(checked, sessions, scores) {
  const earned=new Set();
  const total=sessions.reduce((s,x)=>s+x.hrs,0);
  const streak=getStreak(sessions);
  const phaseDone=pid=>PHASES.find(p=>p.id===pid).topics.every((_,i)=>checked[tk(pid,i)]);
  const consec85=()=>{
    const s=[...scores].sort((a,b)=>a.date>b.date?1:-1);
    let c=0; for(const x of s){if(x.score>=85){c++;if(c>=3)return true;}else c=0;} return false;
  };
  if(sessions.length)          earned.add("first_session");
  if(streak>=3)                earned.add("streak_3");
  if(streak>=7)                earned.add("streak_7");
  if(streak>=14)               earned.add("streak_14");
  if(total>=10)                earned.add("hours_10");
  if(total>=25)                earned.add("hours_25");
  if(total>=50)                earned.add("hours_50");
  if(phaseDone(1))             earned.add("phase1_done");
  if(phaseDone(2))             earned.add("phase2_done");
  if(phaseDone(3))             earned.add("phase3_done");
  if(phaseDone(4))             earned.add("phase4_done");
  if(scores.some(s=>s.score>=85)) earned.add("mock_pass");
  if(consec85())               earned.add("mock_triple");
  if(PHASES.every(p=>phaseDone(p.id))) earned.add("all_topics");
  return earned;
}

// ── Shared styles ─────────────────────────────────────────────────────────────
const card = { background:"#111827", borderRadius:10, padding:"14px 16px", border:"1px solid #1e2a3a" };
const inp  = { background:"#111827", border:"1px solid #1e2a3a", borderRadius:8, color:"#e2e8f0", padding:"10px 12px", fontSize:13, fontFamily:"monospace", width:"100%", boxSizing:"border-box", outline:"none" };
const lbl  = { fontSize:11, color:"#4a5568", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:"0.07em" };

// ── Ring ──────────────────────────────────────────────────────────────────────
function Ring({pct,size=80,stroke=7,color="#00c896"}) {
  const r=(size-stroke)/2, circ=2*Math.PI*r, dash=pct/100*circ;
  return (
    <svg width={size} height={size} style={{transform:"rotate(-90deg)"}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1e2a3a" strokeWidth={stroke}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:"stroke-dasharray 0.5s"}}/>
    </svg>
  );
}

// ── Heatmap ───────────────────────────────────────────────────────────────────
function Heatmap({sessions}) {
  const today=new Date(); today.setHours(0,0,0,0);
  const weeks=18, days=weeks*7;
  const map={};
  sessions.forEach(s=>{map[s.date]=(map[s.date]||0)+s.hrs;});
  const start=new Date(today); start.setDate(start.getDate()-days+1);
  const cells=[];
  for(let i=0;i<days;i++){const d=new Date(start);d.setDate(start.getDate()+i);cells.push(d.toISOString().split("T")[0]);}
  const color=h=>h<=0?"#1e2a3a":h<1?"#1a3a2a":h<2?"#0d6e4a":h<4?"#00a870":"#00c896";
  const sz=11,gap=2,step=sz+gap;
  const W=weeks*step, H=7*step+18;
  // Month labels
  const seenMonths=new Set();
  const monthLabels=[];
  cells.forEach((d,i)=>{
    const col=Math.floor(i/7);
    const m=new Date(d+"T12:00:00").toLocaleDateString("en-GB",{month:"short"});
    if(!seenMonths.has(m)){seenMonths.add(m);monthLabels.push({col,m});}
  });
  return (
    <div style={{overflowX:"auto"}}>
      <svg width={W} height={H} style={{display:"block"}}>
        {monthLabels.map(({col,m})=><text key={m} x={col*step} y={10} style={{fill:"#4a5568",fontSize:9,fontFamily:"monospace"}}>{m}</text>)}
        {cells.map((d,i)=>{
          const col=Math.floor(i/7),row=i%7,hrs=map[d]||0,isToday=d===todayStr();
          return <rect key={d} x={col*step} y={row*step+16} width={sz} height={sz} rx={2} fill={color(hrs)} stroke={isToday?"#00c896":"none"} strokeWidth={isToday?1:0}><title>{d}: {hrs>0?hrs+"h":"no study"}</title></rect>;
        })}
        {["","M","","W","","F",""].map((l,i)=>l&&<text key={i} x={-2} y={i*step+16+sz/2+4} textAnchor="end" style={{fill:"#4a5568",fontSize:8,fontFamily:"monospace"}}>{l}</text>)}
      </svg>
      <div style={{display:"flex",gap:8,alignItems:"center",marginTop:6,fontSize:10,color:"#4a5568"}}>
        <span>Less</span>
        {[0,0.5,2,3,5].map(h=><div key={h} style={{width:10,height:10,borderRadius:2,background:color(h)}}/>)}
        <span>More</span>
      </div>
    </div>
  );
}

// ── Score chart ───────────────────────────────────────────────────────────────
function ScoreChart({scores}) {
  if(!scores.length) return <div style={{textAlign:"center",padding:"20px 0",color:"#4a5568",fontSize:12}}>No mock scores yet.</div>;
  const sorted=[...scores].sort((a,b)=>a.date>b.date?1:-1).slice(-10);
  const W=340,H=100,padL=28,padB=20,chartW=W-padL,chartH=H-padB;
  const barW=Math.min(26,(chartW/sorted.length)-4);
  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`}>
      <line x1={padL} y1={chartH*(1-85/100)} x2={W} y2={chartH*(1-85/100)} stroke="#00c896" strokeWidth={0.5} strokeDasharray="4 3"/>
      <text x={padL-2} y={chartH*(1-85/100)+4} textAnchor="end" style={{fill:"#00c896",fontSize:8,fontFamily:"monospace"}}>85</text>
      {[0,50,100].map(v=>(
        <g key={v}>
          <line x1={padL} y1={chartH*(1-v/100)} x2={padL-3} y2={chartH*(1-v/100)} stroke="#2d3748" strokeWidth={0.5}/>
          <text x={padL-5} y={chartH*(1-v/100)+4} textAnchor="end" style={{fill:"#4a5568",fontSize:8,fontFamily:"monospace"}}>{v}</text>
        </g>
      ))}
      {sorted.map((s,i)=>{
        const x=padL+(chartW/sorted.length)*i+(chartW/sorted.length-barW)/2;
        const bH=s.score/100*chartH;
        const clr=s.score>=85?"#00c896":s.score>=70?"#f59e0b":"#f43f5e";
        return (
          <g key={i}>
            <rect x={x} y={chartH-bH} width={barW} height={bH} rx={2} fill={clr} opacity={0.85}><title>{fmtShort(s.date)}: {s.score}%</title></rect>
            <text x={x+barW/2} y={H-5} textAnchor="middle" style={{fill:"#4a5568",fontSize:7,fontFamily:"monospace"}}>{fmtShort(s.date)}</text>
            <text x={x+barW/2} y={chartH-bH-3} textAnchor="middle" style={{fill:clr,fontSize:9,fontFamily:"monospace",fontWeight:700}}>{s.score}</text>
          </g>
        );
      })}
    </svg>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
function Dashboard({checked,sessions,scores,examDate,setExamDate,setTab}) {
  const done=Object.values(checked).filter(Boolean).length;
  const pct=Math.round(done/TOTAL_TOPICS*100);
  const streak=getStreak(sessions);
  const total=sessions.reduce((s,x)=>s+x.hrs,0);
  const weekHrs=sessions.filter(s=>(Date.now()-new Date(s.date+"T12:00:00"))<7*86400000).reduce((s,x)=>s+x.hrs,0);
  const badges=computeBadges(checked,sessions,scores);
  const countdown=examDate?daysUntil(examDate):null;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {/* Exam countdown */}
      {examDate&&countdown!==null?(
        <div style={{...card,display:"flex",alignItems:"center",gap:16,borderColor:countdown<30?"#f43f5e44":"#1e2a3a"}}>
          <div style={{textAlign:"center",minWidth:56}}>
            <div style={{fontSize:30,fontWeight:700,color:countdown<30?"#f43f5e":countdown<60?"#f59e0b":"#00c896",fontFamily:"monospace"}}>{Math.max(0,countdown)}</div>
            <div style={{fontSize:10,color:"#4a5568"}}>days left</div>
          </div>
          <div style={{flex:1}}>
            <div style={{fontSize:12,color:"#94a3b8"}}>Target: <span style={{color:"#e2e8f0"}}>{fmtFull(examDate)}</span></div>
            <div style={{height:3,background:"#1e2a3a",borderRadius:2,marginTop:8,overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:countdown<30?"#f43f5e":countdown<60?"#f59e0b":"#00c896",borderRadius:2,transition:"width 0.5s"}}/>
            </div>
            <div style={{fontSize:11,color:"#4a5568",marginTop:3}}>{pct}% of topics covered</div>
          </div>
          <button onClick={()=>setExamDate("")} style={{background:"none",border:"none",color:"#2d3748",cursor:"pointer",fontSize:18,padding:"0 4px"}}
            onMouseEnter={e=>e.target.style.color="#f43f5e"} onMouseLeave={e=>e.target.style.color="#2d3748"}>×</button>
        </div>
      ):(
        <div style={{...card,display:"flex",alignItems:"center",gap:12}}>
          <div style={{flex:1,fontSize:12,color:"#4a5568"}}>Set your exam target date</div>
          <input type="date" onChange={e=>setExamDate(e.target.value)}
            style={{background:"#1e2a3a",border:"1px solid #2d3748",borderRadius:6,color:"#e2e8f0",padding:"7px 10px",fontSize:12,fontFamily:"monospace"}}/>
        </div>
      )}

      {/* Stats */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
        {[
          {label:"Streak",    val:`${streak}d`,             color:"#f59e0b"},
          {label:"This week", val:`${weekHrs.toFixed(1)}h`, color:"#7c6df0"},
          {label:"Total hrs", val:`${total.toFixed(1)}h`,   color:"#00c896"},
          {label:"Progress",  val:`${pct}%`,                color:"#f97316"},
        ].map(s=>(
          <div key={s.label} style={card}>
            <div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:4}}>{s.label}</div>
            <div style={{fontSize:22,fontWeight:700,color:s.color,fontFamily:"monospace"}}>{s.val}</div>
          </div>
        ))}
      </div>

      {/* Phase bars */}
      <div style={card}>
        <div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Phase progress</div>
        {PHASES.map(p=>{
          const d=p.topics.filter((_,i)=>checked[tk(p.id,i)]).length;
          return (
            <div key={p.id} onClick={()=>setTab("phases")} style={{display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:p.color,flexShrink:0}}/>
              <div style={{fontSize:11,color:"#94a3b8",flex:1,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{p.label}</div>
              <div style={{width:100,height:3,background:"#1e2a3a",borderRadius:2,flexShrink:0,overflow:"hidden"}}>
                <div style={{width:`${Math.round(d/p.topics.length*100)}%`,height:"100%",background:p.color,borderRadius:2,transition:"width 0.4s"}}/>
              </div>
              <div style={{fontSize:10,color:"#4a5568",minWidth:30,textAlign:"right",fontFamily:"monospace"}}>{d}/{p.topics.length}</div>
            </div>
          );
        })}
      </div>

      {/* Heatmap */}
      <div style={card}>
        <div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>Study activity — 18 weeks</div>
        <Heatmap sessions={sessions}/>
      </div>

      {/* Badges */}
      <div style={card}>
        <div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",letterSpacing:"0.07em",marginBottom:10}}>
          Badges — {BADGES.filter(b=>badges.has(b.id)).length}/{BADGES.length}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(110px,1fr))",gap:8}}>
          {BADGES.map(b=>{
            const got=badges.has(b.id);
            return (
              <div key={b.id} title={b.desc} style={{
                background:got?"#0a2018":"transparent",
                border:`1px solid ${got?"#00c89633":"#1e2a3a"}`,
                borderRadius:8,padding:"10px 8px",textAlign:"center",
                opacity:got?1:0.35,transition:"all 0.3s"
              }}>
                <div style={{fontSize:18,marginBottom:4}}>{b.icon}</div>
                <div style={{fontSize:10,color:got?"#00c896":"#4a5568",fontWeight:got?600:400,lineHeight:1.3}}>{b.label}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── Phases ────────────────────────────────────────────────────────────────────
function Phases({checked,notes,weak,toggleTopic,setNotes,setWeak,openPhase,setOpenPhase}) {
  const [editNote,setEditNote]=useState(null);
  const [noteVal,setNoteVal]=useState("");
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      {PHASES.map(p=>{
        const done=p.topics.filter((_,i)=>checked[tk(p.id,i)]).length;
        const isOpen=openPhase===p.id;
        const weakCount=p.topics.filter((_,i)=>weak[tk(p.id,i)]).length;
        return (
          <div key={p.id} style={{border:`1px solid ${isOpen?p.color+"55":"#1e2a3a"}`,borderRadius:10,overflow:"hidden"}}>
            <div onClick={()=>setOpenPhase(isOpen?null:p.id)} style={{display:"flex",alignItems:"center",gap:10,padding:"12px 14px",cursor:"pointer",background:isOpen?p.dim:"transparent"}}>
              <div style={{width:9,height:9,borderRadius:"50%",background:p.color,flexShrink:0}}/>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:600,color:"#e2e8f0"}}>{p.label}</div>
                <div style={{fontSize:11,color:"#4a5568"}}>{p.dates}</div>
              </div>
              <div style={{display:"flex",gap:6,alignItems:"center"}}>
                {weakCount>0&&<span style={{fontSize:10,color:"#f97316",background:"#211208",borderRadius:10,padding:"2px 7px"}}>{weakCount} weak</span>}
                <span style={{fontSize:11,color:p.color,fontFamily:"monospace"}}>{done}/{p.topics.length}</span>
                <span style={{fontSize:10,color:"#4a5568"}}>{isOpen?"▲":"▼"}</span>
              </div>
            </div>
            <div style={{height:2,background:"#1e2a3a"}}>
              <div style={{width:`${Math.round(done/p.topics.length*100)}%`,height:"100%",background:p.color,transition:"width 0.4s"}}/>
            </div>
            {isOpen&&(
              <div style={{padding:"10px 14px",display:"flex",flexDirection:"column",gap:2}}>
                {p.topics.map((t,i)=>{
                  const k=tk(p.id,i);
                  const isDone=checked[k],isWeak=weak[k],hasNote=notes[k];
                  return (
                    <div key={i} style={{borderRadius:6,overflow:"hidden"}}>
                      <div style={{display:"flex",alignItems:"center",gap:8,padding:"7px 8px",background:isDone?p.dim:"transparent",transition:"background 0.15s"}}>
                        <div onClick={()=>toggleTopic(p.id,i)} style={{width:15,height:15,borderRadius:3,border:`1.5px solid ${isDone?p.color:"#2d3748"}`,background:isDone?p.color:"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,cursor:"pointer",transition:"all 0.15s"}}>
                          {isDone&&<span style={{fontSize:9,color:"#0d1117",fontWeight:700}}>✓</span>}
                        </div>
                        <span onClick={()=>toggleTopic(p.id,i)} style={{flex:1,fontSize:12,color:isDone?"#64748b":"#cbd5e1",textDecoration:isDone?"line-through":"none",cursor:"pointer",lineHeight:1.4}}>{t}</span>
                        <button onClick={()=>setWeak({...weak,[k]:!isWeak})} title={isWeak?"Remove weak flag":"Flag as weak spot"}
                          style={{background:"none",border:"none",cursor:"pointer",fontSize:12,padding:"0 2px",opacity:isWeak?1:0.3,color:"#f97316"}}>⚑</button>
                        <button onClick={()=>editNote===k?setEditNote(null):(setEditNote(k),setNoteVal(notes[k]||""))}
                          style={{background:"none",border:"none",cursor:"pointer",fontSize:11,padding:"0 2px",color:hasNote?"#7c6df0":"#4a5568",opacity:hasNote?1:0.5}}>📝</button>
                      </div>
                      {editNote===k&&(
                        <div style={{padding:"6px 8px 8px 31px",background:"#111827"}}>
                          <textarea value={noteVal} onChange={e=>setNoteVal(e.target.value)} rows={2} placeholder="Add a note..."
                            style={{...inp,resize:"vertical",lineHeight:1.6}}/>
                          <div style={{display:"flex",gap:6,marginTop:4}}>
                            <button onClick={()=>{setNotes({...notes,[k]:noteVal});setEditNote(null);}} style={{background:"#00c896",border:"none",borderRadius:5,color:"#0d1117",fontSize:11,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:"monospace"}}>save</button>
                            <button onClick={()=>setEditNote(null)} style={{background:"#1e2a3a",border:"none",borderRadius:5,color:"#4a5568",fontSize:11,padding:"4px 10px",cursor:"pointer",fontFamily:"monospace"}}>cancel</button>
                          </div>
                        </div>
                      )}
                      {editNote!==k&&notes[k]&&(
                        <div onClick={()=>{setEditNote(k);setNoteVal(notes[k]);}} style={{padding:"4px 8px 6px 31px",background:"#111827",fontSize:11,color:"#64748b",cursor:"pointer",lineHeight:1.5}}>{notes[k]}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Timer ─────────────────────────────────────────────────────────────────────
const TIMER_MODES=[
  {id:"work",  label:"Focus",       secs:25*60, color:"#00c896"},
  {id:"short", label:"Short break", secs:5*60,  color:"#7c6df0"},
  {id:"long",  label:"Long break",  secs:15*60, color:"#f59e0b"},
];
function Timer({onAutoLog}) {
  const [mode,setMode]=useState(0);
  const [secs,setSecs]=useState(TIMER_MODES[0].secs);
  const [running,setRunning]=useState(false);
  const [pomos,setPomos]=useState(0);
  const [done,setDone]=useState(false);
  const [logPhase,setLogPhase]=useState(1);
  const ref=useRef();
  const m=TIMER_MODES[mode];
  const reset=(idx=mode)=>{setSecs(TIMER_MODES[idx].secs);setRunning(false);setDone(false);};
  const switchMode=idx=>{setMode(idx);reset(idx);};
  useEffect(()=>{
    if(!running) return;
    ref.current=setInterval(()=>{
      setSecs(s=>{
        if(s<=1){clearInterval(ref.current);setRunning(false);setDone(true);if(m.id==="work")setPomos(p=>p+1);return 0;}
        return s-1;
      });
    },1000);
    return()=>clearInterval(ref.current);
  },[running,mode]);
  const min=Math.floor(secs/60),sec=secs%60;
  const pct=(1-secs/m.secs)*100;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:20}}>
      <div style={{display:"flex",gap:4,background:"#111827",borderRadius:8,padding:4}}>
        {TIMER_MODES.map((t,i)=>(
          <button key={t.id} onClick={()=>switchMode(i)} style={{
            background:mode===i?t.color:"transparent",color:mode===i?"#0d1117":"#4a5568",
            border:"none",borderRadius:6,padding:"6px 12px",fontSize:11,fontFamily:"monospace",
            cursor:"pointer",fontWeight:mode===i?700:400,transition:"all 0.2s"
          }}>{t.label}</button>
        ))}
      </div>
      <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center"}}>
        <Ring pct={pct} size={160} stroke={10} color={m.color}/>
        <div style={{position:"absolute",textAlign:"center"}}>
          <div style={{fontSize:36,fontWeight:700,color:"#e2e8f0",fontFamily:"monospace",letterSpacing:2}}>{pad2(min)}:{pad2(sec)}</div>
          <div style={{fontSize:11,color:"#4a5568"}}>{m.label}</div>
        </div>
      </div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>reset()} style={{background:"#1e2a3a",border:"1px solid #2d3748",borderRadius:8,color:"#94a3b8",fontSize:12,padding:"10px 16px",cursor:"pointer",fontFamily:"monospace"}}>reset</button>
        <button onClick={()=>setRunning(r=>!r)} style={{background:running?"#1e2a3a":m.color,border:"none",borderRadius:8,color:running?"#94a3b8":"#0d1117",fontSize:13,fontWeight:700,padding:"10px 28px",cursor:"pointer",fontFamily:"monospace",transition:"all 0.2s"}}>{running?"pause":"start"}</button>
        <button onClick={()=>{const n=(mode+1)%3;switchMode(n);}} style={{background:"#1e2a3a",border:"1px solid #2d3748",borderRadius:8,color:"#94a3b8",fontSize:12,padding:"10px 16px",cursor:"pointer",fontFamily:"monospace"}}>skip →</button>
      </div>
      <div style={{display:"flex",gap:6,alignItems:"center"}}>
        {[0,1,2,3].map(i=><div key={i} style={{width:10,height:10,borderRadius:"50%",background:i<pomos%4?"#00c896":"#1e2a3a",transition:"background 0.3s"}}/>)}
        <span style={{fontSize:11,color:"#4a5568",marginLeft:6}}>{pomos} pomodoro{pomos!==1?"s":""} today</span>
      </div>
      {done&&m.id==="work"&&(
        <div style={{...card,width:"100%",textAlign:"center",borderColor:"#00c89633",background:"#0a2018"}}>
          <div style={{fontSize:14,color:"#00c896",fontWeight:600,marginBottom:8}}>Focus session complete ✓</div>
          <div style={{fontSize:12,color:"#4a5568",marginBottom:12}}>Log this 25-minute session?</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,marginBottom:12}}>
            <span style={{fontSize:12,color:"#64748b"}}>Phase:</span>
            <select value={logPhase} onChange={e=>setLogPhase(Number(e.target.value))}
              style={{background:"#111827",border:"1px solid #2d3748",borderRadius:6,color:"#e2e8f0",padding:"5px 8px",fontSize:12,fontFamily:"monospace"}}>
              {PHASES.map(p=><option key={p.id} value={p.id}>{p.short} — {p.label}</option>)}
            </select>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"center"}}>
            <button onClick={()=>{onAutoLog(logPhase,25/60);setDone(false);reset();}} style={{background:"#00c896",border:"none",borderRadius:7,color:"#0d1117",fontWeight:700,fontSize:12,padding:"8px 20px",cursor:"pointer",fontFamily:"monospace"}}>log it</button>
            <button onClick={()=>setDone(false)} style={{background:"#1e2a3a",border:"none",borderRadius:7,color:"#4a5568",fontSize:12,padding:"8px 14px",cursor:"pointer",fontFamily:"monospace"}}>skip</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Mock scores ───────────────────────────────────────────────────────────────
function MockScores({scores,setScores}) {
  const [date,setDate]=useState(todayStr());
  const [score,setScore]=useState("");
  const [notes,setNotes]=useState("");
  const [phase,setPhase]=useState(1);
  const avg=scores.length?Math.round(scores.reduce((s,x)=>s+x.score,0)/scores.length):0;
  const best=scores.length?Math.max(...scores.map(s=>s.score)):0;
  const add=()=>{
    const v=parseInt(score);
    if(isNaN(v)||v<0||v>100) return;
    setScores([{date,score:v,notes:notes.trim(),phase},...scores]);
    setScore("");setNotes("");
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:12}}>
      {scores.length>0&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>
          {[{l:"Average",v:`${avg}%`,c:avg>=85?"#00c896":avg>=70?"#f59e0b":"#f43f5e"},
            {l:"Best",   v:`${best}%`,c:"#00c896"},
            {l:"85%+ runs",v:scores.filter(s=>s.score>=85).length,c:"#7c6df0"}].map(s=>(
            <div key={s.l} style={card}>
              <div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",marginBottom:4}}>{s.l}</div>
              <div style={{fontSize:20,fontWeight:700,color:s.c,fontFamily:"monospace"}}>{s.v}</div>
            </div>
          ))}
        </div>
      )}
      <div style={card}>
        <ScoreChart scores={scores}/>
        {scores.length>0&&<div style={{fontSize:10,color:"#4a5568",marginTop:8,textAlign:"center"}}>Green line = 85% target</div>}
      </div>
      <div style={card}>
        <div style={{fontSize:11,color:"#4a5568",textTransform:"uppercase",letterSpacing:"0.08em",marginBottom:12}}>Log a mock exam</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
          <div><label style={lbl}>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div>
          <div><label style={lbl}>Score (%)</label><input type="number" min={0} max={100} value={score} onChange={e=>setScore(e.target.value)} placeholder="e.g. 78" style={inp}/></div>
        </div>
        <div style={{marginBottom:10}}>
          <label style={lbl}>Phase focus</label>
          <select value={phase} onChange={e=>setPhase(Number(e.target.value))} style={{...inp,cursor:"pointer"}}>
            {PHASES.map(p=><option key={p.id} value={p.id}>{p.short} — {p.label}</option>)}
          </select>
        </div>
        <div style={{marginBottom:12}}>
          <label style={lbl}>Notes</label>
          <input type="text" value={notes} onChange={e=>setNotes(e.target.value)} placeholder="e.g. struggled with ACLs" style={inp}/>
        </div>
        <button onClick={add} disabled={!score} style={{background:score?"#00c896":"#1e2a3a",border:"none",borderRadius:8,color:score?"#0d1117":"#4a5568",fontWeight:700,fontSize:12,padding:"11px",cursor:score?"pointer":"not-allowed",fontFamily:"monospace",width:"100%",transition:"all 0.2s"}}>Add score →</button>
      </div>
      {scores.length>0&&(
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          {scores.map((s,i)=>{
            const clr=s.score>=85?"#00c896":s.score>=70?"#f59e0b":"#f43f5e";
            const ph=PHASES.find(p=>p.id===s.phase);
            return (
              <div key={i} style={{...card,display:"flex",alignItems:"center",gap:12}}>
                <div style={{fontSize:20,fontWeight:700,color:clr,fontFamily:"monospace",minWidth:44}}>{s.score}%</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:12,color:"#94a3b8"}}>{ph?.label}</div>
                  {s.notes&&<div style={{fontSize:11,color:"#4a5568",marginTop:2}}>{s.notes}</div>}
                </div>
                <div style={{fontSize:11,color:"#4a5568"}}>{fmtFull(s.date)}</div>
                <button onClick={()=>setScores(scores.filter((_,j)=>j!==i))} style={{background:"none",border:"none",color:"#2d3748",cursor:"pointer",fontSize:16,padding:"0 2px"}}
                  onMouseEnter={e=>e.target.style.color="#f43f5e"} onMouseLeave={e=>e.target.style.color="#2d3748"}>×</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Log session ───────────────────────────────────────────────────────────────
function LogSession({onAdd}) {
  const [date,setDate]=useState(todayStr());
  const [hrs,setHrs]=useState("");
  const [phase,setPhase]=useState(1);
  const [nts,setNts]=useState("");
  const [ok,setOk]=useState(false);
  const submit=async()=>{
    if(!hrs||isNaN(parseFloat(hrs))) return;
    await onAdd({date,hrs:parseFloat(hrs),phase,notes:nts.trim()});
    setHrs("");setNts("");setOk(true);setTimeout(()=>setOk(false),2000);
  };
  return (
    <div style={{display:"flex",flexDirection:"column",gap:14}}>
      <div style={{fontSize:12,color:"#4a5568",lineHeight:1.6}}>Record a manual study session. The timer tab can auto-log Pomodoro sessions for you.</div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
        <div><label style={lbl}>Date</label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={inp}/></div>
        <div><label style={lbl}>Hours</label><input type="number" min={0.5} max={12} step={0.5} value={hrs} onChange={e=>setHrs(e.target.value)} placeholder="e.g. 1.5" style={inp}/></div>
      </div>
      <div><label style={lbl}>Phase</label>
        <select value={phase} onChange={e=>setPhase(Number(e.target.value))} style={{...inp,cursor:"pointer"}}>
          {PHASES.map(p=><option key={p.id} value={p.id}>{p.short} — {p.label}</option>)}
        </select>
      </div>
      <div><label style={lbl}>Notes</label>
        <textarea value={nts} onChange={e=>setNts(e.target.value)} placeholder="What did you cover? Any wins or struggles?" rows={3} style={{...inp,resize:"vertical",lineHeight:1.6}}/>
      </div>
      <button onClick={submit} disabled={!hrs} style={{background:ok?"#0a2018":hrs?"#00c896":"#1e2a3a",border:ok?"1px solid #00c89633":"none",borderRadius:8,color:ok?"#00c896":hrs?"#0d1117":"#4a5568",fontWeight:700,fontSize:13,padding:"12px",cursor:hrs?"pointer":"not-allowed",fontFamily:"monospace",transition:"all 0.2s"}}>
        {ok?"✓ session logged!":"Log session →"}
      </button>
    </div>
  );
}

// ── History ───────────────────────────────────────────────────────────────────
function History({sessions,onDelete}) {
  const total=sessions.reduce((s,x)=>s+x.hrs,0);
  if(!sessions.length) return (
    <div style={{textAlign:"center",padding:"40px 0",color:"#4a5568",fontSize:13}}>No sessions yet.<br/><span style={{fontSize:11}}>Start logging from the Log tab or use the timer.</span></div>
  );
  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <div style={card}><div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",marginBottom:4}}>Sessions</div><div style={{fontSize:22,fontWeight:700,color:"#00c896",fontFamily:"monospace"}}>{sessions.length}</div></div>
        <div style={card}><div style={{fontSize:10,color:"#4a5568",textTransform:"uppercase",marginBottom:4}}>Total hours</div><div style={{fontSize:22,fontWeight:700,color:"#7c6df0",fontFamily:"monospace"}}>{total.toFixed(1)}h</div></div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {sessions.map((s,i)=>{
          const ph=PHASES.find(p=>p.id===s.phase);
          return (
            <div key={i} style={{...card,display:"flex",gap:10,alignItems:"flex-start"}}>
              <div style={{width:8,height:8,borderRadius:"50%",background:ph?.color||"#4a5568",flexShrink:0,marginTop:5}}/>
              <div style={{flex:1,minWidth:0}}>
                <div style={{display:"flex",justifyContent:"space-between",gap:8}}>
                  <span style={{fontSize:12,fontWeight:600,color:"#e2e8f0"}}>{s.hrs}h — {ph?.short}</span>
                  <span style={{fontSize:11,color:"#4a5568",flexShrink:0}}>{fmtFull(s.date)}</span>
                </div>
                <div style={{fontSize:11,color:"#4a5568",marginTop:1}}>{ph?.label}</div>
                {s.notes&&<div style={{fontSize:11,color:"#64748b",marginTop:4,lineHeight:1.5}}>{s.notes}</div>}
              </div>
              <button onClick={()=>onDelete(i)} style={{background:"none",border:"none",color:"#2d3748",cursor:"pointer",fontSize:16,padding:"0 2px",flexShrink:0}}
                onMouseEnter={e=>e.target.style.color="#f43f5e"} onMouseLeave={e=>e.target.style.color="#2d3748"}>×</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────────────────────
const TABS=[
  {id:"dashboard",label:"Dashboard"},
  {id:"phases",   label:"Phases"},
  {id:"timer",    label:"Timer"},
  {id:"mocks",    label:"Mocks"},
  {id:"log",      label:"Log"},
  {id:"history",  label:"History"},
];

export default function App() {
  const [tab,setTab]=useState("dashboard");
  const [checked,setChecked]=useState({});
  const [notes,setNotes]=useState({});
  const [weak,setWeak]=useState({});
  const [sessions,setSessions]=useState([]);
  const [scores,setScores]=useState([]);
  const [examDate,setExamDate]=useState("");
  const [openPhase,setOpenPhase]=useState(1);
  const [loaded,setLoaded]=useState(false);
  const [syncing,setSyncing]=useState(false);

  useEffect(()=>{
    (async()=>{
      setChecked (await loadS("ccna:checked",{}));
      setNotes   (await loadS("ccna:notes",{}));
      setWeak    (await loadS("ccna:weak",{}));
      setSessions(await loadS("ccna:sessions",[]));
      setScores  (await loadS("ccna:scores",[]));
      setExamDate(await loadS("ccna:examdate",""));
      setLoaded(true);
    })();
  },[]);

  const persist=useCallback(async(key,setter,val)=>{setter(val);setSyncing(true);await saveS(key,val);setSyncing(false);},[]);
  const updChecked =useCallback(v=>persist("ccna:checked",setChecked,v),[persist]);
  const updNotes   =useCallback(v=>persist("ccna:notes",setNotes,v),[persist]);
  const updWeak    =useCallback(v=>persist("ccna:weak",setWeak,v),[persist]);
  const updSessions=useCallback(v=>persist("ccna:sessions",setSessions,v),[persist]);
  const updScores  =useCallback(v=>persist("ccna:scores",setScores,v),[persist]);
  const updExam    =useCallback(v=>persist("ccna:examdate",setExamDate,v),[persist]);

  const toggleTopic=useCallback((pid,i)=>updChecked({...checked,[tk(pid,i)]:!checked[tk(pid,i)]}),[checked,updChecked]);
  const addSession =useCallback(s=>updSessions([s,...sessions]),[sessions,updSessions]);
  const delSession =useCallback(i=>updSessions(sessions.filter((_,j)=>j!==i)),[sessions,updSessions]);
  const autoLog    =useCallback((phase,hrs)=>addSession({date:todayStr(),hrs:parseFloat(hrs.toFixed(2)),phase,notes:"Pomodoro — auto-logged"}),[addSession]);

  const done=Object.values(checked).filter(Boolean).length;
  const pct=Math.round(done/TOTAL_TOPICS*100);
  const streak=getStreak(sessions);

  if(!loaded) return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"60vh",color:"#4a5568",fontFamily:"monospace",fontSize:13}}>
      <div style={{textAlign:"center"}}>
        <div style={{fontSize:20,marginBottom:8}}>📡</div>
        loading tracker...
      </div>
    </div>
  );

  return (
    <div style={{background:"#0d1117",borderRadius:12,overflow:"hidden",fontFamily:'"Courier New",Courier,monospace',color:"#e2e8f0",minHeight:"80vh"}}>
      {/* Header */}
      <div style={{padding:"16px 20px 0",borderBottom:"1px solid #1e2a3a",position:"sticky",top:0,background:"#0d1117",zIndex:10}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
          <div>
            <span style={{fontSize:14,fontWeight:700,color:"#00c896",letterSpacing:"0.1em"}}>CCNA 200-301</span>
            <span style={{fontSize:11,color:"#4a5568",marginLeft:10}}>tracker</span>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            {syncing&&<span style={{fontSize:10,color:"#4a5568"}}>saving…</span>}
            {streak>0&&<span style={{background:"#211a08",border:"1px solid #f59e0b44",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#f59e0b"}}>🔥 {streak}d</span>}
            <span style={{background:"#0a2018",border:"1px solid #00c89644",borderRadius:20,padding:"3px 10px",fontSize:11,color:"#00c896"}}>{pct}%</span>
          </div>
        </div>
        <div style={{display:"flex",overflowX:"auto",scrollbarWidth:"none"}}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{
              background:"none",border:"none",cursor:"pointer",whiteSpace:"nowrap",
              padding:"8px 14px",fontSize:11,letterSpacing:"0.07em",textTransform:"uppercase",
              color:tab===t.id?"#00c896":"#4a5568",
              borderBottom:tab===t.id?"2px solid #00c896":"2px solid transparent",
              transition:"color .15s",fontFamily:"inherit",flexShrink:0,
            }}>{t.label}</button>
          ))}
        </div>
      </div>

      <div style={{padding:"18px 20px",overflowY:"auto"}}>
        {tab==="dashboard"&&<Dashboard checked={checked} sessions={sessions} scores={scores} examDate={examDate} setExamDate={updExam} setTab={setTab}/>}
        {tab==="phases"   &&<Phases checked={checked} notes={notes} weak={weak} toggleTopic={toggleTopic} setNotes={updNotes} setWeak={updWeak} openPhase={openPhase} setOpenPhase={setOpenPhase}/>}
        {tab==="timer"    &&<Timer onAutoLog={autoLog}/>}
        {tab==="mocks"    &&<MockScores scores={scores} setScores={updScores}/>}
        {tab==="log"      &&<LogSession onAdd={addSession}/>}
        {tab==="history"  &&<History sessions={sessions} onDelete={delSession}/>}
      </div>
    </div>
  );
}
