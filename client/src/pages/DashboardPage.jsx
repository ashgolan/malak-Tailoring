import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  salesApi, bouncedChecksApi, workersExpensesApi, sleevesBidsApi,
  expensesApi, partialPaymentApi, taxValuesApi,
} from "../api";
import {
  ShoppingCart, CheckSquare, Users, Scissors,
  TrendingUp, TrendingDown, AlertCircle, Clock,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, CartesianGrid, Legend,
} from "recharts";
import { useIsMobile } from "../hooks/useIsMobile";
import { fmt } from "../utils/formatters";

const currentYear = new Date().getFullYear();
const currentMonth = new Date().getMonth();

const MONTHS_HE = ["ינואר", "פברואר", "מרץ", "אפריל", "מאי", "יוני", "יולי", "אוגוסט", "ספטמבר", "אוקטובר", "נובמבר", "דצמבר"];
const MONTHS_SHORT = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יון", "יול", "אוג", "ספט", "אוק", "נוב", "דצמ"];
const COLORS = ["#7c3aed", "#c9a84c", "#10b981", "#ef4444", "#3b82f6", "#f97316"];

function filterYear(data, year = currentYear) {
  return (data || []).filter(i => new Date(i.date).getFullYear() === year || i.colored);
}

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ title, value, icon: Icon, bg, sub, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 14, padding: "14px 16px",
      border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8,
      cursor: onClick ? "pointer" : "default",
    }}>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: "#9ca3af", margin: "0 0 3px", fontWeight: 500 }}>{title}</p>
        <p style={{ fontSize: 19, fontWeight: 700, color: "#1f2937", margin: 0, lineHeight: 1.2 }}>{value}</p>
        {sub && <p style={{ fontSize: 11, color: "#9ca3af", margin: "3px 0 0" }}>{sub}</p>}
      </div>
      <div style={{ width: 40, height: 40, borderRadius: 12, background: bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={18} color="#fff" />
      </div>
    </div>
  );
}

// ─── Section Title ─────────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#6b7280", marginBottom: 10, paddingRight: 2, textTransform: "uppercase", letterSpacing: "0.04em" }}>{title}</div>
      {children}
    </div>
  );
}

