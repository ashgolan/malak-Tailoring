import { useState, useRef } from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const LABELS = {
  sales:            "מכירות",
  bouncedChecks:    "שיקים דחויים",
  workersExpenses:  "הוצאות עובדים",
  waybills:         "תעודות משלוח",
  partialPayments:  "תשלום חלקי",
  institutionTaxes: "חשבוניות למוסדות",
  salesToCompanies: "מכירות לחברות",
  expenses:         "הוצאות",
  sleevesBids:      "שרוולים",
  bids:             "הצעות מחיר",
  inventories:      "מלאי",
  providers:        "ספקים",
  contacts:         "אנשי קשר",
  users:            "משתמשים",
  settings:         "הגדרות",
};

export default function EmergencyRestorePage() {
  const [step, setStep] = useState(1);
  const [key, setKey] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [backupFile, setBackupFile] = useState(null);
  const [backupInfo, setBackupInfo] = useState(null);
  const [isZip, setIsZip] = useState(false);
  const [results, setResults] = useState(null);
  const fileRef = useRef(null);

  const handleCheckKey = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await axios.post(`${BASE_URL}/emergency/check`, { emergencyKey: key });
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.message || "מפתח שגוי");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError("");

    const fileName = file.name.toLowerCase();

    if (fileName.endsWith(".zip")) {
      // ZIP file — store as-is
      setIsZip(true);
      setBackupFile(file);
      setBackupInfo({
        exportedAt: null,
        fileName: file.name,
        fileSize: (file.size / 1024).toFixed(1) + " KB",
      });
    } else if (fileName.endsWith(".json")) {
      // JSON file — parse it
      setIsZip(false);
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const parsed = JSON.parse(ev.target.result);
          setBackupFile(parsed);
          setBackupInfo({
            exportedAt: parsed.exportedAt,
            fileName: file.name,
            counts: Object.entries(parsed.data || {}).map(([k, v]) => ({ key: k, count: v?.length || 0 })),
          });
        } catch {
          setError("קובץ JSON לא תקין");
        }
      };
      reader.readAsText(file);
    } else {
      setError("יש לבחור קובץ ZIP או JSON בלבד");
    }
  };

  const handleRestore = async () => {
    if (!backupFile) return;
    if (!window.confirm("⚠️ האם אתה בטוח? הפעולה תשחזר את כל הנתונים. לא ניתן לבטל.")) return;
    setLoading(true); setError("");

    try {
      if (isZip) {
        // ZIP restore
        const formData = new FormData();
        formData.append("file", backupFile);
        formData.append("emergencyKey", key);
        const res = await axios.post(`${BASE_URL}/emergency/restore-zip`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setResults(res.data.restored);
      } else {
        // JSON restore
        const res = await axios.post(`${BASE_URL}/emergency/restore`, {
          emergencyKey: key,
          data: backupFile.data,
        });
        setResults(res.data.restored);
      }
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message || "שגיאה בשחזור");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"linear-gradient(135deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)", display:"flex", alignItems:"center", justifyContent:"center", padding:20, direction:"rtl", fontFamily:"Assistant,Arial,sans-serif" }}>
      <div style={{ width:"100%", maxWidth:520 }}>

        {/* Logo */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ width:64, height:64, borderRadius:16, background:"linear-gradient(135deg,#ef4444,#dc2626)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:28, margin:"0 auto 16px" }}>🚨</div>
          <h1 style={{ fontSize:24, fontWeight:700, color:"#fff", margin:"0 0 6px" }}>שחזור חירום</h1>
          <p style={{ fontSize:13, color:"rgba(255,255,255,0.5)", margin:0 }}>מתפרת מלאק — Emergency Restore</p>
        </div>

        {/* Step 1 - Key */}
        {step === 1 && (
          <div style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(10px)", borderRadius:16, padding:28, border:"1px solid rgba(255,255,255,0.15)" }}>
            <div style={{ background:"rgba(239,68,68,0.15)", border:"1px solid rgba(239,68,68,0.3)", borderRadius:10, padding:"12px 16px", fontSize:13, color:"#fca5a5", marginBottom:20 }}>
              ⚠️ עמוד זה מיועד לשחזור חירום בלבד. גישה דורשת מפתח חירום סודי.
            </div>
            <form onSubmit={handleCheckKey} style={{ display:"flex", flexDirection:"column", gap:14 }}>
              <div>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"rgba(255,255,255,0.7)", marginBottom:6 }}>מפתח חירום</label>
                <input type="password" value={key} onChange={e => setKey(e.target.value)} placeholder="הזן מפתח חירום סודי" required
                  style={{ width:"100%", padding:"11px 14px", background:"rgba(255,255,255,0.1)", border:"1px solid rgba(255,255,255,0.2)", borderRadius:10, fontSize:14, color:"#fff", outline:"none", boxSizing:"border-box", fontFamily:"inherit" }} />
              </div>
              {error && <div style={{ background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#fca5a5" }}>{error}</div>}
              <button type="submit" disabled={loading}
                style={{ padding:"12px", background:"linear-gradient(135deg,#ef4444,#dc2626)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                {loading ? "מאמת..." : "המשך"}
              </button>
            </form>
            <div style={{ textAlign:"center", marginTop:20 }}>
              <a href="/" style={{ fontSize:12, color:"rgba(255,255,255,0.4)", textDecoration:"none" }}>← חזור לדף הבית</a>
            </div>
          </div>
        )}

        {/* Step 2 - Upload */}
        {step === 2 && (
          <div style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(10px)", borderRadius:16, padding:28, border:"1px solid rgba(255,255,255,0.15)", display:"flex", flexDirection:"column", gap:16 }}>
            <div style={{ fontSize:15, fontWeight:700, color:"#fff" }}>✅ מפתח תקין — בחר קובץ גיבוי</div>
            <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>ניתן להעלות קובץ ZIP (גיבוי חדש) או JSON (גיבוי ישן)</div>

            <div onClick={() => fileRef.current?.click()}
              style={{ border:"1.5px dashed rgba(255,255,255,0.3)", borderRadius:12, padding:"24px 16px", display:"flex", flexDirection:"column", alignItems:"center", gap:10, cursor:"pointer", background: backupFile ? "rgba(5,150,105,0.1)" : "rgba(255,255,255,0.05)" }}>
              <div style={{ fontSize:32 }}>{backupFile ? "✅" : "📁"}</div>
              <div style={{ fontSize:13, color:"rgba(255,255,255,0.7)", textAlign:"center" }}>
                {backupFile ? `${backupInfo?.fileName} — לחץ להחלפה` : "לחץ לבחירת קובץ גיבוי (ZIP או JSON)"}
              </div>
            </div>
            <input ref={fileRef} type="file" accept=".zip,.json" style={{ display:"none" }} onChange={handleFileUpload} />

            {/* Backup info */}
            {backupInfo && (
              <div style={{ background:"rgba(255,255,255,0.06)", borderRadius:10, padding:"14px 16px" }}>
                {backupInfo.exportedAt && (
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>
                    גיבוי מתאריך: <strong style={{ color:"rgba(255,255,255,0.8)" }}>{new Date(backupInfo.exportedAt).toLocaleString("he-IL")}</strong>
                  </div>
                )}
                {backupInfo.fileSize && (
                  <div style={{ fontSize:12, color:"rgba(255,255,255,0.5)", marginBottom:8 }}>
                    גודל קובץ: <strong style={{ color:"rgba(255,255,255,0.8)" }}>{backupInfo.fileSize}</strong>
                    <span style={{ marginRight:8, color:"#6ee7b7" }}> — קובץ ZIP</span>
                  </div>
                )}
                {backupInfo.counts && (
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
                    {backupInfo.counts.filter(c => c.count > 0).map(c => (
                      <div key={c.key} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"rgba(255,255,255,0.6)", background:"rgba(255,255,255,0.05)", borderRadius:6, padding:"4px 10px" }}>
                        <span>{LABELS[c.key] || c.key}</span>
                        <strong style={{ color:"#6ee7b7" }}>{c.count}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {error && <div style={{ background:"rgba(239,68,68,0.2)", border:"1px solid rgba(239,68,68,0.4)", borderRadius:8, padding:"10px 14px", fontSize:13, color:"#fca5a5" }}>{error}</div>}

            {backupFile && (
              <button onClick={handleRestore} disabled={loading}
                style={{ padding:"12px", background:"linear-gradient(135deg,#059669,#047857)", color:"#fff", border:"none", borderRadius:10, fontSize:14, fontWeight:600, cursor:"pointer", fontFamily:"inherit" }}>
                {loading ? "משחזר נתונים..." : "🔄 שחזר נתונים עכשיו"}
              </button>
            )}
          </div>
        )}

        {/* Step 3 - Done */}
        {step === 3 && (
          <div style={{ background:"rgba(255,255,255,0.08)", backdropFilter:"blur(10px)", borderRadius:16, padding:28, border:"1px solid rgba(5,150,105,0.4)", display:"flex", flexDirection:"column", gap:16, textAlign:"center" }}>
            <div style={{ fontSize:48 }}>✅</div>
            <div style={{ fontSize:18, fontWeight:700, color:"#6ee7b7" }}>השחזור הושלם בהצלחה!</div>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:6 }}>
              {Object.entries(results || {}).map(([k, v]) => (
                <div key={k} style={{ display:"flex", justifyContent:"space-between", fontSize:12, color:"rgba(255,255,255,0.7)", background:"rgba(255,255,255,0.05)", borderRadius:6, padding:"6px 10px" }}>
                  <span>{LABELS[k] || k}</span>
                  <strong style={{ color:"#6ee7b7" }}>+{v}</strong>
                </div>
              ))}
            </div>
            <a href="/login" style={{ padding:"12px", background:"linear-gradient(135deg,#7c3aed,#6d28d9)", color:"#fff", borderRadius:10, fontSize:14, fontWeight:600, textDecoration:"none", display:"block" }}>
              → כניסה למערכת
            </a>
          </div>
        )}

      </div>
    </div>
  );
}