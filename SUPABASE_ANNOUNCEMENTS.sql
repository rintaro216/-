-- お知らせテーブルの作成
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  content TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'important')),
  is_published BOOLEAN DEFAULT false,
  publish_start_date DATE,
  publish_end_date DATE,
  display_order INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_announcements_published ON announcements(is_published, display_order);
CREATE INDEX idx_announcements_dates ON announcements(publish_start_date, publish_end_date);

-- RLSポリシー設定
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 公開されているお知らせは誰でも閲覧可能
CREATE POLICY "公開お知らせの閲覧を許可" ON announcements
  FOR SELECT
  USING (
    is_published = true
    AND (publish_start_date IS NULL OR publish_start_date <= CURRENT_DATE)
    AND (publish_end_date IS NULL OR publish_end_date >= CURRENT_DATE)
  );

-- 管理者は全てのお知らせを閲覧可能（一時的に全員許可）
CREATE POLICY "管理者のお知らせ閲覧を許可" ON announcements
  FOR SELECT
  USING (true);

-- お知らせの作成を許可
CREATE POLICY "お知らせの作成を許可" ON announcements
  FOR INSERT
  WITH CHECK (true);

-- お知らせの更新を許可
CREATE POLICY "お知らせの更新を許可" ON announcements
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- お知らせの削除を許可
CREATE POLICY "お知らせの削除を許可" ON announcements
  FOR DELETE
  USING (true);

-- サンプルデータの挿入
INSERT INTO announcements (title, content, priority, is_published, display_order) VALUES
  ('スタジオ予約システムがリニューアルしました！', 'オンラインで簡単に予約できるようになりました。30分単位でのご予約が可能です。', 'important', true, 1),
  ('年末年始の営業時間について', '12月29日〜1月3日は休業とさせていただきます。ご了承ください。', 'normal', true, 2),
  ('新しいドラムセットが入荷しました', 'みどり楽器エリアに最新のドラムセットを導入しました。ぜひご利用ください。', 'normal', true, 3);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_announcements_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_announcements_updated_at
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_announcements_updated_at();
