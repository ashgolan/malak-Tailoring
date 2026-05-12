import { useState, useMemo } from "react";
import { Search, Plus, Download, ChevronUp, ChevronDown, Trash2, Edit2, Check, X } from "lucide-react";

export default function DataTable({
  title,
  data = [],
  columns = [],
  onAdd,
  onEdit,
  onDelete,
  onToggleColor,
  loading,
  filterYear = true,
  extraActions,
  searchFields = ["clientName", "name"],
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [showAll, setShowAll] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const currentYear = new Date().getFullYear();

  const filtered = useMemo(() => {
    let result = [...(data || [])];

    // Year filter
    if (filterYear && !showAll) {
      result = result.filter((item) => {
        if (!item.date) return item.colored;
        const d = new Date(item.date);
        return (
          d.getFullYear() === currentYear ||
          item.colored ||
          (d.getFullYear() === currentYear - 1 && d.getMonth() === 11)
        );
      });
    }

    // Search
    if (search) {
      const s = search.toLowerCase();
      result = result.filter((item) =>
        searchFields.some((f) => String(item[f] || "").toLowerCase().includes(s))
      );
    }

    // Sort
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

  const total = useMemo(
    () => filtered.reduce((s, i) => s + (Number(i.totalAmount) || 0), 0),
    [filtered]
  );

  const handleSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir("asc"); }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setEditValues({ ...item });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = () => {
    if (onEdit) onEdit(editingId, editValues);
    setEditingId(null);
    setEditValues({});
  };

  const fmt = (n) => Number(n || 0).toLocaleString("he-IL", { maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          <p className="text-gray-500 text-sm">{filtered.length} רשומות | סה״כ: {fmt(total)} ₪</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {filterYear && (
            <button
              onClick={() => setShowAll(!showAll)}
              className={`text-xs px-3 py-1.5 rounded-lg border transition-all ${showAll ? "bg-purple-100 border-purple-300 text-purple-700" : "bg-white border-gray-200 text-gray-500"}`}
            >
              {showAll ? "שנה נוכחית" : "כל הזמנים"}
            </button>
          )}
          {extraActions}
          {onAdd && (
            <button onClick={onAdd} className="btn-primary flex items-center gap-2 text-sm">
              <Plus className="w-4 h-4" />
              הוסף
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש..."
          className="w-full pr-9 pl-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white"
        />
      </div>

      {/* Table */}
      <div className="section-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="table-header">
              <th className="w-6 px-3 py-3" />
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-3 text-right font-semibold whitespace-nowrap ${col.sortable !== false ? "cursor-pointer hover:bg-white/10" : ""}`}
                  onClick={() => col.sortable !== false && handleSort(col.key)}
                  style={{ width: col.width }}
                >
                  <div className="flex items-center gap-1 justify-end">
                    {col.label}
                    {col.sortable !== false && sortKey === col.key && (
                      sortDir === "asc" ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
                    )}
                  </div>
                </th>
              ))}
              <th className="px-3 py-3 w-20">פעולות</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 2} className="text-center py-12 text-gray-400">
                  אין נתונים להצגה
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const isEditing = editingId === item._id;
                return (
                  <tr
                    key={item._id}
                    className={`table-row ${item.colored ? "colored-row" : ""}`}
                    onDoubleClick={() => onToggleColor && onToggleColor(item._id, { colored: !item.colored })}
                  >
                    <td className="px-3 py-2.5">
                      <div
                        className={`w-3 h-3 rounded-full cursor-pointer border-2 ${item.colored ? "bg-red-500 border-red-600" : "bg-gray-200 border-gray-300"}`}
                        onClick={() => onToggleColor && onToggleColor(item._id, { colored: !item.colored })}
                      />
                    </td>
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-2.5 whitespace-nowrap">
                        {isEditing && col.editable !== false ? (
                          col.type === "boolean" ? (
                            <input
                              type="checkbox"
                              checked={!!editValues[col.key]}
                              onChange={(e) => setEditValues((v) => ({ ...v, [col.key]: e.target.checked }))}
                            />
                          ) : (
                            <input
                              type={col.type || "text"}
                              value={editValues[col.key] ?? ""}
                              onChange={(e) => setEditValues((v) => ({ ...v, [col.key]: e.target.value }))}
                              className="border border-purple-300 rounded px-2 py-1 text-xs w-full focus:outline-none focus:ring-1 focus:ring-purple-500"
                            />
                          )
                        ) : (
                          col.render ? col.render(item[col.key], item) : (
                            <span>
                              {col.type === "boolean"
                                ? item[col.key] ? "✓" : "-"
                                : col.type === "number"
                                ? fmt(item[col.key])
                                : (item[col.key] ?? "-")}
                            </span>
                          )
                        )}
                      </td>
                    ))}
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-1">
                        {isEditing ? (
                          <>
                            <button onClick={saveEdit} className="p-1 text-green-600 hover:bg-green-50 rounded">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={cancelEdit} className="p-1 text-gray-500 hover:bg-gray-50 rounded">
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </>
                        ) : (
                          <>
                            {onEdit && (
                              <button onClick={() => startEdit(item)} className="p-1 text-blue-500 hover:bg-blue-50 rounded">
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                            {onDelete && (
                              <button
                                onClick={() => { if (window.confirm("למחוק?")) onDelete(item._id); }}
                                className="p-1 text-red-500 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
          {filtered.length > 0 && (
            <tfoot>
              <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                <td colSpan={columns.length + 1} className="px-3 py-3 text-left text-gray-600 text-sm">
                  סה״כ ({filtered.length} רשומות)
                </td>
                <td className="px-3 py-3 text-right text-purple-700 font-bold">{fmt(total)} ₪</td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
