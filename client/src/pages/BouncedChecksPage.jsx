import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCrud } from "../hooks/useCrud";
import { bouncedChecksApi, taxValuesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import { useStyles } from "../hooks/useStyles";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";

const EMPTY = {
  date: today(), clientName: "", checkNumber: 0, bankNumber: 0,
  branchNumber: 0, accountNumber: 0, number: 0, paymentDate: "",
  taxNumber: "", colored: false, remark: "-", totalAmount: 0,
};

const COLS = [
  { key: "totalAmount",   label: "סה״כ",         type: "money", width: "8%"  },
  { key: "remark",        label: "הערה",                        width: "10%" },
  { key: "number",        label: "סכום",         type: "money", width: "8%"  },
  { key: "paymentDate",   label: "ת.פירעון",                    width: "10%" },
  { key: "accountNumber", label: "חשבון",                       width: "8%"  },
  { key: "branchNumber",  label: "סניף",                        width: "6%"  },
  { key: "bankNumber",    label: "בנק",                         width: "5%"  },
  { key: "checkNumber",   label: "מס' שיק",                     width: "8%"  },
  { key: "taxNumber",     label: "מס' חשבונית",                 width: "9%"  },
  { key: "clientName",    label: "קליינט",                      width: "14%" },
  { key: "date",          label: "תאריך",                       width: "9%"  },
];

const FIELDS = [
  { key: "checkNumber",   label: "מס׳ שיק",      type: "number" },
  { key: "bankNumber",    label: "מס׳ בנק",      type: "number" },
  { key: "branchNumber",  label: "מס׳ סניף",     type: "number" },
  { key: "accountNumber", label: "מס׳ חשבון",    type: "number" },
  { key: "number",        label: "סכום",          type: "number" },
  { key: "paymentDate",   label: "תאריך פירעון", type: "date"   },
  { key: "taxNumber",     label: "מס׳ חשבונית",  type: "text"   },
  { key: "remark",        label: "הערה",          type: "text"   },
];

export default function BouncedChecksPage() {
  const { theme } = useTheme();
  const isMobile  = useIsMobile();
  const S         = useStyles(theme);
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("bouncedChecks", bouncedChecksApi);
  const { data: taxValues } = useQuery({ queryKey: ["taxValues"], queryFn: () => taxValuesApi.get().then(r => r.data) });

  const [modal,    setModal]    = useState(false);
  const [form,     setForm]     = useState(EMPTY);
  const [search,   setSearch]   = useState("");
  const [showAll,  setShowAll]  = useState(false);
  const [editId,   setEditId]   = useState(null);
  const [editVals, setEditVals] = useState({});

  const currentYear = new Date().getFullYear();
  const allClients  = [...new Set((data||[]).map(i => i.clientName).filter(Boolean))].sort();

  const filtered = [...(data||[])]
    .filter(item => {
      if (!showAll) { if (!item.date) return item.colored; if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false; }
      if (search) { const s = search.toLowerCase(); return ["clientName","checkNumber","taxNumber"].some(f => String(item[f]||"").toLowerCase().includes(s)); }
      return true;
    })
    .sort((a,b) => (a.date < b.date ? 1 : -1));

  const total = filtered.reduce((s,i) => s + (Number(i.number)||0), 0);

  const val = (key) => editId ? (editVals[key]??"") : form[key];
  const set = (key, v) => editId ? setEditVals(p=>({...p,[key]:v})) : setForm(p=>({...p,[key]:v}));

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = editId ? { ...editVals, totalAmount: Number(editVals.number) } : { ...form, totalAmount: Number(form.number) };
    if (editId) { update(editId, payload); setEditId(null); }
    else create(payload);
    setModal(false); setForm(EMPTY);
  };

  if (isLoading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:80 }}>
      <div className="rosh-spinner" style={{ borderTopColor: theme.primary }} />
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44,height:44,borderRadius:12,background:theme.gradient,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22 }}>✅</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, margin:0, color:"var(--text-1)" }}>שיקים דחויים</h1>
            <p style={{ fontSize:13, margin:"3px 0 0", color:"var(--text-4)" }}>
              {filtered.length} רשומות &nbsp;|&nbsp; סה״כ: <strong style={{ color:theme.primary }}>{fmt(total)} ₪</strong>
            </p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8 }}>
          <button style={S.toggleBtn(showAll,theme)} onClick={() => setShowAll(!showAll)}>
            {showAll ? "שנה נוכחית" : "כל הזמנים"}
          </button>
          <button onClick={() => setModal(true)}
            style={{ padding:"9px 18px",borderRadius:8,background:theme.gradient,color:"#fff",border:"none",fontWeight:600,fontSize:13,cursor:"pointer",fontFamily:"inherit" }}>
            + הוסף
          </button>
        </div>
      </div>

      {/* Stats */}
      {!isMobile && (
        <div style={S.statBar}>
          <div>
            <span style={{ fontSize:11,color:"var(--text-4)",display:"block",marginBottom:3 }}>סה״כ שיקים</span>
            <span style={{ fontSize:18,fontWeight:700,color:theme.primary }}>{fmt(total)} ₪</span>
          </div>
          <div style={S.divider} />
          <div>
            <span style={{ fontSize:11,color:"var(--text-4)",display:"block",marginBottom:3 }}>רשומות</span>
            <span style={{ fontSize:18,fontWeight:700,color:"var(--text-3)" }}>{filtered.length}</span>
          </div>
        </div>
      )}

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)}
        placeholder="חיפוש לפי לקוח, מס׳ שיק..."
        style={S.inputLg} onFocus={e => fo(e,theme.accent)} onBlur={bl} />

      {/* Table / Cards */}
      {isMobile ? (
        <MobileCards items={filtered} columns={COLS}
          onEdit={item => { setEditId(item._id); setEditVals({...item}); setModal(true); }}
          onDelete={id => remove(id)}
          onToggleColor={toggleColor}
          total={total} theme={theme} />
      ) : (
        <div style={S.card}>
          {/* Header row */}
          <div style={{ display:"flex",flexDirection:"row-reverse",alignItems:"center",width:"100%",background:theme.gradient,color:"#fff" }}>
            <div style={{ width:70,minWidth:70,padding:"12px 8px",fontSize:12,fontWeight:700,textAlign:"center",flexShrink:0 }}>פעולות</div>
            {COLS.map(col => (
              <div key={col.key} style={S.cell(col.width,{color:"#fff",fontWeight:700,fontSize:12,padding:"12px 10px"})}>{col.label}</div>
            ))}
            <div style={{ width:30,minWidth:30,flexShrink:0 }} />
          </div>

          {filtered.length === 0 ? (
            <div style={S.empty}><div style={{ fontSize:32,marginBottom:12 }}>✅</div><div>אין שיקים להצגה</div></div>
          ) : filtered.map((item,idx) => {
            const isEditing = editId === item._id;
            return (
              <div key={item._id} style={S.row(item.colored,idx)}
                onMouseEnter={e => { if(!item.colored) e.currentTarget.style.background="var(--bg-hover)"; }}
                onMouseLeave={e => { e.currentTarget.style.background = item.colored?"var(--colored-bg)":idx%2===0?"var(--bg-card)":"var(--bg-card-alt)"; }}>
                <div style={{ width:70,minWidth:70,padding:"10px 8px",display:"flex",gap:4,justifyContent:"center",flexShrink:0 }}>
                  {isEditing ? (<>
                    <button onClick={() => { update(editId,{...editVals,totalAmount:Number(editVals.number)}); setEditId(null); }} style={S.btnSave}>✓</button>
                    <button onClick={() => setEditId(null)} style={S.btnDiscard}>✕</button>
                  </>) : (<>
                    <button onClick={() => { setEditId(item._id); setEditVals({...item}); }} style={S.btnEdit}>✎</button>
                    <button onClick={() => { if(window.confirm("האם אתה בטוח שברצונך למחוק?")) remove(item._id); }} style={S.btnDelete}>🗑</button>
                  </>)}
                </div>
                {COLS.map(col => (
                  <div key={col.key} style={S.cell(col.width,{
                    color: item.colored?"var(--colored-text)":col.type==="money"?theme.primary:"var(--text-1)",
                    fontWeight: col.type==="money"?600:col.key==="clientName"?600:400,
                  })}>
                    {isEditing
                      ? <input type="text" value={editVals[col.key]??""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))}
                          style={{ width:"100%",border:`1px solid ${theme.accent}`,borderRadius:6,padding:"2px 6px",fontSize:12,outline:"none",fontFamily:"inherit",background:"var(--bg-input)",color:"var(--text-1)" }} />
                      : col.type==="money" ? fmt(item[col.key]) : (item[col.key]||"-")
                    }
                  </div>
                ))}
                <div style={{ width:30,minWidth:30,display:"flex",justifyContent:"center",flexShrink:0 }}>
                  <div onClick={() => toggleColor(item._id,{colored:!item.colored})} style={S.dot(item.colored)} />
                </div>
              </div>
            );
          })}

          {filtered.length > 0 && (
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 16px",background:"var(--bg-hover)",borderTop:`2px solid ${theme.primaryBorder}` }}>
              <span style={{ fontSize:13,color:"var(--text-3)" }}>סה״כ ({filtered.length} רשומות)</span>
              <span style={{ fontSize:16,fontWeight:700,color:theme.primary }}>{fmt(total)} ₪</span>
            </div>
          )}
        </div>
      )}

      {/* Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }}
        title={editId ? "עריכת שיק" : "הוספת שיק דחוי"} size="md">
        <form onSubmit={handleSubmit} style={{ display:"flex",flexDirection:"column",gap:14 }}>
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:12 }}>
            <div style={{ gridColumn:"1/-1" }}>
              <label style={S.label}>לקוח</label>
              <input type="text" value={val("clientName")} onChange={e => set("clientName",e.target.value)}
                list="clients-list" required style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
              <datalist id="clients-list">{allClients.map(c=><option key={c} value={c}/>)}</datalist>
            </div>
            <div>
              <label style={S.label}>תאריך</label>
              <input type="date" value={val("date")} onChange={e => set("date",e.target.value)}
                style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
            </div>
            {FIELDS.map(f => (
              <div key={f.key}>
                <label style={S.label}>{f.label}</label>
                <input type={f.type} value={val(f.key)} onChange={e => set(f.key,e.target.value)}
                  style={S.input} onFocus={e=>fo(e,theme.accent)} onBlur={bl} />
              </div>
            ))}
          </div>
          <div style={{ display:"flex",gap:10 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={S.btnCancel}>ביטול</button>
            <button type="submit" style={S.btnSubmit(theme)}>שמור</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
