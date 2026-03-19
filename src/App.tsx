import { useState, useRef } from "react";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { CycleBadge } from "./components/CycleBadge";
import { EditCell } from "./components/EditCell";
import { Th, Td, Tab } from "./components/TableComponents";
import {
  PHASES, PHASE_COLORS, STATUS, STATUS_COLORS,
  PROCURE, PROCURE_COLORS, SAMPLE, SAMPLE_COLORS,
  APPROVE, APPROVE_COLORS,
  initItems, initFinish, initParts, initApproval, makeCnc, initPhase,
} from "./data/initialData";
import type { FinishRow, PartRow, ApprovalRow, CncRow, PhaseRow } from "./data/initialData";

function App() {
  const readOnly = new URLSearchParams(window.location.search).get("mode") === "view";

  const [tab, setTab] = useState(0);
  const [filter, setFilter] = useState("ALL");
  const [finish, setFinish] = useLocalStorage<FinishRow[]>("panpuri-finish", initFinish);
  const [parts, setParts] = useLocalStorage<PartRow[]>("panpuri-parts", initParts);
  const [approval, setApproval] = useLocalStorage<ApprovalRow[]>("panpuri-approval", initApproval);
  const [cnc, setCnc] = useLocalStorage<CncRow[]>("panpuri-cnc", makeCnc(initParts));
  const [phase, setPhase] = useLocalStorage<PhaseRow[]>("panpuri-phase", initPhase);

  const importRef = useRef<HTMLInputElement>(null);

  const tabs = ["品番一覧", "仕上げ", "部品", "承認", "CNC加工", "フェーズ"];
  const icons = ["📋", "🎨", "🔩", "✅", "🔧", "📊"];

  const fltFinish = filter === "ALL" ? finish : finish.filter(d => d.item === filter);
  const fltParts = filter === "ALL" ? parts : parts.filter(d => d.item === filter);
  const fltApproval = filter === "ALL" ? approval : approval.filter(d => d.item === filter);
  const fltCnc = filter === "ALL" ? cnc : cnc.filter(d => d.item === filter);
  const fltPhase = filter === "ALL" ? phase : phase.filter(d => d.id === filter);
  const fltItems = filter === "ALL" ? initItems : initItems.filter(d => d.id === filter);

  const updFinish = (gi: number, k: string, v: string) => setFinish(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));
  const updParts = (gi: number, k: string, v: string) => setParts(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));
  const updApproval = (gi: number, k: string, v: string) => setApproval(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));
  const updCnc = (gi: number, k: string, v: string) => setCnc(p => p.map((r, j) => j === gi ? { ...r, [k]: v } : r));
  const updPhase = (id: string, ph: string, v: string) => setPhase(p => p.map(r => r.id === id ? { ...r, phases: { ...r.phases, [ph]: v } } : r));

  const completedApproval = approval.filter(a => a.status === "承認済").length;
  const completedFinish = finish.filter(f => f.status === "完了").length;
  const completedCnc = cnc.filter(c => c.cncStatus === "完了").length;

  const handleExport = () => {
    const data = { finish, parts, approval, cnc, phase, exportedAt: new Date().toISOString() };
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

  const handleReset = () => {
    if (!confirm("すべてのデータを初期値にリセットしますか？")) return;
    setFinish(initFinish);
    setParts(initParts);
    setApproval(initApproval);
    setCnc(makeCnc(initParts));
    setPhase(initPhase);
  };

  const handleCopyViewUrl = () => {
    const url = window.location.origin + window.location.pathname + "?mode=view";
    navigator.clipboard.writeText(url);
    alert("閲覧用URLをコピーしました");
  };

  return (
    <div style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", color: "#1e293b", minHeight: "100vh", background: "#f8fafc" }}>
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
              <button onClick={handleReset} style={{ ...toolBtnStyle, color: "#ef4444", borderColor: "#fca5a5" }}>リセット</button>
            </div>
          )}
        </div>
        <div style={{ display: "flex", gap: 6, marginBottom: 8, flexWrap: "wrap", alignItems: "center" }}>
          <button onClick={() => setFilter("ALL")} style={filterBtnStyle(filter === "ALL")}>全品番</button>
          {initItems.map(it => (
            <button key={it.id} onClick={() => setFilter(it.id)} style={filterBtnStyle(filter === it.id)}>{it.id}</button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 0, overflowX: "auto" }}>
          {tabs.map((t, i) => <Tab key={i} label={`${icons[i]} ${t}`} active={tab === i} onClick={() => setTab(i)}
            count={i === 1 ? `${completedFinish}/${finish.length}` : i === 3 ? `${completedApproval}/${approval.length}` : i === 4 ? `${completedCnc}/${cnc.length}` : undefined} />)}
        </div>
      </div>

      <div style={{ padding: "12px 16px", overflowX: "auto" }}>
        {tab === 0 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr>
              <Th>品番</Th><Th>名称</Th><Th>台数</Th><Th>概略寸法</Th><Th>図面</Th><Th>仕上げ進捗</Th><Th>承認進捗</Th><Th>現フェーズ</Th>
            </tr></thead>
            <tbody>
              {fltItems.map(it => {
                const fc = finish.filter(f => f.item === it.id);
                const fd = fc.filter(f => f.status === "完了").length;
                const ac = approval.filter(a => a.item === it.id);
                const ad = ac.filter(a => a.status === "承認済").length;
                const ph = phase.find(p => p.id === it.id);
                const curPhase = PHASES.find(p => ph?.phases[p] === "進行中") || PHASES.find(p => ph?.phases[p] === "未着手") || "納品";
                return (
                  <tr key={it.id}>
                    <Td hl>{it.id}</Td><Td>{it.name}</Td><Td>{it.qty}</Td><Td>{it.dims}</Td><Td>P.{it.page}</Td>
                    <Td><span style={{ fontSize: 11 }}>{fd}/{fc.length}</span></Td>
                    <Td><span style={{ fontSize: 11 }}>{ad}/{ac.length}</span></Td>
                    <Td><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 11, fontWeight: 600, background: (PHASE_COLORS[curPhase] || "#94a3b8") + "20", color: PHASE_COLORS[curPhase] || "#94a3b8" }}>{curPhase}</span></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === 1 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>品番</Th><Th>部位</Th><Th>仕上げ仕様</Th><Th>備考</Th><Th>サンプル</Th><Th>ステータス</Th><Th>担当</Th><Th>期限</Th></tr></thead>
            <tbody>
              {fltFinish.map(f => {
                const gi = finish.indexOf(f);
                return (
                  <tr key={gi}>
                    <Td hl>{f.item}</Td><Td>{f.part}</Td><Td>{f.finish}</Td>
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
        )}

        {tab === 2 && (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><Th>品番</Th><Th>部品名</Th><Th>素材</Th><Th>板厚</Th><Th>数量</Th><Th>CNC</Th><Th>調達</Th><Th>担当</Th><Th>備考</Th></tr></thead>
            <tbody>
              {fltParts.map(p => {
                const gi = parts.indexOf(p);
                return (
                  <tr key={gi} style={{ background: p.note.includes("別途") ? "#fef2f210" : "transparent" }}>
                    <Td hl>{p.item}</Td><Td>{p.part}</Td><Td>{p.material}</Td><Td>{p.thickness}</Td><Td>{p.qty}</Td>
                    <Td>{p.cncReq ? <span style={{ color: "#f97316", fontWeight: 600, fontSize: 11 }}>要</span> : <span style={{ color: "#cbd5e1", fontSize: 11 }}>-</span>}</Td>
                    <Td><CycleBadge value={p.procure} options={PROCURE} colors={PROCURE_COLORS} onChange={v => updParts(gi, "procure", v)} readOnly={readOnly} /></Td>
                    <Td><EditCell value={p.assignee || ""} onChange={v => updParts(gi, "assignee", v)} placeholder="担当" width={60} readOnly={readOnly} /></Td>
                    <Td><EditCell value={p.note} onChange={v => updParts(gi, "note", v)} placeholder="備考" width={100} readOnly={readOnly} /></Td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {tab === 3 && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>品番</Th><Th>承認項目</Th><Th>ステータス</Th><Th>承認者</Th><Th>承認日</Th><Th>備考</Th></tr></thead>
              <tbody>
                {fltApproval.map(a => {
                  const gi = approval.indexOf(a);
                  const warn = a.note.includes("指示") || a.note.includes("確認") || a.note.includes("別途");
                  return (
                    <tr key={gi} style={{ background: warn && a.status !== "承認済" ? "#fef3c7" : "transparent" }}>
                      <Td hl>{a.item}</Td><Td>{a.category}</Td>
                      <Td><CycleBadge value={a.status} options={APPROVE} colors={APPROVE_COLORS} onChange={v => updApproval(gi, "status", v)} readOnly={readOnly} /></Td>
                      <Td><EditCell value={a.approver} onChange={v => updApproval(gi, "approver", v)} placeholder="承認者" width={80} readOnly={readOnly} /></Td>
                      <Td><EditCell value={a.date} onChange={v => updApproval(gi, "date", v)} placeholder="YYYY/MM/DD" width={90} readOnly={readOnly} /></Td>
                      <Td><EditCell value={a.note} onChange={v => updApproval(gi, "note", v)} placeholder="備考" width={160} readOnly={readOnly} /></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 10, padding: "6px 10px", background: "#fef3c7", borderRadius: 6, fontSize: 11, color: "#92400e" }}>
              黄色行 = 図面上の確認依頼事項（未承認）
            </div>
          </div>
        )}

        {tab === 4 && (
          <div>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><Th>品番</Th><Th>部品名</Th><Th>板厚</Th><Th>数量</Th><Th>加工内容</Th><Th>データ準備</Th><Th>加工状況</Th><Th>担当</Th><Th>備考</Th></tr></thead>
              <tbody>
                {fltCnc.map(c => {
                  const gi = cnc.indexOf(c);
                  return (
                    <tr key={gi}>
                      <Td hl>{c.item}</Td><Td>{c.part}</Td><Td>{c.thickness}</Td><Td>{c.qty}</Td><Td>{c.machineOp}</Td>
                      <Td><CycleBadge value={c.dataStatus} options={STATUS} colors={STATUS_COLORS} onChange={v => updCnc(gi, "dataStatus", v)} readOnly={readOnly} /></Td>
                      <Td><CycleBadge value={c.cncStatus} options={STATUS} colors={STATUS_COLORS} onChange={v => updCnc(gi, "cncStatus", v)} readOnly={readOnly} /></Td>
                      <Td><EditCell value={c.assignee || ""} onChange={v => updCnc(gi, "assignee", v)} placeholder="担当" width={60} readOnly={readOnly} /></Td>
                      <Td><EditCell value={c.cncNote || ""} onChange={v => updCnc(gi, "cncNote", v)} placeholder="備考" width={100} readOnly={readOnly} /></Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: 10, padding: "8px 12px", background: "#f1f5f9", borderRadius: 6, display: "flex", gap: 16, fontSize: 11, flexWrap: "wrap" }}>
              {["円形切り出し", "穴あけ+切り出し", "曲面加工", "切り出し"].map(op => (
                <span key={op}>{op}: <strong>{cnc.filter(c => c.machineOp === op).length}</strong> / 完了 <strong style={{ color: "#10b981" }}>{cnc.filter(c => c.machineOp === op && c.cncStatus === "完了").length}</strong></span>
              ))}
            </div>
          </div>
        )}

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
                    <strong style={{ color: "#3b82f6" }}>品番フィルタ</strong> → 上部ボタンで品番絞り込み（全タブ連動）
                  </>
                )}
              </div>
            </div>
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
