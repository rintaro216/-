import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { FaArrowLeft, FaSearch, FaTrash, FaCalendarAlt, FaClock, FaMusic, FaUser, FaPhone } from 'react-icons/fa';

export default function ReservationManagement() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterArea, setFilterArea] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  // 予約データを取得
  useEffect(() => {
    fetchReservations();
  }, []);

  // フィルタリング
  useEffect(() => {
    filterReservations();
  }, [reservations, searchTerm, filterDate, filterArea, filterStatus]);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('reservations')
        .select('*')
        .order('reservation_date', { ascending: false })
        .order('start_time', { ascending: false });

      if (error) throw error;
      setReservations(data || []);
    } catch (error) {
      console.error('予約データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterReservations = () => {
    let filtered = [...reservations];

    // テキスト検索
    if (searchTerm) {
      filtered = filtered.filter(r =>
        r.customer_name.includes(searchTerm) ||
        r.customer_phone.includes(searchTerm) ||
        r.reservation_number.includes(searchTerm)
      );
    }

    // 日付フィルタ
    if (filterDate) {
      filtered = filtered.filter(r => r.reservation_date === filterDate);
    }

    // エリアフィルタ
    if (filterArea !== 'all') {
      filtered = filtered.filter(r => r.area === filterArea);
    }

    // ステータスフィルタ
    if (filterStatus !== 'all') {
      filtered = filtered.filter(r => r.status === filterStatus);
    }

    setFilteredReservations(filtered);
  };

  const handleCancelReservation = async (reservationNumber) => {
    if (!window.confirm('この予約をキャンセルしますか？')) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          status: 'cancelled',
          cancelled_at: new Date().toISOString()
        })
        .eq('reservation_number', reservationNumber);

      if (error) throw error;

      alert('予約をキャンセルしました');
      fetchReservations(); // 再取得
    } catch (error) {
      console.error('キャンセルエラー:', error);
      alert('キャンセルに失敗しました');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      confirmed: { text: '予約確定', color: 'bg-green-100 text-green-800' },
      cancelled: { text: 'キャンセル済', color: 'bg-red-100 text-red-800' },
      completed: { text: '利用完了', color: 'bg-gray-100 text-gray-800' }
    };
    const badge = badges[status] || badges.confirmed;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getAreaName = (area) => {
    return area === 'onpukan' ? 'おんぷ館' : 'みどり楽器';
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-primary-green hover:text-green-600 transition mb-2"
          >
            <FaArrowLeft className="mr-2" />
            ダッシュボードに戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-800">予約管理</h1>
          <p className="text-sm text-gray-600">予約の確認・キャンセル・検索</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">絞り込み</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* テキスト検索 */}
            <div>
              <label className="block text-sm font-bold mb-2">
                <FaSearch className="inline mr-1" />
                検索
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="名前・電話・予約番号"
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
              />
            </div>

            {/* 日付フィルタ */}
            <div>
              <label className="block text-sm font-bold mb-2">
                <FaCalendarAlt className="inline mr-1" />
                日付
              </label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
              />
            </div>

            {/* エリアフィルタ */}
            <div>
              <label className="block text-sm font-bold mb-2">エリア</label>
              <select
                value={filterArea}
                onChange={(e) => setFilterArea(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
              >
                <option value="all">全て</option>
                <option value="onpukan">おんぷ館</option>
                <option value="midori">みどり楽器</option>
              </select>
            </div>

            {/* ステータスフィルタ */}
            <div>
              <label className="block text-sm font-bold mb-2">ステータス</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
              >
                <option value="all">全て</option>
                <option value="confirmed">予約確定</option>
                <option value="cancelled">キャンセル済</option>
                <option value="completed">利用完了</option>
              </select>
            </div>
          </div>

          {/* リセットボタン */}
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterDate('');
              setFilterArea('all');
              setFilterStatus('all');
            }}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
          >
            フィルタをリセット
          </button>
        </div>

        {/* 予約一覧 */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">
              予約一覧（{filteredReservations.length}件）
            </h2>
            <button
              onClick={fetchReservations}
              className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
            >
              再読み込み
            </button>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
            </div>
          ) : filteredReservations.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              予約が見つかりませんでした
            </div>
          ) : (
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-green transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {/* 予約番号とステータス */}
                      <div className="flex items-center space-x-3 mb-3">
                        <span className="text-lg font-bold text-primary-green">
                          {reservation.reservation_number}
                        </span>
                        {getStatusBadge(reservation.status)}
                      </div>

                      {/* 予約情報グリッド */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center">
                          <FaCalendarAlt className="text-gray-500 mr-2" />
                          <span>
                            {format(new Date(reservation.reservation_date), 'M月d日（E）', { locale: ja })}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaClock className="text-gray-500 mr-2" />
                          <span>
                            {reservation.start_time.slice(0, 5)}〜{reservation.end_time.slice(0, 5)}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaMusic className="text-gray-500 mr-2" />
                          <span>
                            {getAreaName(reservation.area)} - {reservation.studio_id}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <FaUser className="text-gray-500 mr-2" />
                          <span>{reservation.customer_name}</span>
                        </div>
                        <div className="flex items-center">
                          <FaPhone className="text-gray-500 mr-2" />
                          <span>{reservation.customer_phone}</span>
                        </div>
                        <div className="flex items-center">
                          <span className="font-bold text-primary-orange">
                            ¥{reservation.price.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* アクション */}
                    {reservation.status === 'confirmed' && (
                      <button
                        onClick={() => handleCancelReservation(reservation.reservation_number)}
                        className="ml-4 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                      >
                        <FaTrash className="mr-2" />
                        キャンセル
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
