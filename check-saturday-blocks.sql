-- 土曜日（day_of_week = 6）のブロック設定を確認
SELECT
  id,
  studio_id,
  day_of_week,
  start_time,
  end_time,
  reason
FROM weekly_blocked_slots
WHERE day_of_week = 6
ORDER BY studio_id, start_time;

-- 直近の土曜日の個別ブロック設定も確認
SELECT
  id,
  studio_id,
  blocked_date,
  start_time,
  end_time,
  reason
FROM blocked_slots
WHERE blocked_date >= CURRENT_DATE
  AND EXTRACT(DOW FROM blocked_date) = 6
ORDER BY blocked_date, start_time;
