-- みどり楽器Aスタジオの営業時間設定（土日 10:00-19:00のみ）

-- 既存のみどり楽器の曜日別ブロック設定を削除
DELETE FROM weekly_blocked_slots WHERE studio_id = 'midori-a';

-- 月曜日: 終日利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'midori-a', 1, generate_series(0, 25);

-- 火曜日: 終日利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'midori-a', 2, generate_series(0, 25);

-- 水曜日: 終日利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'midori-a', 3, generate_series(0, 25);

-- 木曜日: 終日利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'midori-a', 4, generate_series(0, 25);

-- 金曜日: 終日利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'midori-a', 5, generate_series(0, 25);

-- 土曜日: 9:00-10:00と19:00-22:00を利用不可
-- 10:00-19:00のみ営業
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'midori-a', 6, generate_series(0, 1)  -- 9:00-10:00
UNION ALL
SELECT 'midori-a', 6, generate_series(20, 25);  -- 19:00-22:00

-- 日曜日: 9:00-10:00と19:00-22:00を利用不可
-- 10:00-19:00のみ営業
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'midori-a', 0, generate_series(0, 1)  -- 9:00-10:00
UNION ALL
SELECT 'midori-a', 0, generate_series(20, 25);  -- 19:00-22:00
