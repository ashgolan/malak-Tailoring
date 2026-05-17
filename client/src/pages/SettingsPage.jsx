import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../utils/theme";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const fo = (e, color) => { e.target.style.borderColor = color; };
const bl = (e) => { e.target.style.borderColor = "#e5e7eb"; };

const Icon = {
  store:    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 6l6-4 6 4v8H2V6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 10h4v4H6z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  phone:    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5L6 7a7.9 7.9 0 004 4l1.5-1.5L15 11v3a1 1 0 01-1 1A13 13 0 012 3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  address:  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1C5.239 1 3 3.239 3 6c0 4 5 9 5 9s5-5 5-9c0-2.761-2.239-5-5-5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  lock:     <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><circle cx="8" cy="10.5" r="1" fill="currentColor"/></svg>,
  shield:   <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2l5 2v4c0 3-2 5.5-5 6.5C5 13.5 3 11 3 8V4l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M5.5 8l2 2 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  save:     <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 14V3l2-1h6l2 2v10H3z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><rect x="5" y="9" width="6" height="5" rx="0.5" stroke="currentColor" strokeWidth="1.3"/></svg>,
  check:    <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  eye:      <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  eyeOff:   <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M2 2l12 12M6.5 6.6A2 2 0 0010 10M4 4.9C2.5 6 1 8 1 8s3 5 7 5c1.4 0 2.7-.5 3.8-1.2M7 3.1C7.3 3 7.7 3 8 3c4 0 7 5 7 5s-.7 1.2-2 2.4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  image:    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="10" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><circle cx="5.5" cy="6.5" r="1" fill="currentColor"/><path d="M2 11l3-3 2.5 2.5L10 8l4 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  backup:   <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v8M5 7l3 3 3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 11v2h10v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  percent:  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="11.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M3 13L13 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  palette:  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.3"/><circle cx="5" cy="7" r="1" fill="currentColor"/><circle cx="8" cy="5" r="1" fill="currentColor"/><circle cx="11" cy="7" r="1" fill="currentColor"/></svg>,
};

const inputStyle = {
  border: "1px solid #e5e7eb", borderRadius: 8, padding: "9px 36px 9px 10px",
  fontSize: 13, color: "#1a1a1a", outline: "none", background: "#fff",
  width: "100%", boxSizing: "border-box", fontFamily: "inherit", direction: "rtl",
  transition: "border-color 0.15s, box-shadow 0.15s",
};

function Field({ label, hint, icon, children }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:12, fontWeight:600, color:"#555" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", top:"50%", right:11, transform:"translateY(-50%)", color:"#bbb", pointerEvents:"none", display:"flex" }}>{icon}</div>
        {children}
      </div>
      {hint && <div style={{ fontSize:11, color:"#bbb" }}>{hint}</div>}
    </div>
  );
}

