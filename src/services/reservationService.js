import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { format } from 'date-fns';

/**
 * 予約番号を生成する
 * フォーマット: 6文字の英数字（例: A3K8M2）
 */
export const generateReservationNumber = async (date) => {
  // 英数字（大文字のみ、紛らわしい文字を除外）
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // I, O, 0, 1 を除外

  const generateCode = () => {
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  if (!isSupabaseConfigured()) {
    // ダミー予約番号（Supabase未設定時）
    return generateCode();
  }

  try {
    // ユニークな予約番号を生成（最大10回試行）
    for (let attempt = 0; attempt < 10; attempt++) {
      const code = generateCode();

      // 既存の予約番号と重複チェック
      const { data, error } = await supabase
        .from('reservations')
        .select('reservation_number')
        .eq('reservation_number', code)
        .maybeSingle();

      if (error) throw error;

      // 重複がなければそのコードを返す
      if (!data) {
        return code;
      }
    }

    // 10回試行しても重複した場合（稀）、タイムスタンプを含める
    const timestamp = Date.now().toString(36).toUpperCase().slice(-2);
    return generateCode().slice(0, 4) + timestamp;
  } catch (error) {
    console.error('予約番号生成エラー:', error);
    // エラー時はランダム生成
    return generateCode();
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

    // ブロックされているスタジオIDを取得
    const { data: blockedSlots, error: blockedError } = await supabase
      .from('blocked_slots')
      .select('studio_id')
      .eq('blocked_date', date)
      .lte('start_time', startTime + ':00')
      .gt('end_time', startTime + ':00');

    if (blockedError) throw blockedError;

    const total = studios?.length || 0;
    const occupied = reservations?.length || 0;
    const blocked = blockedSlots?.length || 0;
    const available = total - occupied - blocked;

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
 * 特定日時の各時間帯の空室状況を一括取得（30分単位）
 */
export const getAvailabilityByDate = async (area, date) => {
  const timeSlots = [
    '10:00-10:30',
    '10:30-11:00',
    '11:00-11:30',
    '11:30-12:00',
    '13:00-13:30',
    '13:30-14:00',
    '14:00-14:30',
    '14:30-15:00',
    '15:00-15:30',
    '15:30-16:00',
    '16:00-16:30',
    '16:30-17:00',
    '17:00-17:30',
    '17:30-18:00',
    '18:00-18:30',
    '18:30-19:00',
    '19:00-19:30',
    '19:30-20:00',
    '20:00-20:30',
    '20:30-21:00',
    '21:00-21:30',
    '21:30-22:00',
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

    // ブロックチェック：このスタジオ・日時がブロックされていないか確認
    const { data: blockedCheck, error: blockError } = await supabase
      .from('blocked_slots')
      .select('id')
      .eq('studio_id', studioId)
      .eq('blocked_date', date)
      .lte('start_time', startTime + ':00')
      .gt('end_time', startTime + ':00')
      .limit(1);

    if (blockError) throw blockError;

    if (blockedCheck && blockedCheck.length > 0) {
      return {
        success: false,
        error: 'BLOCKED_SLOT',
        message: 'この時間帯は予約できません（ブロック中）'
      };
    }

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
