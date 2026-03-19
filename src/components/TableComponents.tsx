import type { ReactNode } from "react";

export function Th({ children, w }: { children: ReactNode; w?: string }) {
  return (
    <th style={{
      padding: "8px 8px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "#475569",
      borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap", width: w || "auto",
      position: "sticky", top: 0, background: "#f8fafc", zIndex: 1,
    }}>{children}</th>
  );
}

export function Td({ children, hl, bg }: { children: ReactNode; hl?: boolean; bg?: string }) {
  return (
    <td style={{
      padding: "6px 8px", fontSize: 12, borderBottom: "1px solid #f1f5f9",
      color: hl ? "#1e40af" : "#334155", fontWeight: hl ? 600 : 400,
      background: bg || "transparent",
    }}>{children}</td>
  );
}

export function Tab({ label, active, onClick, count }: { label: string; active: boolean; onClick: () => void; count?: string }) {
  return (
    <button onClick={onClick} style={{
      padding: "7px 14px", border: "none",
      borderBottom: active ? "3px solid #3b82f6" : "3px solid transparent",
      background: active ? "rgba(59,130,246,0.08)" : "transparent",
      color: active ? "#1e40af" : "#64748b",
      fontWeight: active ? 700 : 500, cursor: "pointer", fontSize: 12,
      whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: 5,
    }}>
      {label}
      {count !== undefined && (
        <span style={{
          fontSize: 10,
          background: active ? "#3b82f620" : "#e2e8f0",
          color: active ? "#1e40af" : "#64748b",
          padding: "1px 6px", borderRadius: 8, fontWeight: 600,
        }}>{count}</span>
      )}
    </button>
  );
}
