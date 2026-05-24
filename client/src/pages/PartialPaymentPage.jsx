import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { partialPaymentApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useStyles } from "../hooks/useStyles";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";
import AutocompleteInput from "../components/ui/AutocompleteInput.jsx";

const EMPTY = { date: today(), clientName: "", name: "", advanceAmount: 0, colored: false, totalAmount: 0, payments: [] };

const COLS = [
  { key: "balance", label: "יתרה", width: "9%" },
  { key: "advanceAmount", label: "שולם", width: "9%" },
  { key: "totalAmount", label: "סכום כללי", width: "9%" },
  { key: "name", label: "עבור", width: "12%" },
  { key: "clientName", label: "קליינט", width: "17%" },
  { key: "date", label: "תאריך", width: "9%" },
];

// ─── Payments Modal ────────────────────────────────────────────
function PaymentsModal({ item, onClose, onAddPayment, theme, S }) {
  const [payForm, setPayForm] = useState({ amount: 0, date: today(), note: "-" });
  const payments = item.payments || [];
  const legacyAdvance = payments.length === 0 ? Number(item.advanceAmount || 0) : 0;
  const paid = payments.reduce((s, p) => s + Number(p.amount || 0), 0) + legacyAdvance;
  const balance = Number(item.totalAmount || 0) - paid;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1100, padding: 16, backdropFilter: "blur(2px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--bg-modal)", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "85vh", overflowY: "auto", padding: 28, boxShadow: "var(--shadow-modal)", direction: "rtl", border: "1px solid var(--border)" }}>

        {/* Header */}
        <div style={{ borderBottom: `2px solid ${theme.primaryBorder}`, paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: "var(--text-4)", marginBottom: 4 }}>תשלום חלקי</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)" }}>{item.clientName}</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>עבור: {item.name}</div>
        </div>

        {/* Stats */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
          {[
            { label: "סה״כ לתשלום", value: `${fmt(item.totalAmount)} ₪`, color: "var(--text-1)" },
            { label: "שולם עד כה", value: `${fmt(paid)} ₪`, color: "#16a34a" },
            { label: "יתרה", value: `${fmt(balance)} ₪`, color: balance > 0 ? "#ef4444" : "#16a34a" },
          ].map((s, i) => (
            <div key={i} style={{ background: theme.primaryLight, borderRadius: 10, padding: "12px 14px", border: `1px solid ${theme.primaryBorder}` }}>
              <div style={{ fontSize: 10, color: "var(--text-4)", marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Add payment */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>הוסף תשלום</div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
            <div>
              <label style={S.label}>סכום</label>
              <input type="number" min="0" value={payForm.amount} onChange={e => setPayForm(p => ({ ...p, amount: e.target.value }))}
                style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={S.label}>תאריך</label>
              <input type="date" value={payForm.date} onChange={e => setPayForm(p => ({ ...p, date: e.target.value }))}
                style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>הערה</label>
              <input type="text" value={payForm.note} onChange={e => setPayForm(p => ({ ...p, note: e.target.value }))}
                style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
          </div>
          <button onClick={() => {
            if (!payForm.amount || Number(payForm.amount) <= 0) return;
            onAddPayment(item._id, payForm);
            setPayForm({ amount: 0, date: today(), note: "-" });
          }} style={{ width: "100%", padding: "10px", background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>
            + הוסף תשלום
          </button>
        </div>

        {/* History */}
        {payments.length > 0 && (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)", marginBottom: 10 }}>היסטוריית תשלומים</div>
            {payments.map((p, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 14px", background: "var(--bg-card-alt)", borderRadius: 8, marginBottom: 6, border: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: theme.primary }}>{fmt(p.amount)} ₪</div>
                  <div style={{ fontSize: 11, color: "var(--text-4)" }}>{p.note}</div>
                </div>
                <div style={{ fontSize: 12, color: "var(--text-4)" }}>{p.date}</div>
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{ width: "100%", marginTop: 16, padding: "10px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--btn-cancel-bg)", fontSize: 13, fontWeight: 500, color: "var(--btn-cancel-text)", cursor: "pointer", fontFamily: "inherit" }}>
          סגור
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function PartialPaymentPage() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const S = useStyles(theme);
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("partialPayment", partialPaymentApi);

  const [modal, setModal] = useState(false);
  const [paymentsModal, setPaymentsModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});

  const currentYear = new Date().getFullYear();
  const allClients = [...new Set((data || []).map(i => i.clientName).filter(Boolean))].sort();
  const allNames = [...new Set((data || []).map(i => i.name).filter(Boolean))].sort();

  const getPaid = (item) => {
    const fp = (item.payments || []).reduce((s, p) => s + Number(p.amount || 0), 0);
    const lg = (item.payments || []).length === 0 ? Number(item.advanceAmount || 0) : 0;
    return fp + lg;
  };

  const filtered = [...(data || [])]
    .filter(item => {
      if (!showAll) { if (!item.date) return item.colored; if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false; }
      if (search) { const s = search.toLowerCase(); return ["clientName", "name"].some(f => String(item[f] || "").toLowerCase().includes(s)); }
      return true;
    })
    .sort((a, b) => a.date < b.date ? 1 : -1);

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const totalPaid = filtered.reduce((s, i) => s + getPaid(i), 0);
  const totalBalance = total - totalPaid;

  const handleAddPayment = (id, payForm) => {
    const item = data.find(i => i._id === id); if (!item) return;

    // ✅ إذا كانت أول دفعة وعندنا advanceAmount قديم — ننقله للـ payments
    let existingPayments = [...(item.payments || [])];
    if (existingPayments.length === 0 && Number(item.advanceAmount || 0) > 0) {
      existingPayments = [{
        amount: Number(item.advanceAmount),
        date: item.date || today(),
        note: "מקדמה"
      }];
    }

    const newP = [...existingPayments, payForm];
    update(id, { payments: newP, advanceAmount: 0 });
    setPaymentsModal(prev => prev ? { ...prev, payments: newP, advanceAmount: 0 } : null);
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

  // Mobile cols with balance
  const mobileCols = COLS.map(col => col.key === "balance"
    ? { ...col, render: (_, item) => { const b = Number(item.totalAmount || 0) - getPaid(item); return <span style={{ fontWeight: 700, color: b > 0 ? "#ef4444" : "#16a34a" }}>{fmt(b)} ₪</span>; } }
    : col.key === "totalAmount" || col.key === "advanceAmount"
      ? { ...col, render: (v) => `${fmt(v)} ₪` }
      : col
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: "rtl" }}>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>💳</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-1)" }}>תשלום חלקי</h1>
            <p style={{ fontSize: 13, margin: "3px 0 0", color: "var(--text-4)" }}>{filtered.length} רשומות</p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.toggleBtn(showAll, theme)} onClick={() => setShowAll(!showAll)}>
            {showAll ? "שנה נוכחית" : "כל הזמנים"}
          </button>
          <button onClick={() => setModal(true)}
            style={{ padding: "9px 18px", borderRadius: 8, background: theme.gradient, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
            + הוסף
          </button>
        </div>
      </div>

      {/* Stats */}
      {!isMobile && (
        <div style={S.statBar}>
          <div><span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>סה״כ</span><span style={{ fontSize: 18, fontWeight: 700, color: theme.primary }}>{fmt(total)} ₪</span></div>
          <div style={S.divider} />
          <div><span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>שולם</span><span style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>{fmt(totalPaid)} ₪</span></div>
          <div style={S.divider} />
          <div><span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>יתרה</span><span style={{ fontSize: 18, fontWeight: 700, color: totalBalance > 0 ? "#ef4444" : "#16a34a" }}>{fmt(totalBalance)} ₪</span></div>
        </div>
      )}

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="חיפוש לפי קליינט, עבור..."
        style={S.inputLg} onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Mobile / Desktop */}
      {isMobile ? (
        <MobileCards items={filtered} columns={mobileCols}
          onEdit={item => { setEditId(item._id); setEditVals({ ...item }); setModal(true); }}
          onDelete={id => remove(id)} onToggleColor={toggleColor} theme={theme} />
      ) : (
        <div style={S.card}>
          {/* Header row */}
          <div style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", width: "100%", background: theme.gradient, color: "#fff" }}>
            <div style={{ width: 100, minWidth: 100, padding: "12px 6px", fontSize: 12, fontWeight: 700, textAlign: "center", flexShrink: 0 }}>פעולות</div>
            {COLS.map(col => (
              <div key={col.key} style={S.cell(col.width, { color: "#fff", fontWeight: 700, fontSize: 12, padding: "12px 10px" })}>{col.label}</div>
            ))}
            <div style={{ width: 30, minWidth: 30, flexShrink: 0 }} />
          </div>

          {filtered.length === 0 ? (
            <div style={S.empty}><div style={{ fontSize: 32, marginBottom: 12 }}>💳</div><div>אין נתונים</div></div>
          ) : filtered.map((item, idx) => {
            const isEditing = editId === item._id;
            const paid = getPaid(item);
            const balance = Number(item.totalAmount || 0) - paid;
            const bg = item.colored ? "var(--colored-bg)" : balance <= 0 ? "rgba(22,163,74,0.05)" : idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-alt)";
            const bdr = item.colored ? "var(--colored-border)" : balance <= 0 ? "rgba(22,163,74,0.2)" : "var(--border-light)";

            return (
              <div key={item._id}
                style={{ display: "flex", flexDirection: "row-reverse", alignItems: "center", width: "100%", borderBottom: `1px solid ${bdr}`, background: bg, transition: "background 0.1s" }}
                onMouseEnter={e => { if (!item.colored) e.currentTarget.style.background = "var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = bg; }}>

                {/* Actions */}
                <div style={{ width: 100, minWidth: 100, padding: "10px 6px", display: "flex", gap: 3, justifyContent: "center", flexShrink: 0 }}>
                  {/* Payments button */}
                  <button onClick={() => setPaymentsModal(item)}
                    style={{ padding: "3px 7px", background: theme.primaryLight, border: `1px solid ${theme.primaryBorder}`, borderRadius: 6, color: theme.primary, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                    💳{(item.payments || []).length > 0 ? ` ${(item.payments || []).length}` : ""}
                  </button>
                  {isEditing ? (<>
                    <button onClick={() => { update(editId, editVals); setEditId(null); }} style={S.btnSave}>✓</button>
                    <button onClick={() => setEditId(null)} style={S.btnDiscard}>✕</button>
                  </>) : (<>
                    <button onClick={() => { setEditId(item._id); setEditVals({ ...item }); }} style={S.btnEdit}>✎</button>
                    <button onClick={() => { if (window.confirm("האם אתה בטוח שברצונך למחוק?")) remove(item._id); }} style={S.btnDelete}>🗑</button>
                  </>)}
                </div>

                {/* Cells */}
                {COLS.map(col => {
                  let val, color = "var(--text-1)", fw = 400;
                  if (col.key === "balance") {
                    val = `${fmt(balance)} ₪`;
                    color = balance > 0 ? "#ef4444" : "#16a34a";
                    fw = 700;
                  } else if (col.key === "totalAmount" || col.key === "advanceAmount") {
                    val = `${fmt(item[col.key])} ₪`;
                    color = theme.primary; fw = 600;
                  } else if (col.key === "clientName") {
                    val = item[col.key] || "-"; fw = 600;
                  } else {
                    val = item[col.key] || "-";
                  }
                  if (item.colored) color = "var(--colored-text)";

                  return (
                    <div key={col.key} style={S.cell(col.width, { color, fontWeight: fw })}>
                      {isEditing && col.key !== "balance" ? (
                        <input type={col.key === "totalAmount" || col.key === "advanceAmount" ? "number" : "text"}
                          value={editVals[col.key] ?? ""} onChange={e => setEditVals(v => ({ ...v, [col.key]: e.target.value }))}
                          style={{ width: "100%", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 6px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg-input)", color: "var(--text-1)" }} />
                      ) : val}
                    </div>
                  );
                })}

                {/* Color dot */}
                <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                  <div onClick={() => toggleColor(item._id, { colored: !item.colored })} style={S.dot(item.colored)} />
                </div>
              </div>
            );
          })}

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-hover)", borderTop: `2px solid ${theme.primaryBorder}` }}>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>יתרה כוללת ({filtered.length} רשומות)</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: totalBalance > 0 ? "#ef4444" : "#16a34a" }}>{fmt(totalBalance)} ₪</span>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }}
        title={editId ? "עריכת רשומה" : "הוספת תשלום חלקי"} size="md">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={S.label}>תאריך</label>
              <input type="date" value={editId ? editVals.date ?? today() : form.date}
                onChange={e => editId ? setEditVals(v => ({ ...v, date: e.target.value })) : setForm(p => ({ ...p, date: e.target.value }))}
                style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={S.label}>קליינט</label>
              <AutocompleteInput
                value={editId ? editVals.clientName ?? '' : form.clientName}
                onChange={e => editId ? setEditVals(v => ({ ...v, clientName: e.target.value })) : setForm(p => ({ ...p, clientName: e.target.value }))}
                suggestions={allClients} required style={S.input}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>עבור</label>
              <AutocompleteInput
                value={editId ? editVals.name ?? '' : form.name}
                onChange={e => editId ? setEditVals(v => ({ ...v, name: e.target.value })) : setForm(p => ({ ...p, name: e.target.value }))}
                suggestions={allNames} required style={S.input}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={S.label}>סה״כ לתשלום</label>
              <input type="number" min="0"
                value={editId ? editVals.totalAmount ?? 0 : form.totalAmount}
                onChange={e => editId ? setEditVals(v => ({ ...v, totalAmount: e.target.value })) : setForm(p => ({ ...p, totalAmount: e.target.value }))}
                style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
            <div>
              <label style={S.label}>שולם מראש</label>
              <input type="number" min="0"
                value={editId ? editVals.advanceAmount ?? 0 : form.advanceAmount}
                onChange={e => editId ? setEditVals(v => ({ ...v, advanceAmount: e.target.value })) : setForm(p => ({ ...p, advanceAmount: e.target.value }))}
                style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={S.btnCancel}>ביטול</button>
            <button type="submit" style={S.btnSubmit(theme)}>שמור</button>
          </div>
        </form>
      </Modal>

      {/* Payments Modal */}
      {paymentsModal && (
        <PaymentsModal item={paymentsModal} onClose={() => setPaymentsModal(null)}
          onAddPayment={handleAddPayment} theme={theme} S={S} />
      )}
    </div>
  );
}
