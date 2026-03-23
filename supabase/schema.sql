-- items テーブル
CREATE TABLE items (
  id SERIAL PRIMARY KEY,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  qty INTEGER NOT NULL DEFAULT 1,
  dims TEXT NOT NULL DEFAULT '',
  page TEXT NOT NULL DEFAULT '',
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- finish テーブル
CREATE TABLE finish (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  part TEXT NOT NULL DEFAULT '',
  finish TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  sample TEXT NOT NULL DEFAULT '未確認',
  status TEXT NOT NULL DEFAULT '未着手',
  assignee TEXT,
  deadline TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- parts テーブル
CREATE TABLE parts (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  part TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL DEFAULT '',
  thickness TEXT NOT NULL DEFAULT '',
  qty TEXT NOT NULL DEFAULT '',
  cnc_req BOOLEAN NOT NULL DEFAULT FALSE,
  procure TEXT NOT NULL DEFAULT '未発注',
  note TEXT NOT NULL DEFAULT '',
  assignee TEXT,
  link TEXT,
  image_url TEXT,
  company_procure TEXT,
  company_process TEXT,
  company_produce TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- approval テーブル
CREATE TABLE approval (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '未着手',
  approver TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- cnc テーブル
CREATE TABLE cnc (
  id SERIAL PRIMARY KEY,
  item TEXT NOT NULL,
  part TEXT NOT NULL DEFAULT '',
  material TEXT NOT NULL DEFAULT '',
  thickness TEXT NOT NULL DEFAULT '',
  qty TEXT NOT NULL DEFAULT '',
  cnc_req BOOLEAN NOT NULL DEFAULT TRUE,
  procure TEXT NOT NULL DEFAULT '未発注',
  note TEXT NOT NULL DEFAULT '',
  idx INTEGER NOT NULL DEFAULT 0,
  machine_op TEXT NOT NULL DEFAULT '切り出し',
  data_status TEXT NOT NULL DEFAULT '未着手',
  cnc_status TEXT NOT NULL DEFAULT '未着手',
  assignee TEXT,
  cnc_note TEXT,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- phase テーブル
CREATE TABLE phase (
  id SERIAL PRIMARY KEY,
  item_id TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  qty INTEGER NOT NULL DEFAULT 1,
  phases JSONB NOT NULL DEFAULT '{}',
  sort_order INTEGER NOT NULL DEFAULT 0
);

-- RLS を無効化（認証なし運用）
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE finish ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE approval ENABLE ROW LEVEL SECURITY;
ALTER TABLE cnc ENABLE ROW LEVEL SECURITY;
ALTER TABLE phase ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on items" ON items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on finish" ON finish FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on parts" ON parts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on approval" ON approval FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on cnc" ON cnc FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on phase" ON phase FOR ALL USING (true) WITH CHECK (true);

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

-- Add updated_at to existing tables
ALTER TABLE items ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE finish ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE parts ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE approval ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE cnc ADD COLUMN IF NOT EXISTS updated_at TEXT;
ALTER TABLE phase ADD COLUMN IF NOT EXISTS updated_at TEXT;
