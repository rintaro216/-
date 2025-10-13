# Supabase データベース設計書

## 📊 データベース概要

おんぷタイムの予約システムで使用するSupabaseデータベースのスキーマ定義です。

---

## 🗄️ テーブル構成

### 1. reservations（予約テーブル）

予約情報を管理するメインテーブル

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  reservation_number VARCHAR(50) UNIQUE NOT NULL,

  -- 予約内容
  area VARCHAR(20) NOT NULL CHECK (area IN ('onpukan', 'midori')),
  studio_id VARCHAR(50) NOT NULL,
  reservation_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,

  -- 利用者情報
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('general', 'student')),
  customer_name VARCHAR(100) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),

  -- 料金情報
  price INTEGER NOT NULL,

  -- ステータス
  status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'cancelled', 'completed')),

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  cancelled_at TIMESTAMP WITH TIME ZONE,
  cancellation_reason TEXT
);

-- インデックス
CREATE INDEX idx_reservations_date ON reservations(reservation_date);
CREATE INDEX idx_reservations_studio ON reservations(studio_id, reservation_date);
CREATE INDEX idx_reservations_status ON reservations(status);
CREATE INDEX idx_reservations_phone ON reservations(customer_phone);
```

### 2. studios（スタジオマスタテーブル）

スタジオの基本情報を管理

```sql
CREATE TABLE studios (
  id VARCHAR(50) PRIMARY KEY,
  area VARCHAR(20) NOT NULL CHECK (area IN ('onpukan', 'midori')),
  name VARCHAR(50) NOT NULL,
  display_name VARCHAR(50) NOT NULL,
  icon VARCHAR(10),
  capacity INTEGER DEFAULT 1,

  -- 料金設定
  price_general INTEGER NOT NULL,
  price_student INTEGER NOT NULL,

  -- 設備・特徴（JSON）
  equipment JSONB DEFAULT '[]',
  features JSONB DEFAULT '[]',

  -- 営業設定
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_studios_area ON studios(area);
CREATE INDEX idx_studios_active ON studios(is_active);
```

### 3. business_hours（営業時間テーブル）

営業時間・定休日の管理

```sql
CREATE TABLE business_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area VARCHAR(20) NOT NULL CHECK (area IN ('onpukan', 'midori')),
  day_of_week INTEGER CHECK (day_of_week BETWEEN 0 AND 6), -- 0=日曜, 6=土曜
  is_closed BOOLEAN DEFAULT false,
  open_time TIME,
  close_time TIME,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_business_hours_area ON business_hours(area);
```

### 4. holidays（休業日テーブル）

特定日の休業管理

```sql
CREATE TABLE holidays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  area VARCHAR(20) CHECK (area IN ('onpukan', 'midori')), -- NULL = 全エリア
  holiday_date DATE NOT NULL,
  reason VARCHAR(255),

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(area, holiday_date)
);

