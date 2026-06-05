import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { bidsApi, inventoriesApi, taxValuesApi, settingsApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useStyles } from "../hooks/useStyles";
import AutocompleteInput from "../components/ui/AutocompleteInput";

const toNum = (v) => parseFloat(v) || 0;
const fmt = (n) => toNum(n).toLocaleString("he-IL", { maximumFractionDigits: 2 });
const today = new Date().toISOString().split("T")[0];
const nowTime = new Date().toLocaleTimeString("he-IL", { hour: "2-digit", minute: "2-digit" });
const fo = (e) => { e.target.style.borderColor = "var(--border-focus)"; };
const bl = (e) => { e.target.style.borderColor = "var(--border)"; };

// ─── Print helper ──────────────────────────────────────────────
function printBid(bid, settings, maam) {
  const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://localhost:5000";
  const logoUrl = settings?.logoUrl ? `${base}${settings.logoUrl}` : (settings?.logoBase64 || ""); const businessName = settings?.businessName || "מתפרת מלאק";
  const isFree = bid.freeBid;
  const itemsHtml = !isFree && bid.data?.length > 0 ? `
    <table style="width:100%;border-collapse:collapse;font-size:13px;margin-bottom:16px;">
      <thead>
        <tr style="background:#6d28d9;color:#fff;">
          <th style="padding:8px 10px;text-align:right;">תיאור</th>
          <th style="padding:8px 10px;text-align:center;">כמות</th>
          <th style="padding:8px 10px;text-align:right;">מחיר</th>
          <th style="padding:8px 10px;text-align:right;">סה״כ</th>
        </tr>
      </thead>
      <tbody>
        ${bid.data.map((row, i) => `
          <tr style="background:${i % 2 === 0 ? '#fff' : '#f5f3ff'};border-bottom:1px solid #e5e7eb;">
            <td style="padding:8px 10px;">${row.description || ''}</td>
            <td style="padding:8px 10px;text-align:center;">${row.quantity}</td>
            <td style="padding:8px 10px;text-align:right;">${fmt(row.price)} ₪</td>
            <td style="padding:8px 10px;text-align:right;font-weight:700;color:#6d28d9;">${fmt(row.total)} ₪</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  ` : `
    <div style="background:#f9f7ff;border-radius:8px;padding:14px 16px;margin-bottom:16px;border:1px solid #e5e7eb;white-space:pre-wrap;font-size:13px;line-height:1.8;">
      ${bid.data?.[0]?.text || ''}
    </div>
  `;

  const totalBeforeTax = toNum(bid.totalAmount);
  const taxAmount = totalBeforeTax * maam / 100;
  const grandTotal = totalBeforeTax + taxAmount;

  const html = `
    <!DOCTYPE html>
    <html dir="rtl" lang="he">
    <head>
      <meta charset="UTF-8"/>
      <title>הצעת מחיר - ${bid.clientName}</title>
      <style>
        * { font-family: 'Arial', sans-serif; box-sizing: border-box; }
        body { margin: 0; padding: 32px; color: #1f2937; direction: rtl; }
        @media print { body { padding: 16px; } }
      </style>
    </head>
    <body>
      <!-- Header -->
<div style="text-align:center;border-bottom:3px solid #6d28d9;padding-bottom:16px;margin-bottom:24px;">
  ${logoUrl ? `<img src="${logoUrl}" style="height:70px;object-fit:contain;" alt="לוגו"/>` : `<div style="font-size:22px;font-weight:800;color:#6d28d9;">${businessName}</div>`}
</div>

      <!-- Client info -->
      <div style="display:flex;justify-content:space-between;margin-bottom:24px;background:#f5f3ff;padding:14px 18px;border-radius:10px;border:1px solid #ede9fe;">
        <div>
          <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">לכבוד</div>
          <div style="font-size:18px;font-weight:700;">${bid.clientName}</div>
          ${bid.target && bid.target !== '-' ? `<div style="font-size:13px;color:#6b7280;margin-top:4px;">עבור: ${bid.target}</div>` : ''}
        </div>
        <div style="text-align:left;">
          <div style="font-size:11px;color:#9ca3af;margin-bottom:4px;">תאריך</div>
          <div style="font-size:15px;font-weight:600;">${bid.date}</div>
          <div style="font-size:12px;color:#9ca3af;">${bid.time || ''}</div>
        </div>
      </div>

      <!-- Items / Free text -->
      ${itemsHtml}

      <!-- Totals -->
      <div style="background:#f5f3ff;border-radius:10px;padding:14px 18px;border:1px solid #ede9fe;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#6b7280;">סה״כ לפני מע״מ</span>
          <span style="font-size:14px;font-weight:600;">${fmt(totalBeforeTax)} ₪</span>
        </div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;">
          <span style="font-size:13px;color:#6b7280;">מע״מ (${maam}%)</span>
          <span style="font-size:14px;color:#d97706;">${fmt(taxAmount)} ₪</span>
        </div>
        <div style="border-top:1px solid #ede9fe;padding-top:8px;display:flex;justify-content:space-between;">
          <span style="font-size:15px;font-weight:700;">סה״כ כולל מע״מ</span>
          <span style="font-size:20px;font-weight:800;color:#6d28d9;">${fmt(grandTotal)} ₪</span>
        </div>
      </div>

      <!-- Footer -->
      <div style="text-align:center;font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px;">
${settings?.bidFooter ? settings.bidFooter.replace(/\n/g, '<br/>') : `${businessName} · הצעת מחיר תקפה ל-30 יום`}      </div>
    </body>
    </html>
  `;

  const w = window.open("", "_blank");
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 500);
}

// ─── BidModal ──────────────────────────────────────────────────
function BidModal({ initial, onClose, onSave, inventories, maam, theme, S, allClients }) {
  const isEdit = !!initial?._id;
  const [bidType, setBidType] = useState(initial ? (initial.freeBid ? "free" : "items") : "items");
  const [form, setForm] = useState({
    clientName: initial?.clientName || "", date: initial?.date || today, time: initial?.time || nowTime,
    target: initial?.target || "-", isApproved: initial?.isApproved || false, totalAmount: initial?.totalAmount || 0, data: initial?.data || [],
  });
  const [items, setItems] = useState(initial?.data?.length > 0 && !initial?.freeBid ? initial.data : [{ description: "", quantity: 1, price: 0, total: 0 }]);
  const [freeText, setFreeText] = useState(initial?.freeBid && initial?.data?.length > 0 ? initial.data[0]?.text || "" : "");
  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
  const updateItem = (i, k, v) => setItems(prev => prev.map((row, idx) => { if (idx !== i) return row; const u = { ...row, [k]: v }; u.total = toNum(u.quantity) * toNum(u.price); return u; }));
  const selectInventory = (i, name) => { const inv = (inventories || []).find(x => x.name === name); setItems(prev => prev.map((row, idx) => { if (idx !== i) return row; const u = { ...row, description: name, price: inv ? toNum(inv.number) : row.price }; u.total = toNum(u.quantity) * toNum(u.price); return u; })); };
  const addItem = () => setItems(p => [...p, { description: "", quantity: 1, price: 0, total: 0 }]);
  const removeItem = (i) => setItems(p => p.filter((_, idx) => idx !== i));
  const itemsTotal = items.reduce((a, it) => a + toNum(it.total), 0);
  const handleSave = () => { const isI = bidType === "items"; onSave({ ...form, freeBid: !isI, data: isI ? items : [{ text: freeText }], totalAmount: isI ? itemsTotal : toNum(form.totalAmount) }); };

  const inputS = { width: "100%", padding: "9px 12px", background: "var(--bg-input)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 13, outline: "none", boxSizing: "border-box", fontFamily: "inherit", color: "var(--text-1)", transition: "border-color 0.15s" };
  const selectS = { ...inputS, cursor: "pointer" };
  const textareaS = { ...inputS, resize: "vertical", minHeight: 150, lineHeight: 1.7, paddingTop: 12 };

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16, backdropFilter: "blur(2px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--bg-modal)", borderRadius: 16, width: "100%", maxWidth: 680, maxHeight: "90vh", overflowY: "auto", padding: 28, boxShadow: "var(--shadow-modal)", direction: "rtl", border: "1px solid var(--border)" }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-1)", marginBottom: 20 }}>{isEdit ? "עריכת הצעת מחיר" : "הצעת מחיר חדשה"}</div>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 0, marginBottom: 20, background: "var(--bg-tag)", borderRadius: 8, padding: 3 }}>
          {[{ key: "items", label: "📋 רשימת פריטים" }, { key: "free", label: "📝 טקסט חופשי" }].map(t => (
            <button key={t.key} onClick={() => setBidType(t.key)} style={{ flex: 1, padding: "8px", borderRadius: 6, border: "none", fontSize: 13, fontWeight: bidType === t.key ? 700 : 500, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s", background: bidType === t.key ? "var(--bg-card)" : "transparent", color: bidType === t.key ? theme.primary : "var(--text-3)" }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Header fields */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>קליינט *</label>
            <AutocompleteInput value={form.clientName} onChange={(e) => setForm(p => ({ ...p, clientName: e.target.value }))} suggestions={allClients} placeholder="שם הלקוח" required style={inputS} onFocus={fo} onBlur={bl} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>תאריך</label>
            <input type="date" style={inputS} value={form.date} onChange={set("date")} onFocus={fo} onBlur={bl} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>יעד / נושא</label>
            <input style={inputS} value={form.target} onChange={set("target")} placeholder="עבור: כיסוי מחסן..." onFocus={fo} onBlur={bl} />
          </div>
        </div>

        <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0" }} />

        {/* Items mode */}
        {bidType === "items" && (<>
          <div style={{ display: "flex", gap: 8, marginBottom: 8, padding: "0 4px" }}>
            {[["40%", "תיאור / מוצר"], ["18%", "כמות"], ["20%", "מחיר"], ["18%", "סה״כ"], ["4%", ""]].map(([w, l]) => (
              <div key={l} style={{ width: w, flexBasis: w, fontSize: 11, fontWeight: 700, color: "var(--text-4)" }}>{l}</div>
            ))}
          </div>
          {items.map((row, i) => (
            <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
              <div style={{ width: "40%", flexBasis: "40%" }}>
                {inventories?.length ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <select style={{ ...selectS, fontSize: 12 }} value={inventories.find(x => x.name === row.description) ? row.description : ""} onChange={e => selectInventory(i, e.target.value)}>
                      <option value="">בחר ממלאי...</option>
                      {(inventories || []).map(inv => <option key={inv._id} value={inv.name}>{inv.name}</option>)}
                    </select>
                    <input type="text" style={{ ...inputS, fontSize: 12 }} value={row.description} onChange={e => updateItem(i, "description", e.target.value)} placeholder="תיאור חופשי" onFocus={fo} onBlur={bl} />
                  </div>
                ) : <input type="text" style={{ ...inputS, fontSize: 12 }} value={row.description} onChange={e => updateItem(i, "description", e.target.value)} onFocus={fo} onBlur={bl} />}
              </div>
              <input type="number" min="0" style={{ ...inputS, width: "18%", flexBasis: "18%", fontSize: 12, padding: "9px 6px" }} value={row.quantity} onChange={e => updateItem(i, "quantity", e.target.value)} onFocus={fo} onBlur={bl} />
              <input type="number" min="0" style={{ ...inputS, width: "20%", flexBasis: "20%", fontSize: 12, padding: "9px 6px" }} value={row.price} onChange={e => updateItem(i, "price", e.target.value)} onFocus={fo} onBlur={bl} />
              <div style={{ width: "18%", flexBasis: "18%", fontSize: 13, fontWeight: 700, color: theme.primary, textAlign: "right" }}>{fmt(row.total)} ₪</div>
              <button onClick={() => removeItem(i)} style={{ width: "4%", flexBasis: "4%", border: "none", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: 16, flexShrink: 0 }}>×</button>
            </div>
          ))}
          <button onClick={addItem} style={{ width: "100%", padding: "9px", border: `2px dashed ${theme.primaryBorder}`, borderRadius: 8, background: theme.primaryLight, color: theme.primary, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", marginBottom: 12 }}>
            + הוסף שורה
          </button>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "var(--bg-hover)", borderRadius: 10, border: `1px solid ${theme.primaryBorder}` }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>סה״כ</span>
            <span style={{ fontSize: 20, fontWeight: 700, color: theme.primary }}>{fmt(itemsTotal)} ₪</span>
          </div>
        </>)}

        {/* Free mode */}
        {bidType === "free" && (<>
          <div style={{ marginBottom: 12 }}>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>תוכן ההצעה</label>
            <textarea style={textareaS} value={freeText} onChange={e => setFreeText(e.target.value)} placeholder="פרט את ההצעה כאן..." onFocus={fo} onBlur={bl} />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--text-3)", marginBottom: 6 }}>סכום לפני מע״מ (₪)</label>
            <input type="number" style={{ ...inputS, fontSize: 18, fontWeight: 700, color: theme.primary }} value={form.totalAmount} onChange={set("totalAmount")} onFocus={fo} onBlur={bl} />
          </div>
        </>)}

        <div style={{ borderTop: "1px solid var(--border)", margin: "16px 0" }} />

        {/* Approved toggle */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "var(--bg-card-alt)", borderRadius: 8, border: "1px solid var(--border)", marginBottom: 16 }}>
          <div style={{ position: "relative", width: 36, height: 20, flexShrink: 0 }}>
            <div onClick={() => setForm(p => ({ ...p, isApproved: !p.isApproved }))}
              style={{ position: "absolute", inset: 0, borderRadius: 20, cursor: "pointer", background: form.isApproved ? theme.primary : "var(--border)", transition: "0.2s" }}>
              <div style={{ position: "absolute", top: 2, width: 16, height: 16, borderRadius: "50%", background: "#fff", transition: "0.2s", right: form.isApproved ? 2 : 18 }} />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-1)" }}>הצעה מאושרת</div>
            <div style={{ fontSize: 11, color: "var(--text-4)" }}>{form.isApproved ? "✅ הלקוח אישר" : "ממתינה לאישור"}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: 10, border: "1px solid var(--border)", borderRadius: 8, background: "var(--btn-cancel-bg)", fontSize: 13, fontWeight: 500, color: "var(--btn-cancel-text)", cursor: "pointer", fontFamily: "inherit" }}>ביטול</button>
          <button onClick={handleSave} style={{ flex: 2, padding: 10, border: "none", borderRadius: 8, background: theme.gradient, fontSize: 14, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            {isEdit ? "עדכן הצעה" : "שמור הצעה"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── ViewModal ─────────────────────────────────────────────────
function ViewModal({ bid, onClose, onToggleApprove, theme, settings, maam }) {
  const isFree = bid.freeBid;
  const totalBeforeTax = toNum(bid.totalAmount);
  const taxAmount = totalBeforeTax * maam / 100;
  const grandTotal = totalBeforeTax + taxAmount;

  return (
    <div style={{ position: "fixed", inset: 0, background: "var(--bg-overlay)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16, backdropFilter: "blur(2px)" }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background: "var(--bg-modal)", borderRadius: 16, width: "100%", maxWidth: 560, maxHeight: "88vh", overflowY: "auto", padding: 28, boxShadow: "var(--shadow-modal)", direction: "rtl", border: "1px solid var(--border)" }}>

        {/* Header */}
        <div style={{ borderBottom: `2px solid ${theme.primary}`, paddingBottom: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 12, color: "var(--text-4)", marginBottom: 4 }}>הצעת מחיר</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)" }}>{bid.clientName}</div>
          <div style={{ fontSize: 13, color: "var(--text-3)", marginTop: 4 }}>תאריך: {bid.date} | {bid.time}</div>
          {bid.target && bid.target !== "-" && <div style={{ marginTop: 10, fontSize: 14, fontWeight: 600, color: "var(--text-2)" }}>עבור: {bid.target}</div>}
        </div>

        {/* Content */}
        {isFree && bid.data?.length > 0 && (
          <div style={{ background: "var(--bg-card-alt)", borderRadius: 10, padding: "14px 16px", marginBottom: 16, border: "1px solid var(--border)", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.8, color: "var(--text-1)" }}>
            {bid.data[0]?.text || ""}
          </div>
        )}
        {!isFree && bid.data?.length > 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, marginBottom: 16 }}>
            <thead>
              <tr style={{ background: theme.gradient, color: "#fff" }}>
                {["תיאור", "כמות", "מחיר", "סה״כ"].map(h => <th key={h} style={{ padding: "8px 10px", textAlign: "right", fontWeight: 600, fontSize: 12 }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {bid.data.map((row, i) => (
                <tr key={i} style={{ background: i % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-alt)", borderBottom: "1px solid var(--border-light)" }}>
                  <td style={{ padding: "8px 10px", color: "var(--text-1)" }}>{row.description}</td>
                  <td style={{ padding: "8px 10px", textAlign: "center", color: "var(--text-2)" }}>{row.quantity}</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", color: "var(--text-2)" }}>{fmt(row.price)} ₪</td>
                  <td style={{ padding: "8px 10px", textAlign: "right", fontWeight: 700, color: theme.primary }}>{fmt(row.total)} ₪</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Totals */}
        <div style={{ background: "var(--bg-hover)", borderRadius: 10, border: `1px solid ${theme.primaryBorder}`, padding: "12px 16px", marginBottom: 20 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>סה״כ לפני מע״מ</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: "var(--text-1)" }}>{fmt(totalBeforeTax)} ₪</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--text-3)" }}>מע״מ ({maam}%)</span>
            <span style={{ fontSize: 14, color: "#d97706" }}>{fmt(taxAmount)} ₪</span>
          </div>
          <div style={{ borderTop: `1px solid ${theme.primaryBorder}`, paddingTop: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-1)" }}>סה״כ כולל מע״מ</span>
            <span style={{ fontSize: 22, fontWeight: 700, color: theme.primary }}>{fmt(grandTotal)} ₪</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 13, fontWeight: 600, padding: "6px 12px", borderRadius: 20, background: bid.isApproved ? "rgba(22,163,74,0.12)" : "rgba(217,119,6,0.12)", color: bid.isApproved ? "#16a34a" : "#d97706" }}>
            {bid.isApproved ? "✅ מאושר" : "⏳ ממתין לאישור"}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => printBid(bid, settings, maam)}
              style={{ padding: "8px 14px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: "rgba(59,130,246,0.12)", color: "#3b82f6" }}>
              🖨️ הדפס
            </button>
            <button onClick={onToggleApprove} style={{ padding: "8px 14px", border: "none", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: bid.isApproved ? "rgba(217,119,6,0.12)" : "rgba(22,163,74,0.12)", color: bid.isApproved ? "#d97706" : "#16a34a" }}>
              {bid.isApproved ? "↩ בטל" : "✓ אשר הצעה"}
            </button>
            <button onClick={onClose} style={{ padding: "8px 14px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--btn-cancel-bg)", fontSize: 13, color: "var(--btn-cancel-text)", cursor: "pointer", fontFamily: "inherit" }}>סגור</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────
export default function BidsPage() {
  const { theme } = useTheme();
  const S = useStyles(theme);
  const { data, isLoading, create, update, remove } = useCrud("bids", bidsApi);
  const { data: inventories } = useQuery({ queryKey: ["inventories"], queryFn: () => inventoriesApi.getAll().then(r => r.data) });
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });
  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => settingsApi.get().then(r => r.data) });
  const [modal, setModal] = useState(null);
  const [viewBid, setViewBid] = useState(null);
  const [search, setSearch] = useState("");

  const maam = toNum(taxValues?.maamValue || 17);
  const allClients = [...new Set((data || []).map(b => b.clientName).filter(Boolean))].sort();
  const filtered = (data || []).filter(b => !search || b.clientName?.toLowerCase().includes(search.toLowerCase()) || b.target?.toLowerCase().includes(search.toLowerCase()));
  const approved = (data || []).filter(b => b.isApproved).length;
  const pending = (data || []).length - approved;
  const totalAll = (data || []).reduce((a, b) => a + toNum(b.totalAmount), 0);
  const taxTotal = totalAll * maam / 100;
  const grandTotal = totalAll + taxTotal;

  const handleSave = (form) => { if (modal?._id) update(modal._id, form); else create(form); setModal(null); };
  const toggleApprove = (bid) => { update(bid._id, { isApproved: !bid.isApproved }); if (viewBid?._id === bid._id) setViewBid(p => ({ ...p, isApproved: !p.isApproved })); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📄</div>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>הצעות מחיר</h1>
            <p style={{ fontSize: 13, color: "var(--text-4)", margin: "4px 0 0" }}>
              {(data || []).length} הצעות &nbsp;|&nbsp;
              <span style={{ color: "#16a34a" }}>{approved} מאושרות</span>&nbsp;|&nbsp;
              <span style={{ color: "#d97706" }}>{pending} ממתינות</span>
            </p>
          </div>
        </div>
        <button onClick={() => setModal("add")} style={{ padding: "9px 18px", borderRadius: 8, background: theme.gradient, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          + הצעה חדשה
        </button>
      </div>

      <div style={S.statBar}>
        {[
          { label: 'סה"כ לפני מע"מ', value: `${fmt(totalAll)} ₪`, color: "var(--text-1)" },
          { label: `מע"מ (${maam}%)`, value: `${fmt(taxTotal)} ₪`, color: "#d97706" },
          { label: 'סה"כ כולל מע"מ', value: `${fmt(grandTotal)} ₪`, color: theme.primary },
        ].map((stat, i) => (
          <div key={stat.label} style={{ display: "flex", alignItems: "center" }}>
            {i > 0 && <div style={{ ...S.divider, marginLeft: 32, marginRight: 0 }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 500 }}>{stat.label}</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי לקוח או נושא..." style={S.inputLg} onFocus={fo} onBlur={bl} />

      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="rosh-spinner" style={{ borderTopColor: theme.primary }} />
        </div>
      ) : filtered.length === 0 ? (
        <div style={S.empty}><div style={{ fontSize: 32, marginBottom: 12 }}>📄</div><div>אין הצעות מחיר</div></div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px,1fr))", gap: 14 }}>
          {filtered.sort((a, b) => a.date < b.date ? 1 : -1).map(bid => (
            <div key={bid._id}
              style={{ background: "var(--bg-card)", borderRadius: 14, border: `1px solid ${bid.isApproved ? "rgba(22,163,74,0.3)" : "var(--border-light)"}`, padding: "16px", boxShadow: "var(--shadow-card)", display: "flex", flexDirection: "column", gap: 12, cursor: "pointer", transition: "transform 0.12s" }}
              onMouseEnter={e => e.currentTarget.style.transform = "translateY(-2px)"}
              onMouseLeave={e => e.currentTarget.style.transform = "none"}
              onClick={() => setViewBid(bid)}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: "var(--text-1)" }}>{bid.clientName}</div>
                  <div style={{ fontSize: 12, color: "var(--text-4)", marginTop: 3 }}>{bid.date} · {bid.time}</div>
                </div>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 20, fontWeight: 600, flexShrink: 0, background: bid.isApproved ? "rgba(22,163,74,0.12)" : "rgba(217,119,6,0.12)", color: bid.isApproved ? "#16a34a" : "#d97706" }}>
                  {bid.isApproved ? "✅ מאושר" : "⏳ ממתין"}
                </span>
              </div>
              {bid.target && bid.target !== "-" && (
                <div style={{ fontSize: 13, color: "var(--text-2)", borderRight: `3px solid ${theme.primary}`, paddingRight: 8 }}>{bid.target}</div>
              )}
              <div style={{ fontSize: 20, fontWeight: 700, color: theme.primary }}>{fmt(bid.totalAmount)} ₪</div>
              <div style={{ display: "flex", gap: 8 }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setModal(bid)} style={{ flex: 1, padding: "7px", border: "none", borderRadius: 8, background: theme.primaryLight, color: theme.primary, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}>✎ עריכה</button>
                <button onClick={() => toggleApprove(bid)} style={{ flex: 1, padding: "7px", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "inherit", background: bid.isApproved ? "rgba(217,119,6,0.12)" : "rgba(22,163,74,0.12)", color: bid.isApproved ? "#d97706" : "#16a34a" }}>
                  {bid.isApproved ? "↩ בטל" : "✓ אשר"}
                </button>
                <button onClick={() => printBid(bid, settings, maam)} style={{ padding: "7px 10px", border: "none", borderRadius: 8, background: "rgba(59,130,246,0.1)", fontSize: 13, cursor: "pointer", color: "#3b82f6" }}>🖨️</button>
                <button onClick={() => { if (window.confirm("למחוק?")) remove(bid._id); }} style={{ padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 8, background: "var(--btn-cancel-bg)", fontSize: 13, cursor: "pointer", color: "#ef4444" }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <BidModal initial={modal === "add" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} inventories={inventories} maam={maam} theme={theme} S={S} allClients={allClients} />
      )}
      {viewBid && (
        <ViewModal bid={viewBid} onClose={() => setViewBid(null)} onToggleApprove={() => toggleApprove(viewBid)} theme={theme} settings={settings} maam={maam} />
      )}
    </div>
  );
}
