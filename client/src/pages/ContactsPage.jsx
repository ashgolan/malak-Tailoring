import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { providersApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";
import { fmt, fo, bl } from "../utils/formatters.js";

const EMPTY = { name: "", number: "-", phone: "-" };

const COLS = [
  { key: "phone", label: "טלפון",       width: "40%" },
  { key: "name",  label: "שם איש קשר", width: "50%" },
];

export default function ContactsPage() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { data, isLoading, create, update, remove } = useCrud("providers", providersApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const filtered = (data || []).filter(item =>
    !search || ["name","number","phone"].some(f => String(item[f]||"").toLowerCase().includes(search.toLowerCase()))
  );

  const handleSubmit = (e) => { e.preventDefault(); create(form); setModal(false); setForm(EMPTY); };
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
          <div style={{ width:44, height:44, borderRadius:12, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 12px ${theme.primary}30` }}>📞</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>אנשי קשר</h1>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"3px 0 0" }}>{filtered.length} אנשי קשר</p>
          </div>
        </div>
        <button onClick={() => setModal(true)} style={{ padding:"9px 18px", borderRadius:8, background:theme.gradient, color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 2px 8px ${theme.primary}30` }}>+ הוסף</button>
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
        style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:16, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
        onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Mobile Cards / Desktop Table */}
      {isMobile ? (
        <MobileCards
          items={filtered}
          columns={COLS}
          onEdit={(item) => { setEditId(item._id); setEditVals({...item}); setModal(true); }}
          onDelete={(id) => remove(id)}
          theme={theme}
        />
      ) : (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ ...ROW, background:theme.gradient, color:"#fff" }}>
            <div style={{ width:80, minWidth:80, padding:"12px 8px", fontSize:12, fontWeight:700, textAlign:"center", flexShrink:0 }}>פעולות</div>
            {COLS.map(col => <div key={col.key} style={{ ...CELL(col.width), color:"#fff", fontWeight:700, fontSize:12, padding:"12px 12px" }}>{col.label}</div>)}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"56px 20px", color:"#9ca3af" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>📞</div>
              <div style={{ fontSize:15, fontWeight:500 }}>אין אנשי קשר</div>
            </div>
          ) : filtered.map((item, idx) => {
            const isEditing = editId === item._id;
            const bg = idx%2===0 ? "#fff" : "#fafafa";
            return (
              <div key={item._id} style={{ ...ROW, background:bg }}
                onMouseEnter={e => { e.currentTarget.style.background=theme.primaryLight; }}
                onMouseLeave={e => { e.currentTarget.style.background=bg; }}>
                <div style={{ width:80, minWidth:80, padding:"10px 8px", display:"flex", gap:4, justifyContent:"center", flexShrink:0 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => { update(editId, editVals); setEditId(null); }} style={{ padding:"3px 8px", background:"#dcfce7", border:"none", borderRadius:6, color:"#16a34a", cursor:"pointer", fontSize:12 }}>✓</button>
                      <button onClick={() => setEditId(null)} style={{ padding:"3px 8px", background:"#f3f4f6", border:"none", borderRadius:6, color:"#6b7280", cursor:"pointer", fontSize:12 }}>✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(item._id); setEditVals({...item}); }} style={{ padding:"3px 8px", background:"#eff6ff", border:"none", borderRadius:6, color:"#3b82f6", cursor:"pointer", fontSize:12 }}>✎</button>
                      <button onClick={() => remove(item._id)} style={{ padding:"3px 8px", background:"#fef2f2", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", fontSize:12 }}>🗑</button>
                    </>
                  )}
                </div>
                {COLS.map(col => (
                  <div key={col.key} style={CELL(col.width, { color:"#374151", fontWeight: col.key==="name" ? 600 : 400 })}>
                    {isEditing ? (
                      <input type="text" value={editVals[col.key]??""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))}
                        style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"2px 6px", fontSize:12, outline:"none", fontFamily:"inherit" }} />
                    ) : (
                      col.key==="phone" && item[col.key] && item[col.key]!=="-"
                        ? <a href={`tel:${item[col.key]}`} style={{ color:theme.primary, textDecoration:"none" }}>{item[col.key]}</a>
                        : (item[col.key]||"-")
                    )}
                  </div>
                ))}
              </div>
            );
          })}
          {filtered.length > 0 && (
            <div style={{ padding:"12px 16px", background:theme.primaryLight, borderTop:`2px solid ${theme.primaryBorder}` }}>
              <span style={{ fontSize:13, color:"#6b7280" }}>{filtered.length} אנשי קשר</span>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }} title={editId ? "עריכת איש קשר" : "הוספת איש קשר"}>
        <form onSubmit={(e) => {
          e.preventDefault();
          if (editId) { update(editId, editVals); setEditId(null); }
          else { create(form); }
          setModal(false); setForm(EMPTY);
        }} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          {[{ key:"name", label:"שם", type:"text" }, { key:"number", label:"מספר", type:"text" }, { key:"phone", label:"טלפון", type:"tel" }].map(f => (
            <div key={f.key}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>{f.label}</label>
              <input type={f.type}
                value={editId ? editVals[f.key]??""  : form[f.key]}
                onChange={e => editId ? setEditVals(v=>({...v,[f.key]:e.target.value})) : setForm(p=>({...p,[f.key]:e.target.value}))}
                required={f.key==="name"}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
          ))}
          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={{ flex:1, padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>ביטול</button>
            <button type="submit" style={{ flex:2, padding:10, border:"none", borderRadius:8, background:theme.gradient, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>שמור</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}