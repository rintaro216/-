import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { FaArrowLeft, FaSearch, FaTrash, FaCalendarAlt, FaClock, FaMusic, FaUser, FaPhone, FaEdit, FaTimes, FaEye, FaEnvelope, FaFileExport, FaPlus } from 'react-icons/fa';
import { sendReservationConfirmation } from '../../services/lineNotificationService';
import { createReservation } from '../../services/reservationService';

export default function ReservationManagement() {
  const navigate = useNavigate();
  const [reservations, setReservations] = useState([]);
  const [filteredReservations, setFilteredReservations] = useState([]);
  const [studios, setStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterArea, setFilterArea] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingReservation, setEditingReservation] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newReservation, setNewReservation] = useState({
    area: 'onpukan',
    studio_id: '',
    reservation_date: '',
    start_time: '10:00',
    end_time: '11:00',
    customer_name: '',
    customer_phone: '',
    user_type: 'general',
    line_user_id: '',
    price: 0
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [viewingReservation, setViewingReservation] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  // 予約データを取得
  useEffect(() => {
    fetchReservations();
    fetchStudios();
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

  const fetchStudios = async () => {
    try {
      const { data, error } = await supabase
        .from('studios')
        .select('*');

      if (error) throw error;
      setStudios(data || []);
    } catch (error) {
      console.error('スタジオデータ取得エラー:', error);
    }
  };

  const getStudioName = (studioId) => {
    const studio = studios.find(s => s.id === studioId);
    return studio ? studio.display_name : studioId;
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

  const handleViewReservation = (reservation) => {
    setViewingReservation(reservation);
    setShowDetailModal(true);
  };

  const handleEditReservation = (reservation) => {
    setEditingReservation({...reservation});
    setShowEditModal(true);
  };


  const handleOpenCreateModal = () => {
    setNewReservation({
      area: 'onpukan',
      studio_id: studios.find(s => s.area === 'onpukan')?.id || '',
      reservation_date: '',
      start_time: '10:00',
      end_time: '11:00',
      customer_name: '',
      customer_phone: '',
      user_type: 'general',
      line_user_id: '',
      price: 0
    });
    setShowCreateModal(true);
  };

  const handleCreateReservation = async () => {
    if (!newReservation.customer_name || !newReservation.customer_phone || !newReservation.reservation_date) {
      alert('必須項目を入力してください');
      return;
    }

    try {
      const result = await createReservation({
        area: newReservation.area,
        studioId: newReservation.studio_id,
        date: newReservation.reservation_date,
        timeRange: `${newReservation.start_time}-${newReservation.end_time}`,
        userType: newReservation.user_type,
        customerName: newReservation.customer_name,
        customerPhone: newReservation.customer_phone,
        lineUserId: newReservation.line_user_id || null,
        price: newReservation.price
      });

      if (result.success) {
        alert(`予約を作成しました（予約番号: ${result.reservationNumber}）`);
        setShowCreateModal(false);
        fetchReservations();
      } else {
        alert(`予約の作成に失敗しました: ${result.message}`);
      }
    } catch (error) {
      console.error('予約作成エラー:', error);
      alert('予約の作成に失敗しました');
    }
  };

  const calculatePrice = (startTime, endTime, userType, area, studioId) => {
    const start = new Date(`2000-01-01 ${startTime}`);
    const end = new Date(`2000-01-01 ${endTime}`);
    const hours = (end - start) / (1000 * 60 * 60);

    const studio = studios.find(s => s.id === studioId);
    if (!studio) return 0;

    const rate = userType === 'student' ? studio.student_rate : studio.general_rate;
    return Math.round(rate * hours);
  };

  const handleNewReservationChange = (field, value) => {
    setNewReservation(prev => {
      const updated = { ...prev, [field]: value };

      // エリアが変更された場合、そのエリアの最初のスタジオを選択
      if (field === 'area') {
        const firstStudio = studios.find(s => s.area === value && s.is_active);
        updated.studio_id = firstStudio?.id || '';
      }

      // 料金を再計算
      if (['start_time', 'end_time', 'user_type', 'studio_id'].includes(field)) {
        updated.price = calculatePrice(
          updated.start_time,
          updated.end_time,
          updated.user_type,
          updated.area,
          updated.studio_id
        );
      }

      return updated;
    });
  };

  const handleSaveEdit = async () => {
    if (!editingReservation) return;

    try {
      const { error } = await supabase
        .from('reservations')
        .update({
          reservation_date: editingReservation.reservation_date,
          start_time: editingReservation.start_time,
          end_time: editingReservation.end_time,
          studio_id: editingReservation.studio_id,
          area: editingReservation.area
        })
        .eq('reservation_number', editingReservation.reservation_number);

      if (error) throw error;

      alert('予約を更新しました');
      setShowEditModal(false);
      setEditingReservation(null);
      fetchReservations();
    } catch (error) {
      console.error('更新エラー:', error);
      alert('予約の更新に失敗しました');
    }
  };

  const handleExportCSV = () => {
    // CSVヘッダー
    const headers = [
      '予約番号',
      'ステータス',
      '予約日',
      '開始時刻',
      '終了時刻',
      'エリア',
      'スタジオ',
      '顧客名',
      '電話番号',
      'メールアドレス',
      '利用者区分',
      '料金',
      '作成日時'
    ];

    // CSVデータ作成
    const csvData = filteredReservations.map(r => [
      r.reservation_number,
      r.status === 'confirmed' ? '予約確定' : r.status === 'cancelled' ? 'キャンセル済' : '利用完了',
      r.reservation_date,
      r.start_time,
      r.end_time,
      getAreaName(r.area),
      getStudioName(r.studio_id),
      r.customer_name,
      r.customer_phone,
      r.customer_email || '',
      r.user_type === 'student' ? '学生' : '一般',
      r.price,
      format(new Date(r.created_at), 'yyyy/MM/dd HH:mm:ss')
    ]);

    // CSV文字列作成
    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // BOM付きUTF-8でエンコード（Excelで文字化けしないように）
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8;' });

    // ダウンロード
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `予約一覧_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                disabled={filteredReservations.length === 0}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FaFileExport className="mr-2" />
                CSVエクスポート
              </button>
              <button
                onClick={handleOpenCreateModal}
                className="px-4 py-2 bg-primary-orange text-white rounded-lg hover:bg-orange-600 transition flex items-center"
              >
                <FaPlus className="mr-2" />
                新規予約作成
              </button>
              <button
                onClick={fetchReservations}
                className="px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
              >
                再読み込み
              </button>
            </div>
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
                  className="border-2 border-gray-200 rounded-lg p-4 hover:border-primary-green transition cursor-pointer"
                  onClick={() => handleViewReservation(reservation)}
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
                            {getAreaName(reservation.area)} - {getStudioName(reservation.studio_id)}
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
                      <div className="ml-4 flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleEditReservation(reservation)}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
                        >
                          <FaEdit className="mr-2" />
                          編集
                        </button>
                        <button
                          onClick={() => handleCancelReservation(reservation.reservation_number)}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition flex items-center"
                        >
                          <FaTrash className="mr-2" />
                          キャンセル
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* 詳細モーダル */}
      {showDetailModal && viewingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">予約詳細</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setViewingReservation(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-6">
              {/* ステータス */}
              <div className="flex items-center justify-between pb-4 border-b">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl font-bold text-primary-green">
                    {viewingReservation.reservation_number}
                  </span>
                  {getStatusBadge(viewingReservation.status)}
                </div>
                <div className="text-2xl font-bold text-primary-orange">
                  ¥{viewingReservation.price?.toLocaleString()}
                </div>
              </div>

              {/* 予約情報 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3 flex items-center">
                  <FaCalendarAlt className="mr-2" />
                  予約情報
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-600">予約日：</span>
                    <span className="font-bold">
                      {format(new Date(viewingReservation.reservation_date), 'yyyy年M月d日（E）', { locale: ja })}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">時間：</span>
                    <span className="font-bold">
                      {viewingReservation.start_time.slice(0, 5)}〜{viewingReservation.end_time.slice(0, 5)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">エリア：</span>
                    <span className="font-bold">{getAreaName(viewingReservation.area)}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">スタジオ：</span>
                    <span className="font-bold">{getStudioName(viewingReservation.studio_id)}</span>
                  </div>
                </div>
              </div>

              {/* 顧客情報 */}
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3 flex items-center">
                  <FaUser className="mr-2" />
                  顧客情報
                </h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-600">氏名：</span>
                    <span className="font-bold">{viewingReservation.customer_name}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">電話番号：</span>
                    <span className="font-bold">{viewingReservation.customer_phone}</span>
                  </div>
                  {viewingReservation.customer_email && (
                    <div>
                      <span className="text-gray-600">メールアドレス：</span>
                      <span className="font-bold">{viewingReservation.customer_email}</span>
                    </div>
                  )}
                  <div>
                    <span className="text-gray-600">利用者区分：</span>
                    <span className="font-bold">
                      {viewingReservation.user_type === 'student' ? '学生' : '一般'}
                    </span>
                  </div>
                </div>
              </div>

              {/* システム情報 */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-3">システム情報</h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <div>
                    <span>予約作成日時：</span>
                    <span className="ml-2">
                      {format(new Date(viewingReservation.created_at), 'yyyy/MM/dd HH:mm:ss')}
                    </span>
                  </div>
                  {viewingReservation.cancelled_at && (
                    <div>
                      <span>キャンセル日時：</span>
                      <span className="ml-2">
                        {format(new Date(viewingReservation.cancelled_at), 'yyyy/MM/dd HH:mm:ss')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 mt-6">
              {viewingReservation.status === 'confirmed' && (
                <>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleEditReservation(viewingReservation);
                    }}
                    className="flex-1 px-4 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-bold flex items-center justify-center"
                  >
                    <FaEdit className="mr-2" />
                    編集
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      handleCancelReservation(viewingReservation.reservation_number);
                    }}
                    className="flex-1 px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-bold flex items-center justify-center"
                  >
                    <FaTrash className="mr-2" />
                    キャンセル
                  </button>
                </>
              )}
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setViewingReservation(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-bold"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 編集モーダル */}
      {showEditModal && editingReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">予約編集</h2>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReservation(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* 予約番号（編集不可） */}
              <div>
                <label className="block text-sm font-bold mb-2">予約番号</label>
                <input
                  type="text"
                  value={editingReservation.reservation_number}
                  disabled
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg bg-gray-100"
                />
              </div>

              {/* エリア選択 */}
              <div>
                <label className="block text-sm font-bold mb-2">エリア</label>
                <select
                  value={editingReservation.area}
                  onChange={(e) => setEditingReservation({...editingReservation, area: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                >
                  <option value="onpukan">おんぷ館</option>
                  <option value="midori">みどり楽器</option>
                </select>
              </div>

              {/* スタジオ選択 */}
              <div>
                <label className="block text-sm font-bold mb-2">スタジオ</label>
                <select
                  value={editingReservation.studio_id}
                  onChange={(e) => setEditingReservation({...editingReservation, studio_id: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                >
                  {studios
                    .filter(s => s.area === editingReservation.area)
                    .map(studio => (
                      <option key={studio.id} value={studio.id}>
                        {studio.display_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* 日付 */}
              <div>
                <label className="block text-sm font-bold mb-2">予約日</label>
                <input
                  type="date"
                  value={editingReservation.reservation_date}
                  onChange={(e) => setEditingReservation({...editingReservation, reservation_date: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                />
              </div>

              {/* 開始時刻 */}
              <div>
                <label className="block text-sm font-bold mb-2">開始時刻</label>
                <input
                  type="time"
                  value={editingReservation.start_time}
                  onChange={(e) => setEditingReservation({...editingReservation, start_time: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                />
              </div>

              {/* 終了時刻 */}
              <div>
                <label className="block text-sm font-bold mb-2">終了時刻</label>
                <input
                  type="time"
                  value={editingReservation.end_time}
                  onChange={(e) => setEditingReservation({...editingReservation, end_time: e.target.value})}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                />
              </div>

              {/* 顧客情報（参考表示） */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">顧客情報（編集不可）</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>氏名：</strong>{editingReservation.customer_name}</p>
                  <p><strong>電話：</strong>{editingReservation.customer_phone}</p>
                  <p><strong>料金：</strong>¥{editingReservation.price?.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                className="flex-1 px-4 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition font-bold"
              >
                保存
              </button>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setEditingReservation(null);
                }}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-bold"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}


      {/* 新規作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">新規予約作成（管理者用）</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <FaTimes size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* エリア選択 */}
              <div>
                <label className="block text-sm font-bold mb-2">エリア <span className="text-red-500">*</span></label>
                <select
                  value={newReservation.area}
                  onChange={(e) => handleNewReservationChange('area', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                >
                  <option value="onpukan">おんぷ館</option>
                  <option value="midori">みどり楽器</option>
                </select>
              </div>

              {/* スタジオ選択 */}
              <div>
                <label className="block text-sm font-bold mb-2">スタジオ <span className="text-red-500">*</span></label>
                <select
                  value={newReservation.studio_id}
                  onChange={(e) => handleNewReservationChange('studio_id', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                >
                  {studios
                    .filter(s => s.area === newReservation.area && s.is_active)
                    .map(studio => (
                      <option key={studio.id} value={studio.id}>
                        {studio.display_name}
                      </option>
                    ))}
                </select>
              </div>

              {/* 日付 */}
              <div>
                <label className="block text-sm font-bold mb-2">予約日 <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={newReservation.reservation_date}
                  onChange={(e) => handleNewReservationChange('reservation_date', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                />
              </div>

              {/* 時間 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">開始時刻 <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={newReservation.start_time}
                    onChange={(e) => handleNewReservationChange('start_time', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">終了時刻 <span className="text-red-500">*</span></label>
                  <input
                    type="time"
                    value={newReservation.end_time}
                    onChange={(e) => handleNewReservationChange('end_time', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                  />
                </div>
              </div>

              {/* 顧客情報 */}
              <div>
                <label className="block text-sm font-bold mb-2">顧客名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={newReservation.customer_name}
                  onChange={(e) => handleNewReservationChange('customer_name', e.target.value)}
                  placeholder="山田太郎"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">電話番号 <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={newReservation.customer_phone}
                  onChange={(e) => handleNewReservationChange('customer_phone', e.target.value)}
                  placeholder="090-1234-5678"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                />
              </div>

              <div>
                <label className="block text-sm font-bold mb-2">LINE User ID（任意）</label>
                <input
                  type="text"
                  value={newReservation.line_user_id}
                  onChange={(e) => handleNewReservationChange('line_user_id', e.target.value)}
                  placeholder="LINE通知を送信する場合は入力"
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                />
                <p className="text-xs text-gray-500 mt-1">※入力するとLINEで予約通知が送信されます</p>
              </div>

              {/* 利用者区分 */}
              <div>
                <label className="block text-sm font-bold mb-2">利用者区分</label>
                <select
                  value={newReservation.user_type}
                  onChange={(e) => handleNewReservationChange('user_type', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green"
                >
                  <option value="general">一般</option>
                  <option value="student">学生</option>
                </select>
              </div>

              {/* 料金表示 */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-gray-700">料金</span>
                  <span className="text-2xl font-bold text-primary-orange">
                    ¥{newReservation.price.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* ボタン */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateReservation}
                className="flex-1 px-4 py-3 bg-primary-green text-white rounded-lg hover:bg-green-600 transition font-bold"
              >
                予約を作成
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-bold"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}