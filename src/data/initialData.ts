export const PHASES = ["材料調達", "木部CNC加工", "金属加工", "仕上げ", "組立", "検品", "納品"] as const;
export const PHASE_COLORS: Record<string, string> = { "材料調達": "#fbbf24", "木部CNC加工": "#f97316", "金属加工": "#8b5cf6", "仕上げ": "#3b82f6", "組立": "#10b981", "検品": "#6366f1", "納品": "#ef4444" };
export const STATUS = ["未着手", "進行中", "完了", "保留"] as const;
export const STATUS_COLORS: Record<string, string> = { "未着手": "#94a3b8", "進行中": "#3b82f6", "完了": "#10b981", "保留": "#f59e0b" };
export const PROCURE = ["未発注", "発注済", "入荷済", "欠品"] as const;
export const PROCURE_COLORS: Record<string, string> = { "未発注": "#94a3b8", "発注済": "#3b82f6", "入荷済": "#10b981", "欠品": "#ef4444" };
export const SAMPLE = ["未確認", "確認中", "承認済"] as const;
export const SAMPLE_COLORS: Record<string, string> = { "未確認": "#94a3b8", "確認中": "#f59e0b", "承認済": "#10b981" };
export const APPROVE = ["未着手", "確認中", "承認済", "差戻し"] as const;
export const APPROVE_COLORS: Record<string, string> = { "未着手": "#94a3b8", "確認中": "#f59e0b", "承認済": "#10b981", "差戻し": "#ef4444" };

export interface Item {
  id: string;
  name: string;
  qty: number;
  dims: string;
  page: string;
  imageUrl?: string;
}

export interface FinishRow {
  item: string;
  part: string;
  finish: string;
  note: string;
  sample: string;
  status: string;
  assignee?: string;
  deadline?: string;
  imageUrl?: string;
}

export interface PartRow {
  item: string;
  part: string;
  material: string;
  thickness: string;
  qty: string;
  cncReq: boolean;
  procure: string;
  note: string;
  assignee?: string;
  link?: string;
  imageUrl?: string;
  companyProcure?: string;
  companyProcess?: string;
  companyProduce?: string;
}

export const COMPANIES = ["", "VUILD", "KOKKOK", "BETRUST", "Be,想空間", "サンオンクラフト"] as const;
export const COMPANY_COLORS: Record<string, string> = {
  "": "#94a3b8",
  "VUILD": "#3b82f6",
  "KOKKOK": "#f97316",
  "BETRUST": "#8b5cf6",
  "Be,想空間": "#10b981",
  "サンオンクラフト": "#ef4444",
};

export interface ApprovalRow {
  item: string;
  category: string;
  status: string;
  approver: string;
  date: string;
  note: string;
}

export interface CncRow {
  item: string;
  part: string;
  material: string;
  thickness: string;
  qty: string;
  cncReq: boolean;
  procure: string;
  note: string;
  idx: number;
  machineOp: string;
  dataStatus: string;
  cncStatus: string;
  assignee?: string;
  cncNote?: string;
  imageUrl?: string;
}

export interface PhaseRow {
  id: string;
  name: string;
  qty: number;
  phases: Record<string, string>;
}

export const initItems: Item[] = [
  { id: "LF-01", name: "ローテーブル（丸天板）", qty: 2, dims: "W350×D750×H?", page: "1" },
  { id: "LF-02", name: "シェルフユニット", qty: 2, dims: "W450×D450×H900", page: "2" },
  { id: "BF-05", name: "ブックシェルフ（小）", qty: 1, dims: "W440×D290×H1800", page: "3" },
  { id: "BF-06", name: "ブックシェルフ（大）", qty: 1, dims: "W790×D290×H1800", page: "4" },
  { id: "BF-09", name: "ラウンドテーブル", qty: 1, dims: "W700×D700×H?", page: "5" },
  { id: "BF-10", name: "ラウンドカウンター", qty: 1, dims: "φ1200×H?", page: "6-7" },
  { id: "BF-12", name: "ラウンドテーブル（大）", qty: 1, dims: "φ1188×H?", page: "8" },
];

