import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { bouncedChecksApi, taxValuesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];
const EMPTY = {
  "date": today,
  "clientName": "",
  "checkNumber": 0,
  "bankNumber": 0,
  "branchNumber": 0,
  "accountNumber": 0,
  "number": 0,
  "paymentDate": "",
  "taxNumber": "",
  "colored": false,
  "remark": "-",
  "totalAmount": 0
};
const fmt = (n) => Number(n || 0).toLocaleString("he-IL", { maximumFractionDigits: 2 });
const fo = (e, color) => { e.target.style.borderColor = color; };
const bl = (e) => { e.target.style.borderColor = "#e5e7eb"; };

const COLS = [
  {
    "key": "totalAmount",
    "label": "סה״כ",
    "type": "number",
    "width": "8%"
  },
  {
    "key": "remark",
    "label": "הערה",
    "width": "10%"
  },
  {
    "key": "paymentDate",
    "label": "ת.תשלום",
    "width": "10%"
  },
  {
    "key": "taxNumber",
    "label": "מס' חשבונית",
    "width": "9%"
  },
  {
    "key": "accountNumber",
    "label": "חשבון",
    "type": "number",
    "width": "8%"
  },
  {
    "key": "branchNumber",
    "label": "סניף",
    "type": "number",
    "width": "6%"
  },
  {
    "key": "bankNumber",
    "label": "בנק",
    "type": "number",
    "width": "5%"
  },
  {
    "key": "checkNumber",
    "label": "מס' שיק",
    "type": "number",
    "width": "8%"
  },
  {
    "key": "number",
    "label": "סכום",
    "type": "number",
    "width": "8%"
  },
  {
    "key": "clientName",
    "label": "קליינט",
    "width": "14%"
  },
  {
    "key": "date",
    "label": "תאריך",
    "width": "9%"
  }
];

