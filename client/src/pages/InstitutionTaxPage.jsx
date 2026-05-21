import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { institutionTaxApi, taxValuesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";

const EMPTY = { date: today(), clientName: "", name: "", taxNumber: "", number: 0, paymentDate: today(), colored: false, totalAmount: 0 };

const COLS = [
  { key: "totalAmount",  label: "סה״כ",          type: "money", width: "8%"  },
  { key: "masDeduction", label: "נ.במקור",        type: "calc",  width: "7%"  },
  { key: "paymentDate",  label: "ת.תשלום",                       width: "10%" },
  { key: "taxNumber",    label: "מס' חשבונית",                   width: "9%"  },
  { key: "number",       label: "סכום",           type: "money", width: "8%"  },
  { key: "name",         label: "עבודה",                         width: "14%" },
  { key: "clientName",   label: "מוסד",                          width: "16%" },
  { key: "date",         label: "תאריך",                         width: "9%"  },
];

export default function InstitutionTaxPage() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("institutionTax", institutionTaxApi);
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const masValue = Number(taxValues?.masValue || 2.5);
  const currentYear = new Date().getFullYear();

  const allInstitutions = [...new Set((data || []).map(i => i.clientName).filter(Boolean))].sort();
  const allWorks = [...new Set((data || []).map(i => i.name).filter(Boolean))].sort();

  const filtered = [...(data || [])]
    .filter(item => {
      if (!showAll) { if (!item.date) return item.colored; if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false; }
      if (search) { const s = search.toLowerCase(); return ["clientName","name","taxNumber"].some(f => String(item[f]||"").toLowerCase().includes(s)); }
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const calcMas = (amount) => Number(amount) * masValue / 100;

  const set = (k, v) => setForm(p => {
    const updated = { ...p, [k]: v };
    if (k === "number") updated.totalAmount = Number(v);
    return updated;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) { update(editId, { ...editVals, totalAmount: Number(editVals.number) }); setEditId(null); }
    else { create({ ...form, totalAmount: Number(form.number) }); }
    setModal(false); setForm(EMPTY);
  };

  const ROW = { display:"flex", flexDirection:"row-reverse", alignItems:"center", width:"100%", borderBottom:"1px solid #f3f4f6" };
  const CELL = (w, extra={}) => ({ width:w, flexBasis:w, flexGrow:1, flexShrink:1, padding:"10px 10px", fontSize:13, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", ...extra });

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
          <div style={{ width:44, height:44, borderRadius:12, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 12px ${theme.primary}30` }}>🏛️</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>חשבוניות למוסדות</h1>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"3px 0 0" }}>{filtered.length} רשומות | סה״כ: <strong style={{ color:theme.primary }}>{fmt(total)} ₪</strong></p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setShowAll(!showAll)} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${showAll ? theme.accent : "#e5e7eb"}`, background: showAll ? theme.primaryLight : "#fff", color: showAll ? theme.primary : "#6b7280", cursor:"pointer", fontFamily:"inherit" }}>{showAll ? "שנה נוכחית" : "כל הזמנים"}</button>
          <button onClick={() => setModal(true)} style={{ padding:"9px 18px", borderRadius:8, background:theme.gradient, color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 2px 8px ${theme.primary}30` }}>+ הוסף</button>
        </div>
      </div>

      {/* Stats — desktop only */}
      {!isMobile && (
        <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${theme.primaryBorder}`, padding:"16px 24px", display:"flex", gap:0, alignItems:"center", flexWrap:"wrap" }}>
          {[
            { label:"סה״כ",                       value:`${fmt(total)} ₪`,                        color:theme.primary },
            { label:`ניכוי במקור ${masValue}%`,   value:`${fmt(total * masValue / 100)} ₪`,       color:"#d97706"     },
            { label:"לאחר ניכוי",                  value:`${fmt(total - total * masValue / 100)} ₪`, color:"#059669"  },
            { label:"מוסדות",                      value:[...new Set(filtered.map(i => i.clientName))].length, color:"#6b7280" },
          ].map((stat, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flexGrow:1 }}>
              {i > 0 && <div style={{ width:1, background:theme.primaryBorder, alignSelf:"stretch", marginLeft:24, marginRight:24 }} />}
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500, textTransform:"uppercase" }}>{stat.label}</span>
                <span style={{ fontSize:16, fontWeight:700, color:stat.color }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי מוסד, עבודה, מס' חשבונית..."
        style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:16, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
        onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Mobile Cards / Desktop Table */}
      {isMobile ? (
        <MobileCards
          items={filtered}
          columns={COLS}
          onEdit={(item) => { setEditId(item._id); setEditVals({...item}); setModal(true); }}
          onDelete={(id) => remove(id)}
          onToggleColor={toggleColor}
          total={total}
          theme={theme}
        />
      ) : (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ ...ROW, background:theme.gradient, color:"#fff" }}>
            <div style={{ width:70, minWidth:70, padding:"12px 8px", fontSize:12, fontWeight:700, textAlign:"center", flexShrink:0 }}>פעולות</div>
            {COLS.map(col => <div key={col.key} style={{ ...CELL(col.width), color:"#fff", fontWeight:700, fontSize:12, padding:"12px 10px" }}>{col.label}</div>)}
            <div style={{ width:30, minWidth:30, flexShrink:0 }} />
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"56px 20px", color:"#9ca3af" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>🏛️</div>
              <div style={{ fontSize:15, fontWeight:500 }}>אין נתונים</div>
            </div>
          ) : filtered.map((item, idx) => {
            const isEditing = editId === item._id;
            const bg = item.colored ? "#fef2f2" : idx%2===0 ? "#fff" : "#fafafa";
            return (
              <div key={item._id} style={{ ...ROW, background:bg }}
                onMouseEnter={e => { if(!item.colored) e.currentTarget.style.background=theme.primaryLight; }}
                onMouseLeave={e => { e.currentTarget.style.background=bg; }}>
                <div style={{ width:70, minWidth:70, padding:"10px 8px", display:"flex", gap:3, justifyContent:"center", flexShrink:0 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => { update(editId, { ...editVals, totalAmount: Number(editVals.number) }); setEditId(null); }} style={{ padding:"3px 8px", background:"#dcfce7", border:"none", borderRadius:6, color:"#16a34a", cursor:"pointer", fontSize:12 }}>✓</button>
                      <button onClick={() => setEditId(null)} style={{ padding:"3px 8px", background:"#f3f4f6", border:"none", borderRadius:6, color:"#6b7280", cursor:"pointer", fontSize:12 }}>✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(item._id); setEditVals({...item}); }} style={{ padding:"3px 8px", background:"#eff6ff", border:"none", borderRadius:6, color:"#3b82f6", cursor:"pointer", fontSize:12 }}>✎</button>
                      <button onClick={() => { if(window.confirm("האם אתה בטוח שברצונך למחוק?")) remove(item._id); }} style={{ padding:"3px 8px", background:"#fef2f2", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", fontSize:12 }}>🗑</button>
                    </>
                  )}
                </div>
                {COLS.map(col => (
                  <div key={col.key} style={CELL(col.width, { color: item.colored ? "#991b1b" : "#374151" })}>
                    {col.key === "masDeduction" ? (
                      <span style={{ color:"#d97706", fontWeight:600 }}>- {fmt(calcMas(item.number || item.totalAmount))} ₪</span>
                    ) : isEditing ? (
                      <input type={col.type==="money"?"number":"text"} value={editVals[col.key]??""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))}
                        style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"2px 6px", fontSize:12, outline:"none", fontFamily:"inherit" }} />
                    ) : (
                      col.type==="money" ? fmt(item[col.key]) : (item[col.key]||"-")
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
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }} title={editId ? "עריכת חשבונית" : "הוספת חשבונית למוסד"} size="md">
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>תאריך</label>
              <input type="date" value={editId ? editVals.date : form.date} onChange={e => editId ? setEditVals(v=>({...v,date:e.target.value})) : set("date", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מוסד</label>
              <input type="text" value={editId ? editVals.clientName : form.clientName} onChange={e => editId ? setEditVals(v=>({...v,clientName:e.target.value})) : set("clientName", e.target.value)}
                list="institutions-list" placeholder="שם המוסד" required
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
              <datalist id="institutions-list">{allInstitutions.map(i => <option key={i} value={i} />)}</datalist>
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>עבודה</label>
              <input type="text" value={editId ? editVals.name : form.name} onChange={e => editId ? setEditVals(v=>({...v,name:e.target.value})) : set("name", e.target.value)}
                list="works-list" placeholder="סוג העבודה" required
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
              <datalist id="works-list">{allWorks.map(w => <option key={w} value={w} />)}</datalist>
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>סכום</label>
              <input type="number" value={editId ? editVals.number : form.number} min="0"
                onChange={e => editId ? setEditVals(v=>({...v,number:e.target.value})) : set("number", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:14, fontWeight:700, color:theme.primary, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>מס' חשבונית</label>
              <input type="text" value={editId ? editVals.taxNumber : form.taxNumber} onChange={e => editId ? setEditVals(v=>({...v,taxNumber:e.target.value})) : set("taxNumber", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>תאריך תשלום</label>
              <input type="date" value={editId ? editVals.paymentDate : form.paymentDate} onChange={e => editId ? setEditVals(v=>({...v,paymentDate:e.target.value})) : set("paymentDate", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
          </div>

          {Number(editId ? editVals.number : form.number) > 0 && (
            <div style={{ background:theme.primaryLight, border:`1px solid ${theme.primaryBorder}`, borderRadius:12, padding:"14px 18px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#6b7280", marginBottom:6 }}>
                <span>סכום</span><span>{fmt(editId ? editVals.number : form.number)} ₪</span>
              </div>
              {masValue > 0 && (
                <div style={{ display:"flex", justifyContent:"space-between", fontSize:13, color:"#d97706", marginBottom:6 }}>
                  <span>ניכוי במקור {masValue}%</span>
                  <span>- {fmt(calcMas(editId ? editVals.number : form.number))} ₪</span>
                </div>
              )}
              <div style={{ borderTop:`1px solid ${theme.primaryBorder}`, paddingTop:10, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:13, fontWeight:600, color:"#374151" }}>לתשלום בפועל:</span>
                <span style={{ fontSize:20, fontWeight:700, color:theme.primary }}>{fmt(Number(editId ? editVals.number : form.number) - calcMas(editId ? editVals.number : form.number))} ₪</span>
              </div>
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={{ flex:1, padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>ביטול</button>
            <button type="submit" style={{ flex:2, padding:10, border:"none", borderRadius:8, background:theme.gradient, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>שמור</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}