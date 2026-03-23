import { useState, useRef, useCallback } from "react";
import { CycleBadge } from "./CycleBadge";
import {
  PHASES, COMPANIES, COMPANY_COLORS,
  GANTT_START, GANTT_END,
} from "../data/initialData";
import type { GanttRow, Item, PartRow, CncRow, FinishRow } from "../data/initialData";

interface GanttChartProps {
  gantt: GanttRow[];
  setGantt: React.Dispatch<React.SetStateAction<GanttRow[]>>;
  items: Item[];
  parts: PartRow[];
  cnc: CncRow[];
  finish: FinishRow[];
  filter: string;
  readOnly: boolean;
}

const CELL_W = 28;
const COL_ITEM = 70;
const COL_PHASE = 90;
const COL_COMPANY = 80;
// total sticky width: COL_ITEM + COL_PHASE + COL_COMPANY

const BAR_COLORS: Record<string, string> = {
  "未着手": "#d1d5db",
  "進行中": "#3b82f6",
  "完了": "#10b981",
  "保留": "#f59e0b",
  "欠品": "#ef4444",
  "未確認": "#ef4444",
  "確認中": "#f97316",
};

const LEGEND_ITEMS = [
  { label: "未着手", color: "#d1d5db" },
  { label: "進行中", color: "#3b82f6" },
  { label: "完了", color: "#10b981" },
  { label: "保留", color: "#f59e0b" },
  { label: "欠品/未確認", color: "#ef4444" },
  { label: "確認中", color: "#f97316" },
];

