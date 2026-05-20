import { fmt, fo, bl, today } from "../utils/formatters.js";
import { useState } from "react";
import { useCrud } from "../hooks/useCrud";
import { salesToCompaniesApi } from "../api";
import { useTheme } from "../context/ThemeContext";
import { useIsMobile } from "../hooks/useIsMobile";
import MobileCards from "../components/tables/MobileCards";
import Modal from "../components/ui/Modal";

const EMPTY = {
  date: today(), clientName: "", name: "", kindOfWork: "",
  containersNumbers: "", sending: "", afterTax: "לא", number: 0, totalAmount: 0, colored: false,
};

const DEFAULT_TRANSPORT = ["טורקית", "הודית", "סינית", "אירופאית", "מקומית"];
const DEFAULT_SENDING   = ["צפון", "מרכז", "דרום", "ירושלים", "שפלה"];

const COLS = [
  { key: "totalAmount",       label: "סה״כ",       type: "number", width: "8%"  },
  { key: "afterTax",          label: "מע״מ",                        width: "6%"  },
  { key: "sending",           label: "משלוח",                       width: "8%"  },
  { key: "kindOfWork",        label: "סוג הובלה",                   width: "9%"  },
  { key: "containersNumbers", label: "מס קונטינר",                  width: "9%"  },
  { key: "name",              label: "עבודה",                       width: "14%" },
  { key: "clientName",        label: "חברה",                        width: "15%" },
  { key: "date",              label: "תאריך",                       width: "9%"  },
];

