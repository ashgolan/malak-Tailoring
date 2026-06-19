import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { salesToCompaniesApi, settingsApi, taxValuesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useStyles } from "../hooks/useStyles";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";
import AutocompleteInput from "../components/ui/AutocompleteInput.jsx";

const EMPTY = { date: today(), clientName: "", name: "", kindOfWork: "", containersNumbers: "", sending: "", afterTax: false, number: 0, totalAmount: 0, colored: false };
const DEFAULT_TRANSPORT = ["טורקית", "הודית", "סינית", "אירופאית", "מקומית"];
const DEFAULT_SENDING = ["צפון", "מרכז", "דרום", "ירושלים", "שפלה"];

const COLS = [
  { key: "totalAmount",       label: "סה״כ",        type: "money",   width: "8%" },
  { key: "afterTax",          label: "מע״מ",         type: "boolean", width: "6%" },
  { key: "number",            label: "לפני מע״מ",   type: "money",   width: "8%" },
  { key: "sending",           label: "משלוח",        width: "7%" },
  { key: "kindOfWork",        label: "סוג מכולה",    width: "8%" },
  { key: "containersNumbers", label: "מס מכולה",     width: "8%" },
  { key: "name",              label: "עבודה",        width: "13%" },
  { key: "clientName",        label: "חברה",         width: "13%" },
  { key: "date",              label: "תאריך",        width: "9%" },
];

// ─── List Manager Modal ────────────────────────────────────────
function ListManagerModal({ isOpen, onClose, title, items, onSave, theme, S }) {
  const [list, setList] = useState(items);
  const [newItem, setNewItem] = useState("");

  useEffect(() => { setList(items); }, [items]);

  const handleAdd = () => {
    const v = newItem.trim(); if (!v || list.includes(v)) return;
    setList(p => [...p, v]); setNewItem("");
  };
  const handleRemove = (idx) => setList(p => p.filter((_, i) => i !== idx));
  const handleSave = () => { onSave(list); onClose(); };

  if (!isOpen) return null;
  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
      <div style={{ background: "var(--bg-modal)", borderRadius: 16, width: "100%", maxWidth: 420, padding: 24, boxShadow: "var(--shadow-modal)", direction: "rtl" }}>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 16 }}>ניהול {title}</div>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => e.key === "Enter" && (e.preventDefault(), handleAdd())}
            placeholder={`הוסף ${title}...`} style={{ flex: 1, padding: "8px 12px", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, outline: "none", background: "var(--bg-input)", color: "var(--text-1)", fontFamily: "inherit" }} />
          <button onClick={handleAdd} style={{ padding: "8px 16px", background: theme.gradient, color: "#fff", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>+ הוסף</button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6, maxHeight: 240, overflowY: "auto", marginBottom: 16 }}>
          {list.map((item, idx) => (
            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 12px", background: "var(--bg-card-alt)", borderRadius: 8, border: "1px solid var(--border-light)" }}>
              <span style={{ fontSize: 13, color: "var(--text-1)" }}>{item}</span>
              <button onClick={() => handleRemove(idx)}
                style={{ background: "rgba(239,68,68,0.1)", border: "none", borderRadius: 6, color: "#ef4444", cursor: "pointer", fontSize: 12, padding: "3px 8px" }}>🗑</button>
            </div>
          ))}
          {list.length === 0 && <div style={{ textAlign: "center", color: "var(--text-4)", fontSize: 13, padding: 16 }}>אין פריטים</div>}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={S.btnCancel}>ביטול</button>
          <button onClick={handleSave} style={S.btnSubmit(theme)}>שמור</button>
        </div>
      </div>
    </div>
  );
}

