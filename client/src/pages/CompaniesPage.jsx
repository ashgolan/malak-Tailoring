import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "../api";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import toast from "react-hot-toast";
import { Plus, Trash2, Edit2, ChevronDown, ChevronUp, Building, Building2 } from "lucide-react";

export default function CompaniesPage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["companies"], queryFn: () => companiesApi.getAll().then(r => r.data.companies) });
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ name: "", isInstitution: false, taskDescription: "" });
  const [expanded, setExpanded] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["companies"] });

  const createMut = useMutation({ mutationFn: (d) => companiesApi.create(d), onSuccess: () => { toast.success("נוסף ✓"); invalidate(); setModal(false); } });
  const deleteMut = useMutation({ mutationFn: (id) => companiesApi.remove(id), onSuccess: () => { toast.success("נמחק ✓"); invalidate(); } });

  const companies = data || [];
  const firms = companies.filter(c => !c.isInstitution);
  const institutions = companies.filter(c => c.isInstitution);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  const CompanyList = ({ items, title, icon: Icon }) => (
    <div className="section-card overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
        <Icon className="w-5 h-5 text-purple-600" />
        <h2 className="font-semibold text-gray-700">{title} ({items.length})</h2>
      </div>
      <div className="divide-y divide-gray-100">
        {items.length === 0 ? (
          <p className="text-center py-8 text-gray-400 text-sm">אין נתונים</p>
        ) : items.map(c => (
          <div key={c._id}>
            <div className="flex items-center justify-between px-5 py-3 hover:bg-gray-50">
              <button onClick={() => toggle(c._id)} className="flex items-center gap-2 text-right flex-1">
                {expanded[c._id] ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                <span className="font-medium text-gray-700">{c.name}</span>
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{c.tasks?.length || 0} משימות</span>
              </button>
              <button onClick={() => {  setConfirmId(c._id); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
            {expanded[c._id] && c.tasks?.length > 0 && (
              <div className="bg-gray-50 px-8 py-3 space-y-1">
                {c.tasks.map(t => (
                  <div key={t._id} className="text-sm text-gray-600 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    {t.description}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">חברות ומוסדות</h1>
        <button onClick={() => setModal(true)} className="btn-primary flex items-center gap-2"><Plus className="w-4 h-4" />הוסף</button>
      </div>
      {isLoading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-purple-700 border-t-transparent rounded-full animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CompanyList items={firms} title="חברות" icon={Building} />
          <CompanyList items={institutions} title="מוסדות" icon={Building2} />
        </div>
      )}

      <Modal isOpen={modal} onClose={() => setModal(false)} title="הוספת חברה/מוסד">
        <form onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }} className="space-y-3">
          <div><label className="block text-sm font-medium text-gray-700 mb-1">שם</label><input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input-field" required /></div>
          <div><label className="block text-sm font-medium text-gray-700 mb-1">משימה ראשונה</label><input type="text" value={form.taskDescription} onChange={e => setForm(p => ({...p, taskDescription: e.target.value}))} className="input-field" required /></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="isInst" checked={form.isInstitution} onChange={e => setForm(p => ({...p, isInstitution: e.target.checked}))} className="accent-purple-600 w-4 h-4" /><label htmlFor="isInst" className="text-sm font-medium text-gray-700">מוסד (לא חברה)</label></div>
          <div className="flex gap-3 pt-2"><button type="submit" className="btn-primary flex-1">שמור</button><button type="button" onClick={() => setModal(false)} className="btn-secondary flex-1">ביטול</button></div>
        </form>
      </Modal>
    </div>
  );
}
