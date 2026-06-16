import { fmt } from "../../utils/formatters";

export default function MobileCards({ items = [], columns = [], onEdit, onDelete, onToggleColor, total, theme }) {
  if (items.length === 0) return (
    <div className="rosh-empty">אין נתונים להצגה</div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {items.map(item => (
        <div key={item._id} className={`rosh-mobile-card${item.colored ? " colored" : ""}`}>
          {/* Top row — actions + date + dot */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ display: "flex", gap: 6 }}>
              {onEdit && (
                <button className="rosh-btn-edit" onClick={() => onEdit(item)}>✎ עריכה</button>
              )}
              {onDelete && (
                <button className="rosh-btn-delete" onClick={() => { if (window.confirm("האם אתה בטוח שברצונך למחוק?")) onDelete(item._id); }}>
                  🗑 מחק
                </button>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {item.date && (
                <span style={{ fontSize: 11, color: "var(--text-4)" }}>{item.date}</span>
              )}
              {onToggleColor && (
                <div onClick={() => onToggleColor(item._id, { colored: !item.colored })}
                  style={{ width: 12, height: 12, borderRadius: "50%", cursor: "pointer",
                    background: item.colored ? "#ef4444" : "var(--border)",
                    border: item.colored ? "2px solid #dc2626" : "2px solid var(--text-4)",
                    flexShrink: 0 }} />
              )}
            </div>
          </div>

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {columns.map(col => {
              const raw = item[col.key];
              const val = col.render ? col.render(raw, item)
                        : col.type === "money" ? (raw ? `${fmt(raw)} ₪` : "-")
                        : col.type === "boolean" ? (raw
                            ? <span style={{ color: "#16a34a", fontWeight: 600 }}>✓ מע״מ</span>
                            : <span style={{ color: "var(--text-4)" }}>ללא</span>)
                        : (raw ?? "-");

              return (
                <div key={col.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <span style={{ fontSize: 11, color: "var(--text-4)", flexShrink: 0 }}>{col.label}</span>
                  <span style={{
                    fontSize: 13, fontWeight: col.key === "clientName" || col.key === "name" ? 600 : 400,
                    color: col.type === "money" ? theme?.primary : "var(--text-1)",
                    textAlign: "left", wordBreak: "break-word"
                  }}>
                    {val}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Total */}
      {total != null && total > 0 && (
        <div style={{ background: "var(--bg-hover)", borderRadius: 10, padding: "12px 16px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          border: "1px solid var(--border)" }}>
          <span style={{ fontSize: 13, color: "var(--text-3)" }}>סה״כ ({items.length} רשומות)</span>
          <span style={{ fontSize: 16, fontWeight: 700, color: theme?.primary }}>{fmt(total)} ₪</span>
        </div>
      )}
    </div>
  );
}
