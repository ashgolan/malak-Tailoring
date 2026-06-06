import { useState, useRef, useEffect } from "react";
import { useCrud } from "../hooks/useCrud";
import { eventsApi } from "../api";
import { useTheme } from "../context/ThemeContext";

const HE_MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const HE_DAYS   = ["א׳","ב׳","ג׳","ד׳","ה׳","ו׳","ש׳"];

const toISO  = (d) => d ? new Date(d).toISOString().split("T")[0] : "";
const fmtTime = (d) => {
  if (!d) return "";
  const t = new Date(d).toLocaleTimeString("he-IL",{hour:"2-digit",minute:"2-digit"});
  return t === "00:00" ? "" : t;
};

const PALETTE = [
  { pill:"#7c3aed", bg:"rgba(124,58,237,0.13)",  border:"rgba(124,58,237,0.3)"  },
  { pill:"#0284c7", bg:"rgba(2,132,199,0.13)",   border:"rgba(2,132,199,0.3)"   },
  { pill:"#059669", bg:"rgba(5,150,105,0.13)",   border:"rgba(5,150,105,0.3)"   },
  { pill:"#d97706", bg:"rgba(217,119,6,0.13)",   border:"rgba(217,119,6,0.3)"   },
  { pill:"#e11d48", bg:"rgba(225,29,72,0.13)",   border:"rgba(225,29,72,0.3)"   },
  { pill:"#0d9488", bg:"rgba(13,148,136,0.13)",  border:"rgba(13,148,136,0.3)"  },
  { pill:"#db2777", bg:"rgba(219,39,119,0.13)",  border:"rgba(219,39,119,0.3)"  },
  { pill:"#ea580c", bg:"rgba(234,88,12,0.13)",   border:"rgba(234,88,12,0.3)"   },
];
const getC = (id="") => PALETTE[(parseInt(id.slice(-2)||"0",16)) % PALETTE.length];

