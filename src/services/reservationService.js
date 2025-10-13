import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { format } from 'date-fns';

/**
 * 予約番号を生成する
 * フォーマット: OP-YYYYMMDD-XXX
 */
export const generateReservationNumber = async (date) => {
  const dateStr = format(new Date(date), 'yyyyMMdd');

  if (!isSupabaseConfigured()) {
    // ダミー予約番号（Supabase未設定時）
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `OP-${dateStr}-${random}`;
  }

  try {
    // 同じ日付の予約数を取得
    const { count, error } = await supabase
      .from('reservations')
      .select('*', { count: 'exact', head: true })
      .eq('reservation_date', date);

    if (error) throw error;

    const nextNumber = ((count || 0) + 1).toString().padStart(3, '0');
    return `OP-${dateStr}-${nextNumber}`;
  } catch (error) {
    console.error('予約番号生成エラー:', error);
    // エラー時はランダム生成
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `OP-${dateStr}-${random}`;
  }
};

/**
 * 特定日時のスタジオ空室状況を取得
 */
export const checkAvailability = async (area, date, timeRange) => {
  if (!isSupabaseConfigured()) {
    // ダミーデータ（Supabase未設定時）
    return {
      available: 7,
      total: 10,
      status: 'available'
    };
  }

  try {
    const [startTime, endTime] = timeRange.split('-');

    // その日時に予約済みのスタジオIDを取得
    const { data: reservations, error } = await supabase
      .from('reservations')
      .select('studio_id')
      .eq('reservation_date', date)
      .eq('start_time', startTime + ':00')
      .eq('status', 'confirmed');

    if (error) throw error;

    // そのエリアの全スタジオ数を取得
    const { data: studios, error: studioError } = await supabase
      .from('studios')
      .select('id')
      .eq('area', area)
      .eq('is_active', true);

    if (studioError) throw studioError;

    const total = studios?.length || 0;
    const occupied = reservations?.length || 0;
    const available = total - occupied;

    let status = 'available';
    if (available === 0) status = 'occupied';
    else if (available <= 2) status = 'limited';

    return { available, total, status };
  } catch (error) {
    console.error('空室確認エラー:', error);
    // エラー時はダミーデータ
    return {
      available: 7,
      total: 10,
      status: 'available'
    };
  }
};

/**
 * 特定日時の各時間帯の空室状況を一括取得
 */
export const getAvailabilityByDate = async (area, date) => {
  const timeSlots = [
    '10:00-11:00',
    '11:00-12:00',
    '13:00-14:00',
    '14:00-15:00',
    '15:00-16:00',
    '16:00-17:00',
    '17:00-18:00',
    '18:00-19:00',
    '19:00-20:00',
  ];

  if (!isSupabaseConfigured()) {
    // ダミーデータ
    return timeSlots.map((time, index) => ({
      time,
      available: [7, 5, 6, 2, 0, 4, 3, 4, 6][index],
      status: index === 4 ? 'occupied' : index === 3 ? 'limited' : 'available'
    }));
  }

  try {
    const results = await Promise.all(
      timeSlots.map(async (timeRange) => {
        const availability = await checkAvailability(area, date, timeRange);
        return {
          time: timeRange,
          ...availability
        };
      })
    );

    return results;
  } catch (error) {
    console.error('空室一括取得エラー:', error);
    // エラー時はダミーデータ
    return timeSlots.map((time, index) => ({
      time,
      available: 5,
      status: 'available'
    }));
  }
};

/**
 * 予約を作成
 */
export const createReservation = async (reservationData) => {
  const {
    area,
    studioId,
    date,
    timeRange,
    userType,
    customerName,
    customerPhone,
    customerEmail,
    price
  } = reservationData;

  // 予約番号を生成
  const reservationNumber = await generateReservationNumber(date);

  if (!isSupabaseConfigured()) {
    // Supabase未設定時はダミーレスポンス
    console.warn('⚠️ Supabase未設定のため、予約はデータベースに保存されません');
    return {
      success: true,
      reservationNumber,
      message: 'プロトタイプモード: 予約データは保存されていません'
    };
  }

  try {
    const [startTime, endTime] = timeRange.split('-');

    const { data, error } = await supabase
      .from('reservations')
      .insert([
        {
          reservation_number: reservationNumber,
          area,
          studio_id: studioId,
          reservation_date: date,
          start_time: startTime + ':00',
          end_time: endTime + ':00',
          user_type: userType,
          customer_name: customerName,
          customer_phone: customerPhone,
          customer_email: customerEmail || null,
          price: price,
          status: 'confirmed'
        }
      ])
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      reservationNumber,
      data,
      message: '予約が完了しました'
    };
  } catch (error) {
    console.error('予約作成エラー:', error);
    return {
      success: false,
      error: error.message,
      message: '予約の作成に失敗しました'
    };
  }
};

/**
 * 予約をキャンセル
 */
export const cancelReservation = async (reservationNumber) => {
  if (!isSupabaseConfigured()) {
    console.warn('⚠️ Supabase未設定');
    return {
      success: false,
      message: 'Supabase未設定'
    };
  }

  try {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString()
      })
      .eq('reservation_number', reservationNumber)
      .select()
      .single();

    if (error) throw error;

    return {
      success: true,
      data,
      message: 'キャンセルが完了しました'
    };
  } catch (error) {
    console.error('キャンセルエラー:', error);
    return {
      success: false,
      error: error.message,
      message: 'キャンセルに失敗しました'
    };
  }
};
