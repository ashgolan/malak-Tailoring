import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { THEMES } from "../utils/theme";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";
import { Sun, Moon } from "lucide-react";

function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    const s = localStorage.getItem("roshan-dark");
    if (s !== null) return s === "true";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    localStorage.setItem("roshan-dark", isDark);
  }, [isDark]);
  useEffect(() => {
    const handler = () => {
      const s = localStorage.getItem("roshan-dark");
      setIsDark(s === "true");
    };
    window.addEventListener("roshan-theme-change", handler);
    return () => window.removeEventListener("roshan-theme-change", handler);
  }, []);
  const toggle = () => {
    setIsDark(d => {
      const next = !d;
      localStorage.setItem("roshan-dark", next);
      document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
      window.dispatchEvent(new Event("roshan-theme-change"));
      return next;
    });
  };
  return { isDark, toggle };
}

const fo = (e, color) => { e.target.style.borderColor = color; };
const bl = (e) => { e.target.style.borderColor = "var(--border)"; };

const inputStyle = {
  border:"1px solid var(--border)", borderRadius:8, padding:"9px 12px",
  fontSize:13, color:"var(--text-1)", outline:"none", background:"var(--bg-input)",
  width:"100%", boxSizing:"border-box", fontFamily:"inherit", direction:"rtl",
  transition:"border-color 0.15s",
};
const btnPrimary = (bg) => ({
  padding:"10px 20px", background:bg, color:"#fff", border:"none", borderRadius:9,
  fontSize:13, fontWeight:600, cursor:"pointer", fontFamily:"inherit",
  display:"flex", alignItems:"center", gap:8,
});

// ── SVG Icons ──────────────────────────────────────────────────
const Icons = {
  save:   <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 2h9l3 3v9a1 1 0 01-1 1H2a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.3"/><path d="M5 1v4h6V1M4 9h8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  backup: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v8m0 0l-3-3m3 3l3-3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><path d="M2 11v2a1 1 0 001 1h10a1 1 0 001-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  image:  <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="1" y="2" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="5.5" cy="6.5" r="1.5" stroke="currentColor" strokeWidth="1.3"/><path d="M1 11l4-4 3 3 2-2 5 5" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  eye:    <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M1 8s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5z" stroke="currentColor" strokeWidth="1.3"/><circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/></svg>,
  eyeOff: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M13 3L3 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/><path d="M3 13L13 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
  shield: <svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2l5 2v4c0 3-2 5.5-5 6.5C5 13.5 3 11 3 8V4l5-2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/></svg>,
  percent:<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="4.5" cy="4.5" r="2" stroke="currentColor" strokeWidth="1.3"/><circle cx="11.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.3"/><path d="M3 13L13 3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>,
};

// ── Field ──────────────────────────────────────────────────────
function Field({ label, hint, children }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:12,fontWeight:600,color:"var(--text-3)"}}>{label}</label>
      {children}
      {hint && <div style={{fontSize:11,color:"var(--text-4)"}}>{hint}</div>}
    </div>
  );
}

// ── Password ───────────────────────────────────────────────────
function PasswordField({ label, value, onChange, placeholder }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:5}}>
      <label style={{fontSize:12,fontWeight:600,color:"var(--text-3)"}}>{label}</label>
      <div style={{position:"relative"}}>
        <input type={show?"text":"password"} value={value} onChange={onChange}
          placeholder={placeholder} autoComplete="new-password"
          style={{...inputStyle,paddingLeft:36}}/>
        <button type="button" onClick={()=>setShow(s=>!s)}
          style={{position:"absolute",top:"50%",left:10,transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",color:"var(--text-4)",display:"flex",padding:0}}>
          {show?Icons.eyeOff:Icons.eye}
        </button>
      </div>
    </div>
  );
}

