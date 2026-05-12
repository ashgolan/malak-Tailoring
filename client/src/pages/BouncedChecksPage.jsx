import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { bouncedChecksApi } from "../api";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];
const EMPTY = {
  date: today, clientName: "", checkNumber: "", bankNumber: "",
  branchNumber: "", accountNumber: "", number: 0,
  paymentDate: today, taxNumber: "0", colored: false, remark: "-", totalAmount: 0,
};

const COLUMNS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "clientName", label: "קליינט", width: "110px" },
  { key: "checkNumber", label: "מס.שיק", type: "number", width: "75px" },
  { key: "bankNumber", label: "מס.בנק", type: "number", width: "70px" },
  { key: "branchNumber", label: "סניף", type: "number", width: "65px" },
  { key: "accountNumber", label: "חשבון", type: "number", width: "80px" },
  { key: "number", label: "סכום", type: "number", width: "80px" },
  { key: "paymentDate", label: "ת.תשלום", width: "95px" },
  { key: "taxNumber", label: "ע.מס", width: "75px" },
  { key: "remark", label: "הערה", width: "90px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "85px" },
];

export default function BouncedChecksPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("bouncedChecks", bouncedChecksApi);
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
      <DataTable
        title="שיקים חוזרים"
        data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)}
        onDelete={remove} onToggleColor={toggleColor}
        searchFields={["clientName", "remark"]}
      />
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת שיק חוזר" size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "date", label: "תאריך", type: "date" },
              { key: "clientName", label: "קליינט", type: "text" },
              { key: "checkNumber", label: "מספר שיק", type: "number" },
              { key: "bankNumber", label: "מספר בנק", type: "number" },
              { key: "branchNumber", label: "מספר סניף", type: "number" },
              { key: "accountNumber", label: "מספר חשבון", type: "number" },
              { key: "number", label: "סכום", type: "number" },
              { key: "paymentDate", label: "תאריך תשלום", type: "date" },
              { key: "taxNumber", label: "עוסק מורשה", type: "text" },
              { key: "remark", label: "הערה", type: "text" },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <input type={type} value={form[key]} onChange={e => set(key, e.target.value)}
                  className="input-field" required={["clientName","checkNumber","bankNumber","branchNumber","accountNumber"].includes(key)} />
              </div>
            ))}
          </div>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex justify-between">
            <span className="text-sm font-medium text-gray-600">סה״כ:</span>
            <span className="text-xl font-bold text-purple-700">{Number(form.number || 0).toLocaleString("he-IL")} ₪</span>
          </div>
          <div className="flex gap-3">
            <button type="submit" className="btn-primary flex-1">שמור</button>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); }} className="btn-secondary flex-1">ביטול</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
