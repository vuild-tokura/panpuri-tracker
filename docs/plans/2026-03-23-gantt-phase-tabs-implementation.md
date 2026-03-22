# Gantt Chart & Phase-Based Tab Restructure — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Restructure the tracker app from data-type tabs to phase-based tabs (9 total), add a Gantt chart view with daily timeline (3/23–4/16), auto-status sync from detail tabs, and updated_at tracking on all tables.

**Architecture:** Single-page React app with inline styles. Each tab renders in App.tsx controlled by `tab` state index. Data persists via `useSupabaseTable` hook (Supabase + localStorage fallback). New Gantt chart is a standalone component using mouse events for drag-select and native `<input type="date">` for date pickers.

**Tech Stack:** React 19, TypeScript 5.9, Vite 8, Supabase (PostgreSQL), inline CSS

---

## Task 1: Add new type definitions and constants

**Files:**
- Modify: `src/data/initialData.ts`

**Step 1: Add new interfaces for simple phase tabs and gantt**

Add after existing interfaces in `src/data/initialData.ts`:

```typescript
export interface SimplePhaseRow {
  item: string;
  status: string;
  company: string;
  note: string;
  updatedAt?: string;
}

export interface GanttRow {
  item: string;
  phase: string;
  company: string;
  startDate: string;
  endDate: string;
  status: string;
  note: string;
  updatedAt?: string;
}
```

**Step 2: Add updatedAt to all existing interfaces**

Add `updatedAt?: string;` to: `Item`, `FinishRow`, `PartRow`, `ApprovalRow`, `CncRow`, `PhaseRow`.

**Step 3: Add initial data factories for new tables**

```typescript
export const initSimplePhase = (items: Item[]): SimplePhaseRow[] =>
  items.map(it => ({ item: it.id, status: "未着手", company: "", note: "" }));

export const initGantt = (items: Item[]): GanttRow[] =>
  items.flatMap(it =>
    PHASES.map(phase => ({
      item: it.id, phase, company: "", startDate: "", endDate: "", status: "未着手", note: "",
    }))
  );
```

**Step 4: Add gantt date range constants**

```typescript
export const GANTT_START = "2026-03-23";
export const GANTT_END = "2026-04-16";
```

**Step 5: Build and verify no errors**

Run: `npm run build`
Expected: Build succeeds

**Step 6: Commit**

```bash
git add src/data/initialData.ts
git commit -m "feat: add type definitions for gantt and simple phase tabs"
```

---

## Task 2: Add Supabase schema for new tables

**Files:**
- Modify: `supabase/schema.sql`

**Step 1: Add gantt table DDL**

