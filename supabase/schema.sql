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
