/**
 * LINE Messaging API通知サービス（Supabase Edge Function経由）
 */

const EDGE_FUNCTION_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-line-notification`;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

async function sendLineNotification(lineUserId, notificationType, data) {
  if (!lineUserId) {
    console.log('LINE User IDが未設定のため通知をスキップ');
    return { success: false, error: 'No LINE User ID' };
  }

  try {
    const response = await fetch(EDGE_FUNCTION_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
      },
      body: JSON.stringify({
        lineUserId,
        notificationType,
        data
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('LINE通知エラー:', error);
      return { success: false, error };
    }

    const result = await response.json();
    console.log('LINE通知送信成功:', result);
    return { success: true };
  } catch (error) {
    console.error('LINE通知送信失敗:', error);
    return { success: false, error };
  }
}

export async function sendReservationConfirmation(lineUserId, reservation) {
  return await sendLineNotification(lineUserId, 'reservation', reservation);
}

export async function sendCancellationNotification(lineUserId, reservation) {
  return await sendLineNotification(lineUserId, 'cancellation', reservation);
}

export async function sendReservationReminder(lineUserId, reservation) {
  return await sendLineNotification(lineUserId, 'reminder', reservation);
}

export async function sendAnnouncementToGroup(announcement) {
  console.log('お知らせグループ通知:', announcement);
  return { success: true };
}

export async function sendBulkReminders(notifications) {
  const results = [];
  for (const { lineUserId, reservation } of notifications) {
    const result = await sendReservationReminder(lineUserId, reservation);
    results.push({
      reservationNumber: reservation.reservation_number,
      success: result.success
    });
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  return results;
}

export function getLineFriendQRCodeUrl() {
  const lineOfficialId = import.meta.env.VITE_LINE_OFFICIAL_ID;
  if (!lineOfficialId) {
    return null;
  }
  return `https://line.me/R/ti/p/${lineOfficialId.replace('@', '%40')}`;
}