// ── Users ──────────────────────────────────────────────────────
function UsersList({ theme }) {
  const { user:currentUser } = useAuthStore();
  const OWNER_EMAIL = "alaa.t.shaalan@gmail.com";
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addForm, setAddForm] = useState({ email:"", password:"", role:"Admin" });
  const [adding, setAdding] = useState(false);
  const [showAdd, setShowAdd] = useState(false);

  const fetchUsers = async () => {
    try { setLoading(true); const {api:a}=await import("../api"); const res=await a.get("/users"); setUsers(Array.isArray(res.data)?res.data:[]); }
    catch { setUsers([]); } finally { setLoading(false); }
  };
  useEffect(()=>{ fetchUsers(); },[]);

  const handleAdd = async (e) => {
    e.preventDefault(); setAdding(true);
    try {
      const key=prompt("הזן מפתח מנהל:"); if(!key)return;
      const {api:a}=await import("../api");
      await a.post("/users",{...addForm,key});
      toast.success("משתמש נוסף ✓");
      setAddForm({email:"",password:"",role:"Admin"}); setShowAdd(false); fetchUsers();
    } catch(e){toast.error(e.response?.data||"שגיאה");}
    finally{setAdding(false);}
  };

  if(loading) return <div style={{textAlign:"center",padding:20,color:"var(--text-4)"}}>טוען...</div>;

  return (
    <div style={{display:"flex",flexDirection:"column",gap:10}}>
      {users.map(u=>(
        <div key={u._id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"var(--bg-card-alt)",borderRadius:10,border:"1px solid var(--border)"}}>
          <div>
            <div style={{fontSize:13,fontWeight:600,color:"var(--text-1)"}}>{u.email}</div>
            <div style={{fontSize:11,color:"var(--text-4)",marginTop:2}}>{u.role}</div>
          </div>
          <div style={{display:"flex",gap:6}}>
            {u.email===currentUser?.email&&<span style={{fontSize:11,background:theme.primaryLight,color:theme.primary,padding:"3px 10px",borderRadius:20,fontWeight:600}}>אתה</span>}
            {u.email===OWNER_EMAIL&&<span style={{fontSize:11,background:"#fef3c7",color:"#92400e",padding:"3px 10px",borderRadius:20,fontWeight:600}}>בעלים</span>}
          </div>
        </div>
      ))}
      {!showAdd ? (
        <button onClick={()=>setShowAdd(true)} style={btnPrimary(theme.gradient)}>+ הוסף משתמש</button>
      ) : (
        <form onSubmit={handleAdd} style={{display:"flex",flexDirection:"column",gap:10,padding:"16px",background:"var(--bg-card-alt)",borderRadius:10,border:"1px solid var(--border)"}}>
          <input type="email" placeholder="אימייל" value={addForm.email} onChange={e=>setAddForm(p=>({...p,email:e.target.value}))} required style={inputStyle}/>
          <input type="password" placeholder="סיסמה (מינ 10 תווים)" value={addForm.password} onChange={e=>setAddForm(p=>({...p,password:e.target.value}))} required style={inputStyle}/>
          <div style={{display:"flex",gap:8}}>
            <button type="submit" disabled={adding} style={{...btnPrimary(theme.gradient),flex:2}}>{adding?"מוסיף...":"הוסף"}</button>
            <button type="button" onClick={()=>setShowAdd(false)} style={{flex:1,padding:"10px",background:"var(--btn-cancel-bg)",color:"var(--btn-cancel-text)",border:"1px solid var(--btn-cancel-bdr)",borderRadius:9,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>ביטול</button>
          </div>
        </form>
      )}
    </div>
  );
}

// ── TABS CONFIG ────────────────────────────────────────────────
const TABS = [
  { key:"appearance", label:"מראה",    icon:"🎨" },
  { key:"business",   label:"עסק",     icon:"🏪" },
  { key:"tax",        label:"מיסים",   icon:"%" },
  { key:"backup",     label:"גיבוי",   icon:"💾" },
  { key:"users",      label:"משתמשים", icon:"👥" },
  { key:"security",   label:"אבטחה",   icon:"🔒" },
];

