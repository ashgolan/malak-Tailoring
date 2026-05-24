import { useState, useEffect, useRef } from "react";

export default function AutocompleteInput({
  value, onChange, suggestions = [], placeholder = "", required = false,
  style, onFocus, onBlur,
}) {
  const [list, setList] = useState([]);
  const [show, setShow] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setShow(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const handleChange = (e) => {
    const v = e.target.value;
    onChange({ target: { value: v } });
    setList(suggestions.filter(s => s.toLowerCase().includes(v.toLowerCase())));
    setShow(true);
  };

  const handleFocus = (e) => {
    setList(suggestions);
    setShow(suggestions.length > 0);
    onFocus?.(e);
  };

  return (
    <div style={{ position: "relative" }} ref={ref}>
      <input
        type="text"
        value={value}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        required={required}
        autoComplete="off"
        style={style}
      />
      {show && list.length > 0 && (
        <div style={{
          position: "absolute", top: "100%", right: 0, left: 0,
          background: "var(--bg-card)", border: "1px solid var(--border)",
          borderRadius: 8, boxShadow: "var(--shadow-modal)",
          zIndex: 1000, maxHeight: 180, overflowY: "auto", marginTop: 2,
        }}>
          {list.map((c, i) => (
            <div key={i}
              onClick={() => { onChange({ target: { value: c } }); setShow(false); }}
              style={{ padding: "9px 12px", cursor: "pointer", fontSize: 13, color: "var(--text-1)", borderBottom: "1px solid var(--border-light)" }}
              onMouseEnter={e => e.currentTarget.style.background = "var(--bg-hover)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {c}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}