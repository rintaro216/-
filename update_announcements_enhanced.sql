-- ============================================
-- おんぷタイム: お知らせ機能拡張
-- カテゴリ4種類・ピン留め機能の追加
-- ============================================

-- 1. categoryカラムを追加（4種類のカテゴリ）
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS category VARCHAR(50)
CHECK (category IN ('general', 'important', 'maintenance', 'event'))
DEFAULT 'general';

-- 2. 既存のpriorityデータをcategoryに移行
-- 'normal' -> 'general', 'important' -> 'important'
UPDATE announcements
SET category = CASE
  WHEN priority = 'important' THEN 'important'
  WHEN priority = 'normal' THEN 'general'
  ELSE 'general'
END
WHERE category IS NULL OR category = 'general';

-- 3. ピン留めフラグを追加
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- 4. ピン留め順序用のインデックスを追加
CREATE INDEX IF NOT EXISTS idx_announcements_pinned
ON announcements(is_pinned DESC, display_order ASC, created_at DESC);

-- 5. カテゴリ別のインデックスを追加
CREATE INDEX IF NOT EXISTS idx_announcements_category
ON announcements(category);

-- ============================================
-- カテゴリの説明
-- ============================================
-- general: 一般的なお知らせ（青）
-- important: 重要なお知らせ（赤）
-- maintenance: メンテナンス情報（黄）
-- event: イベント情報（緑）

-- ============================================
-- 実行手順
-- ============================================
-- 1. このスクリプトをSupabase SQL Editorで実行
-- 2. エラーがないことを確認
-- 3. announcements テーブルにcategoryとis_pinnedカラムが追加されたことを確認

-- 確認用クエリ:
-- SELECT column_name, data_type, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'announcements'
-- ORDER BY ordinal_position;
