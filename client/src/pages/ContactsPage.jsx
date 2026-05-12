import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { contactsApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const COLUMNS = [
  { key: "name", label: "שם חברה/איש קשר", width: "180px" },
  { key: "number", label: "מספר", width: "100px" },
  { key: "mail", label: "אימייל", width: "160px" },
  { key: "bankProps", label: "פרטי בנק", width: "180px" },
];

export default function ContactsPage() {
  const { data, isLoading, create, update, remove } = useCrud("contacts", contactsApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", number: "-", mail: "-", bankProps: "-" });

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false); setForm({ name: "", number: "-", mail: "-", bankProps: "-" });
  };

  return (
    <>
      <DataTable title="אנשי קשר" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)} onDelete={remove}
        filterYear={false} searchFields={["name", "mail"]} />
      <Modal isOpen={modal} onClose={() => setModal(false)} title="הוספת איש קשר">
        <form onSubmit={handleSubmit} className="space-y-3">
          {[["name","שם","text"],["number","מספר","text"],["mail","אימייל","email"],["bankProps","פרטי בנק","text"]].map(([k,l,t]) => (
            <div key={k}><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label><input type={t} value={form[k]} onChange={e => setForm(p => ({...p, [k]: e.target.value}))} className="input-field" dir={t==="email"?"ltr":"rtl"} required={k==="name"} /></div>
          ))}
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </>
  );
}
