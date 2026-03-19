import { useState, useRef, useEffect } from "react";

interface EditCellProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  width?: number;
  readOnly?: boolean;
}

export function EditCell({ value, onChange, placeholder, width, readOnly }: EditCellProps) {
  const [editing, setEditing] = useState(false);
  const [tmp, setTmp] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && ref.current) ref.current.focus();
  }, [editing]);

  if (editing && !readOnly) return (
    <input ref={ref} value={tmp} onChange={e => setTmp(e.target.value)}
      onBlur={() => { onChange(tmp); setEditing(false); }}
      onKeyDown={e => { if (e.key === "Enter") { onChange(tmp); setEditing(false); } if (e.key === "Escape") setEditing(false); }}
      style={{ fontSize: 12, padding: "2px 6px", border: "1px solid #3b82f6", borderRadius: 3, outline: "none", width: width || 100, background: "#eff6ff" }}
    />
  );

  return (
    <span
      onClick={() => { if (!readOnly) { setTmp(value); setEditing(true); } }}
      title={readOnly ? (value || "") : "クリックで編集"}
      style={{
        cursor: readOnly ? "default" : "text",
        minWidth: 40, display: "inline-block", padding: "2px 4px", borderRadius: 3,
        borderBottom: readOnly ? "none" : "1px dashed #cbd5e1",
        color: value ? "#334155" : "#cbd5e1", fontSize: 12,
      }}>
      {value || placeholder || "—"}
    </span>
  );
}