```sql
-- gantt テーブル
CREATE TABLE gantt (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  phase TEXT NOT NULL DEFAULT '',
  company TEXT NOT NULL DEFAULT '',
  start_date TEXT NOT NULL DEFAULT '',
  end_date TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '未着手',
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

**Step 2: Add 4 simple phase tables**

```sql
-- metalwork テーブル（金属加工）
CREATE TABLE metalwork (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '未着手',
  company TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- assembly テーブル（組立）
CREATE TABLE assembly (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '未着手',
  company TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- inspection テーブル（検品）
CREATE TABLE inspection (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '未着手',
  company TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- delivery テーブル（納品）
CREATE TABLE delivery (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT '未着手',
  company TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  updated_at TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);
```

**Step 3: Add RLS policies for new tables**

```sql
ALTER TABLE gantt ENABLE ROW LEVEL SECURITY;
ALTER TABLE metalwork ENABLE ROW LEVEL SECURITY;
ALTER TABLE assembly ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on gantt" ON gantt FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on metalwork" ON metalwork FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on assembly" ON assembly FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on inspection" ON inspection FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on delivery" ON delivery FOR ALL USING (true) WITH CHECK (true);
```

**Step 4: Add updated_at columns to existing tables**

```sql
-- Add updated_at to existing tables
ALTER TABLE items ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE finish ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE approval ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE cnc ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE phase ADD COLUMN IF NOT EXISTS updated_at TEXT;
```

**Step 5: Commit**

```bash
git add supabase/schema.sql
git commit -m "feat: add Supabase schema for gantt and simple phase tables"
```

**IMPORTANT:** After commit, run the new SQL against the live Supabase instance via the Supabase dashboard SQL editor. The schema.sql file is documentation — it is not auto-applied.

---

## Task 3: Wire up new useSupabaseTable hooks in App.tsx

**Files:**
- Modify: `src/App.tsx`

**Step 1: Add imports for new types**

Add to the import from `./data/initialData`:
```typescript
import type { ..., SimplePhaseRow, GanttRow } from "./data/initialData";
import { ..., initSimplePhase, initGantt, GANTT_START, GANTT_END } from "./data/initialData";
```

**Step 2: Add 5 new useSupabaseTable hooks inside App()**

Add after existing hooks (line ~82):

```typescript
const [gantt, setGantt] = useSupabaseTable<GanttRow>({
  table: "gantt",
  localStorageKey: "panpuri-gantt",
  initialValue: initGantt(initItems),
  columnMap: { startDate: "start_date", endDate: "end_date", updatedAt: "updated_at" },
});
const [metalwork, setMetalwork] = useSupabaseTable<SimplePhaseRow>({
  table: "metalwork",
  localStorageKey: "panpuri-metalwork",
  initialValue: initSimplePhase(initItems),
  columnMap: { updatedAt: "updated_at" },
});
const [assembly, setAssembly] = useSupabaseTable<SimplePhaseRow>({
  table: "assembly",
  localStorageKey: "panpuri-assembly",
  initialValue: initSimplePhase(initItems),
  columnMap: { updatedAt: "updated_at" },
});
const [inspection, setInspection] = useSupabaseTable<SimplePhaseRow>({
  table: "inspection",
  localStorageKey: "panpuri-inspection",
  initialValue: initSimplePhase(initItems),
  columnMap: { updatedAt: "updated_at" },
});
const [delivery, setDelivery] = useSupabaseTable<SimplePhaseRow>({
  table: "delivery",
  localStorageKey: "panpuri-delivery",
  initialValue: initSimplePhase(initItems),
  columnMap: { updatedAt: "updated_at" },
});
```

**Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds (hooks are declared but not yet rendered)

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire up useSupabaseTable hooks for gantt and simple phase tables"
```

---

## Task 4: Restructure tabs array and update tab rendering

**Files:**
- Modify: `src/App.tsx`

**Step 1: Replace tabs and icons arrays**

Replace the existing `tabs` and `icons` lines:

```typescript
const tabs = ["ガント", "材料調達", "木部CNC加工", "仕上げ", "金属加工", "組立", "検品", "納品", "ToDo"];
const icons = ["📊", "📦", "🔧", "🎨", "⚙️", "🔨", "🔍", "🚚", "🚩"];
```

**Step 2: Update tab counter logic in Tab components**

Update the tab rendering section to use new tab indices:
- Tab 1 (材料調達): parts procure count
- Tab 2 (木部CNC加工): cnc completed count
- Tab 3 (仕上げ): finish completed count
- Tab 8 (ToDo): todo count

**Step 3: Remap tab content rendering**

Remap the `{tab === N && ...}` blocks:
- `tab === 0` → Gantt (placeholder div for now)
- `tab === 1` → Parts table (was tab 2) — rename header to "材料調達"
- `tab === 2` → CNC table (was tab 4) — rename header to "木部CNC加工"
- `tab === 3` → Finish + Approval merged (was tabs 1+3) — rename to "仕上げ"
- `tab === 4` → Metalwork (new simple table)
- `tab === 5` → Assembly (new simple table)
- `tab === 6` → Inspection (new simple table)
- `tab === 7` → Delivery (new simple table)
- `tab === 8` → ToDo (was tab 6)

Remove old tab 0 (品番一覧) and tab 5 (フェーズ) content entirely.

**Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: restructure tabs from data-type to phase-based layout"
```

---

## Task 5: Build SimplePhaseTab component

**Files:**
- Create: `src/components/SimplePhaseTab.tsx`

**Step 1: Create the component**

```typescript
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
            {/* small updated_at column */}
            <Th w="80px">更新日</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {!readOnly && (
                <Td>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <button onClick={() => onMove(i, -1)} style={moveBtnStyle} title="上に移動">▲</button>
                    <button onClick={() => { if (confirm("この行を削除しますか？")) onDelete(i); }} style={delBtnStyle} title="削除">×</button>
                    <button onClick={() => onMove(i, 1)} style={moveBtnStyle} title="下に移動">▼</button>
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

const delBtnStyle: React.CSSProperties = {
  padding: "1px 6px", borderRadius: 3, border: "none",
  background: "transparent", color: "#cbd5e1", fontSize: 14, cursor: "pointer", lineHeight: 1,
};

const moveBtnStyle: React.CSSProperties = {
  padding: "0 4px", border: "none", background: "transparent",
  color: "#94a3b8", fontSize: 11, cursor: "pointer", lineHeight: 1,
};
```

**Step 2: Wire into App.tsx tabs 4-7**

In App.tsx, for each of tabs 4-7, render:
```tsx
{tab === 4 && <SimplePhaseTab rows={fltMetalwork} onUpdate={updMetalwork} onAdd={addMetalwork} onDelete={(i) => delRow(setMetalwork, i)} onMove={(i, d) => moveRow(setMetalwork, i, d)} readOnly={readOnly} />}
```

Add the corresponding filter/update/add helpers:
```typescript
const fltMetalwork = filter === "ALL" ? metalwork : metalwork.filter(d => d.item === filter);
const fltAssembly = filter === "ALL" ? assembly : assembly.filter(d => d.item === filter);
const fltInspection = filter === "ALL" ? inspection : inspection.filter(d => d.item === filter);
const fltDelivery = filter === "ALL" ? delivery : delivery.filter(d => d.item === filter);

const updSimple = (setter: React.Dispatch<React.SetStateAction<SimplePhaseRow[]>>, gi: number, k: string, v: string) =>
  setter(p => p.map((r, j) => j === gi ? { ...r, [k]: v, updatedAt: new Date().toISOString() } : r));

const addSimple = (setter: React.Dispatch<React.SetStateAction<SimplePhaseRow[]>>) => {
  const itemId = filter !== "ALL" ? filter : (items[0]?.id || "");
  setter(p => [...p, { item: itemId, status: "未着手", company: "", note: "" }]);
};
```

**Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds

**Step 4: Commit**

```bash
git add src/components/SimplePhaseTab.tsx src/App.tsx
git commit -m "feat: add SimplePhaseTab component for metalwork/assembly/inspection/delivery"
```

---

## Task 6: Merge approval into finish tab

**Files:**
- Modify: `src/App.tsx`

**Step 1: Combine finish and approval rendering in tab 3**

In the `tab === 3` (仕上げ) section, render the existing finish table first, then render the approval table below it with a section divider:

```tsx
{tab === 3 && (
  <div>
    {/* 仕上げテーブル (existing finish table code) */}
    <table>...</table>
    {!readOnly && <button onClick={addFinish} style={addBtnStyle}>+ 仕上げ行を追加</button>}

    {/* 承認セクション */}
    <h3 style={{ fontSize: 13, fontWeight: 700, color: "#475569", marginTop: 24, marginBottom: 8, borderTop: "2px solid #e2e8f0", paddingTop: 12 }}>
      承認状況 ({completedApproval}/{approval.length})
    </h3>
    <table>...</table>
    {!readOnly && <button onClick={addApproval} style={addBtnStyle}>+ 承認行を追加</button>}
  </div>
)}
```

**Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/App.tsx
git commit -m "feat: merge approval section into finish tab"
```

---

## Task 7: Add updated_at tracking to existing update helpers

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update all `upd*` helpers to set updatedAt**

Modify each update helper to include `updatedAt: new Date().toISOString()`:

```typescript
const updFinish = (gi: number, k: string, v: string) =>
  setFinish(p => p.map((r, j) => j === gi ? { ...r, [k]: v, updatedAt: new Date().toISOString() } : r));
// Same pattern for updParts, updApproval, updCnc, updPhase, updItem
```

**Step 2: Add columnMap entries for updatedAt in existing hooks**

Add `updatedAt: "updated_at"` to the `columnMap` of each existing `useSupabaseTable` call.

**Step 3: Add global last-updated display in header**

Compute the most recent `updatedAt` across all data arrays and display it in the header:

```typescript
const allUpdates = [
  ...items.map(r => r.updatedAt),
  ...finish.map(r => r.updatedAt),
  ...parts.map(r => r.updatedAt),
  ...approval.map(r => r.updatedAt),
  ...cnc.map(r => r.updatedAt),
  ...gantt.map(r => r.updatedAt),
  ...metalwork.map(r => r.updatedAt),
  ...assembly.map(r => r.updatedAt),
  ...inspection.map(r => r.updatedAt),
  ...delivery.map(r => r.updatedAt),
].filter(Boolean) as string[];
const lastUpdated = allUpdates.length > 0
  ? new Date(allUpdates.sort().reverse()[0]).toLocaleString("ja-JP")
  : null;
```

In the header div, add after the mode badge:
```tsx
{lastUpdated && (
  <span style={{ fontSize: 10, color: "#94a3b8", marginLeft: 8 }}>
    最終更新: {lastUpdated}
  </span>
)}
```

**Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: add updated_at tracking and global last-updated display"
```

---

## Task 8: Build GanttChart component — layout and date grid

**Files:**
- Create: `src/components/GanttChart.tsx`

**Step 1: Create component with date header and row structure**

This is the most complex component. Build it incrementally.

```typescript
import { useState, useCallback, useRef } from "react";
import { CycleBadge } from "./CycleBadge";
import {
  PHASES, STATUS, STATUS_COLORS, COMPANIES, COMPANY_COLORS,
  GANTT_START, GANTT_END,
} from "../data/initialData";
import type { GanttRow, Item, PartRow, CncRow, FinishRow } from "../data/initialData";

// Generate array of dates from start to end
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

function formatDateHeader(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function isWeekend(dateStr: string): boolean {
  const day = new Date(dateStr).getDay();
  return day === 0 || day === 6;
}

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

export function GanttChart({ gantt, setGantt, items, parts, cnc, finish, filter, readOnly }: GanttChartProps) {
  const dates = generateDates(GANTT_START, GANTT_END);
  const today = new Date().toISOString().slice(0, 10);
  const filteredItems = filter === "ALL" ? items : items.filter(it => it.id === filter);

  // Drag selection state
  const [dragStart, setDragStart] = useState<{ item: string; phase: string; date: string } | null>(null);
  const [dragEnd, setDragEnd] = useState<string | null>(null);
  const isDragging = useRef(false);

  const getRow = (item: string, phase: string) =>
    gantt.find(r => r.item === item && r.phase === phase);

  const updateRow = (item: string, phase: string, updates: Partial<GanttRow>) => {
    setGantt(prev => {
      const idx = prev.findIndex(r => r.item === item && r.phase === phase);
      if (idx >= 0) {
        return prev.map((r, i) => i === idx ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r);
      }
      return [...prev, { item, phase, company: "", startDate: "", endDate: "", status: "未着手", note: "", ...updates, updatedAt: new Date().toISOString() }];
    });
  };

  // Compute auto status from detail tabs
  const getAutoStatus = (item: string, phase: string): string | null => {
    if (phase === "材料調達") {
      const itemParts = parts.filter(p => p.item === item);
      if (itemParts.length === 0) return null;
      if (itemParts.some(p => p.procure === "欠品")) return "欠品";
      if (itemParts.every(p => p.procure === "入荷済")) return "完了";
      if (itemParts.some(p => p.procure === "発注済" || p.procure === "入荷済")) return "進行中";
      return "未着手";
    }
    if (phase === "木部CNC加工") {
      const itemCnc = cnc.filter(c => c.item === item);
      if (itemCnc.length === 0) return null;
      if (itemCnc.every(c => c.cncStatus === "完了")) return "完了";
      if (itemCnc.some(c => c.cncStatus === "進行中" || c.cncStatus === "完了")) return "進行中";
      return "未着手";
    }
    if (phase === "仕上げ") {
      const itemFinish = finish.filter(f => f.item === item);
      if (itemFinish.length === 0) return null;
      if (itemFinish.some(f => f.sample === "未確認")) return "未確認";
      if (itemFinish.some(f => f.sample === "確認中")) return "確認中";
      if (itemFinish.every(f => f.status === "完了")) return "完了";
      if (itemFinish.some(f => f.status === "進行中" || f.status === "完了")) return "進行中";
      return "未着手";
    }
    return null; // manual phases
  };

  // Get display status (auto or manual)
  const getDisplayStatus = (item: string, phase: string): string => {
    const auto = getAutoStatus(item, phase);
    if (auto) return auto;
    const row = getRow(item, phase);
    return row?.status || "未着手";
  };

  // Bar color based on status
  const getBarColor = (status: string): string => {
    if (status === "完了") return "#10b981";
    if (status === "進行中") return "#3b82f6";
    if (status === "保留") return "#f59e0b";
    if (status === "欠品" || status === "未確認") return "#ef4444";
    if (status === "確認中") return "#f97316";
    return "#d1d5db"; // 未着手
  };

  // Check if date is within bar range
  const isInRange = (item: string, phase: string, date: string): boolean => {
    const row = getRow(item, phase);
    if (!row?.startDate || !row?.endDate) return false;
    return date >= row.startDate && date <= row.endDate;
  };

  // Check if date is in current drag selection
  const isInDragRange = (item: string, phase: string, date: string): boolean => {
    if (!dragStart || !dragEnd) return false;
    if (dragStart.item !== item || dragStart.phase !== phase) return false;
    const start = dragStart.date < dragEnd ? dragStart.date : dragEnd;
    const end = dragStart.date < dragEnd ? dragEnd : dragStart.date;
    return date >= start && date <= end;
  };

  const handleMouseDown = (item: string, phase: string, date: string) => {
    if (readOnly) return;
    isDragging.current = true;
    setDragStart({ item, phase, date });
    setDragEnd(date);
  };

  const handleMouseEnter = (date: string) => {
    if (!isDragging.current) return;
    setDragEnd(date);
  };

  const handleMouseUp = () => {
    if (!isDragging.current || !dragStart || !dragEnd) {
      isDragging.current = false;
      setDragStart(null);
      setDragEnd(null);
      return;
    }
    const start = dragStart.date < dragEnd ? dragStart.date : dragEnd;
    const end = dragStart.date < dragEnd ? dragEnd : dragStart.date;
    updateRow(dragStart.item, dragStart.phase, { startDate: start, endDate: end });
    isDragging.current = false;
    setDragStart(null);
    setDragEnd(null);
  };

  // Date picker state
  const [editingDate, setEditingDate] = useState<{ item: string; phase: string } | null>(null);

  const CELL_W = 28;

  return (
    <div onMouseUp={handleMouseUp} style={{ userSelect: "none" }}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", minWidth: "100%" }}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 70, minWidth: 70, position: "sticky", left: 0, zIndex: 3, background: "#f8fafc" }}>品番</th>
              <th style={{ ...thStyle, width: 90, minWidth: 90, position: "sticky", left: 70, zIndex: 3, background: "#f8fafc" }}>フェーズ</th>
              <th style={{ ...thStyle, width: 80, minWidth: 80, position: "sticky", left: 160, zIndex: 3, background: "#f8fafc" }}>会社</th>
              {dates.map(d => (
                <th key={d} style={{
                  ...thStyle,
                  width: CELL_W, minWidth: CELL_W, textAlign: "center",
                  background: d === today ? "#fef2f2" : isWeekend(d) ? "#f1f5f9" : "#f8fafc",
                  color: d === today ? "#dc2626" : isWeekend(d) ? "#94a3b8" : "#475569",
                  fontSize: 9, padding: "4px 0",
                }}>
                  {formatDateHeader(d)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredItems.map(it => (
              PHASES.map((phase, pi) => {
                const row = getRow(it.id, phase);
                const status = getDisplayStatus(it.id, phase);
                const barColor = getBarColor(status);
                const isEditing = editingDate?.item === it.id && editingDate?.phase === phase;

                return (
                  <tr key={`${it.id}-${phase}`} style={{ borderBottom: pi === PHASES.length - 1 ? "2px solid #e2e8f0" : undefined }}>
                    {pi === 0 && (
                      <td rowSpan={PHASES.length} style={{
                        padding: "4px 6px", fontSize: 12, fontWeight: 700, color: "#1e40af",
                        borderBottom: "2px solid #e2e8f0", verticalAlign: "top",
                        position: "sticky", left: 0, zIndex: 2, background: "#fff",
                      }}>{it.id}</td>
                    )}
                    <td style={{
                      padding: "3px 4px", fontSize: 10, color: "#475569",
                      borderBottom: "1px solid #f1f5f9",
                      position: "sticky", left: 70, zIndex: 2, background: "#fff",
                    }}>
                      <div>{phase}</div>
                      {row?.updatedAt && (
                        <div style={{ fontSize: 8, color: "#cbd5e1" }}>
                          {new Date(row.updatedAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                        </div>
                      )}
                    </td>
                    <td style={{
                      padding: "2px 2px", borderBottom: "1px solid #f1f5f9",
                      position: "sticky", left: 160, zIndex: 2, background: "#fff",
                    }}>
                      <CycleBadge
                        value={row?.company || ""}
                        options={COMPANIES}
                        colors={COMPANY_COLORS}
                        onChange={v => updateRow(it.id, phase, { company: v })}
                        readOnly={readOnly}
                      />
                    </td>
                    {dates.map(date => {
                      const inRange = isInRange(it.id, phase, date);
                      const inDrag = isInDragRange(it.id, phase, date);
                      return (
                        <td
                          key={date}
                          onMouseDown={() => handleMouseDown(it.id, phase, date)}
                          onMouseEnter={() => handleMouseEnter(date)}
                          onClick={() => {
                            if (readOnly) return;
                            // Single click on empty cell: open date picker
                            if (!isDragging.current && !inRange) {
                              setEditingDate({ item: it.id, phase });
                            }
                          }}
                          style={{
                            width: CELL_W, height: 24,
                            padding: 0,
                            borderBottom: "1px solid #f1f5f9",
                            borderLeft: date === today ? "2px solid #ef4444" : "none",
                            borderRight: date === today ? "2px solid #ef4444" : "none",
                            background: inDrag ? barColor + "60"
                              : inRange ? barColor + "40"
                              : d === today ? "#fef2f240"
                              : isWeekend(date) ? "#f8fafc" : "transparent",
                            cursor: readOnly ? "default" : "crosshair",
                            transition: "background 0.1s",
                          }}
                        />
                      );
                    })}
                  </tr>
                );
              })
            ))}
          </tbody>
        </table>
      </div>

      {/* Date picker modal */}
      {editingDate && !readOnly && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.3)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center",
        }} onClick={() => setEditingDate(null)}>
          <div onClick={e => e.stopPropagation()} style={{
            background: "#fff", borderRadius: 8, padding: 16,
            boxShadow: "0 8px 32px rgba(0,0,0,0.2)", minWidth: 260,
          }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 12 }}>
              {editingDate.item} — {editingDate.phase}
            </div>
            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: "#64748b" }}>
                開始日
                <input
                  type="date"
                  value={getRow(editingDate.item, editingDate.phase)?.startDate || ""}
                  min={GANTT_START}
                  max={GANTT_END}
                  onChange={e => updateRow(editingDate.item, editingDate.phase, { startDate: e.target.value })}
                  style={{ display: "block", marginTop: 4, padding: "4px 8px", borderRadius: 4, border: "1px solid #e2e8f0" }}
                />
              </label>
              <label style={{ fontSize: 11, color: "#64748b" }}>
                終了日
                <input
                  type="date"
                  value={getRow(editingDate.item, editingDate.phase)?.endDate || ""}
                  min={GANTT_START}
                  max={GANTT_END}
                  onChange={e => updateRow(editingDate.item, editingDate.phase, { endDate: e.target.value })}
                  style={{ display: "block", marginTop: 4, padding: "4px 8px", borderRadius: 4, border: "1px solid #e2e8f0" }}
                />
              </label>
            </div>
            <button onClick={() => setEditingDate(null)} style={{
              padding: "6px 16px", borderRadius: 4, border: "none",
              background: "#3b82f6", color: "#fff", fontSize: 12, cursor: "pointer",
            }}>閉じる</button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div style={{ marginTop: 12, padding: "8px 12px", background: "#f1f5f9", borderRadius: 6, display: "flex", gap: 16, fontSize: 11, flexWrap: "wrap" }}>
        {[
          { label: "未着手", color: "#d1d5db" },
          { label: "進行中", color: "#3b82f6" },
          { label: "完了", color: "#10b981" },
          { label: "保留", color: "#f59e0b" },
          { label: "要確認", color: "#ef4444" },
        ].map(s => (
          <span key={s.label} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 12, height: 12, borderRadius: 2, background: s.color + "40", border: `1px solid ${s.color}` }} />
            {s.label}
          </span>
        ))}
        <span style={{ color: "#dc2626", fontWeight: 600 }}>│ 今日</span>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "6px 4px", textAlign: "left", fontSize: 10, fontWeight: 700,
  color: "#475569", borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap",
  position: "sticky", top: 0, zIndex: 2,
};
```

**Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Commit**

```bash
git add src/components/GanttChart.tsx
git commit -m "feat: add GanttChart component with date grid, drag-select, and date picker"
```

---

## Task 9: Wire GanttChart into App.tsx tab 0

**Files:**
- Modify: `src/App.tsx`

**Step 1: Import and render GanttChart**

Add import:
```typescript
import { GanttChart } from "./components/GanttChart";
```

Replace the tab 0 placeholder:
```tsx
{tab === 0 && (
  <GanttChart
    gantt={gantt}
    setGantt={setGantt}
    items={items}
    parts={parts}
    cnc={cnc}
    finish={finish}
    filter={filter}
    readOnly={readOnly}
  />
)}
```

**Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds

**Step 3: Run dev server and manually verify**

Run: `npm run dev`
Verify:
- Gantt tab shows as first tab
- Date grid renders 3/23 to 4/16
- Drag-select creates bars
- Date picker modal opens on cell click
- Company CycleBadge works
- Today line shows in red

**Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat: wire GanttChart into tab 0"
```

---

## Task 10: Update export/import to include new data

**Files:**
- Modify: `src/App.tsx`

**Step 1: Update handleExport**

```typescript
const handleExport = () => {
  const data = {
    items, finish, parts, approval, cnc, phase,
    gantt, metalwork, assembly, inspection, delivery,
    exportedAt: new Date().toISOString(),
  };
  // ... rest unchanged
};
```

**Step 2: Update handleImport**

```typescript
const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
  // ... existing code ...
  // Add inside the try block:
  if (data.gantt) setGantt(data.gantt);
  if (data.metalwork) setMetalwork(data.metalwork);
  if (data.assembly) setAssembly(data.assembly);
  if (data.inspection) setInspection(data.inspection);
  if (data.delivery) setDelivery(data.delivery);
};
```

**Step 3: Update delItem to cascade to new tables**

```typescript
const delItem = (gi: number) => {
  // ... existing code, add:
  setGantt(p => p.filter(r => r.item !== it.id));
  setMetalwork(p => p.filter(r => r.item !== it.id));
  setAssembly(p => p.filter(r => r.item !== it.id));
  setInspection(p => p.filter(r => r.item !== it.id));
  setDelivery(p => p.filter(r => r.item !== it.id));
};
```

**Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds

**Step 5: Commit**

```bash
git add src/App.tsx
git commit -m "feat: update export/import and cascade delete for new tables"
```

---

## Task 11: Final verification and deploy

**Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds with no errors or warnings

**Step 2: Manual smoke test**

Run: `npm run dev` and verify all 9 tabs:
1. ガント — date grid, drag-select, date picker, company badge, auto-status colors, today line
2. 材料調達 — parts data with procure/company badges
3. 木部CNC加工 — CNC data with status badges
4. 仕上げ — finish table + approval section below
5. 金属加工 — simple table with status/company/note
6. 組立 — same
7. 検品 — same
8. 納品 — same
9. ToDo — aggregated todos

Also verify:
- Last updated timestamp in header
- Per-row updated_at shown in small text
- Filter by item works across all tabs
- Export/import includes all data
- Read-only mode works (`?mode=view`)

**Step 3: Commit any fixes**

**Step 4: Push to main (triggers GitHub Pages deploy)**

```bash
git push origin main
```

---

## Supabase Migration Checklist

**IMPORTANT:** Before deploying, run the following SQL in the Supabase dashboard SQL editor:

1. Create new tables (gantt, metalwork, assembly, inspection, delivery) — from Task 2 Step 1-2
2. Add RLS policies — from Task 2 Step 3
3. Add updated_at to existing tables — from Task 2 Step 4

The app will work without these (falls back to localStorage), but data won't persist across devices until the migration is run.
