-- ============================================
-- おんぷタイム Phase 4: お知らせ管理機能
-- データベース更新スクリプト
-- ============================================

-- announcements（お知らせテーブル）の作成
CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- お知らせ内容
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,

  -- カテゴリ・重要度
  category VARCHAR(50) CHECK (category IN ('info', 'important', 'maintenance', 'event')) DEFAULT 'info',
  priority INTEGER DEFAULT 0, -- 大きいほど優先度高

  -- リッチコンテンツ
  image_url TEXT, -- 画像URL
  link_url TEXT, -- 外部リンク
  link_text VARCHAR(100), -- リンクテキスト

  -- カスタムスタイル
  badge_color VARCHAR(50), -- バッジの色（カテゴリごとのカスタム色）
  text_color VARCHAR(50), -- テキスト色

  -- 公開設定
  is_published BOOLEAN DEFAULT true,
  publish_start_date DATE, -- 公開開始日（NULL=即時公開）
  publish_end_date DATE, -- 公開終了日（NULL=無期限）

  -- メタデータ
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_announcements_published ON announcements(is_published, publish_start_date, publish_end_date);
CREATE INDEX IF NOT EXISTS idx_announcements_category ON announcements(category);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority DESC);

-- トリガー関数：updated_at自動更新
CREATE OR REPLACE FUNCTION update_announcements_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー作成
DROP TRIGGER IF EXISTS trigger_update_announcements_timestamp ON announcements;
CREATE TRIGGER trigger_update_announcements_timestamp
BEFORE UPDATE ON announcements
FOR EACH ROW
EXECUTE FUNCTION update_announcements_timestamp();

-- ============================================
-- Row Level Security (RLS) ポリシー設定
-- ============================================

-- RLSを有効化
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

-- 公開済みのお知らせは誰でも閲覧可能（公開期間内のみ）
DROP POLICY IF EXISTS "Anyone can view published announcements" ON announcements;
CREATE POLICY "Anyone can view published announcements"
ON announcements FOR SELECT
TO public
USING (
  is_published = true
  AND (publish_start_date IS NULL OR publish_start_date <= CURRENT_DATE)
  AND (publish_end_date IS NULL OR publish_end_date >= CURRENT_DATE)
);

-- 管理者はすべてのお知らせを管理可能
DROP POLICY IF EXISTS "Authenticated users can manage announcements" ON announcements;
CREATE POLICY "Authenticated users can manage announcements"
ON announcements FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- ============================================
-- サンプルデータ投入
-- ============================================

INSERT INTO announcements (title, content, category, priority, is_published, publish_start_date, publish_end_date) VALUES
('おんぷタイム予約システムリニューアルのお知らせ',
 'いつもおんぷタイムをご利用いただきありがとうございます。この度、予約システムを全面リニューアルいたしました。スマートフォンからも快適にご予約いただけるようになりました。',
 'important',
 10,
 true,
 CURRENT_DATE,
 NULL),

('年末年始休業のお知らせ',
 '12月29日から1月3日までを年末年始休業とさせていただきます。新年は1月4日より通常営業いたします。',
 'info',
 5,
 true,
 CURRENT_DATE,
 '2025-12-28'),

('設備メンテナンスのお知らせ',
 '10月25日（金）13:00-17:00の間、設備点検のため一部スタジオがご利用いただけません。ご不便をおかけいたしますが、ご理解とご協力をお願いいたします。',
 'maintenance',
 8,
 true,
 CURRENT_DATE,
 '2025-10-25');

-- ============================================
-- 完了メッセージ
-- ============================================
-- このスクリプトをSupabase SQL Editorで実行してください
-- 実行後、announcementsテーブルが作成され、利用可能になります
