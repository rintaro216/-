-- おんぷ館の曜日別営業時間設定（空き状況表から）

-- 既存のおんぷ館の曜日別ブロック設定を削除
DELETE FROM weekly_blocked_slots WHERE studio_id IN ('onpukan-a', 'onpukan-b', 'onpukan-c');

-- Aスタジオ（グランドピアノ）の利用不可時間帯
-- 月曜日: 9:00-19:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-a', 1, generate_series(0, 19);

-- 火曜日: 9:00-20:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-a', 2, generate_series(0, 21);

-- 水曜日: 9:00-20:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-a', 3, generate_series(0, 21);

-- 木曜日: 9:00-20:00まで利用不可（第2,4週の10:30-12:30は別途管理）
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-a', 4, generate_series(0, 21);

-- 金曜日: 9:00-10:30, 15:00-20:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-a', 5, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-a', 5, generate_series(11, 21);

-- 土曜日: 17:00以降相談のため、17:00-22:00を利用不可に設定
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-a', 6, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-a', 6, generate_series(16, 25);

-- 日曜日: 隔週のため個別設定（基本的にブロックなし）

-- Bスタジオ（アップライトピアノ）の利用不可時間帯
-- 月曜日: 9:00-10:30, 14:00-20:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-b', 1, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-b', 1, generate_series(9, 21);

-- 火曜日: 9:00-10:30, 14:00-20:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-b', 2, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-b', 2, generate_series(9, 21);

-- 水曜日: 9:00-10:30, 14:00-20:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-b', 3, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-b', 3, generate_series(9, 21);

-- 木曜日: 9:00-10:30, 14:00-20:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-b', 4, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-b', 4, generate_series(9, 21);

-- 金曜日: 9:00-10:30, 14:00-19:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-b', 5, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-b', 5, generate_series(9, 19);

-- 土曜日: 9:00-10:30, 17:00-22:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-b', 6, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-b', 6, generate_series(16, 25);

-- 日曜日: 9:00-10:30, 14:00-22:00まで利用不可
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-b', 0, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-b', 0, generate_series(9, 25);

-- Cスタジオ（ピアノ/電子ピアノ）の利用不可時間帯（Bと同じ設定）
-- 月曜日
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-c', 1, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-c', 1, generate_series(9, 21);

-- 火曜日
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-c', 2, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-c', 2, generate_series(9, 21);

-- 水曜日
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-c', 3, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-c', 3, generate_series(9, 21);

-- 木曜日
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-c', 4, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-c', 4, generate_series(9, 21);

-- 金曜日
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-c', 5, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-c', 5, generate_series(9, 19);

-- 土曜日
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-c', 6, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-c', 6, generate_series(16, 25);

-- 日曜日
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, time_slot_index)
SELECT 'onpukan-c', 0, generate_series(0, 2)
UNION ALL
SELECT 'onpukan-c', 0, generate_series(9, 25);
