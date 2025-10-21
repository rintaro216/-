-- reservationsテーブルのRLSポリシーを修正
-- 問題：予約作成時に"new row violates row-level security policy"エラーが発生

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "誰でも予約を作成できる" ON reservations;
DROP POLICY IF EXISTS "誰でも予約を閲覧できる" ON reservations;
DROP POLICY IF EXISTS "誰でも予約を更新できる" ON reservations;
DROP POLICY IF EXISTS "誰でも予約を削除できる" ON reservations;

-- 新しいポリシーを作成（全ての操作を許可）
CREATE POLICY "予約の作成を許可" ON reservations
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "予約の閲覧を許可" ON reservations
  FOR SELECT
  USING (true);

CREATE POLICY "予約の更新を許可" ON reservations
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE POLICY "予約の削除を許可" ON reservations
  FOR DELETE
  USING (true);

-- RLSが有効になっていることを確認
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
