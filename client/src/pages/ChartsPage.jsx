import { useState, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  salesApi, bouncedChecksApi, workersExpensesApi, sleevesBidsApi,
  expensesApi, partialPaymentApi, salesToCompaniesApi, institutionTaxApi,
  waybillsApi, settingsApi,
} from "../api";
import { useTheme } from "../context/ThemeContext";

const fmt = (n) => Number(n || 0).toLocaleString("he-IL", { maximumFractionDigits: 2 });

const REPORTS = [
  {
    key: "sales", label: "מכירות", icon: "🛒", api: salesApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "clientName", label: "קליינט" },
      { key: "name", label: "עבודה" },
      { key: "quantity", label: 'כ.מ"ר', type: "num" },
      { key: "number", label: "מחיר", type: "money" },
      { key: "discount", label: "הנחה%", type: "num" },
      { key: "expenses", label: "הוצאות", type: "money" },
      { key: "tax", label: "מע״מ", type: "bool" },
      { key: "totalAmount", label: "סה״כ", type: "money" },
    ],
    searchFields: ["clientName", "name"],
    totalField: "totalAmount",
  },
  {
    key: "bouncedChecks", label: "שיקים דחויים", icon: "✅", api: bouncedChecksApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "clientName", label: "קליינט" },
      { key: "taxNumber", label: "מס' חשבונית" },
      { key: "checkNumber", label: "מס' שיק" },
      { key: "bankNumber", label: "בנק" },
      { key: "branchNumber", label: "סניף" },
      { key: "accountNumber", label: "חשבון" },
      { key: "paymentDate", label: "ת.פירעון" },
      { key: "number", label: "סכום", type: "money" },
      { key: "remark", label: "הערה" },
    ],
    searchFields: ["clientName", "checkNumber"],
    totalField: "number",
  },
  {
    key: "workersExpenses", label: "הוצאות עובדים", icon: "👷", api: workersExpensesApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "clientName", label: "קליינט" },
      { key: "location", label: "מיקום" },
      { key: "equipment", label: "עבודה" },
      { key: "number", label: "סכום", type: "money" },
      { key: "tax", label: "שולם", type: "bool" },
      { key: "totalAmount", label: "סה״כ", type: "money" },
    ],
    searchFields: ["clientName", "location"],
    totalField: "totalAmount",
  },
  {
    key: "waybills", label: "תעודות משלוח", icon: "🚛", api: waybillsApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "clientName", label: "חברה / מוסד" },
      { key: "location", label: "כתובת משלוח" },
      { key: "name", label: "תיאור מוצר" },
      { key: "remark", label: "מס' הזמנה" },
      { key: "quantity", label: "כמות", type: "num" },
    ],
    searchFields: ["clientName", "location", "name"],
    totalField: null,
  },
  {
    key: "partialPayment", label: "תשלום חלקי", icon: "💳", api: partialPaymentApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "clientName", label: "קליינט" },
      { key: "name", label: "עבור" },
      { key: "advanceAmount", label: "שולם", type: "money" },
      { key: "totalAmount", label: "סכום כללי", type: "money" },
    ],
    searchFields: ["clientName", "name"],
    totalField: "totalAmount",
  },
  {
    key: "institutionTax", label: "חשבוניות למוסדות", icon: "🏛️", api: institutionTaxApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "clientName", label: "מוסד" },
      { key: "name", label: "עבודה" },
      { key: "taxNumber", label: "מס' חשבונית" },
      { key: "number", label: "סכום", type: "money" },
      { key: "paymentDate", label: "ת.תשלום" },
      { key: "totalAmount", label: "סה״כ", type: "money" },
    ],
    searchFields: ["clientName", "name", "taxNumber"],
    totalField: "totalAmount",
  },
  {
    key: "salesToCompanies", label: "מכירות לחברות", icon: "🏢", api: salesToCompaniesApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "clientName", label: "חברה" },
      { key: "name", label: "עבודה" },
      { key: "containersNumbers", label: "מס קונטינר" },
      { key: "kindOfWork", label: "סוג הובלה" },
      { key: "sending", label: "משלוח" },
      { key: "afterTax", label: "מע״מ" },
      { key: "totalAmount", label: "סה״כ", type: "money" },
    ],
    searchFields: ["clientName", "name", "kindOfWork"],
    totalField: "totalAmount",
  },
  {
    key: "expenses", label: "הוצאות", icon: "💸", api: expensesApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "name", label: "שם / ספק" },
      { key: "taxNumber", label: "מס' חשבונית" },
      { key: "number", label: "סכום", type: "money" },
      { key: "tax", label: "מע״מ", type: "bool" },
      { key: "paymentDate", label: "ת.תשלום" },
      { key: "totalAmount", label: "סה״כ", type: "money" },
    ],
    searchFields: ["name", "taxNumber"],
    totalField: "totalAmount",
  },
  {
    key: "sleevesBids", label: "שרוולים", icon: "✂️", api: sleevesBidsApi,
    cols: [
      { key: "date", label: "תאריך" },
      { key: "clientName", label: "קליינט" },
      { key: "quantity", label: "כמות", type: "num" },
      { key: "number", label: "מחיר", type: "money" },
      { key: "tax", label: "מע״מ", type: "bool" },
      { key: "totalAmount", label: "סה״כ", type: "money" },
    ],
    searchFields: ["clientName"],
    totalField: "totalAmount",
  },
];

