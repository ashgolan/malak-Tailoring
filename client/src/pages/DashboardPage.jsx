import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  salesApi, bouncedChecksApi, workersExpensesApi, sleevesBidsApi,
  expensesApi, partialPaymentApi, taxValuesApi,
} from "../api";
import { ShoppingCart, CheckSquare, Users, Scissors, TrendingUp, TrendingDown, Clock } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from "recharts";
import { useIsMobile } from "../hooks/useIsMobile";
import { useTheme } from "../context/ThemeContext";
import { fmt } from "../utils/formatters";

const currentYear  = new Date().getFullYear();
const currentMonth = new Date().getMonth();
const MONTHS_HE    = ["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const MONTHS_SHORT = ["ינו","פבר","מרץ","אפר","מאי","יון","יול","אוג","ספט","אוק","נוב","דצמ"];

function filterYear(data, year=currentYear) {
  return (data||[]).filter(i=>new Date(i.date).getFullYear()===year||i.colored);
}

function StatCard({ title, value, icon:Icon, color, sub, onClick }) {
  return (
    <div onClick={onClick} style={{
      background:"var(--bg-card)", borderRadius:14, padding:"14px 16px",
      border:"1px solid var(--border-light)", boxShadow:"var(--shadow-card)",
      display:"flex", alignItems:"center", justifyContent:"space-between", gap:8,
      cursor:onClick?"pointer":"default", transition:"transform 0.12s",
    }}
    onMouseEnter={e=>{if(onClick)e.currentTarget.style.transform="translateY(-2px)";}}
    onMouseLeave={e=>{e.currentTarget.style.transform="translateY(0)";}}
    >
      <div style={{minWidth:0}}>
        <p style={{fontSize:11,color:"var(--text-4)",margin:"0 0 3px",fontWeight:500}}>{title}</p>
        <p style={{fontSize:19,fontWeight:700,color:"var(--text-1)",margin:0,lineHeight:1.2}}>{value}</p>
        {sub&&<p style={{fontSize:11,color:"var(--text-4)",margin:"3px 0 0"}}>{sub}</p>}
      </div>
      <div style={{width:40,height:40,borderRadius:12,background:color,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
        <Icon size={18} color="#fff"/>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{fontSize:13,fontWeight:600,color:"var(--text-3)",marginBottom:10,textTransform:"uppercase",letterSpacing:"0.04em"}}>{title}</div>
      {children}
    </div>
  );
}

function Card({ children, style={} }) {
  return (
    <div style={{background:"var(--bg-card)",borderRadius:14,padding:16,border:"1px solid var(--border-light)",boxShadow:"var(--shadow-card)",...style}}>
      {children}
    </div>
  );
}

export default function DashboardPage() {
  const isMobile  = useIsMobile();
  const navigate  = useNavigate();
  const { theme } = useTheme();
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedType, setSelectedType]   = useState("הכנסות");

  const { data: salesData }   = useQuery({ queryKey:["sales"],          queryFn:()=>salesApi.getAll().then(r=>r.data) });
  const { data: checksData }  = useQuery({ queryKey:["bouncedChecks"],  queryFn:()=>bouncedChecksApi.getAll().then(r=>r.data) });
  const { data: workersData } = useQuery({ queryKey:["workersExpenses"],queryFn:()=>workersExpensesApi.getAll().then(r=>r.data) });
  const { data: sleevesData } = useQuery({ queryKey:["sleevesBids"],    queryFn:()=>sleevesBidsApi.getAll().then(r=>r.data) });
  const { data: expensesData }= useQuery({ queryKey:["expenses"],       queryFn:()=>expensesApi.getAll().then(r=>r.data) });
  const { data: partialData } = useQuery({ queryKey:["partialPayment"], queryFn:()=>partialPaymentApi.getAll().then(r=>r.data) });
  const { data: taxValues }   = useQuery({ queryKey:["taxValues"],      queryFn:()=>taxValuesApi.get().then(r=>r.data) });

  const sales    = useMemo(()=>filterYear(salesData),   [salesData]);
  const checks   = useMemo(()=>filterYear(checksData),  [checksData]);
  const workers  = useMemo(()=>filterYear(workersData), [workersData]);
  const sleeves  = useMemo(()=>filterYear(sleevesData), [sleevesData]);
  const expenses = useMemo(()=>filterYear(expensesData),[expensesData]);
  const partial  = useMemo(()=>filterYear(partialData), [partialData]);

  const totalSales    = useMemo(()=>sales.reduce((s,i)=>s+(i.totalAmount||0),0),[sales]);
  const totalExpenses = useMemo(()=>expenses.reduce((s,i)=>s+(i.totalAmount||0),0),[expenses]);
  const totalWorkers  = useMemo(()=>workers.reduce((s,i)=>s+(i.totalAmount||0),0),[workers]);
  const totalSleeves  = useMemo(()=>sleeves.reduce((s,i)=>s+(i.totalAmount||0),0),[sleeves]);
  const openChecks    = useMemo(()=>checks.filter(i=>i.colored).length,[checks]);
  const openPartial   = useMemo(()=>partial.filter(i=>{
    const paid=(i.payments||[]).reduce((s,p)=>s+Number(p.amount||0),0)+((i.payments||[]).length===0?Number(i.advanceAmount||0):0);
    return Number(i.totalAmount||0)-paid>0;
  }),[partial]);
  const totalPartialPending = useMemo(()=>openPartial.reduce((s,i)=>{
    const paid=(i.payments||[]).reduce((ps,p)=>ps+Number(p.amount||0),0)+((i.payments||[]).length===0?Number(i.advanceAmount||0):0);
    return s+(Number(i.totalAmount||0)-paid);
  },0),[openPartial]);
  const profit = totalSales - totalExpenses - totalWorkers;

  const monthlyData = useMemo(()=>MONTHS_SHORT.map((m,i)=>({
    month:m,
    "מכירות": sales.filter(s=>new Date(s.date).getMonth()===i).reduce((a,s)=>a+(s.totalAmount||0),0),
    "הוצאות": [...expenses,...workers].filter(s=>new Date(s.date).getMonth()===i).reduce((a,s)=>a+(s.totalAmount||0),0),
  })),[sales,expenses,workers]);

  const monthDetails = useMemo(()=>{
    const inMonth=(arr)=>arr.filter(i=>new Date(i.date).getMonth()===selectedMonth);
    if(selectedType==="הכנסות"||selectedType==="הכל"){
      return {
        items: inMonth(sales).map(i=>({label:i.clientName||"-",value:i.totalAmount||0,type:"מכירה"})),
        total: inMonth(sales).reduce((s,i)=>s+(i.totalAmount||0),0),
      };
    }
    return {
      items:[...inMonth(expenses),...inMonth(workers)].map(i=>({label:i.name||i.clientName||"-",value:i.totalAmount||0,type:"הוצאה"})),
      total:[...inMonth(expenses),...inMonth(workers)].reduce((s,i)=>s+(i.totalAmount||0),0),
    };
  },[sales,expenses,workers,selectedMonth,selectedType]);

  return (
    <div style={{display:"flex",flexDirection:"column",gap:20,direction:"rtl"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:8}}>
        <div>
          <h1 style={{fontSize:isMobile?20:24,fontWeight:700,color:"var(--text-1)",margin:0}}>לוח בקרה</h1>
          <p style={{fontSize:13,color:"var(--text-3)",margin:"3px 0 0"}}>סיכום פעילות {currentYear}</p>
        </div>
        {taxValues&&(
          <div style={{fontSize:12,color:"var(--text-3)",background:"var(--bg-card)",borderRadius:8,padding:"4px 10px",border:"1px solid var(--border-light)"}}>
            מע״מ {taxValues.maamValue}% · ניכוי {taxValues.masValue}%
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <Section title="סיכום שנתי">
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
          <StatCard title="סה״כ מכירות"   value={fmt(totalSales)}         icon={ShoppingCart} color={theme.primary}  sub={`${sales.length} עסקאות`}     onClick={()=>navigate("/sales")}/>
          <StatCard title="שיקים פתוחים"  value={openChecks}              icon={CheckSquare}  color="#ef4444"        sub="טעון טיפול"                    onClick={()=>navigate("/bounced-checks")}/>
          <StatCard title="הוצאות עובדים" value={fmt(totalWorkers)}        icon={Users}        color="#3b82f6"        sub={`${workers.length} רשומות`}    onClick={()=>navigate("/workers-expenses")}/>
          <StatCard title="שרוולים"        value={fmt(totalSleeves)}        icon={Scissors}     color="#c9a84c"        sub={`${sleeves.length} רשומות`}    onClick={()=>navigate("/sleeves-bids")}/>
          <StatCard title="הוצאות כלליות" value={fmt(totalExpenses)}       icon={TrendingDown} color="#f97316"        sub={`${expenses.length} הוצאות`}   onClick={()=>navigate("/expenses")}/>
          <StatCard title="חוב ממתין"      value={fmt(totalPartialPending)} icon={Clock}        color="#6366f1"        sub={`${openPartial.length} פתוחים`} onClick={()=>navigate("/partial-payment")}/>
        </div>
        <div style={{marginTop:10,borderRadius:14,padding:"14px 18px",
          background:profit>=0?"linear-gradient(135deg,#059669,#10b981)":"linear-gradient(135deg,#dc2626,#ef4444)",
          display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div>
            <p style={{color:"rgba(255,255,255,0.8)",fontSize:12,margin:"0 0 2px"}}>רווח משוער {currentYear}</p>
            <p style={{color:"#fff",fontSize:22,fontWeight:700,margin:0}}>{fmt(profit)} ₪</p>
          </div>
          <TrendingUp size={32} color="rgba(255,255,255,0.3)"/>
        </div>
      </Section>

      {/* Bar Chart */}
      <Section title="מכירות מול הוצאות חודשי">
        <Card>
          <ResponsiveContainer width="100%" height={isMobile?180:240}>
            <BarChart data={monthlyData} margin={{top:4,right:0,left:-20,bottom:0}}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)"/>
              <XAxis dataKey="month" tick={{fontSize:10,fill:"var(--text-4)"}}/>
              <YAxis tick={{fontSize:10,fill:"var(--text-4)"}}/>
              <Tooltip formatter={(v,n)=>[fmt(v),n]}
                contentStyle={{fontFamily:"Assistant",borderRadius:8,fontSize:12,border:"1px solid var(--border)",background:"var(--bg-card)",color:"var(--text-1)"}}/>
              <Legend wrapperStyle={{fontSize:11}}/>
              <Bar dataKey="מכירות" fill={theme.primary} radius={[3,3,0,0]}/>
              <Bar dataKey="הוצאות" fill="#ef4444" radius={[3,3,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </Section>

      {/* Monthly detail */}
      <Section title="פירוט חודשי">
        <div style={{display:"flex",gap:6,marginBottom:10,flexWrap:"wrap"}}>
          {[{k:"הכנסות",c:theme.primary},{k:"הוצאות",c:"#ef4444"},{k:"הכל",c:"var(--text-3)"}].map(t=>(
            <button key={t.k} onClick={()=>setSelectedType(t.k)} style={{padding:"6px 14px",borderRadius:20,border:"none",cursor:"pointer",fontSize:12,fontWeight:500,fontFamily:"inherit",flexShrink:0,transition:"all 0.15s",background:selectedType===t.k?t.c:"var(--bg-tag)",color:selectedType===t.k?"#fff":"var(--text-3)"}}>
              {t.k}
            </button>
          ))}
        </div>
        <div style={{display:"flex",gap:6,overflowX:"auto",paddingBottom:4,marginBottom:10}}>
          {MONTHS_SHORT.map((m,i)=>(
            <button key={i} onClick={()=>setSelectedMonth(i)} style={{padding:"5px 12px",borderRadius:20,border:"none",cursor:"pointer",flexShrink:0,fontSize:12,fontWeight:500,fontFamily:"inherit",transition:"all 0.15s",background:selectedMonth===i?theme.primary:"var(--bg-tag)",color:selectedMonth===i?"#fff":"var(--text-3)"}}>
              {m}
            </button>
          ))}
        </div>
        <Card>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
            <span style={{fontSize:14,fontWeight:600,color:"var(--text-1)"}}>{MONTHS_HE[selectedMonth]} — {selectedType}</span>
            <span style={{fontSize:16,fontWeight:700,color:theme.primary}}>{fmt(monthDetails.total)} ₪</span>
          </div>
          {monthDetails.items.length===0?(
            <div style={{textAlign:"center",padding:"24px 0",color:"var(--text-4)",fontSize:13}}>אין נתונים לחודש זה</div>
          ):(
            <div style={{display:"flex",flexDirection:"column",gap:6,maxHeight:240,overflowY:"auto"}}>
              {monthDetails.items.slice(0,20).map((item,i)=>(
                <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 10px",borderRadius:8,background:"var(--bg-card-alt)",border:"1px solid var(--border-light)"}}>
                  <span style={{fontSize:13,color:"var(--text-1)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:"60%"}}>{item.label}</span>
                  <span style={{fontSize:13,fontWeight:700,color:theme.primary,flexShrink:0}}>{fmt(item.value)} ₪</span>
                </div>
              ))}
              {monthDetails.items.length>20&&<div style={{textAlign:"center",fontSize:12,color:"var(--text-4)"}}>+{monthDetails.items.length-20} נוספים</div>}
            </div>
          )}
        </Card>
      </Section>
    </div>
  );
}