export default function EventsPage() {
  const { theme } = useTheme();
  const { data: events=[], isLoading, create, update, remove } = useCrud("events", eventsApi);

  const now   = new Date();
  const [year,  setYear]  = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [sel,   setSel]   = useState(null);
  const [editEv, setEditEv] = useState(null);
  const [form,  setForm]  = useState({ title:"", start:"", end:"" });
  const [view,  setView]  = useState("month");
  const [hover, setHover] = useState(null);
  const inputRef = useRef(null);

  const firstDay    = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const cells = [];
  for (let i=0;i<firstDay;i++) cells.push(null);
  for (let d=1;d<=daysInMonth;d++) cells.push(d);
  while (cells.length%7!==0) cells.push(null);

  const isoDay  = (d) => d ? `${year}-${String(month+1).padStart(2,"0")}-${String(d).padStart(2,"0")}` : "";
  const todayISO = now.toISOString().split("T")[0];
  const isToday  = (d) => isoDay(d)===todayISO;

  const dayEvs = (d) => {
    if (!d) return [];
    const iso = isoDay(d);
    return events.filter(e => toISO(e.start)<=iso && toISO(e.end)>=iso);
  };

  const prevMonth = () => month===0 ? (setMonth(11),setYear(y=>y-1)) : setMonth(m=>m-1);
  const nextMonth = () => month===11? (setMonth(0), setYear(y=>y+1)) : setMonth(m=>m+1);

  const openDay = (d) => {
    if (!d) return;
    const iso = isoDay(d);
    setSel({ date:iso, evs:dayEvs(d) });
    setEditEv(null);
    setForm({ title:"", start:iso+"T09:00", end:iso+"T10:00" });
    setTimeout(()=>inputRef.current?.focus(),80);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editEv) { update(editEv._id, form); setEditEv(null); }
    else create(form);
    setForm(p=>({ title:"", start:p.start.split("T")[0]+"T09:00", end:p.end.split("T")[0]+"T10:00" }));
  };

  const handleDel = (id) => {
    if (!window.confirm("למחוק אירוע זה?")) return;
    remove(id);
  };

  const startEdit = (ev) => {
    setEditEv(ev);
    const s=new Date(ev.start), en=new Date(ev.end);
    const pad=n=>String(n).padStart(2,"0");
    const fmt2=d=>`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    setForm({ title:ev.title, start:fmt2(s), end:fmt2(en) });
    setTimeout(()=>inputRef.current?.focus(),80);
  };

  useEffect(()=>{
    if (sel) {
      const d = parseInt(sel.date.split("-")[2]);
      setSel(p=>p?({...p, evs:dayEvs(d)}):p);
    }
  },[events]);

  const agendaEvs = events
    .filter(e=>{ const s=new Date(e.start); return s.getFullYear()===year&&s.getMonth()===month; })
    .sort((a,b)=>new Date(a.start)-new Date(b.start));

  const inp = {
    width:"100%", padding:"9px 12px",
    background:"var(--bg-input)", border:"1.5px solid var(--border)",
    borderRadius:10, fontSize:13, outline:"none",
    boxSizing:"border-box", fontFamily:"inherit", color:"var(--text-1)",
    transition:"border-color 0.15s",
  };

  return (
    <div style={{ display:"flex", gap:0, direction:"rtl", minHeight:"calc(100vh - 120px)", position:"relative" }}>

      {/* ══ MAIN ══ */}
      <div style={{ flex:1, display:"flex", flexDirection:"column", gap:16, minWidth:0 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:46,height:46,borderRadius:14,background:theme.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,boxShadow:`0 4px 14px ${theme.primary}40` }}>📅</div>
            <div>
              <h1 style={{ fontSize:22,fontWeight:800,color:"var(--text-1)",margin:0 }}>אירועים</h1>
              <p style={{ fontSize:13,color:"var(--text-4)",margin:"1px 0 0",fontWeight:500 }}>{HE_MONTHS[month]} {year}</p>
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <div style={{ display:"flex",background:"var(--bg-card)",border:"1px solid var(--border)",borderRadius:12,padding:3 }}>
              {[["month","📆 חודש"],["agenda","📋 רשימה"]].map(([v,l])=>(
                <button key={v} onClick={()=>setView(v)}
                  style={{ padding:"7px 16px",borderRadius:9,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",transition:"all 0.18s",background:view===v?theme.gradient:"transparent",color:view===v?"#fff":"var(--text-3)",boxShadow:view===v?`0 2px 8px ${theme.primary}40`:"none" }}>
                  {l}
                </button>
              ))}
            </div>
            <button onClick={prevMonth} style={{ width:34,height:34,borderRadius:10,border:"1px solid var(--border)",background:"var(--bg-card)",color:"var(--text-1)",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>›</button>
            <button onClick={()=>{setMonth(now.getMonth());setYear(now.getFullYear());}}
              style={{ padding:"6px 14px",borderRadius:10,border:`1px solid ${theme.primaryBorder}`,background:theme.primaryLight,color:theme.primary,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit" }}>
              היום
            </button>
            <button onClick={nextMonth} style={{ width:34,height:34,borderRadius:10,border:"1px solid var(--border)",background:"var(--bg-card)",color:"var(--text-1)",cursor:"pointer",fontSize:18,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700 }}>‹</button>
          </div>
        </div>

        {/* Month */}
        {view==="month" && (
          <div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4,marginBottom:6 }}>
              {HE_DAYS.map((d,i)=>(
                <div key={d} style={{ textAlign:"center",fontSize:12,fontWeight:700,color:i===6?"#f59e0b":i===5?"#60a5fa":"var(--text-4)",padding:"4px 0",letterSpacing:"0.04em" }}>{d}</div>
              ))}
            </div>
            <div style={{ display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:4 }}>
              {cells.map((d,i)=>{
                const isT  = isToday(d);
                const evs  = dayEvs(d);
                const hov  = hover===i;
                const isSel = sel?.date===isoDay(d);
                return (
                  <div key={i} onClick={()=>openDay(d)}
                    onMouseEnter={()=>d&&setHover(i)}
                    onMouseLeave={()=>setHover(null)}
                    style={{
                      height:108, borderRadius:14,
                      background: isT ? theme.primaryLight : isSel ? `${theme.primaryLight}88` : hov&&d ? "var(--bg-hover)" : "var(--bg-card)",
                      border: isT ? `2px solid ${theme.primary}` : isSel ? `2px solid ${theme.primaryBorder}` : hov&&d ? `1.5px solid ${theme.primaryBorder}` : "1.5px solid var(--border-light)",
                      cursor:d?"pointer":"default", padding:"8px 9px",
                      display:"flex",flexDirection:"column",gap:3,
                      overflow:"hidden", transition:"all 0.15s",
                      opacity:d?1:0,
                      boxShadow: isT?`0 2px 12px ${theme.primary}25`:hov&&d?`0 4px 18px rgba(0,0,0,0.09)`:"none",
                    }}>
                    {d && <>
                      <div style={{
                        width:28,height:28,borderRadius:"50%",
                        background:isT?theme.primary:"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:13,fontWeight:isT?800:600,
                        color:isT?"#fff":isSel?theme.primary:"var(--text-2)",
                        flexShrink:0, marginBottom:1,
                        boxShadow:isT?`0 2px 8px ${theme.primary}50`:"none",
                        border: !isT&&evs.length>0?`1.5px solid ${getC(evs[0]._id).pill}22`:"none",
                      }}>{d}</div>
                      {evs.slice(0,3).map(ev=>{
                        const c=getC(ev._id);
                        return (
                          <div key={ev._id} style={{
                            background:c.pill,
                            borderRadius:5,padding:"2px 6px",
                            fontSize:10,fontWeight:700,color:"#fff",
                            whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",
                            boxShadow:`0 1px 4px ${c.pill}50`,
                          }}>{ev.title}</div>
                        );
                      })}
                      {evs.length>3 && (
                        <div style={{ fontSize:10,color:theme.primary,fontWeight:700,paddingRight:4 }}>+{evs.length-3} עוד</div>
                      )}
                    </>}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Agenda */}
        {view==="agenda" && (
          <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
            {agendaEvs.length===0 ? (
              <div style={{ textAlign:"center",padding:60,color:"var(--text-4)" }}>
                <div style={{ fontSize:48,marginBottom:16 }}>📅</div>
                <div style={{ fontSize:16,fontWeight:600,marginBottom:6 }}>אין אירועים בחודש זה</div>
                <div style={{ fontSize:13 }}>לחץ על יום בלוח החודשי להוספת אירוע</div>
              </div>
            ) : agendaEvs.map(ev=>{
              const c=getC(ev._id);
              const d=new Date(ev.start);
              return (
                <div key={ev._id} style={{ display:"flex",gap:0,background:"var(--bg-card)",borderRadius:14,overflow:"hidden",border:"1px solid var(--border-light)",boxShadow:"var(--shadow-card)" }}>
                  <div style={{ width:5,background:c.pill,flexShrink:0 }} />
                  <div style={{ width:66,flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"14px 8px",background:c.bg,borderLeft:"1px solid var(--border-light)" }}>
                    <div style={{ fontSize:26,fontWeight:800,color:c.pill,lineHeight:1 }}>{d.getDate()}</div>
                    <div style={{ fontSize:11,fontWeight:600,color:c.pill,opacity:0.8 }}>{HE_MONTHS[d.getMonth()].slice(0,3)}</div>
                  </div>
                  <div style={{ flex:1,padding:"14px 16px",display:"flex",justifyContent:"space-between",alignItems:"center",gap:10 }}>
                    <div>
                      <div style={{ fontSize:15,fontWeight:700,color:"var(--text-1)",marginBottom:4 }}>{ev.title}</div>
                      <div style={{ fontSize:12,color:"var(--text-4)",display:"flex",alignItems:"center",gap:8 }}>
                        {fmtTime(ev.start)&&<span>🕐 {fmtTime(ev.start)}</span>}
                        {toISO(ev.start)!==toISO(ev.end)&&<span>→ {toISO(ev.end)}</span>}
                      </div>
                    </div>
                    <div style={{ display:"flex",gap:6,flexShrink:0 }}>
                      <button onClick={()=>{setSel({date:toISO(ev.start),evs:[]});startEdit(ev);}}
                        style={{ padding:"6px 12px",borderRadius:8,border:`1px solid ${c.border}`,background:c.bg,color:c.pill,cursor:"pointer",fontSize:12,fontWeight:700,fontFamily:"inherit" }}>✎</button>
                      <button onClick={()=>handleDel(ev._id)}
                        style={{ padding:"6px 10px",borderRadius:8,border:"1px solid rgba(239,68,68,0.2)",background:"rgba(239,68,68,0.08)",color:"#ef4444",cursor:"pointer",fontSize:13 }}>🗑</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ══ SIDE PANEL ══ */}
      {sel && (
        <div style={{
          width:300,flexShrink:0,marginRight:16,
          background:"var(--bg-card)",
          borderRadius:20,border:"1px solid var(--border-light)",
          boxShadow:"0 8px 32px rgba(0,0,0,0.12)",
          display:"flex",flexDirection:"column",
          overflow:"hidden",
          maxHeight:"calc(100vh - 140px)",
          position:"sticky",top:0,alignSelf:"flex-start",
        }}>
          {/* Panel header gradient */}
          <div style={{ background:theme.gradient,padding:"18px 20px",display:"flex",justifyContent:"space-between",alignItems:"flex-start" }}>
            <div>
              <div style={{ fontSize:10,color:"rgba(255,255,255,0.6)",marginBottom:3,fontWeight:700,letterSpacing:"0.08em",textTransform:"uppercase" }}>יום נבחר</div>
              <div style={{ fontSize:20,fontWeight:800,color:"#fff",lineHeight:1.2 }}>
                {new Date(sel.date+"T12:00").getDate()}&nbsp;
                {HE_MONTHS[new Date(sel.date+"T12:00").getMonth()]}&nbsp;
                {new Date(sel.date+"T12:00").getFullYear()}
              </div>
              <div style={{ fontSize:12,color:"rgba(255,255,255,0.55)",marginTop:4 }}>
                {sel.evs.length===0?"אין אירועים":sel.evs.length===1?"אירוע אחד":`${sel.evs.length} אירועים`}
              </div>
            </div>
            <button onClick={()=>{setSel(null);setEditEv(null);}}
              style={{ width:28,height:28,borderRadius:8,border:"1px solid rgba(255,255,255,0.25)",background:"rgba(255,255,255,0.15)",cursor:"pointer",fontSize:16,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              ×
            </button>
          </div>

          <div style={{ flex:1,overflowY:"auto",padding:"16px" }}>

            {/* Events list */}
            {sel.evs.length>0 && (
              <div style={{ marginBottom:16 }}>
                <div style={{ fontSize:10,fontWeight:700,color:"var(--text-4)",marginBottom:10,letterSpacing:"0.07em",textTransform:"uppercase" }}>אירועים קיימים</div>
                {sel.evs.map(ev=>{
                  const c=getC(ev._id);
                  const isEditing=editEv?._id===ev._id;
                  return (
                    <div key={ev._id} style={{ background:c.bg,border:`1px solid ${c.border}`,borderRadius:12,padding:"11px 13px",marginBottom:8,borderRight:`4px solid ${c.pill}`,transition:"all 0.15s" }}>
                      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8 }}>
                        <div style={{ flex:1,minWidth:0 }}>
                          <div style={{ fontSize:13,fontWeight:700,color:"var(--text-1)",marginBottom:2,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{ev.title}</div>
                          {fmtTime(ev.start)&&<div style={{ fontSize:11,color:c.pill,fontWeight:600 }}>🕐 {fmtTime(ev.start)}</div>}
                        </div>
                        <div style={{ display:"flex",gap:4,flexShrink:0 }}>
                          <button onClick={()=>isEditing?(setEditEv(null)):startEdit(ev)}
                            style={{ padding:"3px 9px",borderRadius:7,border:`1px solid ${c.border}`,background:isEditing?"var(--bg-card)":c.bg,color:c.pill,cursor:"pointer",fontSize:11,fontWeight:700,fontFamily:"inherit",filter:isEditing?"brightness(1.2)":"none" }}>
                            {isEditing?"✕":"✎"}
                          </button>
                          <button onClick={()=>handleDel(ev._id)}
                            style={{ padding:"3px 7px",borderRadius:7,border:"1px solid rgba(239,68,68,0.2)",background:"rgba(239,68,68,0.08)",color:"#ef4444",cursor:"pointer",fontSize:12 }}>
                            🗑
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ borderTop:"1.5px dashed var(--border)",marginBottom:16 }} />

            {/* Form */}
            <div style={{ fontSize:13,fontWeight:700,color:"var(--text-1)",marginBottom:12,display:"flex",alignItems:"center",gap:7 }}>
              <div style={{ width:22,height:22,borderRadius:7,background:theme.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:"#fff",flexShrink:0,boxShadow:`0 2px 6px ${theme.primary}40` }}>
                {editEv?"✎":"+"}
              </div>
              <span>{editEv?"עריכת אירוע":"הוסף אירוע חדש"}</span>
            </div>

            <form onSubmit={handleSave} style={{ display:"flex",flexDirection:"column",gap:10 }}>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:700,color:"var(--text-4)",marginBottom:5,letterSpacing:"0.04em" }}>כותרת *</label>
                <input ref={inputRef} type="text" required value={form.title}
                  onChange={e=>setForm(p=>({...p,title:e.target.value}))}
                  placeholder="פגישה, משלוח, ייצור..."
                  style={inp}
                  onFocus={e=>e.target.style.borderColor=theme.primary}
                  onBlur={e=>e.target.style.borderColor="var(--border)"} />
              </div>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:700,color:"var(--text-4)",marginBottom:5,letterSpacing:"0.04em" }}>📅 התחלה</label>
                <input type="datetime-local" value={form.start}
                  onChange={e=>setForm(p=>({...p,start:e.target.value}))}
                  style={{...inp,fontSize:12}}
                  onFocus={e=>e.target.style.borderColor=theme.primary}
                  onBlur={e=>e.target.style.borderColor="var(--border)"} />
              </div>
              <div>
                <label style={{ display:"block",fontSize:11,fontWeight:700,color:"var(--text-4)",marginBottom:5,letterSpacing:"0.04em" }}>🏁 סיום</label>
                <input type="datetime-local" value={form.end}
                  onChange={e=>setForm(p=>({...p,end:e.target.value}))}
                  style={{...inp,fontSize:12}}
                  onFocus={e=>e.target.style.borderColor=theme.primary}
                  onBlur={e=>e.target.style.borderColor="var(--border)"} />
              </div>
              <div style={{ display:"flex",gap:8,marginTop:4 }}>
                {editEv && (
                  <button type="button"
                    onClick={()=>{setEditEv(null);setForm({title:"",start:sel.date+"T09:00",end:sel.date+"T10:00"});}}
                    style={{ flex:1,padding:"9px",borderRadius:10,border:"1px solid var(--border)",background:"var(--btn-cancel-bg)",color:"var(--btn-cancel-text)",cursor:"pointer",fontSize:12,fontFamily:"inherit" }}>
                    ביטול
                  </button>
                )}
                <button type="submit"
                  style={{ flex:2,padding:"10px",borderRadius:10,border:"none",background:theme.gradient,color:"#fff",cursor:"pointer",fontSize:13,fontWeight:700,fontFamily:"inherit",boxShadow:`0 3px 10px ${theme.primary}40` }}>
                  {editEv?"✓ עדכן":"+ שמור אירוע"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