export default function SalesToCompaniesPage() {
  const { theme } = useTheme();
  const isMobile = useIsMobile();
  const { data, isLoading, create, update, remove, toggleColor } = useCrud("salesToCompanies", salesToCompaniesApi);
  const [modal, setModal]             = useState(false);
  const [settingsModal, setSettingsModal] = useState(false);
  const [form, setForm]               = useState(EMPTY);
  const [search, setSearch]           = useState("");
  const [showAll, setShowAll]         = useState(false);
  const [editId, setEditId]           = useState(null);
  const [editVals, setEditVals]       = useState({});
  const [transportOptions, setTransportOptions] = useState(DEFAULT_TRANSPORT);
  const [sendingOptions, setSendingOptions]     = useState(DEFAULT_SENDING);
  const [newTransport, setNewTransport] = useState("");
  const [newSending, setNewSending]     = useState("");

  const currentYear = new Date().getFullYear();
  const allCompanies = [...new Set((data||[]).map(i => i.clientName).filter(Boolean))].sort();
  const allWorks     = [...new Set((data||[]).map(i => i.name).filter(Boolean))].sort();

  const filtered = [...(data||[])]
    .filter(item => {
      if (!showAll) { if (!item.date) return item.colored; if (new Date(item.date).getFullYear() !== currentYear && !item.colored) return false; }
      if (search) { const s = search.toLowerCase(); return ["clientName","name","kindOfWork","sending"].some(f => String(item[f]||"").toLowerCase().includes(s)); }
      return true;
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const total = filtered.reduce((s, i) => s + (Number(i.totalAmount)||0), 0);
  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editId) { update(editId, editVals); setEditId(null); }
    else { create(form); }
    setModal(false); setForm(EMPTY);
  };

  const ROW  = { display:"flex", flexDirection:"row-reverse", alignItems:"center", width:"100%", borderBottom:"1px solid #f3f4f6" };
  const CELL = (w, extra={}) => ({ width:w, flexBasis:w, flexGrow:1, flexShrink:1, padding:"10px 10px", fontSize:13, textAlign:"right", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap", ...extra });

  // Mobile card columns with custom render for afterTax
  const mobileCols = COLS.map(col => col.key === "afterTax"
    ? { ...col, render: (v) => v==="כן" ? <span style={{ color:"#16a34a", fontWeight:600 }}>✓ מע״מ</span> : <span style={{ color:"#9ca3af" }}>ללא</span> }
    : col
  );

  if (isLoading) return (
    <div style={{ display:"flex", justifyContent:"center", padding:80 }}>
      <div style={{ width:36, height:36, border:`4px solid ${theme.primaryBorder}`, borderTopColor:theme.primary, borderRadius:"50%", animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, direction:"rtl" }}>

      {/* Header */}
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:12 }}>
        <div style={{ display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:44, height:44, borderRadius:12, background:theme.gradient, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, boxShadow:`0 4px 12px ${theme.primary}30` }}>🏢</div>
          <div>
            <h1 style={{ fontSize:22, fontWeight:700, color:"#1f2937", margin:0 }}>מכירות לחברות</h1>
            <p style={{ fontSize:13, color:"#9ca3af", margin:"3px 0 0" }}>{filtered.length} רשומות | סה״כ: <strong style={{ color:theme.primary }}>{fmt(total)} ₪</strong></p>
          </div>
        </div>
        <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
          <button onClick={() => setSettingsModal(true)} style={{ padding:"9px 14px", borderRadius:8, background:"#fff", color:"#6b7280", border:"1px solid #e5e7eb", fontSize:13, cursor:"pointer", fontFamily:"inherit" }}>⚙️ רשימות</button>
          <button onClick={() => setShowAll(!showAll)} style={{ fontSize:12, padding:"6px 14px", borderRadius:8, border:`1px solid ${showAll ? theme.accent : "#e5e7eb"}`, background: showAll ? theme.primaryLight : "#fff", color: showAll ? theme.primary : "#6b7280", cursor:"pointer", fontFamily:"inherit" }}>{showAll ? "שנה נוכחית" : "כל הזמנים"}</button>
          <button onClick={() => setModal(true)} style={{ padding:"9px 18px", borderRadius:8, background:theme.gradient, color:"#fff", border:"none", fontWeight:600, fontSize:13, cursor:"pointer", fontFamily:"inherit", boxShadow:`0 2px 8px ${theme.primary}30` }}>+ הוסף</button>
        </div>
      </div>

      {/* Stats — desktop only */}
      {!isMobile && (
        <div style={{ background:"#fff", borderRadius:12, border:`1px solid ${theme.primaryBorder}`, padding:"16px 24px", display:"flex", gap:0, alignItems:"center", flexWrap:"wrap" }}>
          {[
            { label:"סה״כ",   value:`${fmt(total)} ₪`,                                    color:theme.primary },
            { label:"חברות",  value:[...new Set(filtered.map(i=>i.clientName))].length,    color:"#6b7280"     },
            { label:"רשומות", value:filtered.length,                                        color:"#6b7280"     },
          ].map((stat, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", flexGrow:1 }}>
              {i > 0 && <div style={{ width:1, background:theme.primaryBorder, alignSelf:"stretch", marginLeft:24, marginRight:24 }} />}
              <div style={{ display:"flex", flexDirection:"column", gap:3 }}>
                <span style={{ fontSize:11, color:"#9ca3af", fontWeight:500, textTransform:"uppercase" }}>{stat.label}</span>
                <span style={{ fontSize:18, fontWeight:700, color:stat.color }}>{stat.value}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Search */}
      <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="חיפוש לפי חברה, עבודה, סוג הובלה..."
        style={{ width:"100%", padding:"10px 14px", border:"1px solid #e5e7eb", borderRadius:10, fontSize:16, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
        onFocus={e => fo(e, theme.accent)} onBlur={bl} />

      {/* Mobile Cards / Desktop Table */}
      {isMobile ? (
        <MobileCards
          items={filtered}
          columns={mobileCols}
          onEdit={(item) => { setEditId(item._id); setEditVals({...item}); setModal(true); }}
          onDelete={(id) => remove(id)}
          onToggleColor={toggleColor}
          total={total}
          theme={theme}
        />
      ) : (
        <div style={{ background:"#fff", borderRadius:16, border:"1px solid #f0f0ef", overflow:"hidden", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
          <div style={{ ...ROW, background:theme.gradient, color:"#fff" }}>
            <div style={{ width:70, minWidth:70, padding:"12px 8px", fontSize:12, fontWeight:700, textAlign:"center", flexShrink:0 }}>פעולות</div>
            {COLS.map(col => <div key={col.key} style={{ ...CELL(col.width), color:"#fff", fontWeight:700, fontSize:12, padding:"12px 10px" }}>{col.label}</div>)}
            <div style={{ width:30, minWidth:30, flexShrink:0 }} />
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign:"center", padding:"56px 20px", color:"#9ca3af" }}>
              <div style={{ fontSize:32, marginBottom:12 }}>🏢</div>
              <div style={{ fontSize:15, fontWeight:500 }}>אין נתונים</div>
            </div>
          ) : filtered.map((item, idx) => {
            const isEditing = editId === item._id;
            const bg = item.colored ? "#fef2f2" : idx%2===0 ? "#fff" : "#fafafa";
            return (
              <div key={item._id} style={{ ...ROW, background:bg }}
                onMouseEnter={e => { if(!item.colored) e.currentTarget.style.background=theme.primaryLight; }}
                onMouseLeave={e => { e.currentTarget.style.background=bg; }}>
                <div style={{ width:70, minWidth:70, padding:"10px 8px", display:"flex", gap:3, justifyContent:"center", flexShrink:0 }}>
                  {isEditing ? (
                    <>
                      <button onClick={() => { update(editId, editVals); setEditId(null); }} style={{ padding:"3px 8px", background:"#dcfce7", border:"none", borderRadius:6, color:"#16a34a", cursor:"pointer", fontSize:12 }}>✓</button>
                      <button onClick={() => setEditId(null)} style={{ padding:"3px 8px", background:"#f3f4f6", border:"none", borderRadius:6, color:"#6b7280", cursor:"pointer", fontSize:12 }}>✕</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditId(item._id); setEditVals({...item}); }} style={{ padding:"3px 8px", background:"#eff6ff", border:"none", borderRadius:6, color:"#3b82f6", cursor:"pointer", fontSize:12 }}>✎</button>
                      <button onClick={() => remove(item._id)} style={{ padding:"3px 8px", background:"#fef2f2", border:"none", borderRadius:6, color:"#ef4444", cursor:"pointer", fontSize:12 }}>🗑</button>
                    </>
                  )}
                </div>
                {COLS.map(col => (
                  <div key={col.key} style={CELL(col.width, { color: item.colored ? "#991b1b" : "#374151" })}>
                    {isEditing ? (
                      col.key === "kindOfWork" ? (
                        <select value={editVals[col.key]||""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))} style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"2px 4px", fontSize:12, outline:"none", fontFamily:"inherit" }}>
                          {transportOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : col.key === "sending" ? (
                        <select value={editVals[col.key]||""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))} style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"2px 4px", fontSize:12, outline:"none", fontFamily:"inherit" }}>
                          {sendingOptions.map(o => <option key={o} value={o}>{o}</option>)}
                        </select>
                      ) : col.key === "afterTax" ? (
                        <div onClick={() => setEditVals(v => ({...v, afterTax: v.afterTax==="כן" ? "לא" : "כן"}))} style={{ position:"relative", width:36, height:20, cursor:"pointer" }}>
                          <div style={{ position:"absolute", inset:0, borderRadius:20, background: editVals.afterTax==="כן" ? theme.primary : "#d1d5db", transition:"0.2s" }}>
                            <div style={{ position:"absolute", top:2, right: editVals.afterTax==="כן" ? 2 : 18, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"0.2s" }} />
                          </div>
                        </div>
                      ) : (
                        <input type={col.type==="number"?"number":"text"} value={editVals[col.key]??""} onChange={e => setEditVals(v=>({...v,[col.key]:e.target.value}))} style={{ width:"100%", border:`1px solid ${theme.accent}`, borderRadius:6, padding:"2px 6px", fontSize:12, outline:"none", fontFamily:"inherit" }} />
                      )
                    ) : (
                      col.key === "afterTax"
                        ? (item[col.key]==="כן" ? <span style={{ color:"#16a34a", fontWeight:600, fontSize:11 }}>✓ מע״מ</span> : <span style={{ color:"#9ca3af", fontSize:11 }}>ללא</span>)
                        : col.type === "number" ? fmt(item[col.key])
                        : (item[col.key]||"-")
                    )}
                  </div>
                ))}
                <div style={{ width:30, minWidth:30, display:"flex", justifyContent:"center", flexShrink:0 }}>
                  <div onClick={() => toggleColor(item._id, { colored: !item.colored })} style={{ width:12, height:12, borderRadius:"50%", background: item.colored?"#ef4444":"#e5e7eb", border: item.colored?"2px solid #dc2626":"2px solid #d1d5db", cursor:"pointer" }} />
                </div>
              </div>
            );
          })}

          {filtered.length > 0 && (
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 16px", background:theme.primaryLight, borderTop:`2px solid ${theme.primaryBorder}` }}>
              <span style={{ fontSize:13, color:"#6b7280" }}>סה״כ ({filtered.length} רשומות)</span>
              <span style={{ fontSize:16, fontWeight:700, color:theme.primary }}>{fmt(total)} ₪</span>
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={modal} onClose={() => { setModal(false); setForm(EMPTY); setEditId(null); }} title={editId ? "עריכת מכירה לחברה" : "הוספת מכירה לחברה"} size="lg">
        <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
            {[
              { key:"date",             label:"תאריך",       type:"date" },
              { key:"clientName",       label:"חברה",        type:"text", list:"companies-list" },
              { key:"name",             label:"עבודה",       type:"text", list:"works-list" },
              { key:"containersNumbers",label:"מס׳ קונטינר", type:"text" },
            ].map(f => (
              <div key={f.key}>
                <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>{f.label}</label>
                <input type={f.type}
                  value={editId ? editVals[f.key]??""  : form[f.key]}
                  onChange={e => editId ? setEditVals(v=>({...v,[f.key]:e.target.value})) : set(f.key, e.target.value)}
                  list={f.list} required={["clientName","name"].includes(f.key)}
                  style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                  onFocus={e => fo(e, theme.accent)} onBlur={bl} />
                {f.list === "companies-list" && <datalist id="companies-list">{allCompanies.map(c => <option key={c} value={c} />)}</datalist>}
                {f.list === "works-list"     && <datalist id="works-list">{allWorks.map(w => <option key={w} value={w} />)}</datalist>}
              </div>
            ))}

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>סוג הובלה</label>
              <select value={editId ? editVals.kindOfWork||"" : form.kindOfWork} onChange={e => editId ? setEditVals(v=>({...v,kindOfWork:e.target.value})) : set("kindOfWork", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", background:"#fff", boxSizing:"border-box", fontFamily:"inherit" }}>
                <option value="">בחר סוג הובלה</option>
                {transportOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>משלוח</label>
              <select value={editId ? editVals.sending||"" : form.sending} onChange={e => editId ? setEditVals(v=>({...v,sending:e.target.value})) : set("sending", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", background:"#fff", boxSizing:"border-box", fontFamily:"inherit" }}>
                <option value="">בחר אזור</option>
                {sendingOptions.map(o => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>

            <div>
              <label style={{ display:"block", fontSize:12, fontWeight:600, color:"#6b7280", marginBottom:6 }}>סה״כ (₪)</label>
              <input type="number" min="0"
                value={editId ? editVals.totalAmount : form.totalAmount}
                onChange={e => editId ? setEditVals(v=>({...v,totalAmount:e.target.value})) : set("totalAmount", e.target.value)}
                style={{ width:"100%", padding:"9px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:14, fontWeight:700, color:theme.primary, outline:"none", boxSizing:"border-box", fontFamily:"inherit" }}
                onFocus={e => fo(e, theme.accent)} onBlur={bl} />
            </div>

            <div style={{ display:"flex", alignItems:"center", gap:12, paddingTop:20 }}>
              <div style={{ position:"relative", width:36, height:20 }}>
                <div onClick={() => editId ? setEditVals(v=>({...v,afterTax:v.afterTax==="כן"?"לא":"כן"})) : set("afterTax", form.afterTax==="כן"?"לא":"כן")}
                  style={{ position:"absolute", inset:0, borderRadius:20, cursor:"pointer", background: (editId?editVals.afterTax:form.afterTax)==="כן" ? theme.primary : "#d1d5db", transition:"0.2s" }}>
                  <div style={{ position:"absolute", top:2, right: (editId?editVals.afterTax:form.afterTax)==="כן" ? 2 : 18, width:16, height:16, borderRadius:"50%", background:"#fff", transition:"0.2s" }} />
                </div>
              </div>
              <label style={{ fontSize:13, fontWeight:600, color:"#374151" }}>
                {(editId?editVals.afterTax:form.afterTax)==="כן" ? "✓ כולל מע״מ" : "ללא מע״מ"}
              </label>
            </div>
          </div>

          <div style={{ display:"flex", gap:10, marginTop:4 }}>
            <button type="button" onClick={() => { setModal(false); setForm(EMPTY); setEditId(null); }} style={{ flex:1, padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>ביטול</button>
            <button type="submit" style={{ flex:2, padding:10, border:"none", borderRadius:8, background:theme.gradient, fontSize:14, fontWeight:600, color:"#fff", cursor:"pointer", fontFamily:"inherit" }}>שמור</button>
          </div>
        </form>
      </Modal>

      {/* Settings Modal */}
      {settingsModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:1000, padding:16 }}
          onClick={e => e.target===e.currentTarget && setSettingsModal(false)}>
          <div style={{ background:"#fff", borderRadius:16, width:"100%", maxWidth:480, padding:28, boxShadow:"0 20px 60px rgba(0,0,0,0.15)", direction:"rtl" }}>
            <div style={{ fontSize:17, fontWeight:700, color:"#1f2937", marginBottom:20 }}>⚙️ ניהול רשימות</div>
            {[
              { label:"סוגי הובלה", options:transportOptions, setOptions:setTransportOptions, newVal:newTransport, setNew:setNewTransport },
              { label:"אזורי משלוח", options:sendingOptions, setOptions:setSendingOptions, newVal:newSending, setNew:setNewSending },
            ].map(section => (
              <div key={section.label} style={{ marginBottom:24 }}>
                <div style={{ fontSize:13, fontWeight:700, color:theme.primary, marginBottom:12 }}>{section.label}</div>
                <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginBottom:10 }}>
                  {section.options.map(o => (
                    <div key={o} style={{ display:"flex", alignItems:"center", gap:4, background:theme.primaryLight, border:`1px solid ${theme.primaryBorder}`, borderRadius:8, padding:"4px 10px" }}>
                      <span style={{ fontSize:13 }}>{o}</span>
                      <button onClick={() => section.setOptions(p => p.filter(x => x!==o))} style={{ background:"none", border:"none", color:"#ef4444", cursor:"pointer", fontSize:14 }}>×</button>
                    </div>
                  ))}
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <input type="text" value={section.newVal} onChange={e => section.setNew(e.target.value)}
                    placeholder="הוסף..." onKeyDown={e => { if(e.key==="Enter" && section.newVal.trim()) { section.setOptions(p=>[...p,section.newVal.trim()]); section.setNew(""); }}}
                    style={{ flex:1, padding:"8px 12px", border:"1px solid #e5e7eb", borderRadius:8, fontSize:13, outline:"none", fontFamily:"inherit" }}
                    onFocus={e => fo(e, theme.accent)} onBlur={bl} />
                  <button onClick={() => { if(section.newVal.trim()) { section.setOptions(p=>[...p,section.newVal.trim()]); section.setNew(""); }}}
                    style={{ padding:"8px 14px", background:theme.gradient, color:"#fff", border:"none", borderRadius:8, cursor:"pointer", fontSize:13, fontFamily:"inherit" }}>+ הוסף</button>
                </div>
              </div>
            ))}
            <button onClick={() => setSettingsModal(false)} style={{ width:"100%", padding:10, border:"1px solid #e5e7eb", borderRadius:8, background:"#fff", fontSize:13, fontWeight:500, color:"#6b7280", cursor:"pointer", fontFamily:"inherit" }}>סגור</button>
          </div>
        </div>
      )}
    </div>
  );
}