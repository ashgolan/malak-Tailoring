import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { salesApi, inventoriesApi, taxValuesApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const EMPTY = {
  date: new Date().toISOString().split("T")[0],
  clientName: "",
  remark: "-",
  name: "",
  quantity: 1,
  number: 0,
  discount: 0,
  sale: 0,
  expenses: 0,
  totalAmount: 0,
  tax: false,
  colored: false,
};

const COLUMNS = [
  { key: "totalAmount", label: "סה״כ",       type: "number",  width: "9%"  },
  { key: "remark",      label: "הערה",                        width: "13%" },
  { key: "expenses",    label: "הוצאות",     type: "number",  width: "7%"  },
  { key: "discount",    label: "הנחה%",      type: "number",  width: "6%"  },
  { key: "number",      label: "מחיר",       type: "number",  width: "7%"  },
  { key: "quantity",    label: "כמות",       type: "number",  width: "5%"  },
  { key: "name",        label: "מוצר/עבודה",                  width: "14%" },
  { key: "clientName",  label: "קליינט",                      width: "13%" },
  { key: "date",        label: "תאריך",      type: "date",    width: "9%"  },
];

// Autocomplete component
function ClientAutocomplete({ value, onChange, allClients }) {
  const [suggestions, setSuggestions] = useState([]);
  const [showList, setShowList] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setShowList(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    onChange(val);
    if (val.trim().length > 0) {
      const filtered = allClients.filter((c) =>
        c.toLowerCase().includes(val.toLowerCase())
      );
      setSuggestions(filtered);
      setShowList(filtered.length > 0);
    } else {
      setSuggestions(allClients);
      setShowList(allClients.length > 0);
    }
  };

  const handleFocus = () => {
    const filtered = value.trim()
      ? allClients.filter((c) => c.toLowerCase().includes(value.toLowerCase()))
      : allClients;
    setSuggestions(filtered);
    setShowList(filtered.length > 0);
  };

  const handleSelect = (name) => {
    onChange(name);
    setShowList(false);
  };

  return (
    <div className="relative" ref={ref}>
      <input
        type="text"
        value={value}
        onChange={handleInput}
        onFocus={handleFocus}
        className="input-field"
        placeholder="שם הלקוח"
        required
        autoComplete="off"
      />
      {showList && (
        <ul className="absolute z-50 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
          {suggestions.map((name, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(name)}
              className="px-3 py-2 text-sm hover:bg-purple-50 hover:text-purple-700 cursor-pointer transition-colors"
            >
              {name}
            </li>
          ))}
          {suggestions.length === 0 && (
            <li className="px-3 py-2 text-sm text-gray-400">לא נמצאו תוצאות</li>
          )}
        </ul>
      )}
    </div>
  );
}

export default function SalesPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("sales", salesApi);
  const { data: inventories } = useQuery({ queryKey: ["inventories"], queryFn: () => inventoriesApi.getAll().then(r => r.data) });
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const maam = Number(taxValues?.maamValue || 17);

  // Extract unique client names from existing sales
  const allClients = [...new Set((data || []).map((s) => s.clientName).filter(Boolean))].sort();

  const setField = (key, val) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: val };
      const num = Number(updated.number) || 0;
      const disc = Number(updated.discount) || 0;
      const qty = Number(updated.quantity) || 1;
      const exp = Number(updated.expenses) || 0;
      // סה״כ לפני הוצאות
      const saleVal = num - (num * disc) / 100;
      updated.sale = saleVal;
      // סה״כ = (מחיר * כמות) - הוצאות
      const base = saleVal * qty - exp;
      updated.totalAmount = updated.tax ? base * (1 + maam / 100) : base;
      return updated;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false);
    setForm(EMPTY);
  };

  return (
    <>
      <DataTable
        title="מכירות"
        data={data}
        columns={COLUMNS}
        loading={isLoading}
        onAdd={() => setModal(true)}
        onEdit={(id, vals) => update(id, vals)}
        onDelete={remove}
        onToggleColor={toggleColor}
        searchFields={["clientName", "name", "remark"]}
      />

      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת מכירה חדשה" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label>
              <input type="date" value={form.date} onChange={e => setField("date", e.target.value)} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">קליינט</label>
              <ClientAutocomplete
                value={form.clientName}
                onChange={(val) => setField("clientName", val)}
                allClients={allClients}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מוצר/עבודה</label>
              {inventories?.length ? (
                <select value={form.name} onChange={e => {
                  const inv = inventories.find(i => i.name === e.target.value);
                  setField("name", e.target.value);
                  if (inv) setField("number", inv.number);
                }} className="input-field" required>
                  <option value="">בחר מוצר</option>
                  {inventories.map(i => <option key={i._id} value={i.name}>{i.name}</option>)}
                </select>
              ) : (
                <input type="text" value={form.name} onChange={e => setField("name", e.target.value)} className="input-field" required />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">כמות</label>
              <input type="number" value={form.quantity} onChange={e => setField("quantity", e.target.value)} className="input-field" min="1" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">מחיר ליחידה</label>
              <input type="number" value={form.number} onChange={e => setField("number", e.target.value)} className="input-field" min="0" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הנחה %</label>
              <input type="number" value={form.discount} onChange={e => setField("discount", e.target.value)} className="input-field" min="0" max="100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">לאחר הנחה (ליחידה)</label>
              <input type="number" value={form.sale.toFixed(2)} readOnly className="input-field bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הוצאות (יורדות מהסה״כ)</label>
              <input type="number" value={form.expenses} onChange={e => setField("expenses", e.target.value)} className="input-field" min="0" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הערה</label>
              <input type="text" value={form.remark} onChange={e => setField("remark", e.target.value)} className="input-field" />
            </div>
            <div className="flex items-center gap-3 pt-5">
              <input type="checkbox" id="tax" checked={form.tax} onChange={e => setField("tax", e.target.checked)} className="w-4 h-4 accent-purple-600" />
              <label htmlFor="tax" className="text-sm font-medium text-gray-700">כולל מע״מ {maam}%</label>
            </div>
          </div>

          {/* Formula preview */}
          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100 space-y-1">
            <div className="flex justify-between text-xs text-gray-500">
              <span>מחיר × כמות</span>
              <span>{(Number(form.sale) * Number(form.quantity)).toLocaleString("he-IL", { maximumFractionDigits: 2 })} ₪</span>
            </div>
            {Number(form.expenses) > 0 && (
              <div className="flex justify-between text-xs text-red-500">
                <span>הוצאות</span>
                <span>- {Number(form.expenses).toLocaleString("he-IL", { maximumFractionDigits: 2 })} ₪</span>
              </div>
            )}
            {form.tax && (
              <div className="flex justify-between text-xs text-gray-500">
                <span>מע״מ {maam}%</span>
                <span>+ {(Number(form.totalAmount) - (Number(form.sale) * Number(form.quantity) - Number(form.expenses))).toLocaleString("he-IL", { maximumFractionDigits: 2 })} ₪</span>
              </div>
            )}
            <div className="border-t border-purple-200 pt-2 flex justify-between items-center">
              <span className="text-sm font-medium text-gray-600">סה״כ לתשלום:</span>
              <span className="text-2xl font-bold text-purple-700">
                {Number(form.totalAmount).toLocaleString("he-IL", { maximumFractionDigits: 2 })} ₪
              </span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="submit" className="btn-primary flex-1">שמור</button>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); }} className="btn-secondary flex-1">ביטול</button>
          </div>
        </form>
      </Modal>
    </>
  );
}

