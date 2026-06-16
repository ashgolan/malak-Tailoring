import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  salesApi, bouncedChecksApi, workersExpensesApi, sleevesBidsApi,
  expensesApi, partialPaymentApi, salesToCompaniesApi, institutionTaxApi,
  waybillsApi, settingsApi,
} from "../api";
import { useTheme } from "../context/ThemeContext";
import { useStyles } from "../hooks/useStyles";
import { getLogoHtml, getFooterHtml, printViaIframe, PRINT_CSS } from "../utils/printHelper";

const fmt = (n) => Number(n || 0).toLocaleString("he-IL", { maximumFractionDigits: 2 });
const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3];

// ✅ حساب المبلغ قبل מע״מ حسب نوع التقرير
const getPreTaxAmount = (item, reportKey) => {
  if (reportKey === "sales") {
    // מכירות: (מחיר - הנחה%) × כמות - הוצאות
    const num = Number(item.number) || 0;
    const disc = Number(item.discount) || 0;
    const qty = Number(item.quantity) || 1;
    const exp = Number(item.expenses) || 0;
    const saleVal = num - (num * disc) / 100;
    return saleVal * qty - exp;
  }
  if (reportKey === "expenses") {
    // הוצאות: number = הסכום לפני מע״מ
    return Number(item.number) || 0;
  }
  // بقية التقارير: استخدم totalAmount كما هو
  return Number(item.totalAmount || item.number || 0);
};

const REPORTS = [
  {
    key: "sales", label: "מכירות", icon: "🛒", api: salesApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "clientName", label: "קליינט" }, { key: "name", label: "עבודה" }, { key: "quantity", label: 'כ.מ"ר', type: "num" }, { key: "number", label: "מחיר", type: "money" }, { key: "discount", label: "הנחה%", type: "num" }, { key: "expenses", label: "הוצאות", type: "money" }, { key: "tax", label: "מע״מ", type: "bool" }, { key: "totalAmount", label: "סה״כ", type: "money" }],
    searchFields: ["clientName", "name"], totalField: "totalAmount"
  },
  {
    key: "bouncedChecks", label: "שיקים דחויים", icon: "✅", api: bouncedChecksApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "clientName", label: "קליינט" }, { key: "taxNumber", label: "מס' חשבונית" }, { key: "checkNumber", label: "מס' שיק" }, { key: "bankNumber", label: "בנק" }, { key: "branchNumber", label: "סניף" }, { key: "accountNumber", label: "חשבון" }, { key: "paymentDate", label: "ת.פירעון" }, { key: "number", label: "סכום", type: "money" }, { key: "remark", label: "הערה" }],
    searchFields: ["clientName", "checkNumber"], totalField: "number"
  },
  {
    key: "workersExpenses", label: "הוצאות עובדים", icon: "👷", api: workersExpensesApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "clientName", label: "קליינט" }, { key: "location", label: "מיקום" }, { key: "equipment", label: "עבודה" }, { key: "number", label: "סכום", type: "money" }, { key: "tax", label: "שולם", type: "bool" }, { key: "totalAmount", label: "סה״כ", type: "money" }],
    searchFields: ["clientName", "location"], totalField: "totalAmount"
  },
  {
    key: "waybills", label: "תעודות משלוח", icon: "🚛", api: waybillsApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "clientName", label: "חברה / מוסד" }, { key: "location", label: "כתובת" }, { key: "name", label: "מוצר" }, { key: "remark", label: "מס' הזמנה" }, { key: "quantity", label: "כמות", type: "num" }],
    searchFields: ["clientName", "location", "name"], totalField: null
  },
  {
    key: "partialPayment", label: "תשלום חלקי", icon: "💳", api: partialPaymentApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "clientName", label: "קליינט" }, { key: "name", label: "עבור" }, { key: "advanceAmount", label: "שולם", type: "money" }, { key: "totalAmount", label: "סכום כללי", type: "money" }],
    searchFields: ["clientName", "name"], totalField: "totalAmount"
  },
  {
    key: "institutionTax", label: "חשבוניות למוסדות", icon: "🏛️", api: institutionTaxApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "clientName", label: "מוסד" }, { key: "name", label: "עבודה" }, { key: "taxNumber", label: "מס' חשבונית" }, { key: "number", label: "סכום", type: "money" }, { key: "paymentDate", label: "ת.תשלום" }],
    searchFields: ["clientName", "name", "taxNumber"], totalField: "number"
  },
  {
    key: "salesToCompanies", label: "מכירות לחברות", icon: "🏢", api: salesToCompaniesApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "clientName", label: "חברה" }, { key: "name", label: "עבודה" }, { key: "kindOfWork", label: "מכולה" }, { key: "sending", label: "משלוח" }, { key: "totalAmount", label: "סה״כ", type: "money" }],
    searchFields: ["clientName", "name"], totalField: "totalAmount"
  },
  {
    key: "expenses", label: "הוצאות", icon: "💸", api: expensesApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "name", label: "שם" }, { key: "taxNumber", label: "מס' חשבונית" }, { key: "number", label: "סכום", type: "money" }, { key: "paymentDate", label: "ת.תשלום" }, { key: "totalAmount", label: "סה״כ", type: "money" }],
    searchFields: ["name", "taxNumber"], totalField: "totalAmount"
  },
  {
    key: "sleevesBids", label: "הצעות שרוולים", icon: "✂️", api: sleevesBidsApi,
    cols: [{ key: "date", label: "תאריך" }, { key: "clientName", label: "קליינט" }, { key: "quantity", label: "כמות", type: "num" }, { key: "number", label: "מחיר", type: "money" }, { key: "tax", label: "מע״מ", type: "bool" }, { key: "totalAmount", label: "סה״כ", type: "money" }],
    searchFields: ["clientName"], totalField: "totalAmount"
  },
];

