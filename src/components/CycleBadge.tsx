interface CycleBadgeProps {
  value: string;
  options: readonly string[];
  colors: Record<string, string>;
  onChange: (v: string) => void;
  readOnly?: boolean;
}

export function CycleBadge({ value, options, colors, onChange, readOnly }: CycleBadgeProps) {
  const cycle = () => {
    if (readOnly) return;
    const i = options.indexOf(value);
    onChange(options[(i + 1) % options.length]);
  };
  const c = colors[value] || "#94a3b8";
  return (
    <button onClick={cycle} title={readOnly ? value : "クリックで切替"} style={{
      display: "inline-block", padding: "2px 10px", borderRadius: 4, fontSize: 11, fontWeight: 600,
      background: c + "20", color: c, border: `1px solid ${c}40`,
      cursor: readOnly ? "default" : "pointer",
      transition: "all 0.15s", lineHeight: "18px", whiteSpace: "nowrap",
      opacity: readOnly ? 0.8 : 1,
    }}>{value}</button>
  );
}
