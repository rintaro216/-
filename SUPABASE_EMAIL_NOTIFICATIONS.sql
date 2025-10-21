-- メール通知履歴テーブルの作成
CREATE TABLE IF NOT EXISTS email_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID REFERENCES reservations(id) ON DELETE CASCADE,
  notification_type VARCHAR(50) NOT NULL CHECK (notification_type IN ('confirmation', 'reminder', 'cancellation')),
  recipient_email VARCHAR(255) NOT NULL,
  recipient_name VARCHAR(100) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_email_notifications_reservation ON email_notifications(reservation_id);
CREATE INDEX idx_email_notifications_type ON email_notifications(notification_type);
CREATE INDEX idx_email_notifications_status ON email_notifications(status);
CREATE INDEX idx_email_notifications_sent_at ON email_notifications(sent_at);

-- RLSポリシー設定
ALTER TABLE email_notifications ENABLE ROW LEVEL SECURITY;

-- 管理者は全ての通知履歴を閲覧可能
CREATE POLICY "管理者の通知履歴閲覧を許可" ON email_notifications
  FOR SELECT
  USING (true);

-- 通知履歴の作成を許可
CREATE POLICY "通知履歴の作成を許可" ON email_notifications
  FOR INSERT
  WITH CHECK (true);

-- 通知履歴の更新を許可（リトライ用）
CREATE POLICY "通知履歴の更新を許可" ON email_notifications
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- メール送信関数（実際の送信はEdge Functionで行う）
-- この関数は通知履歴を記録し、Edge Functionを呼び出すトリガーとして機能
CREATE OR REPLACE FUNCTION send_reservation_email(
  p_reservation_id UUID,
  p_notification_type VARCHAR(50)
)
RETURNS VOID AS $$
DECLARE
  v_reservation RECORD;
  v_studio_name VARCHAR(100);
  v_area_name VARCHAR(100);
  v_subject VARCHAR(255);
  v_body TEXT;
BEGIN
  -- 予約情報を取得
  SELECT
    r.*,
    s.name as studio_name,
    s.area as area_name
  INTO v_reservation
  FROM reservations r
  LEFT JOIN studios s ON r.studio_id = s.id
  WHERE r.id = p_reservation_id;

  -- メールアドレスがない場合は送信しない
  IF v_reservation.customer_email IS NULL OR v_reservation.customer_email = '' THEN
    RETURN;
  END IF;

  -- 通知タイプに応じてメール内容を作成
  IF p_notification_type = 'confirmation' THEN
    v_subject := '【おんぷタイム】ご予約を受け付けました（予約番号: ' || v_reservation.reservation_number || '）';
    v_body :=
      v_reservation.customer_name || ' 様' || E'\n\n' ||
      'おんぷタイムをご利用いただき、ありがとうございます。' || E'\n' ||
      '以下の内容でご予約を受け付けました。' || E'\n\n' ||
      '━━━━━━━━━━━━━━━━━━━━' || E'\n' ||
      '■ 予約番号: ' || v_reservation.reservation_number || E'\n' ||
      '■ エリア: ' || v_reservation.area_name || E'\n' ||
      '■ スタジオ: ' || v_reservation.studio_name || E'\n' ||
      '■ 日時: ' || TO_CHAR(v_reservation.reservation_date, 'YYYY年MM月DD日(Dy)') || ' ' ||
        SUBSTRING(v_reservation.start_time::TEXT FROM 1 FOR 5) || '～' ||
        SUBSTRING(v_reservation.end_time::TEXT FROM 1 FOR 5) || E'\n' ||
      '■ 利用区分: ' || CASE WHEN v_reservation.user_type = 'student' THEN '生徒' ELSE '一般' END || E'\n' ||
      '■ 料金: ' || v_reservation.price || '円（当日現金払い）' || E'\n' ||
      '━━━━━━━━━━━━━━━━━━━━' || E'\n\n' ||
      '【ご来店について】' || E'\n' ||
      '・ご予約時間の5分前までにお越しください' || E'\n' ||
      '・お支払いは受付にて現金でお願いします' || E'\n\n' ||
      '【キャンセルについて】' || E'\n' ||
      '・キャンセルは予約の24時間前まで可能です' || E'\n' ||
      '・予約確認ページ: https://onpu-time.example.com/reservation/check' || E'\n' ||
      '・予約番号: ' || v_reservation.reservation_number || E'\n' ||
      '・お電話番号: ' || v_reservation.customer_phone || E'\n\n' ||
      'ご不明な点がございましたら、お気軽にお問い合わせください。' || E'\n\n' ||
      'おんぷタイム';

  ELSIF p_notification_type = 'reminder' THEN
    v_subject := '【おんぷタイム】明日のご予約について（予約番号: ' || v_reservation.reservation_number || '）';
    v_body :=
      v_reservation.customer_name || ' 様' || E'\n\n' ||
      '明日のスタジオご予約についてお知らせいたします。' || E'\n\n' ||
      '━━━━━━━━━━━━━━━━━━━━' || E'\n' ||
      '■ 予約番号: ' || v_reservation.reservation_number || E'\n' ||
      '■ エリア: ' || v_reservation.area_name || E'\n' ||
      '■ スタジオ: ' || v_reservation.studio_name || E'\n' ||
      '■ 日時: ' || TO_CHAR(v_reservation.reservation_date, 'YYYY年MM月DD日(Dy)') || ' ' ||
        SUBSTRING(v_reservation.start_time::TEXT FROM 1 FOR 5) || '～' ||
        SUBSTRING(v_reservation.end_time::TEXT FROM 1 FOR 5) || E'\n' ||
      '■ 料金: ' || v_reservation.price || '円（当日現金払い）' || E'\n' ||
      '━━━━━━━━━━━━━━━━━━━━' || E'\n\n' ||
      'ご予約時間の5分前までにお越しください。' || E'\n' ||
      'お待ちしております！' || E'\n\n' ||
      'おんぷタイム';

  ELSIF p_notification_type = 'cancellation' THEN
    v_subject := '【おんぷタイム】ご予約をキャンセルしました（予約番号: ' || v_reservation.reservation_number || '）';
    v_body :=
      v_reservation.customer_name || ' 様' || E'\n\n' ||
      '以下の予約をキャンセルいたしました。' || E'\n\n' ||
      '━━━━━━━━━━━━━━━━━━━━' || E'\n' ||
      '■ 予約番号: ' || v_reservation.reservation_number || E'\n' ||
      '■ エリア: ' || v_reservation.area_name || E'\n' ||
      '■ スタジオ: ' || v_reservation.studio_name || E'\n' ||
      '■ 日時: ' || TO_CHAR(v_reservation.reservation_date, 'YYYY年MM月DD日(Dy)') || ' ' ||
        SUBSTRING(v_reservation.start_time::TEXT FROM 1 FOR 5) || '～' ||
        SUBSTRING(v_reservation.end_time::TEXT FROM 1 FOR 5) || E'\n' ||
      '━━━━━━━━━━━━━━━━━━━━' || E'\n\n' ||
      'またのご利用をお待ちしております。' || E'\n\n' ||
      'おんぷタイム';
  END IF;

  -- 通知履歴を記録
  INSERT INTO email_notifications (
    reservation_id,
    notification_type,
    recipient_email,
    recipient_name,
    subject,
    body,
    status
  ) VALUES (
    p_reservation_id,
    p_notification_type,
    v_reservation.customer_email,
    v_reservation.customer_name,
    v_subject,
    v_body,
    'pending'  -- 実際の送信は別プロセスで行う
  );

  -- TODO: ここで実際のメール送信処理を呼び出す（Edge Function等）
  -- 現在はログのみ記録し、後でバッチ処理で送信する想定

