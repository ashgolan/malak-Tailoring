import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../context/ThemeContext";
import { usersApi } from "../../api";
import toast from "react-hot-toast";
import {
  LayoutDashboard, ShoppingCart, CheckSquare, Users, Truck,
  CreditCard, Building2, Receipt, Scissors, FileText, BarChart3,
  Package, UserCircle, BookOpen, Calendar, Settings, LogOut,
  Menu, X, ChevronRight, Wallet, Building, Palette,
} from "lucide-react";

const navItems = [
  { path: "/", label: "לוח בקרה", icon: LayoutDashboard, exact: true },
  { path: "/sales", label: "מכירות", icon: ShoppingCart },
  { path: "/sleeves-bids", label: "שרוולים", icon: Scissors },
  { path: "/bids", label: "הצעות מחיר", icon: FileText },
  { path: "/bounced-checks", label: "שיקים דחויים", icon: CheckSquare },
  { path: "/workers-expenses", label: "הוצאות עובדים", icon: Users },
  { path: "/waybills", label: "תעודות משלוח", icon: Truck },
  { path: "/partial-payment", label: "תשלום חלקי", icon: CreditCard },
  { path: "/institution-tax", label: "מס מוסדות", icon: Building2 },
  { path: "/sales-to-companies", label: "מכירות לחברות", icon: Building },
  { path: "/expenses", label: "הוצאות", icon: Wallet },
  { path: "/companies", label: "חברות", icon: Building2 },
  { path: "/inventories", label: "מלאי", icon: Package },
  { path: "/providers", label: "ספקים", icon: UserCircle },
  { path: "/contacts", label: "אנשי קשר", icon: BookOpen },
  { path: "/events", label: "אירועים", icon: Calendar },
  { path: "/charts", label: "דוחות וגרפים", icon: BarChart3 },
  { path: "/settings", label: "הגדרות", icon: Settings },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showThemes, setShowThemes] = useState(false);
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { theme, themeName, setTheme, THEMES } = useTheme();

  const handleLogout = async () => {
    try { await usersApi.logout(); } catch {}
    clearAuth();
    navigate("/login");
    toast.success("התנתקת בהצלחה");
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`${sidebarOpen ? "w-64" : "w-16"} transition-all duration-300 flex-shrink-0 roshan-gradient flex flex-col shadow-2xl z-20`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg roshan-gold-bg flex items-center justify-center">
                <Scissors className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm leading-none">מתפרת רושאן</p>
                <p className="roshan-gold text-xs">Roshan Tailoring</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-white/70 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
          {navItems.map(({ path, label, icon: Icon, exact }) => (
            <NavLink
              key={path}
              to={path}
              end={exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 group relative
                ${isActive
                  ? "bg-white/20 text-white shadow-sm"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
                }`
              }
              title={!sidebarOpen ? label : ""}
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-6 roshan-gold-bg rounded-l-full" />
                  )}
                  <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? "roshan-gold" : ""}`} />
                  {sidebarOpen && (
                    <span className="text-sm font-medium">{label}</span>
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User & Logout */}
        <div className="p-3 border-t border-white/10">
          {/* Theme switcher */}
          <div className="mb-2">
            <button
              onClick={() => setShowThemes(!showThemes)}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              <Palette className="w-4 h-4 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm">ערכת צבעים</span>}
            </button>
            {showThemes && sidebarOpen && (
              <div className="mt-1 p-2 bg-white/10 rounded-lg">
                <div className="grid grid-cols-3 gap-1.5">
                  {Object.entries(THEMES).map(([key, t]) => (
                    <button
                      key={key}
                      onClick={() => { setTheme(key); setShowThemes(false); }}
                      title={t.name}
                      style={{ background: themeName === key ? t.primary : "transparent", border: `2px solid ${themeName === key ? t.primary : "rgba(255,255,255,0.2)"}` }}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-lg cursor-pointer transition-all"
                    >
                      <span style={{ width: 16, height: 16, borderRadius: "50%", background: t.primary, display: "block" }} />
                      <span className="text-white/70 text-xs">{t.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {sidebarOpen && user && (
            <div className="flex items-center gap-2 px-2 py-2 mb-2">
              <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: theme.primary }}>
                <span className="text-white text-xs font-bold">{user.email?.[0]?.toUpperCase()}</span>
              </div>
              <div className="overflow-hidden">
                <p className="text-white text-xs font-medium truncate">{user.email}</p>
                <p className="text-white/50 text-xs">{user.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-white/60 hover:bg-red-500/20 hover:text-red-300 transition-all duration-150"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="text-sm">התנתקות</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3 flex items-center justify-between shadow-sm flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <ChevronRight className="w-4 h-4" />
            <span className="font-medium text-gray-700">מתפרת רושאן</span>
          </div>
          <div className="text-sm text-gray-400">
            {new Date().toLocaleDateString("he-IL", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 overflow-auto p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
