-- スタジオマスタデータをA・B・Cの3スタジオに更新

-- 新しいカラムを追加（存在しない場合）
ALTER TABLE studios ADD COLUMN IF NOT EXISTS price_individual_60min INTEGER;
ALTER TABLE studios ADD COLUMN IF NOT EXISTS price_band_60min INTEGER;
ALTER TABLE studios ADD COLUMN IF NOT EXISTS reservation_unit_minutes INTEGER DEFAULT 30;
ALTER TABLE studios ADD COLUMN IF NOT EXISTS description TEXT;

COMMENT ON COLUMN studios.price_individual_60min IS 'みどり楽器の個人練習料金（1時間）';
COMMENT ON COLUMN studios.price_band_60min IS 'みどり楽器のバンド練習料金（1時間）';
COMMENT ON COLUMN studios.reservation_unit_minutes IS '予約単位（分）：30分 or 60分';
COMMENT ON COLUMN studios.description IS 'スタジオの説明文';

-- 既存のスタジオデータを削除（予約データは保持）
DELETE FROM studios WHERE area = 'おんぷ館' OR area = 'みどり楽器';

-- おんぷ館の3スタジオを挿入
INSERT INTO studios (id, area, display_name, icon, equipment, capacity, price_general_30min, price_student_30min, features, description, is_active, reservation_unit_minutes) VALUES
('onpukan-a', 'おんぷ館', 'Aスタジオ', '🎹', 
 ARRAY['グランドピアノ（ヤマハC3X）', '椅子', '譜面台'], 
 2, 800, 550, 
 ARRAY['防音', '空調', 'グランドピアノ'], 
 'グランドピアノ - 個人練習専用（ピアノ、バイオリン、管楽器等）', 
 true, 30),

('onpukan-b', 'おんぷ館', 'Bスタジオ', '🎹', 
 ARRAY['アップライトピアノ', '椅子', '譜面台'], 
 2, 550, 330, 
 ARRAY['防音', '空調', 'ピアノ'], 
 'アップライトピアノ - 個人練習専用（ピアノ、バイオリン、管楽器等）※空き状況により別の部屋になる場合があります', 
 true, 30),

('onpukan-c', 'おんぷ館', 'Cスタジオ', '🎹', 
 ARRAY['ピアノ/電子ピアノ', '椅子', '譜面台'], 
 2, 550, 330, 
 ARRAY['防音', '空調', 'ピアノ/電子ピアノ'], 
 'ピアノ/電子ピアノ - 個人練習専用（ピアノ、バイオリン、管楽器等）※空き状況により別の部屋になる場合があります', 
 true, 30);

-- みどり楽器のAスタジオを挿入（1時間単位、個人/バンド料金）
INSERT INTO studios (id, area, display_name, icon, equipment, capacity, price_individual_60min, price_band_60min, features, description, is_active, reservation_unit_minutes) VALUES
('midori-a', 'みどり楽器', 'Aスタジオ', '🎸', 
 ARRAY['ドラムセット', 'アンプ', 'マイク'], 
 5, 700, 1800, 
 ARRAY['防音', '空調', 'ドラム・ギター対応'], 
 '個人練習（ドラム、ギター等）・バンド練習', 
 true, 60);