-- インデックス
CREATE INDEX idx_holidays_date ON holidays(holiday_date);
```

### 5. news（お知らせテーブル）

お知らせ・ニュース管理

```sql
CREATE TABLE news (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  subtitle VARCHAR(255),
  description TEXT,
  category VARCHAR(50) CHECK (category IN ('event', 'facility', 'info', 'announcement')),
  priority INTEGER DEFAULT 0,

  -- 画像
  image_url TEXT,

  -- 公開設定
  is_published BOOLEAN DEFAULT true,
  published_at TIMESTAMP WITH TIME ZONE,

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX idx_news_published ON news(is_published, published_at);
CREATE INDEX idx_news_category ON news(category);
```

---

## 🔐 Row Level Security (RLS)

### reservations テーブル

```sql
-- 全員が予約を作成可能
CREATE POLICY "Anyone can create reservations"
ON reservations FOR INSERT
TO public
WITH CHECK (true);

-- 自分の電話番号の予約のみ参照可能
CREATE POLICY "Users can view their own reservations"
ON reservations FOR SELECT
TO public
USING (customer_phone = current_setting('request.jwt.claims', true)::json->>'phone');

-- （管理者用）全ての予約を参照可能
CREATE POLICY "Admins can view all reservations"
ON reservations FOR SELECT
TO authenticated
USING (
  (current_setting('request.jwt.claims', true)::json->>'role') = 'admin'
);
```

### studios テーブル

```sql
-- 誰でも閲覧可能
CREATE POLICY "Anyone can view active studios"
ON studios FOR SELECT
TO public
USING (is_active = true);
```

### news テーブル

```sql
-- 公開済みのお知らせは誰でも閲覧可能
CREATE POLICY "Anyone can view published news"
ON news FOR SELECT
TO public
USING (is_published = true);
```

---

## 📝 初期データ投入

### スタジオマスタデータ

```sql
-- おんぷ館
INSERT INTO studios (id, area, name, display_name, icon, capacity, price_general, price_student, equipment, features, display_order) VALUES
('onpukan-a', 'onpukan', 'A', 'Aスタジオ', '🎹', 2, 1600, 1100,
 '["グランドピアノ（ヤマハC3X）", "椅子", "譜面台"]',
 '["防音", "空調", "グランドピアノ"]', 1),

('onpukan-b', 'onpukan', 'B', 'Bスタジオ', '🎹', 2, 1100, 660,
 '["アップライトピアノ", "椅子", "譜面台"]',
 '["防音", "空調"]', 2),

('onpukan-c', 'onpukan', 'C', 'Cスタジオ', '🎵', 3, 1100, 660,
 '["防音室", "譜面台", "椅子"]',
 '["防音", "楽器持込可"]', 3),

('onpukan-d', 'onpukan', 'D', 'Dスタジオ', '🎵', 3, 1100, 660,
 '["防音室", "譜面台", "椅子"]',
 '["防音", "楽器持込可"]', 4),

('onpukan-e', 'onpukan', 'E', 'Eスタジオ', '🎵', 3, 1100, 660,
 '["防音室", "譜面台", "椅子"]',
 '["防音", "楽器持込可"]', 5),

('onpukan-f', 'onpukan', 'F', 'Fスタジオ', '🎵', 3, 1100, 660,
 '["防音室", "譜面台", "椅子"]',
 '["防音", "楽器持込可"]', 6),

('onpukan-g', 'onpukan', 'G', 'Gスタジオ', '🎵', 3, 1100, 660,
 '["防音室", "譜面台", "椅子"]',
 '["防音", "楽器持込可"]', 7);

-- みどり楽器
INSERT INTO studios (id, area, name, display_name, icon, capacity, price_general, price_student, equipment, features, display_order) VALUES
('midori-drum-a', 'midori', 'Drum A', 'ドラム室A', '🥁', 2, 1000, 700,
 '["Pearl ドラムセット", "シンバル各種", "ツインペダル"]',
 '["防音", "空調", "スティック貸出"]', 1),

('midori-drum-b', 'midori', 'Drum B', 'ドラム室B', '🥁', 2, 1000, 700,
 '["YAMAHA ドラムセット", "電子ドラム（練習用）"]',
 '["防音", "空調", "静音練習可"]', 2),

('midori-guitar', 'midori', 'Guitar', 'ギター・ベース室', '🎸', 3, 1100, 660,
 '["Marshall アンプ", "BOSS エフェクター", "シールド"]',
 '["防音", "空調", "機材レンタル"]', 3);
```

---

## 🔍 便利なクエリ集

### 予約の空室確認

```sql
-- 特定日時のスタジオ空室確認
SELECT
  s.id,
  s.display_name,
  s.area,
  CASE
    WHEN COUNT(r.id) = 0 THEN 'available'
    ELSE 'occupied'
  END as status
FROM studios s
LEFT JOIN reservations r ON
  s.id = r.studio_id
  AND r.reservation_date = '2025-10-15'
  AND r.start_time = '14:00:00'
  AND r.status = 'confirmed'
WHERE s.is_active = true
  AND s.area = 'onpukan'
GROUP BY s.id, s.display_name, s.area
ORDER BY s.display_order;
```

### 予約番号の生成

```sql
-- 予約番号生成（OP-YYYYMMDD-XXX形式）
SELECT
  'OP-' ||
  TO_CHAR(CURRENT_DATE, 'YYYYMMDD') ||
  '-' ||
  LPAD((COUNT(*) + 1)::TEXT, 3, '0') as next_reservation_number
FROM reservations
WHERE reservation_date = CURRENT_DATE;
```

---

## 📅 更新履歴

- 2025-10-13: 初版作成
