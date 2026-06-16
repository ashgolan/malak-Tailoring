import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { expensesApi, taxValuesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useStyles } from "../hooks/useStyles";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";
import AutocompleteInput from "../components/ui/AutocompleteInput.jsx";

const EMPTY = { date: today(), name: "", number: 0, paymentDate: "", colored: false, taxNumber: "", tax: false, totalAmount: 0 };
const COLS = [
  { key: "totalAmount", label: "סה״כ", type: "money", width: "9%" },
  { key: "tax", label: "מע״מ", type: "boolean", width: "6%" },
  { key: "paymentDate", label: "ת.תשלום", width: "10%" },
  { key: "taxNumber", label: "מס׳ חשבונית", width: "10%" },
  { key: "number", label: "סכום", type: "money", width: "9%" },
  { key: "name", label: "שם", width: "30%" },
  { key: "date", label: "תאריך", width: "9%" },
];
export default function ExpensesPage() {
  const { theme } = useTheme(); const isMobile = useIsMobile(); const S = useStyles(theme);
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("expenses", expensesApi);
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });
  const [modal, setModal] = useState(false); const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState(""); const [showAll, setShowAll] = useState(false);
  const [editId, setEditId] = useState(null); const [editVals, setEditVals] = useState({});
  const maam = Number(taxValues?.maamValue || 18); const currentYear = new Date().getFullYear();
  const allNames = [...new Set((data || []).map(i => i.name).filter(Boolean))].sort();
  const filtered = [...(data || [])].filter(item => {
    if (!showAll) { if (!item.date) return item.colored; if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false; }
    if (search) { const s = search.toLowerCase(); return ["name", "taxNumber"].some(f => String(item[f] || "").toLowerCase().includes(s)); }
    return true;
  }).sort((a, b) => a.date < b.date ? 1 : -1);

  // ✅ المجموع قبل מע״מ = مجموع حقل "number" (السكوم قبل הוספת מע״מ)
  const total = filtered.reduce((s, i) => s + (Number(i.number) || 0), 0);

  const val = (k) => editId ? (editVals[k] ?? "") : form[k];
  const set = (k, v) => editId ? setEditVals(p => ({ ...p, [k]: v })) : setForm(p => ({ ...p, [k]: v }));
  const handleSubmit = (e) => {
    e.preventDefault();
    const base = Number(form.number);
    if (editId) { update(editId, { ...editVals, totalAmount: editVals.tax ? Math.round(Number(editVals.number) * (1 + maam / 100)) : Number(editVals.number) }); setEditId(null); }
    else create({ ...form, totalAmount: form.tax ? Math.round(base * (1 + maam / 100)) : base });
    setModal(false); setForm(EMPTY);
  };
  const mobileCols = COLS.map(col => col.key === "tax" ? { ...col, render: v => v ? <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ מע״מ</span> : <span style={{ color: "var(--text-4)" }}>ללא</span> } : col);
  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><div className="rosh-spinner" style={{ borderTopColor: theme.primary }} /></div>;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: "rtl" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💸</div>
          <div><h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-1)" }}>הוצאות</h1>
            <p style={{ fontSize: 13, margin: "3px 0 0", color: "var(--text-4)" }}>{filtered.length} רשומות | סה״כ: <strong style={{ color: theme.primary }}>{fmt(total)} ₪</strong></p></div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.toggleBtn(showAll, theme)} onClick={() => setShowAll(!showAll)}>{showAll ? "שנה נוכחית" : "כל הזמנים"}</button>
          <button onClick={() => setModal(true)} style={{ padding: "9px 18px", borderRadius: 8, background: theme.gradient, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ הוסף</button>
        </div>
      </div>

      {/* Stats */}
      {!isMobile && (
        <div style={S.statBar}>
          <div><span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>סה״כ (לפני מע״מ)</span><span style={{ fontSize: 18, fontWeight: 700, color: "#ef4444" }}>{fmt(total)} ₪</span></div>
          <div style={S.divider} />
          <div><span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>רשומות</span><span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-3)" }}>{filtered.length}</span></div>
        </div>
      )}

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי שם, חשבונית..." style={S.inputLg} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
      {isMobile ? (<MobileCards items={filtered} columns={mobileCols} onEdit={item => { setEditId(item._id); setEditVals({ ...item }); setModal(true); }} onDelete={id => remove(id)} onToggleColor={toggleColor} total={total} theme={theme} />) : (
        <div style={S.card}>
          <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", width: "100%", background: theme.gradient, color: "#fff" }}>
            <div style={{ width: 70, minWidth: 70, padding: "12px 8px", fontSize: 12, fontWeight: 700, textAlign: "center", flexShrink: 0 }}>פעולות</div>
            {COLS.map(col => <div key={col.key} style={S.cell(col.width, { color: "#fff", fontWeight: 700, fontSize: 12, padding: "12px 10px" })}>{col.label}</div>)}
            <div style={{ width: 30, minWidth: 30, flexShrink: 0 }} />
          </div>
          {filtered.length === 0 ? <div style={S.empty}><div style={{ fontSize: 32, marginBottom: 12 }}>💸</div><div>אין הוצאות</div></div>
            : filtered.map((item, idx) => {
              const isEditing = editId === item._id; return (
                <div key={item._id} style={S.row(item.colored, idx)}
                  onMouseEnter={e => { if (!item.colored) e.currentTarget.style.background = "var(--bg-hover)"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = item.colored ? "var(--colored-bg)" : idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-alt)"; }}>
                  <div style={{ width: 70, minWidth: 70, padding: "10px 8px", display: "flex", gap: 4, justifyContent: "center", flexShrink: 0 }}>
                    {isEditing ? (<><button onClick={() => { update(editId, { ...editVals, totalAmount: editVals.tax ? Math.round(Number(editVals.number) * (1 + maam / 100)) : Number(editVals.number) }); setEditId(null); }} style={S.btnSave}>✓</button><button onClick={() => setEditId(null)} style={S.btnDiscard}>✕</button></>)
                      : (<><button onClick={() => { setEditId(item._id); setEditVals({ ...item }); }} style={S.btnEdit}>✎</button><button onClick={() => { if (window.confirm("האם אתה בטוח שברצונך למחוק?")) remove(item._id); }} style={S.btnDelete}>🗑</button></>)}
                  </div>
                  {COLS.map(col => (
                    <div key={col.key} style={S.cell(col.width, { color: item.colored ? "var(--colored-text)" : col.type === "money" ? theme.primary : "var(--text-1)", fontWeight: col.type === "money" ? 600 : col.key === "name" ? 500 : 400 })}>
                      {isEditing ? (
                        col.type === "boolean" ? (
                          <div onClick={() => setEditVals(v => ({ ...v, [col.key]: !v[col.key] }))} style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
                            <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: editVals[col.key] ? theme.primary : "var(--border)", transition: "0.2s" }}>
                              <div style={{ position: "absolute", top: 2, right: editVals[col.key] ? 2 : 18, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "0.2s" }} />
                            </div>
                          </div>
                        ) : (
                          <input type={col.type === "money" ? "number" : "text"} value={editVals[col.key] ?? ""} onChange={e => setEditVals(v => ({ ...v, [col.key]: e.target.value }))} style={{ width: "100%", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 6px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg-input)", color: "var(--text-1)" }} />
                        )
                      ) : (
                        col.type === "boolean" ? (item[col.key] ? <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 11 }}>✓ מע״מ</span> : <span style={{ color: "var(--text-4)", fontSize: 11 }}>ללא</span>) : col.type === "money" ? fmt(item[col.key]) : (item[col.key] || "-")
                      )}
                    </div>
                  ))}
                  <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}><div onClick={() => toggleColor(item._id, { colored: !item.colored })} style={S.dot(item.colored)} /></div>
                </div>
              );
            })}
          {filtered.length > 0 && (<div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-hover)", borderTop: `2px solid ${theme.primaryBorder}` }}><span style={{ fontSize: 13, color: "var(--text-3)" }}>סה״כ ({filtered.length})</span><span style={{ fontSize: 16, fontWeight: 700, color: theme.primary }}>{fmt(total)} ₪</span></div>)}
        </div>
      )}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }} title={editId ? "עריכת הוצאה" : "הוספת הוצאה"} size="md">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div><label style={S.label}>תאריך</label><input type="date" value={val("date")} onChange={e => set("date", e.target.value)} style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} /></div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>שם / תיאור</label>
              <AutocompleteInput value={val("name")} onChange={e => set("name", e.target.value)}
                suggestions={allNames} required style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl}/>
            </div>
            <div><label style={S.label}>סכום</label><input type="number" min="0" value={val("number")} onChange={e => set("number", e.target.value)} style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} /></div>
            <div><label style={S.label}>מס׳ חשבונית</label><input type="text" value={val("taxNumber")} onChange={e => set("taxNumber", e.target.value)} style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} /></div>
            <div><label style={S.label}>ת.תשלום</label><input type="date" value={val("paymentDate")} onChange={e => set("paymentDate", e.target.value)} style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 8 }}>
              <div style={{ position: "relative", width: 36, height: 20 }}>
                <div onClick={() => set("tax", !val("tax"))} style={{ position: "absolute", inset: 0, borderRadius: 20, cursor: "pointer", transition: "0.2s", background: val("tax") ? theme.primary : "var(--border)" }}>
                  <div style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "0.2s", right: val("tax") ? 2 : 18 }} />
                </div>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>כולל מע״מ {maam}%</label>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}><button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={S.btnCancel}>ביטול</button><button type="submit" style={S.btnSubmit(theme)}>שמור</button></div>
        </form>
      </Modal>
    </div>
  );
}
