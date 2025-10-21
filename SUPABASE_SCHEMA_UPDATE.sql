-- ============================================
-- おんぷタイム Phase 4: 時間帯ブロック管理機能
-- データベース更新スクリプト
-- ============================================

-- 6. blocked_slots（ブロック時間帯テーブル）の作成
CREATE TABLE IF NOT EXISTS blocked_slots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- ブロック対象
  studio_id VARCHAR(50) NOT NULL REFERENCES studios(id) ON DELETE CASCADE,
  blocked_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- ブロック理由
  reason VARCHAR(255),
  reason_category VARCHAR(50) CHECK (reason_category IN ('maintenance', 'event', 'private', 'other')) DEFAULT 'other',

  -- メタデータ
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- 重複防止
  CONSTRAINT no_duplicate_blocks UNIQUE (studio_id, blocked_date, start_time)
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_blocked_slots_studio ON blocked_slots(studio_id);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_date ON blocked_slots(blocked_date);
CREATE INDEX IF NOT EXISTS idx_blocked_slots_studio_date ON blocked_slots(studio_id, blocked_date);

-- トリガー関数：updated_at自動更新
CREATE OR REPLACE FUNCTION update_blocked_slots_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成
DROP TRIGGER IF EXISTS trigger_update_blocked_slots_timestamp ON blocked_slots;
CREATE TRIGGER trigger_update_blocked_slots_timestamp
BEFORE UPDATE ON blocked_slots
FOR EACH ROW
EXECUTE FUNCTION update_blocked_slots_timestamp();

-- ============================================
-- Row Level Security (RLS) ポリシー設定
-- ============================================

-- RLSを有効化
ALTER TABLE blocked_slots ENABLE ROW LEVEL SECURITY;

-- 全員がブロック情報を参照可能（予約時に確認するため）
DROP POLICY IF EXISTS "Anyone can view blocked slots" ON blocked_slots;
CREATE POLICY "Anyone can view blocked slots"
ON blocked_slots FOR SELECT
TO public
USING (true);

-- 管理者のみブロックを追加・削除可能
DROP POLICY IF EXISTS "Authenticated users can manage blocked slots" ON blocked_slots;
CREATE POLICY "Authenticated users can manage blocked slots"
ON blocked_slots FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- 完了メッセージ
-- ============================================
-- このスクリプトをSupabase SQL Editorで実行してください
-- 実行後、blocked_slotsテーブルが作成され、利用可能になります
