import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { salesApi, inventoriesApi, taxValuesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useStyles } from "../hooks/useStyles";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";

const EMPTY = { date: today(), clientName: "", remark: "-", name: "", quantity: 1, number: 0, discount: 0, sale: 0, expenses: 0, totalAmount: 0, tax: false, colored: false };

const COLS = [
  { key: "totalAmount", label: "סה״כ", type: "number", width: "8%" },
  { key: "tax", label: "מע״מ", type: "boolean", width: "6%" },
  { key: "sale", label: "מכירה", type: "number", width: "7%" },
  { key: "expenses", label: "הוצ׳", type: "number", width: "6%" },
  { key: "discount", label: "הנחה%", type: "number", width: "6%" },
  { key: "number", label: "מחיר", type: "number", width: "6%" },
  { key: "quantity", label: 'כ.מ"ר', type: "number", width: "5%" },
  { key: "remark", label: "הערה", width: "10%" },
  { key: "name", label: "עבודה", width: "12%" },
  { key: "clientName", label: "קליינט", width: "12%" },
  { key: "date", label: "תאריך", type: "date", width: "9%" },
];

// ─── Pulse animation style ─────────────────────────────────────
const pulseKeyframes = `
@keyframes pulse-red {
  0%   { box-shadow: 0 0 0 0 rgba(239,68,68,0.7); opacity: 1; }
  50%  { box-shadow: 0 0 0 6px rgba(239,68,68,0); opacity: 0.6; }
  100% { box-shadow: 0 0 0 0 rgba(239,68,68,0); opacity: 1; }
}
`;

