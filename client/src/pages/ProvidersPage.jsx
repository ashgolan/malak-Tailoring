import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { providersApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const COLUMNS = [
  { key: "name", label: "שם ספק", width: "180px" },
  { key: "number", label: "מספר", width: "120px" },
  { key: "phone", label: "טלפון", width: "120px" },
];

export default function ProvidersPage() {
  const { data, isLoading, create, update, remove } = useCrud("providers", providersApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", number: "-", phone: "-" });

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false); setForm({ name: "", number: "-", phone: "-" });
  };

  return (
    <>
      <DataTable title="ספקים" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)} onDelete={remove}
        filterYear={false} searchFields={["name", "phone"]} />
      <Modal isOpen={modal} onClose={() => setModal(false)} title="הוספת ספק">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">שם</label><input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">מספר</label><input type="text" value={form.number} onChange={e => setForm(p => ({...p, number: e.target.value}))} className="input-field" /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">טלפון</label><input type="text" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input-field" /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </>
  );
}
