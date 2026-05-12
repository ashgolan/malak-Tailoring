import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { salesToCompaniesApi, taxValuesApi } from "../api";
import { useQuery } from "@tanstack/react-query";
import DataTable from "../components/tables/DataTable";
import Modal from "../components/ui/Modal";

const today = new Date().toISOString().split("T")[0];
const EMPTY = { date: today, clientName: "", name: "", kindOfWork: "", containersNumbers: "", sending: "", number: 0, afterTax: "0", totalAmount: 0, colored: false };

const COLUMNS = [
  { key: "date", label: "תאריך", width: "95px" },
  { key: "clientName", label: "חברה", width: "110px" },
  { key: "name", label: "עבודה", width: "120px" },
  { key: "kindOfWork", label: "סוג עבודה", width: "100px" },
  { key: "containersNumbers", label: "מכולות", width: "90px" },
  { key: "number", label: "סכום", type: "number", width: "80px" },
  { key: "afterTax", label: "מע״מ", width: "75px" },
  { key: "totalAmount", label: "סה״כ", type: "number", width: "85px" },
];

export default function SalesToCompaniesPage() {
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("salesToCompanies", salesToCompaniesApi);
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const maam = Number(taxValues?.maamValue || 17);

  const set = (k, v) => setForm(p => {
    const upd = { ...p, [k]: v };
    if (k === "number") {
      const tax = Number(v) * (maam / 100);
      upd.afterTax = tax.toFixed(2);
      upd.totalAmount = Number(v) + tax;
    }
    return upd;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    create(form);
    setModal(false); setForm(EMPTY);
  };

  return (
    <>
      <DataTable title="מכירות לחברות" data={data} columns={COLUMNS} loading={isLoading}
        onAdd={() => setModal(true)} onEdit={(id, v) => update(id, v)} onDelete={remove} onToggleColor={toggleColor}
        searchFields={["clientName", "name", "kindOfWork"]} />
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); }} title="הוספת מכירה לחברה" size="lg">
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {[["date","תאריך","date"],["clientName","חברה","text"],["name","עבודה","text"],["kindOfWork","סוג עבודה","text"],["containersNumbers","מספרי מכולות","text"],["sending","משלוח","text"]].map(([k,l,t]) => (
              <div key={k}><label className="block text-sm font-medium text-gray-700 mb-1">{l}</label><input type={t} value={form[k]} onChange={e => set(k, e.target.value)} className="input-field" /></div>
            ))}
            <div><label className="block text-sm font-medium text-gray-700 mb-1">סכום לפני מע״מ</label><input type="number" value={form.number} onChange={e => set("number", e.target.value)} className="input-field" required /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">מע״מ ({maam}%)</label><input type="text" value={form.afterTax} readOnly className="input-field bg-gray-50" /></div>
          </div>
          <div className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex justify-between">
            <span className="text-sm font-medium text-gray-600">סה״כ כולל מע״מ:</span>
            <span className="text-xl font-bold text-purple-700">{Number(form.totalAmount).toLocaleString("he-IL", {maximumFractionDigits:2})} ₪</span>
          </div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => { setModal(false); setForm(EMPTY); }} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </>
  );
}
