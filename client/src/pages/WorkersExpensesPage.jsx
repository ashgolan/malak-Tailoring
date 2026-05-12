import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { workersExpensesApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];
const EMPTY = { date: today, location: "", clientName: "", equipment: "", number: 0, colored: false, totalAmount: 0, tax: false };

const COLUMNS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "location", label: "עבודה", width: "120px" },
  { key: "clientName", label: "עובד", width: "110px" },
  { key: "equipment", label: "ציוד", width: "120px" },
  { key: "number", label: "סכום", type: "number", width: "85px" },
  { key: "tax", label: "מע״מ", type: "boolean", width: "60px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "85px" },
];

export default function WorkersExpensesPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("workersExpenses", workersExpensesApi);
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
      <DataTable title="הוצאות עובדים" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)}
        onDelete={remove} onToggleColor={toggleColor}
        searchFields={["clientName", "location", "equipment"]}
      />
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת הוצאת עובד">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">עובד</label><input type="text" value={form.clientName} onChange={e => set("clientName", e.target.value)} className="input-field" placeholder="שם העובד" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">עבודה / מיקום</label><input type="text" value={form.location} onChange={e => set("location", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">ציוד</label><input type="text" value={form.equipment} onChange={e => set("equipment", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">סכום</label><input type="number" value={form.number} onChange={e => set("number", e.target.value)} className="input-field" required /></div>
            <div className="flex items-center gap-2 pt-5"><input type="checkbox" id="wtax" checked={form.tax} onChange={e => set("tax", e.target.checked)} className="accent-purple-600 w-4 h-4" /><label htmlFor="wtax" className="text-sm font-medium text-gray-700">כולל מע״מ</label></div>
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
