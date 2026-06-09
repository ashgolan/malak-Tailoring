import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { inventoriesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useStyles } from "../hooks/useStyles";
import Modal from "../components/ui/Modal";
import { fmt, fo, bl } from "../utils/formatters.js";

export default function InventoriesPage() {
  const {theme}=useTheme(); const isMobile=useIsMobile(); const S=useStyles(theme);
  const {data,isLoading,create,update,remove}=useCrud("inventories",inventoriesApi);
  const [modal,setModal]=useState(false); const [form,setForm]=useState({name:"",number:0});
  const [search,setSearch]=useState(""); const [editId,setEditId]=useState(null); const [editVals,setEditVals]=useState({});
  const filtered=(data||[]).filter(item=>!search||item.name?.toLowerCase().includes(search.toLowerCase()));
  const handleSubmit=(e)=>{e.preventDefault();create(form);setModal(false);setForm({name:"",number:0});};
  if(isLoading)return<div style={{display:"flex",justifyContent:"center",padding:80}}><div className="rosh-spinner" style={{borderTopColor:theme.primary}}/></div>;
  return(
    <div style={{display:"flex",flexDirection:"column",gap:20,direction:"rtl"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:12}}>
        <div style={{display:"flex",alignItems:"center",gap:12}}>
          <div style={{width:44,height:44,borderRadius:12,background:theme.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22}}>📦</div>
          <div><h1 style={{fontSize:22,fontWeight:700,margin:0,color:"var(--text-1)"}}>מלאי</h1><p style={{fontSize:13,margin:"3px 0 0",color:"var(--text-4)"}}>{filtered.length} פריטים</p></div>
        </div>
        <button onClick={()=>setModal(true)} style={{padding:"9px 18px",borderRadius:8,background:theme.gradient,color:"#fff",border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>+ הוסף מוצר</button>
      </div>
      <input type="text" value={search} onChange={e=>setSearch(e.target.value)} placeholder="חיפוש לפי שם מוצר..." style={S.inputLg} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/>
      <div style={S.card}>
        <div style={{display:"flex",flexDirection:"row-reverse",alignItems:"center",width:"100%",background:theme.gradient,color:"#fff"}}>
          <div style={{width:80,minWidth:80,padding:"12px 8px",fontSize:12,fontWeight:700,textAlign:"center",flexShrink:0}}>פעולות</div>
          <div style={S.cell("40%",{color:"#fff",fontWeight:700,fontSize:12,padding:"12px 12px"})}>מחיר ₪</div>
          <div style={S.cell("60%",{color:"#fff",fontWeight:700,fontSize:12,padding:"12px 12px"})}>שם מוצר / עבודה</div>
        </div>
        {filtered.length===0?<div style={S.empty}><div style={{fontSize:32,marginBottom:12}}>📦</div><div>אין מוצרים במלאי</div></div>
        :filtered.map((item,idx)=>{const isEditing=editId===item._id;const bg=idx%2===0?"var(--bg-card)":"var(--bg-card-alt)";return(
          <div key={item._id} style={{display:"flex",flexDirection:"row-reverse",alignItems:"center",width:"100%",borderBottom:"1px solid var(--border-light)",background:bg,transition:"background 0.1s"}}
            onMouseEnter={e=>e.currentTarget.style.background="var(--bg-hover)"}
            onMouseLeave={e=>e.currentTarget.style.background=bg}>
            <div style={{width:80,minWidth:80,padding:"10px 8px",display:"flex",gap:4,justifyContent:"center",flexShrink:0}}>
              {isEditing?(<><button onClick={()=>{update(editId,editVals);setEditId(null);}} style={S.btnSave}>✓</button><button onClick={()=>setEditId(null)} style={S.btnDiscard}>✕</button></>)
              :(<><button onClick={()=>{setEditId(item._id);setEditVals({...item});}} style={S.btnEdit}>✎</button><button onClick={()=>{if(window.confirm("האם אתה בטוח שברצונך למחוק?"))remove(item._id);}} style={S.btnDelete}>🗑</button></>)}
            </div>
            <div style={S.cell("40%",{color:theme.primary,fontWeight:600})}>
              {isEditing?<input type="number" min="0" step="any" value={editVals.number??""} onChange={e=>setEditVals(v=>({...v,number:e.target.value}))} style={{width:"100%",border:`1px solid ${theme.accent}`,borderRadius:6,padding:"2px 6px",fontSize:12,outline:"none",fontFamily:"inherit",background:"var(--bg-input)",color:"var(--text-1)"}}/>:fmt(item.number)}
            </div>
            <div style={S.cell("60%",{fontWeight:500,color:"var(--text-1)"})}>
              {isEditing?<input type="text" value={editVals.name??""} onChange={e=>setEditVals(v=>({...v,name:e.target.value}))} style={{width:"100%",border:`1px solid ${theme.accent}`,borderRadius:6,padding:"2px 6px",fontSize:12,outline:"none",fontFamily:"inherit",background:"var(--bg-input)",color:"var(--text-1)"}}/>:item.name}
            </div>
          </div>
        );})}
      </div>
      <Modal isOpen={modal} onClose={()=>{setModal(false);setForm({name:"",number:0});}} title="הוספת מוצר למלאי" size="sm">
        <form onSubmit={handleSubmit} style={{display:"flex",flexDirection:"column",gap:14}}>
          <div><label style={S.label}>שם מוצר / עבודה</label><input type="text" value={form.name} onChange={e=>setForm(p=>({...p,name:e.target.value}))} required style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></div>
          <div><label style={S.label}>מחיר ₪</label><input type="number" min="0" step="any" value={form.number} onChange={e=>setForm(p=>({...p,number:e.target.value}))} style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></div>
          <div style={{display:"flex",gap:10}}><button type="button" onClick={()=>setModal(false)} style={S.btnCancel}>ביטול</button><button type="submit" style={S.btnSubmit(theme)}>שמור</button></div>
        </form>
      </Modal>
    </div>
  );
}
