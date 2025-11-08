-- おんぷ館の曜日別営業時間設定（空き状況表から）
-- 空き時間以外をブロックする設定

-- 既存のおんぷ館の曜日別ブロック設定を削除
DELETE FROM weekly_blocked_slots WHERE studio_id IN ('onpukan-a', 'onpukan-b', 'onpukan-c');

-- ===================================
-- Aスタジオ（グランドピアノ）
-- ===================================

-- 月曜日: 空き 19:00以降 → ブロック 09:00-19:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES ('onpukan-a', 1, '09:00', '19:00', 'レッスン時間');

-- 火曜日: 空き 20時以降 → ブロック 09:00-20:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES ('onpukan-a', 2, '09:00', '20:00', 'レッスン時間');

-- 水曜日: 空き 20時以降 → ブロック 09:00-20:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES ('onpukan-a', 3, '09:00', '20:00', 'レッスン時間');

-- 木曜日: 空き 第2,4 10:30-12:30, 20時以降 → ブロック 09:00-10:30, 12:30-20:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-a', 4, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-a', 4, '12:30', '20:00', 'レッスン時間');

-- 金曜日: 空き 10:30-15:00, 20時以降 → ブロック 09:00-10:30, 15:00-20:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-a', 5, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-a', 5, '15:00', '20:00', 'レッスン時間');

-- 土曜日: 空き 10:30-17:00, 17時以降要相談 → ブロック 09:00-10:30, 17:00-22:00（相談）
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-a', 6, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-a', 6, '17:00', '22:00', '要相談');

-- 日曜日: 隔週空き開あり → ブロックなし（個別管理）

-- ===================================
-- Bスタジオ（アップライトピアノ）
-- ===================================

-- 月曜日: 空き 10:30-14:00 → ブロック 09:00-10:30, 14:00-22:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-b', 1, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-b', 1, '14:00', '22:00', 'レッスン時間');

-- 火曜日: 空き 10:30-14:00 → ブロック 09:00-10:30, 14:00-22:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-b', 2, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-b', 2, '14:00', '22:00', 'レッスン時間');

-- 水曜日: NG → 全時間ブロック
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES ('onpukan-b', 3, '09:00', '22:00', '定休日');

-- 木曜日: NG → 全時間ブロック
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES ('onpukan-b', 4, '09:00', '22:00', '定休日');

-- 金曜日: 空き 10:30-14:00, 19:00以降 → ブロック 09:00-10:30, 14:00-19:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-b', 5, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-b', 5, '14:00', '19:00', 'レッスン時間');

-- 土曜日: 1日空 → ブロックなし

-- 日曜日: 2日空 → ブロックなし（隔週管理）

-- ===================================
-- Cスタジオ（アップライトピアノ）
-- ===================================

-- 月曜日: 空き 10:30-14:00, 20時以降 → ブロック 09:00-10:30, 14:00-20:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-c', 1, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-c', 1, '14:00', '20:00', 'レッスン時間');

-- 火曜日: 空き 10:30-14:00, 20時以降 → ブロック 09:00-10:30, 14:00-20:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-c', 2, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-c', 2, '14:00', '20:00', 'レッスン時間');

-- 水曜日: 空き 10:30-14:00, 20時以降 → ブロック 09:00-10:30, 14:00-20:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-c', 3, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-c', 3, '14:00', '20:00', 'レッスン時間');

-- 木曜日: 空き 10:30-14:00 → ブロック 09:00-10:30, 14:00-22:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-c', 4, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-c', 4, '14:00', '22:00', 'レッスン時間');

-- 金曜日: 空き 10:30-14:00, 20時以降 → ブロック 09:00-10:30, 14:00-20:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES
  ('onpukan-c', 5, '09:00', '10:30', 'レッスン時間'),
  ('onpukan-c', 5, '14:00', '20:00', 'レッスン時間');

-- 土曜日: 空き 17時以降要相談 → ブロック 09:00-17:00
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES ('onpukan-c', 6, '09:00', '17:00', 'レッスン時間');

-- 日曜日: NG → 全時間ブロック
INSERT INTO weekly_blocked_slots (studio_id, day_of_week, start_time, end_time, reason)
VALUES ('onpukan-c', 0, '09:00', '22:00', '定休日');
