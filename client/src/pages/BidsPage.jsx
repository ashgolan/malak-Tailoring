import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { bidsApi, inventoriesApi, taxValuesApi } from "../api";

const toNum = (v) => parseFloat(v) || 0;
const fmt = (n) => toNum(n).toLocaleString("he-IL", { maximumFractionDigits: 2 });
const today = new Date().toISOString().split("T")[0];
const nowTime = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });

const fo = (e) => { e.target.style.borderColor = "#c4b5fd"; };
const bl = (e) => { e.target.style.borderColor = "#e5e7eb"; };

const s = {
  overlay: { position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 },
  modal: { background:"#fff", borderRadius:16, width:"100%", maxWidth:680, maxHeight:"90vh", overflowY:"auto", padding:28, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", direction:"rtl" },
  label: { display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 },
  input: { width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border-color 0.15s" },
  select: { width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", background:"#fff", boxSizing:"border-box", fontFamily:"inherit" },
  textarea: { width:"100%", padding:"12px 14px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, fontFamily:"inherit", outline:"none", boxSizing:"border-box", resize:"vertical", minHeight:150, lineHeight:1.7, transition:"border-color 0.15s" },
  tab: { flex:1, padding:"8px", borderRadius:6, border:"none", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" },
};

// ─── Bid Modal ─────────────────────────────────────────────────
function BidModal({ initial, onClose, onSave, loading, inventories, maam }) {
  const isEdit = !!initial?._id;
  const [bidType, setBidType] = useState(
    initial ? (initial.freeBid ? "free" : "items") : "items"
  );

  const [form, setForm] = useState({
    clientName: initial?.clientName || "",
    date: initial?.date || today,
    time: initial?.time || nowTime,
    target: initial?.target || "-",
    isApproved: initial?.isApproved || false,
    freeBid: initial?.freeBid ?? false,
    totalAmount: initial?.totalAmount || 0,
    data: initial?.data || [],
  });

  const [items, setItems] = useState(
    initial?.data?.length > 0 && !initial?.freeBid
      ? initial.data
      : [{ description: "", quantity: 1, price: 0, total: 0 }]
  );

  const [freeText, setFreeText] = useState(
    initial?.freeBid && initial?.data?.length > 0 ? initial.data[0]?.text || "" : ""
  );

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const updateItem = (i, k, v) => {
    setItems(prev => prev.map((row, idx) => {
      if (idx !== i) return row;
      const updated = { ...row, [k]: v };
      updated.total = toNum(updated.quantity) * toNum(updated.price);
      return updated;
    }));
  };

  const selectInventory = (i, name) => {
    const inv = (inventories || []).find(x => x.name === name);
    setItems(prev => prev.map((row, idx) => {
      if (idx !== i) return row;
      const updated = { ...row, description: name, price: inv ? toNum(inv.number) : row.price };
      updated.total = toNum(updated.quantity) * toNum(updated.price);
      return updated;
    }));
  };

  const addItem = () => setItems(p => [...p, { description: "", quantity: 1, price: 0, total: 0 }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));

  const itemsTotal = items.reduce((a, it) => a + toNum(it.total), 0);

  const handleSave = () => {
    const isItems = bidType === "items";
    const total = isItems ? itemsTotal : toNum(form.totalAmount);
    onSave({
      ...form,
      freeBid: !isItems,
      data: isItems ? items : [{ text: freeText }],
      totalAmount: total,
    });
  };

  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={s.modal}>
        <div style={{ fontSize:17, fontWeight:700, color:"#1f2937", marginBottom:20 }}>
          {isEdit ? "עריכת הצעת מחיר" : "הצעת מחיר חדשה"}
        </div>

        {/* Tabs */}
        <div style={{ display:"flex", gap:0, marginBottom:20, background:"#f5f5f4", borderRadius:8, padding:3 }}>
          {[{ key:"items", label:"📋 רשימת פריטים" }, { key:"free", label:"📝 טקסט חופשי" }].map(t => (
            <button key={t.key} onClick={() => setBidType(t.key)} style={{
              ...s.tab,
              background: bidType === t.key ? "#fff" : "transparent",
              color: bidType === t.key ? "#7c3aed" : "#6b7280",
              fontWeight: bidType === t.key ? 700 : 500,
              boxShadow: bidType === t.key ? "0 1px 4px rgba(0,0,0,0.08)" : "none",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Header fields */}
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16 }}>
          <div>
            <label style={s.label}>קליינט *</label>
            <input style={s.input} value={form.clientName} onChange={set("clientName")} placeholder="שם הלקוח" required onFocus={fo} onBlur={bl} />
          </div>
          <div>
            <label style={s.label}>תאריך</label>
            <input type="date" style={s.input} value={form.date} onChange={set("date")} onFocus={fo} onBlur={bl} />
          </div>
          <div>
            <label style={s.label}>יעד / נושא</label>
            <input style={s.input} value={form.target} onChange={set("target")} placeholder="עבור: כיסוי מחסן..." onFocus={fo} onBlur={bl} />
          </div>
        </div>

        <div style={{ borderTop:"1px solid #f0f0ef", margin:"16px 0" }} />

        {/* ITEMS mode */}
        {bidType === "items" && (
          <>
            <div style={{ display:"flex", gap:8, marginBottom:8, padding:"0 4px" }}>
              {[["40%","תיאור / מוצר"],["18%","כמות"],["20%","מחיר"],["18%","סה״כ"],["4%",""]].map(([w,l]) => (
                <div key={l} style={{ width:w, flexBasis:w, fontSize:11, fontWeight:700, color:"#9ca3af" }}>{l}</div>
              ))}
            </div>

            {items.map((row, i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
                <div style={{ width:"40%", flexBasis:"40%" }}>
                  {inventories?.length ? (
                    <select style={s.select} value={row.description} onChange={e => selectInventory(i, e.target.value)}>
                      <option value="">בחר / הזן</option>
                      {inventories.map(inv => <option key={inv._id} value={inv.name}>{inv.name}</option>)}
                    </select>
                  ) : (
                    <input style={s.input} value={row.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="תיאור" onFocus={fo} onBlur={bl} />
                  )}
                  {inventories?.length && (
                    <input style={{ ...s.input, marginTop:4, fontSize:12 }} value={row.description === (inventories.find(x=>x.name===row.description)?.name||row.description) ? "" : row.description}
                      placeholder="או הזן תיאור חופשי..." onChange={e => updateItem(i, "description", e.target.value)} onFocus={fo} onBlur={bl} />
                  )}
                </div>
                <div style={{ width:"18%", flexBasis:"18%" }}>
                  <input type="number" style={s.input} value={row.quantity} min={1} onChange={e => updateItem(i, "quantity", e.target.value)} onFocus={fo} onBlur={bl} />
                </div>
                <div style={{ width:"20%", flexBasis:"20%" }}>
                  <input type="number" style={s.input} value={row.price} min={0} onChange={e => updateItem(i, "price", e.target.value)} onFocus={fo} onBlur={bl} />
                </div>
                <div style={{ width:"18%", flexBasis:"18%", fontWeight:700, color:"#7c3aed", fontSize:13 }}>
                  {fmt(row.total)} ₪
                </div>
                <div style={{ width:"4%" }}>
                  {items.length > 1 && (
                    <button onClick={() => removeItem(i)} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:18, padding:2 }}>×</button>
                  )}
                </div>
              </div>
            ))}

            <button onClick={addItem} style={{ width:"100%", padding:"8px", border:"1px dashed #c4b5fd", borderRadius:8, background:"transparent", fontSize:13, color:"#7c3aed", cursor:"pointer", fontFamily:"inherit", marginBottom:12 }}>
              + הוסף שורה
            </button>

            <div style={{ background:"#f5f3ff", border:"1px solid #ede9fe", borderRadius:10, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
              <span style={{ fontSize:14, fontWeight:600, color:"#6b21a8" }}>סה"כ</span>
              <span style={{ fontSize:22, fontWeight:700, color:"#7c3aed" }}>{fmt(itemsTotal)} ₪</span>
            </div>
          </>
        )}

        {/* FREE TEXT mode */}
        {bidType === "free" && (
          <>
            <div style={{ marginBottom:12 }}>
              <label style={s.label}>תוכן הצעת המחיר</label>
              <textarea style={s.textarea} value={freeText} onChange={e => setFreeText(e.target.value)}
                placeholder={`לדוג׳:\n• כיסוי שוואדר 10×20 מ׳\n• תפירה כפולה\n• חומר: פוליאסטר 600D\n\nהערות נוספות...`}
                onFocus={fo} onBlur={bl} />
            </div>
            <div>
              <label style={s.label}>סכום כולל (₪)</label>
              <input type="number" style={{ ...s.input, fontSize:18, fontWeight:700, color:"#7c3aed" }}
                value={form.totalAmount} onChange={set("totalAmount")} placeholder="0.00" onFocus={fo} onBlur={bl} />
            </div>
          </>
        )}

        <div style={{ borderTop:"1px solid #f0f0ef", margin:"16px 0" }} />

        {/* Approved toggle */}
        <div style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", background:"#fafaf9", borderRadius:8, border:"1px solid #f0f0ef", marginBottom:16 }}>
          <div style={{ position:"relative", width:36, height:20, flexShrink:0 }}>
            <input type="checkbox" checked={form.isApproved} onChange={e => setForm(p => ({ ...p, isApproved: e.target.checked }))}
              style={{ opacity:0, width:0, height:0, position:"absolute" }} />
            <div onClick={() => setForm(p => ({ ...p, isApproved: !p.isApproved }))}
              style={{ position:"absolute", inset:0, borderRadius:20, cursor:"pointer", background: form.isApproved ? "#7c3aed" : "#d1d5db", transition:"0.2s" }}>
              <div style={{ position:"absolute", top:2, right: form.isApproved ? 2 : 18, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"0.2s", boxShadow:"0 1px 3px rgba(0,0,0,0.2)" }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize:13, fontWeight:600, color:"#374151" }}>הצעה מאושרת</div>
            <div style={{ fontSize:11, color:"#9ca3af" }}>{form.isApproved ? "✅ הלקוח אישר את ההצעה" : "ממתינה לאישור"}</div>
          </div>
        </div>

        <div style={{ display:"flex", gap:10 }}>
          <button onClick={onClose} style={{ flex:1, padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>ביטול</button>
          <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:10, border:"none", borderRadius:8, background:"#7c3aed", fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>
            {loading ? "שומר..." : isEdit ? "עדכן הצעה" : "שמור הצעה"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── View Modal ────────────────────────────────────────────────
function ViewModal({ bid, onClose, onToggleApprove }) {
  const isFree = bid.freeBid;
  return (
    <div style={s.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ ...s.modal, maxWidth:560 }}>
        <div style={{ borderBottom:"2px solid #7c3aed", paddingBottom:16, marginBottom:20 }}>
          <div style={{ fontSize:12, color:"#9ca3af", marginBottom:4 }}>הצעת מחיר</div>
          <div style={{ fontSize:22, fontWeight:700, color:"#1f2937" }}>{bid.clientName}</div>
          <div style={{ fontSize:13, color:"#6b7280", marginTop:4 }}>תאריך: {bid.date} | {bid.time}</div>
          {bid.target && bid.target !== "-" && (
            <div style={{ marginTop:10, fontSize:14, fontWeight:600, color:"#374151" }}>עבור: {bid.target}</div>
          )}
        </div>

        {isFree && bid.data?.[0]?.text && (
          <div style={{ fontSize:14, lineHeight:1.8, color:"#374151", whiteSpace:"pre-wrap", marginBottom:20,
            background:"#fafafa", borderRadius:10, padding:"14px 16px", border:"1px solid #f0f0ef" }}>
            {bid.data[0].text}
          </div>
        )}

        {!isFree && bid.data?.length > 0 && (
          <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:16 }}>
            <thead>
              <tr style={{ background:"#f9fafb" }}>
                {["תיאור","כמות","מחיר ליח׳","סה״כ"].map(h => (
                  <th key={h} style={{ padding:"10px 12px", fontSize:12, fontWeight:600, color:"#6b7280", textAlign:"right", borderBottom:"1px solid #f0f0ef" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bid.data.map((row, i) => (
                <tr key={i} style={{ borderBottom:"1px solid #f9f9f8" }}>
                  <td style={{ padding:"10px 12px", fontSize:13 }}>{row.description}</td>
                  <td style={{ padding:"10px 12px", fontSize:13 }}>{row.quantity}</td>
                  <td style={{ padding:"10px 12px", fontSize:13 }}>{fmt(row.price)} ₪</td>
                  <td style={{ padding:"10px 12px", fontSize:13, fontWeight:700, color:"#7c3aed" }}>{fmt(row.total)} ₪</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div style={{ background:"#f5f3ff", border:"1px solid #ede9fe", borderRadius:10, padding:"14px 18px", display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16 }}>
          <span style={{ fontSize:14, fontWeight:600, color:"#6b21a8" }}>סה"כ</span>
          <span style={{ fontSize:24, fontWeight:700, color:"#7c3aed" }}>{fmt(bid.totalAmount)} ₪</span>
        </div>

        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <span style={{ padding:"4px 12px", borderRadius:12, fontSize:12, fontWeight:600,
            background: bid.isApproved ? "#dcfce7" : "#fef3c7",
            color: bid.isApproved ? "#16a34a" : "#d97706" }}>
            {bid.isApproved ? "✅ מאושר" : "⏳ ממתין לאישור"}
          </span>
          <div style={{ display:"flex", gap:8 }}>
            <button onClick={onToggleApprove}
              style={{ padding:"8px 16px", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
                background: bid.isApproved ? "#fef3c7" : "#dcfce7",
                color: bid.isApproved ? "#d97706" : "#16a34a" }}>
              {bid.isApproved ? "בטל אישור" : "✓ אשר הצעה"}
            </button>
            <button onClick={onClose} style={{ padding:"8px 16px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>סגור</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────
export default function BidsPage() {
  const { data, isLoading, create, update, remove } = useCrud("bids", bidsApi);
  const { data: inventories } = useQuery({ queryKey: ["inventories"], queryFn: () => inventoriesApi.getAll().then(r => r.data) });
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });

  const [modal, setModal] = useState(null);
  const [viewBid, setViewBid] = useState(null);
  const [search, setSearch] = useState("");

  const maam = toNum(taxValues?.maamValue || 17);

  const filtered = (data || []).filter(b =>
    !search || b.clientName?.toLowerCase().includes(search.toLowerCase()) || b.target?.toLowerCase().includes(search.toLowerCase())
  );

  const approved = (data || []).filter(b => b.isApproved).length;
  const pending = (data || []).length - approved;
  const totalAll = (data || []).reduce((a, b) => a + toNum(b.totalAmount), 0);
  const taxTotal = totalAll * maam / 100;
  const grandTotal = totalAll + taxTotal;

  const handleSave = (form) => {
    if (modal?._id) update(modal._id, form);
    else create(form);
    setModal(null);
  };

  const toggleApprove = (bid) => {
    update(bid._id, { isApproved: !bid.isApproved });
    if (viewBid?._id === bid._id) setViewBid(p => ({ ...p, isApproved: !p.isApproved }));
  };

  return (
    <div style={{ padding:"0 0 32px", direction:"rtl" }}>

      {/* Top */}
      <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:12, marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>הצעות מחיר</h1>
          <p style={{ fontSize:13, color:"#9ca3af", margin:"4px 0 0" }}>
            {(data||[]).length} הצעות &nbsp;|&nbsp;
            <span style={{ color:"#16a34a" }}>{approved} מאושרות</span>
            &nbsp;|&nbsp;
            <span style={{ color:"#d97706" }}>{pending} ממתינות</span>
          </p>
        </div>
        <button onClick={() => setModal("add")}
          style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 18px", borderRadius:8, background:"#7c3aed", color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
          + הצעה חדשה
        </button>
      </div>

      {/* Summary Bar */}
      <div style={{ background:"#fff", borderRadius:12, border:"1px solid #ede9fe", padding:"16px 24px", marginBottom:20, display:"flex", gap:32, alignItems:"center", flexWrap:"wrap", boxShadow:"0 1px 4px rgba(124,58,237,0.06)" }}>
        {[
          { label:"סה\"כ לפני מע\"מ", value:`${fmt(totalAll)} ₪`, color:"#1f2937" },
          { label:`מע"מ (${maam}%)`, value:`${fmt(taxTotal)} ₪`, color:"#d97706" },
          { label:"סה\"כ כולל מע\"מ", value:`${fmt(grandTotal)} ₪`, color:"#7c3aed" },
        ].map((stat, i) => (
          <>
            {i > 0 && <div key={`div-${i}`} style={{ width:1, background:"#ede9fe", alignSelf:"stretch" }} />}
            <div key={stat.label} style={{ display:"flex", flexDirection:"column", gap:3 }}>
              <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500, textTransform:"uppercase", letterSpacing:"0.04em" }}>{stat.label}</span>
              <span style={{ fontSize:18, fontWeight:700, color:stat.color }}>{stat.value}</span>
            </div>
          </>
        ))}
      </div>

      {/* Search */}
      <div style={{ marginBottom:20 }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי לקוח או נושא..."
          style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
          onFocus={fo} onBlur={bl} />
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div style={{ textAlign:"center", padding:60, color:"#9ca3af" }}>טוען...</div>
      ) : filtered.length === 0 ? (
        <div style={{ background:"#fff", borderRadius:12, border:"1px solid #f0f0ef", padding:56, textAlign:"center" }}>
          <div style={{ fontSize:32, marginBottom:12 }}>📋</div>
          <div style={{ fontSize:15, fontWeight:500, color:"#525252" }}>{search ? "לא נמצאו תוצאות" : "אין הצעות מחיר עדיין"}</div>
          {!search && <div style={{ fontSize:13, color:"#9ca3af", marginTop:6 }}>לחץ 'הצעה חדשה' להתחלה</div>}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(300px, 1fr))", gap:16 }}>
          {filtered.map(bid => (
            <div key={bid._id} style={{ background:"#fff", borderRadius:12, border:`1px solid ${bid.isApproved ? "#bbf7d0" : "#f0f0ef"}`, padding:20, boxShadow:"0 1px 4px rgba(0,0,0,0.04)", display:"flex", flexDirection:"column", gap:12 }}>
              
              {/* Card top */}
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ fontSize:16, fontWeight:700, color:"#1f2937" }}>{bid.clientName}</div>
                  <div style={{ fontSize:12, color:"#9ca3af", marginTop:2 }}>{bid.date} · {bid.time}</div>
                </div>
                <span style={{ padding:"3px 10px", borderRadius:12, fontSize:11, fontWeight:600,
                  background: bid.isApproved ? "#dcfce7" : "#fef3c7",
                  color: bid.isApproved ? "#16a34a" : "#d97706" }}>
                  {bid.isApproved ? "✅ מאושר" : "⏳ ממתין"}
                </span>
              </div>

              {bid.target && bid.target !== "-" && (
                <div style={{ fontSize:13, color:"#6b7280", background:"#fafaf9", borderRadius:8, padding:"8px 12px", lineHeight:1.5 }}>
                  עבור: {bid.target}
                </div>
              )}

              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span style={{ fontSize:12, color:"#9ca3af" }}>
                  {bid.freeBid ? "📝 טקסט חופשי" : `📋 ${bid.data?.length || 0} פריטים`}
                </span>
                <span style={{ fontSize:20, fontWeight:700, color:"#7c3aed" }}>{fmt(bid.totalAmount)} ₪</span>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:8, borderTop:"1px solid #f5f5f4", paddingTop:12 }}>
                <button onClick={() => setViewBid(bid)}
                  style={{ flex:1, padding:"8px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#f5f3ff"; e.currentTarget.style.borderColor="#c4b5fd"; e.currentTarget.style.color="#7c3aed"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="inherit"; }}>
                  👁 צפה
                </button>
                <button onClick={() => setModal(bid)}
                  style={{ flex:1, padding:"8px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#eff6ff"; e.currentTarget.style.borderColor="#bfdbfe"; e.currentTarget.style.color="#2563eb"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e5e7eb"; e.currentTarget.style.color="inherit"; }}>
                  ✏️ עריכה
                </button>
                <button onClick={() => toggleApprove(bid)}
                  style={{ flex:1, padding:"8px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:12, fontWeight:500, cursor:"pointer", fontFamily:"inherit" }}
                  onMouseEnter={e => { e.currentTarget.style.background= bid.isApproved ? "#fef3c7" : "#dcfce7"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; }}>
                  {bid.isApproved ? "↩ בטל" : "✓ אשר"}
                </button>
                <button onClick={() => { if (window.confirm("למחוק?")) remove(bid._id); }}
                  style={{ padding:"8px 10px", border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, cursor:"pointer" }}
                  onMouseEnter={e => { e.currentTarget.style.background="#fef2f2"; e.currentTarget.style.borderColor="#fecaca"; }}
                  onMouseLeave={e => { e.currentTarget.style.background="#fff"; e.currentTarget.style.borderColor="#e5e7eb"; }}>
                  🗑
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <BidModal
          initial={modal === "add" ? null : modal}
          onClose={() => setModal(null)}
          onSave={handleSave}
          loading={false}
          inventories={inventories}
          maam={maam}
        />
      )}

      {viewBid && (
        <ViewModal
          bid={viewBid}
          onClose={() => setViewBid(null)}
          onToggleApprove={() => toggleApprove(viewBid)}
        />
      )}
    </div>
  );
}
