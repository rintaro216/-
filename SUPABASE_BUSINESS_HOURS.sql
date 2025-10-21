-- 営業時間管理テーブル（カレンダータブで使用）
-- エリアごと・曜日ごとの営業時間を管理

CREATE TABLE IF NOT EXISTS business_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  area VARCHAR NOT NULL,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- 0 = 日曜日, 1 = 月曜日, ..., 6 = 土曜日
  is_closed BOOLEAN DEFAULT false,
  open_time TIME NOT NULL,
  close_time TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 同じエリア・曜日の重複を防ぐ
  UNIQUE(area, day_of_week)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_business_hours_area
  ON business_hours(area);
CREATE INDEX IF NOT EXISTS idx_business_hours_day
  ON business_hours(day_of_week);

-- RLS (Row Level Security) 有効化
ALTER TABLE business_hours ENABLE ROW LEVEL SECURITY;

-- 全ユーザーがアクセス可能なポリシー
CREATE POLICY "誰でもアクセス可能" ON business_hours
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_business_hours_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_business_hours_updated_at
  BEFORE UPDATE ON business_hours
  FOR EACH ROW
  EXECUTE FUNCTION update_business_hours_updated_at();

-- コメント追加
COMMENT ON TABLE business_hours IS 'エリアごと・曜日ごとの営業時間';
COMMENT ON COLUMN business_hours.day_of_week IS '曜日 (0=日曜, 1=月曜, ..., 6=土曜)';
COMMENT ON COLUMN business_hours.is_closed IS '定休日かどうか';
COMMENT ON COLUMN business_hours.open_time IS '営業開始時刻';
COMMENT ON COLUMN business_hours.close_time IS '営業終了時刻';
