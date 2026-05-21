import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { salesApi, inventoriesApi, taxValuesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";

const EMPTY = { date: today(), clientName: "", remark: "-", name: "", quantity: 1, number: 0, discount: 0, sale: 0, expenses: 0, totalAmount: 0, tax: false, colored: false };

function ClientAutocomplete({ value, onChange, allClients, accent }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showList, setShowList] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowList(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const handleInput = (e) => {
    const val = e.target.value; onChange(val);
    const f = allClients.filter(c => c.toLowerCase().includes(val.toLowerCase()));
    setSuggestions(f); setShowList(f.length > 0 || val.length === 0);
  };
  const handleFocus = () => { setSuggestions(allClients); setShowList(allClients.length > 0); };
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <input type="text" value={value} onChange={handleInput} onFocus={handleFocus}
        placeholder="שם הלקוח" required autoComplete="off"
        style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        onFocus={e => { handleFocus(); fo(e, accent); }} onBlur={bl} />
      {showList && (
        <ul style={{ position: "absolute", zIndex: 50, width: "100%", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, boxShadow: "0 4px 12px rgba(0,0,0,0.1)", marginTop: 4, maxHeight: 180, overflowY: "auto", listStyle: "none", padding: 4, margin: 4 }}>
          {suggestions.map((name, i) => (
            <li key={i} onMouseDown={() => { onChange(name); setShowList(false); }}
              style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", borderRadius: 6 }}
              onMouseEnter={e => { e.currentTarget.style.background = "#f5f3ff"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "transparent"; }}>
              {name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const COLS = [
  { key: "totalAmount", label: "סה״כ", type: "number", width: "8%" },
  { key: "tax", label: "מע״מ", type: "boolean", width: "5%" },
  { key: "expenses", label: "הוצאות", type: "number", width: "7%" },
  { key: "sale", label: "מחיר נטו", type: "number", width: "8%" },
  { key: "discount", label: "הנחה%", type: "number", width: "6%" },
  { key: "number", label: "מחיר", type: "number", width: "6%" },
  { key: "quantity", label: 'כ.מ"ר', type: "number", width: "5%" },
  { key: "name", label: "עבודה", width: "14%" },
  { key: "clientName", label: "קליינט", width: "13%" },
  { key: "date", label: "תאריך", type: "date", width: "9%" },
];

export default function SalesPage() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("sales", salesApi);
  const { data: inventories } = useQuery({ queryKey: ["inventories"], queryFn: () => inventoriesApi.getAll().then(r => r.data) });
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
      if (search) { const s = search.toLowerCase(); return ["clientName", "name", "remark"].some(f => String(item[f] || "").toLowerCase().includes(s)); }
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const allClients = [...new Set((data || []).map(s => s.clientName).filter(Boolean))].sort();

  const setField = (key, val) => {
    setForm(prev => {
      const u = { ...prev, [key]: val };
      const num = Number(u.number) || 0, disc = Number(u.discount) || 0, qty = Number(u.quantity) || 1, exp = Number(u.expenses) || 0;
      const saleVal = num - (num * disc) / 100;
      u.sale = saleVal;
      const base = saleVal * qty - exp;
      u.totalAmount = u.tax ? base * (1 + maam / 100) : base;
      return u;
    });
  };

  const handleSubmit = (e) => { e.preventDefault(); create(form); setModal(false); setForm(EMPTY); };

  const CELL = (w, extra = {}) => ({ width: w, flexBasis: w, flexGrow: 1, flexShrink: 1, padding: "10px 10px", fontSize: 13, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", ...extra });
  const ROW = { display: "flex", flexDirection: "row-reverse", alignItems: "center", width: "100%", borderBottom: "1px solid #f3f4f6" };

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div style={{ width: 36, height: 36, border: `4px solid ${theme.primaryBorder}`, borderTopColor: theme.primary, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: "rtl" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, boxShadow: `0 4px 12px ${theme.primary}30` }}>🛒</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1f2937", margin: 0 }}>מכירות</h1>
            <p style={{ fontSize: 13, color: "#9ca3af", margin: "3px 0 0" }}>{filtered.length} רשומות &nbsp;|&nbsp; סה״כ: <strong style={{ color: theme.primary }}>{fmt(total)} ₪</strong></p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => setShowAll(!showAll)} style={{ fontSize: 12, padding: "6px 14px", borderRadius: 8, border: `1px solid ${showAll ? theme.accent : "#e5e7eb"}`, background: showAll ? theme.primaryLight : "#fff", color: showAll ? theme.primary : "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>{showAll ? "שנה נוכחית" : "כל הזמנים"}</button>
          <button onClick={() => setModal(true)} style={{ padding: "9px 18px", borderRadius: 8, background: theme.gradient, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit", boxShadow: `0 2px 8px ${theme.primary}30` }}>+ הוסף מכירה</button>
        </div>
      </div>

      {/* Stats — desktop only */}
      {!isMobile && (
        <div style={{ background: "#fff", borderRadius: 12, border: `1px solid ${theme.primaryBorder}`, padding: "16px 24px", display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap" }}>
          {[
            { label: "סה״כ מכירות", value: `${fmt(total)} ₪`, color: theme.primary },
            { label: "מע״מ נוסף", value: `${fmt(total * maam / 100)} ₪`, color: "#d97706" },
            { label: "כולל מע״מ", value: `${fmt(total * (1 + maam / 100))} ₪`, color: "#059669" },
            { label: "מספר עסקאות", value: filtered.length, color: "#6b7280" },
          ].map((stat, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center" }}>
              {i > 0 && <div style={{ width: 1, background: theme.primaryBorder, alignSelf: "stretch", marginLeft: 32 }} />}
              <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <span style={{ fontSize: 11, color: "#9ca3af", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.04em" }}>{stat.label}</span>
                <span style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי לקוח, מוצר, הערה..."
        style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 16, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
        onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Mobile Cards / Desktop Table */}
      {isMobile ? (
        <MobileCards
          items={filtered}
          columns={COLS}
          onEdit={(item) => { setEditId(item._id); setEditVals({ ...item }); setModal(true); }}
          onDelete={(id) => remove(id)}
          onToggleColor={toggleColor}
          total={total}
          theme={theme}
        />
      ) : (
        <div style={{ background: "#fff", borderRadius: 16, border: "1px solid #f0f0ef", overflow: "hidden", boxShadow: "0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ ...ROW, background: theme.gradient, color: "#fff" }}>
            <div style={{ width: 70, minWidth: 70, padding: "12px 8px", fontSize: 12, fontWeight: 700, textAlign: "center", flexShrink: 0 }}>פעולות</div>
            {COLS.map(col => <div key={col.key} style={{ ...CELL(col.width), color: "#fff", fontWeight: 700, fontSize: 12, padding: "12px 10px" }}>{col.label}</div>)}
            <div style={{ width: 30, minWidth: 30, flexShrink: 0 }} />
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "56px 20px", color: "#9ca3af" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>🛒</div>
              <div style={{ fontSize: 15, fontWeight: 500 }}>אין מכירות להצגה</div>
            </div>
          ) : filtered.map((item, idx) => {
            const isEditing = editId === item._id;
            const bg = item.colored ? "#fef2f2" : idx % 2 === 0 ? "#fff" : "#fafafa";
            return (
              <div key={item._id} style={{ ...ROW, background: bg }}
                onMouseEnter={e => { if (!item.colored) e.currentTarget.style.background = theme.primaryLight; }}
                onMouseLeave={e => { e.currentTarget.style.background = bg; }}>
                <div style={{ width: 70, minWidth: 70, padding: "10px 8px", display: "flex", gap: 4, justifyContent: "center", flexShrink: 0 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => { update(editId, editVals); setEditId(null); }} style={{ padding: "3px 8px", background: "#dcfce7", border: "none", borderRadius: 6, color: "#16a34a", cursor: "pointer", fontSize: 12 }}>✓</button>
                      <button onClick={() => setEditId(null)} style={{ padding: "3px 8px", background: "#f3f4f6", border: "none", borderRadius: 6, color: "#6b7280", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(item._id); setEditVals({ ...item }); }} style={{ padding: "3px 8px", background: "#eff6ff", border: "none", borderRadius: 6, color: "#3b82f6", cursor: "pointer", fontSize: 12 }}>✎</button>
                      <button onClick={() => { if (window.confirm("האם אתה בטוח שברצונך למחוק?")) remove(item._id); }} style={{ padding: "3px 8px", background: "#fef2f2", border: "none", borderRadius: 6, color: "#ef4444", cursor: "pointer", fontSize: 12 }}>🗑</button>
                    </>
                  )}
                </div>
                {COLS.map(col => (
                  <div key={col.key} style={{ ...CELL(col.width), color: item.colored ? "#991b1b" : "#374151" }}>
                    {isEditing ? (
                      col.type === "boolean" ? (
                        <div onClick={() => setEditVals(v => ({ ...v, [col.key]: !v[col.key] }))} style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
                          <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: editVals[col.key] ? theme.primary : "#d1d5db", transition: "0.2s" }}>
                            <div style={{ position: "absolute", top: 2, right: editVals[col.key] ? 2 : 18, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "0.2s" }} />
                          </div>
                        </div>
                      ) : (
                        <input type={col.type === "number" ? "number" : "text"} value={editVals[col.key] ?? ""} onChange={e => setEditVals(v => ({ ...v, [col.key]: e.target.value }))}
                          style={{ width: "100%", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 6px", fontSize: 12, outline: "none", fontFamily: "inherit" }} />
                      )
                    ) : (
                      col.type === "boolean" ? (item[col.key] ? <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 11 }}>✓ מע״מ</span> : <span style={{ color: "#9ca3af", fontSize: 11 }}>ללא</span>)
                        : col.type === "number" ? fmt(item[col.key])
                          : (item[col.key] || "-")
                    )}
                  </div>
                ))}
                <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                  <div onClick={() => toggleColor(item._id, { colored: !item.colored })} style={{ width: 12, height: 12, borderRadius: "50%", background: item.colored ? "#ef4444" : "#e5e7eb", border: item.colored ? "2px solid #dc2626" : "2px solid #d1d5db", cursor: "pointer" }} />
                </div>
              </div>
            );
          })}

          {filtered.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: theme.primaryLight, borderTop: `2px solid ${theme.primaryBorder}` }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>סה״כ ({filtered.length} רשומות)</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: theme.primary }}>{fmt(total)} ₪</span>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }} title={editId ? "עריכת מכירה" : "הוספת מכירה חדשה"} size="lg">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>תאריך</label>
              <input type="date" value={form.date} onChange={e => setField("date", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>קליינט</label>
              <ClientAutocomplete value={form.clientName} onChange={v => setField("clientName", v)} allClients={allClients} accent={theme.accent} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>עבודה</label>
              {inventories?.length ? (
                <select value={form.name} onChange={e => { const inv = inventories.find(i => i.name === e.target.value); setField("name", e.target.value); if (inv) setField("number", inv.number); }}
                  style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", background: "#fff", boxSizing: "border-box", fontFamily: "inherit" }} required>
                  <option value="">בחר מוצר</option>
                  {inventories.map(i => <option key={i._id} value={i.name}>{i.name}</option>)}
                </select>
              ) : (
                <>
                  <input type="text" value={form.name} onChange={e => setField("name", e.target.value)}
                    list="names-list"
                    style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                    onFocus={e => fo(e, theme.accent)} onBlur={bl} required />
                  <datalist id="names-list">
                    {[...new Set((data || []).map(i => i.name).filter(Boolean))].sort().map((n, i) => (
                      <option key={i} value={n} />
                    ))}
                  </datalist>
                </>)}
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>כ.מ"ר</label>
              <input type="number" value={form.quantity} min="1" onChange={e => setField("quantity", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>מחיר ליחידה</label>
              <input type="number" value={form.number} min="0" onChange={e => setField("number", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>הנחה %</label>
              <input type="number" value={form.discount} min="0" max="100" onChange={e => setField("discount", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>הוצאות (יורדות)</label>
              <input type="number" value={form.expenses} min="0" onChange={e => setField("expenses", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#6b7280", marginBottom: 6 }}>הערה</label>
              <input type="text" value={form.remark} onChange={e => setField("remark", e.target.value)}
                style={{ width: "100%", padding: "9px 12px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
              <div style={{ position: "relative", width: 36, height: 20 }}>
                <div onClick={() => setField("tax", !form.tax)} style={{ position: "absolute", inset: 0, borderRadius: 20, cursor: "pointer", background: form.tax ? theme.primary : "#d1d5db", transition: "0.2s" }}>
                  <div style={{ position: "absolute", top: 2, right: form.tax ? 2 : 18, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                </div>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "#374151" }}>כולל מע״מ {maam}%</label>
            </div>
          </div>

          {/* Total preview */}
          <div style={{ background: theme.primaryLight, border: `1px solid ${theme.primaryBorder}`, borderRadius: 12, padding: "14px 18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
              <span>מחיר × כ.מ"ר</span><span>{fmt(form.sale * form.quantity)} ₪</span>
            </div>
            {Number(form.expenses) > 0 && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#ef4444", marginBottom: 4 }}>
                <span>הוצאות</span><span>- {fmt(form.expenses)} ₪</span>
              </div>
            )}
            {form.tax && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "#d97706", marginBottom: 4 }}>
                <span>מע״מ {maam}%</span><span>+ {fmt(form.totalAmount - (form.sale * form.quantity - form.expenses))} ₪</span>
              </div>
            )}
            <div style={{ borderTop: `1px solid ${theme.primaryBorder}`, paddingTop: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#374151" }}>סה״כ לתשלום:</span>
              <span style={{ fontSize: 24, fontWeight: 700, color: theme.primary }}>{fmt(form.totalAmount)} ₪</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={{ flex: 1, padding: 10, border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", fontSize: 13, fontWeight: 500, color: "#6b7280", cursor: "pointer", fontFamily: "inherit" }}>ביטול</button>
            <button type="submit" style={{ flex: 2, padding: 10, border: "none", borderRadius: 8, background: theme.gradient, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>שמור מכירה</button>
          </div>
        </form>
      </Modal>

    </div>
  );
}