import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companiesApi } from "../api";
import Modal from "../components/ui/Modal";
import ConfirmModal from "../components/ui/ConfirmModal";
import { useTheme } from "../context/ThemeContext";
import { useStyles } from "../hooks/useStyles";
import toast from "react-hot-toast";
import { Plus, Trash2, ChevronDown, ChevronUp, Building, Building2 } from "lucide-react";

export default function CompaniesPage() {
  const qc = useQueryClient();
  const { theme } = useTheme();
  const S = useStyles(theme);

  const { data, isLoading } = useQuery({
    queryKey: ["companies"],
    queryFn: () => companiesApi.getAll().then(r => r.data.companies),
  });

  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ name: "", isInstitution: false, taskDescription: "" });
  const [expanded, setExpanded] = useState({});
  const [confirmId, setConfirmId] = useState(null);

  const invalidate = () => qc.invalidateQueries({ queryKey: ["companies"] });

  const createMut = useMutation({
    mutationFn: (d) => companiesApi.create(d),
    onSuccess: () => { toast.success("נוסף ✓"); invalidate(); setModal(false); },
    onError: (e) => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => companiesApi.remove(id),
    onSuccess: () => { toast.success("נמחק ✓"); invalidate(); setConfirmId(null); },
    onError: (e) => toast.error(e.response?.data?.message || "שגיאה"),
  });

  const companies    = data || [];
  const firms        = companies.filter(c => !c.isInstitution);
  const institutions = companies.filter(c =>  c.isInstitution);

  const toggle = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  // ─── Styles ────────────────────────────────────────────────
  const card = {
    background: "var(--bg-card)",
    border: "1px solid var(--border-light)",
    borderRadius: 14,
    overflow: "hidden",
    boxShadow: "var(--shadow-card)",
  };
  const cardHeader = {
    padding: "14px 18px",
    borderBottom: "1px solid var(--border-light)",
    display: "flex", alignItems: "center", gap: 8,
  };
  const rowStyle = (hover) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "10px 18px",
    background: hover ? "var(--bg-hover)" : "transparent",
    borderBottom: "1px solid var(--border-light)",
    cursor: "pointer",
    transition: "background 0.12s",
  });
  const inputStyle = {
    ...S.input,
    width: "100%",
  };

  function CompanyList({ items, title, icon: Icon }) {
    const [hovered, setHovered] = useState(null);
    return (
      <div style={card}>
        <div style={cardHeader}>
          <Icon size={18} color={theme.primary} />
          <span style={{ fontWeight: 600, fontSize: 14, color: "var(--text-1)" }}>
            {title} ({items.length})
          </span>
        </div>
        <div>
          {items.length === 0 ? (
            <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--text-4)", fontSize: 13 }}>
              אין נתונים
            </div>
          ) : items.map(c => (
            <div key={c._id}>
              <div
                style={rowStyle(hovered === c._id)}
                onMouseEnter={() => setHovered(c._id)}
                onMouseLeave={() => setHovered(null)}
              >
                <button
                  onClick={() => toggle(c._id)}
                  style={{ display: "flex", alignItems: "center", gap: 8, background: "none", border: "none", cursor: "pointer", flex: 1, textAlign: "right" }}
                >
                  {expanded[c._id]
                    ? <ChevronUp  size={15} color="var(--text-4)" />
                    : <ChevronDown size={15} color="var(--text-4)" />
                  }
                  <span style={{ fontWeight: 500, fontSize: 13, color: "var(--text-1)" }}>{c.name}</span>
                  <span style={{
                    fontSize: 11, padding: "2px 8px", borderRadius: 20,
                    background: theme.primaryLight, color: theme.primary,
                  }}>
                    {c.tasks?.length || 0} משימות
                  </span>
                </button>
                <button
                  onClick={() => setConfirmId(c._id)}
                  style={{
                    background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                    borderRadius: 7, color: "#ef4444", cursor: "pointer", padding: "5px 8px",
                    display: "flex", alignItems: "center",
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
              {expanded[c._id] && c.tasks?.length > 0 && (
                <div style={{ background: "var(--bg-card-alt)", padding: "10px 32px", display: "flex", flexDirection: "column", gap: 6 }}>
                  {c.tasks.map(t => (
                    <div key={t._id} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text-2)" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: theme.primary, flexShrink: 0 }} />
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
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "var(--text-1)", margin: 0 }}>חברות ומוסדות</h1>
        <button
          onClick={() => setModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 16px", background: theme.gradient, color: "#fff", border: "none", borderRadius: 10, fontWeight: 600, fontSize: 13, cursor: "pointer", fontFamily: "inherit" }}
        >
          <Plus size={15} /> הוסף
        </button>
      </div>

      {/* Loading */}
      {isLoading ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 60 }}>
          <div className="rosh-spinner" style={{ borderTopColor: theme.primary }} />
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          <CompanyList items={firms}        title="חברות"   icon={Building} />
          <CompanyList items={institutions} title="מוסדות"  icon={Building2} />
        </div>
      )}

      {/* Add Modal */}
      <Modal isOpen={modal} onClose={() => setModal(false)} title="הוספת חברה / מוסד">
        <form
          onSubmit={(e) => { e.preventDefault(); createMut.mutate(form); }}
          style={{ display: "flex", flexDirection: "column", gap: 14 }}
        >
          <div>
            <label style={S.label}>שם</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>
          <div>
            <label style={S.label}>משימה ראשונה</label>
            <input
              type="text"
              value={form.taskDescription}
              onChange={e => setForm(p => ({ ...p, taskDescription: e.target.value }))}
              style={inputStyle}
              required
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              id="isInst"
              checked={form.isInstitution}
              onChange={e => setForm(p => ({ ...p, isInstitution: e.target.checked }))}
              style={{ accentColor: theme.primary, width: 16, height: 16 }}
            />
            <label htmlFor="isInst" style={{ fontSize: 13, color: "var(--text-1)", cursor: "pointer" }}>
              מוסד (לא חברה)
            </label>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button type="submit" disabled={createMut.isPending} style={S.btnSubmit(theme)}>
              {createMut.isPending ? "שומר..." : "שמור"}
            </button>
            <button type="button" onClick={() => setModal(false)} style={S.btnCancel}>
              ביטול
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!confirmId}
        onClose={() => setConfirmId(null)}
        onConfirm={() => deleteMut.mutate(confirmId)}
        message="האם אתה בטוח שברצונך למחוק?"
      />
    </div>
  );
}
