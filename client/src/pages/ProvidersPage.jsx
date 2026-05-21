import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { contactsApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useStyles } from "../hooks/useStyles";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";
import { fo, bl } from "../utils/formatters.js";

const EMPTY = { name:"", number:"-", mail:"-", bankProps:"-" };
const COLS = [
  { key:"bankProps", label:"פרטי בנק",      width:"22%" },
  { key:"mail",      label:"דואר אלקטרוני", width:"22%" },
  { key:"number",    label:"טלפון",          width:"18%" },
  { key:"name",      label:"שם ספק",         width:"28%" },
];
export default function ProvidersPage() {
  const {theme}=useTheme(); const isMobile=useIsMobile(); const S=useStyles(theme);
  const {data,isLoading,create,update,remove}=useCrud("contacts",contactsApi);
  const [modal,setModal]=useState(false); const [form,setForm]=useState(EMPTY);
  const [search,setSearch]=useState(""); const [editId,setEditId]=useState(null); const [editVals,setEditVals]=useState({});
  const filtered=(data||[]).filter(item=>!search||["name","number","mail"].some(f=>String(item[f]||"").toLowerCase().includes(search.toLowerCase())));
  const val=(k)=>editId?(editVals[k]??""):form[k];
  const set=(k,v)=>editId?setEditVals(p=>({...p,[k]:v})):setForm(p=>({...p,[k]:v}));
  const handleSubmit=(e)=>{e.preventDefault();if(editId){update(editId,editVals);setEditId(null);}else create(form);setModal(false);setForm(EMPTY);};
  const mobileCols=COLS.map(col=>col.key==="mail"?{...col,render:v=>v&&v!=="-"?<a href={`mailto:${v}`} style={{color:theme.primary,textDecoration:"none"}}>{v}</a>:(v||"-")}:col.key==="number"?{...col,render:v=>v&&v!=="-"?<a href={`tel:${v}`} style={{color:theme.primary,textDecoration:"none"}}>{v}</a>:(v||"-")}:col);
  if(isLoading)return<div style={{display:"flex",justifyContent:"center",padding:80}}><div className="rosh-spinner" style={{borderTopColor:theme.primary}}/></div>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20,direction:"rtl"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:theme.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>🏭</div>
          <div><h1 style={{fontSize:22,fontWeight:700,margin:0,color:"var(--text-1)"}}>ספקים</h1><p style={{fontSize:13,margin:"3px 0 0",color:"var(--text-4)"}}>{filtered.length} ספקים</p></div>
        </div>
        <button onClick={()=>setModal(true)} style={{padding:"9px 18px",borderRadius:8,background:theme.gradient,color:"#fff",border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ הוסף ספק</button>
      </div>
      <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש לפי שם, טלפון..." style={S.inputLg} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/>
      {isMobile?(<MobileCards items={filtered} columns={mobileCols} onEdit={item=>{setEditId(item._id);setEditVals({...item});setModal(true);}} onDelete={id=>remove(id)} theme={theme}/>):(
        <div style={S.card}>
          <div style={{display:"flex",flexDirection:"row-reverse",alignItems:"center",width:"100%",background:theme.gradient,color:"#fff"}}>
            <div style={{width:80,minWidth:80,padding:"12px 8px",fontSize:12,fontWeight:700,textAlign:"center",flexShrink:0}}>פעולות</div>
            {COLS.map(col=><div key={col.key} style={S.cell(col.width,{color:"#fff",fontWeight:700,fontSize:12,padding:"12px 12px"})}>{col.label}</div>)}
          </div>
          {filtered.length===0?<div style={S.empty}><div style={{fontSize:32,marginBottom:12}}>🏭</div><div>אין ספקים</div></div>
          :filtered.map((item,idx)=>{const isEditing=editId===item._id;const bg=idx%2===0?"var(--bg-card)":"var(--bg-card-alt)";return(
            <div key={item._id} style={{display:"flex",flexDirection:"row-reverse",alignItems:"center",width:"100%",borderBottom:"1px solid var(--border-light)",background:bg,transition:"background 0.1s"}}
              onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"} onMouseLeave={e=>e.currentTarget.style.background=bg}>
              <div style={{width:80,minWidth:80,padding:"10px 8px",display:"flex",gap:4,justifyContent:"center",flexShrink:0}}>
                {isEditing?(<><button onClick={()=>{update(editId,editVals);setEditId(null);}} style={S.btnSave}>✓</button><button onClick={()=>setEditId(null)} style={S.btnDiscard}>✕</button></>)
                :(<><button onClick={()=>{setEditId(item._id);setEditVals({...item});}} style={S.btnEdit}>✎</button><button onClick={()=>{if(window.confirm("האם אתה בטוח שברצונך למחוק?"))remove(item._id);}} style={S.btnDelete}>🗑</button></>)}
              </div>
              {COLS.map(col=>(
                <div key={col.key} style={S.cell(col.width,{color:"var(--text-1)",fontWeight:col.key==="name"?600:400})}>
                  {isEditing?<input type="text" value={editVals[col.key]??""} onChange={e=>setEditVals(v=>({...v,[col.key]:e.target.value}))} style={{width:"100%",border:`1px solid ${theme.accent}`,borderRadius:6,padding:"2px 6px",fontSize:12,outline:"none",fontFamily:"inherit",background:"var(--bg-input)",color:"var(--text-1)"}}/>
                  :(col.key==="mail"&&item[col.key]&&item[col.key]!=="-"?<a href={`mailto:${item[col.key]}`} style={{color:theme.primary,textDecoration:"none"}}>{item[col.key]}</a>:col.key==="number"&&item[col.key]&&item[col.key]!=="-"?<a href={`tel:${item[col.key]}`} style={{color:theme.primary,textDecoration:"none"}}>{item[col.key]}</a>:(item[col.key]||"-"))}
                </div>
              ))}
            </div>
          );})}
        </div>
      )}
      <Modal isOpen={modal} onClose={()=>{setModal(false);setForm(EMPTY);setEditId(null);}} title={editId?"עריכת ספק":"הוספת ספק"} size="sm">
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
          {[{key:"name",label:"שם ספק",req:true},{key:"number",label:"טלפון"},{key:"mail",label:"אימייל",type:"email"},{key:"bankProps",label:"פרטי בנק"}].map(f=>(
            <div key={f.key}><label style={S.label}>{f.label}</label><input type={f.type||"text"} value={val(f.key)} onChange={e=>set(f.key,e.target.value)} required={!!f.req} style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></div>
          ))}
          <div style={{display:"flex",gap:10}}><button type="button" onClick={()=>{setModal(false);setForm(EMPTY);setEditId(null);}} style={S.btnCancel}>ביטול</button><button type="submit" style={S.btnSubmit(theme)}>שמור</button></div>
        </form>
      </Modal>
    </div>
  );
}
