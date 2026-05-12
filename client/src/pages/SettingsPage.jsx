import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taxValuesApi, usersApi } from "../api";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Save, UserPlus, Percent } from "lucide-react";

export default function SettingsPage() {
  const qc = useQueryClient();
  const { user } = useAuthStore();
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });
  const [tax, setTax] = useState({ masValue: "", maamValue: "" });
  const [newUser, setNewUser] = useState({ email: "", password: "", role: "Admin", key: "" });
  const [adminKey, setAdminKey] = useState("");

  const taxMut = useMutation({
    mutationFn: (d) => taxValuesApi.upsert(d),
    onSuccess: () => { toast.success("ערכי מס עודכנו ✓"); qc.invalidateQueries({ queryKey: ["taxValues"] }); },
  });

  const userMut = useMutation({
    mutationFn: (d) => usersApi.create(d),
    onSuccess: () => { toast.success("משתמש נוצר ✓"); setNewUser({ email: "", password: "", role: "Admin", key: "" }); },
    onError: (e) => toast.error(e.response?.data || "שגיאה"),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-800">הגדרות</h1>

      {/* Tax values */}
      <div className="section-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Percent className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-semibold text-gray-700">ערכי מס</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">מע״מ %</label>
            <input
              type="number"
              defaultValue={taxValues?.maamValue}
              onChange={e => setTax(p => ({...p, maamValue: e.target.value}))}
              className="input-field"
              placeholder={taxValues?.maamValue || "17"}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ניכוי במקור %</label>
            <input
              type="number"
              defaultValue={taxValues?.masValue}
              onChange={e => setTax(p => ({...p, masValue: e.target.value}))}
              className="input-field"
              placeholder={taxValues?.masValue || "3"}
            />
          </div>
        </div>
        <button
          onClick={() => taxMut.mutate({ masValue: tax.masValue || taxValues?.masValue, maamValue: tax.maamValue || taxValues?.maamValue })}
          className="btn-primary flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          שמור ערכי מס
        </button>
      </div>

      {/* New user */}
      <div className="section-card p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <UserPlus className="w-5 h-5 text-purple-600" />
          <h2 className="text-base font-semibold text-gray-700">הוספת משתמש</h2>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">אימייל</label>
            <input type="email" value={newUser.email} onChange={e => setNewUser(p => ({...p, email: e.target.value}))} className="input-field" dir="ltr" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">סיסמה (10+ תווים)</label>
            <input type="password" value={newUser.password} onChange={e => setNewUser(p => ({...p, password: e.target.value}))} className="input-field" dir="ltr" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">מפתח מנהל</label>
            <input type="password" value={newUser.key} onChange={e => setNewUser(p => ({...p, key: e.target.value}))} className="input-field" dir="ltr" placeholder="Admin key" />
          </div>
        </div>
        <button onClick={() => userMut.mutate(newUser)} className="btn-primary flex items-center gap-2">
          <UserPlus className="w-4 h-4" />
          צור משתמש
        </button>
      </div>

      {/* Current user info */}
      <div className="section-card p-6">
        <h2 className="text-base font-semibold text-gray-700 mb-3">המשתמש הנוכחי</h2>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full roshan-gold-bg flex items-center justify-center">
            <span className="text-white font-bold">{user?.email?.[0]?.toUpperCase()}</span>
          </div>
          <div>
            <p className="font-medium text-gray-800">{user?.email}</p>
            <p className="text-sm text-gray-500">{user?.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