export default function ChartsPage() {
  const { theme } = useTheme();
  const S = useStyles(theme);
  const printRef = useRef(null);
  const [selectedReport, setSelectedReport] = useState("sales");
  const [filterYear, setFilterYear] = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(0);
  const [filterClient, setFilterClient] = useState("");
  const [search, setSearch] = useState("");

  const report = REPORTS.find(r => r.key === selectedReport);

  const { data: rawData, isLoading } = useQuery({
    queryKey: [selectedReport],
    queryFn: () => report.api.getAll().then(r => r.data),
  });

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get().then(r => r.data),
    staleTime: Infinity,  // لا تعيد التحميل
  });
  
  const filtered = useMemo(() => {
    let result = [...(rawData || [])].filter(item => {
      if (!item.date) return false;
      const d = new Date(item.date);
      if (d.getFullYear() !== Number(filterYear)) return false;
      if (filterMonth > 0 && d.getMonth() + 1 !== Number(filterMonth)) return false;
      if (filterClient && !report.searchFields.some(f => String(item[f] || "").toLowerCase().includes(filterClient.toLowerCase()))) return false;
      if (search) { const s = search.toLowerCase(); if (!report.searchFields.some(f => String(item[f] || "").toLowerCase().includes(s))) return false; }
      return true;
    });
    return result.sort((a, b) => a.date < b.date ? -1 : 1);
  }, [rawData, filterYear, filterMonth, filterClient, search, report]);

  // ✅ استخدم getPreTaxAmount لحساب المجموع (قبل מע״מ للمكيعات)
  const total = report.totalField ? filtered.reduce((s, i) => s + getPreTaxAmount(i, selectedReport), 0) : null;
  const allClients = [...new Set((rawData || []).map(i => i.clientName).filter(Boolean))].sort();

  const renderCell = (item, col) => {
    const val = item[col.key];
    if (col.type === "money") return val ? `${fmt(val)} ₪` : "-";
    if (col.type === "num") return val || "-";
    if (col.type === "bool") return val ? "✓" : "✕";
    return val || "-";
  };

  const fo = (e) => { e.target.style.borderColor = theme.accent; };
  const bl = (e) => { e.target.style.borderColor = "var(--border)"; };

  const handlePrint = () => {
    const logoHtml = getLogoHtml(settings);
    const footerHtml = getFooterHtml(settings);

    const html = `<html dir="rtl">
  <head>
    <meta charset="UTF-8"/>
    <title>${report.label} - דוח</title>
    <style>${PRINT_CSS}</style>
  </head>
  <body>
    ${logoHtml}
    <hr class="divider"/>
    <h1>${report.icon} ${report.label}</h1>
    <div class="subtitle">
      שנה: ${filterYear}
      ${filterMonth > 0 ? ` | חודש: ${MONTHS_HE[filterMonth - 1]}` : ""}
      ${filterClient ? ` | לקוח: ${filterClient}` : ""}
       | ${filtered.length} רשומות
      ${total !== null ? ` | סה״כ: ${fmt(total)} ₪` : ""}
    </div>
    ${printRef.current.innerHTML}
    ${footerHtml}
  </body>
  </html>`;

    printViaIframe(`${report.label} - דוח`, html);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: "rtl" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: theme.gradient, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>📊</div>
          <div><h1 style={{ fontSize: 22, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>דוחות</h1>
            <p style={{ fontSize: 13, color: "var(--text-4)", margin: "3px 0 0" }}>הפקת דוחות מפורטים לפי סינון</p>
          </div>
        </div>
        <button onClick={handlePrint}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 18px", borderRadius: 8, background: theme.gradient, color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}>
          🖨️ הדפס דוח
        </button>
      </div>

      {/* Filters */}
      <div style={{ ...S.card, padding: "20px 24px" }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: "var(--text-1)", marginBottom: 14 }}>סינון הדוח</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px,1fr))", gap: 12 }}>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-4)", marginBottom: 6, textTransform: "uppercase" }}>סוג דוח</label>
            <select value={selectedReport} onChange={e => { setSelectedReport(e.target.value); setFilterClient(""); setSearch(""); }} style={S.select} onFocus={fo} onBlur={bl}>
              {REPORTS.map(r => <option key={r.key} value={r.key}>{r.icon} {r.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-4)", marginBottom: 6, textTransform: "uppercase" }}>שנה</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)} style={S.select} onFocus={fo} onBlur={bl}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-4)", marginBottom: 6, textTransform: "uppercase" }}>חודש</label>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)} style={S.select} onFocus={fo} onBlur={bl}>
              <option value={0}>כל החודשים</option>
              {MONTHS_HE.map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
            </select>
          </div>
          {allClients.length > 0 && (
            <div>
              <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-4)", marginBottom: 6, textTransform: "uppercase" }}>לקוח / מוסד</label>
              <select value={filterClient} onChange={e => setFilterClient(e.target.value)} style={S.select} onFocus={fo} onBlur={bl}>
                <option value="">הכל</option>
                {allClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}
          <div>
            <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--text-4)", marginBottom: 6, textTransform: "uppercase" }}>חיפוש חופשي</label>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חيفوש..." style={S.input} onFocus={fo} onBlur={bl} />
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div style={{ background: "var(--bg-stat)", borderRadius: 12, border: `1px solid ${theme.primaryBorder}`, padding: "14px 24px", display: "flex", gap: 0, alignItems: "center", flexWrap: "wrap" }}>
        {[
          { label: "דוח", value: `${report.icon} ${report.label}`, color: "var(--text-1)" },
          { label: "תקופה", value: `${MONTHS_HE[Number(filterMonth) - 1] || "כל השנה"} ${filterYear}`, color: "var(--text-3)" },
          { label: "רשומות", value: filtered.length, color: theme.primary },
          ...(total !== null ? [{ label: "סה״כ", value: `${fmt(total)} ₪`, color: theme.primary }] : []),
        ].map((stat, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flexGrow: 1 }}>
            {i > 0 && <div style={{ width: 1, background: "var(--border)", alignSelf: "stretch", marginLeft: 24, marginRight: 24 }} />}
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 11, color: "var(--text-4)", fontWeight: 500, textTransform: "uppercase" }}>{stat.label}</span>
              <span style={{ fontSize: 15, fontWeight: 700, color: stat.color }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div ref={printRef} style={{ background: "var(--bg-card)", borderRadius: 16, border: "1px solid var(--border-light)", overflow: "auto", boxShadow: "var(--shadow-card)" }}>
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
            <div className="rosh-spinner" style={{ borderTopColor: theme.primary }} />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: theme.gradient, color: "#fff" }}>
                {report.cols.map(col => (
                  <th key={col.key} style={{ padding: "12px 12px", textAlign: "right", fontWeight: 600, fontSize: 12, whiteSpace: "nowrap" }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={report.cols.length} style={{ textAlign: "center", padding: "48px 20px", color: "var(--text-4)" }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>📭</div>
                  <div>אין נתונים לתקופה הנבחרת</div>
                </td></tr>
              ) : filtered.map((item, idx) => (
                <tr key={item._id} style={{ background: idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-alt)", borderBottom: "1px solid var(--border-light)" }}>
                  {report.cols.map(col => (
                    <td key={col.key} style={{ padding: "9px 12px", textAlign: "right", color: col.type === "money" ? theme.primary : "var(--text-1)", fontWeight: col.type === "money" ? 600 : 400 }}>
                      {renderCell(item, col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && total !== null && (
              <tfoot>
                <tr style={{ background: "var(--bg-hover)", borderTop: `2px solid ${theme.primaryBorder}`, fontWeight: 700 }}>
                  <td style={{ padding: "12px 12px", fontSize: 13, color: "var(--text-3)" }}>סה״כ ({filtered.length} רשומות)</td>
                  {report.cols.slice(1, -1).map(col => <td key={col.key} />)}
                  <td style={{ padding: "12px 12px", textAlign: "right", fontSize: 15, color: theme.primary }}>{fmt(total)} ₪</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
