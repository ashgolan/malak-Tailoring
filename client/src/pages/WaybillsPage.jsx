import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { waybillsApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import Modal from "../components/ui/Modal";

const EMPTY = { date: today, location: "", clientName: "", name: "", remark: "-", colored: false, quantity: 1, totalAmount: 0 };

const COLS = [
  { key: "quantity",   label: "כמות",          type: "number", width: "8%"  },
  { key: "remark",     label: "מס׳ הזמנה",                     width: "15%" },
  { key: "name",       label: "תיאור מוצר",                    width: "20%" },
  { key: "clientName", label: "חברה / מוסד",                   width: "20%" },
  { key: "location",   label: "כתובת משלוח",                   width: "22%" },
  { key: "date",       label: "תאריך",                          width: "10%" },
];

export default function WaybillsPage() {
  const { theme } = useTheme();
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("waybills", waybillsApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const currentYear = new Date().getFullYear();

  const filtered = [...(data || [])]
    .filter(item => {
      if (!showAll) {
        if (!item.date) return item.colored;
        if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        return ["clientName","location","name","remark"].some(f => String(item[f]||"").toLowerCase().includes(s));
      }
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const totalQty = filtered.reduce((s, i) => s + (Number(i.quantity) || 0), 0);

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false);
    setForm(EMPTY);
  };

  const ROW = { display:"flex", flexDirection:"row-reverse", alignItems:"center", width:"100%", borderBottom:"1px solid #f3f4f6" };
  const CELL = (w, extra={}) => ({ width:w, flexBasis:w, flexGrow:1, flexShrink:1, padding:"10px 10px", fontSize:13, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", ...extra });

  if (isLoading) return <div style={{ display:"flex", justifyContent:"center", padding:80 }}><div style={{ width:36, height:36, border:`4px solid ${theme.primaryBorder}`, borderTopColor:theme.primary, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 12px ${theme.primary}30` }}>🚛</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>תעודות משלוח</h1>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"3px 0 0" }}>{filtered.length} תעודות | סה״כ: <strong style={{ color:theme.primary }}>{fmt(total)} ₪</strong></p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setShowAll(!showAll)}
            style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${showAll ? theme.accent : "#e5e7eb"}`, background: showAll ? theme.primaryLight : "#fff", color: showAll ? theme.primary : "#6b7280", cursor:"pointer", fontFamily:"inherit" }}>
            {showAll ? "שנה נוכחית" : "כל הזמנים"}
          </button>
          <button onClick={() => setModal(true)}
            style={{ padding:"9px 18px", borderRadius:8, background:theme.gradient, color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 2px 8px ${theme.primary}30` }}>
            + הוסף תעודה
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${theme.primaryBorder}`, padding:"16px 24px", display:"flex", gap:32, alignItems:"center", flexWrap:"wrap" }}>
        {[
          { label:"סה״כ כמות", value:`${totalQty} יח׳`, color:theme.primary },
          { label:"מספר תעודות", value:filtered.length, color:"#6b7280" },
        ].map((stat, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center" }}>
            {i > 0 && <div style={{ width:1, background:theme.primaryBorder, alignSelf:"stretch", marginLeft:32 }} />}
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.04em" }}>{stat.label}</span>
              <span style={{ fontSize:18, fontWeight:700, color:stat.color }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי חברה, כתובת, מוצר..."
        style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
        onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        {/* Header */}
        <div style={{ ...ROW, background:theme.gradient, color:"#fff" }}>
          <div style={{ width:70, minWidth:70, padding:"12px 8px", fontSize:12, fontWeight:700, textAlign:"center", flexShrink:0 }}>פעולות</div>
          {COLS.map(col => <div key={col.key} style={{ ...CELL(col.width), color:"#fff", fontWeight:700, fontSize:12, padding:"12px 10px" }}>{col.label}</div>)}
          <div style={{ width:30, minWidth:30, flexShrink:0 }} />
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"56px 20px", color:"#9ca3af" }}>
            <div style={{ fontSize:32, marginBottom:12 }}>🚛</div>
            <div style={{ fontSize:15, fontWeight:500 }}>אין תעודות משלוח</div>
          </div>
        ) : filtered.map((item, idx) => {
          const isEditing = editId === item._id;
          const bg = item.colored ? "#fef2f2" : idx%2===0 ? "#fff" : "#fafafa";
          return (
            <div key={item._id} style={{ ...ROW, background:bg }}
              onMouseEnter={e => { if(!item.colored) e.currentTarget.style.background=theme.primaryLight; }}
              onMouseLeave={e => { e.currentTarget.style.background=bg; }}>

              {/* Actions */}
              <div style={{ width:70, minWidth:70, padding:"10px 8px", display:"flex", gap:4, justifyContent:"center", flexShrink:0 }}>
                {isEditing ? (
                  <><button onClick={() => { update(editId, editVals); setEditId(null); }} style={{ padding:"3px 8px", background:"#dcfce7", border:"none", borderRadius:6, color:"#16a34a", cursor:"pointer", fontSize:12 }}>✓</button><button onClick={() => setEditId(null)} style={{ padding:"3px 8px", background:"#f3f4f6", border:"none", borderRadius:6, color:"#6b7280", cursor:"pointer", fontSize:12 }}>✕</button></>
                ) : (
                  <><button onClick={() => { setEditId(item._id); setEditVals({...item}); }} style={{ padding:"3px 8px", background:"#eff6ff", border:"none", borderRadius:6, color:"#3b82f6", cursor:"pointer", fontSize:12 }}>✎</button><button onClick={() => { if(window.confirm("למחוק?")) remove(item._id); }} style={{ padding:"3px 8px", background:"#fef2f2", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", fontSize:12 }}>🗑</button></>
                )}
              </div>

              {/* Cells */}
              {COLS.map(col => (
                <div key={col.key} style={CELL(col.width, { color: item.colored ? "#991b1b" : "#374151" })}>
                  {isEditing ? (
                    <input type={col.type==="number" ? "number" : "text"} value={editVals[col.key]??""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))}
                      style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"2px 6px", fontSize:12, outline:"none", fontFamily:"inherit" }} />
                  ) : (
                    col.type==="number" ? fmt(item[col.key]) : (item[col.key]||"-")
                  )}
                </div>
              ))}

              {/* Color dot */}
              <div style={{ width:30, minWidth:30, display:"flex", justifyContent:"center", flexShrink:0 }}>
                <div onClick={() => toggleColor(item._id, { colored: !item.colored })}
                  style={{ width:12, height:12, borderRadius:"50%", background: item.colored?"#ef4444":"#e5e7eb", border: item.colored?"2px solid #dc2626":"2px solid #d1d5db", cursor:"pointer" }} />
              </div>
            </div>
          );
        })}

        {/* Footer */}
        {filtered.length > 0 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:theme.primaryLight, borderTop:`2px solid ${theme.primaryBorder}` }}>
            <span style={{ fontSize:13, color:"#6b7280" }}>סה״כ ({filtered.length} תעודות)</span>
            <span style={{ fontSize:16, fontWeight:700, color:theme.primary }}>{totalQty} יח׳</span>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת תעודת משלוח" size="md">
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>תאריך</label>
              <input type="date" value={form.date} onChange={e => set("date", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>חברה / מוסד</label>
              <input type="text" value={form.clientName} onChange={e => set("clientName", e.target.value)} required
                placeholder="שם החברה או המוסד"
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            <div style={{ gridColumn:"1 / -1" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>כתובת משלוח</label>
              <input type="text" value={form.location} onChange={e => set("location", e.target.value)} required
                placeholder="רחוב, עיר..."
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            <div style={{ gridColumn:"1 / -1" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>תיאור מוצר</label>
              <input type="text" value={form.name} onChange={e => set("name", e.target.value)} required
                placeholder="תיאור המוצר / הסחורה"
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>כמות</label>
              <input type="number" value={form.quantity} min="1" onChange={e => set("quantity", e.target.value)} required
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מס׳ הזמנה</label>
              <input type="text" value={form.remark} onChange={e => set("remark", e.target.value)}
                placeholder="מספר הזמנה..."
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

          </div>

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); }}
              style={{ flex:1, padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>ביטול</button>
            <button type="submit"
              style={{ flex:2, padding:10, border:"none", borderRadius:8, background:theme.gradient, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>שמור תעודה</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
