import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { institutionTaxApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];
const EMPTY = { date: today, clientName: "", name: "", taxNumber: "0", number: 0, paymentDate: today, colored: false, totalAmount: 0 };

const COLUMNS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "clientName", label: "מוסד", width: "120px" },
  { key: "name", label: "עבודה", width: "130px" },
  { key: "taxNumber", label: "ע.מס", width: "80px" },
  { key: "number", label: "סכום", type: "number", width: "85px" },
  { key: "paymentDate", label: "ת.תשלום", width: "95px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "85px" },
];

export default function InstitutionTaxPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("institutionTax", institutionTaxApi);
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
      <DataTable title="מס מוסדות" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)} onDelete={remove} onToggleColor={toggleColor}
        searchFields={["clientName", "name"]} />
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת מס מוסד">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[["date","תאריך","date"],["clientName","מוסד","text"],["name","עבודה","text"],["taxNumber","ע.מס","text"],["number","סכום","number"],["paymentDate","ת.תשלום","date"]].map(([k,l,t]) => (
              <div key={k}><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label><input type={t} value={form[k]} onChange={e => set(k, e.target.value)} className="input-field" /></div>
            ))}
          </div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => { setModal(false); setForm(EMPTY); }} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </>
  );
}
