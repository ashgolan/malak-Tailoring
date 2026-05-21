import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../utils/theme";
import { useAuthStore } from "../store/authStore";
import { useStyles } from "../hooks/useStyles";
import toast from "react-hot-toast";

const fo = (e, color) => { e.target.style.borderColor = color; };
const bl = (e) => { e.target.style.borderColor = "var(--border)"; };

const Icon = {
  store:  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 6l6-4 6 4v8H2V6z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/><path d="M6 10h4v4H6z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  phone:  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 2h3l1.5 3.5L6 7a7.9 7.9 0 004 4l1.5-1.5L15 11v3a1 1 0 01-1 1A13 13 0 012 3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  address:<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="6" r="2.5" stroke="currentColor" strokeWidth="1.3"/><path d="M8 1C5.239 1 3 3.239 3 6c0 4 5 9 5 9s5-5 5-9c0-2.761-2.239-5-5-5z" stroke="currentColor" strokeWidth="1.3"/></svg>,
  lock:   <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="3" y="7" width="10" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M5 7V5a3 3 0 016 0v2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  shield: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2l5 2v4c0 3-2 5.5-5 6.5C5 13.5 3 11 3 8V4l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  save:   <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2h9l3 3v9a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 1v4h6V1M4 9h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  backup: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  image:  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  eye:    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  eyeOff: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M3 13L13 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  percent:<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="11.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M3 13L13 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

function Field({ label, hint, icon, children }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:12,fontWeight:600,color:"var(--text-3)"}}>{label}</label>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",top:"50%",right:11,transform:"translateY(-50%)",color:"var(--text-4)",pointerEvents:"none",display:"flex"}}>{icon}</div>
        {children}
      </div>
      {hint&&<div style={{fontSize:11,color:"var(--text-4)"}}>{hint}</div>}
    </div>
  );
}

function PasswordField({ label, icon, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:12,fontWeight:600,color:"var(--text-3)"}}>{label}</label>
      <div style={{position:"relative"}}>
        <div style={{position:"absolute",top:"50%",right:11,transform:"translateY(-50%)",color:"var(--text-4)",pointerEvents:"none",display:"flex"}}>{icon}</div>
        <input type={show?"text":"password"} value={value} onChange={onChange} placeholder={placeholder} autoComplete="new-password"
          style={{width:"100%",padding:"9px 36px 9px 36px",background:"var(--bg-input)",border:"1px solid var(--border)",borderRadius:8,fontSize:13,outline:"none",boxSizing:"border-box",fontFamily:"inherit",color:"var(--text-1)",direction:"rtl",transition:"border-color 0.15s"}}/>
        <button type="button" onClick={()=>setShow(s=>!s)}
          style={{position:"absolute",top:"50%",left:10,transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text-4)",display:"flex",padding:0}}>
          {show?Icon.eyeOff:Icon.eye}
        </button>
      </div>
    </div>
  );
}

function SectionCard({ title, icon, gradient, children, defaultOpen=false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{background:"var(--bg-card)",border:"1px solid var(--border-light)",borderRadius:14,overflow:"hidden"}}>
      <div onClick={()=>setOpen(o=>!o)}
        style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 18px",cursor:"pointer",userSelect:"none",background:open?"var(--bg-hover)":"var(--bg-card)",borderBottom:open?"1px solid var(--border-light)":"none",transition:"all 0.2s"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:gradient,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,color:"#fff",fontSize:16}}>{icon}</div>
          <div style={{fontSize:14,fontWeight:700,color:"var(--text-1)"}}>{title}</div>
        </div>
        <div style={{fontSize:18,color:"var(--text-4)",transition:"transform 0.2s",transform:open?"rotate(180deg)":"rotate(0deg)"}}>⌄</div>
      </div>
      {open&&(
        <div style={{padding:"18px 18px",display:"flex",flexDirection:"column",gap:14}}>
          {children}
        </div>
      )}
    </div>
  );
}

