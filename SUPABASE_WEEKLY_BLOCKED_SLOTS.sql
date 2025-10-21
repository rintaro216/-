-- 曜日別スタジオブロック設定テーブル
-- スタジオごと・曜日ごとの定期的なブロック時間帯を管理

CREATE TABLE IF NOT EXISTS weekly_blocked_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  studio_id VARCHAR NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  -- 0 = 日曜日, 1 = 月曜日, ..., 6 = 土曜日
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  reason TEXT DEFAULT '曜日別定期ブロック',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 同じスタジオ・曜日・時間帯の重複を防ぐ
  UNIQUE(studio_id, day_of_week, start_time, end_time)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_weekly_blocked_slots_studio
  ON weekly_blocked_slots(studio_id);
CREATE INDEX IF NOT EXISTS idx_weekly_blocked_slots_day
  ON weekly_blocked_slots(day_of_week);

-- RLS (Row Level Security) 有効化
ALTER TABLE weekly_blocked_slots ENABLE ROW LEVEL SECURITY;

-- 管理者のみ操作可能なポリシー
CREATE POLICY "管理者のみ曜日別ブロックを操作可能" ON weekly_blocked_slots
  FOR ALL
  USING (true)  -- 一旦全てのユーザーがアクセス可能に（認証済みユーザーのみに制限する場合は auth.uid() IS NOT NULL）
  WITH CHECK (true);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_weekly_blocked_slots_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_weekly_blocked_slots_updated_at
  BEFORE UPDATE ON weekly_blocked_slots
  FOR EACH ROW
  EXECUTE FUNCTION update_weekly_blocked_slots_updated_at();

-- コメント追加
COMMENT ON TABLE weekly_blocked_slots IS 'スタジオごと・曜日ごとの定期ブロック時間帯';
COMMENT ON COLUMN weekly_blocked_slots.day_of_week IS '曜日 (0=日曜, 1=月曜, ..., 6=土曜)';
COMMENT ON COLUMN weekly_blocked_slots.start_time IS 'ブロック開始時刻';
COMMENT ON COLUMN weekly_blocked_slots.end_time IS 'ブロック終了時刻';