const MONTHS_HE = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const currentYear = new Date().getFullYear();
const YEARS = [currentYear, currentYear-1, currentYear-2, currentYear-3];

export default function ChartsPage() {
  const { theme } = useTheme();
  const printRef = useRef(null);

  const [selectedReport, setSelectedReport] = useState("sales");
  const [filterYear, setFilterYear]   = useState(currentYear);
  const [filterMonth, setFilterMonth] = useState(0); // 0 = all months
  const [filterClient, setFilterClient] = useState("");
  const [search, setSearch] = useState("");

  const report = REPORTS.find(r => r.key === selectedReport);

  const { data: rawData, isLoading } = useQuery({
    queryKey: [selectedReport],
    queryFn: () => report.api.getAll().then(r => r.data),
  });

  const filtered = useMemo(() => {
    let result = [...(rawData || [])];

    // Year filter
    result = result.filter(item => {
      if (!item.date) return false;
      const d = new Date(item.date);
      return d.getFullYear() === Number(filterYear);
    });

    // Month filter
    if (filterMonth > 0) {
      result = result.filter(item => {
        const d = new Date(item.date);
        return d.getMonth() + 1 === Number(filterMonth);
      });
    }

    // Client filter
    if (filterClient) {
      result = result.filter(item =>
        report.searchFields.some(f => String(item[f]||"").toLowerCase().includes(filterClient.toLowerCase()))
      );
    }

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter(item =>
        report.searchFields.some(f => String(item[f]||"").toLowerCase().includes(s))
      );
    }

    return result.sort((a, b) => a.date < b.date ? -1 : 1);
  }, [rawData, filterYear, filterMonth, filterClient, search, report]);

  const total = report.totalField
    ? filtered.reduce((s, i) => s + Number(i[report.totalField] || 0), 0)
    : null;

  // Unique clients for filter
  const allClients = [...new Set((rawData||[]).map(i => i.clientName).filter(Boolean))].sort();

  const renderCell = (item, col) => {
    const val = item[col.key];
    if (col.type === "money") return `${fmt(val)} ₪`;
    if (col.type === "num")   return val || "-";
    if (col.type === "bool")  return val ? "✓" : "✕";
    return val || "-";
  };

  const { data: settings } = useQuery({
    queryKey: ["settings"],
    queryFn: () => settingsApi.get().then(r => r.data),
  });

  const handlePrint = () => {
    const date = new Date().toLocaleDateString("he-IL");
    const logoHtml = settings?.logoBase64
      ? `<div style="text-align:center;margin-bottom:12px;"><img src="${settings.logoBase64}" style="width:90%;max-height:160px;object-fit:contain;" /></div>`
      : `<div style="text-align:center;margin-bottom:12px;font-size:26px;font-weight:700;color:#1f2937;">${settings?.storeName || "מתפרת רושאן"}</div>`;

    const win = window.open("", "_blank");
    win.document.write(`
      <html dir="rtl">
      <head>
        <title>${report.label} - דוח</title>
        <style>
          * { font-family: 'Assistant', Arial, sans-serif; direction: rtl; }
          body { padding: 16px; color: #1f2937; font-size: 11px; }
          h1 { font-size: 16px; margin: 0 0 4px; text-align: center; }
          .subtitle { font-size: 10px; color: #6b7280; margin-bottom: 12px; text-align: center; }
          .divider { border: none; border-top: 2px solid #1f2937; margin: 10px 0 12px; }
          table { width: 100%; border-collapse: collapse; font-size: 10px; }
          th { background: #1f2937; color: white; padding: 5px 7px; text-align: right; font-weight: 600; white-space: nowrap; }
          td { padding: 4px 7px; border-bottom: 1px solid #f0f0ef; text-align: right; white-space: nowrap; }
          tr:nth-child(even) { background: #f9fafb; }
          .footer { margin-top: 16px; font-size: 10px; color: #9ca3af; text-align: center; border-top: 1px solid #f0f0ef; padding-top: 10px; }
        </style>
      </head>
      <body>
        ${logoHtml}
        <hr class="divider" />
        <h1>${report.icon} ${report.label}</h1>
        <div class="subtitle">
          שנה: ${filterYear}
          ${filterMonth > 0 ? ` | חודש: ${MONTHS_HE[filterMonth-1]}` : ""}
          ${filterClient ? ` | לקוח: ${filterClient}` : ""}
          | ${filtered.length} רשומות
          ${total !== null ? ` | סה״כ: ${fmt(total)} ₪` : ""}
        </div>
        ${printRef.current.innerHTML}
        <div class="footer">
          הופק בתאריך ${date}
          ${settings?.storePhone ? ` | ${settings.storePhone}` : ""}
          ${settings?.footerText ? `<br/>${settings.footerText}` : ""}
        </div>
      </body>
      </html>
    `);
    win.document.close();
    win.print();
  };

  const fo = (e) => { e.target.style.borderColor = theme.accent; };
  const bl = (e) => { e.target.style.borderColor = "#e5e7eb"; };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 12px ${theme.primary}30` }}>📊</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>דוחות</h1>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"3px 0 0" }}>הפקת דוחות לפי סינון</p>
          </div>
        </div>
        <button onClick={handlePrint}
          style={{ display:"flex", alignItems:"center", gap:8, padding:"9px 18px", borderRadius:8, background:theme.gradient, color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 2px 8px ${theme.primary}30` }}>
          🖨️ הדפס דוח
        </button>
      </div>

      {/* Filters */}
      <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", padding:"20px 24px", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:14 }}>סינון הדוח</div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(180px, 1fr))", gap:12 }}>

          {/* Report type */}
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6, textTransform:"uppercase" }}>סוג דוח</label>
            <select value={selectedReport} onChange={e => { setSelectedReport(e.target.value); setFilterClient(""); setSearch(""); }}
              style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", background:"#fff", fontFamily:"inherit" }}
              onFocus={fo} onBlur={bl}>
              {REPORTS.map(r => <option key={r.key} value={r.key}>{r.icon} {r.label}</option>)}
            </select>
          </div>

          {/* Year */}
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6, textTransform:"uppercase" }}>שנה</label>
            <select value={filterYear} onChange={e => setFilterYear(e.target.value)}
              style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", background:"#fff", fontFamily:"inherit" }}
              onFocus={fo} onBlur={bl}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Month */}
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6, textTransform:"uppercase" }}>חודש</label>
            <select value={filterMonth} onChange={e => setFilterMonth(e.target.value)}
              style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", background:"#fff", fontFamily:"inherit" }}
              onFocus={fo} onBlur={bl}>
              <option value={0}>כל החודשים</option>
              {MONTHS_HE.map((m, i) => <option key={i+1} value={i+1}>{m}</option>)}
            </select>
          </div>

          {/* Client filter */}
          {allClients.length > 0 && (
            <div>
              <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6, textTransform:"uppercase" }}>לקוח / מוסד</label>
              <select value={filterClient} onChange={e => setFilterClient(e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", background:"#fff", fontFamily:"inherit" }}
                onFocus={fo} onBlur={bl}>
                <option value="">הכל</option>
                {allClients.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          )}

          {/* Search */}
          <div>
            <label style={{ display:"block", fontSize:11, fontWeight:600, color:"#9ca3af", marginBottom:6, textTransform:"uppercase" }}>חיפוש חופשי</label>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש..."
              style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
              onFocus={fo} onBlur={bl} />
          </div>

        </div>
      </div>

      {/* Stats summary */}
      <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${theme.primaryBorder}`, padding:"14px 24px", display:"flex", gap:0, alignItems:"center", flexWrap:"wrap" }}>
        {[
          { label:"דוח", value:`${report.icon} ${report.label}`, color:"#1f2937" },
          { label:"תקופה", value:`${MONTHS_HE[Number(filterMonth)-1] || "כל השנה"} ${filterYear}`, color:"#6b7280" },
          { label:"רשומות", value:filtered.length, color:theme.primary },
          ...(total !== null ? [{ label:"סה״כ", value:`${fmt(total)} ₪`, color:theme.primary }] : []),
        ].map((stat, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", flexGrow:1 }}>
            {i > 0 && <div style={{ width:1, background:theme.primaryBorder, alignSelf:"stretch", marginLeft:24, marginRight:24 }} />}
            <div style={{ display:"flex", flexDirection:"column", gap:2 }}>
              <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500, textTransform:"uppercase" }}>{stat.label}</span>
              <span style={{ fontSize:15, fontWeight:700, color:stat.color }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div ref={printRef} style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        {isLoading ? (
          <div style={{ display:"flex", justifyContent:"center", padding:60 }}>
            <div style={{ width:32, height:32, border:`4px solid ${theme.primaryBorder}`, borderTopColor:theme.primary, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
            <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
          </div>
        ) : (
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:13 }}>
            <thead>
              <tr style={{ background:theme.gradient, color:"#fff" }}>
                {report.cols.map(col => (
                  <th key={col.key} style={{ padding:"12px 12px", textAlign:"right", fontWeight:600, fontSize:12, whiteSpace:"nowrap" }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={report.cols.length} style={{ textAlign:"center", padding:"48px 20px", color:"#9ca3af" }}>
                  <div style={{ fontSize:28, marginBottom:10 }}>📭</div>
                  <div>אין נתונים לתקופה הנבחרת</div>
                </td></tr>
              ) : filtered.map((item, idx) => (
                <tr key={item._id} style={{ background: idx%2===0 ? "#fff" : "#fafafa", borderBottom:"1px solid #f3f4f6" }}>
                  {report.cols.map(col => (
                    <td key={col.key} style={{ padding:"9px 12px", textAlign:"right", color: col.type==="money" ? theme.primary : "#374151", fontWeight: col.type==="money" ? 600 : 400 }}>
                      {renderCell(item, col)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
            {filtered.length > 0 && total !== null && (
              <tfoot>
                <tr style={{ background:theme.primaryLight, borderTop:`2px solid ${theme.primaryBorder}`, fontWeight:700 }}>
                  <td style={{ padding:"12px 12px", fontSize:13, color:"#6b7280" }}>סה״כ ({filtered.length} רשומות)</td>
                  {report.cols.slice(1, -1).map(col => <td key={col.key} />)}
                  <td style={{ padding:"12px 12px", textAlign:"right", fontSize:15, color:theme.primary }}>{fmt(total)} ₪</td>
                </tr>
              </tfoot>
            )}
          </table>
        )}
      </div>
    </div>
  );
}