function PasswordField({ label, icon, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
      <label style={{ fontSize:12, fontWeight:600, color:"#555" }}>{label}</label>
      <div style={{ position:"relative" }}>
        <div style={{ position:"absolute", top:"50%", right:11, transform:"translateY(-50%)", color:"#bbb", pointerEvents:"none", display:"flex" }}>{icon}</div>
        <input type={show ? "text" : "password"} value={value} onChange={onChange} placeholder={placeholder}
          autoComplete="new-password"
          style={{ ...inputStyle, paddingLeft:36 }} />
        <button type="button" onClick={() => setShow(s => !s)}
          style={{ position:"absolute", top:"50%", left:10, transform:"translateY(-50%)", background:"none", border:"none", cursor:"pointer", color:"#bbb", display:"flex", padding:0 }}>
          {show ? Icon.eyeOff : Icon.eye}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, gradient, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background:"#fff", border:"1px solid #e8e8e8", borderRadius:14, overflow:"hidden" }}>
      {/* Header - clickable */}
      <div onClick={() => setOpen(o => !o)}
        style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 18px", cursor:"pointer", userSelect:"none",
          background: open ? "#fafafa" : "#fff", borderBottom: open ? "1px solid #f0f0f0" : "none", transition:"all 0.2s" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ width:32, height:32, borderRadius:8, background:gradient, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, color:"#fff", fontSize:16 }}>{icon}</div>
          <div style={{ fontSize:14, fontWeight:700, color:"#1a1a1a" }}>{title}</div>
        </div>
        <div style={{ fontSize:18, color:"#9ca3af", transition:"transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>⌄</div>
      </div>
      {/* Content - animated */}
      {open && (
        <div style={{ padding:"18px 18px", display:"flex", flexDirection:"column", gap:14, animation:"slideDown 0.2s ease" }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Users Management Component ────────────────────────────────
function UsersList({ theme }) {
  const { user: currentUser } = useAuthStore();
  const OWNER_EMAIL = "alaa.t.shaalan@gmail.com";

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ email:"", password:"", role:"Admin" });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { api: a } = await import("../api");
      const res = await a.get("/users");
      setUsers(Array.isArray(res.data) ? res.data : []);
    } catch { setUsers([]); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const { api: a } = await import("../api");
      await a.post("/users/register", { ...addForm, key: "admin" });
      toast.success("משתמש נוסף ✓");
      setShowAdd(false);
      setAddForm({ email:"", password:"", role:"Admin" });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "שגיאה");
    } finally { setAdding(false); }
  };

  const handleDelete = async (user) => {
    // Protection 1: cannot delete owner
    if (user.email === OWNER_EMAIL) {
      toast.error("לא ניתן למחוק את המנהל הראשי");
      return;
    }
    // Protection 2: cannot delete yourself
    if (user._id === currentUser?._id || user.email === currentUser?.email) {
      toast.error("לא ניתן למחוק את המשתמש המחובר כעת");
      return;
    }
    if (!window.confirm(`למחוק את ${user.email}?`)) return;
    try {
      const { api: a } = await import("../api");
      await a.delete("/users", { data: { _id: user._id, key: "admin" } });
      toast.success("משתמש נמחק ✓");
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data || "שגיאה");
    }
  };

  const canDelete = (user) =>
    user.email !== OWNER_EMAIL &&
    user._id !== currentUser?._id &&
    user.email !== currentUser?.email;

  const fo2 = (e) => { e.target.style.borderColor = theme.accent; };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
      {loading ? (
        <div style={{ textAlign:"center", padding:20, color:"#9ca3af" }}>טוען...</div>
      ) : users.length === 0 ? (
        <div style={{ textAlign:"center", padding:20, color:"#9ca3af", fontSize:13 }}>אין משתמשים</div>
      ) : users.map(user => (
        <div key={user._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"10px 14px", background:"#f9fafb", borderRadius:10, border:"1px solid #f0f0ef" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:"50%", background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:700, fontSize:14 }}>
              {user.email?.[0]?.toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize:13, fontWeight:600, color:"#1f2937", display:"flex", alignItems:"center", gap:6 }}>
                {user.email}
                {user.email === OWNER_EMAIL && <span style={{ fontSize:10, background:"#fef3c7", color:"#92400e", padding:"1px 6px", borderRadius:6, fontWeight:600 }}>מנהל ראשי</span>}
                {user.email === currentUser?.email && <span style={{ fontSize:10, background:theme.primaryLight, color:theme.primary, padding:"1px 6px", borderRadius:6, fontWeight:600 }}>אתה</span>}
              </div>
              <div style={{ fontSize:11, color:"#9ca3af" }}>{user.role || "Admin"}</div>
            </div>
          </div>
          {canDelete(user) ? (
            <button onClick={() => handleDelete(user)}
              style={{ padding:"4px 12px", background:"#fef2f2", color:"#ef4444", border:"1px solid #fecaca", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              מחק
            </button>
          ) : (
            <span style={{ fontSize:11, color:"#d1d5db" }}>מוגן</span>
          )}
        </div>
      ))}

      {!showAdd ? (
        <button onClick={() => setShowAdd(true)}
          style={{ padding:"9px 16px", background:theme.gradient, color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit", alignSelf:"flex-start" }}>
          + הוסף משתמש
        </button>
      ) : (
        <form onSubmit={handleAdd} style={{ background:"#f0f9ff", border:"1px solid #bae6fd", borderRadius:10, padding:"16px", display:"flex", flexDirection:"column", gap:10 }}>
          <div style={{ fontSize:13, fontWeight:700, color:"#0284c7" }}>משתמש חדש</div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:4 }}>אימייל</label>
            <input type="email" value={addForm.email} onChange={e => setAddForm(p=>({...p,email:e.target.value}))} required
              style={{ ...inputStyle }} onFocus={fo2} onBlur={bl} />
          </div>
          <div>
            <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:4 }}>סיסמה</label>
            <input type="password" value={addForm.password} onChange={e => setAddForm(p=>({...p,password:e.target.value}))} required
              autoComplete="new-password" style={{ ...inputStyle }} onFocus={fo2} onBlur={bl} />
          </div>
          <div style={{ display:"flex", gap:8 }}>
            <button type="submit" disabled={adding}
              style={{ flex:2, padding:"9px", background:theme.gradient, color:"#fff", border:"none", borderRadius:8, fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
              {adding ? "מוסיף..." : "הוסף"}
            </button>
            <button type="button" onClick={() => setShowAdd(false)}
              style={{ flex:1, padding:"9px", background:"#fff", color:"#6b7280", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>
              ביטול
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function SettingsPage() {
  const { theme, themeName, setTheme } = useTheme();
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const restoreRef = useRef(null);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoring, setRestoring] = useState(false);

  const { data: settings } = useQuery({ queryKey: ["settings"], queryFn: () => settingsApi.get().then(r => r.data) });

  const [form, setForm] = useState({ storeName:"", storePhone:"", storeAddress:"", footerText:"", logoBase64:"", maamValue:"17", masValue:"2.5" });
  const [secForm, setSecForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(() => {
    if (settings) {
      setForm({
        storeName:    settings.storeName    || "",
        storePhone:   settings.storePhone   || "",
        storeAddress: settings.storeAddress || "",
        footerText:   settings.footerText   || "",
        logoBase64:   settings.logoBase64   || "",
        maamValue:    settings.maamValue    !== undefined ? String(settings.maamValue) : "17",
        masValue:     settings.masValue     !== undefined ? String(settings.masValue)  : "2.5",
      });
      setLogoPreview(settings.logoBase64 || "");
    }
  }, [settings]);

  const saveMut = useMutation({
    mutationFn: (data) => settingsApi.update(data),
    onSuccess: () => { toast.success("ההגדרות נשמרו ✓"); qc.invalidateQueries(["settings"]); qc.invalidateQueries(["taxValues"]); },
    onError: (e) => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const secMut = useMutation({
    mutationFn: (data) => settingsApi.updateSecurity(data),
    onSuccess: () => { toast.success("הסיסמה עודכנה ✓"); setSecForm({ currentPassword:"", newPassword:"", confirmPassword:"" }); },
    onError: (e) => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const handleSave = () => {
    saveMut.mutate({ ...form, logoBase64: logoPreview });
  };

  const handleSecurity = () => {
    if (secForm.newPassword !== secForm.confirmPassword) { toast.error("הסיסמאות אינן תואמות"); return; }
    secMut.mutate({ currentPassword: secForm.currentPassword, newPassword: secForm.newPassword });
  };

  const handleRestoreUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) setRestoreFile(file);
  };

  const handleRestore = async () => {
    if (!restoreFile) return;
    if (!window.confirm("⚠️ האם אתה בטוח? הנתונים יתווספו לבסיס הנתונים הקיים.")) return;
    setRestoring(true);
    try {
      const text = await restoreFile.text();
      const parsed = JSON.parse(text);
      const emergencyKey = prompt("הזן מפתח חירום:");
      if (!emergencyKey) { setRestoring(false); return; }
      const res = await import("../api").then(m => m.api.post("/emergency/restore", { emergencyKey, data: parsed.data }));
      toast.success(`שוחזרו: ${Object.values(res.data.restored).reduce((a,b)=>a+b,0)} רשומות ✓`);
      setRestoreFile(null);
    } catch (err) {
      toast.error(err.response?.data?.message || "שגיאה בשחזור");
    } finally {
      setRestoring(false);
    }
  };

  const handleBackup = async () => {
    try {
      const res = await settingsApi.backup();
      const blob = new Blob([JSON.stringify(res.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `roshan-backup-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("גיבוי הורד בהצלחה ✓");
    } catch {
      toast.error("שגיאה בייצוא הגיבוי");
    }
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 500 * 1024) { toast.error("הקובץ גדול מדי — מקסימום 500KB"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { setLogoPreview(ev.target.result); setForm(p => ({...p, logoBase64: ev.target.result})); };
    reader.readAsDataURL(file);
  };

  const btnStyle = (color) => ({
    display:"flex", alignItems:"center", gap:6, padding:"10px 20px",
    background:color, color:"#fff", border:"none", borderRadius:9,
    fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
  });

  return (
    <div style={{ direction:"rtl", fontFamily:"inherit" }}>
      <style>{`
        input:focus, textarea:focus { border-color: ${theme.accent} !important; box-shadow: 0 0 0 3px ${theme.primaryLight} !important; }
        textarea { resize: vertical; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-8px); } to { opacity:1; transform:translateY(0); } }
      `}</style>

      <div style={{ maxWidth:720, display:"flex", flexDirection:"column", gap:16 }}>

        {/* Header */}
        <div style={{ background:"#fff", border:"1px solid #e8e8e8", borderRadius:14, padding:"18px 22px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <div style={{ fontSize:11, color:theme.primary, fontWeight:600, letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:4 }}>מתפרת רושאן</div>
            <div style={{ fontSize:20, fontWeight:700, color:"#1a1a1a" }}>הגדרות</div>
            <div style={{ fontSize:12, color:"#aaa", marginTop:3 }}>פרטי העסק, מסים, אבטחה וגיבוי</div>
          </div>
          <div style={{ width:40, height:40, borderRadius:11, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:18 }}>⚙️</div>
        </div>

        {/* Business details */}
        <SectionCard title="פרטי העסק" icon="🏪" gradient={theme.gradient} defaultOpen={true}>
          <Field label="שם העסק" icon={Icon.store}>
            <input value={form.storeName} onChange={e => setForm(p=>({...p,storeName:e.target.value}))} placeholder="מתפרת רושאן" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
          </Field>
          <Field label="טלפון" icon={Icon.phone}>
            <input value={form.storePhone} onChange={e => setForm(p=>({...p,storePhone:e.target.value}))} placeholder="050-0000000" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
          </Field>
          <Field label="כתובת" icon={Icon.address}>
            <input value={form.storeAddress} onChange={e => setForm(p=>({...p,storeAddress:e.target.value}))} placeholder="רחוב, עיר" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
          </Field>
          <Field label="טקסט תחתון להדפסה" hint="יופיע בתחתית כל דוח מודפס" icon={Icon.store}>
            <textarea value={form.footerText} onChange={e => setForm(p=>({...p,footerText:e.target.value}))} placeholder="תודה על שיתוף הפעולה!" rows={2}
              style={{ ...inputStyle, lineHeight:1.6, paddingTop:9 }} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
          </Field>

          {/* Logo */}
          <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
            <label style={{ fontSize:12, fontWeight:600, color:"#555" }}>לוגו העסק</label>
            <div onClick={() => fileRef.current?.click()}
              style={{ border:`1.5px dashed ${logoPreview ? theme.accent : "#ddd"}`, borderRadius:12, padding:"20px 16px", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:10, cursor:"pointer", background: logoPreview ? theme.primaryLight : "#fafafa", minHeight:90 }}>
              {logoPreview ? (
                <img src={logoPreview} alt="לוגו" style={{ maxWidth:280, maxHeight:70, objectFit:"contain", borderRadius:6 }} />
              ) : (
                <>
                  <div style={{ width:36, height:36, borderRadius:9, background:theme.primaryLight, color:theme.primary, display:"flex", alignItems:"center", justifyContent:"center" }}>{Icon.image}</div>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:600, color:"#555" }}>לחץ להעלאת לוגו</div>
                    <div style={{ fontSize:11, color:"#aaa", marginTop:3 }}>PNG / JPG · מקסימום 500KB</div>
                  </div>
                </>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{ display:"none" }} onChange={handleLogoUpload} />
            {logoPreview && (
              <button onClick={() => { setLogoPreview(""); setForm(p=>({...p,logoBase64:""})); }}
                style={{ alignSelf:"flex-start", background:"#fef2f2", color:"#ef4444", border:"none", borderRadius:7, padding:"4px 12px", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                הסר לוגו
              </button>
            )}
          </div>

          <button onClick={handleSave} disabled={saveMut.isPending} style={{ ...btnStyle(theme.primary), display:"none" }}>
            {Icon.save} {saveMut.isPending ? "שומר..." : "שמור פרטי עסק"}
          </button>
        </SectionCard>

        {/* Tax values */}
        <SectionCard title="ערכי מס" icon="%" gradient="linear-gradient(135deg, #d97706, #b45309)">
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            <Field label="מע״מ %" icon={Icon.percent}>
              <input type="number" value={form.maamValue} onChange={e => setForm(p=>({...p,maamValue:e.target.value}))} min="0" max="100"
                style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
            </Field>
            <Field label="ניכוי במקור %" icon={Icon.percent}>
              <input type="number" value={form.masValue} onChange={e => setForm(p=>({...p,masValue:e.target.value}))} min="0" max="100"
                style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
            </Field>
          </div>
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:9, padding:"10px 14px", fontSize:12, color:"#92400e" }}>
            ערכי המס ישמשו לחישובים אוטומטיים בכל הדפים
          </div>
        </SectionCard>

        {/* ── Single Save Button ── */}
        <button onClick={handleSave} disabled={saveMut.isPending}
          style={{ padding:"13px", background:theme.gradient, color:"#fff", border:"none", borderRadius:12, fontSize:15, fontWeight:700, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 4px 14px ${theme.primary}40`, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {Icon.save} {saveMut.isPending ? "שומר..." : "💾 שמור את כל ההגדרות"}
        </button>

        {/* Theme - compact */}
        <SectionCard title="ערכת צבעים" icon="🎨" gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)">
          <div style={{ display:"grid", gridTemplateColumns:"repeat(6, 1fr)", gap:8 }}>
            {Object.entries(THEMES).map(([key, t]) => (
              <button key={key} onClick={() => setTheme(key)} title={t.name}
                style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:4, padding:"8px 4px", borderRadius:10, border:`2px solid ${themeName===key ? t.primary : "#e5e7eb"}`, background: themeName===key ? t.primaryLight : "#fff", cursor:"pointer", fontFamily:"inherit", transition:"all 0.15s" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:t.gradient }} />
                <span style={{ fontSize:10, fontWeight: themeName===key ? 700 : 400, color: themeName===key ? t.primary : "#6b7280" }}>{t.name}</span>
                {themeName===key && <span style={{ fontSize:10, color:t.primary }}>✓</span>}
              </button>
            ))}
          </div>
        </SectionCard>

        {/* Backup */}
        <SectionCard title="גיבוי נתונים" icon="💾" gradient="linear-gradient(135deg, #059669, #047857)">
          <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:9, padding:"12px 16px", fontSize:13, color:"#065f46", lineHeight:1.6 }}>
            <strong>גיבוי ידני</strong> — לחץ להורדת כל הנתונים כקובץ JSON לשחזור עתידי.
          </div>
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:9, padding:"10px 14px", fontSize:12, color:"#92400e", display:"flex", gap:8, alignItems:"flex-start" }}>
            <span style={{ fontSize:16, flexShrink:0 }}>📧</span>
            <span>
              <strong>גיבוי אוטומטי לילי — פעיל</strong><br/>
              כל לילה בשעה 01:00 נשלח גיבוי אוטומטי לכתובת <strong>alaa.t.shaalan@gmail.com</strong> עם כל נתוני המערכת כקובץ JSON מצורף.
            </span>
          </div>
          <button onClick={handleBackup} style={btnStyle("#059669")}>
            {Icon.backup} הורד גיבוי עכשיו
          </button>
          <button onClick={async () => {
            try {
              const { api } = await import("../api");
              await api.post("/settings/send-backup");
              toast.success("גיבוי נשלח למייל ✓");
            } catch { toast.error("שגיאה בשליחת הגיבוי"); }
          }} style={{ ...btnStyle("#0284c7"), marginTop:-6 }}>
            📧 שלח גיבוי למייל עכשיו
          </button>
          <div style={{ fontSize:11, color:"#9ca3af", marginTop:-8 }}>
            מומלץ לגבות לפחות פעם בשבוע — הקובץ יכיל את כל הנתונים: מכירות, שיקים, הצעות מחיר, מלאי ועוד
          </div>

          {/* Restore */}
          <div style={{ borderTop:"1px solid #f0f0f0", paddingTop:14 }}>
            <div style={{ fontSize:13, fontWeight:700, color:"#374151", marginBottom:10 }}>🔄 שחזור מגיבוי</div>
            <div style={{ background:"#fef2f2", border:"1px solid #fecaca", borderRadius:9, padding:"10px 14px", fontSize:12, color:"#991b1b", marginBottom:10, lineHeight:1.6 }}>
              ⚠️ שחזור יוסיף נתונים מהקובץ לבסיס הנתונים הקיים. לשחזור מלא ללא גישה למערכת — השתמש ב
              <a href="/emergency-restore" target="_blank" style={{ color:"#7c3aed", fontWeight:600 }}> emergency-restore</a>
            </div>
            <input ref={restoreRef} type="file" accept=".json" style={{ display:"none" }} onChange={handleRestoreUpload} />
            <button onClick={() => restoreRef.current?.click()}
              style={{ ...btnStyle("#6b7280"), marginBottom: restoreFile ? 8 : 0 }}>
              📁 בחר קובץ גיבוי להעלאה
            </button>
            {restoreFile && (
              <div style={{ background:"#f0fdf4", border:"1px solid #bbf7d0", borderRadius:8, padding:"10px 14px", fontSize:12, color:"#065f46", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                <span>✅ {restoreFile.name}</span>
                <button onClick={handleRestore} disabled={restoring}
                  style={{ padding:"6px 14px", background:"#059669", color:"#fff", border:"none", borderRadius:7, fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                  {restoring ? "משחזר..." : "שחזר עכשיו"}
                </button>
              </div>
            )}
          </div>
        </SectionCard>

        {/* Users Management */}
        <SectionCard title="ניהול משתמשים" icon="👥" gradient="linear-gradient(135deg, #0284c7, #0369a1)">
          <UsersList theme={theme} />
        </SectionCard>

        {/* Security */}
        <SectionCard title="אבטחה — שינוי סיסמה" icon="🔒" gradient="linear-gradient(135deg, #b45309, #92400e)">
          <div style={{ background:"#fffbeb", border:"1px solid #fde68a", borderRadius:9, padding:"10px 14px", fontSize:12, color:"#92400e", fontWeight:500 }}>
            שינוי הסיסמה ידרוש את הסיסמה הנוכחית
          </div>
          <PasswordField label="סיסמה נוכחית *" icon={Icon.lock} value={secForm.currentPassword}
            onChange={e => setSecForm(p=>({...p,currentPassword:e.target.value}))} placeholder="הסיסמה הנוכחית שלך" />
          <PasswordField label="סיסמה חדשה" icon={Icon.lock} value={secForm.newPassword}
            onChange={e => setSecForm(p=>({...p,newPassword:e.target.value}))} placeholder="לפחות 8 תווים" />
          <PasswordField label="אימות סיסמה חדשה" icon={Icon.lock} value={secForm.confirmPassword}
            onChange={e => setSecForm(p=>({...p,confirmPassword:e.target.value}))} placeholder="הזן שוב את הסיסמה החדשה" />
          <button onClick={handleSecurity} disabled={secMut.isPending} style={btnStyle("#b45309")}>
            {Icon.shield} {secMut.isPending ? "שומר..." : "עדכן סיסמה"}
          </button>
        </SectionCard>

        {/* Version */}
        <div style={{ textAlign:"center", padding:"12px", fontSize:11, color:"#d1d5db" }}>
          מתפרת רושאן v2.0 · 2025
        </div>

      </div>
    </div>
  );
}
