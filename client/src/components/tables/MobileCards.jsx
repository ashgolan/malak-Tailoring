import { fmt } from "../../utils/formatters";

export default function MobileCards({
    items = [],
    columns = [],
    onEdit,
    onDelete,
    onToggleColor,
    total,
    theme,
}) {
    if (items.length === 0) return (
        <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 14 }}>
            אין נתונים להצגה
        </div>
    );

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {items.map(item => (
                <div key={item._id} style={{
                    background: item.colored ? "#fef2f2" : "#fff",
                    borderRadius: 12,
                    border: item.colored ? "1px solid #fecaca" : "1px solid #e5e7eb",
                    padding: "12px 14px",
                    boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                }}>
                    {/* Top row — date + dot + actions */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                        <div style={{ display: "flex", gap: 6 }}>
                            {onEdit && (
                                <button onClick={() => onEdit(item)}
                                    style={{ padding: "5px 10px", background: "#eff6ff", border: "none", borderRadius: 6, color: "#3b82f6", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                                    ✎ עריכה
                                </button>
                            )}
                            {onDelete && (
                                <button onClick={() => { if (window.confirm("האם אתה בטוח שברצונך למחוק?")) onDelete(item._id); }}
                                    style={{ padding: "5px 10px", background: "#fef2f2", border: "none", borderRadius: 6, color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
                                    🗑 מחק
                                </button>
                            )}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            {item.date && (
                                <span style={{ fontSize: 11, color: "#9ca3af" }}>{item.date}</span>
                            )}
                            {onToggleColor && (
                                <div
                                    onClick={() => onToggleColor(item._id, { colored: !item.colored })}
                                    style={{
                                        width: 12, height: 12, borderRadius: "50%",
                                        background: item.colored ? "#ef4444" : "#e5e7eb",
                                        border: item.colored ? "2px solid #dc2626" : "2px solid #d1d5db",
                                        cursor: "pointer",
                                    }}
                                />
                            )}
                        </div>
                    </div>

                    {/* Fields grid */}
                    < div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 12px" }}>
                        {columns.filter(c => c.key !== "date").map(col => (
                            <div key={col.key} style={{ overflow: "hidden" }}>
                                <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 2 }}>{col.label}</div>
                                <div style={{
                                    fontSize: 13, fontWeight: 500,
                                    color: item.colored ? "#991b1b" : "#1f2937",
                                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                }}>
                                    {col.render
                                        ? col.render(item[col.key], item)
                                        : col.type === "boolean"
                                            ? (item[col.key] ? "✓" : "-")
                                            : col.type === "number" || col.type === "money"
                                                ? fmt(item[col.key])
                                                : (item[col.key] || "-")}
                                </div>
                            </div>
                        ))}
                    </div>
                </div >
            ))
            }

            {/* Footer total */}
            {
                total > 0 && (
                    <div style={{
                        background: theme?.primaryLight || "#f5f3ff",
                        borderRadius: 10, padding: "12px 16px",
                        display: "flex", justifyContent: "space-between", alignItems: "center",
                        border: `1px solid ${theme?.primaryBorder || "#ede9fe"}`,
                    }}>
                        <span style={{ fontSize: 13, color: "#6b7280" }}>סה״כ ({items.length} רשומות)</span>
                        <span style={{ fontSize: 16, fontWeight: 700, color: theme?.primary || "#7c3aed" }}>{fmt(total)} ₪</span>
                    </div>
                )
            }
        </div >
    );
}