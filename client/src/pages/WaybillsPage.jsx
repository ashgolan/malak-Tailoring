import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { waybillsApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];
const EMPTY = { date: today, location: "", clientName: "", name: "", remark: "-", colored: false, quantity: 1, totalAmount: 0 };

const COLUMNS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "location", label: "כתובת משלוח", width: "130px" },
  { key: "clientName", label: "לקוח/חברה", width: "120px" },
  { key: "name", label: "תאור מוצר", width: "130px" },
  { key: "quantity", label: "כמות", type: "number", width: "70px" },
  { key: "remark", label: "הערה", width: "100px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "85px" },
];

export default function WaybillsPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("waybills", waybillsApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    create({ ...form, totalAmount: Number(form.quantity) });
    setModal(false); setForm(EMPTY);
  };

  return (
    <>
      <DataTable title="תעודות משלוח" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)}
        onDelete={remove} onToggleColor={toggleColor}
        searchFields={["clientName", "name", "location"]}
      />
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת תעודת משלוח">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">לקוח/חברה</label><input type="text" value={form.clientName} onChange={e => set("clientName", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">כתובת משלוח</label><input type="text" value={form.location} onChange={e => set("location", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תאור מוצר</label><input type="text" value={form.name} onChange={e => set("name", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">כמות</label><input type="number" value={form.quantity} onChange={e => set("quantity", e.target.value)} className="input-field" min="1" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">הערה</label><input type="text" value={form.remark} onChange={e => set("remark", e.target.value)} className="input-field" /></div>
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