// ─── Card wrapper ──────────────────────────────────────────────
function Card({ children, style = {} }) {
  return (
    <div style={{ background: "#fff", borderRadius: 14, padding: "16px", border: "1px solid #f0f0f0", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", ...style }}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);

  const { data: salesData } = useQuery({ queryKey: ["sales"], queryFn: () => salesApi.getAll().then(r => r.data) });
  const { data: checksData } = useQuery({ queryKey: ["bouncedChecks"], queryFn: () => bouncedChecksApi.getAll().then(r => r.data) });
  const { data: workersData } = useQuery({ queryKey: ["workersExpenses"], queryFn: () => workersExpensesApi.getAll().then(r => r.data) });
  const { data: sleevesData } = useQuery({ queryKey: ["sleevesBids"], queryFn: () => sleevesBidsApi.getAll().then(r => r.data) });
  const { data: expensesData } = useQuery({ queryKey: ["expenses"], queryFn: () => expensesApi.getAll().then(r => r.data) });
  const { data: partialData } = useQuery({ queryKey: ["partialPayment"], queryFn: () => partialPaymentApi.getAll().then(r => r.data) });
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });

  // ── Annual data ──────────────────────────────────────────────
  const sales = useMemo(() => filterYear(salesData), [salesData]);
  const checks = useMemo(() => filterYear(checksData), [checksData]);
  const workers = useMemo(() => filterYear(workersData), [workersData]);
  const sleeves = useMemo(() => filterYear(sleevesData), [sleevesData]);
  const expenses = useMemo(() => filterYear(expensesData), [expensesData]);
  const partial = useMemo(() => filterYear(partialData), [partialData]);

  const totalSales = useMemo(() => sales.reduce((s, i) => s + (i.totalAmount || 0), 0), [sales]);
  const totalExpenses = useMemo(() => expenses.reduce((s, i) => s + (i.totalAmount || 0), 0), [expenses]);
  const totalWorkers = useMemo(() => workers.reduce((s, i) => s + (i.totalAmount || 0), 0), [workers]);
  const totalSleeves = useMemo(() => sleeves.reduce((s, i) => s + (i.totalAmount || 0), 0), [sleeves]);
  const openChecks = useMemo(() => checks.filter(c => !c.colored).length, [checks]);
  const openPartial = useMemo(() => partial.filter(p => !p.colored), [partial]);
  const totalPartialPending = useMemo(() => openPartial.reduce((s, i) => s + (i.totalAmount || 0), 0), [openPartial]);


  const [selectedType, setSelectedType] = useState("הכל");          // ✅ هنا

  // ── Monthly breakdown chart ──────────────────────────────────
  const monthlyData = useMemo(() => MONTHS_SHORT.map((month, idx) => {
    const inMonth = arr => arr.filter(i => new Date(i.date).getMonth() === idx);
    const sum = (arr, field = "totalAmount") => inMonth(arr).reduce((s, i) => s + (Number(i[field]) || 0), 0);
    return {
      month,
      מכירות: sum(sales),
      הוצאות: sum(expenses) + sum(workers),
      רווח: sum(sales) - sum(expenses) - sum(workers),
    };
  }), [sales, expenses, workers]);

  // ── Selected month data ──────────────────────────────────────
  const monthSales = useMemo(() => sales.filter(i => new Date(i.date).getMonth() === selectedMonth), [sales, selectedMonth]);
  const monthExpenses = useMemo(() => expenses.filter(i => new Date(i.date).getMonth() === selectedMonth), [expenses, selectedMonth]);
  const monthWorkers = useMemo(() => workers.filter(i => new Date(i.date).getMonth() === selectedMonth), [workers, selectedMonth]);

  const monthTotalSales = useMemo(() => monthSales.reduce((s, i) => s + (i.totalAmount || 0), 0), [monthSales]);
  const monthTotalExpenses = useMemo(() => monthExpenses.reduce((s, i) => s + (i.totalAmount || 0), 0), [monthExpenses]);
  const monthTotalWorkers = useMemo(() => monthWorkers.reduce((s, i) => s + (i.totalAmount || 0), 0), [monthWorkers]);

  // ── Recent transactions (last 8) ─────────────────────────────
  const recentTransactions = useMemo(() => {
    const allTx = [
      ...sales.map(i => ({ ...i, type: "מכירה", emoji: "🛒", color: "#7c3aed" })),
      ...expenses.map(i => ({ ...i, type: "הוצאה", emoji: "💸", color: "#ef4444" })),
      ...workers.map(i => ({
        ...i, type: "הוצ׳ עובד", emoji: "👷", color: "#3b82f6",
        clientName: i.clientName, totalAmount: i.totalAmount
      })),
    ].filter(i => i.date).sort((a, b) => b.date.localeCompare(a.date));
    return allTx.slice(0, 8);
  }, [sales, expenses, workers]);

  // ── Pie data ─────────────────────────────────────────────────
  const pieData = useMemo(() => [
    { name: "מכירות", value: totalSales },
    { name: "הוצ׳ עובדים", value: totalWorkers },
    { name: "הוצאות", value: totalExpenses },
    { name: "שרוולים", value: totalSleeves },
  ].filter(d => d.value > 0), [totalSales, totalWorkers, totalExpenses, totalSleeves]);

  const profit = totalSales - totalExpenses - totalWorkers;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, direction: "rtl" }}>

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 8 }}>
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 24, fontWeight: 700, color: "#1f2937", margin: 0 }}>לוח בקרה</h1>
          <p style={{ fontSize: 13, color: "#6b7280", margin: "3px 0 0" }}>סיכום פעילות {currentYear}</p>
        </div>
        {taxValues && (
          <div style={{ fontSize: 12, color: "#9ca3af", background: "#f9fafb", borderRadius: 8, padding: "4px 10px", border: "1px solid #f0f0f0" }}>
            מע״מ {taxValues.maamValue}% · ניכוי {taxValues.masValue}%
          </div>
        )}
      </div>

      {/* ── KPI Cards ──────────────────────────────────────────── */}
      <Section title="סיכום שנתי">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <StatCard title="סה״כ מכירות" value={fmt(totalSales)} icon={ShoppingCart} bg="#7c3aed" sub={`${sales.length} עסקאות`} onClick={() => navigate("/sales")} />
          <StatCard title="שיקים פתוחים" value={openChecks} icon={CheckSquare} bg="#ef4444" sub="טעון טיפול" onClick={() => navigate("/bounced-checks")} />
          <StatCard title="הוצאות עובדים" value={fmt(totalWorkers)} icon={Users} bg="#3b82f6" sub={`${workers.length} רשומות`} onClick={() => navigate("/workers-expenses")} />
          <StatCard title="שרוולים" value={fmt(totalSleeves)} icon={Scissors} bg="#c9a84c" sub={`${sleeves.length} רשומות`} onClick={() => navigate("/sleeves-bids")} />
          <StatCard title="הוצאות כלליות" value={fmt(totalExpenses)} icon={TrendingDown} bg="#f97316" sub={`${expenses.length} הוצאות`} onClick={() => navigate("/expenses")} />
          <StatCard title="תשלום חלקי" value={fmt(totalPartialPending)} icon={Clock} bg="#6366f1" sub={`${openPartial.length} פתוחים`} onClick={() => navigate("/partial-payment")} />
        </div>

        {/* Profit banner */}
        <div style={{
          marginTop: 10, borderRadius: 14, padding: "14px 18px",
          background: profit >= 0 ? "linear-gradient(135deg,#059669,#10b981)" : "linear-gradient(135deg,#dc2626,#ef4444)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div>
            <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 12, margin: "0 0 2px" }}>רווח משוער {currentYear}</p>
            <p style={{ color: "#fff", fontSize: 22, fontWeight: 700, margin: 0 }}>{fmt(profit)}</p>
          </div>
          <TrendingUp size={32} color="rgba(255,255,255,0.3)" />
        </div>
      </Section>

      {/* ── Monthly chart ──────────────────────────────────────── */}
      <Section title="מכירות מול הוצאות חודשי">
        <Card>
          <ResponsiveContainer width="100%" height={isMobile ? 180 : 240}>
            <BarChart data={monthlyData} margin={{ top: 4, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <Tooltip
                formatter={(v, n) => [fmt(v), n]}
                contentStyle={{ fontFamily: "Assistant", borderRadius: 8, fontSize: 12, border: "1px solid #f0f0f0" }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="מכירות" fill="#7c3aed" radius={[3, 3, 0, 0]} />
              <Bar dataKey="הוצאות" fill="#ef4444" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      {/* ── Monthly breakdown selector ─────────────────────────── */}
      <Section title="הוצאות / הכנסות לפי חודש">

        {/* Type selector */}
        <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
          {[
            { key: "הכנסות", label: "הכנסות 🛒", color: "#7c3aed" },
            { key: "הוצאות", label: "הוצאות 💸", color: "#ef4444" },
            { key: "הכל", label: "הכל", color: "#6b7280" },
          ].map(t => (
            <button key={t.key} onClick={() => setSelectedType(t.key)} style={{
              padding: "6px 14px", borderRadius: 20, border: "none", cursor: "pointer",
              fontSize: 12, fontWeight: 500, fontFamily: "inherit", flexShrink: 0,
              background: selectedType === t.key ? t.color : "#f3f4f6",
              color: selectedType === t.key ? "#fff" : "#6b7280",
              transition: "all 0.15s",
            }}>{t.label}</button>
          ))}
        </div>

        {/* Month selector */}
        <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
          {MONTHS_SHORT.map((m, i) => (
            <button key={i} onClick={() => setSelectedMonth(i)} style={{
              padding: "5px 12px", borderRadius: 20, border: "none", cursor: "pointer", flexShrink: 0,
              fontSize: 12, fontWeight: 500, fontFamily: "inherit",
              background: selectedMonth === i ? "#7c3aed" : "#f3f4f6",
              color: selectedMonth === i ? "#fff" : "#6b7280",
            }}>{m}</button>
          ))}
        </div>

        <Card>
          <div style={{ fontSize: 14, fontWeight: 600, color: "#374151", marginBottom: 12 }}>
            {MONTHS_HE[selectedMonth]} {currentYear} — {selectedType}
          </div>

          {/* Month stats */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "מכירות", value: fmt(monthTotalSales), color: "#7c3aed", bg: "#f5f3ff", show: selectedType !== "הוצאות" },
              { label: "הוצאות עובד", value: fmt(monthTotalWorkers), color: "#3b82f6", bg: "#eff6ff", show: selectedType !== "הכנסות" },
              { label: "הוצאות כלל׳", value: fmt(monthTotalExpenses), color: "#ef4444", bg: "#fef2f2", show: selectedType !== "הכנסות" },
            ].filter(s => s.show).map((s, i) => (
              <div key={i} style={{ background: s.bg, borderRadius: 10, padding: "10px 12px", textAlign: "center" }}>
                <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</div>
              </div>
            ))}
          </div>

          {/* Profit for month */}
          {selectedType === "הכל" && (
            <div style={{
              borderRadius: 10, padding: "10px 14px", display: "flex", justifyContent: "space-between", alignItems: "center",
              background: (monthTotalSales - monthTotalExpenses - monthTotalWorkers) >= 0 ? "#f0fdf4" : "#fef2f2",
              border: `1px solid ${(monthTotalSales - monthTotalExpenses - monthTotalWorkers) >= 0 ? "#bbf7d0" : "#fecaca"}`,
              marginBottom: 14,
            }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>רווח חודשי</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: (monthTotalSales - monthTotalExpenses - monthTotalWorkers) >= 0 ? "#16a34a" : "#ef4444" }}>
                {fmt(monthTotalSales - monthTotalExpenses - monthTotalWorkers)}
              </span>
            </div>
          )}

          {/* Items list */}
          {(() => {
            const items = selectedType === "הכנסות"
              ? monthSales.map(i => ({ ...i, emoji: "🛒", color: "#7c3aed", sub: i.name }))
              : selectedType === "הוצאות"
                ? [
                  ...monthExpenses.map(i => ({ ...i, emoji: "💸", color: "#ef4444", sub: i.name || "-" })),
                  ...monthWorkers.map(i => ({ ...i, emoji: "👷", color: "#3b82f6", sub: i.equipment || "-" })),
                ].sort((a, b) => b.date?.localeCompare(a.date))
                : [
                  ...monthSales.map(i => ({ ...i, emoji: "🛒", color: "#7c3aed", sub: i.name })),
                  ...monthExpenses.map(i => ({ ...i, emoji: "💸", color: "#ef4444", sub: i.name || "-" })),
                  ...monthWorkers.map(i => ({ ...i, emoji: "👷", color: "#3b82f6", sub: i.equipment || "-" })),
                ].sort((a, b) => b.date?.localeCompare(a.date));

            if (items.length === 0) return (
              <div style={{ textAlign: "center", padding: 24, color: "#9ca3af", fontSize: 13 }}>אין נתונים לחודש זה</div>
            );

            return (
              <div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 8, fontWeight: 500 }}>
                  {items.length} רשומות
                </div>
                {items.slice(0, 6).map((item, i) => (
                  <div key={item._id || i} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    padding: "8px 0", borderBottom: "1px solid #f3f4f6",
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{item.emoji}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {item.clientName || "-"}
                        </div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{item.sub} · {item.date}</div>
                      </div>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: item.color, flexShrink: 0, marginRight: 8 }}>
                      {fmt(item.totalAmount)}
                    </span>
                  </div>
                ))}
                {items.length > 6 && (
                  <div style={{ fontSize: 12, color: "#9ca3af", textAlign: "center", marginTop: 8 }}>
                    + עוד {items.length - 6} רשומות
                  </div>
                )}
              </div>
            );
          })()}
        </Card>
      </Section>

      {/* ── Pie ────────────────────────────────────────────────── */}
      <Section title="התפלגות שנתית">
        <Card>
          {pieData.length > 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
              <ResponsiveContainer width={isMobile ? "100%" : "45%"} height={140}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={35} outerRadius={60} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "Assistant", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                {pieData.map((d, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ width: 10, height: 10, borderRadius: "50%", background: COLORS[i % COLORS.length], flexShrink: 0 }} />
                      <span style={{ color: "#6b7280" }}>{d.name}</span>
                    </div>
                    <span style={{ fontWeight: 600, color: "#374151" }}>{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div style={{ textAlign: "center", padding: 32, color: "#9ca3af", fontSize: 13 }}>אין נתונים</div>
          )}
        </Card>
      </Section>

      {/* ── Recent transactions ─────────────────────────────────── */}
      <Section title="תנועות אחרונות">
        <Card>
          {recentTransactions.length === 0 ? (
            <div style={{ textAlign: "center", padding: 32, color: "#9ca3af", fontSize: 13 }}>אין תנועות</div>
          ) : recentTransactions.map((item, i) => (
            <div key={item._id || i} style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 0", borderBottom: i < recentTransactions.length - 1 ? "1px solid #f3f4f6" : "none",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: item.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                  {item.emoji}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.clientName || item.name || "-"}
                  </div>
                  <div style={{ fontSize: 11, color: "#9ca3af" }}>
                    {item.type} · {item.date}
                  </div>
                </div>
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: item.color, flexShrink: 0, marginRight: 8 }}>
                {item.type === "הוצאה" || item.type === "הוצ׳ עובד" ? "-" : "+"}{fmt(item.totalAmount)}
              </span>
            </div>
          ))}
        </Card>
      </Section>

    </div>
  );
}