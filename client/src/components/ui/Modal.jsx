import { useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({ isOpen, onClose, title, children, size = "md" }) {
  const mouseDownTarget = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxW = { sm: 420, md: 540, lg: 680, xl: 900 }[size] || 540;

  return (
    <div
      className="rosh-overlay"
      onMouseDown={e => { mouseDownTarget.current = e.target; }}
      onMouseUp={e => { if (mouseDownTarget.current === e.currentTarget && e.target === e.currentTarget) onClose(); }}
    >
      <div className="rosh-modal" style={{ width: "100%", maxWidth: maxW, maxHeight: "90vh", display: "flex", flexDirection: "column" }}>
        <div className="rosh-modal-header">
          <h2 className="rosh-modal-title">{title}</h2>
          <button onClick={onClose}
            style={{ background: "transparent", border: "none", cursor: "pointer", padding: 6, borderRadius: 8, color: "var(--text-3)", display: "flex", transition: "background 0.15s" }}
            onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <X size={18} />
          </button>
        </div>
        <div className="rosh-modal-body" style={{ flex: 1 }}>
          {children}
        </div>
      </div>
    </div>
  );
}