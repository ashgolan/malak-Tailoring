import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { sleevesBidsApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];
const EMPTY = { date: today, clientName: "", number: 0, quantity: 1, tax: false, totalAmount: 0 };

const COLUMNS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "clientName", label: "קליינט", width: "140px" },
  { key: "number", label: "סכום", type: "number", width: "90px" },
  { key: "quantity", label: "כמות", type: "number", width: "70px" },
  { key: "tax", label: "מע״מ", type: "boolean", width: "60px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "90px" },
];

export default function SleevesBidsPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("sleevesBids", sleevesBidsApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const total = Number(form.number) * Number(form.quantity);
    create({ ...form, totalAmount: total });
    setModal(false); setForm(EMPTY);
  };

  return (
    <>
      <DataTable title="הצעות שוואדר" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)}
        onDelete={remove} onToggleColor={toggleColor}
        searchFields={["clientName"]}
      />
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת הצעת שוואדר">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">קליינט</label><input type="text" value={form.clientName} onChange={e => set("clientName", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">סכום</label><input type="number" value={form.number} onChange={e => set("number", e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">כמות</label><input type="number" value={form.quantity} onChange={e => set("quantity", e.target.value)} className="input-field" min="1" required /></div>
            <div className="flex items-center gap-2 pt-5"><input type="checkbox" checked={form.tax} onChange={e => set("tax", e.target.checked)} className="accent-purple-600 w-4 h-4" /><label className="text-sm font-medium text-gray-700">כולל מע״מ</label></div>
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