export default function BouncedChecksPage() {
  const { theme } = useTheme();
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("bouncedChecks", bouncedChecksApi);
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const maam = Number(taxValues?.maamValue || 17);
  const currentYear = new Date().getFullYear();

  const filtered = [...(data || [])]
    .filter(item => {
      if (!showAll) { if (!item.date) return item.colored; const d = new Date(item.date); if (d.getFullYear() !== currentYear && !item.colored) return false; }
      if (search) { const s = search.toLowerCase(); return ["clientName","checkNumber"].some(f => String(item[f]||"").toLowerCase().includes(s)); }
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalForm = { ...form };
    create(finalForm);
    setModal(false); setForm(EMPTY);
  };

  const CELL = (w, extra={}) => ({ width:w, flexBasis:w, flexGrow:1, flexShrink:1, padding:"10px 10px", fontSize:13, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", ...extra });
  const ROW = { display:"flex", flexDirection:"row-reverse", alignItems:"center", width:"100%", borderBottom:"1px solid #f3f4f6" };

  if (isLoading) return (<div style={{ display:"flex", justifyContent:"center", padding:80 }}><div style={{ width:36, height:36, border:`4px solid ${theme.primaryBorder}`, borderTopColor:theme.primary, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, direction:"rtl" }}>
      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 12px ${theme.primary}30` }}>✅</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>שיקים חוזרים</h1>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"3px 0 0" }}>{filtered.length} רשומות &nbsp;|&nbsp; סה״כ: <strong style={{ color:theme.primary }}>{fmt(total)} ₪</strong></p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setShowAll(!showAll)} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${showAll ? theme.accent : "#e5e7eb"}`, background: showAll ? theme.primaryLight : "#fff", color: showAll ? theme.primary : "#6b7280", cursor:"pointer", fontFamily:"inherit" }}>{showAll ? "שנה נוכחית" : "כל הזמנים"}</button>
          <button onClick={() => setModal(true)} style={{ padding:"9px 18px", borderRadius:8, background:theme.gradient, color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 2px 8px ${theme.primary}30` }}>+ הוסף</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${theme.primaryBorder}`, padding:"16px 24px", display:"flex", gap:32, alignItems:"center", flexWrap:"wrap" }}>
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500, textTransform:"uppercase" }}>סה״כ</span>
          <span style={{ fontSize:18, fontWeight:700, color:theme.primary }}>{fmt(total)} ₪</span>
        </div>
        <div style={{ width:1, background:theme.primaryBorder, alignSelf:"stretch" }} />
        <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
          <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500, textTransform:"uppercase" }}>רשומות</span>
          <span style={{ fontSize:18, fontWeight:700, color:"#6b7280" }}>{filtered.length}</span>
        </div>
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..." style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }} onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ ...ROW, background:theme.gradient, color:"#fff" }}>
          <div style={{ width:70, minWidth:70, padding:"12px 8px", fontSize:12, fontWeight:700, textAlign:"center", flexShrink:0 }}>פעולות</div>
          {COLS.map(col => (<div key={col.key} style={{ ...CELL(col.width), color:"#fff", fontWeight:700, fontSize:12, padding:"12px 10px" }}>{col.label}</div>))}
          <div style={{ width:30, minWidth:30, flexShrink:0 }} />
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"56px 20px", color:"#9ca3af" }}><div style={{ fontSize:32, marginBottom:12 }}>✅</div><div style={{ fontSize:15, fontWeight:500 }}>אין נתונים להצגה</div></div>
        ) : filtered.map((item, idx) => {
          const isEditing = editId === item._id;
          const bg = item.colored ? "#fef2f2" : idx%2===0 ? "#fff" : "#fafafa";
          return (
            <div key={item._id} style={{ ...ROW, background:bg }}
              onMouseEnter={e => { if(!item.colored) e.currentTarget.style.background=theme.primaryLight; }}
              onMouseLeave={e => { e.currentTarget.style.background=bg; }}>
              <div style={{ width:70, minWidth:70, padding:"10px 8px", display:"flex", gap:4, justifyContent:"center", flexShrink:0 }}>
                {isEditing ? (
                  <><button onClick={() => { update(editId, editVals); setEditId(null); }} style={{ padding:"3px 8px", background:"#dcfce7", border:"none", borderRadius:6, color:"#16a34a", cursor:"pointer", fontSize:12 }}>✓</button><button onClick={() => setEditId(null)} style={{ padding:"3px 8px", background:"#f3f4f6", border:"none", borderRadius:6, color:"#6b7280", cursor:"pointer", fontSize:12 }}>✕</button></>
                ) : (
                  <><button onClick={() => { setEditId(item._id); setEditVals({...item}); }} style={{ padding:"3px 8px", background:"#eff6ff", border:"none", borderRadius:6, color:"#3b82f6", cursor:"pointer", fontSize:12 }}>✎</button><button onClick={() => { if(window.confirm("למחוק?")) remove(item._id); }} style={{ padding:"3px 8px", background:"#fef2f2", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", fontSize:12 }}>🗑</button></>
                )}
              </div>
              {COLS.map(col => (
                <div key={col.key} style={{ ...CELL(col.width), color: item.colored ? "#991b1b" : "#374151" }}>
                  {isEditing ? (
                    col.type === "boolean" ? <input type="checkbox" checked={!!editVals[col.key]} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.checked}))} />
                    : <input type={col.type==="number"?"number":"text"} value={editVals[col.key]??""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))} style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"2px 6px", fontSize:12, outline:"none", fontFamily:"inherit" }} />
                  ) : (
                    col.type==="boolean" ? (item[col.key]?"✓":"-") : col.type==="number" ? fmt(item[col.key]) : (item[col.key]||"-")
                  )}
                </div>
              ))}
              <div style={{ width:30, minWidth:30, display:"flex", justifyContent:"center", flexShrink:0 }}>
                <div onClick={() => toggleColor(item._id, { colored: !item.colored })} style={{ width:12, height:12, borderRadius:"50%", background: item.colored?"#ef4444":"#e5e7eb", border: item.colored?"2px solid #dc2626":"2px solid #d1d5db", cursor:"pointer" }} />
              </div>
            </div>
          );
        })}
        {filtered.length > 0 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:theme.primaryLight, borderTop:`2px solid ${theme.primaryBorder}` }}>
            <span style={{ fontSize:13, color:"#6b7280" }}>סה״כ ({filtered.length} רשומות)</span>
            <span style={{ fontSize:16, fontWeight:700, color:theme.primary }}>{fmt(total)} ₪</span>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת רשומה">
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>תאריך</label>
              <input type="date" value={form.date} onChange={e => setForm(p => ({...p, date: e.target.value}))}  required={true}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>קליינט</label>
              <input type="text" value={form.clientName} onChange={e => setForm(p => ({...p, clientName: e.target.value}))}  required={true}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מס׳ שיק</label>
              <input type="number" value={form.checkNumber} onChange={e => setForm(p => ({...p, checkNumber: e.target.value}))} min="0" required={false}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מס׳ בנק</label>
              <input type="number" value={form.bankNumber} onChange={e => setForm(p => ({...p, bankNumber: e.target.value}))} min="0" required={false}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מס׳ סניף</label>
              <input type="number" value={form.branchNumber} onChange={e => setForm(p => ({...p, branchNumber: e.target.value}))} min="0" required={false}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מס׳ חשבון</label>
              <input type="number" value={form.accountNumber} onChange={e => setForm(p => ({...p, accountNumber: e.target.value}))} min="0" required={false}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>סכום</label>
              <input type="number" value={form.number} onChange={e => setForm(p => ({...p, number: e.target.value}))} min="0" required={false}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>תאריך פירעון</label>
              <input type="date" value={form.paymentDate} onChange={e => setForm(p => ({...p, paymentDate: e.target.value}))}  required={false}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מס׳ חשבונית</label>
              <input type="text" value={form.taxNumber} onChange={e => setForm(p => ({...p, taxNumber: e.target.value}))}  required={false}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>הערה</label>
              <input type="text" value={form.remark} onChange={e => setForm(p => ({...p, remark: e.target.value}))}  required={false}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            
          </div>
          <div style={{ display:"flex", gap:10 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); }} style={{ flex:1, padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>ביטול</button>
            <button type="submit" style={{ flex:2, padding:10, border:"none", borderRadius:8, background:theme.gradient, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>שמור</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
