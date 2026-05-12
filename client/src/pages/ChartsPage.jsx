import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { salesApi, workersExpensesApi, bouncedChecksApi, expensesApi, sleevesBidsApi, salesToCompaniesApi } from "../api";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";

const MONTHS = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const COLORS = ["#7c3aed","#c9a84c","#10b981","#ef4444","#3b82f6","#f97316","#8b5cf6","#06b6d4"];
const currentYear = new Date().getFullYear();

const REPORT_TYPES = [
  { value: "sales", label: "מכירות" },
  { value: "workersExpenses", label: "הוצאות עובדים" },
  { value: "bouncedChecks", label: "שיקים חוזרים" },
  { value: "expenses", label: "הוצאות כלליות" },
  { value: "sleevesBids", label: "הצעות שוואדר" },
  { value: "salesToCompanies", label: "מכירות לחברות" },
];

function getMonthlyData(items) {
  return MONTHS.map((month, idx) => ({
    month: month.slice(0, 3),
    סכום: (items || [])
      .filter(i => new Date(i.date).getMonth() === idx && new Date(i.date).getFullYear() === currentYear)
      .reduce((s, i) => s + (Number(i.totalAmount) || 0), 0),
  }));
}

function getClientData(items, field = "clientName") {
  const map = {};
  (items || []).forEach(i => {
    const k = i[field] || "אחר";
    map[k] = (map[k] || 0) + (Number(i.totalAmount) || 0);
  });
  return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));
}

const fmt = (v) => Number(v || 0).toLocaleString("he-IL", { maximumFractionDigits: 0 }) + " ₪";

export default function ChartsPage() {
  const [report, setReport] = useState("sales");

  const apis = {
    sales: salesApi, workersExpenses: workersExpensesApi,
    bouncedChecks: bouncedChecksApi, expenses: expensesApi,
    sleevesBids: sleevesBidsApi, salesToCompanies: salesToCompaniesApi,
  };

  const { data, isLoading } = useQuery({
    queryKey: [report],
    queryFn: () => apis[report].getAll().then(r => r.data),
  });

  const monthly = getMonthlyData(data);
  const byClient = getClientData(data);
  const total = (data || []).reduce((s, i) => s + (Number(i.totalAmount) || 0), 0);
  const reportLabel = REPORT_TYPES.find(r => r.value === report)?.label;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">דוחות וגרפים</h1>
          <p className="text-gray-500 text-sm">שנת {currentYear}</p>
        </div>
        <select value={report} onChange={e => setReport(e.target.value)} className="input-field w-auto">
          {REPORT_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>

      {/* Summary card */}
      <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl p-5 text-white">
        <p className="text-white/60 text-sm">{reportLabel} - סה״כ {currentYear}</p>
        <p className="text-3xl font-bold mt-1">{fmt(total)}</p>
        <p className="text-white/40 text-xs mt-1">{(data || []).length} רשומות</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly bar */}
          <div className="section-card p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">פילוח חודשי</h2>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthly} margin={{ left: -20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip formatter={(v) => [fmt(v)]} contentStyle={{ fontFamily: "Assistant", borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="סכום" fill="#7c3aed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monthly line */}
          <div className="section-card p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">מגמה חודשית</h2>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={monthly} margin={{ left: -20 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                <Tooltip formatter={(v) => [fmt(v)]} contentStyle={{ fontFamily: "Assistant", borderRadius: 8, fontSize: 12 }} />
                <Line type="monotone" dataKey="סכום" stroke="#c9a84c" strokeWidth={2} dot={{ fill: "#c9a84c", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* By client pie */}
          <div className="section-card p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">לפי לקוח</h2>
            {byClient.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={byClient} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {byClient.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "Assistant", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            ) : <div className="flex items-center justify-center h-40 text-gray-400 text-sm">אין נתונים</div>}
          </div>

          {/* Top clients table */}
          <div className="section-card p-6">
            <h2 className="text-base font-semibold text-gray-700 mb-4">טופ לקוחות</h2>
            <div className="space-y-2">
              {byClient.slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                    <span className="text-sm text-gray-700">{c.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-800">{fmt(c.value)}</span>
                </div>
              ))}
              {byClient.length === 0 && <p className="text-gray-400 text-sm text-center py-4">אין נתונים</p>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
