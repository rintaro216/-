-- お知らせ機能の拡張
-- 1. 閲覧数カウント
-- 3. プレビュー機能（管理画面で実装）
-- 4. 下書き機能

-- =====================================
-- 1. 閲覧数カウント（view_count）
-- =====================================

ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0;

COMMENT ON COLUMN announcements.view_count IS '閲覧数（詳細ページを開いた回数）';

-- インデックス作成（人気順ソート用）
CREATE INDEX IF NOT EXISTS idx_announcements_view_count
ON announcements(view_count DESC);

-- =====================================
-- 4. 下書き機能（status）
-- =====================================

-- statusカラムを追加（draft/published）
ALTER TABLE announcements
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published'
CHECK (status IN ('draft', 'published'));

COMMENT ON COLUMN announcements.status IS 'ステータス（draft=下書き, published=公開済み）';

-- 既存データを公開済みに設定
UPDATE announcements
SET status = 'published'
WHERE status IS NULL;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_announcements_status
ON announcements(status, created_at DESC);

-- =====================================
-- is_published と status の関係
-- =====================================
-- is_published: true=公開, false=非公開（古いフィールド）
-- status: 'draft'=下書き, 'published'=公開済み（新しいフィールド）
--
-- 今後の運用:
-- - 下書き保存: status='draft', is_published=false
-- - 公開: status='published', is_published=true
-- - 非公開に戻す: status='published', is_published=false

-- =====================================
-- 確認用クエリ
-- =====================================

-- 閲覧数ランキング（人気のお知らせTOP5）
-- SELECT title, view_count, category, created_at
-- FROM announcements
-- WHERE is_published = true
-- ORDER BY view_count DESC
-- LIMIT 5;

-- 下書き一覧
-- SELECT title, status, created_at
-- FROM announcements
-- WHERE status = 'draft'
-- ORDER BY created_at DESC;

-- ステータス別の件数
-- SELECT status, COUNT(*) as count
-- FROM announcements
-- GROUP BY status;