export const initFinish: FinishRow[] = [
  { item: "LF-01", part: "天板", finish: "TOPメラミン", note: "", sample: "未確認", status: "未着手" },
  { item: "LF-01", part: "側面・前面", finish: "ベルビアンシート貼り", note: "", sample: "未確認", status: "未着手" },
  { item: "LF-01", part: "蓋", finish: "ベルビアンシート貼り", note: "R148曲面", sample: "未確認", status: "未着手" },
  { item: "LF-01", part: "巾木", finish: "t9mmスティール ベルビアンシート貼り", note: "", sample: "未確認", status: "未着手" },
  { item: "LF-01", part: "曲げベニヤ部", finish: "t3mm+2mm曲げベニヤ シート貼り", note: "", sample: "未確認", status: "未着手" },
  { item: "LF-01", part: "小口", finish: "小口塗装", note: "", sample: "未確認", status: "未着手" },
  { item: "LF-02", part: "側面・棚板", finish: "ベルビアンシート貼り", note: "", sample: "未確認", status: "未着手" },
  { item: "LF-02", part: "巾木", finish: "t9mmスティール ベルビアンシート貼り", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "天板", finish: "イビ VMYX-5786D", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "上段棚板", finish: "イビ VMYX-5786D", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "中段棚板", finish: "アイカK-6011KN", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "下段棚板", finish: "アイカK-6011KN", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "背面上部", finish: "イビ VMYX-5786D", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "背面下部", finish: "アイカK-6011KN", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "巾木", finish: "ベルビアンシート貼り", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "アーチ内部", finish: "イビ VMYX-5786D", note: "t9mmスティール", sample: "未確認", status: "未着手" },
  { item: "BF-05", part: "ハンガー", finish: "SUS真鍮ブラスト風塗装", note: "15パイ", sample: "未確認", status: "未着手" },
  { item: "BF-06", part: "天板", finish: "イビ VMYX-5786D", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-06", part: "棚板", finish: "アイカK-6011KN / VMYX-5786D", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-06", part: "巾木", finish: "ベルビアンシート貼り", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-06", part: "アーチ内部", finish: "イビ VMYX-5786D", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-09", part: "天板（丸）", finish: "イビ VMYX-5786D", note: "φ530", sample: "未確認", status: "未着手" },
  { item: "BF-09", part: "外周リング", finish: "アイカK-6011KN", note: "小口6011同色塗装ツヤ消し", sample: "未確認", status: "未着手" },
  { item: "BF-09", part: "本体側面", finish: "ベルビアンシート貼り", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-09", part: "台座下部", finish: "ベルビアン同色焼き付け", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-10", part: "天板リング", finish: "イビ VMYX-5786D", note: "φ1200外/φ800内", sample: "未確認", status: "未着手" },
  { item: "BF-10", part: "内周", finish: "アイカK-6011KN", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-10", part: "台座", finish: "ベルビアンシート貼り", note: "足元目地確認", sample: "未確認", status: "未着手" },
  { item: "BF-10", part: "底目地", finish: "底目地同色塗装", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-12", part: "天板（丸）", finish: "イビ VMYX-5786D", note: "φ1188", sample: "未確認", status: "未着手" },
  { item: "BF-12", part: "台座上部", finish: "イビ VMYX-5786D", note: "", sample: "未確認", status: "未着手" },
  { item: "BF-12", part: "台座下部", finish: "ベルビアンシート貼り", note: "", sample: "未確認", status: "未着手" },
];

export const initParts: PartRow[] = [
  { item: "LF-01", part: "天板（丸穴付）", material: "合板", thickness: "t24mm", qty: "1枚", cncReq: true, procure: "未発注", note: "" },
  { item: "LF-01", part: "側板", material: "合板", thickness: "t24mm", qty: "2枚", cncReq: false, procure: "未発注", note: "" },
  { item: "LF-01", part: "棚板", material: "合板", thickness: "t12mm / t24mm", qty: "各1枚", cncReq: false, procure: "未発注", note: "" },
  { item: "LF-01", part: "蓋（R148）", material: "曲げベニヤ", thickness: "t3+2mm", qty: "1枚", cncReq: true, procure: "未発注", note: "" },
  { item: "LF-01", part: "巾木フレーム", material: "スティール", thickness: "t9mm", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "LF-01", part: "底板（コンセント穴付）", material: "合板", thickness: "t24mm", qty: "2枚", cncReq: true, procure: "未発注", note: "" },
  { item: "LF-02", part: "天板", material: "合板", thickness: "t24mm", qty: "1箇所", cncReq: true, procure: "未発注", note: "" },
  { item: "LF-02", part: "棚板（上）", material: "合板", thickness: "t24mm", qty: "2箇所", cncReq: false, procure: "未発注", note: "" },
  { item: "LF-02", part: "棚板（下）", material: "合板", thickness: "t24mm", qty: "3枚", cncReq: false, procure: "未発注", note: "" },
  { item: "LF-02", part: "巾木フレーム", material: "スティール", thickness: "t9mm", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-05", part: "天板", material: "合板+化粧", thickness: "t24mm", qty: "1枚", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-05", part: "アーチ部材", material: "スティール", thickness: "t9mm", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-05", part: "棚板×3", material: "合板+化粧", thickness: "-", qty: "3枚", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-05", part: "ハンガーバー", material: "SUS", thickness: "15φ", qty: "1本", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-05", part: "LED照明", material: "FKK FGBシリーズ", thickness: "-", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-05", part: "スライドレール", material: "-", thickness: "-", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-05", part: "ルーター丁番 RS-208", material: "真鍮ブラスと風塗装", thickness: "-", qty: "2台", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-06", part: "天板", material: "合板+化粧", thickness: "t24mm", qty: "1枚", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-06", part: "アーチ部材", material: "スティール", thickness: "t9mm", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-06", part: "棚板", material: "合板+化粧", thickness: "-", qty: "複数", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-06", part: "スライドレール", material: "-", thickness: "-", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-06", part: "ルーター丁番 RS-208", material: "真鍮ブラスと風塗装", thickness: "-", qty: "2台", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-09", part: "天板（丸φ530）", material: "合板+化粧", thickness: "t15mm", qty: "1枚", cncReq: true, procure: "未発注", note: "" },
  { item: "BF-09", part: "外周リング", material: "合板+化粧", thickness: "t24mm", qty: "2枚", cncReq: true, procure: "未発注", note: "" },
  { item: "BF-09", part: "本体側面", material: "合板", thickness: "-", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-09", part: "脚", material: "別途手配", thickness: "-", qty: "-", cncReq: false, procure: "未発注", note: "別途手配" },
  { item: "BF-10", part: "天板円盤（φ792）", material: "合板", thickness: "t24mm", qty: "2枚", cncReq: true, procure: "未発注", note: "" },
  { item: "BF-10", part: "天板リング（φ1188外）", material: "合板", thickness: "t24mm", qty: "2枚", cncReq: true, procure: "未発注", note: "" },
  { item: "BF-10", part: "天板リング（φ1058内）", material: "合板", thickness: "t24mm", qty: "1枚", cncReq: true, procure: "未発注", note: "" },
  { item: "BF-10", part: "天板リング（φ1088）", material: "合板", thickness: "t15mm", qty: "1枚", cncReq: true, procure: "未発注", note: "" },
  { item: "BF-10", part: "円環下地（φ662内穴付）", material: "合板", thickness: "t30mm", qty: "1枚", cncReq: true, procure: "未発注", note: "" },
  { item: "BF-10", part: "台座パネル", material: "合板", thickness: "-", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-12", part: "天板円盤（φ1188）", material: "合板+化粧", thickness: "-", qty: "1枚", cncReq: true, procure: "未発注", note: "" },
  { item: "BF-12", part: "台座フレーム", material: "合板", thickness: "t24mm", qty: "1式", cncReq: false, procure: "未発注", note: "" },
  { item: "BF-12", part: "脚", material: "別途手配（製作不可）", thickness: "-", qty: "-", cncReq: false, procure: "未発注", note: "製作不可・別途手配" },
];

export const initApproval: ApprovalRow[] = [
  { item: "LF-01", category: "図面承認", status: "未着手", approver: "", date: "", note: "コンセント位置指示待ち" },
  { item: "LF-01", category: "仕上げ色決定", status: "未着手", approver: "", date: "", note: "ベルビアン色番確認" },
  { item: "LF-01", category: "25パイ開口位置", status: "未着手", approver: "", date: "", note: "位置指示お願いします" },
  { item: "LF-01", category: "床コンセントサイズ", status: "未着手", approver: "", date: "", note: "確認要" },
  { item: "LF-02", category: "図面承認", status: "未着手", approver: "", date: "", note: "" },
  { item: "BF-05", category: "図面承認", status: "未着手", approver: "", date: "", note: "" },
  { item: "BF-05", category: "LED型番確定", status: "未着手", approver: "", date: "", note: "FKK FGBシリーズ 3000K" },
  { item: "BF-05", category: "丁番仕様確認", status: "未着手", approver: "", date: "", note: "RS-208 真鍮ブラスと風塗装" },
  { item: "BF-06", category: "図面承認", status: "未着手", approver: "", date: "", note: "" },
  { item: "BF-06", category: "丁番仕様確認", status: "未着手", approver: "", date: "", note: "RS-208" },
  { item: "BF-09", category: "図面承認", status: "未着手", approver: "", date: "", note: "" },
  { item: "BF-09", category: "脚手配先確認", status: "未着手", approver: "", date: "", note: "脚は別途でお願いします" },
  { item: "BF-10", category: "図面承認", status: "未着手", approver: "", date: "", note: "" },
  { item: "BF-10", category: "足元目地確認", status: "未着手", approver: "", date: "", note: "" },
  { item: "BF-12", category: "図面承認", status: "未着手", approver: "", date: "", note: "" },
  { item: "BF-12", category: "脚手配先確認", status: "未着手", approver: "", date: "", note: "製作不可のため別途手配" },
];

export const makeCnc = (parts: PartRow[]): CncRow[] => parts.filter(p => p.cncReq).map((p, i) => ({
  ...p, idx: i,
  machineOp: p.part.includes("丸") || p.part.includes("φ") || p.part.includes("円") || p.part.includes("リング") ? "円形切り出し" : p.part.includes("R") ? "曲面加工" : p.part.includes("穴") ? "穴あけ+切り出し" : "切り出し",
  dataStatus: "未着手", cncStatus: "未着手",
}));

export const initPhase: PhaseRow[] = initItems.map(it => ({
  id: it.id, name: it.name, qty: it.qty,
  phases: Object.fromEntries(PHASES.map(p => [p, "未着手"]))
}));
