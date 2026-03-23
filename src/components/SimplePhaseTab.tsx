import { CycleBadge } from "./CycleBadge";
import { EditCell } from "./EditCell";
import { Th, Td } from "./TableComponents";
import { STATUS, STATUS_COLORS, COMPANIES, COMPANY_COLORS } from "../data/initialData";
import type { SimplePhaseRow } from "../data/initialData";

interface Props {
  rows: SimplePhaseRow[];
  onUpdate: (index: number, key: string, value: string) => void;
  onAdd: () => void;
  onDelete: (index: number) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  readOnly: boolean;
}

export function SimplePhaseTab({ rows, onUpdate, onAdd, onDelete, onMove, readOnly }: Props) {
  return (
    <div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {!readOnly && <Th w="30px">{""}</Th>}
            <Th>品番</Th>
            <Th>ステータス</Th>
            <Th>担当会社</Th>
            <Th>備考</Th>
            <Th w="80px">更新日</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {!readOnly && (
                <Td>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <button onClick={() => onMove(i, -1)} style={{ padding: "0 4px", border: "none", background: "transparent", color: "#94a3b8", fontSize: 11, cursor: "pointer", lineHeight: 1 }} title="上に移動">▲</button>
                    <button onClick={() => { if (confirm("この行を削除しますか？")) onDelete(i); }} style={{ padding: "1px 6px", borderRadius: 3, border: "none", background: "transparent", color: "#cbd5e1", fontSize: 14, cursor: "pointer", lineHeight: 1 }} title="削除">×</button>
                    <button onClick={() => onMove(i, 1)} style={{ padding: "0 4px", border: "none", background: "transparent", color: "#94a3b8", fontSize: 11, cursor: "pointer", lineHeight: 1 }} title="下に移動">▼</button>
                  </div>
                </Td>
              )}
              <Td hl><EditCell value={row.item} onChange={v => onUpdate(i, "item", v)} placeholder="品番" width={70} readOnly={readOnly} /></Td>
              <Td><CycleBadge value={row.status} options={STATUS} colors={STATUS_COLORS} onChange={v => onUpdate(i, "status", v)} readOnly={readOnly} /></Td>
              <Td><CycleBadge value={row.company} options={COMPANIES} colors={COMPANY_COLORS} onChange={v => onUpdate(i, "company", v)} readOnly={readOnly} /></Td>
              <Td><EditCell value={row.note} onChange={v => onUpdate(i, "note", v)} placeholder="備考" width={160} readOnly={readOnly} /></Td>
              <Td><span style={{ fontSize: 10, color: "#94a3b8" }}>{row.updatedAt ? new Date(row.updatedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""}</span></Td>
            </tr>
          ))}
        </tbody>
      </table>
      {!readOnly && (
        <button onClick={onAdd} style={{
          padding: "4px 12px", borderRadius: 4, border: "1px dashed #94a3b8",
          background: "#f8fafc", color: "#64748b", fontSize: 11, cursor: "pointer",
          fontWeight: 500, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4,
        }}>+ 行を追加</button>
      )}
    </div>
  );
}
