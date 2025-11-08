-- お知らせテーブルのスキーマ修正
-- 問題点:
--   1. category カラムが存在しない（priorityのみ）
--   2. is_pinned カラムが存在しない

-- =====================================
-- 1. category カラムを追加
-- =====================================

-- categoryカラムを追加（general/important/maintenance/event）
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS category VARCHAR(20) DEFAULT 'general'
CHECK (category IN ('general', 'important', 'maintenance', 'event'));

-- 既存データのマイグレーション: priority → category
-- priority='important' → category='important'
-- priority='normal' → category='general'
UPDATE announcements
SET category = CASE
  WHEN priority = 'important' THEN 'important'
  ELSE 'general'
END
WHERE category IS NULL OR category = 'general';

-- priorityカラムを削除（オプション: 古いデータを残したい場合はコメントアウト）
-- ALTER TABLE announcements DROP COLUMN IF EXISTS priority;

-- =====================================
-- 2. is_pinned カラムを追加
-- =====================================

-- ピン留め機能のカラムを追加
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS is_pinned BOOLEAN DEFAULT false;

-- ピン留めのインデックスを作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_announcements_pinned
ON announcements(is_pinned DESC, created_at DESC);

-- =====================================
-- 3. 既存インデックスの更新
-- =====================================

-- 既存のインデックスを削除（重複を避けるため）
DROP INDEX IF EXISTS idx_announcements_published;

-- 新しいインデックスを作成（is_pinned, is_published, display_order を含む）
CREATE INDEX IF NOT EXISTS idx_announcements_published_pinned
ON announcements(is_published, is_pinned DESC, display_order ASC, created_at DESC);

-- =====================================
-- 4. 確認用クエリ
-- =====================================

-- テーブル構造を確認
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'announcements'
-- ORDER BY ordinal_position;

-- カテゴリ別の件数を確認
-- SELECT category, COUNT(*) as count
-- FROM announcements
-- GROUP BY category;

-- ピン留めの件数を確認
-- SELECT is_pinned, COUNT(*) as count
-- FROM announcements
-- GROUP BY is_pinned;

-- =====================================
-- 5. サンプルデータの更新（オプション）
-- =====================================

-- 既存のサンプルデータをピン留めにする（必要に応じて）
-- UPDATE announcements
-- SET is_pinned = true
-- WHERE title LIKE '%リニューアル%';

-- カテゴリを設定（必要に応じて）
-- UPDATE announcements
-- SET category = 'maintenance'
-- WHERE title LIKE '%営業時間%';

-- UPDATE announcements
-- SET category = 'event'
-- WHERE title LIKE '%イベント%' OR title LIKE '%入荷%';

COMMENT ON COLUMN announcements.category IS 'カテゴリ（general/important/maintenance/event）';
COMMENT ON COLUMN announcements.is_pinned IS 'ピン留め（trueの場合は常に上位表示）';
