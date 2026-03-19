import { useState, useRef } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { CycleBadge } from "./components/CycleBadge";
import { EditCell } from "./components/EditCell";
import { Th, Td, Tab } from "./components/TableComponents";
import { ImageCell } from "./components/ImageCell";
import {
  PHASES, PHASE_COLORS, STATUS, STATUS_COLORS,
  PROCURE, PROCURE_COLORS, SAMPLE, SAMPLE_COLORS,
  APPROVE, APPROVE_COLORS,
  COMPANIES, COMPANY_COLORS,
  initItems, initFinish, initParts, initApproval, makeCnc, initPhase,
} from "./data/initialData";
import type { Item, FinishRow, PartRow, ApprovalRow, CncRow, PhaseRow } from "./data/initialData";

const addBtnStyle: React.CSSProperties = {
  padding: "4px 12px", borderRadius: 4, border: "1px dashed #94a3b8",
  background: "#f8fafc", color: "#64748b", fontSize: 11, cursor: "pointer",
  fontWeight: 500, marginTop: 8, display: "inline-flex", alignItems: "center", gap: 4,
};

const delBtnStyle: React.CSSProperties = {
  padding: "1px 6px", borderRadius: 3, border: "none",
  background: "transparent", color: "#cbd5e1", fontSize: 14, cursor: "pointer",
  lineHeight: 1,
};

const moveBtnStyle: React.CSSProperties = {
  padding: "0 4px", border: "none", background: "transparent",
  color: "#94a3b8", fontSize: 11, cursor: "pointer", lineHeight: 1,
};

function RowActions({ onDel, onUp, onDown }: { onDel: () => void; onUp: () => void; onDown: () => void }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
      <button onClick={onUp} style={moveBtnStyle} title="上に移動">▲</button>
      <button onClick={onDel} style={delBtnStyle} title="削除">×</button>
      <button onClick={onDown} style={moveBtnStyle} title="下に移動">▼</button>
    </div>
  );
}

