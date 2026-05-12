import { useState } from "react";
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
  { key: "date", label: "תאריך", type: "date", width: "100px" },
  { key: "clientName", label: "קליינט", width: "120px" },
  { key: "name", label: "מוצר/עבודה", width: "130px" },
  { key: "quantity", label: "כמות", type: "number", width: "70px" },
  { key: "number", label: "מחיר", type: "number", width: "80px" },
  { key: "discount", label: "הנחה%", type: "number", width: "70px" },
  { key: "sale", label: "לאחר הנחה", type: "number", width: "90px" },
  { key: "expenses", label: "הוצאות", type: "number", width: "80px" },
  { key: "tax", label: "מע״מ", type: "boolean", width: "60px" },
  { key: "remark", label: "הערה", width: "100px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "90px" },
];

export default function SalesPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("sales", salesApi);
  const { data: inventories } = useQuery({ queryKey: ["inventories"], queryFn: () => inventoriesApi.getAll().then(r => r.data) });
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);

  const maam = Number(taxValues?.maamValue || 17);

  const setField = (key, val) => {
    setForm((prev) => {
      const updated = { ...prev, [key]: val };
      // Recalculate
      const num = Number(updated.number) || 0;
      const disc = Number(updated.discount) || 0;
      const qty = Number(updated.quantity) || 1;
      const exp = Number(updated.expenses) || 0;
      const saleVal = num - (num * disc) / 100;
      updated.sale = saleVal;
      updated.totalAmount = updated.tax
        ? (saleVal * qty + exp) * (1 + maam / 100)
        : saleVal * qty + exp;
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
              <input type="text" value={form.clientName} onChange={e => setField("clientName", e.target.value)} className="input-field" placeholder="שם הלקוח" required />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">לאחר הנחה</label>
              <input type="number" value={form.sale.toFixed(2)} readOnly className="input-field bg-gray-50" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">הוצאות</label>
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

          <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
            <div className="flex justify-between items-center">
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