export default function SalesToCompaniesPage() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const S = useStyles(theme);
  const qc = useQueryClient();
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("salesToCompanies", salesToCompaniesApi);
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => settingsApi.get().then(r => r.data) });
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });

  const maam = Number(taxValues?.maamValue || 18);

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [search, setSearch] = useState("");
  const [showAll, setShowAll] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editVals, setEditVals] = useState({});
  const [transportOptions, setTransportOptions] = useState(DEFAULT_TRANSPORT);
  const [sendingOptions, setSendingOptions] = useState(DEFAULT_SENDING);
  const [manageTransport, setManageTransport] = useState(false);
  const [manageSending, setManageSending] = useState(false);

  // ─── Load options from settings ───────────────────────────
  useEffect(() => {
    if (settings) {
      if (settings.transportOptions?.length) setTransportOptions(settings.transportOptions);
      if (settings.sendingOptions?.length) setSendingOptions(settings.sendingOptions);
    }
  }, [settings]);

  // ─── Save options to settings ─────────────────────────────
  const saveTransport = async (list) => {
    setTransportOptions(list);
    await settingsApi.update({ transportOptions: list });
    qc.invalidateQueries(["settings"]);
  };
  const saveSending = async (list) => {
    setSendingOptions(list);
    await settingsApi.update({ sendingOptions: list });
    qc.invalidateQueries(["settings"]);
  };

  // ─── חישוב totalAmount אוטומטי ───────────────────────────
  // number = המחיר לפני מע״מ
  // אם afterTax=true → totalAmount = number * (1 + maam/100)
  // אם afterTax=false → totalAmount = number
  const calcTotal = (number, afterTax) => {
    const n = Number(number) || 0;
    return afterTax ? Math.round(n * (1 + maam / 100)) : n;
  };

  const currentYear = new Date().getFullYear();
  const allCompanies = [...new Set((data || []).map(i => i.clientName).filter(Boolean))].sort();
  const allWorks = [...new Set((data || []).map(i => i.name).filter(Boolean))].sort();

  const filtered = [...(data || [])].filter(item => {
    if (!showAll) { if (!item.date) return item.colored; if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false; }
    if (search) { const s = search.toLowerCase(); return ["clientName", "name", "kindOfWork", "sending"].some(f => String(item[f] || "").toLowerCase().includes(s)); }
    return true;
  }).sort((a, b) => a.date < b.date ? 1 : -1);

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const totalPreTax  = filtered.reduce((s, i) => s + (Number(i.number) || 0), 0);
  const totalTaxOnly = filtered.reduce((s, i) => s + (i.afterTax ? (Number(i.totalAmount) || 0) - (Number(i.number) || 0) : 0), 0);
  const countWithTax = filtered.filter(i => i.afterTax).length;

  const val = (k) => editId ? (editVals[k] ?? "") : form[k];

  // ─── set עם חישוב אוטומטי ─────────────────────────────────
  const set = (k, v) => {
    if (editId) {
      setEditVals(prev => {
        const u = { ...prev, [k]: v };
        if (k === "number" || k === "afterTax") {
          u.totalAmount = calcTotal(k === "number" ? v : prev.number, k === "afterTax" ? v : prev.afterTax);
        }
        return u;
      });
    } else {
      setForm(prev => {
        const u = { ...prev, [k]: v };
        if (k === "number" || k === "afterTax") {
          u.totalAmount = calcTotal(k === "number" ? v : prev.number, k === "afterTax" ? v : prev.afterTax);
        }
        return u;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) {
      const totalAmount = calcTotal(editVals.number, editVals.afterTax);
      update(editId, { ...editVals, totalAmount });
      setEditId(null);
    } else {
      const totalAmount = calcTotal(form.number, form.afterTax);
      create({ ...form, totalAmount });
    }
    setModal(false);
    setForm(EMPTY);
  };

  // ─── Mobile cols ───────────────────────────────────────────
  const mobileCols = COLS.map(col =>
    col.key === "afterTax"
      ? { ...col, render: v => v ? <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ מע״מ</span> : <span style={{ color: "var(--text-4)" }}>ללא</span> }
      : col
  );

  if (isLoading) return <div style={{ display: "flex", justifyContent: "center", padding: 80 }}><div className="rosh-spinner" style={{ borderTopColor: theme.primary }} /></div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: "rtl" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🏢</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0, color: "var(--text-1)" }}>מכירות לחברות</h1>
            <p style={{ fontSize: 13, margin: "3px 0 0", color: "var(--text-4)" }}>{filtered.length} רשומות | סה״כ: <strong style={{ color: theme.primary }}>{fmt(total)} ₪</strong></p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.toggleBtn(showAll, theme)} onClick={() => setShowAll(!showAll)}>{showAll ? "שנה נוכחית" : "כל הזמנים"}</button>
          <button onClick={() => setModal(true)} style={{ padding: "9px 18px", borderRadius: 8, background: theme.gradient, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>+ הוסף</button>
        </div>
      </div>

      {/* ── Stats Bar ── */}
      {!isMobile && (
        <div style={S.statBar}>
          <div>
            <span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>סה״כ לפני מע״מ</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.primary }}>{fmt(totalPreTax)} ₪</span>
          </div>
          <div style={S.divider} />
          <div>
            <span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>מע״מ ({maam}%)</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#d97706" }}>{fmt(totalTaxOnly)} ₪</span>
          </div>
          <div style={S.divider} />
          <div>
            <span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>סה״כ כולל מע״מ</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: theme.primary }}>{fmt(total)} ₪</span>
          </div>
          <div style={S.divider} />
          <div>
            <span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>רשומות</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text-3)" }}>{filtered.length}</span>
          </div>
          <div style={S.divider} />
          <div>
            <span style={{ fontSize: 11, color: "var(--text-4)", display: "block", marginBottom: 3 }}>כולל מע״מ</span>
            <span style={{ fontSize: 18, fontWeight: 700, color: "#16a34a" }}>{countWithTax}</span>
          </div>
        </div>
      )}

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי חברה, עבודה, מכולה..." style={S.inputLg} onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {isMobile ? (
        <MobileCards data={filtered} cols={mobileCols} onEdit={(item) => { setEditId(item._id); setEditVals({ ...item }); setModal(true); }} onDelete={(item) => { if (window.confirm("למחוק?")) remove(item._id); }} onToggleColor={(item) => toggleColor(item._id, { colored: !item.colored })} theme={theme} />
      ) : (
        <div style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-light)", overflow: "hidden", boxShadow: "var(--shadow-card)" }}>
          {/* Header row */}
          <div style={S.row(false, true)}>
            <div style={S.cell("30px")} />
            {COLS.map(col => <div key={col.key} style={S.cell(col.width)}><span style={S.t3}>{col.label}</span></div>)}
            <div style={S.cell("30px")} />
          </div>

          {filtered.length === 0 && (
            <div style={S.empty}><div style={{ fontSize: 32, marginBottom: 12 }}>🏢</div><div>אין רשומות</div></div>
          )}

          {filtered.map(item => {
            const isEditing = editId === item._id;
            return (
              <div key={item._id} style={S.row(item.colored)}>
                {/* Action buttons */}
                <div style={{ width: 30, minWidth: 30, display: "flex", flexDirection: "column", justifyContent: "center", gap: 4, flexShrink: 0 }}>
                  {isEditing ? (
                    <><button onClick={handleSubmit} style={S.btnSave}>✓</button><button onClick={() => setEditId(null)} style={S.btnDiscard}>✕</button></>
                  ) : (
                    <><button onClick={() => { setEditId(item._id); setEditVals({ ...item }); }} style={S.btnEdit}>✎</button><button onClick={() => { if (window.confirm("למחוק?")) remove(item._id); }} style={S.btnDelete}>🗑</button></>
                  )}
                </div>

                {/* Cells */}
                {COLS.map(col => (
                  <div key={col.key} style={S.cell(col.width, { color: item.colored ? "var(--colored-text)" : col.type === "money" ? theme.primary : "var(--text-1)", fontWeight: col.type === "money" ? 600 : col.key === "clientName" ? 600 : 400 })}>
                    {isEditing ? (
                      col.key === "afterTax" ? (
                        // ✅ toggle כמו בשאר הדפים
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div onClick={() => set("afterTax", !editVals.afterTax)}
                            style={{ position: "relative", width: 32, height: 18, borderRadius: 18, cursor: "pointer", background: editVals.afterTax ? theme.primary : "var(--border)", transition: "0.2s", flexShrink: 0 }}>
                            <div style={{ position: "absolute", top: 2, width: 14, height: 14, borderRadius: "50%", background: "#fff", transition: "0.2s", right: editVals.afterTax ? 2 : 16 }} />
                          </div>
                          <span style={{ fontSize: 11, color: editVals.afterTax ? theme.primary : "var(--text-4)", fontWeight: 600 }}>
                            {editVals.afterTax ? `✓ מע״מ ${maam}%` : "ללא"}
                          </span>
                        </div>
                      ) : col.key === "totalAmount" ? (
                        // totalAmount מחושב אוטומטית — לא ניתן לעריכה ישירה
                        <span style={{ color: theme.primary, fontWeight: 700 }}>{fmt(editVals.totalAmount)}</span>
                      ) : col.key === "sending" ? (
                        <select value={editVals[col.key] ?? ""} onChange={e => setEditVals(v => ({ ...v, [col.key]: e.target.value }))}
                          style={{ width: "100%", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 4px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg-input)", color: "var(--text-1)" }}>
                          <option value="">בחר...</option>
                          {sendingOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : col.key === "kindOfWork" ? (
                        <select value={editVals[col.key] ?? ""} onChange={e => setEditVals(v => ({ ...v, [col.key]: e.target.value }))}
                          style={{ width: "100%", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 4px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg-input)", color: "var(--text-1)" }}>
                          <option value="">בחר...</option>
                          {transportOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : col.key === "number" ? (
                        <input type="number" min="0" value={editVals[col.key] ?? ""} onChange={e => set("number", e.target.value)}
                          style={{ width: "100%", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 6px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg-input)", color: "var(--text-1)" }} />
                      ) : (
                        <input type={col.type === "money" ? "number" : "text"} value={editVals[col.key] ?? ""} onChange={e => setEditVals(v => ({ ...v, [col.key]: e.target.value }))}
                          style={{ width: "100%", border: `1px solid ${theme.accent}`, borderRadius: 6, padding: "2px 6px", fontSize: 12, outline: "none", fontFamily: "inherit", background: "var(--bg-input)", color: "var(--text-1)" }} />
                      )
                    ) : (
                      col.key === "afterTax"
                        ? (item[col.key] ? <span style={{ color: "#16a34a", fontWeight: 600, fontSize: 11 }}>✓ מע״מ</span> : <span style={{ color: "var(--text-4)", fontSize: 11 }}>ללא</span>)
                        : col.type === "money" ? fmt(item[col.key])
                        : (item[col.key] || "-")
                    )}
                  </div>
                ))}

                {/* Color dot */}
                <div style={{ width: 30, minWidth: 30, display: "flex", justifyContent: "center", flexShrink: 0 }}>
                  <div onClick={() => toggleColor(item._id, { colored: !item.colored })} style={S.dot(item.colored)} />
                </div>
              </div>
            );
          })}

          {filtered.length > 0 && (
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-hover)", borderTop: `2px solid ${theme.primaryBorder}` }}>
              <span style={{ fontSize: 13, color: "var(--text-3)" }}>סה״כ ({filtered.length})</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: theme.primary }}>{fmt(total)} ₪</span>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }} title={editId ? "עריכת רשומה" : "הוספת רשומה חדשה"} size="md">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>

            <div><label style={S.label}>תאריך</label><input type="date" value={val("date")} onChange={e => set("date", e.target.value)} style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} /></div>

            <div>
              <label style={S.label}>חברה</label>
              <AutocompleteInput value={val("clientName")} onChange={e => set("clientName", e.target.value)} suggestions={allCompanies} required style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label style={S.label}>עבודה</label>
              <AutocompleteInput value={val("name")} onChange={e => set("name", e.target.value)} suggestions={allWorks} required style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            <div><label style={S.label}>מס׳ מכולה</label><input type="text" value={val("containersNumbers")} onChange={e => set("containersNumbers", e.target.value)} style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} /></div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={S.label}>סוג מכולה</label>
                <button type="button" onClick={() => setManageTransport(true)}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-tag)", color: "var(--text-3)", cursor: "pointer", fontFamily: "inherit" }}>
                  ⚙️ ניהול
                </button>
              </div>
              <select value={val("kindOfWork")} onChange={e => set("kindOfWork", e.target.value)} style={S.select}>
                <option value="">בחר...</option>
                {transportOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                <label style={S.label}>משלוח</label>
                <button type="button" onClick={() => setManageSending(true)}
                  style={{ fontSize: 11, padding: "2px 8px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--bg-tag)", color: "var(--text-3)", cursor: "pointer", fontFamily: "inherit" }}>
                  ⚙️ ניהול
                </button>
              </div>
              <select value={val("sending")} onChange={e => set("sending", e.target.value)} style={S.select}>
                <option value="">בחר...</option>
                {sendingOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            {/* מחיר לפני מע״מ */}
            <div>
              <label style={S.label}>סכום לפני מע״מ</label>
              <input type="number" min="0" value={val("number")} onChange={e => set("number", e.target.value)} style={S.input} onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            {/* סה״כ — מחושב אוטומטית */}
            <div>
              <label style={S.label}>סה״כ (מחושב)</label>
              <input type="number" readOnly value={val("totalAmount")} style={{ ...S.input, fontWeight: 700, color: theme.primary, background: "var(--bg-hover)", cursor: "default" }} />
            </div>

          </div>

          {/* Toggle מע״מ */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, paddingTop: 4 }}>
            <div style={{ position: "relative", width: 36, height: 20 }}>
              <div onClick={() => set("afterTax", !val("afterTax"))}
                style={{ position: "absolute", inset: 0, borderRadius: 20, cursor: "pointer", transition: "0.2s", background: val("afterTax") ? theme.primary : "var(--border)" }}>
                <div style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "0.2s", right: val("afterTax") ? 2 : 18 }} />
              </div>
            </div>
            <label style={{ fontSize: 13, fontWeight: 600, color: "var(--text-2)" }}>
              {val("afterTax") ? `✓ כולל מע״מ ${maam}%` : "ללא מע״מ"}
            </label>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={S.btnCancel}>ביטול</button>
            <button type="submit" style={S.btnSubmit(theme)}>שמור</button>
          </div>
        </form>
      </Modal>

      {/* List Manager Modals */}
      <ListManagerModal isOpen={manageTransport} onClose={() => setManageTransport(false)}
        title="סוג מכולה" items={transportOptions} onSave={saveTransport} theme={theme} S={S} />
      <ListManagerModal isOpen={manageSending} onClose={() => setManageSending(false)}
        title="משלוח" items={sendingOptions} onSave={saveSending} theme={theme} S={S} />
    </div>
  );
}