function App() {
  const readOnly = new URLSearchParams(window.location.search).get("mode") === "view";

  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [items, setItems] = useLocalStorage<Item[]>("panpuri-items", initItems);
  const [finish, setFinish] = useLocalStorage<FinishRow[]>("panpuri-finish", initFinish);
  const [parts, setParts] = useLocalStorage<PartRow[]>("panpuri-parts", initParts);
  const [approval, setApproval] = useLocalStorage<ApprovalRow[]>("panpuri-approval", initApproval);
  const [cnc, setCnc] = useLocalStorage<CncRow[]>("panpuri-cnc", makeCnc(initParts));
  const [phase, setPhase] = useLocalStorage<PhaseRow[]>("panpuri-phase", initPhase);

  const importRef = useRef<HTMLInputElement>(null);

  const tabs = ["品番一覧", "仕上げ", "部品", "承認", "CNC加工", "フェーズ", "ToDo"];
  const icons = ["📋", "🎨", "🔩", "✅", "🔧", "📊", "🚩"];

  // Collect all ToDo items across tabs
  const isTodo = (note: string) => note.toLowerCase().includes("todo");
  const todoItems: { tab: string; item: string; label: string; note: string }[] = [
    ...finish.filter(f => isTodo(f.note)).map(f => ({ tab: "仕上げ", item: f.item, label: `${f.part}（${f.finish}）`, note: f.note })),
    ...parts.filter(p => isTodo(p.note)).map(p => ({ tab: "部品", item: p.item, label: `${p.part}（${p.material}）`, note: p.note })),
    ...approval.filter(a => isTodo(a.note)).map(a => ({ tab: "承認", item: a.item, label: a.category, note: a.note })),
    ...cnc.filter(c => isTodo(c.cncNote || "")).map(c => ({ tab: "CNC", item: c.item, label: c.part, note: c.cncNote || "" })),
  ];

  const fltFinish = filter === "ALL" ? finish : finish.filter(d => d.item === filter);
  const fltParts = filter === "ALL" ? parts : parts.filter(d => d.item === filter);
  const fltApproval = filter === "ALL" ? approval : approval.filter(d => d.item === filter);
  const fltCnc = filter === "ALL" ? cnc : cnc.filter(d => d.item === filter);
  const fltPhase = filter === "ALL" ? phase : phase.filter(d => d.id === filter);
  const fltItems = filter === "ALL" ? items : items.filter(d => d.id === filter);

  const updFinish = (gi: number, k: string, v: string) => setFinish(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));
  const updParts = (gi: number, k: string, v: string) => setParts(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));
  const updApproval = (gi: number, k: string, v: string) => setApproval(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));
  const updCnc = (gi: number, k: string, v: string) => setCnc(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));
  const updPhase = (id: string, ph: string, v: string) => setPhase(p => p.map(r => r.id === id ? { ...r, phases: { ...r.phases, [ph]: v } } : r));
  const updItem = (gi: number, k: string, v: string | number) => setItems(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));

  const delRow = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, gi: number) => {
    if (!confirm("この行を削除しますか？")) return;
    setter(p => p.filter((_, j) => j !== gi));
  };

  const moveRow = <T,>(setter: React.Dispatch<React.SetStateAction<T[]>>, gi: number, dir: -1 | 1) => {
    setter(p => {
      const next = [...p];
      const ti = gi + dir;
      if (ti < 0 || ti >= next.length) return p;
      [next[gi], next[ti]] = [next[ti], next[gi]];
      return next;
    });
  };

  // Add row helpers
  const addItem = () => {
    const id = `NEW-${String(items.length + 1).padStart(2, "0")}`;
    setItems(p => [...p, { id, name: "", qty: 1, dims: "", page: "" }]);
    setPhase(p => [...p, { id, name: "", qty: 1, phases: Object.fromEntries(PHASES.map(ph => [ph, "未着手"])) }]);
  };
  const delItem = (gi: number) => {
    const it = items[gi];
    if (!confirm(`${it.id}（${it.name || "名称未設定"}）を削除しますか？関連する仕上げ・部品・承認・CNC・フェーズも削除されます。`)) return;
    setItems(p => p.filter((_, j) => j !== gi));
    setFinish(p => p.filter(r => r.item !== it.id));
    setParts(p => p.filter(r => r.item !== it.id));
    setApproval(p => p.filter(r => r.item !== it.id));
    setCnc(p => p.filter(r => r.item !== it.id));
    setPhase(p => p.filter(r => r.id !== it.id));
    if (filter === it.id) setFilter("ALL");
  };

  const addFinish = () => {
    const itemId = filter !== "ALL" ? filter : (items[0]?.id || "");
    setFinish(p => [...p, { item: itemId, part: "", finish: "", note: "", sample: "未確認", status: "未着手" }]);
  };
  const addPart = () => {
    const itemId = filter !== "ALL" ? filter : (items[0]?.id || "");
    setParts(p => [...p, { item: itemId, part: "", material: "", thickness: "", qty: "", cncReq: false, procure: "未発注", note: "" }]);
  };
  const addApproval = () => {
    const itemId = filter !== "ALL" ? filter : (items[0]?.id || "");
    setApproval(p => [...p, { item: itemId, category: "", status: "未着手", approver: "", date: "", note: "" }]);
  };
  const addCnc = () => {
    const itemId = filter !== "ALL" ? filter : (items[0]?.id || "");
    setCnc(p => [...p, { item: itemId, part: "", material: "", thickness: "", qty: "", cncReq: true, procure: "未発注", note: "", idx: p.length, machineOp: "切り出し", dataStatus: "未着手", cncStatus: "未着手" }]);
  };

  const completedApproval = approval.filter(a => a.status === "承認済").length;
  const completedFinish = finish.filter(f => f.status === "完了").length;
  const completedCnc = cnc.filter(c => c.cncStatus === "完了").length;

  const handleExport = () => {
    const data = { items, finish, parts, approval, cnc, phase, exportedAt: new Date().toISOString() };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `panpuri-data-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.items) setItems(data.items);
        if (data.finish) setFinish(data.finish);
        if (data.parts) setParts(data.parts);
        if (data.approval) setApproval(data.approval);
        if (data.cnc) setCnc(data.cnc);
        if (data.phase) setPhase(data.phase);
        alert("データをインポートしました");
      } catch {
        alert("JSONファイルの読み込みに失敗しました");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleCopyViewUrl = () => {
    const url = window.location.origin + window.location.pathname + "?mode=view";
    navigator.clipboard.writeText(url);
    alert("閲覧用URLをコピーしました");
  };

  // Image modal
  const [modalImg, setModalImg] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", color: "#1e293b", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Image modal */}
      {modalImg && (
        <div onClick={() => setModalImg(null)} style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 1000,
          display: "flex", alignItems: "center", justifyContent: "center", cursor: "zoom-out",
          padding: 20, overflow: "auto",
        }}>
          <img src={modalImg} alt="" onClick={e => e.stopPropagation()} style={{
            width: "95vw", height: "95vh", objectFit: "contain", borderRadius: 8,
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)", background: "#fff", cursor: "default",
          }} />
          <button onClick={() => setModalImg(null)} style={{
            position: "fixed", top: 16, right: 16, width: 36, height: 36, borderRadius: "50%",
            border: "none", background: "rgba(255,255,255,0.9)", color: "#334155",
            fontSize: 20, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
          }}>×</button>
        </div>
      )}

      <div style={{ padding: "14px 16px 0", borderBottom: "1px solid #e2e8f0", background: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>什器製作管理シート</h1>
          <span style={{ fontSize: 11, color: "#94a3b8" }}>PANPURI KYOTO BAL</span>
          <span style={{
            fontSize: 10, padding: "2px 8px", borderRadius: 4, fontWeight: 600,
            color: readOnly ? "#059669" : "#3b82f6",
            background: readOnly ? "#ecfdf5" : "#eff6ff",
          }}>
            {readOnly ? "閲覧モード" : "編集モード"}
          </span>
          {!readOnly && (
            <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
              <button onClick={handleCopyViewUrl} style={toolBtnStyle}>共有URL</button>
              <button onClick={handleExport} style={toolBtnStyle}>JSON出力</button>
              <button onClick={() => importRef.current?.click()} style={toolBtnStyle}>JSON読込</button>
              <input ref={importRef} type="file" accept=".json" onChange={handleImport} style={{ display: "none" }} />
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setFilter("ALL")} style={filterBtnStyle(filter === "ALL")}>全品番</button>
          {items.map(it => (
            <button key={it.id} onClick={() => setFilter(it.id)} style={filterBtnStyle(filter === it.id)}>{it.id}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {tabs.map((t, i) => <Tab key={i} label={`${icons[i]} ${t}`} active={tab === i} onClick={() => setTab(i)}
            count={i === 1 ? `${completedFinish}/${finish.length}` : i === 3 ? `${completedApproval}/${approval.length}` : i === 4 ? `${completedCnc}/${cnc.length}` : i === 6 ? `${todoItems.length}` : undefined} />)}
        </div>
      </div>

      <div style={{ padding: "12px 16px", overflowX: "auto" }}>
        {/* Tab 0: 品番一覧 */}
        {tab === 0 && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                {!readOnly && <Th w="30px">{""}</Th>}
                <Th>画像</Th><Th>品番</Th><Th>名称</Th><Th>台数</Th><Th>概略寸法</Th><Th>図面</Th><Th>仕上げ進捗</Th><Th>承認進捗</Th><Th>現フェーズ</Th>
              </tr></thead>
              <tbody>
                {fltItems.map(it => {
                  const gi = items.indexOf(it);
                  const fc = finish.filter(f => f.item === it.id);
                  const fd = fc.filter(f => f.status === "完了").length;
                  const ac = approval.filter(a => a.item === it.id);
                  const ad = ac.filter(a => a.status === "承認済").length;
                  const ph = phase.find(p => p.id === it.id);
                  const curPhase = PHASES.find(p => ph?.phases[p] === "進行中") || PHASES.find(p => ph?.phases[p] === "未着手") || "納品";
                  return (
                    <tr key={it.id}>
                      {!readOnly && <Td><RowActions onDel={() => delItem(gi)} onUp={() => { moveRow(setItems, gi, -1); moveRow(setPhase, gi, -1); }} onDown={() => { moveRow(setItems, gi, 1); moveRow(setPhase, gi, 1); }} /></Td>}
                      <Td><ImageCell imageUrl={it.imageUrl} onChangeUrl={v => updItem(gi, "imageUrl", v)} onClickImage={setModalImg} readOnly={readOnly} /></Td>
                      <Td hl><EditCell value={it.id} onChange={v => {
                        const oldId = it.id;
                        updItem(gi, "id", v);
                        setFinish(p => p.map(r => r.item === oldId ? { ...r, item: v } : r));
                        setParts(p => p.map(r => r.item === oldId ? { ...r, item: v } : r));
                        setApproval(p => p.map(r => r.item === oldId ? { ...r, item: v } : r));
                        setCnc(p => p.map(r => r.item === oldId ? { ...r, item: v } : r));
                        setPhase(p => p.map(r => r.id === oldId ? { ...r, id: v } : r));
                        if (filter === oldId) setFilter(v);
                      }} placeholder="品番" width={70} readOnly={readOnly} /></Td>
                      <Td><EditCell value={it.name} onChange={v => updItem(gi, "name", v)} placeholder="名称" width={140} readOnly={readOnly} /></Td>
                      <Td><EditCell value={String(it.qty)} onChange={v => updItem(gi, "qty", Number(v) || 0)} placeholder="0" width={30} readOnly={readOnly} /></Td>
                      <Td><EditCell value={it.dims} onChange={v => updItem(gi, "dims", v)} placeholder="寸法" width={120} readOnly={readOnly} /></Td>
                      <Td><EditCell value={it.page} onChange={v => updItem(gi, "page", v)} placeholder="P." width={40} readOnly={readOnly} /></Td>
                      <Td><span style={{ fontSize: 11 }}>{fd}/{fc.length}</span></Td>
                      <Td><span style={{ fontSize: 11 }}>{ad}/{ac.length}</span></Td>
                      <Td><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: (PHASE_COLORS[curPhase] || "#94a3b8") + "20", color: PHASE_COLORS[curPhase] || "#94a3b8" }}>{curPhase}</span></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!readOnly && <button onClick={addItem} style={addBtnStyle}>+ 品番を追加</button>}
          </div>
        )}

        {/* Tab 1: 仕上げ */}
        {tab === 1 && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                {!readOnly && <Th w="30px">{""}</Th>}
                <Th>画像</Th><Th>品番</Th><Th>部位</Th><Th>仕上げ仕様</Th><Th>備考</Th><Th>サンプル</Th><Th>ステータス</Th><Th>担当</Th><Th>期限</Th>
              </tr></thead>
              <tbody>
                {fltFinish.map(f => {
                  const gi = finish.indexOf(f);
                  return (
                    <tr key={gi} style={{ background: isTodo(f.note) ? "#fef2f2" : "transparent" }}>
                      {!readOnly && <Td><RowActions onDel={() => delRow(setFinish, gi)} onUp={() => moveRow(setFinish, gi, -1)} onDown={() => moveRow(setFinish, gi, 1)} /></Td>}
                      <Td><ImageCell imageUrl={f.imageUrl} onChangeUrl={v => updFinish(gi, "imageUrl", v)} onClickImage={setModalImg} readOnly={readOnly} /></Td>
                      <Td hl><EditCell value={f.item} onChange={v => updFinish(gi, "item", v)} placeholder="品番" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={f.part} onChange={v => updFinish(gi, "part", v)} placeholder="部位" width={80} readOnly={readOnly} /></Td>
                      <Td><EditCell value={f.finish} onChange={v => updFinish(gi, "finish", v)} placeholder="仕上げ" width={140} readOnly={readOnly} /></Td>
                      <Td><EditCell value={f.note} onChange={v => updFinish(gi, "note", v)} placeholder="備考" width={120} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={f.sample} options={SAMPLE} colors={SAMPLE_COLORS} onChange={v => updFinish(gi, "sample", v)} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={f.status} options={STATUS} colors={STATUS_COLORS} onChange={v => updFinish(gi, "status", v)} readOnly={readOnly} /></Td>
                      <Td><EditCell value={f.assignee || ""} onChange={v => updFinish(gi, "assignee", v)} placeholder="担当" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={f.deadline || ""} onChange={v => updFinish(gi, "deadline", v)} placeholder="MM/DD" width={60} readOnly={readOnly} /></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!readOnly && <button onClick={addFinish} style={addBtnStyle}>+ 仕上げ行を追加</button>}
          </div>
        )}

        {/* Tab 2: 部品 */}
        {tab === 2 && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                {!readOnly && <Th w="30px">{""}</Th>}
                <Th>画像</Th><Th>品番</Th><Th>部品名</Th><Th>素材</Th><Th>板厚</Th><Th>数量</Th><Th>CNC</Th><Th>調達状況</Th><Th>調達先</Th><Th>加工先</Th><Th>制作先</Th><Th>リンク</Th><Th>備考</Th>
              </tr></thead>
              <tbody>
                {fltParts.map(p => {
                  const gi = parts.indexOf(p);
                  return (
                    <tr key={gi} style={{ background: isTodo(p.note) ? "#fef2f2" : p.note.includes("別途") ? "#fef2f210" : "transparent" }}>
                      {!readOnly && <Td><RowActions onDel={() => delRow(setParts, gi)} onUp={() => moveRow(setParts, gi, -1)} onDown={() => moveRow(setParts, gi, 1)} /></Td>}
                      <Td><ImageCell imageUrl={p.imageUrl} onChangeUrl={v => updParts(gi, "imageUrl", v)} onClickImage={setModalImg} readOnly={readOnly} /></Td>
                      <Td hl><EditCell value={p.item} onChange={v => updParts(gi, "item", v)} placeholder="品番" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={p.part} onChange={v => updParts(gi, "part", v)} placeholder="部品名" width={100} readOnly={readOnly} /></Td>
                      <Td><EditCell value={p.material} onChange={v => updParts(gi, "material", v)} placeholder="素材" width={80} readOnly={readOnly} /></Td>
                      <Td><EditCell value={p.thickness} onChange={v => updParts(gi, "thickness", v)} placeholder="板厚" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={p.qty} onChange={v => updParts(gi, "qty", v)} placeholder="数量" width={50} readOnly={readOnly} /></Td>
                      <Td>
                        {readOnly ? (
                          p.cncReq ? <span style={{ color: "#f97316", fontWeight: 600, fontSize: 11 }}>要</span> : <span style={{ color: "#cbd5e1", fontSize: 11 }}>-</span>
                        ) : (
                          <button
                            onClick={() => setParts(prev => prev.map((r, j) => j === gi ? { ...r, cncReq: !r.cncReq } : r))}
                            style={{ ...delBtnStyle, color: p.cncReq ? "#f97316" : "#cbd5e1", fontWeight: 600, fontSize: 11 }}
                          >{p.cncReq ? "要" : "-"}</button>
                        )}
                      </Td>
                      <Td><CycleBadge value={p.procure} options={PROCURE} colors={PROCURE_COLORS} onChange={v => updParts(gi, "procure", v)} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={p.companyProcure || ""} options={COMPANIES} colors={COMPANY_COLORS} onChange={v => updParts(gi, "companyProcure", v)} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={p.companyProcess || ""} options={COMPANIES} colors={COMPANY_COLORS} onChange={v => updParts(gi, "companyProcess", v)} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={p.companyProduce || ""} options={COMPANIES} colors={COMPANY_COLORS} onChange={v => updParts(gi, "companyProduce", v)} readOnly={readOnly} /></Td>
                      <Td>
                        {p.link ? (
                          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                            <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ color: "#3b82f6", fontSize: 11, textDecoration: "none" }} title={p.link}>🔗</a>
                            {!readOnly && <EditCell value={p.link} onChange={v => updParts(gi, "link", v)} placeholder="URL" width={80} readOnly={readOnly} />}
                          </div>
                        ) : (
                          !readOnly ? (
                            <EditCell value="" onChange={v => updParts(gi, "link", v)} placeholder="URL" width={80} readOnly={readOnly} />
                          ) : (
                            <span style={{ color: "#cbd5e1", fontSize: 11 }}>-</span>
                          )
                        )}
                      </Td>
                      <Td><EditCell value={p.note} onChange={v => updParts(gi, "note", v)} placeholder="備考" width={100} readOnly={readOnly} /></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!readOnly && <button onClick={addPart} style={addBtnStyle}>+ 部品行を追加</button>}
            {!readOnly && (
              <div style={{ marginTop: 8, fontSize: 10, color: "#94a3b8" }}>
                画像: URLを入力するとサムネイル表示（クリックで拡大）/ リンク: 製品ページ等のURLを入力
              </div>
            )}
          </div>
        )}

        {/* Tab 3: 承認 */}
        {tab === 3 && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                {!readOnly && <Th w="30px">{""}</Th>}
                <Th>品番</Th><Th>承認項目</Th><Th>ステータス</Th><Th>承認者</Th><Th>承認日</Th><Th>備考</Th>
              </tr></thead>
              <tbody>
                {fltApproval.map(a => {
                  const gi = approval.indexOf(a);
                  const warn = a.note.includes("指示") || a.note.includes("確認") || a.note.includes("別途");
                  return (
                    <tr key={gi} style={{ background: isTodo(a.note) ? "#fef2f2" : warn && a.status !== "承認済" ? "#fef3c7" : "transparent" }}>
                      {!readOnly && <Td><RowActions onDel={() => delRow(setApproval, gi)} onUp={() => moveRow(setApproval, gi, -1)} onDown={() => moveRow(setApproval, gi, 1)} /></Td>}
                      <Td hl><EditCell value={a.item} onChange={v => updApproval(gi, "item", v)} placeholder="品番" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={a.category} onChange={v => updApproval(gi, "category", v)} placeholder="項目" width={100} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={a.status} options={APPROVE} colors={APPROVE_COLORS} onChange={v => updApproval(gi, "status", v)} readOnly={readOnly} /></Td>
                      <Td><EditCell value={a.approver} onChange={v => updApproval(gi, "approver", v)} placeholder="承認者" width={80} readOnly={readOnly} /></Td>
                      <Td><EditCell value={a.date} onChange={v => updApproval(gi, "date", v)} placeholder="YYYY/MM/DD" width={90} readOnly={readOnly} /></Td>
                      <Td><EditCell value={a.note} onChange={v => updApproval(gi, "note", v)} placeholder="備考" width={160} readOnly={readOnly} /></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!readOnly && <button onClick={addApproval} style={addBtnStyle}>+ 承認行を追加</button>}
            <div style={{ marginTop: 10, padding: "6px 10px", background: "#fef3c7", borderRadius: 6, fontSize: 11, color: "#92400e" }}>
              黄色行 = 図面上の確認依頼事項（未承認）
            </div>
          </div>
        )}

        {/* Tab 4: CNC加工 */}
        {tab === 4 && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr>
                {!readOnly && <Th w="30px">{""}</Th>}
                <Th>画像</Th><Th>品番</Th><Th>部品名</Th><Th>板厚</Th><Th>数量</Th><Th>加工内容</Th><Th>データ準備</Th><Th>加工状況</Th><Th>担当</Th><Th>備考</Th>
              </tr></thead>
              <tbody>
                {fltCnc.map(c => {
                  const gi = cnc.indexOf(c);
                  return (
                    <tr key={gi} style={{ background: isTodo(c.cncNote || "") ? "#fef2f2" : "transparent" }}>
                      {!readOnly && <Td><RowActions onDel={() => delRow(setCnc, gi)} onUp={() => moveRow(setCnc, gi, -1)} onDown={() => moveRow(setCnc, gi, 1)} /></Td>}
                      <Td><ImageCell imageUrl={c.imageUrl} onChangeUrl={v => updCnc(gi, "imageUrl", v)} onClickImage={setModalImg} readOnly={readOnly} /></Td>
                      <Td hl><EditCell value={c.item} onChange={v => updCnc(gi, "item", v)} placeholder="品番" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={c.part} onChange={v => updCnc(gi, "part", v)} placeholder="部品名" width={100} readOnly={readOnly} /></Td>
                      <Td><EditCell value={c.thickness} onChange={v => updCnc(gi, "thickness", v)} placeholder="板厚" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={c.qty} onChange={v => updCnc(gi, "qty", v)} placeholder="数量" width={50} readOnly={readOnly} /></Td>
                      <Td><EditCell value={c.machineOp} onChange={v => updCnc(gi, "machineOp", v)} placeholder="加工内容" width={80} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={c.dataStatus} options={STATUS} colors={STATUS_COLORS} onChange={v => updCnc(gi, "dataStatus", v)} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={c.cncStatus} options={STATUS} colors={STATUS_COLORS} onChange={v => updCnc(gi, "cncStatus", v)} readOnly={readOnly} /></Td>
                      <Td><EditCell value={c.assignee || ""} onChange={v => updCnc(gi, "assignee", v)} placeholder="担当" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={c.cncNote || ""} onChange={v => updCnc(gi, "cncNote", v)} placeholder="備考" width={100} readOnly={readOnly} /></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {!readOnly && <button onClick={addCnc} style={addBtnStyle}>+ CNC行を追加</button>}
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#f1f5f9", borderRadius: 6, display: "flex", gap: 16, fontSize: 11, flexWrap: "wrap" }}>
              {["円形切り出し", "穴あけ+切り出し", "曲面加工", "切り出し"].map(op => (
                <span key={op}>{op}: <strong>{cnc.filter(c => c.machineOp === op).length}</strong> / 完了 <strong style={{ color: "#10b981" }}>{cnc.filter(c => c.machineOp === op && c.cncStatus === "完了").length}</strong></span>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: フェーズ */}
        {tab === 5 && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th w="70px">品番</Th><Th w="50px">台数</Th>{PHASES.map(p => <Th key={p}>{p}</Th>)}</tr></thead>
              <tbody>
                {fltPhase.map(ph => (
                  <tr key={ph.id}>
                    <Td hl>{ph.id}</Td><Td>{ph.qty}</Td>
                    {PHASES.map(p => (
                      <td key={p} style={{ padding: "5px 4px", borderBottom: "1px solid #f1f5f9", textAlign: "center" }}>
                        <CycleBadge value={ph.phases[p]} options={STATUS} colors={STATUS_COLORS} onChange={v => updPhase(ph.id, p, v)} readOnly={readOnly} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 16, padding: "10px 12px", background: "#f8fafc", borderRadius: 8, border: "1px solid #e2e8f0" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "#334155", marginBottom: 8 }}>操作ガイド</div>
              <div style={{ fontSize: 11, color: "#64748b", lineHeight: 1.8 }}>
                {readOnly ? (
                  <>このページは閲覧専用です。編集するには管理者にお問い合わせください。</>
                ) : (
                  <>
                    <strong style={{ color: "#3b82f6" }}>バッジ</strong> → クリックでステータス切替（未着手→進行中→完了→保留）<br />
                    <strong style={{ color: "#3b82f6" }}>テキスト欄</strong> → クリックで編集、Enter確定、Escキャンセル<br />
                    <strong style={{ color: "#3b82f6" }}>品番フィルタ</strong> → 上部ボタンで品番絞り込み（全タブ連動）<br />
                    <strong style={{ color: "#3b82f6" }}>×ボタン</strong> → 行の削除 / <strong style={{ color: "#3b82f6" }}>+ボタン</strong> → 行の追加<br />
                    <strong style={{ color: "#ef4444" }}>ToDo</strong> → 備考に「ToDo」と入力すると赤くハイライト、ToDoタブに集約
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 6: ToDo */}
        {tab === 6 && (
          <div>
            {todoItems.length === 0 ? (
              <div style={{ padding: "40px 20px", textAlign: "center", color: "#94a3b8", fontSize: 13 }}>
                ToDoはありません。各タブの備考欄に「ToDo」を含めると、ここに表示されます。
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead><tr>
                  <Th>タブ</Th><Th>品番</Th><Th>対象</Th><Th>備考</Th>
                </tr></thead>
                <tbody>
                  {todoItems.map((t, i) => (
                    <tr key={i} style={{ background: "#fef2f2" }}>
                      <Td><span style={{ fontSize: 11, fontWeight: 600, color: "#64748b" }}>{t.tab}</span></Td>
                      <Td hl>{t.item}</Td>
                      <Td>{t.label}</Td>
                      <Td><span style={{ color: "#dc2626", fontWeight: 500, fontSize: 12 }}>{t.note}</span></Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const toolBtnStyle: React.CSSProperties = {
  padding: "3px 10px", borderRadius: 4, border: "1px solid #e2e8f0",
  background: "#fff", color: "#64748b", fontSize: 11, cursor: "pointer", fontWeight: 500,
};

const filterBtnStyle = (active: boolean): React.CSSProperties => ({
  padding: "3px 10px", borderRadius: 4,
  border: active ? "1px solid #3b82f6" : "1px solid #e2e8f0",
  background: active ? "#eff6ff" : "#fff",
  color: active ? "#1e40af" : "#64748b",
  fontSize: 11, cursor: "pointer", fontWeight: active ? 600 : 500,
});

export default App;
