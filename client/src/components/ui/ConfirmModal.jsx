import { useTheme } from "../../context/ThemeContext";

export default function ConfirmModal({ isOpen, onConfirm, onCancel, message = "האם אתה בטוח שברצונך למחוק?" }) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <div className="rosh-overlay" onClick={onCancel}>
      <div className="rosh-modal" style={{ width: "100%", maxWidth: 360, padding: 28, textAlign: "center" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-1)", marginBottom: 8 }}>אישור מחיקה</div>
        <div style={{ fontSize: 13, color: "var(--text-3)", marginBottom: 24 }}>{message}</div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} className="rosh-btn-cancel">ביטול</button>
          <button onClick={onConfirm}
            style={{ flex: 1, padding: 10, border: "none", borderRadius: 8, background: "#ef4444", fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit" }}>
            מחק
          </button>
        </div>
      </div>
    </div>
  );
}
