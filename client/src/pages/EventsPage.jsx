import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { eventsApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useStyles } from "../hooks/useStyles";
import Modal from "../components/ui/Modal";
import { fo, bl } from "../utils/formatters.js";

export default function EventsPage() {
  const { theme } = useTheme();
  const S = useStyles(theme);
  const { data, isLoading, create, update, remove } = useCrud("events", eventsApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title:"", start:"", end:"" });
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});
  const [search, setSearch] = useState("");

  const filtered = (data||[]).filter(item=>!search||item.title?.toLowerCase().includes(search.toLowerCase()));

  const val = (k) => editId ? (editVals[k]??"") : form[k];
  const set = (k,v) => editId ? setEditVals(p=>({...p,[k]:v})) : setForm(p=>({...p,[k]:v}));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) { update(editId, editVals); setEditId(null); }
    else create(form);
    setModal(false); setForm({ title:"", start:"", end:"" });
  };

  const fmtDate = (v) => v ? new Date(v).toLocaleString("he-IL") : "-";

  if (isLoading) return (
    <div style={{display:"flex",justifyContent:"center",padding:80}}>
      <div className="rosh-spinner" style={{borderTopColor:theme.primary}}/>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,direction:"rtl"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:theme.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📅</div>
          <div>
            <h1 style={{fontSize:22,fontWeight:700,margin:0,color:"var(--text-1)"}}>אירועים</h1>
            <p style={{fontSize:13,margin:"3px 0 0",color:"var(--text-4)"}}>{filtered.length} אירועים</p>
          </div>
        </div>
        <button onClick={()=>setModal(true)}
          style={{padding:"9px 18px",borderRadius:8,background:theme.gradient,color:"#fff",border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
          + הוסף אירוע
        </button>
      </div>

      <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder="חיפוש לפי כותרת..." style={S.inputLg} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/>

      <div style={S.card}>
        <div style={{display:"flex",flexDirection:"row-reverse",alignItems:"center",width:"100%",background:theme.gradient,color:"#fff"}}>
          <div style={{width:80,minWidth:80,padding:"12px 8px",fontSize:12,fontWeight:700,textAlign:"center",flexShrink:0}}>פעולות</div>
          <div style={S.cell("40%",{color:"#fff",fontWeight:700,fontSize:12,padding:"12px 12px"})}>כותרת</div>
          <div style={S.cell("25%",{color:"#fff",fontWeight:700,fontSize:12,padding:"12px 12px"})}>התחלה</div>
          <div style={S.cell("25%",{color:"#fff",fontWeight:700,fontSize:12,padding:"12px 12px"})}>סיום</div>
        </div>

        {filtered.length===0 ? (
          <div style={S.empty}><div style={{fontSize:32,marginBottom:12}}>📅</div><div>אין אירועים</div></div>
        ) : filtered.map((item,idx)=>{
          const isEditing = editId===item._id;
          const bg = idx%2===0?"var(--bg-card)":"var(--bg-card-alt)";
          return (
            <div key={item._id} style={{display:"flex",flexDirection:"row-reverse",alignItems:"center",width:"100%",borderBottom:"1px solid var(--border-light)",background:bg,transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
              onMouseLeave={e=>e.currentTarget.style.background=bg}>
              <div style={{width:80,minWidth:80,padding:"10px 8px",display:"flex",gap:4,justifyContent:"center",flexShrink:0}}>
                {isEditing ? (<>
                  <button onClick={()=>{update(editId,editVals);setEditId(null);}} style={S.btnSave}>✓</button>
                  <button onClick={()=>setEditId(null)} style={S.btnDiscard}>✕</button>
                </>) : (<>
                  <button onClick={()=>{setEditId(item._id);setEditVals({...item});}} style={S.btnEdit}>✎</button>
                  <button onClick={()=>{if(window.confirm("האם אתה בטוח שברצונך למחוק?"))remove(item._id);}} style={S.btnDelete}>🗑</button>
                </>)}
              </div>
              <div style={S.cell("40%",{fontWeight:600,color:"var(--text-1)"})}>
                {isEditing ? <input type="text" value={editVals.title||""} onChange={e=>setEditVals(v=>({...v,title:e.target.value}))} style={{width:"100%",border:`1px solid ${theme.accent}`,borderRadius:6,padding:"2px 6px",fontSize:12,outline:"none",fontFamily:"inherit",background:"var(--bg-input)",color:"var(--text-1)"}}/> : item.title}
              </div>
              <div style={S.cell("25%",{color:"var(--text-2)"})}>{fmtDate(item.start)}</div>
              <div style={S.cell("25%",{color:"var(--text-2)"})}>{fmtDate(item.end)}</div>
            </div>
          );
        })}
      </div>

      <Modal isOpen={modal} onClose={()=>{setModal(false);setForm({title:"",start:"",end:""});setEditId(null);}}
        title={editId?"עריכת אירוע":"הוספת אירוע"} size="sm">
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={S.label}>כותרת</label><input type="text" value={val("title")} onChange={e=>set("title",e.target.value)} required style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></div>
          <div><label style={S.label}>התחלה</label><input type="datetime-local" value={val("start")} onChange={e=>set("start",e.target.value)} required style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></div>
          <div><label style={S.label}>סיום</label><input type="datetime-local" value={val("end")} onChange={e=>set("end",e.target.value)} required style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></div>
          <div style={{display:"flex",gap:10}}>
            <button type="button" onClick={()=>{setModal(false);setForm({title:"",start:"",end:""});setEditId(null);}} style={S.btnCancel}>ביטול</button>
            <button type="submit" style={S.btnSubmit(theme)}>שמור</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