function UsersList({ theme }) {
  const { user:currentUser } = useAuthStore();
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

  useEffect(()=>{ fetchUsers(); },[]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const key = prompt("הזן מפתח מנהל:");
      if (!key) return;
      const { api: a } = await import("../api");
      await a.post("/users", { ...addForm, key });
      toast.success("משתמש נוסף ✓");
      setAddForm({ email:"", password:"", role:"Admin" });
      setShowAdd(false);
      fetchUsers();
    } catch(e) { toast.error(e.response?.data||"שגיאה"); }
    finally { setAdding(false); }
  };

  if (loading) return <div style={{textAlign:"center",padding:20,color:"var(--text-4)"}}>טוען...</div>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {users.map(u=>(
        <div key={u._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"var(--bg-card-alt)",borderRadius:9,border:"1px solid var(--border)"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text-1)"}}>{u.email}</div>
            <div style={{fontSize:11,color:"var(--text-4)"}}>{u.role}</div>
          </div>
          {u.email===currentUser?.email&&<span style={{fontSize:11,background:theme.primaryLight,color:theme.primary,padding:"2px 8px",borderRadius:20,fontWeight:600}}>אתה</span>}
          {u.email===OWNER_EMAIL&&<span style={{fontSize:11,background:"#fef3c7",color:"#92400e",padding:"2px 8px",borderRadius:20,fontWeight:600}}>בעלים</span>}
        </div>
      ))}
      {!showAdd ? (
        <button onClick={()=>setShowAdd(true)}
          style={{padding:"9px",background:theme.gradient,color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
          + הוסף משתמש
        </button>
      ) : (
        <form onSubmit={handleAdd} style={{display:"flex",flexDirection:"column",gap:10,padding:"14px",background:"var(--bg-card-alt)",borderRadius:10,border:"1px solid var(--border)"}}>
          <input type="email" placeholder="אימייל" value={addForm.email} onChange={e=>setAddForm(p=>({...p,email:e.target.value}))} required
            style={{width:"100%",padding:"9px 12px",background:"var(--bg-input)",border:"1px solid var(--border)",borderRadius:8,fontSize:13,outline:"none",color:"var(--text-1)",fontFamily:"inherit"}}/>
          <input type="password" placeholder="סיסמה (מינ 10 תווים)" value={addForm.password} onChange={e=>setAddForm(p=>({...p,password:e.target.value}))} required
            style={{width:"100%",padding:"9px 12px",background:"var(--bg-input)",border:"1px solid var(--border)",borderRadius:8,fontSize:13,outline:"none",color:"var(--text-1)",fontFamily:"inherit"}}/>
          <div style={{display:"flex",gap:8}}>
            <button type="submit" disabled={adding}
              style={{flex:2,padding:"9px",background:theme.gradient,color:"#fff",border:"none",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>
              {adding?"מוסיף...":"הוסף"}
            </button>
            <button type="button" onClick={()=>setShowAdd(false)}
              style={{flex:1,padding:"9px",background:"var(--btn-cancel-bg)",color:"var(--btn-cancel-text)",border:"1px solid var(--btn-cancel-bdr)",borderRadius:8,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              ביטול
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

const inputStyle = {
  border:"1px solid var(--border)", borderRadius:8, padding:"9px 36px 9px 10px",
  fontSize:13, color:"var(--text-1)", outline:"none", background:"var(--bg-input)",
  width:"100%", boxSizing:"border-box", fontFamily:"inherit", direction:"rtl",
  transition:"border-color 0.15s",
};

const btnStyle = (bg) => ({
  padding:"10px 16px", background:bg, color:"#fff", border:"none", borderRadius:9,
  fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
  display:"flex", alignItems:"center", gap:8,
});

export default function SettingsPage() {
  const { theme, themeName, setTheme } = useTheme();
  const qc = useQueryClient();
  const fileRef = useRef(null);
  const restoreRef = useRef(null);
  const [restoreFile, setRestoreFile] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [sendingBackup, setSendingBackup] = useState(false);

  const { data:settings } = useQuery({ queryKey:["settings"], queryFn:()=>settingsApi.get().then(r=>r.data) });
  const [form, setForm] = useState({ storeName:"", storePhone:"", storeAddress:"", footerText:"", logoBase64:"", maamValue:"17", masValue:"2.5" });
  const [secForm, setSecForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [logoPreview, setLogoPreview] = useState("");

  useEffect(()=>{
    if(settings){
      setForm({ storeName:settings.storeName||"", storePhone:settings.storePhone||"", storeAddress:settings.storeAddress||"", footerText:settings.footerText||"", logoBase64:settings.logoBase64||"", maamValue:settings.maamValue!==undefined?String(settings.maamValue):"17", masValue:settings.masValue!==undefined?String(settings.masValue):"2.5" });
      setLogoPreview(settings.logoBase64||"");
    }
  },[settings]);

  const saveMut = useMutation({ mutationFn:(data)=>settingsApi.update(data), onSuccess:()=>{ toast.success("ההגדרות נשמרו ✓"); qc.invalidateQueries(["settings"]); qc.invalidateQueries(["taxValues"]); }, onError:(e)=>toast.error(e.response?.data?.message||"שגיאה") });
  const secMut  = useMutation({ mutationFn:(data)=>settingsApi.updateSecurity(data), onSuccess:()=>{ toast.success("הסיסמה עודכנה ✓"); setSecForm({currentPassword:"",newPassword:"",confirmPassword:""}); }, onError:(e)=>toast.error(e.response?.data?.message||"שגיאה") });

  const handleSave = () => saveMut.mutate({ ...form, logoBase64:logoPreview });

  const handleSecurity = () => {
    if(secForm.newPassword!==secForm.confirmPassword){ toast.error("הסיסמאות אינן תואמות"); return; }
    secMut.mutate({ currentPassword:secForm.currentPassword, newPassword:secForm.newPassword });
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0]; if(!file) return;
    if(file.size>500*1024){ toast.error("הקובץ גדול מדי (מקסימום 500KB)"); return; }
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ✅ תוקן — מוריד ZIP
  const handleBackup = async () => {
    try {
      const res = await settingsApi.backup();
      const blob = new Blob([res.data], { type: "application/zip" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `backup_${Date.now()}.zip`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("הגיבוי הורד ✓");
    } catch { toast.error("שגיאה בגיבוי"); }
  };

  const handleRestore = async () => {
    if(!restoreFile) return;
    if(!window.confirm("⚠️ האם אתה בטוח? הנתונים יתווספו לבסיס הנתונים הקיים.")) return;
    setRestoring(true);
    try {
      const text = await restoreFile.text();
      const json = JSON.parse(text);
      await settingsApi.restore(json);
      toast.success("השחזור הושלם ✓");
      qc.invalidateQueries();
    } catch { toast.error("שגיאה בשחזור"); }
    finally { setRestoring(false); setRestoreFile(null); }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,direction:"rtl",maxWidth:720,margin:"0 auto"}}>

      {/* Header */}
      <div style={{background:"var(--bg-card)",border:"1px solid var(--border-light)",borderRadius:14,padding:"18px 22px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontSize:11,color:theme.primary,fontWeight:600,letterSpacing:"0.07em",textTransform:"uppercase",marginBottom:4}}>מתפרת רושאן</div>
          <div style={{fontSize:20,fontWeight:700,color:"var(--text-1)"}}>הגדרות</div>
          <div style={{fontSize:12,color:"var(--text-4)",marginTop:3}}>פרטי העסק, מסים, אבטחה וגיבוי</div>
        </div>
        <div style={{width:40,height:40,borderRadius:11,background:theme.gradient,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:18}}>⚙️</div>
      </div>

      {/* Business details */}
      <SectionCard title="פרטי העסק" icon="🏪" gradient={theme.gradient} defaultOpen={true}>
        <Field label="שם העסק" icon={Icon.store}><input value={form.storeName} onChange={e=>setForm(p=>({...p,storeName:e.target.value}))} placeholder="מתפרת רושאן" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></Field>
        <Field label="טלפון" icon={Icon.phone}><input value={form.storePhone} onChange={e=>setForm(p=>({...p,storePhone:e.target.value}))} placeholder="050-0000000" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></Field>
        <Field label="כתובת" icon={Icon.address}><input value={form.storeAddress} onChange={e=>setForm(p=>({...p,storeAddress:e.target.value}))} placeholder="רחוב, עיר" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></Field>
        <Field label="טקסט תחתון להדפסה" hint="יופיע בתחתית כל דוח" icon={Icon.store}>
          <textarea value={form.footerText} onChange={e=>setForm(p=>({...p,footerText:e.target.value}))} placeholder="תודה על שיתוף הפעולה!" rows={2}
            style={{...inputStyle,lineHeight:1.6,paddingTop:9,resize:"vertical"}} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/>
        </Field>
        {/* Logo */}
        <div style={{display:"flex",flexDirection:"column",gap:6}}>
          <label style={{fontSize:12,fontWeight:600,color:"var(--text-3)"}}>לוגו העסק</label>
          <div onClick={()=>fileRef.current?.click()}
            style={{border:`1.5px dashed ${logoPreview?theme.accent:"var(--border)"}`,borderRadius:12,padding:"20px 16px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer",background:logoPreview?theme.primaryLight:"var(--bg-hover)",minHeight:90}}>
            {logoPreview ? <img src={logoPreview} alt="לוגו" style={{maxWidth:280,maxHeight:70,objectFit:"contain",borderRadius:6}}/> : (
              <><div style={{width:36,height:36,borderRadius:9,background:theme.primaryLight,color:theme.primary,display:"flex",alignItems:"center",justifyContent:"center"}}>{Icon.image}</div>
              <div style={{textAlign:"center"}}><div style={{fontSize:13,fontWeight:600,color:"var(--text-2)"}}>לחץ להעלאת לוגו</div><div style={{fontSize:11,color:"var(--text-4)",marginTop:3}}>PNG / JPG · מקסימום 500KB</div></div></>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={handleLogoUpload}/>
          {logoPreview&&<button onClick={()=>{setLogoPreview("");setForm(p=>({...p,logoBase64:""}));}} style={{alignSelf:"flex-start",background:"var(--colored-bg)",color:"#ef4444",border:"none",borderRadius:7,padding:"4px 12px",fontSize:12,fontWeight:600,cursor:"pointer"}}>הסר לוגו</button>}
        </div>
        <button onClick={handleSave} disabled={saveMut.isPending} style={btnStyle(theme.primary)}>
          {Icon.save} {saveMut.isPending?"שומר...":"שמור פרטי עסק"}
        </button>
      </SectionCard>

      {/* Tax values */}
      <SectionCard title="ערכי מס" icon="%" gradient="linear-gradient(135deg, #d97706, #b45309)">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <Field label="מע״מ %" icon={Icon.percent}><input type="number" value={form.maamValue} onChange={e=>setForm(p=>({...p,maamValue:e.target.value}))} min="0" max="100" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></Field>
          <Field label="ניכוי במקור %" icon={Icon.percent}><input type="number" value={form.masValue} onChange={e=>setForm(p=>({...p,masValue:e.target.value}))} min="0" max="100" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></Field>
        </div>
        <div style={{background:"rgba(217,119,6,0.1)",border:"1px solid rgba(217,119,6,0.3)",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#b45309"}}>
          ערכי המס ישמשו לחישובים אוטומטיים בכל הדפים
        </div>
        <button onClick={handleSave} disabled={saveMut.isPending} style={btnStyle("#d97706")}>{Icon.save} {saveMut.isPending?"שומר...":"שמור ערכי מס"}</button>
      </SectionCard>

      {/* Theme */}
      <SectionCard title="ערכת צבעים" icon="🎨" gradient="linear-gradient(135deg, #8b5cf6, #6d28d9)">
        <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8}}>
          {Object.entries(THEMES).map(([key,t])=>(
            <button key={key} onClick={()=>setTheme(key)} title={t.name}
              style={{display:"flex",flexDirection:"column",alignItems:"center",gap:4,padding:"8px 4px",borderRadius:10,border:`2px solid ${themeName===key?t.primary:"var(--border)"}`,background:themeName===key?t.primaryLight:"var(--bg-card)",cursor:"pointer",fontFamily:"inherit",transition:"all 0.15s"}}>
              <div style={{width:24,height:24,borderRadius:"50%",background:t.gradient}}/>
              <span style={{fontSize:10,fontWeight:themeName===key?700:400,color:themeName===key?t.primary:"var(--text-3)"}}>{t.name}</span>
              {themeName===key&&<span style={{fontSize:10,color:t.primary}}>✓</span>}
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Backup */}
      <SectionCard title="גיבוי נתונים" icon="💾" gradient="linear-gradient(135deg, #059669, #047857)">
        {/* ✅ תוקן — ZIP במקום JSON */}
        <div style={{background:"rgba(5,150,105,0.1)",border:"1px solid rgba(5,150,105,0.3)",borderRadius:9,padding:"12px 16px",fontSize:13,color:"#047857",lineHeight:1.6}}>
          <strong>גיבוי ידני</strong> — לחץ להורדת כל הנתונים כקובץ גיבוי (ZIP) לשחזור עתידי.
        </div>
        <button onClick={handleBackup} style={btnStyle("#059669")}>{Icon.backup} הורד גיבוי עכשיו</button>
        <button onClick={async()=>{setSendingBackup(true);try{await settingsApi.sendBackup();toast.success("הגיבוי נשלח למייל ✓");}catch{toast.error("שגיאה");}finally{setSendingBackup(false);}}} disabled={sendingBackup} style={btnStyle("#0284c7")}>
          📧 {sendingBackup?"שולח...":"שלח גיבוי למייל"}
        </button>
        <div style={{borderTop:"1px solid var(--border)",paddingTop:14}}>
          <label style={{fontSize:12,fontWeight:600,color:"var(--text-3)",display:"block",marginBottom:8}}>שחזור מקובץ גיבוי</label>
          <input ref={restoreRef} type="file" accept=".json,.zip" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)setRestoreFile(f);}}/>
          <button onClick={()=>restoreRef.current?.click()} style={{...btnStyle("var(--bg-card)"),color:"var(--text-2)",border:"1px solid var(--border)",marginBottom:8}}>
            📂 {restoreFile?restoreFile.name:"בחר קובץ גיבוי"}
          </button>
          {restoreFile&&<button onClick={handleRestore} disabled={restoring} style={btnStyle("#d97706")}>{restoring?"משחזר...":"שחזר עכשיו"}</button>}
        </div>
      </SectionCard>

      {/* Users */}
      <SectionCard title="ניהול משתמשים" icon="👥" gradient="linear-gradient(135deg, #0284c7, #0369a1)">
        <UsersList theme={theme}/>
      </SectionCard>

      {/* Security */}
      <SectionCard title="אבטחה — שינוי סיסמה" icon="🔒" gradient="linear-gradient(135deg, #b45309, #92400e)">
        <div style={{background:"rgba(180,83,9,0.1)",border:"1px solid rgba(180,83,9,0.3)",borderRadius:9,padding:"10px 14px",fontSize:12,color:"#b45309",fontWeight:500}}>
          שינוי הסיסמה ידרוש את הסיסמה הנוכחית
        </div>
        <PasswordField label="סיסמה נוכחית *" icon={Icon.lock} value={secForm.currentPassword} onChange={e=>setSecForm(p=>({...p,currentPassword:e.target.value}))} placeholder="הסיסמה הנוכחית שלך"/>
        <PasswordField label="סיסמה חדשה" icon={Icon.lock} value={secForm.newPassword} onChange={e=>setSecForm(p=>({...p,newPassword:e.target.value}))} placeholder="לפחות 10 תווים"/>
        <PasswordField label="אימות סיסמה חדשה" icon={Icon.lock} value={secForm.confirmPassword} onChange={e=>setSecForm(p=>({...p,confirmPassword:e.target.value}))} placeholder="הזן שוב את הסיסמה"/>
        <button onClick={handleSecurity} disabled={secMut.isPending} style={btnStyle("#b45309")}>{Icon.shield} {secMut.isPending?"שומר...":"עדכן סיסמה"}</button>
      </SectionCard>

      <div style={{textAlign:"center",padding:"12px",fontSize:11,color:"var(--text-4)"}}>
        מתפרת רושאן v2.0 · 2025
      </div>
    </div>
  );
}
