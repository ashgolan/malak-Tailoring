import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { inventoriesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import Modal from "../components/ui/Modal";
import { fmt, fo, bl } from "../utils/formatters.js";

export default function InventoriesPage() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { data, isLoading, create, update, remove } = useCrud("inventories", inventoriesApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", number: 0 });
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const filtered = (data || []).filter(item =>
    !search || item.name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false);
    setForm({ name: "", number: 0 });
  };

  const ROW = { display:"flex", flexDirection:"row-reverse", alignItems:"center", width:"100%", borderBottom:"1px solid #f3f4f6" };
  const CELL = (w, extra={}) => ({ width:w, flexBasis:w, flexGrow:1, flexShrink:1, padding:"10px 12px", fontSize:13, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", ...extra });

  if (isLoading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:80 }}>
      <div style={{ width:36, height:36, border:`4px solid ${theme.primaryBorder}`, borderTopColor:theme.primary, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 12px ${theme.primary}30` }}>📦</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>מלאי ומחירון</h1>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"3px 0 0" }}>{filtered.length} מוצרים</p>
          </div>
        </div>
        <button onClick={() => setModal(true)}
          style={{ padding:"9px 18px", borderRadius:8, background:theme.gradient, color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 2px 8px ${theme.primary}30` }}>
          + הוסף מוצר
        </button>
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש מוצר..."
        style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:16, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
        onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Mobile — simple card list */}
      {isMobile ? (
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"56px 20px", color:"#9ca3af" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📦</div>
              <div style={{ fontSize:15, fontWeight:500 }}>אין מוצרים במלאי</div>
            </div>
          ) : filtered.map(item => {
            const isEditing = editId === item._id;
            return (
              <div key={item._id} style={{ background:"#fff", borderRadius:12, border:"1px solid #e5e7eb", padding:"14px 16px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                {isEditing ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:8, width:"100%" }}>
                    <input type="text" value={editVals.name??""} onChange={e => setEditVals(v=>({...v,name:e.target.value}))}
                      placeholder="שם מוצר"
                      style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"8px 10px", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
                    <input type="number" value={editVals.number??""} min="0" onChange={e => setEditVals(v=>({...v,number:e.target.value}))}
                      placeholder="מחיר"
                      style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"8px 10px", fontSize:14, outline:"none", fontFamily:"inherit", boxSizing:"border-box" }} />
                    <div style={{ display:"flex", gap:8 }}>
                      <button onClick={() => { update(editId, editVals); setEditId(null); }}
                        style={{ flex:1, padding:"8px", background:"#dcfce7", border:"none", borderRadius:6, color:"#16a34a", cursor:"pointer", fontSize:13, fontWeight:600 }}>✓ שמור</button>
                      <button onClick={() => setEditId(null)}
                        style={{ flex:1, padding:"8px", background:"#f3f4f6", border:"none", borderRadius:6, color:"#6b7280", cursor:"pointer", fontSize:13 }}>✕ ביטול</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div>
                      <div style={{ fontSize:14, fontWeight:600, color:"#1f2937" }}>{item.name}</div>
                      <div style={{ fontSize:16, fontWeight:700, color:theme.primary, marginTop:4 }}>{fmt(item.number)} ₪</div>
                    </div>
                    <div style={{ display:"flex", gap:6 }}>
                      <button onClick={() => { setEditId(item._id); setEditVals({...item}); }}
                        style={{ padding:"6px 12px", background:"#eff6ff", border:"none", borderRadius:6, color:"#3b82f6", cursor:"pointer", fontSize:12 }}>✎</button>
                      <button onClick={() => { if(window.confirm("האם אתה בטוח שברצונך למחוק?")) remove(item._id); }}
                        style={{ padding:"6px 12px", background:"#fef2f2", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", fontSize:12 }}>🗑</button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        /* Desktop Table */
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ ...ROW, background:theme.gradient, color:"#fff" }}>
            <div style={{ width:80, minWidth:80, padding:"12px 8px", fontSize:12, fontWeight:700, textAlign:"center", flexShrink:0 }}>פעולות</div>
            <div style={{ ...CELL("40%"), color:"#fff", fontWeight:700, fontSize:12, padding:"12px 12px" }}>מחיר ₪</div>
            <div style={{ ...CELL("60%"), color:"#fff", fontWeight:700, fontSize:12, padding:"12px 12px" }}>שם מוצר / עבודה</div>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"56px 20px", color:"#9ca3af" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📦</div>
              <div style={{ fontSize:15, fontWeight:500 }}>אין מוצרים במלאי</div>
              <div style={{ fontSize:13, marginTop:6, color:"#c4b5fd" }}>לחץ '+ הוסף מוצר' להתחלה</div>
            </div>
          ) : filtered.map((item, idx) => {
            const isEditing = editId === item._id;
            const bg = idx % 2 === 0 ? "#fff" : "#fafafa";
            return (
              <div key={item._id} style={{ ...ROW, background:bg }}
                onMouseEnter={e => { e.currentTarget.style.background = theme.primaryLight; }}
                onMouseLeave={e => { e.currentTarget.style.background = bg; }}>
                <div style={{ width:80, minWidth:80, padding:"10px 8px", display:"flex", gap:4, justifyContent:"center", flexShrink:0 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => { update(editId, editVals); setEditId(null); }}
                        style={{ padding:"4px 10px", background:"#dcfce7", border:"none", borderRadius:6, color:"#16a34a", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>✓ שמור</button>
                      <button onClick={() => setEditId(null)}
                        style={{ padding:"4px 10px", background:"#f3f4f6", border:"none", borderRadius:6, color:"#6b7280", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(item._id); setEditVals({...item}); }}
                        style={{ padding:"4px 10px", background:"#eff6ff", border:"none", borderRadius:6, color:"#3b82f6", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>✎ ערוך</button>
                      <button onClick={() => { if(window.confirm("האם אתה בטוח שברצונך למחוק?")) remove(item._id); }}
                        style={{ padding:"4px 10px", background:"#fef2f2", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", fontSize:12, fontFamily:"inherit" }}>🗑</button>
                    </>
                  )}
                </div>
                <div style={CELL("40%", { fontWeight:700, color:theme.primary, fontSize:14 })}>
                  {isEditing ? (
                    <input type="number" value={editVals.number??""} min="0" onChange={e => setEditVals(v=>({...v,number:e.target.value}))}
                      style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"4px 8px", fontSize:13, outline:"none", fontFamily:"inherit" }} />
                  ) : `${fmt(item.number)} ₪`}
                </div>
                <div style={CELL("60%", { fontWeight:500, color:"#1f2937" })}>
                  {isEditing ? (
                    <input type="text" value={editVals.name??""} onChange={e => setEditVals(v=>({...v,name:e.target.value}))}
                      style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"4px 8px", fontSize:13, outline:"none", fontFamily:"inherit" }} />
                  ) : item.name}
                </div>
              </div>
            );
          })}

          {filtered.length > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:theme.primaryLight, borderTop:`2px solid ${theme.primaryBorder}` }}>
              <span style={{ fontSize:13, color:"#6b7280" }}>{filtered.length} מוצרים</span>
              <span style={{ fontSize:13, color:theme.primary, fontWeight:600 }}>ממוצע: {fmt((data||[]).reduce((s,i) => s + Number(i.number||0), 0) / ((data||[]).length || 1))} ₪</span>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm({ name:"", number:0 }); }} title="הוספת מוצר למחירון">
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>שם מוצר / עבודה</label>
            <input type="text" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required
              placeholder="לדוג׳: שוואדר פוליאסטר 10×20"
              style={{ width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
              onFocus={e => fo(e, theme.accent)} onBlur={bl} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מחיר (₪)</label>
            <input type="number" value={form.number} min="0" onChange={e => setForm(p=>({...p,number:e.target.value}))}
              style={{ width:"100%", padding:"10px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:16, fontWeight:700, color:theme.primary, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
              onFocus={e => fo(e, theme.accent)} onBlur={bl} />
          </div>
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={() => { setModal(false); setForm({name:"",number:0}); }}
              style={{ flex:1, padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>ביטול</button>
            <button type="submit"
              style={{ flex:2, padding:10, border:"none", borderRadius:8, background:theme.gradient, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>שמור מוצר</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}