EXCEPTION
  WHEN OTHERS THEN
    -- エラーが発生した場合もログに記録
    INSERT INTO email_notifications (
      reservation_id,
      notification_type,
      recipient_email,
      recipient_name,
      subject,
      body,
      status,
      error_message
    ) VALUES (
      p_reservation_id,
      p_notification_type,
      COALESCE(v_reservation.customer_email, 'unknown'),
      COALESCE(v_reservation.customer_name, 'unknown'),
      'Error',
      'Error occurred',
      'failed',
      SQLERRM
    );
END;
$$ LANGUAGE plpgsql;

-- 予約作成時に確認メールを送信するトリガー
CREATE OR REPLACE FUNCTION trigger_send_confirmation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- 予約が作成され、メールアドレスがある場合のみ送信
  IF NEW.status = 'confirmed' AND NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
    PERFORM send_reservation_email(NEW.id, 'confirmation');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_reservation_insert
AFTER INSERT ON reservations
FOR EACH ROW
EXECUTE FUNCTION trigger_send_confirmation_email();

-- 予約キャンセル時に通知メールを送信するトリガー
CREATE OR REPLACE FUNCTION trigger_send_cancellation_email()
RETURNS TRIGGER AS $$
BEGIN
  -- ステータスがcancelledに変更された場合のみ送信
  IF OLD.status != 'cancelled' AND NEW.status = 'cancelled' AND NEW.customer_email IS NOT NULL AND NEW.customer_email != '' THEN
    PERFORM send_reservation_email(NEW.id, 'cancellation');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER after_reservation_update
AFTER UPDATE ON reservations
FOR EACH ROW
EXECUTE FUNCTION trigger_send_cancellation_email();

-- 前日リマインダーを送信する関数（Cron Jobで定期実行）
CREATE OR REPLACE FUNCTION send_reminder_emails()
RETURNS VOID AS $$
DECLARE
  v_reservation RECORD;
BEGIN
  -- 明日の予約を取得
  FOR v_reservation IN
    SELECT id
    FROM reservations
    WHERE reservation_date = CURRENT_DATE + INTERVAL '1 day'
      AND status = 'confirmed'
      AND customer_email IS NOT NULL
      AND customer_email != ''
      -- 既にリマインダーを送信していない予約のみ
      AND NOT EXISTS (
        SELECT 1 FROM email_notifications
        WHERE reservation_id = reservations.id
          AND notification_type = 'reminder'
      )
  LOOP
    PERFORM send_reservation_email(v_reservation.id, 'reminder');
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- pg_cronを使って毎日18:00にリマインダーを送信
-- ※pg_cron拡張が有効な場合のみ動作します
-- SELECT cron.schedule('send-daily-reminders', '0 18 * * *', 'SELECT send_reminder_emails();');
