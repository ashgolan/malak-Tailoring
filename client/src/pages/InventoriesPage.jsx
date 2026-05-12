import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { inventoriesApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const COLUMNS = [
  { key: "name", label: "שם מוצר", width: "200px" },
  { key: "number", label: "מחיר", type: "number", width: "120px" },
];

export default function InventoriesPage() {
  const { data, isLoading, create, update, remove } = useCrud("inventories", inventoriesApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", number: 0 });

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false); setForm({ name: "", number: 0 });
  };

  return (
    <>
      <DataTable title="מלאי ומחירון" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)} onDelete={remove}
        filterYear={false} searchFields={["name"]} />
      <Modal isOpen={modal} onClose={() => setModal(false)} title="הוספת מוצר">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">שם מוצר/עבודה</label><input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מחיר</label><input type="number" value={form.number} onChange={e => setForm(p => ({...p, number: e.target.value}))} className="input-field" /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </>
  );
}
