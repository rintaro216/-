-- 閲覧数をインクリメントするRPC関数
CREATE OR REPLACE FUNCTION increment_view_count(announcement_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE announcements
  SET view_count = COALESCE(view_count, 0) + 1
  WHERE id = announcement_id;
END;
$$;

-- この関数は誰でも実行できるようにする（認証不要）
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO anon, authenticated;

COMMENT ON FUNCTION increment_view_count IS 'お知らせの閲覧数を+1する関数';