function generateDates(start: string, end: string): string[] {
  const dates: string[] = [];
  const d = new Date(start);
  const e = new Date(end);
  while (d <= e) {
    dates.push(d.toISOString().slice(0, 10));
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

function toMD(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

function computeAutoStatus(
  phase: string,
  itemId: string,
  parts: PartRow[],
  cnc: CncRow[],
  finish: FinishRow[],
  ganttRow: GanttRow,
): string {
  if (phase === "材料調達") {
    const rows = parts.filter(p => p.item === itemId);
    if (rows.length === 0) return ganttRow.status;
    if (rows.every(r => r.procure === "入荷済")) return "完了";
    if (rows.some(r => r.procure === "欠品")) return "欠品";
    if (rows.some(r => r.procure === "発注済" || r.procure === "入荷済")) return "進行中";
    return "未着手";
  }
  if (phase === "木部CNC加工") {
    const rows = cnc.filter(c => c.item === itemId);
    if (rows.length === 0) return ganttRow.status;
    if (rows.every(r => r.cncStatus === "完了")) return "完了";
    if (rows.some(r => r.cncStatus === "進行中" || r.cncStatus === "完了")) return "進行中";
    return "未着手";
  }
  if (phase === "仕上げ") {
    const rows = finish.filter(f => f.item === itemId);
    if (rows.length === 0) return ganttRow.status;
    if (rows.some(r => r.sample === "未確認")) return "未確認";
    if (rows.some(r => r.sample === "確認中")) return "確認中";
    if (rows.every(r => r.status === "完了")) return "完了";
    if (rows.some(r => r.status === "進行中" || r.status === "完了")) return "進行中";
    return "未着手";
  }
  return ganttRow.status;
}

export function GanttChart({ gantt, setGantt, items, parts, cnc, finish, filter, readOnly }: GanttChartProps) {
  const dates = generateDates(GANTT_START, GANTT_END);
  const today = todayStr();

  // Drag state refs
  const dragRef = useRef<{
    rowIdx: number;
    startCol: number;
    endCol: number;
    active: boolean;
  } | null>(null);
  const [dragPreview, setDragPreview] = useState<{
    rowIdx: number;
    startCol: number;
    endCol: number;
  } | null>(null);

  // Date picker modal
  const [modal, setModal] = useState<{
    rowIdx: number;
    startDate: string;
    endDate: string;
  } | null>(null);

  const filteredItems = filter
    ? items.filter(it => it.id === filter)
    : items;

  const getRowIdx = useCallback((itemId: string, phase: string): number => {
    return gantt.findIndex(r => r.item === itemId && r.phase === phase);
  }, [gantt]);

  const handleMouseDown = useCallback((rowIdx: number, colIdx: number) => {
    if (readOnly) return;
    dragRef.current = { rowIdx, startCol: colIdx, endCol: colIdx, active: true };
    setDragPreview({ rowIdx, startCol: colIdx, endCol: colIdx });
  }, [readOnly]);

  const handleMouseMove = useCallback((_rowIdx: number, colIdx: number) => {
    if (!dragRef.current?.active) return;
    dragRef.current.endCol = colIdx;
    setDragPreview({
      rowIdx: dragRef.current.rowIdx,
      startCol: Math.min(dragRef.current.startCol, colIdx),
      endCol: Math.max(dragRef.current.startCol, colIdx),
    });
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!dragRef.current?.active) return;
    const { rowIdx, startCol, endCol } = dragRef.current;
    const s = Math.min(startCol, endCol);
    const e = Math.max(startCol, endCol);
    dragRef.current = null;
    setDragPreview(null);

    setGantt(prev => prev.map((r, i) =>
      i === rowIdx
        ? { ...r, startDate: dates[s], endDate: dates[e], updatedAt: new Date().toISOString().slice(0, 16) }
        : r
    ));
  }, [dates, setGantt]);

  const handleCellClick = useCallback((rowIdx: number, colIdx: number) => {
    if (readOnly) return;
    const row = gantt[rowIdx];
    if (row.startDate && row.endDate) return; // already has dates
    setModal({
      rowIdx,
      startDate: dates[colIdx],
      endDate: dates[colIdx],
    });
  }, [readOnly, gantt, dates]);

  const handleModalSave = useCallback(() => {
    if (!modal) return;
    setGantt(prev => prev.map((r, i) =>
      i === modal.rowIdx
        ? { ...r, startDate: modal.startDate, endDate: modal.endDate, updatedAt: new Date().toISOString().slice(0, 16) }
        : r
    ));
    setModal(null);
  }, [modal, setGantt]);

  const handleCompanyChange = useCallback((rowIdx: number, v: string) => {
    setGantt(prev => prev.map((r, i) =>
      i === rowIdx
        ? { ...r, company: v, updatedAt: new Date().toISOString().slice(0, 16) }
        : r
    ));
  }, [setGantt]);

  const _handleStatusChange = useCallback((rowIdx: number, v: string) => {
    setGantt(prev => prev.map((r, i) =>
      i === rowIdx
        ? { ...r, status: v, updatedAt: new Date().toISOString().slice(0, 16) }
        : r
    ));
  }, [setGantt]);
  void _handleStatusChange;

  // Resolve effective status for each row
  const getEffectiveStatus = useCallback((row: GanttRow): string => {
    return computeAutoStatus(row.phase, row.item, parts, cnc, finish, row);
  }, [parts, cnc, finish]);

  const isInRange = (dateStr: string, start: string, end: string): boolean => {
    if (!start || !end) return false;
    return dateStr >= start && dateStr <= end;
  };

  const tableStyle: React.CSSProperties = {
    borderCollapse: "collapse",
    fontSize: 12,
    whiteSpace: "nowrap",
  };

  const stickyBase: React.CSSProperties = {
    position: "sticky",
    background: "#fff",
    zIndex: 2,
    borderBottom: "1px solid #e2e8f0",
    borderRight: "1px solid #e2e8f0",
    padding: "2px 4px",
    verticalAlign: "middle",
  };

  return (
    <div style={{ position: "relative" }}>
      <div style={{ overflowX: "auto", maxHeight: "70vh", overflowY: "auto" }}>
        <table style={tableStyle} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <thead>
            <tr>
              <th style={{ ...stickyBase, left: 0, width: COL_ITEM, minWidth: COL_ITEM, zIndex: 3, top: 0, position: "sticky", background: "#f8fafc" }}>品番</th>
              <th style={{ ...stickyBase, left: COL_ITEM, width: COL_PHASE, minWidth: COL_PHASE, zIndex: 3, top: 0, position: "sticky", background: "#f8fafc" }}>フェーズ</th>
              <th style={{ ...stickyBase, left: COL_ITEM + COL_PHASE, width: COL_COMPANY, minWidth: COL_COMPANY, zIndex: 3, top: 0, position: "sticky", background: "#f8fafc" }}>会社</th>
              {dates.map(d => {
                const weekend = isWeekend(d);
                const isToday = d === today;
                return (
                  <th key={d} style={{
                    ...stickyBase,
                    top: 0,
                    position: "sticky",
                    zIndex: 1,
                    width: CELL_W,
                    minWidth: CELL_W,
                    maxWidth: CELL_W,
                    textAlign: "center",
                    fontSize: 10,
                    fontWeight: 400,
                    background: weekend ? "#f1f5f9" : "#f8fafc",
                    ...(isToday ? { border: "2px solid #ef4444" } : {}),
                  }}>{toMD(d)}</th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(item => {
              const itemPhases = PHASES.map(phase => {
                const rowIdx = getRowIdx(item.id, phase);
                return { phase, rowIdx, row: gantt[rowIdx] };
              });

              return itemPhases.map(({ phase, rowIdx, row }, pIdx) => {
                if (rowIdx < 0 || !row) return null;
                const effectiveStatus = getEffectiveStatus(row);
                const barColor = BAR_COLORS[effectiveStatus] || BAR_COLORS["未着手"];
                const isLastPhase = pIdx === PHASES.length - 1;

                return (
                  <tr key={`${item.id}-${phase}`} style={{
                    borderBottom: isLastPhase ? "2px solid #e2e8f0" : "1px solid #e2e8f0",
                  }}>
                    {pIdx === 0 && (
                      <td style={{
                        ...stickyBase,
                        left: 0,
                        width: COL_ITEM,
                        minWidth: COL_ITEM,
                        fontWeight: 700,
                        fontSize: 11,
                        borderBottom: isLastPhase ? "2px solid #e2e8f0" : "1px solid #e2e8f0",
                      }} rowSpan={7}>
                        {item.id}
                      </td>
                    )}
                    <td style={{
                      ...stickyBase,
                      left: COL_ITEM,
                      width: COL_PHASE,
                      minWidth: COL_PHASE,
                      fontSize: 11,
                      borderBottom: isLastPhase ? "2px solid #e2e8f0" : "1px solid #e2e8f0",
                    }}>
                      <div>{phase}</div>
                      {row.updatedAt && (
                        <div style={{ fontSize: 9, color: "#94a3b8", marginTop: 1 }}>{row.updatedAt}</div>
                      )}
                    </td>
                    <td style={{
                      ...stickyBase,
                      left: COL_ITEM + COL_PHASE,
                      width: COL_COMPANY,
                      minWidth: COL_COMPANY,
                      borderBottom: isLastPhase ? "2px solid #e2e8f0" : "1px solid #e2e8f0",
                    }}>
                      <CycleBadge
                        value={row.company}
                        options={COMPANIES}
                        colors={COMPANY_COLORS}
                        onChange={(v) => handleCompanyChange(rowIdx, v)}
                        readOnly={readOnly}
                      />
                    </td>
                    {dates.map((d, colIdx) => {
                      const weekend = isWeekend(d);
                      const isToday = d === today;
                      const inRange = isInRange(d, row.startDate, row.endDate);
                      const isDragPreview = dragPreview && dragPreview.rowIdx === rowIdx &&
                        colIdx >= dragPreview.startCol && colIdx <= dragPreview.endCol;

                      let bgColor = weekend ? "#f9fafb" : "#fff";
                      if (inRange) {
                        bgColor = hexToRgba(barColor, 0.4);
                      }
                      if (isDragPreview) {
                        bgColor = hexToRgba("#3b82f6", 0.6);
                      }

                      return (
                        <td
                          key={d}
                          style={{
                            width: CELL_W,
                            minWidth: CELL_W,
                            maxWidth: CELL_W,
                            height: 24,
                            padding: 0,
                            background: bgColor,
                            borderBottom: isLastPhase ? "2px solid #e2e8f0" : "1px solid #e2e8f0",
                            borderRight: "1px solid #f1f5f9",
                            cursor: readOnly ? "default" : "crosshair",
                            ...(isToday ? { boxShadow: "inset 0 0 0 1px #ef4444" } : {}),
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            if (!row.startDate && !row.endDate) {
                              handleCellClick(rowIdx, colIdx);
                            } else {
                              handleMouseDown(rowIdx, colIdx);
                            }
                          }}
                          onMouseMove={() => handleMouseMove(rowIdx, colIdx)}
                        />
                      );
                    })}
                  </tr>
                );
              });
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap", fontSize: 11 }}>
        {LEGEND_ITEMS.map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <div style={{ width: 14, height: 14, borderRadius: 3, background: hexToRgba(l.color, 0.4), border: `1px solid ${l.color}` }} />
            <span>{l.label}</span>
          </div>
        ))}
      </div>

      {/* Date picker modal */}
      {modal && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setModal(null)}>
          <div style={{
            background: "#fff", borderRadius: 8, padding: 20, minWidth: 280,
            boxShadow: "0 4px 24px rgba(0,0,0,0.15)",
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 12px", fontSize: 14 }}>日程を設定</h3>
            <div style={{ marginBottom: 8 }}>
              <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>開始日</label>
              <input
                type="date"
                value={modal.startDate}
                min={GANTT_START}
                max={GANTT_END}
                onChange={e => setModal({ ...modal, startDate: e.target.value })}
                style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #d1d5db", width: "100%" }}
              />
            </div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: "block", fontSize: 12, marginBottom: 2 }}>終了日</label>
              <input
                type="date"
                value={modal.endDate}
                min={GANTT_START}
                max={GANTT_END}
                onChange={e => setModal({ ...modal, endDate: e.target.value })}
                style={{ padding: "4px 8px", borderRadius: 4, border: "1px solid #d1d5db", width: "100%" }}
              />
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setModal(null)} style={{
                padding: "6px 14px", borderRadius: 4, border: "1px solid #d1d5db",
                background: "#fff", cursor: "pointer", fontSize: 12,
              }}>キャンセル</button>
              <button onClick={handleModalSave} style={{
                padding: "6px 14px", borderRadius: 4, border: "none",
                background: "#3b82f6", color: "#fff", cursor: "pointer", fontSize: 12,
              }}>保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