// ══ MAIN ══════════════════════════════════════════════════════
export default function SettingsPage() {
  const { theme, themeName, setTheme } = useTheme();
  const { isDark, toggle: toggleDark } = useDarkMode();
  const qc = useQueryClient();
  const fileRef    = useRef(null);
  const restoreRef = useRef(null);
  const [activeTab, setActiveTab] = useState("appearance");
  const [restoreFile, setRestoreFile]   = useState(null);
  const [restoring, setRestoring]       = useState(false);
  const [sendingBackup, setSendingBackup] = useState(false);
  const [logoPreview, setLogoPreview]   = useState("");
  const [form, setForm] = useState({ storeName:"", storePhone:"", storeAddress:"", footerText:"", maamValue:"17", masValue:"2.5" });
  const [secForm, setSecForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });

  const { data:settings } = useQuery({ queryKey:["settings"], queryFn:()=>settingsApi.get().then(r=>r.data) });

  useEffect(()=>{
    if(settings){
      setForm({ storeName:settings.storeName||"", storePhone:settings.storePhone||"", storeAddress:settings.storeAddress||"", footerText:settings.footerText||"", maamValue:String(settings.maamValue||17), masValue:String(settings.masValue||2.5) });
      setLogoPreview(settings.logoBase64||"");
    }
  },[settings]);

  const saveMut = useMutation({ mutationFn:(d)=>settingsApi.update(d), onSuccess:()=>{ toast.success("נשמר ✓"); qc.invalidateQueries(["settings"]); qc.invalidateQueries(["taxValues"]); }, onError:(e)=>toast.error(e.response?.data?.message||"שגיאה") });
  const secMut  = useMutation({ mutationFn:(d)=>settingsApi.updateSecurity(d), onSuccess:()=>{ toast.success("הסיסמה עודכנה ✓"); setSecForm({currentPassword:"",newPassword:"",confirmPassword:""}); }, onError:(e)=>toast.error(e.response?.data?.message||"שגיאה") });

  const handleSave = () => saveMut.mutate({ ...form, logoBase64:logoPreview });
  const handleSecurity = () => {
    if(secForm.newPassword!==secForm.confirmPassword){ toast.error("הסיסמאות אינן תואמות"); return; }
    secMut.mutate({ currentPassword:secForm.currentPassword, newPassword:secForm.newPassword });
  };
  const handleLogoUpload = (e) => {
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>500*1024){ toast.error("הקובץ גדול מדי (מקסימום 500KB)"); return; }
    const reader=new FileReader(); reader.onload=(ev)=>setLogoPreview(ev.target.result); reader.readAsDataURL(file);
  };
  const handleBackup = async () => {
    try { const res=await settingsApi.backup(); const blob=new Blob([res.data],{type:"application/zip"}); const url=window.URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download=`backup_${Date.now()}.zip`; a.click(); window.URL.revokeObjectURL(url); toast.success("הגיבוי הורד ✓"); }
    catch { toast.error("שגיאה בגיבוי"); }
  };
  const handleRestore = async () => {
    if(!restoreFile) return;
    if(!window.confirm("⚠️ האם אתה בטוח? הנתונים יתווספו לבסיס הנתונים הקיים.")) return;
    setRestoring(true);
    try { const text=await restoreFile.text(); const json=JSON.parse(text); await settingsApi.restore(json); toast.success("השחזור הושלם ✓"); qc.invalidateQueries(); }
    catch { toast.error("שגיאה בשחזור"); }
    finally { setRestoring(false); setRestoreFile(null); }
  };

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0,direction:"rtl",maxWidth:680,margin:"0 auto"}}>

      {/* Header */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:20}}>
        <div>
          <h1 style={{fontSize:22,fontWeight:700,color:"var(--text-1)",margin:0}}>הגדרות</h1>
          <p style={{fontSize:13,color:"var(--text-4)",margin:"3px 0 0"}}>ניהול העסק והמערכת</p>
        </div>
        <div style={{width:42,height:42,borderRadius:11,background:theme.gradient,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:20}}>⚙️</div>
      </div>

      {/* Tabs */}
      <div style={{display:"flex",gap:4,overflowX:"auto",paddingBottom:2,marginBottom:20,scrollbarWidth:"none"}}>
        {TABS.map(tab=>(
          <button key={tab.key} onClick={()=>setActiveTab(tab.key)}
            style={{
              display:"flex",alignItems:"center",gap:6,
              padding:"9px 16px",borderRadius:10,border:"none",
              cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",
              fontSize:13,fontWeight:activeTab===tab.key?700:500,
              transition:"all 0.15s",flexShrink:0,
              background:activeTab===tab.key?theme.primary:"var(--bg-card)",
              color:activeTab===tab.key?"#fff":"var(--text-3)",
              boxShadow:activeTab===tab.key?`0 2px 8px ${theme.primary}40`:"none",
              border:activeTab===tab.key?"none":"1px solid var(--border)",
            }}>
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div style={{background:"var(--bg-card)",borderRadius:16,border:"1px solid var(--border-light)",padding:"24px",boxShadow:"var(--shadow-card)"}}>

        {/* ── מראה ── */}
        {activeTab==="appearance"&&(
          <div style={{display:"flex",flexDirection:"column",gap:24}}>
            {/* Dark mode */}
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)",marginBottom:12}}>מצב תצוגה</div>
              <div style={{display:"flex",gap:10}}>
                {[{v:false,label:"מצב יום",icon:<Sun size={18} color="#f59e0b"/>},{v:true,label:"מצב לילה",icon:<Moon size={18} color="#818cf8"/>}].map(opt=>(
                  <button key={String(opt.v)} onClick={()=>{ if(isDark!==opt.v) toggleDark(); }}
                    style={{
                      flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                      padding:"16px 12px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",
                      transition:"all 0.15s",
                      border:`2px solid ${isDark===opt.v?theme.primary:"var(--border)"}`,
                      background:isDark===opt.v?theme.primaryLight:"var(--bg-card-alt)",
                    }}>
                    {opt.icon}
                    <span style={{fontSize:13,fontWeight:isDark===opt.v?700:400,color:isDark===opt.v?theme.primary:"var(--text-2)"}}>{opt.label}</span>
                    {isDark===opt.v&&<span style={{fontSize:10,color:theme.primary}}>✓ פעיל</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme */}
            <div>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)",marginBottom:12}}>ערכת צבעים</div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10}}>
                {Object.entries(THEMES).map(([key,t])=>(
                  <button key={key} onClick={()=>setTheme(key)}
                    style={{
                      display:"flex",flexDirection:"column",alignItems:"center",gap:8,
                      padding:"14px 8px",borderRadius:12,cursor:"pointer",fontFamily:"inherit",
                      transition:"all 0.15s",
                      border:`2px solid ${themeName===key?t.primary:"var(--border)"}`,
                      background:themeName===key?t.primaryLight:"var(--bg-card-alt)",
                    }}>
                    <div style={{width:32,height:32,borderRadius:"50%",background:t.gradient,boxShadow:themeName===key?`0 3px 10px ${t.primary}50`:"none"}}/>
                    <span style={{fontSize:12,fontWeight:themeName===key?700:400,color:themeName===key?t.primary:"var(--text-3)"}}>{t.name}</span>
                    {themeName===key&&<span style={{fontSize:10,color:t.primary}}>✓ נבחר</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── עסק ── */}
        {activeTab==="business"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <Field label="שם העסק"><input value={form.storeName} onChange={e=>setForm(p=>({...p,storeName:e.target.value}))} placeholder="מתפרת רושאן" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></Field>
            <Field label="טלפון"><input value={form.storePhone} onChange={e=>setForm(p=>({...p,storePhone:e.target.value}))} placeholder="050-0000000" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></Field>
            <Field label="כתובת"><input value={form.storeAddress} onChange={e=>setForm(p=>({...p,storeAddress:e.target.value}))} placeholder="רחוב, עיר" style={inputStyle} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/></Field>
            <Field label="טקסט תחתון להדפסה" hint="יופיע בתחתית כל דוח">
              <textarea value={form.footerText} onChange={e=>setForm(p=>({...p,footerText:e.target.value}))} placeholder="תודה על שיתוף הפעולה!" rows={3} style={{...inputStyle,resize:"vertical",lineHeight:1.7,paddingTop:10}}/>
            </Field>
            {/* Logo */}
            <Field label="לוגו העסק" hint="PNG / JPG · מקסימום 500KB">
              <div onClick={()=>fileRef.current?.click()}
                style={{border:`2px dashed ${logoPreview?theme.accent:"var(--border)"}`,borderRadius:12,padding:"20px",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:10,cursor:"pointer",background:logoPreview?theme.primaryLight:"var(--bg-hover)",minHeight:100,transition:"all 0.15s"}}>
                {logoPreview
                  ? <img src={logoPreview} alt="לוגו" style={{maxWidth:"100%",maxHeight:80,objectFit:"contain",borderRadius:6}}/>
                  : (<><div style={{color:theme.primary,display:"flex"}}>{Icons.image}</div><div style={{fontSize:13,fontWeight:600,color:"var(--text-2)"}}>לחץ להעלאת לוגו</div></>)
                }
              </div>
              <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" style={{display:"none"}} onChange={handleLogoUpload}/>
              {logoPreview&&<button onClick={()=>setLogoPreview("")} style={{alignSelf:"flex-start",background:"var(--colored-bg)",color:"#ef4444",border:"none",borderRadius:7,padding:"4px 12px",fontSize:12,fontWeight:600,cursor:"pointer",marginTop:6}}>הסר לוגו</button>}
            </Field>
            <button onClick={handleSave} disabled={saveMut.isPending} style={btnPrimary(theme.primary)}>
              {Icons.save} {saveMut.isPending?"שומר...":"שמור"}
            </button>
          </div>
        )}

        {/* ── מיסים ── */}
        {activeTab==="tax"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"rgba(217,119,6,0.08)",border:"1px solid rgba(217,119,6,0.25)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#b45309",lineHeight:1.6}}>
              ערכי המס ישמשו לחישובים אוטומטיים בכל הדפים
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
              <Field label="מע״מ %">
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",top:"50%",right:10,transform:"translateY(-50%)",color:"var(--text-4)",display:"flex",pointerEvents:"none"}}>{Icons.percent}</div>
                  <input type="number" value={form.maamValue} onChange={e=>setForm(p=>({...p,maamValue:e.target.value}))} min="0" max="100" style={{...inputStyle,paddingRight:32}} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/>
                </div>
              </Field>
              <Field label="ניכוי במקור %">
                <div style={{position:"relative"}}>
                  <div style={{position:"absolute",top:"50%",right:10,transform:"translateY(-50%)",color:"var(--text-4)",display:"flex",pointerEvents:"none"}}>{Icons.percent}</div>
                  <input type="number" value={form.masValue} onChange={e=>setForm(p=>({...p,masValue:e.target.value}))} min="0" max="100" style={{...inputStyle,paddingRight:32}} onFocus={e=>fo(e,theme.accent)} onBlur={bl}/>
                </div>
              </Field>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12,padding:"16px",background:"var(--bg-hover)",borderRadius:12,border:"1px solid var(--border)"}}>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:11,color:"var(--text-4)",marginBottom:4}}>מע״מ נוכחי</div>
                <div style={{fontSize:28,fontWeight:700,color:theme.primary}}>{form.maamValue}%</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{fontSize:11,color:"var(--text-4)",marginBottom:4}}>ניכוי במקור</div>
                <div style={{fontSize:28,fontWeight:700,color:"#d97706"}}>{form.masValue}%</div>
              </div>
            </div>
            <button onClick={handleSave} disabled={saveMut.isPending} style={btnPrimary("#d97706")}>
              {Icons.save} {saveMut.isPending?"שומר...":"שמור"}
            </button>
          </div>
        )}

        {/* ── גיבוי ── */}
        {activeTab==="backup"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"rgba(5,150,105,0.08)",border:"1px solid rgba(5,150,105,0.25)",borderRadius:10,padding:"14px 16px",fontSize:13,color:"#047857",lineHeight:1.7}}>
              <strong>גיבוי ידני</strong> — הורד את כל הנתונים כקובץ ZIP.<br/>
              מומלץ לבצע גיבוי לפני כל עדכון גדול.
            </div>
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              <button onClick={handleBackup} style={btnPrimary("#059669")}>
                {Icons.backup} הורד גיבוי עכשיו (ZIP)
              </button>
              <button onClick={async()=>{setSendingBackup(true);try{await settingsApi.sendBackup();toast.success("הגיבוי נשלח למייל ✓");}catch{toast.error("שגיאה");}finally{setSendingBackup(false);}}} disabled={sendingBackup}
                style={btnPrimary("#0284c7")}>
                📧 {sendingBackup?"שולח...":"שלח גיבוי למייל"}
              </button>
            </div>
            <div style={{borderTop:"1px solid var(--border)",paddingTop:16}}>
              <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)",marginBottom:12}}>שחזור מקובץ גיבוי</div>
              <input ref={restoreRef} type="file" accept=".json,.zip" style={{display:"none"}} onChange={e=>{const f=e.target.files?.[0];if(f)setRestoreFile(f);}}/>
              <button onClick={()=>restoreRef.current?.click()}
                style={{width:"100%",padding:"12px",border:`2px dashed ${restoreFile?theme.primary:"var(--border)"}`,borderRadius:10,background:restoreFile?theme.primaryLight:"var(--bg-hover)",fontSize:13,fontWeight:500,color:restoreFile?theme.primary:"var(--text-3)",cursor:"pointer",fontFamily:"inherit",marginBottom:10}}>
                📂 {restoreFile?restoreFile.name:"לחץ לבחירת קובץ גיבוי (.zip / .json)"}
              </button>
              {restoreFile&&(
                <button onClick={handleRestore} disabled={restoring} style={btnPrimary("#d97706")}>
                  {restoring?"משחזר...":"שחזר עכשיו"}
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── משתמשים ── */}
        {activeTab==="users"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{fontSize:13,fontWeight:700,color:"var(--text-1)",marginBottom:4}}>משתמשי המערכת</div>
            <UsersList theme={theme}/>
          </div>
        )}

        {/* ── אבטחה ── */}
        {activeTab==="security"&&(
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            <div style={{background:"rgba(180,83,9,0.08)",border:"1px solid rgba(180,83,9,0.25)",borderRadius:10,padding:"12px 16px",fontSize:13,color:"#b45309",lineHeight:1.6}}>
              שינוי הסיסמה ידרוש את הסיסמה הנוכחית
            </div>
            <PasswordField label="סיסמה נוכחית *" value={secForm.currentPassword} onChange={e=>setSecForm(p=>({...p,currentPassword:e.target.value}))} placeholder="הסיסמה הנוכחית שלך"/>
            <PasswordField label="סיסמה חדשה" value={secForm.newPassword} onChange={e=>setSecForm(p=>({...p,newPassword:e.target.value}))} placeholder="לפחות 10 תווים"/>
            <PasswordField label="אימות סיסמה חדשה" value={secForm.confirmPassword} onChange={e=>setSecForm(p=>({...p,confirmPassword:e.target.value}))} placeholder="הזן שוב את הסיסמה"/>
            <button onClick={handleSecurity} disabled={secMut.isPending} style={btnPrimary("#b45309")}>
              {Icons.shield} {secMut.isPending?"שומר...":"עדכן סיסמה"}
            </button>
          </div>
        )}

      </div>

      <div style={{textAlign:"center",padding:"16px",fontSize:11,color:"var(--text-4)"}}>
        מתפרת רושאן v2.0 · 2025
      </div>
    </div>
  );
}
