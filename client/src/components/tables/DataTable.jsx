import { useState, useMemo } from "react";
import { fmt } from "../../utils/formatters";
import ConfirmModal from "../ui/ConfirmModal";

export default function DataTable({
  title, data = [], columns = [], onAdd, onEdit, onDelete, onToggleColor,
  loading, filterYear = true, extraActions, searchFields = ["clientName", "name"],
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [confirmId, setConfirmId] = useState(null);
  const currentYear = new Date().getFullYear();

  const filtered = useMemo(() => {
    let result = [...(data || [])];
    if (filterYear && !showAll) {
      result = result.filter((item) => {
        if (!item.date) return item.colored;
        return new Date(item.date).getFullYear() === currentYear || item.colored;
      });
    }
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((f) => String(item[f] || "").toLowerCase().includes(s))
      );
    }
    result.sort((a, b) => {
      let av = a[sortKey], bv = b[sortKey];
      if (typeof av === "string") av = av.toLowerCase();
      if (typeof bv === "string") bv = bv.toLowerCase();
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return result;
  }, [data, search, sortKey, sortDir, showAll, filterYear, currentYear, searchFields]);

  const total = useMemo(() =>
    filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0), [filtered]);

  const handleSort = (key) => {
    if (sortKey === key) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortKey(key); setSortDir("asc"); }
  };
  const startEdit = (item) => { setEditingId(item._id); setEditValues({ ...item }); };
  const cancelEdit = () => { setEditingId(null); setEditValues({}); };
  const saveEdit = () => { if (onEdit) onEdit(editingId, editValues); setEditingId(null); setEditValues({}); };

  const ROW = { display: "flex", flexDirection: "row-reverse", alignItems: "center", width: "100%", borderBottom: "1px solid #f0f0f0" };
  const CELL = (w, extra = {}) => ({ width: w, minWidth: 0, padding: "8px 6px", fontSize: 13, textAlign: "right", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flexShrink: 1, flexGrow: 1, flexBasis: w, ...extra });
  const HEAD = (w) => ({ ...CELL(w), fontWeight: 700, color: "#4c1d95", background: "transparent", border: "none", borderBottom: "2px solid #7c3aed", cursor: "pointer", textAlign: "right" });

  if (loading) return (
    <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
      <div style={{ width: 32, height: 32, border: "4px solid #e9d5ff", borderTopColor: "#7c3aed", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  const CardItem = ({ item }) => (
    <div style={{
      background: item.colored ? "#fef2f2" : "#fff",
      borderRadius: 12,
      border: item.colored ? "1px solid #fecaca" : "1px solid #e5e7eb",
      padding: "12px 14px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    }}>
      {/* Card top — actions + date + dot */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {onEdit && (
            <button onClick={() => startEdit(item)}
              style={{ padding: "5px 10px", background: "#eff6ff", border: "none", borderRadius: 6, color: "#3b82f6", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
              ✎ עריכה
            </button>
          )}
          {onDelete && (
            <button onClick={() => setConfirmId(item._id)}
              style={{ padding: "5px 10px", background: "#fef2f2", border: "none", borderRadius: 6, color: "#ef4444", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>
              🗑 מחק
            </button>
          )}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {item.date && <span style={{ fontSize: 11, color: "#9ca3af" }}>{item.date}</span>}
          {onToggleColor && (
            <div onClick={() => onToggleColor(item._id, { colored: !item.colored })}
              style={{ width: 12, height: 12, borderRadius: "50%", background: item.colored ? "#ef4444" : "#e5e7eb", border: item.colored ? "2px solid #dc2626" : "2px solid #d1d5db", cursor: "pointer" }} />
          )}
        </div>
      </div>

      {/* Edit mode */}
      {editingId === item._id ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {columns.filter(c => c.key !== "date").map(col => (
            <div key={col.key}>
              <label style={{ fontSize: 11, color: "#6b7280", display: "block", marginBottom: 2 }}>{col.label}</label>
              {col.type === "boolean"
                ? <input type="checkbox" checked={!!editValues[col.key]} onChange={e => setEditValues(v => ({ ...v, [col.key]: e.target.checked }))} />
                : <input
                    type={col.type === "number" ? "number" : "text"}
                    value={editValues[col.key] ?? ""}
                    onChange={e => setEditValues(v => ({ ...v, [col.key]: e.target.value }))}
                    style={{ width: "100%", border: "1px solid #c4b5fd", borderRadius: 6, padding: "6px 8px", fontSize: 14, outline: "none", boxSizing: "border-box" }}
                  />
              }
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button onClick={saveEdit} style={{ flex: 1, padding: 8, background: "#dcfce7", border: "none", borderRadius: 6, color: "#16a34a", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>✓ שמור</button>
            <button onClick={cancelEdit} style={{ flex: 1, padding: 8, background: "#f3f4f6", border: "none", borderRadius: 6, color: "#6b7280", cursor: "pointer", fontSize: 13 }}>✕ ביטול</button>
          </div>
        </div>
      ) : (
        /* Card fields grid */
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 12px" }}>
          {columns.filter(c => c.key !== "date").map(col => (
            <div key={col.key} style={{ overflow: "hidden" }}>
              <div style={{ fontSize: 10, color: "#9ca3af", marginBottom: 1 }}>{col.label}</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: item.colored ? "#991b1b" : "#1f2937", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {col.render ? col.render(item[col.key], item)
                  : col.type === "boolean" ? (item[col.key] ? "✓" : "-")
                  : col.type === "number" ? fmt(item[col.key])
                  : (item[col.key] || "-")}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        .dt-mobile  { display: none !important; }
        .dt-desktop { display: block !important; }
        @media (max-width: 767px) {
          .dt-mobile  { display: flex !important; flex-direction: column; gap: 10px; }
          .dt-desktop { display: none !important; }
        }
      `}</style>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
          <div>
            <h1 style={{ fontSize: 22, fontWeight: 700, color: "#1f2937", margin: 0 }}>{title}</h1>
            <p style={{ fontSize: 13, color: "#6b7280", margin: "4px 0 0" }}>
              {filtered.length} רשומות{total > 0 ? ` | סה״כ: ${fmt(total)} ₪` : ""}
            </p>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
            {filterYear && (
              <button onClick={() => setShowAll(!showAll)}
                style={{ fontSize: 12, padding: "6px 12px", borderRadius: 8, border: showAll ? "1px solid #c4b5fd" : "1px solid #e5e7eb", background: showAll ? "#ede9fe" : "#fff", color: showAll ? "#7c3aed" : "#6b7280", cursor: "pointer" }}>
                {showAll ? "שנה נוכחית" : "כל הזמנים"}
              </button>
            )}
            {extraActions}
            {onAdd && (
              <button onClick={onAdd}
                style={{ padding: "8px 18px", borderRadius: 8, background: "#7c3aed", color: "#fff", border: "none", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>
                + הוסף
              </button>
            )}
          </div>
        </div>

        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="חיפוש..."
          style={{ width: "100%", padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 10, fontSize: 16, outline: "none", boxSizing: "border-box" }}
        />

        {/* ── MOBILE: Cards ── */}
        <div className="dt-mobile">
          {filtered.length === 0
            ? <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 14 }}>אין נתונים להצגה</div>
            : filtered.map(item => <CardItem key={item._id} item={item} />)
          }
          {filtered.length > 0 && total > 0 && (
            <div style={{ background: "#f5f3ff", borderRadius: 10, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 13, color: "#6b7280" }}>סה״כ ({filtered.length} רשומות)</span>
              <span style={{ fontSize: 16, fontWeight: 700, color: "#7c3aed" }}>{fmt(total)} ₪</span>
            </div>
          )}
        </div>

        {/* ── DESKTOP: Table ── */}
        <div className="dt-desktop" style={{ background: "#fff", borderRadius: 16, border: "1px solid #e5e7eb", overflow: "hidden" }}>
          {/* Header row */}
          <div style={{ ...ROW, background: "#faf5ff", borderBottom: "2px solid #ede9fe", padding: "4px 0" }}>
            <div style={CELL("70px", { textAlign: "center", fontWeight: 700, color: "#4c1d95" })}>פעולות</div>
            {columns.map(col => (
              <button key={col.key} onClick={() => handleSort(col.key)} style={HEAD(col.width)}>
                {col.label} {sortKey === col.key ? (sortDir === "asc" ? "↑" : "↓") : ""}
              </button>
            ))}
            <div style={CELL("30px")} />
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: 48, color: "#9ca3af", fontSize: 14 }}>אין נתונים להצגה</div>
          ) : filtered.map((item, idx) => {
            const isEditing = editingId === item._id;
            const bg = item.colored ? "#fef2f2" : idx % 2 === 0 ? "#fff" : "#fafafa";
            return (
              <div key={item._id} style={{ ...ROW, background: bg }}
                onMouseEnter={e => { if (!item.colored) e.currentTarget.style.background = "#f5f3ff"; }}
                onMouseLeave={e => { e.currentTarget.style.background = bg; }}>
                <div style={CELL("70px", { display: "flex", gap: 4, justifyContent: "center" })}>
                  {isEditing ? (
                    <>
                      <button onClick={saveEdit} style={{ padding: "3px 8px", background: "#dcfce7", border: "none", borderRadius: 6, color: "#16a34a", cursor: "pointer", fontSize: 12 }}>✓</button>
                      <button onClick={cancelEdit} style={{ padding: "3px 8px", background: "#f3f4f6", border: "none", borderRadius: 6, color: "#6b7280", cursor: "pointer", fontSize: 12 }}>✕</button>
                    </>
                  ) : (
                    <>
                      {onEdit && <button onClick={() => startEdit(item)} style={{ padding: "3px 8px", background: "#eff6ff", border: "none", borderRadius: 6, color: "#3b82f6", cursor: "pointer", fontSize: 12 }}>✎</button>}
                      {onDelete && <button onClick={() => setConfirmId(item._id)} style={{ padding: "3px 8px", background: "#fef2f2", border: "none", borderRadius: 6, color: "#ef4444", cursor: "pointer", fontSize: 12 }}>🗑</button>}
                    </>
                  )}
                </div>
                {columns.map(col => (
                  <div key={col.key} style={CELL(col.width, { color: item.colored ? "#991b1b" : "#374151" })}>
                    {isEditing && col.editable !== false ? (
                      col.type === "boolean"
                        ? <input type="checkbox" checked={!!editValues[col.key]} onChange={e => setEditValues(v => ({ ...v, [col.key]: e.target.checked }))} />
                        : <input type={col.type === "number" ? "number" : "text"} value={editValues[col.key] ?? ""}
                            onChange={e => setEditValues(v => ({ ...v, [col.key]: e.target.value }))}
                            style={{ width: "100%", border: "1px solid #c4b5fd", borderRadius: 4, padding: "2px 4px", fontSize: 12, outline: "none" }} />
                    ) : col.render ? col.render(item[col.key], item) : (
                      col.type === "boolean" ? (item[col.key] ? "✓" : "-")
                      : col.type === "number" ? fmt(item[col.key])
                      : (item[col.key] || "-")
                    )}
                  </div>
                ))}
                <div style={CELL("30px", { display: "flex", justifyContent: "center" })}>
                  <div onClick={() => onToggleColor && onToggleColor(item._id, { colored: !item.colored })}
                    style={{ width: 12, height: 12, borderRadius: "50%", background: item.colored ? "#ef4444" : "#e5e7eb", border: item.colored ? "2px solid #dc2626" : "2px solid #d1d5db", cursor: "pointer" }} />
                </div>
              </div>
            );
          })}

          {/* Footer */}
          {filtered.length > 0 && (
            <div style={{ ...ROW, background: "#f9fafb", borderTop: "2px solid #e5e7eb", padding: "10px 0" }}>
              <div style={{ width: 30 }} />
              <div style={{ flex: 1, padding: "0 12px", fontSize: 13, color: "#6b7280" }}>
                סה״כ ({filtered.length} רשומות): <span style={{ fontWeight: 700, color: "#7c3aed", fontSize: 15 }}>{fmt(total)} ₪</span>
              </div>
            </div>
          )}
        </div>

      </div>

      <ConfirmModal
        isOpen={!!confirmId}
        onConfirm={() => { onDelete(confirmId); setConfirmId(null); }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  );
}