import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaCalendarAlt, FaClock, FaMusic, FaUser, FaPhone, FaMapMarkerAlt, FaArrowLeft, FaExclamationTriangle } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { format, parseISO, differenceInHours } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function ReservationCheck() {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({
    reservationNumber: '',
    phoneNumber: ''
  });
  const [reservation, setReservation] = useState(null);
  const [studio, setStudio] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  // 予約検索
  const handleSearch = async (e) => {
    e.preventDefault();
    setError('');
    setReservation(null);
    setStudio(null);

    if (!searchForm.reservationNumber || !searchForm.phoneNumber) {
      setError('予約番号と電話番号を入力してください');
      return;
    }

    setLoading(true);

    try {
      // 予約を検索
      const { data: reservationData, error: reservationError } = await supabase
        .from('reservations')
        .select('*')
        .eq('reservation_number', searchForm.reservationNumber)
        .eq('customer_phone', searchForm.phoneNumber)
        .single();

      if (reservationError) {
        console.error('検索エラー詳細:', reservationError);
        setError('予約が見つかりませんでした。予約番号と電話番号を確認してください。');
        setLoading(false);
        return;
      }

      if (!reservationData) {
        setError('予約が見つかりませんでした。予約番号と電話番号を確認してください。');
        setLoading(false);
        return;
      }

      // スタジオ情報を取得
      const { data: studioData } = await supabase
        .from('studios')
        .select('*')
        .eq('id', reservationData.studio_id)
        .single();

      setReservation(reservationData);
      setStudio(studioData);
    } catch (err) {
      console.error('検索エラー:', err);
      setError('検索中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // キャンセル可能かチェック
  const canCancel = () => {
    if (!reservation || reservation.status === 'cancelled') return false;

    const reservationDateTime = parseISO(`${reservation.reservation_date}T${reservation.start_time}`);
    const now = new Date();
    const hoursUntilReservation = differenceInHours(reservationDateTime, now);

    // 予約日時の24時間前までキャンセル可能
    return hoursUntilReservation >= 24;
  };

  // キャンセル処理
  const handleCancel = async () => {
    if (!reservation) return;

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('reservation_number', reservation.reservation_number);

      if (updateError) throw updateError;

      // 予約情報を更新
      setReservation({ ...reservation, status: 'cancelled' });
      setShowCancelModal(false);
      alert('予約をキャンセルしました。');
    } catch (err) {
      console.error('キャンセルエラー:', err);
      setError('キャンセル処理中にエラーが発生しました。');
    } finally {
      setLoading(false);
    }
  };

  // ステータス表示
  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { text: '予約確定', color: 'bg-green-500' },
      pending: { text: '予約待ち', color: 'bg-yellow-500' },
      cancelled: { text: 'キャンセル済み', color: 'bg-red-500' }
    };
    const badge = badges[status] || { text: status, color: 'bg-gray-500' };
    return (
      <span className={`${badge.color} text-white px-3 py-1 rounded-full text-sm font-bold`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-primary-green hover:text-green-600 transition mb-2"
          >
            <FaArrowLeft className="mr-2" />
            トップに戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-800">予約確認・キャンセル</h1>
          <p className="text-sm text-gray-600">ご予約内容の確認とキャンセルができます</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* 検索フォーム */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <FaSearch className="mr-2 text-primary-green" />
            予約を検索
          </h2>

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                予約番号
              </label>
              <input
                type="text"
                value={searchForm.reservationNumber}
                onChange={(e) => setSearchForm({ ...searchForm, reservationNumber: e.target.value.toUpperCase() })}
                placeholder="例: A3K8M2"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">6桁の英数字を入力してください</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                電話番号
              </label>
              <input
                type="tel"
                value={searchForm.phoneNumber}
                onChange={(e) => setSearchForm({ ...searchForm, phoneNumber: e.target.value.replace(/[^0-9]/g, '') })}
                placeholder="例: 09012345678"
                maxLength={11}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-green focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">ハイフンなしで入力してください</p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-start">
                <FaExclamationTriangle className="mr-2 mt-0.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-green text-white py-3 rounded-lg font-bold hover:bg-green-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>処理中...</>
              ) : (
                <>
                  <FaSearch className="mr-2" />
                  予約を検索
                </>
              )}
            </button>
          </form>
        </div>

        {/* 予約詳細 */}
        {reservation && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">予約詳細</h2>
              {getStatusBadge(reservation.status)}
            </div>

            <div className="space-y-4">
              {/* 予約番号 */}
              <div className="border-b pb-4">
                <p className="text-sm text-gray-600 mb-1">予約番号</p>
                <p className="font-mono font-bold text-lg text-primary-green">
                  {reservation.reservation_number}
                </p>
              </div>

              {/* 日時 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <FaCalendarAlt className="mr-2 text-primary-orange" />
                    予約日
                  </p>
                  <p className="font-bold text-gray-800">
                    {format(parseISO(reservation.reservation_date), 'yyyy年M月d日(E)', { locale: ja })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <FaClock className="mr-2 text-primary-orange" />
                    時間
                  </p>
                  <p className="font-bold text-gray-800">
                    {reservation.start_time.substring(0, 5)} 〜 {reservation.end_time.substring(0, 5)}
                  </p>
                </div>
              </div>

              {/* スタジオ */}
              {studio && (
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center">
                    <FaMusic className="mr-2 text-primary-green" />
                    スタジオ
                  </p>
                  <p className="font-bold text-gray-800">{studio.display_name}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <FaMapMarkerAlt className="mr-2" />
                    {reservation.area}
                  </p>
                </div>
              )}

              {/* 予約者情報 */}
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <p className="font-bold text-gray-800 mb-2 flex items-center">
                  <FaUser className="mr-2 text-primary-green" />
                  予約者情報
                </p>
                <div>
                  <p className="text-sm text-gray-600">お名前</p>
                  <p className="font-bold text-gray-800">{reservation.customer_name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 flex items-center">
                    <FaPhone className="mr-2" />
                    電話番号
                  </p>
                  <p className="font-bold text-gray-800">{reservation.customer_phone}</p>
                </div>
              </div>

              {/* 備考 */}
              {reservation.notes && (
                <div>
                  <p className="text-sm text-gray-600 mb-1">備考</p>
                  <p className="text-gray-800 whitespace-pre-wrap bg-gray-50 p-3 rounded-lg">
                    {reservation.notes}
                  </p>
                </div>
              )}

              {/* キャンセルボタン */}
              {reservation.status !== 'cancelled' && (
                <div className="pt-4 border-t">
                  {canCancel() ? (
                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="w-full bg-red-500 text-white py-3 rounded-lg font-bold hover:bg-red-600 transition"
                    >
                      この予約をキャンセルする
                    </button>
                  ) : (
                    <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                      <p className="font-bold mb-1">キャンセルできません</p>
                      <p className="text-sm">
                        予約日時の24時間前を過ぎているため、キャンセルできません。
                        キャンセルが必要な場合は、お電話にてご連絡ください。
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* キャンセル確認モーダル */}
      {showCancelModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-4">予約をキャンセルしますか？</h3>
            <p className="text-gray-600 mb-6">
              この操作は取り消せません。本当にキャンセルしてもよろしいですか？
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowCancelModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg font-bold text-gray-700 hover:bg-gray-50 transition"
              >
                戻る
              </button>
              <button
                onClick={handleCancel}
                disabled={loading}
                className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition disabled:opacity-50"
              >
                {loading ? 'キャンセル中...' : 'キャンセルする'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
