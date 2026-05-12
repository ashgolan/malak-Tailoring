import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { expensesApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];
const EMPTY = { date: today, name: "", number: 0, paymentDate: today, colored: false, taxNumber: "0", tax: false, totalAmount: 0 };

const COLUMNS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "name", label: "שם הוצאה", width: "150px" },
  { key: "number", label: "סכום", type: "number", width: "85px" },
  { key: "paymentDate", label: "ת.תשלום", width: "95px" },
  { key: "taxNumber", label: "ע.מס", width: "80px" },
  { key: "tax", label: "מע״מ", type: "boolean", width: "60px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "85px" },
];

export default function ExpensesPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("expenses", expensesApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    create({ ...form, totalAmount: Number(form.number) });
    setModal(false); setForm(EMPTY);
  };

  return (
    <>
      <DataTable title="הוצאות" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)} onDelete={remove} onToggleColor={toggleColor}
        searchFields={["name", "taxNumber"]} />
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת הוצאה">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">שם הוצאה</label><input type="text" value={form.name} onChange={e => set("name", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">סכום</label><input type="number" value={form.number} onChange={e => set("number", e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">ת.תשלום</label><input type="date" value={form.paymentDate} onChange={e => set("paymentDate", e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">עוסק מורשה</label><input type="text" value={form.taxNumber} onChange={e => set("taxNumber", e.target.value)} className="input-field" /></div>
            <div className="flex items-center gap-2 pt-5"><input type="checkbox" checked={form.tax} onChange={e => set("tax", e.target.checked)} className="accent-purple-600 w-4 h-4" /><label className="text-sm font-medium text-gray-700">כולל מע״מ</label></div>
          </div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => { setModal(false); setForm(EMPTY); }} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </>
  );
}
