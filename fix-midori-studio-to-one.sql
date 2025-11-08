-- みどり楽器のスタジオを1台に設定
-- 実行前に現在の状態を確認

-- 現在のみどり楽器のスタジオを確認
SELECT id, area, display_name, is_active
FROM studios
WHERE area = 'みどり楽器'
ORDER BY id;

-- midori-a 以外のみどり楽器スタジオがあれば無効化
-- （削除ではなく無効化することで、既存の予約データを保持）
UPDATE studios
SET is_active = false
WHERE area = 'みどり楽器'
  AND id != 'midori-a';

-- midori-a が有効であることを確認
UPDATE studios
SET is_active = true
WHERE id = 'midori-a';

-- 結果確認
SELECT id, area, display_name, is_active
FROM studios
WHERE area = 'みどり楽器'
ORDER BY id;
