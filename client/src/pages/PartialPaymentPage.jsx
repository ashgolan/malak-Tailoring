import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { partialPaymentApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import Modal from "../components/ui/Modal";


const EMPTY = { date: today, clientName: "", name: "", advanceAmount: 0, colored: false, totalAmount: 0, payments: [] };

const COLS = [
  { key: "balance",      label: "יתרה",   width: "9%"  },
  { key: "totalAmount",  label: "סכום כללי", width: "9%"  },
  { key: "advanceAmount",label: "שולם",   width: "9%"  },
  { key: "name",         label: "עבור",   width: "12%" },
  { key: "clientName",   label: "קליינט", width: "17%" },
  { key: "date",         label: "תאריך",  width: "9%"  },
];

// Payment history modal
function PaymentsModal({ item, onClose, onAddPayment, theme }) {
  const [payForm, setPayForm] = useState({ amount: 0, date: today, note: "-" });
  const payments = item.payments || [];
  // advanceAmount يُحسب فقط إذا لم توجد payments (بيانات قديمة)
  const legacyAdvance = payments.length === 0 ? Number(item.advanceAmount || 0) : 0;
  const paid = payments.reduce((s, p) => s + Number(p.amount || 0), 0) + legacyAdvance;
  const balance = Number(item.totalAmount || 0) - paid;

  const handleAdd = () => {
    if (!payForm.amount || Number(payForm.amount) <= 0) return;
    onAddPayment(item._id, payForm, paid);
    setPayForm({ amount: 0, date: today, note: "-" });
  };

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1100, padding:16 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:520, maxHeight:"85vh", overflowY:"auto", padding:28, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", direction:"rtl" }}>

        {/* Header */}
        <div style={{ borderBottom:`2px solid ${theme.primaryBorder}`, paddingBottom:16, marginBottom:20 }}>
          <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>תשלום חלקי</div>
          <div style={{ fontSize:20, fontWeight:700, color:"#1f2937" }}>{item.clientName}</div>
          <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>עבור: {item.name}</div>
        </div>

        {/* Summary */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:12, marginBottom:20 }}>
          {[
            { label:"סה״כ לתשלום", value:`${fmt(item.totalAmount)} ₪`, color:"#1f2937" },
            { label:"שולם עד כה",  value:`${fmt(paid)} ₪`,            color:"#16a34a" },
            { label:"יתרה",        value:`${fmt(balance)} ₪`,          color: balance > 0 ? "#ef4444" : "#16a34a" },
          ].map((s, i) => (
            <div key={i} style={{ background: i===2 && balance <= 0 ? "#f0fdf4" : i===2 ? "#fef2f2" : theme.primaryLight, borderRadius:10, padding:"12px 14px", border:`1px solid ${i===2 && balance<=0 ? "#bbf7d0" : i===2 ? "#fecaca" : theme.primaryBorder}` }}>
              <div style={{ fontSize:11, color:"#9ca3af", marginBottom:4 }}>{s.label}</div>
              <div style={{ fontSize:17, fontWeight:700, color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Payments history */}
        {payments.length > 0 && (
          <div style={{ marginBottom:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:"#6b7280", marginBottom:10, textTransform:"uppercase", letterSpacing:"0.04em" }}>היסטוריית תשלומים</div>
            {payments.map((p, i) => (
              <div key={i} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", borderRadius:8, background: i%2===0 ? "#fafafa" : "#fff", border:"1px solid #f0f0ef", marginBottom:6 }}>
                <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                  <div style={{ width:28, height:28, borderRadius:"50%", background:theme.primaryLight, border:`1px solid ${theme.primaryBorder}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:12, fontWeight:700, color:theme.primary }}>{i+1}</div>
                  <div>
                    <div style={{ fontSize:13, fontWeight:600, color:"#1f2937" }}>תשלום {i+1}</div>
                    <div style={{ fontSize:11, color:"#9ca3af" }}>{p.date} {p.note && p.note !== "-" ? `· ${p.note}` : ""}</div>
                  </div>
                </div>
                <div style={{ fontSize:15, fontWeight:700, color:"#16a34a" }}>{fmt(p.amount)} ₪</div>
              </div>
            ))}
          </div>
        )}

        {/* Add payment */}
        {balance > 0 && (
          <div style={{ background:theme.primaryLight, borderRadius:12, padding:16, border:`1px solid ${theme.primaryBorder}` }}>
            <div style={{ fontSize:13, fontWeight:700, color:theme.primary, marginBottom:12 }}>+ הוסף תשלום חדש</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10, marginBottom:10 }}>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6b7280", marginBottom:4 }}>סכום</label>
                <input type="number" value={payForm.amount} min="0" max={balance}
                  onChange={e => setPayForm(p => ({...p, amount: e.target.value}))}
                  style={{ width:"100%", padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit", fontWeight:700 }}
                  onFocus={e => fo(e, theme.accent)} onBlur={bl} />
              </div>
              <div>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6b7280", marginBottom:4 }}>תאריך</label>
                <input type="date" value={payForm.date}
                  onChange={e => setPayForm(p => ({...p, date: e.target.value}))}
                  style={{ width:"100%", padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                  onFocus={e => fo(e, theme.accent)} onBlur={bl} />
              </div>
              <div style={{ gridColumn:"1/-1" }}>
                <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#6b7280", marginBottom:4 }}>הערה (אופציונלי)</label>
                <input type="text" value={payForm.note} placeholder="מזומן, העברה..."
                  onChange={e => setPayForm(p => ({...p, note: e.target.value}))}
                  style={{ width:"100%", padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                  onFocus={e => fo(e, theme.accent)} onBlur={bl} />
              </div>
            </div>
            <button onClick={handleAdd}
              style={{ width:"100%", padding:"10px", border:"none", borderRadius:8, background:theme.gradient, color:"#fff", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              ✓ רשום תשלום
            </button>
          </div>
        )}

        {balance <= 0 && (
          <div style={{ textAlign:"center", padding:"16px", background:"#f0fdf4", borderRadius:12, border:"1px solid #bbf7d0" }}>
            <div style={{ fontSize:20, marginBottom:8 }}>✅</div>
            <div style={{ fontWeight:700, color:"#16a34a", fontSize:14 }}>שולם במלואו!</div>
          </div>
        )}

        <button onClick={onClose}
          style={{ width:"100%", marginTop:16, padding:"10px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>
          סגור
        </button>
      </div>
    </div>
  );
}

export default function PartialPaymentPage() {
  const { theme } = useTheme();
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("partialPayment", partialPaymentApi);
  const [modal, setModal] = useState(false);
  const [paymentsModal, setPaymentsModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const currentYear = new Date().getFullYear();

  const filtered = [...(data || [])]
    .filter(item => {
      if (!showAll) { if (!item.date) return item.colored; if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false; }
      if (search) { const s = search.toLowerCase(); return ["clientName","name"].some(f => String(item[f]||"").toLowerCase().includes(s)); }
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const totalPaid = filtered.reduce((s, i) => {
    const fromPayments = (i.payments||[]).reduce((ps, p) => ps + Number(p.amount||0), 0);
    const legacy = (i.payments||[]).length === 0 ? Number(i.advanceAmount||0) : 0;
    return s + fromPayments + legacy;
  }, 0);
  const totalBalance = total - totalPaid;

  // Add payment to existing record
  const handleAddPayment = (id, payForm, currentPaid) => {
    const item = data.find(i => i._id === id);
    if (!item) return;
    const newPayments = [...(item.payments || []), payForm];
    // advanceAmount يبقى كما هو (للبيانات القديمة فقط)
    // الدفعات الجديدة تُحسب من payments array
    update(id, { payments: newPayments });
    setPaymentsModal(prev => prev ? { ...prev, payments: newPayments } : null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false);
    setForm(EMPTY);
  };

  const CELL = (w, extra={}) => ({ width:w, flexBasis:w, flexGrow:1, flexShrink:1, padding:"10px 10px", fontSize:13, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", ...extra });
  const ROW = { display:"flex", flexDirection:"row-reverse", alignItems:"center", width:"100%", borderBottom:"1px solid #f3f4f6" };

  if (isLoading) return <div style={{ display:"flex", justifyContent:"center", padding:80 }}><div style={{ width:36, height:36, border:`4px solid ${theme.primaryBorder}`, borderTopColor:theme.primary, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} /><style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 12px ${theme.primary}30` }}>💳</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>תשלום חלקי</h1>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"3px 0 0" }}>{filtered.length} רשומות</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button onClick={() => setShowAll(!showAll)}
            style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${showAll ? theme.accent : "#e5e7eb"}`, background: showAll ? theme.primaryLight : "#fff", color: showAll ? theme.primary : "#6b7280", cursor:"pointer", fontFamily:"inherit" }}>
            {showAll ? "שנה נוכחית" : "כל הזמנים"}
          </button>
          <button onClick={() => setModal(true)}
            style={{ padding:"9px 18px", borderRadius:8, background:theme.gradient, color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 2px 8px ${theme.primary}30` }}>
            + הוסף
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${theme.primaryBorder}`, padding:"16px 24px", display:"flex", gap:0, alignItems:"center", flexWrap:"wrap" }}>
        {[
          { label:"סה״כ לתשלום",  value:`${fmt(total)} ₪`,        color:theme.primary },
          { label:"שולם",          value:`${fmt(totalPaid)} ₪`,    color:"#16a34a" },
          { label:"יתרה כוללת",   value:`${fmt(totalBalance)} ₪`, color: totalBalance > 0 ? "#ef4444" : "#16a34a" },
          { label:"רשומות",        value:filtered.length,           color:"#6b7280" },
        ].map((stat, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", flexGrow:1 }}>
            {i > 0 && <div style={{ width:1, background:theme.primaryBorder, alignSelf:"stretch", marginLeft:24, marginRight:24 }} />}
            <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
              <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.04em" }}>{stat.label}</span>
              <span style={{ fontSize:18, fontWeight:700, color:stat.color }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי קליינט או עבור..."
        style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
        onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Table */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ ...ROW, background:theme.gradient, color:"#fff" }}>
          <div style={{ width:100, minWidth:100, padding:"12px 6px", fontSize:12, fontWeight:700, textAlign:"center", flexShrink:0 }}>פעולות</div>
          {COLS.map(col => <div key={col.key} style={{ ...CELL(col.width), color:"#fff", fontWeight:700, fontSize:12, padding:"12px 10px" }}>{col.label}</div>)}
          <div style={{ width:30, minWidth:30, flexShrink:0 }} />
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"56px 20px", color:"#9ca3af" }}><div style={{ fontSize:32, marginBottom:12 }}>💳</div><div style={{ fontSize:15, fontWeight:500 }}>אין נתונים</div></div>
        ) : filtered.map((item, idx) => {
          const isEditing = editId === item._id;
          const paidFromPayments = (item.payments||[]).reduce((s,p) => s+Number(p.amount||0), 0);
          const legacyAdvance = (item.payments||[]).length === 0 ? Number(item.advanceAmount||0) : 0;
          const totalPaidItem = paidFromPayments + legacyAdvance;
          const balance = Number(item.totalAmount||0) - totalPaidItem;
          const bg = item.colored ? "#fef2f2" : balance <= 0 ? "#f0fdf4" : idx%2===0 ? "#fff" : "#fafafa";

          return (
            <div key={item._id} style={{ ...ROW, background:bg }}
              onMouseEnter={e => { if(!item.colored) e.currentTarget.style.background=theme.primaryLight; }}
              onMouseLeave={e => { e.currentTarget.style.background=bg; }}>

              {/* Actions */}
              <div style={{ width:100, minWidth:100, padding:"10px 6px", display:"flex", gap:2, justifyContent:"center", flexShrink:0 }}>
                <button onClick={() => setPaymentsModal(item)}
                  style={{ padding:"3px 6px", background:theme.primaryLight, border:`1px solid ${theme.primaryBorder}`, borderRadius:6, color:theme.primary, cursor:"pointer", fontSize:11, fontWeight:600 }}>
                  💳{(item.payments||[]).length > 0 ? ` ${(item.payments||[]).length}` : ""}
                </button>
                {isEditing ? (
                  <><button onClick={() => { update(editId, editVals); setEditId(null); }} style={{ padding:"3px 6px", background:"#dcfce7", border:"none", borderRadius:6, color:"#16a34a", cursor:"pointer", fontSize:12 }}>✓</button><button onClick={() => setEditId(null)} style={{ padding:"3px 6px", background:"#f3f4f6", border:"none", borderRadius:6, color:"#6b7280", cursor:"pointer", fontSize:12 }}>✕</button></>
                ) : (
                  <><button onClick={() => { setEditId(item._id); setEditVals({...item}); }} style={{ padding:"3px 6px", background:"#eff6ff", border:"none", borderRadius:6, color:"#3b82f6", cursor:"pointer", fontSize:12 }}>✎</button><button onClick={() => { if(window.confirm("למחוק?")) remove(item._id); }} style={{ padding:"3px 6px", background:"#fef2f2", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", fontSize:12 }}>🗑</button></>
                )}
              </div>

              {/* Cells */}
              {COLS.map(col => (
                <div key={col.key} style={CELL(col.width, { color: item.colored ? "#991b1b" : "#374151" })}>
                  {col.key === "balance" ? (
                    <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                      <span style={{ fontWeight:700, color: balance > 0 ? "#ef4444" : "#16a34a" }}>{fmt(balance)} ₪</span>
                      {(item.payments||[]).length > 0 && (
                        <span style={{ fontSize:10, background:theme.primaryLight, color:theme.primary, padding:"1px 5px", borderRadius:10, fontWeight:600 }}>
                          {(item.payments||[]).length} תשלומים
                        </span>
                      )}
                    </div>
                  ) : col.key === "advanceAmount" ? (
                    <span style={{ fontWeight:600, color:"#16a34a" }}>{fmt(totalPaidItem)} ₪</span>
                  ) : isEditing ? (
                    <input type={col.key==="date"?"date":"text"} value={editVals[col.key]??""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))}
                      style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"2px 6px", fontSize:12, outline:"none", fontFamily:"inherit" }} />
                  ) : (
                    col.key==="totalAmount" ? `${fmt(item[col.key])} ₪` : (item[col.key]||"-")
                  )}
                </div>
              ))}

              {/* Dot */}
              <div style={{ width:30, minWidth:30, display:"flex", justifyContent:"center", flexShrink:0 }}>
                <div onClick={() => toggleColor(item._id, { colored: !item.colored })}
                  style={{ width:12, height:12, borderRadius:"50%", background: item.colored?"#ef4444":"#e5e7eb", border: item.colored?"2px solid #dc2626":"2px solid #d1d5db", cursor:"pointer" }} />
              </div>
            </div>
          );
        })}

        {filtered.length > 0 && (
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:theme.primaryLight, borderTop:`2px solid ${theme.primaryBorder}` }}>
            <span style={{ fontSize:13, color:"#6b7280" }}>סה״כ ({filtered.length} רשומות)</span>
            <span style={{ fontSize:14, fontWeight:700, color: totalBalance > 0 ? "#ef4444" : "#16a34a" }}>יתרה: {fmt(totalBalance)} ₪</span>
          </div>
        )}
      </div>

      {/* Add Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת תשלום חלקי">
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { key:"date",        label:"תאריך",      type:"date"   },
              { key:"clientName",  label:"קליינט",     type:"text"   },
              { key:"name",        label:"עבור",       type:"text"   },
              { key:"totalAmount", label:"סה״כ לתשלום",type:"number" },
              { key:"advanceAmount",label:"שולם מראש", type:"number" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>{f.label}</label>
                <input type={f.type} value={form[f.key]} onChange={e => setForm(p=>({...p,[f.key]:e.target.value}))}
                  required={["date","clientName","name"].includes(f.key)} min={f.type==="number"?"0":undefined}
                  style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                  onFocus={e => fo(e, theme.accent)} onBlur={bl} />
              </div>
            ))}
          </div>

          {(Number(form.totalAmount) > 0 || Number(form.advanceAmount) > 0) && (
            <div style={{ background: Number(form.totalAmount)-Number(form.advanceAmount)>0 ? "#fef2f2" : "#f0fdf4", borderRadius:12, padding:"12px 16px", border:`1px solid ${Number(form.totalAmount)-Number(form.advanceAmount)>0 ? "#fecaca":"#bbf7d0"}`, display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:13, color:"#6b7280" }}>יתרה לתשלום:</span>
              <span style={{ fontSize:22, fontWeight:700, color: Number(form.totalAmount)-Number(form.advanceAmount)>0 ? "#ef4444":"#16a34a" }}>
                {fmt(Number(form.totalAmount)-Number(form.advanceAmount))} ₪
              </span>
            </div>
          )}

          <div style={{ display:"flex", gap:10 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); }}
              style={{ flex:1, padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>ביטול</button>
            <button type="submit"
              style={{ flex:2, padding:10, border:"none", borderRadius:8, background:theme.gradient, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>שמור</button>
          </div>
        </form>
      </Modal>

      {/* Payments history modal */}
      {paymentsModal && (
        <PaymentsModal
          item={paymentsModal}
          onClose={() => setPaymentsModal(null)}
          onAddPayment={handleAddPayment}
          theme={theme}
        />
      )}
    </div>
  );
}
