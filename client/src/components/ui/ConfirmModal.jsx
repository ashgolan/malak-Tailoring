import { useTheme } from "../../context/ThemeContext";

export default function ConfirmModal({ isOpen, onConfirm, onCancel, message = "האם אתה בטוח שברצונך למחוק?" }) {
  const { theme } = useTheme();
  if (!isOpen) return null;

  return (
    <div onClick={onCancel} style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000, padding: 16
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", borderRadius: 16, padding: 28,
        width: "100%", maxWidth: 360, boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        direction: "rtl", textAlign: "center"
      }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🗑️</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: "#1f2937", marginBottom: 8 }}>
          אישור מחיקה
        </div>
        <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 24 }}>
          {message}
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={onCancel} style={{
            flex: 1, padding: "10px", border: "1px solid #e5e7eb",
            borderRadius: 8, background: "#fff", fontSize: 13,
            fontWeight: 500, color: "#6b7280", cursor: "pointer", fontFamily: "inherit"
          }}>
            ביטול
          </button>
          <button onClick={onConfirm} style={{
            flex: 1, padding: "10px", border: "none",
            borderRadius: 8, background: "#ef4444", fontSize: 13,
            fontWeight: 600, color: "#fff", cursor: "pointer", fontFamily: "inherit"
          }}>
            מחק
          </button>
        </div>
      </div>
    </div>
  );
}
