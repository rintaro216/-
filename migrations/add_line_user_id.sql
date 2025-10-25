-- 予約テーブルにLINE User IDカラムを追加
ALTER TABLE reservations
ADD COLUMN IF NOT EXISTS line_user_id TEXT;

-- インデックスを追加（LINE User IDで検索することがあるため）
CREATE INDEX IF NOT EXISTS idx_reservations_line_user_id
ON reservations(line_user_id);

-- コメント追加
COMMENT ON COLUMN reservations.line_user_id IS 'LINE Messaging APIのUser ID（通知送信用）';
