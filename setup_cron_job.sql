-- リマインダー自動送信のCron Job設定
-- 毎日夜8時（JST 20:00 = UTC 11:00）に実行

-- 1. 必要な拡張機能を有効化
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 2. 既存のCron Jobがあれば削除
SELECT cron.unschedule('daily-reservation-reminders');

-- 3. 毎日UTC 11:00（JST 20:00）にリマインダーを送信するCron Jobを設定
SELECT cron.schedule(
  'daily-reservation-reminders',  -- Job名
  '0 11 * * *',  -- Cron式: 毎日UTC 11:00 = JST 20:00
  $$
  SELECT
    net.http_post(
      url:='https://vnvqgdfxilrlquwzqhba.supabase.co/functions/v1/send-daily-reminders',
      headers:=jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZudnFnZGZ4aWxybHF1d3pxaGJhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNzI3NjQ5MCwiZXhwIjoyMDUyODUyNDkwfQ.Q7D2IaG9PumT2cR08gRbNMGTaKi5D_M3SnpQcYGcP2I'
      ),
      body:='{}'::jsonb
    ) AS request_id;
  $$
);

-- 4. 設定されたCron Jobを確認
SELECT * FROM cron.job WHERE jobname = 'daily-reservation-reminders';
