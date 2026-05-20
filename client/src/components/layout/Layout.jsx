import { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { useTheme } from "../../context/ThemeContext";
import { usersApi } from "../../api";
import toast from "react-hot-toast";
import {
  LayoutDashboard, ShoppingCart, CheckSquare, Users, Truck,
  CreditCard, Building2, Scissors, FileText, BarChart3,
  Package, UserCircle, BookOpen, Settings, LogOut,
  Menu, X, Wallet, Building, Palette, ChevronRight,
} from "lucide-react";

const navItems = [
  { path: "/",                   label: "לוח בקרה",         icon: LayoutDashboard, exact: true },
  { path: "/sales",              label: "מכירות",            icon: ShoppingCart },
  { path: "/sleeves-bids",       label: "שרוולים",           icon: Scissors },
  { path: "/bids",               label: "הצעות מחיר",        icon: FileText },
  { path: "/bounced-checks",     label: "שיקים דחויים",      icon: CheckSquare },
  { path: "/workers-expenses",   label: "הוצאות עובדים",     icon: Users },
  { path: "/waybills",           label: "תעודות משלוח",      icon: Truck },
  { path: "/partial-payment",    label: "תשלום חלקי",        icon: CreditCard },
  { path: "/institution-tax",    label: "חשבוניות למוסדות",  icon: Building2 },
  { path: "/sales-to-companies", label: "מכירות לחברות",     icon: Building },
  { path: "/expenses",           label: "הוצאות",            icon: Wallet },
  { path: "/inventories",        label: "מלאי",              icon: Package },
  { path: "/providers",          label: "ספקים",             icon: UserCircle },
  { path: "/contacts",           label: "אנשי קשר",          icon: BookOpen },
  { path: "/charts",             label: "דוחות",             icon: BarChart3 },
  { path: "/settings",           label: "הגדרות",            icon: Settings },
];

// 5 items for mobile bottom bar
const mobileNav = [
  { path: "/",           label: "בקרה",    icon: LayoutDashboard, exact: true },
  { path: "/sales",      label: "מכירות",  icon: ShoppingCart },
  { path: "/charts",     label: "דוחות",   icon: BarChart3 },
  { path: "/settings",   label: "הגדרות",  icon: Settings },
];

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  useEffect(() => {
    const fn = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return isMobile;
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768);
  const [showThemes, setShowThemes] = useState(false);
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, clearAuth } = useAuthStore();
  const { theme, themeName, setTheme, THEMES } = useTheme();

  // close sidebar on route change (mobile)
  useEffect(() => {
    if (isMobile) setSidebarOpen(false);
  }, [location.pathname, isMobile]);

  // desktop: sidebar open by default
  useEffect(() => {
    if (!isMobile) setSidebarOpen(true);
  }, [isMobile]);

  const handleLogout = async () => {
    try { await usersApi.logout(); } catch {}
    clearAuth();
    navigate("/login");
    toast.success("התנתקת בהצלחה");
  };

  return (
    <div style={{ display: "flex", height: "100dvh", background: "#f9fafb", overflow: "hidden", position: "relative" }}>

      {/* Overlay — mobile only */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 40 }} />
      )}

      {/* Sidebar */}
      <aside style={{
        position: isMobile ? "fixed" : "relative",
        right: isMobile ? (sidebarOpen ? 0 : "-100%") : 0,
        top: 0, bottom: 0,
        width: isMobile ? "75vw" : sidebarOpen ? 240 : 64,
        maxWidth: 280,
        zIndex: 50,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        boxShadow: isMobile && sidebarOpen ? "4px 0 24px rgba(0,0,0,0.3)" : "none",
        transition: isMobile ? "right 0.28s ease" : "width 0.25s ease",
        flexShrink: 0,
        overflowX: "hidden",
      }}>

        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 12px", borderBottom: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
          {(sidebarOpen || isMobile) && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, overflow: "hidden" }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#c9a84c", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Scissors size={16} color="#fff" />
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0, whiteSpace: "nowrap" }}>מתפרת רושאן</p>
                <p style={{ color: "#c9a84c", fontSize: 11, margin: 0 }}>Roshan Tailoring</p>
              </div>
            </div>
          )}
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0 }}>
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "8px 8px" }}>
          {navItems.map(({ path, label, icon: Icon, exact }) => (
            <NavLink key={path} to={path} end={exact}
              style={({ isActive }) => ({
                display: "flex", alignItems: "center", gap: 10,
                padding: "10px 10px", borderRadius: 8, marginBottom: 2,
                textDecoration: "none", position: "relative", whiteSpace: "nowrap", overflow: "hidden",
                background: isActive ? "rgba(255,255,255,0.18)" : "transparent",
                color: isActive ? "#fff" : "rgba(255,255,255,0.6)",
                transition: "background 0.15s",
              })}
            >
              {({ isActive }) => (
                <>
                  {isActive && <div style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", width: 3, height: 24, background: "#c9a84c", borderRadius: "4px 0 0 4px" }} />}
                  <Icon size={16} style={{ flexShrink: 0, color: isActive ? "#c9a84c" : "inherit" }} />
                  {(sidebarOpen || isMobile) && <span style={{ fontSize: 13, fontWeight: 500 }}>{label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div style={{ padding: "8px", borderTop: "1px solid rgba(255,255,255,0.1)", flexShrink: 0 }}>
          {/* Theme */}
          <button onClick={() => setShowThemes(!showThemes)}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 8, background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden" }}>
            <Palette size={16} style={{ flexShrink: 0 }} />
            {(sidebarOpen || isMobile) && <span style={{ fontSize: 13 }}>ערכת צבעים</span>}
          </button>

          {showThemes && (sidebarOpen || isMobile) && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, padding: "8px", background: "rgba(255,255,255,0.08)", borderRadius: 8, marginBottom: 8 }}>
              {Object.entries(THEMES).map(([key, t]) => (
                <button key={key} onClick={() => { setTheme(key); setShowThemes(false); }}
                  style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "6px 4px", borderRadius: 8, border: `2px solid ${themeName === key ? t.primary : "rgba(255,255,255,0.2)"}`, background: "transparent", cursor: "pointer" }}>
                  <span style={{ width: 14, height: 14, borderRadius: "50%", background: t.primary, display: "block" }} />
                  <span style={{ color: "rgba(255,255,255,0.7)", fontSize: 10 }}>{t.name}</span>
                </button>
              ))}
            </div>
          )}

          {/* User */}
          {(sidebarOpen || isMobile) && user && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", marginBottom: 4 }}>
              <div style={{ width: 30, height: 30, borderRadius: "50%", background: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>{user.email?.[0]?.toUpperCase()}</span>
              </div>
              <p style={{ color: "#fff", fontSize: 11, margin: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.email}</p>
            </div>
          )}

          <button onClick={handleLogout}
            style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "9px 10px", borderRadius: 8, background: "transparent", border: "none", color: "rgba(255,255,255,0.6)", cursor: "pointer", whiteSpace: "nowrap", overflow: "hidden" }}>
            <LogOut size={16} style={{ flexShrink: 0 }} />
            {(sidebarOpen || isMobile) && <span style={{ fontSize: 13 }}>התנתקות</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Top bar */}
        <header style={{ background: "#fff", borderBottom: "1px solid #f0f0f0", padding: isMobile ? "10px 14px" : "10px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)}
                style={{ background: "transparent", border: "none", cursor: "pointer", padding: 4, color: "#6b7280" }}>
                <Menu size={22} />
              </button>
            )}
            <div style={{ display: "flex", alignItems: "center", gap: 6, color: "#6b7280", fontSize: 13 }}>
              <ChevronRight size={14} />
              <span style={{ fontWeight: 600, color: "#374151" }}>מתפרת רושאן</span>
            </div>
          </div>
          <span style={{ fontSize: 11, color: "#9ca3af" }}>
            {new Date().toLocaleDateString("he-IL", { weekday: "short", month: "short", day: "numeric" })}
          </span>
        </header>

        {/* Page content */}
        <div style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: isMobile ? "12px" : "24px", paddingBottom: isMobile ? "80px" : "24px" }}>
          <Outlet />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
          background: "#fff", borderTop: "1px solid #e5e7eb",
          display: "flex", alignItems: "stretch",
          paddingBottom: "env(safe-area-inset-bottom)",
          boxShadow: "0 -4px 16px rgba(0,0,0,0.08)",
        }}>
          {mobileNav.map(({ path, label, icon: Icon, exact }) => (
            <NavLink key={path} to={path} end={exact} style={{ flex: 1, textDecoration: "none" }}>
              {({ isActive }) => (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "8px 4px", gap: 3 }}>
                  <Icon size={20} color={isActive ? theme.primary : "#9ca3af"} />
                  <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? theme.primary : "#9ca3af" }}>{label}</span>
                  {isActive && <div style={{ width: 20, height: 2, borderRadius: 2, background: theme.primary, marginTop: 1 }} />}
                </div>
              )}
            </NavLink>
          ))}
          {/* Menu button — opens full sidebar */}
          <button onClick={() => setSidebarOpen(true)}
            style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", padding: "8px 4px" }}>
            <Menu size={20} color="#9ca3af" />
            <span style={{ fontSize: 10, color: "#9ca3af" }}>תפריט</span>
          </button>
        </nav>
      )}
    </div>
  );
}
