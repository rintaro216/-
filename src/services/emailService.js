import { supabase } from '../lib/supabase';

/**
 * メール送信サービス
 *
 * 注意: このサービスは現在、メール送信履歴をデータベースに記録するのみです。
 * 実際のメール送信には以下のいずれかの方法が必要です:
 *
 * 1. Supabase Edge Functions + Resend/SendGrid
 * 2. 外部メール送信API（Resend, SendGrid, AWS SES等）
 * 3. サーバーサイドのバックエンド
 *
 * Phase 1では、管理画面で送信履歴を確認できる機能を提供します。
 */

/**
 * メール送信履歴を取得
 */
export const getEmailNotifications = async (filters = {}) => {
  try {
    let query = supabase
      .from('email_notifications')
      .select(`
        *,
        reservations (
          reservation_number,
          reservation_date,
          start_time,
          customer_name
        )
      `)
      .order('sent_at', { ascending: false });

    // フィルタリング
    if (filters.reservationId) {
      query = query.eq('reservation_id', filters.reservationId);
    }

    if (filters.notificationType) {
      query = query.eq('notification_type', filters.notificationType);
    }

    if (filters.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('メール通知履歴取得エラー:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 特定の予約のメール通知履歴を取得
 */
export const getReservationEmails = async (reservationId) => {
  return getEmailNotifications({ reservationId });
};

/**
 * メール送信統計を取得
 */
export const getEmailStatistics = async () => {
  try {
    // 送信成功数
    const { count: sentCount } = await supabase
      .from('email_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'sent');

    // 送信失敗数
    const { count: failedCount } = await supabase
      .from('email_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'failed');

    // 送信待ち数
    const { count: pendingCount } = await supabase
      .from('email_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending');

    // タイプ別の集計
    const { data: typeStats } = await supabase
      .from('email_notifications')
      .select('notification_type')
      .eq('status', 'sent');

    const typeCounts = {
      confirmation: 0,
      reminder: 0,
      cancellation: 0
    };

    typeStats?.forEach(item => {
      typeCounts[item.notification_type] = (typeCounts[item.notification_type] || 0) + 1;
    });

    return {
      success: true,
      data: {
        sent: sentCount || 0,
        failed: failedCount || 0,
        pending: pendingCount || 0,
        byType: typeCounts
      }
    };
  } catch (error) {
    console.error('メール統計取得エラー:', error);
    return { success: false, error: error.message };
  }
};

/**
 * メール送信履歴を手動で作成（テスト用）
 * 実際の送信は行わず、データベースに記録のみ
 */
export const createEmailNotification = async (notificationData) => {
  try {
    const { data, error } = await supabase
      .from('email_notifications')
      .insert([{
        reservation_id: notificationData.reservationId,
        notification_type: notificationData.type,
        recipient_email: notificationData.email,
        recipient_name: notificationData.name,
        subject: notificationData.subject,
        body: notificationData.body,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('メール通知作成エラー:', error);
    return { success: false, error: error.message };
  }
};

/**
 * メール送信ステータスを更新
 */
export const updateEmailStatus = async (notificationId, status, errorMessage = null) => {
  try {
    const updateData = { status };
    if (errorMessage) {
      updateData.error_message = errorMessage;
    }

    const { data, error } = await supabase
      .from('email_notifications')
      .update(updateData)
      .eq('id', notificationId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('メール送信ステータス更新エラー:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 送信待ちメールを処理（バッチ処理用）
 * 実際のメール送信APIと連携する場合に使用
 */
export const processPendingEmails = async () => {
  try {
    const { data: pendingEmails } = await supabase
      .from('email_notifications')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(10); // 一度に10件まで処理

    if (!pendingEmails || pendingEmails.length === 0) {
      return { success: true, processed: 0 };
    }

    let successCount = 0;
    let failCount = 0;

    for (const email of pendingEmails) {
      try {
        // TODO: ここで実際のメール送信APIを呼び出す
        // 例: await sendEmailViaAPI(email);

        // 現在は送信成功として記録
        await updateEmailStatus(email.id, 'sent');
        successCount++;
      } catch (error) {
        await updateEmailStatus(email.id, 'failed', error.message);
        failCount++;
      }
    }

    return {
      success: true,
      processed: successCount + failCount,
      successful: successCount,
      failed: failCount
    };
  } catch (error) {
    console.error('メール処理エラー:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 手動でリマインダーメールをトリガー（管理画面用）
 */
export const triggerReminderEmail = async (reservationId) => {
  try {
    // Supabaseの関数を呼び出し
    const { data, error } = await supabase.rpc('send_reservation_email', {
      p_reservation_id: reservationId,
      p_notification_type: 'reminder'
    });

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('リマインダー送信エラー:', error);
    return { success: false, error: error.message };
  }
};
