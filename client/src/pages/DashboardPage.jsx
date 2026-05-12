import { useQuery } from "@tanstack/react-query";
import {
  salesApi, bouncedChecksApi, workersExpensesApi, sleevesBidsApi,
  expensesApi, partialPaymentApi, taxValuesApi,
} from "../api";
import {
  ShoppingCart, CheckSquare, Users, Scissors,
  TrendingUp, TrendingDown, AlertCircle, Clock,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const currentYear = new Date().getFullYear();

function filterCurrentYear(data) {
  return (data || []).filter((item) => {
    const d = new Date(item.date);
    return d.getFullYear() === currentYear || item.colored;
  });
}

function StatCard({ title, value, icon: Icon, color, sub }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-start justify-between">
      <div>
        <p className="text-gray-500 text-sm font-medium mb-1">{title}</p>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
    </div>
  );
}

const MONTHS_HE = ["ינו", "פבר", "מרץ", "אפר", "מאי", "יון", "יול", "אוג", "ספט", "אוק", "נוב", "דצמ"];
const COLORS = ["#7c3aed", "#c9a84c", "#10b981", "#ef4444", "#3b82f6", "#f97316"];

export default function DashboardPage() {
  const { data: salesData } = useQuery({ queryKey: ["sales"], queryFn: () => salesApi.getAll().then(r => r.data) });
  const { data: checksData } = useQuery({ queryKey: ["bouncedChecks"], queryFn: () => bouncedChecksApi.getAll().then(r => r.data) });
  const { data: workersData } = useQuery({ queryKey: ["workersExpenses"], queryFn: () => workersExpensesApi.getAll().then(r => r.data) });
  const { data: sleevesData } = useQuery({ queryKey: ["sleevesBids"], queryFn: () => sleevesBidsApi.getAll().then(r => r.data) });
  const { data: expensesData } = useQuery({ queryKey: ["expenses"], queryFn: () => expensesApi.getAll().then(r => r.data) });
  const { data: partialData } = useQuery({ queryKey: ["partialPayment"], queryFn: () => partialPaymentApi.getAll().then(r => r.data) });
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });

  const sales = filterCurrentYear(salesData);
  const checks = filterCurrentYear(checksData);
  const workers = filterCurrentYear(workersData);
  const sleeves = filterCurrentYear(sleevesData);
  const expenses = filterCurrentYear(expensesData);
  const partial = filterCurrentYear(partialData);

  const totalSales = sales.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalExpenses = expenses.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const totalWorkers = workers.reduce((s, i) => s + (i.totalAmount || 0), 0);
  const openChecks = checks.filter((c) => !c.colored).length;
  const openPartial = partial.filter((p) => !p.colored);
  const totalPartialPending = openPartial.reduce((s, i) => s + (i.totalAmount || 0), 0);

  // Monthly sales chart
  const monthlySales = MONTHS_HE.map((month, idx) => ({
    month,
    מכירות: sales
      .filter((s) => new Date(s.date).getMonth() === idx)
      .reduce((sum, s) => sum + (s.totalAmount || 0), 0),
  }));

  // Pie breakdown
  const pieData = [
    { name: "מכירות", value: totalSales },
    { name: "הוצאות עובדים", value: totalWorkers },
    { name: "הוצאות כלליות", value: totalExpenses },
    { name: "שוואדר", value: sleeves.reduce((s, i) => s + (i.totalAmount || 0), 0) },
  ].filter((d) => d.value > 0);

  const fmt = (n) => n?.toLocaleString("he-IL", { maximumFractionDigits: 0 }) + ' ₪';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">לוח בקרה</h1>
        <p className="text-gray-500 text-sm mt-1">סיכום פעילות {currentYear}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="סה״כ מכירות" value={fmt(totalSales)} icon={ShoppingCart} color="bg-purple-600" sub={`${sales.length} עסקאות`} />
        <StatCard title="שיקים חוזרים פתוחים" value={openChecks} icon={CheckSquare} color="bg-red-500" sub="טעון טיפול" />
        <StatCard title="הוצאות עובדים" value={fmt(totalWorkers)} icon={Users} color="bg-blue-500" sub={`${workers.length} רשומות`} />
        <StatCard title="הצעות שוואדר" value={sleeves.length} icon={Scissors} color="bg-yellow-500" sub={fmt(sleeves.reduce((s, i) => s + (i.totalAmount || 0), 0))} />
      </div>

      {/* Second row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="הוצאות כלליות" value={fmt(totalExpenses)} icon={TrendingDown} color="bg-orange-500" sub={`${expenses.length} הוצאות`} />
        <StatCard title="תשלום חלקי פתוח" value={fmt(totalPartialPending)} icon={Clock} color="bg-indigo-500" sub={`${openPartial.length} לקוחות`} />
        <StatCard title="רווח משוער" value={fmt(totalSales - totalExpenses - totalWorkers)} icon={TrendingUp} color="bg-green-500" sub="מכירות פחות הוצאות" />
        <StatCard title="שיקים חוזרים סה״כ" value={fmt(checks.reduce((s, i) => s + (i.totalAmount || 0), 0))} icon={AlertCircle} color="bg-rose-500" sub={`${checks.length} שיקים`} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-4">מכירות חודשיות {currentYear}</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlySales} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
              <Tooltip
                formatter={(v) => [fmt(v), "מכירות"]}
                contentStyle={{ fontFamily: "Assistant", borderRadius: 8, fontSize: 12 }}
              />
              <Bar dataKey="מכירות" fill="#7c3aed" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie chart */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-base font-semibold text-gray-700 mb-4">התפלגות הוצאות והכנסות</h2>
          {pieData.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3} dataKey="value">
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v) => fmt(v)} contentStyle={{ fontFamily: "Assistant", borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {pieData.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-600">{d.name}</span>
                    </div>
                    <span className="font-medium text-gray-700">{fmt(d.value)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-40 text-gray-400 text-sm">אין נתונים</div>
          )}
        </div>
      </div>

      {/* Tax info */}
      {taxValues && (
        <div className="bg-gradient-to-r from-purple-700 to-purple-900 rounded-2xl p-5 text-white flex items-center justify-between">
          <div>
            <p className="text-white/70 text-sm">ערכי מס נוכחיים</p>
            <p className="text-lg font-bold mt-1">מע״מ: {taxValues.maamValue}% | ניכוי במקור: {taxValues.masValue}%</p>
          </div>
          <div className="text-4xl font-bold text-white/20">%</div>
        </div>
      )}
    </div>
  );
}
