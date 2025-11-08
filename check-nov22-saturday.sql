-- 11月22日（土）のmidori-aの状況を詳細確認

-- 1. この日の予約状況
SELECT
  reservation_number,
  studio_id,
  reservation_date,
  start_time,
  end_time,
  status,
  customer_name
FROM reservations
WHERE reservation_date = '2025-11-22'
  AND studio_id = 'midori-a'
ORDER BY start_time;

-- 2. この日の個別ブロック設定
SELECT
  id,
  studio_id,
  blocked_date,
  start_time,
  end_time,
  reason,
  reason_category
FROM blocked_slots
WHERE blocked_date = '2025-11-22'
  AND studio_id = 'midori-a'
ORDER BY start_time;

-- 3. 土曜日の定期ブロック設定（再確認）
SELECT
  id,
  studio_id,
  day_of_week,
  start_time,
  end_time,
  reason
FROM weekly_blocked_slots
WHERE day_of_week = 6
  AND studio_id = 'midori-a'
ORDER BY start_time;

-- 4. midori-aのスタジオ情報
SELECT
  id,
  area,
  display_name,
  is_active
FROM studios
WHERE id = 'midori-a';