// ─── Dot component with pulse ──────────────────────────────────
function ColorDot({ colored, onClick }) {
  return (
    <>
      <style>{pulseKeyframes}</style>
      <div
        onClick={onClick}
        title={colored ? "לחץ לביטול הסימון" : "לחץ לסימון כלא שולם"}
        style={{
          width: 13,
          height: 13,
          borderRadius: "50%",
          background: colored ? "#ef4444" : "var(--border)",
          border: colored ? "2px solid #dc2626" : "2px solid var(--border)",
          cursor: "pointer",
          transition: "background 0.3s, transform 0.2s",
          animation: colored ? "pulse-red 1.6s ease-in-out infinite" : "none",
          flexShrink: 0,
        }}
        onMouseEnter={e => { e.currentTarget.style.transform = "scale(1.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.transform = "scale(1)"; }}
      />
    </>
  );
}

// ─── Client Autocomplete ───────────────────────────────────────
function ClientAutocomplete({ value, onChange, allClients, accent }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showList, setShowList] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowList(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);
  const handleInput = (e) => { const v = e.target.value; onChange(v); const f = allClients.filter(c => c.toLowerCase().includes(v.toLowerCase())); setSuggestions(f); setShowList(f.length > 0 || v.length === 0); };
  const handleFocus = () => { setSuggestions(allClients); setShowList(allClients.length > 0); };
  return (
    <div style={{ position: "relative" }} ref={ref}>
      <input type="text" value={value} onChange={handleInput} onFocus={handleFocus} required placeholder="שם הלקוח"
        style={{ width: "100%", padding: "9px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "var(--text-1)", transition: "border-color 0.15s" }} />
      {showList && suggestions.length > 0 && (
        <div style={{ position: "absolute", top: "100%", right: 0, left: 0, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 8, boxShadow: "var(--shadow-modal)", zIndex: 100, maxHeight: 180, overflowY: "auto", marginTop: 2 }}>
          {suggestions.map((c, i) => (
            <div key={i} onClick={() => { onChange(c); setShowList(false); }}
              style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, color: "var(--text-1)", borderBottom: "1px solid var(--border-light)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SalesPage() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const S = useStyles(theme);
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
      if (!showAll) { if (!item.date) return item.colored; if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false; }
      if (search) { const s = search.toLowerCase(); return ["clientName", "name", "remark"].some(f => String(item[f] || "").toLowerCase().includes(s)); }
      return true;
    })
    .sort((a, b) => a.date < b.date ? 1 : -1);

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const allClients = [...new Set((data || []).map(s => s.clientName).filter(Boolean))].sort();
  const allNames = [...new Set((data || []).map(s => s.name).filter(Boolean))].sort();

  const setField = (key, val) => {
    setForm(prev => {
      const u = { ...prev, [key]: val };
      const num = Number(u.number) || 0, disc = Number(u.discount) || 0, qty = Number(u.quantity) || 1, exp = Number(u.expenses) || 0;
      const saleVal = num - (num * disc) / 100;
      u.sale = saleVal;
      const base = saleVal * qty - exp;
      u.totalAmount = u.tax ? Math.round(base * (1 + maam / 100)) : base;
      return u;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) { update(editId, editVals); setEditId(null); }
    else create(form);
    setModal(false); setForm(EMPTY);
  };

  if (isLoading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 80 }}>
      <div className="rosh-spinner" style={{ borderTopColor: theme.primary }} />
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: "rtl" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🛒</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-1)" }}>מכירות</h1>
            <p style={{ fontSize: 13, margin: "3px 0 0", color: "var(--text-4)" }}>{filtered.length} רשומות &nbsp;|&nbsp; סה״כ: <strong style={{ color: theme.primary }}>{fmt(total)} ₪</strong></p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.toggleBtn(showAll, theme)} onClick={() => setShowAll(!showAll)}>
            {showAll ? "שנה נוכחית" : "כל הזמנים"}
          </button>
          <button onClick={() => setModal(true)}
            style={{ padding: "9px 18px", borderRadius: 8, background: theme.gradient, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            + הוסף מכירה
          </button>
        </div>
      </div>

      {/* Stats */}
      {!isMobile && (
        <div style={S.statBar}>
          <div><span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>סה״כ</span><span style={{ fontSize: 18, fontWeight: 700, color: theme.primary }}>{fmt(total)} ₪</span></div>
          <div style={S.divider} />
          <div><span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>רשומות</span><span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-3)" }}>{filtered.length}</span></div>
          <div style={S.divider} />
          <div><span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>הוצאות</span><span style={{ fontSize: 18, fontWeight: 700, color: "#ef4444" }}>{fmt(filtered.reduce((s, i) => s + (Number(i.expenses) || 0), 0))} ₪</span></div>
        </div>
      )}

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="חיפוש לפי לקוח, עבודה, הערה..."
        style={S.inputLg} onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Table / Cards */}
      {isMobile ? (
        <MobileCards items={filtered} columns={COLS}
          onEdit={item => { setEditId(item._id); setEditVals({ ...item }); setModal(true); }}
          onDelete={id => remove(id)} onToggleColor={toggleColor} total={total} theme={theme} />
      ) : (
        <div style={S.card}>
          {/* Header row */}
          <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", width: "100%", background: theme.gradient, color: "#fff" }}>
            <div style={{ width: 70, minWidth: 70, padding: "12px 8px", fontSize: 12, fontWeight: 700, textAlign: "center", flexShrink: 0 }}>פעולות</div>
            {COLS.map(col => (
              <div key={col.key} style={S.cell(col.width, { color: "#fff", fontWeight: 700, fontSize: 12, padding: "12px 10px" })}>{col.label}</div>
            ))}
            <div style={{ width: 30, minWidth: 30, flexShrink: 0 }} />
          </div>

          {filtered.length === 0 ? (
            <div style={S.empty}><div style={{ fontSize: 32, marginBottom: 12 }}>🛒</div><div>אין מכירות להצגה</div></div>
          ) : filtered.map((item, idx) => {
            const isEditing = editId === item._id;
            return (
              <div key={item._id} style={S.row(item.colored, idx)}
                onMouseEnter={e => { if (!item.colored) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = item.colored ? "var(--colored-bg)" : idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-alt)"; }}>
                {/* Actions */}
                <div style={{ width: 70, minWidth: 70, padding: "10px 8px", display: "flex", gap: 4, justifyContent: "center", flexShrink: 0 }}>
                  {isEditing ? (<>
                    <button onClick={() => { update(editId, editVals); setEditId(null); }} style={S.btnSave}>✓</button>
                    <button onClick={() => setEditId(null)} style={S.btnDiscard}>✕</button>
                  </>) : (<>
                    <button onClick={() => { setEditId(item._id); setEditVals({ ...item }); }} style={S.btnEdit}>✎</button>
                    <button onClick={() => { if (window.confirm("האם אתה בטוח שברצונך למחוק?")) remove(item._id); }} style={S.btnDelete}>🗑</button>
                  </>)}
                </div>

                {/* Cells */}
                {COLS.map(col => (
                  <div key={col.key} style={S.cell(col.width, {
                    color: item.colored ? "var(--colored-text)" : col.type === "number" ? theme.primary : "var(--text-1)",
                    fontWeight: col.type === "number" ? 600 : col.key === "clientName" ? 600 : 400,
                  })}>
                    {isEditing ? (
                      col.type === "boolean" ? (
                        <div onClick={() => setEditVals(v => ({ ...v, [col.key]: !v[col.key] }))} style={{ position: "relative", width: 36, height: 20, cursor: "pointer" }}>
                          <div style={{ position: "absolute", inset: 0, borderRadius: 20, background: editVals[col.key] ? theme.primary : "var(--border)", transition: "0.2s" }}>
                            <div style={{ position: "absolute", top: 2, right: editVals[col.key] ? 2 : 18, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "0.2s" }} />
                          </div>
                        </div>
                      ) : (
                        <input type={col.type === "number" ? "number" : "text"} value={editVals[col.key] ?? ""} onChange={e => setEditVals(v => ({ ...v, [col.key]: e.target.value }))}
                          style={{ width: "100%", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 6px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg-input)", color: "var(--text-1)" }} />
                      )
                    ) : (
                      col.type === "boolean"
                        ? (item[col.key] ? <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 11 }}>✓ מע״מ</span> : <span style={{ color: "var(--text-4)", fontSize: 11 }}>ללא</span>)
                        : col.type === "number" ? fmt(item[col.key])
                          : String(item[col.key] || "-")
                    )}
                  </div>
                ))}

                {/* Color dot with pulse */}
                <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", alignItems: "center", flexShrink: 0 }}>
                  <ColorDot colored={item.colored} onClick={() => toggleColor(item._id, { colored: !item.colored })} />
                </div>
              </div>
            );
          })}

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-hover)", borderTop: `2px solid ${theme.primaryBorder}` }}>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>סה״כ ({filtered.length} רשומות)</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: theme.primary }}>{fmt(total)} ₪</span>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }} title={editId ? "עריכת מכירה" : "הוספת מכירה חדשה"} size="lg">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            {/* Date */}
            <div>
              <label style={S.label}>תאריך</label>
              <input type="date" value={form.date} onChange={e => setField("date", e.target.value)}
                style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            {/* Client autocomplete */}
            <div>
              <label style={S.label}>קליינט</label>
              <ClientAutocomplete value={form.clientName} onChange={v => setField("clientName", v)} allClients={allClients} accent={theme.accent} />
            </div>

            {/* Work / inventory */}
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>עבודה</label>
              {inventories?.length ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  <select value={inventories.find(x => x.name === form.name) ? form.name : ""} onChange={e => { if (e.target.value) { const inv = inventories.find(x => x.name === e.target.value); setField("name", inv.name); setField("number", inv.number); } }}
                    style={S.select}>
                    <option value="">בחר מהמלאי...</option>
                    {(inventories || []).map(inv => <option key={inv._id} value={inv.name}>{inv.name} — {fmt(inv.number)} ₪</option>)}
                  </select>
                  <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} placeholder="תיאור חופשי" list="sales-names" required
                    style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
                  <datalist id="sales-names">{allNames.map(n => <option key={n} value={n} />)}</datalist>
                </div>
              ) : (
                <>
                  <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} list="sales-names" required
                    style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
                  <datalist id="sales-names">{allNames.map(n => <option key={n} value={n} />)}</datalist>
                </>
              )}
            </div>

            {/* Number fields */}
            {[
              { key: "number", label: "מחיר" },
              { key: "quantity", label: 'כ.מ"ר' },
              { key: "discount", label: "הנחה %" },
              { key: "expenses", label: "הוצאות (יורדות)" },
              { key: "remark", label: "הערה", type: "text" },
            ].map(f => (
              <div key={f.key}>
                <label style={S.label}>{f.label}</label>
                <input type={f.type || "number"} value={form[f.key]} onChange={e => setField(f.key, f.type === "text" ? e.target.value : e.target.value)} min={f.type !== "text" ? 0 : undefined}
                  style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
              </div>
            ))}

            {/* Tax toggle */}
            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 20 }}>
              <div style={{ position: "relative", width: 36, height: 20 }}>
                <div onClick={() => setField("tax", !form.tax)}
                  style={{ position: "absolute", inset: 0, borderRadius: 20, cursor: "pointer", background: form.tax ? theme.primary : "var(--border)", transition: "0.2s" }}>
                  <div style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "0.2s", right: form.tax ? 2 : 18 }} />
                </div>
              </div>
              <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>כולל מע״מ {maam}%</label>
            </div>
          </div>

          {/* Total preview */}
          <div style={{ background: "var(--bg-hover)", borderRadius: 12, padding: "14px 18px", border: `1px solid ${theme.primaryBorder}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>
              מכירה: {fmt(form.sale)} ₪ &nbsp;→&nbsp; סה״כ
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, color: theme.primary }}>{fmt(form.totalAmount)} ₪</span>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={S.btnCancel}>ביטול</button>
            <button type="submit" style={S.btnSubmit(theme)}>שמור</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
