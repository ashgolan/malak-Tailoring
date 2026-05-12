import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { eventsApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const COLUMNS = [
  { key: "title", label: "אירוע", width: "200px" },
  { key: "start", label: "התחלה", width: "150px", render: (v) => v ? new Date(v).toLocaleString("he-IL") : "-" },
  { key: "end", label: "סיום", width: "150px", render: (v) => v ? new Date(v).toLocaleString("he-IL") : "-" },
];

export default function EventsPage() {
  const { data, isLoading, create, update, remove } = useCrud("events", eventsApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ title: "", start: "", end: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false); setForm({ title: "", start: "", end: "" });
  };

  return (
    <>
      <DataTable title="אירועים" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)} onDelete={remove}
        filterYear={false} searchFields={["title"]} />
      <Modal isOpen={modal} onClose={() => setModal(false)} title="הוספת אירוע">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">כותרת</label><input type="text" value={form.title} onChange={e => setForm(p => ({...p, title: e.target.value}))} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">התחלה</label><input type="datetime-local" value={form.start} onChange={e => setForm(p => ({...p, start: e.target.value}))} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">סיום</label><input type="datetime-local" value={form.end} onChange={e => setForm(p => ({...p, end: e.target.value}))} className="input-field" required /></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </>
  );
}
