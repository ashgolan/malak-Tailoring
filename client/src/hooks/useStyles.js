/**
 * useStyles.js
 * ─────────────
 * Hook مركزي يُرجع كل الـ style objects للصفحات
 * بدل inline styles hardcoded — يستخدم CSS variables
 *
 * الاستخدام:
 *   import { useStyles } from "../hooks/useStyles";
 *   const S = useStyles(theme);
 *
 *   // في الـ JSX:
 *   <div style={S.card}>...</div>
 *   <input style={S.input} />
 *   <div style={S.row(item.colored, idx)}>...</div>
 */

import { useTheme } from "../context/ThemeContext";

export function useStyles(theme) {
  // ─── Layout ────────────────────────────────────────────────
  const card = {
    background: "var(--bg-card)",
    borderRadius: 16,
    border: "1px solid var(--border-light)",
    overflow: "hidden",
    boxShadow: "var(--shadow-card)",
  };

  const cardPad = { ...card, padding: "16px 20px" };

  const statBar = {
    background: "var(--bg-stat)",
    borderRadius: 12,
    border: "1px solid var(--border)",
    padding: "16px 24px",
    display: "flex", gap: 32, alignItems: "center", flexWrap: "wrap",
  };

  // ─── Text ──────────────────────────────────────────────────
  const t1 = { color: "var(--text-1)" };
  const t2 = { color: "var(--text-2)" };
  const t3 = { color: "var(--text-3)" };
  const t4 = { color: "var(--text-4)" };

  // ─── Form ──────────────────────────────────────────────────
  const label = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: "var(--text-3)", marginBottom: 6,
  };

  const input = {
    width: "100%", padding: "9px 12px",
    background: "var(--bg-input)",
    border: "1px solid var(--border)",
    borderRadius: 8, fontSize: 13, outline: "none",
    boxSizing: "border-box", fontFamily: "inherit",
    color: "var(--text-1)", transition: "border-color 0.15s",
  };

  const inputLg = {
    ...input, padding: "10px 14px",
    fontSize: 16, borderRadius: 10,
  };

  const select = { ...input, cursor: "pointer" };

  const textarea = {
    ...input, resize: "vertical", minHeight: 150,
    lineHeight: 1.7, padding: "12px 14px",
  };

  // ─── Table ─────────────────────────────────────────────────
  const ROW_BASE = {
    display: "flex", flexDirection: "row-reverse",
    alignItems: "center", width: "100%",
    borderBottom: "1px solid var(--border-light)",
    transition: "background 0.1s",
  };

  const row = (colored, idx) => ({
    ...ROW_BASE,
    background: colored
      ? "var(--colored-bg)"
      : idx % 2 === 0 ? "var(--bg-card)" : "var(--bg-card-alt)",
    borderColor: colored ? "var(--colored-border)" : "var(--border-light)",
  });

  const cell = (w, extra = {}) => ({
    width: w, flexBasis: w, flexGrow: 1, flexShrink: 1,
    padding: "10px 12px", fontSize: 13,
    textAlign: "right", overflow: "hidden",
    textOverflow: "ellipsis", whiteSpace: "nowrap",
    color: "var(--text-1)",
    ...extra,
  });

  // ─── Buttons ───────────────────────────────────────────────
  const btnSave = {
    padding: "3px 8px", background: "rgba(22,163,74,0.12)",
    border: "none", borderRadius: 6, color: "#16a34a",
    cursor: "pointer", fontSize: 12,
  };
  const btnDiscard = {
    padding: "3px 8px", background: "var(--bg-tag)",
    border: "none", borderRadius: 6, color: "var(--text-3)",
    cursor: "pointer", fontSize: 12,
  };
  const btnEdit = {
    padding: "3px 8px", background: "rgba(59,130,246,0.1)",
    border: "none", borderRadius: 6, color: "#3b82f6",
    cursor: "pointer", fontSize: 12,
  };
  const btnDelete = {
    padding: "3px 8px", background: "rgba(239,68,68,0.1)",
    border: "none", borderRadius: 6, color: "#ef4444",
    cursor: "pointer", fontSize: 12,
  };
  const btnCancel = {
    flex: 1, padding: 10,
    border: "1px solid var(--btn-cancel-bdr)",
    borderRadius: 8, background: "var(--btn-cancel-bg)",
    fontSize: 13, fontWeight: 500,
    color: "var(--btn-cancel-text)",
    cursor: "pointer", fontFamily: "inherit",
  };
  const btnSubmit = (thm) => ({
    flex: 2, padding: 10, border: "none",
    borderRadius: 8, background: thm?.gradient,
    fontSize: 14, fontWeight: 600,
    color: "#fff", cursor: "pointer", fontFamily: "inherit",
  });

  // ─── Toggle buttons (שנה נוכחית / כל הזמנים) ──────────────
  const toggleBtn = (active, thm) => ({
    fontSize: 12, padding: "6px 12px",
    borderRadius: 8, cursor: "pointer", fontFamily: "inherit",
    border: `1px solid ${active ? thm?.accent : "var(--border)"}`,
    background: active ? thm?.primaryLight : "var(--bg-tag)",
    color: active ? thm?.primary : "var(--text-3)",
    transition: "all 0.15s",
  });

  // ─── Modals ────────────────────────────────────────────────
  const overlay = {
    position: "fixed", inset: 0,
    background: "var(--bg-overlay)",
    display: "flex", alignItems: "center", justifyContent: "center",
    zIndex: 1000, padding: 16, backdropFilter: "blur(2px)",
  };
  const modal = {
    background: "var(--bg-modal)",
    borderRadius: 16, width: "100%",
    border: "1px solid var(--border)",
    boxShadow: "var(--shadow-modal)", direction: "rtl",
  };

  // ─── Misc ──────────────────────────────────────────────────
  const divider = {
    width: 1, background: "var(--border)", alignSelf: "stretch",
  };
  const empty = {
    textAlign: "center", padding: "56px 20px", color: "var(--text-4)",
  };
  const dot = (colored) => ({
    width: 12, height: 12, borderRadius: "50%", cursor: "pointer",
    background: colored ? "#ef4444" : "var(--border)",
    border: `2px solid ${colored ? "#dc2626" : "var(--text-4)"}`,
    flexShrink: 0,
  });

  return {
    // layout
    card, cardPad, statBar,
    // text
    t1, t2, t3, t4,
    // form
    label, input, inputLg, select, textarea,
    // table
    row, cell,
    // buttons
    btnSave, btnDiscard, btnEdit, btnDelete, btnCancel, btnSubmit,
    // toggle
    toggleBtn,
    // modal
    overlay, modal,
    // misc
    divider, empty, dot,
  };
}

// ─── Focus/Blur helpers (اعطها كـ onFocus/onBlur) ────────────
export const fo = (e, color) => { e.target.style.borderColor = color || "var(--border-focus)"; };
export const bl = (e) => { e.target.style.borderColor = "var(--border)"; };
