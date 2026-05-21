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
  Menu, X, Wallet, Building, Palette, Sun, Moon,
} from "lucide-react";

// ── Dark mode hook (مدمج مباشرة) ────────────────────────────
function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const s = localStorage.getItem("roshan-dark");
    if (s !== null) return s === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("roshan-dark", isDark);
  }, [isDark]);
  return { isDark, toggle: () => setIsDark(d => !d) };
}

// ── Breakpoint hook ──────────────────────────────────────────
function useBreakpoint() {
  const get = () => window.innerWidth < 768 ? "mobile" : window.innerWidth < 1024 ? "tablet" : "desktop";
  const [bp, setBp] = useState(get);
  useEffect(() => {
    const fn = () => setBp(get());
    window.addEventListener("resize", fn);
    return () => window.removeEventListener("resize", fn);
  }, []);
  return bp;
}

// ── Nav items ────────────────────────────────────────────────
const navItems = [
  { path: "/", label: "לוח בקרה", icon: LayoutDashboard, exact: true },
  { path: "/sales", label: "מכירות", icon: ShoppingCart },
  { path: "/sleeves-bids", label: "שרוולים", icon: Scissors },
  { path: "/bids", label: "הצעות מחיר", icon: FileText },
  { path: "/bounced-checks", label: "שיקים דחויים", icon: CheckSquare },
  { path: "/workers-expenses", label: "הוצאות עובדים", icon: Users },
  { path: "/waybills", label: "תעודות משלוח", icon: Truck },
  { path: "/partial-payment", label: "תשלום חלקי", icon: CreditCard },
  { path: "/institution-tax", label: "חשבוניות למוסדות", icon: Building2 },
  { path: "/sales-to-companies", label: "מכירות לחברות", icon: Building },
  { path: "/expenses", label: "הוצאות", icon: Wallet },
  { path: "/inventories", label: "מלאי", icon: Package },
  { path: "/providers", label: "ספקים", icon: UserCircle },
  { path: "/contacts", label: "אנשי קשר", icon: BookOpen },
  { path: "/charts", label: "דוחות", icon: BarChart3 },
  { path: "/settings", label: "הגדרות", icon: Settings },
];

const mobileNav = [
  { path: "/", label: "בקרה", icon: LayoutDashboard, exact: true },
  { path: "/sales", label: "מכירות", icon: ShoppingCart },
  { path: "/charts", label: "דוחות", icon: BarChart3 },
  { path: "/settings", label: "הגדרות", icon: Settings },
];

// ── CSS injected once ────────────────────────────────────────
const GLOBAL_CSS = `
  :root {
    --page-bg:    #f4f6fa;
    --card-bg:    #ffffff;
    --border:     #e8eaf0;
    --text-1:     #111827;
    --text-2:     #4b5563;
    --text-3:     #9ca3af;
    --bottom-bg:  #ffffff;
    --bottom-border: #e8eaf0;
    --input-bg:   #ffffff;
  }
[data-theme="dark"] {
  --page-bg:        #111318;
  --bg-card:        #1a1d23;
  --bg-card-alt:    #1e2128;
  --bg-input:       #1e2128;
  --bg-hover:       #22262e;
  --bg-modal:       #1a1d23;
  --bg-overlay:     rgba(0,0,0,0.65);
  --bg-tag:         #1e2128;
  --bg-stat:        #1a1d23;

  --text-1:         #c8cdd6;
  --text-2:         #8b919e;
  --text-3:         #6b7280;
  --text-4:         #4b5262;

  --border:         #252930;
  --border-light:   #1e2128;
  --border-focus:   #5b6fd4;

  --shadow-card:    0 1px 4px rgba(0,0,0,0.35);
  --shadow-modal:   0 20px 60px rgba(0,0,0,0.55);

  --btn-cancel-bg:  #1e2128;
  --btn-cancel-text:#8b919e;
  --btn-cancel-bdr: #252930;

  --colored-bg:     rgba(239,68,68,0.08);
  --colored-border: rgba(239,68,68,0.2);
  --colored-text:   #e8918a;

  --bottom-bg:      #151820;
}
  * { box-sizing: border-box; }
  body { background: var(--page-bg) !important; color: var(--text-1); transition: background 0.2s, color 0.2s; }
  #root { background: var(--page-bg); }

  /* Dark mode — main content area */
  [data-theme="dark"] main { background: var(--page-bg) !important; }

  /* Tables & cards in dark */
  [data-theme="dark"] .rosh-card {
    background: var(--card-bg) !important;
    border-color: var(--border) !important;
    color: var(--text-1) !important;
  }
  [data-theme="dark"] .rosh-input {
    background: var(--input-bg) !important;
    border-color: var(--border) !important;
    color: var(--text-1) !important;
  }

  /* Scrollbar */
  ::-webkit-scrollbar { width: 5px; height: 5px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 99px; }

  /* Nav tooltip on icon-only sidebar */
  .nav-tip { position: relative; }
  .nav-tip:hover .tip-label {
    opacity: 1; pointer-events: auto; transform: translateX(-6px);
  }
  .tip-label {
    position: absolute;
    right: calc(100% + 10px);
    top: 50%; transform: translateY(-50%) translateX(4px);
    background: rgba(0,0,0,0.85);
    color: #fff;
    font-size: 12px;
    white-space: nowrap;
    padding: 4px 10px;
    border-radius: 6px;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.15s, transform 0.15s;
    z-index: 999;
  }

@media (max-width: 767px) {
    input, select, textarea { font-size: 16px !important; }
    button { min-height: 40px; }
  }

  [data-theme="dark"] main div[style*="linear-gradient"] {
    filter: brightness(0.75) saturate(0.85);
  }
`;

