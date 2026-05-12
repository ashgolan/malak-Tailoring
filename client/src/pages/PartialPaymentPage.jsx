// PartialPaymentPage
import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { partialPaymentApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];

const COLS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "clientName", label: "קליינט", width: "120px" },
  { key: "name", label: "עבור", width: "130px" },
  { key: "number", label: "סה״כ חוב", type: "number", width: "90px" },
  { key: "advanceAmount", label: "שולם", type: "number", width: "80px" },
  { key: "totalAmount", label: "יתרה", type: "number", width: "85px" },
];

export default function PartialPaymentPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("partialPayment", partialPaymentApi);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ date: today, clientName: "", name: "", number: 0, advanceAmount: 0, colored: false, totalAmount: 0 });
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    create({ ...form, totalAmount: Number(form.number) - Number(form.advanceAmount) });
    setModal(false);
  };

  return (
    <>
      <DataTable title="תשלום חלקי" data={data} columns={COLS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)} onDelete={remove} onToggleColor={toggleColor}
        searchFields={["clientName", "name"]} />
      <Modal isOpen={modal} onClose={() => setModal(false)} title="הוספת תשלום חלקי">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">תאריך</label><input type="date" value={form.date} onChange={e => set("date", e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">קליינט</label><input type="text" value={form.clientName} onChange={e => set("clientName", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">עבור</label><input type="text" value={form.name} onChange={e => set("name", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">סה״כ חוב</label><input type="number" value={form.number} onChange={e => set("number", e.target.value)} className="input-field" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">סכום ששולם</label><input type="number" value={form.advanceAmount} onChange={e => set("advanceAmount", e.target.value)} className="input-field" /></div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex justify-between">
            <span className="text-sm font-medium text-gray-600">יתרה לתשלום:</span>
            <span className="text-xl font-bold text-purple-700">{(Number(form.number) - Number(form.advanceAmount)).toLocaleString("he-IL")} ₪</span>
          </div>
          <div className="flex gap-3"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </>
  );
}
