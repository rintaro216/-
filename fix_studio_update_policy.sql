-- スタジオ休止機能を有効化するためのRLSポリシー修正

-- 1. 既存のUPDATEポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Allow authenticated users to update studios" ON studios;
DROP POLICY IF EXISTS "Allow service role to update studios" ON studios;
DROP POLICY IF EXISTS "Allow update for authenticated users" ON studios;

-- 2. 認証済みユーザー（管理者）がスタジオを更新できるポリシーを作成
CREATE POLICY "Allow authenticated users to update studios"
ON studios
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. 現在のRLSポリシーを確認
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'studios';