export default function Layout() {
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const isTablet = bp === "tablet";

  const [sidebarOpen, setSidebarOpen] = useState(!isMobile && !isTablet);
  const [showThemes, setShowThemes] = useState(false);
  const { isDark, toggle: toggleDark } = useDarkMode();

  const navigate = useNavigate();
  const location = useLocation();
  const { clearAuth } = useAuthStore();
  const { theme, themeName, setTheme, THEMES } = useTheme();

  // Close drawer on nav (mobile)
  useEffect(() => { if (isMobile) setSidebarOpen(false); }, [location.pathname]);

  // Sync open state on breakpoint change
  useEffect(() => {
    if (!isMobile && !isTablet) setSidebarOpen(true);
    else setSidebarOpen(false);
  }, [bp]);

  const handleLogout = async () => {
    try { await usersApi.logout(); } catch { }
    clearAuth();
    navigate("/login");
    toast.success("התנתקת בהצלחה");
  };

  // Sidebar display rules
  const sidebarW = isMobile ? "78vw" : isTablet ? 60 : sidebarOpen ? 244 : 60;
  const showLabel = isMobile || (!isTablet && sidebarOpen);

  // ── Colors ──────────────────────────────────────────────────
  const GOLD = "#c9a84c";
  const SB_BG = isDark
    ? "linear-gradient(180deg,#111111 0%,#0d0d0d 100%)"
    : "linear-gradient(180deg,#111827 0%,#0f172a 100%)";

  const mainBg = isDark ? "#0d0d0d" : "#f4f6fa";
  const bottomNavBg = isDark ? "#111111" : "#ffffff";
  const bottomBorder = isDark ? "#1e1e1e" : "#e8eaf0";
  const mobileTopBg = isDark ? "#111111" : "#ffffff";
  const mobileTopBdr = isDark ? "#1e1e1e" : "#e8eaf0";

  return (
    <>
      {/* Inject global CSS once */}
      <style>{GLOBAL_CSS}</style>

      <div style={{ display: "flex", height: "100dvh", overflow: "hidden", background: mainBg }}>

        {/* ── Overlay (mobile drawer) ──────────────────────── */}
        {isMobile && sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 40, backdropFilter: "blur(2px)" }}
          />
        )}

        {/* ════════════════════════════════════════════════════
            SIDEBAR
        ════════════════════════════════════════════════════ */}
        <aside style={{
          position: isMobile ? "fixed" : "relative",
          right: isMobile ? (sidebarOpen ? 0 : "-100%") : 0,
          top: 0, bottom: 0,
          width: sidebarW,
          maxWidth: 300,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          background: SB_BG,
          borderLeft: `1px solid rgba(255,255,255,0.06)`,
          transition: isMobile ? "right 0.26s ease" : "width 0.22s ease",
          flexShrink: 0,
          overflowX: "hidden",
        }}>

          {/* ── Logo row ──────────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "center",
            justifyContent: showLabel ? "space-between" : "center",
            padding: showLabel ? "16px 14px" : "16px 0",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
            flexShrink: 0, gap: 8,
          }}>
            {showLabel && (
              <div style={{ display: "flex", alignItems: "center", gap: 9, overflow: "hidden" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Scissors size={16} color="#fff" />
                </div>
                <div style={{ overflow: "hidden" }}>
                  <p style={{ color: "#fff", fontWeight: 700, fontSize: 13, margin: 0, whiteSpace: "nowrap" }}>מתפרת רושאן</p>
                  <p style={{ color: GOLD, fontSize: 10, margin: 0, opacity: 0.9 }}>Roshan Tailoring</p>
                </div>
              </div>
            )}
            {!showLabel && (
              <div style={{ width: 34, height: 34, borderRadius: 9, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Scissors size={16} color="#fff" />
              </div>
            )}
            {!isTablet && (
              <button
                onClick={() => setSidebarOpen(o => !o)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.45)", cursor: "pointer", padding: 4, borderRadius: 6, flexShrink: 0, display: "flex" }}
              >
                {sidebarOpen || isMobile ? <X size={17} /> : <Menu size={17} />}
              </button>
            )}
          </div>

          {/* ── Nav links ─────────────────────────────────── */}
          <nav style={{ flex: 1, overflowY: "auto", overflowX: "hidden", padding: "6px 6px" }}>
            {navItems.map(({ path, label, icon: Icon, exact }) => (
              <NavLink
                key={path} to={path} end={exact}
                className="nav-tip"
                style={({ isActive }) => ({
                  display: "flex",
                  alignItems: "center",
                  justifyContent: showLabel ? "flex-start" : "center",
                  gap: 10,
                  padding: showLabel ? "9px 11px" : "11px 0",
                  borderRadius: 8,
                  marginBottom: 1,
                  textDecoration: "none",
                  position: "relative",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  background: isActive ? "rgba(201,168,76,0.13)" : "transparent",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.48)",
                  transition: "background 0.12s, color 0.12s",
                })}
              >
                {({ isActive }) => (
                  <>
                    {/* Gold accent bar */}
                    {isActive && (
                      <div style={{
                        position: "absolute", right: 0,
                        top: "50%", transform: "translateY(-50%)",
                        width: 3, height: 22, background: GOLD,
                        borderRadius: "4px 0 0 4px",
                      }} />
                    )}
                    <Icon
                      size={16}
                      style={{ flexShrink: 0, color: isActive ? GOLD : "inherit", transition: "color 0.12s" }}
                    />
                    {showLabel && (
                      <span style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{label}</span>
                    )}
                    {/* Tooltip for icon-only */}
                    {!showLabel && <span className="tip-label">{label}</span>}
                  </>
                )}
              </NavLink>
            ))}
          </nav>

          {/* ── Bottom controls ───────────────────────────── */}
          <div style={{ padding: "6px", borderTop: "1px solid rgba(255,255,255,0.07)", flexShrink: 0 }}>

            {/* Dark mode toggle */}
            <button
              onClick={toggleDark}
              title={!showLabel ? (isDark ? "מצב יום" : "מצב לילה") : undefined}
              style={{
                display: "flex", alignItems: "center",
                justifyContent: showLabel ? "flex-start" : "center",
                gap: 10, width: "100%",
                padding: showLabel ? "9px 11px" : "11px 0",
                borderRadius: 8, background: "transparent", border: "none",
                color: "rgba(255,255,255,0.48)", cursor: "pointer",
              }}
            >
              {isDark
                ? <Sun size={15} style={{ flexShrink: 0, color: GOLD }} />
                : <Moon size={15} style={{ flexShrink: 0 }} />
              }
              {showLabel && (
                <span style={{ fontSize: 13, color: isDark ? GOLD : "inherit" }}>
                  {isDark ? "מצב יום" : "מצב לילה"}
                </span>
              )}
            </button>

            {/* Theme picker */}
            <button
              onClick={() => setShowThemes(s => !s)}
              title={!showLabel ? "ערכת צבעים" : undefined}
              style={{
                display: "flex", alignItems: "center",
                justifyContent: showLabel ? "flex-start" : "center",
                gap: 10, width: "100%",
                padding: showLabel ? "9px 11px" : "11px 0",
                borderRadius: 8, background: "transparent", border: "none",
                color: "rgba(255,255,255,0.48)", cursor: "pointer",
              }}
            >
              <Palette size={15} style={{ flexShrink: 0 }} />
              {showLabel && <span style={{ fontSize: 13 }}>ערכת צבעים</span>}
            </button>

            {showThemes && showLabel && (
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 5,
                padding: "8px", background: "rgba(255,255,255,0.05)",
                borderRadius: 8, marginBottom: 4,
              }}>
                {Object.entries(THEMES).map(([key, t]) => (
                  <button
                    key={key}
                    onClick={() => { setTheme(key); setShowThemes(false); }}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                      padding: "5px 3px", borderRadius: 7, cursor: "pointer",
                      border: `2px solid ${themeName === key ? GOLD : "transparent"}`,
                      background: "transparent",
                    }}
                  >
                    <div style={{ width: 18, height: 18, borderRadius: "50%", background: t.primary }} />
                    <span style={{ fontSize: 9, color: themeName === key ? GOLD : "rgba(255,255,255,0.4)" }}>
                      {t.name}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Logout */}
            <button
              onClick={handleLogout}
              title={!showLabel ? "התנתק" : undefined}
              style={{
                display: "flex", alignItems: "center",
                justifyContent: showLabel ? "flex-start" : "center",
                gap: 10, width: "100%",
                padding: showLabel ? "9px 11px" : "11px 0",
                borderRadius: 8, background: "transparent", border: "none",
                color: "rgba(255,255,255,0.38)", cursor: "pointer",
              }}
            >
              <LogOut size={15} style={{ flexShrink: 0 }} />
              {showLabel && <span style={{ fontSize: 13 }}>התנתק</span>}
            </button>
          </div>
        </aside>

        {/* ════════════════════════════════════════════════════
            MAIN CONTENT
        ════════════════════════════════════════════════════ */}
        <main style={{
          flex: 1, overflowY: "auto", overflowX: "hidden",
          display: "flex", flexDirection: "column",
          minWidth: 0, background: mainBg,
        }}>

          {/* Mobile top bar */}
          {isMobile && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "11px 14px", flexShrink: 0,
              background: mobileTopBg,
              borderBottom: `1px solid ${mobileTopBdr}`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: GOLD, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Scissors size={13} color="#fff" />
                </div>
                <span style={{ fontWeight: 700, fontSize: 14, color: isDark ? "#e8e6e0" : "#111827" }}>
                  מתפרת רושאן
                </span>
              </div>
              <div style={{ display: "flex", gap: 4 }}>
                <button
                  onClick={toggleDark}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", color: isDark ? GOLD : "#6b7280" }}
                >
                  {isDark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <button
                  onClick={() => setSidebarOpen(true)}
                  style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 6, display: "flex", color: isDark ? "#e8e6e0" : "#374151" }}
                >
                  <Menu size={21} />
                </button>
              </div>
            </div>
          )}

          {/* Page */}
          <div style={{
            flex: 1,
            padding: isMobile ? "12px" : isTablet ? "18px 20px" : "22px 28px",
            paddingBottom: isMobile ? "80px" : "22px",
            boxSizing: "border-box",
          }}>
            <Outlet />
          </div>
        </main>

        {/* ════════════════════════════════════════════════════
            MOBILE BOTTOM NAV
        ════════════════════════════════════════════════════ */}
        {isMobile && (
          <nav style={{
            position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 30,
            background: bottomNavBg,
            borderTop: `1px solid ${bottomBorder}`,
            display: "flex", alignItems: "stretch",
            paddingBottom: "env(safe-area-inset-bottom)",
          }}>
            {mobileNav.map(({ path, label, icon: Icon, exact }) => (
              <NavLink key={path} to={path} end={exact} style={{ flex: 1, textDecoration: "none" }}>
                {({ isActive }) => (
                  <div style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    justifyContent: "center", padding: "8px 4px", gap: 3,
                  }}>
                    <Icon size={19} color={isActive ? theme.primary : (isDark ? "#555" : "#9ca3af")} />
                    <span style={{ fontSize: 10, fontWeight: isActive ? 600 : 400, color: isActive ? theme.primary : (isDark ? "#555" : "#9ca3af") }}>
                      {label}
                    </span>
                    {isActive && (
                      <div style={{ width: 18, height: 2, borderRadius: 2, background: theme.primary }} />
                    )}
                  </div>
                )}
              </NavLink>
            ))}
            <button
              onClick={() => setSidebarOpen(true)}
              style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 3, background: "transparent", border: "none", cursor: "pointer", padding: "8px 4px" }}
            >
              <Menu size={19} color={isDark ? "#555" : "#9ca3af"} />
              <span style={{ fontSize: 10, color: isDark ? "#555" : "#9ca3af" }}>תפריט</span>
            </button>
          </nav>
        )}
      </div>
    </>
  );
}
