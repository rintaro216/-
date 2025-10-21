import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getEmailNotifications, getEmailStatistics } from '../../services/emailService';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { FaEnvelope, FaCheckCircle, FaTimesCircle, FaClock, FaSync, FaArrowLeft } from 'react-icons/fa';

export default function EmailNotifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedEmail, setSelectedEmail] = useState(null);

  useEffect(() => {
    fetchData();
  }, [filterType, filterStatus]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 統計情報を取得
      const statsResult = await getEmailStatistics();
      if (statsResult.success) {
        setStatistics(statsResult.data);
      }

      // 通知履歴を取得
      const filters = {};
      if (filterType !== 'all') {
        filters.notificationType = filterType;
      }
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }

      const result = await getEmailNotifications(filters);
      if (result.success) {
        setNotifications(result.data || []);
      }
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeLabel = (type) => {
    const labels = {
      confirmation: '予約確認',
      reminder: 'リマインダー',
      cancellation: 'キャンセル通知'
    };
    return labels[type] || type;
  };

  const getTypeBadgeColor = (type) => {
    const colors = {
      confirmation: 'bg-blue-100 text-blue-600',
      reminder: 'bg-green-100 text-green-600',
      cancellation: 'bg-red-100 text-red-600'
    };
    return colors[type] || 'bg-gray-100 text-gray-600';
  };

  const getStatusIcon = (status) => {
    if (status === 'sent') return <FaCheckCircle className="text-green-500" />;
    if (status === 'failed') return <FaTimesCircle className="text-red-500" />;
    if (status === 'pending') return <FaClock className="text-yellow-500" />;
    return null;
  };

  const getStatusLabel = (status) => {
    const labels = {
      sent: '送信済み',
      failed: '送信失敗',
      pending: '送信待ち'
    };
    return labels[status] || status;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mb-6 flex items-center text-primary-green hover:text-green-600 transition"
      >
        <FaArrowLeft className="mr-2" />
        ダッシュボードに戻る
      </button>

      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">メール通知履歴</h1>
          <p className="text-gray-600 text-sm mt-1">予約に関するメール送信履歴を確認できます</p>
        </div>
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg hover:bg-green-600 transition"
        >
          <FaSync />
          <span>更新</span>
        </button>
      </div>

      {/* 統計カード */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">送信済み</p>
            <p className="text-3xl font-bold text-green-600">{statistics.sent}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">送信待ち</p>
            <p className="text-3xl font-bold text-yellow-600">{statistics.pending}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">送信失敗</p>
            <p className="text-3xl font-bold text-red-600">{statistics.failed}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow">
            <p className="text-sm text-gray-600 mb-1">合計</p>
            <p className="text-3xl font-bold text-gray-800">
              {statistics.sent + statistics.pending + statistics.failed}
            </p>
          </div>
        </div>
      )}

      {/* タイプ別統計 */}
      {statistics && (
        <div className="bg-white rounded-lg p-4 shadow mb-6">
          <h3 className="font-bold text-gray-800 mb-3">タイプ別送信数</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">予約確認</p>
              <p className="text-2xl font-bold text-blue-600">{statistics.byType.confirmation}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">リマインダー</p>
              <p className="text-2xl font-bold text-green-600">{statistics.byType.reminder}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">キャンセル通知</p>
              <p className="text-2xl font-bold text-red-600">{statistics.byType.cancellation}</p>
            </div>
          </div>
        </div>
      )}

      {/* フィルター */}
      <div className="bg-white rounded-lg p-4 shadow mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">通知タイプ</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
            >
              <option value="all">すべて</option>
              <option value="confirmation">予約確認</option>
              <option value="reminder">リマインダー</option>
              <option value="cancellation">キャンセル通知</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">送信状態</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange"
            >
              <option value="all">すべて</option>
              <option value="sent">送信済み</option>
              <option value="pending">送信待ち</option>
              <option value="failed">送信失敗</option>
            </select>
          </div>
        </div>
      </div>

      {/* 通知リスト */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white rounded-lg p-8 shadow text-center">
          <FaEnvelope className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">メール通知履歴がありません</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className="bg-white rounded-lg p-4 shadow hover:shadow-md transition cursor-pointer"
              onClick={() => setSelectedEmail(notification)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <span className={`px-3 py-1 rounded text-xs font-bold ${getTypeBadgeColor(notification.notification_type)}`}>
                    {getTypeLabel(notification.notification_type)}
                  </span>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(notification.status)}
                    <span className="text-sm text-gray-600">
                      {getStatusLabel(notification.status)}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-500">
                  {format(new Date(notification.sent_at), 'yyyy/MM/dd HH:mm')}
                </span>
              </div>

              <div className="mb-2">
                <p className="font-bold text-gray-800">{notification.subject}</p>
              </div>

              <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
                <div>
                  <span className="font-bold">宛先:</span> {notification.recipient_name} ({notification.recipient_email})
                </div>
                {notification.reservations && (
                  <div>
                    <span className="font-bold">予約番号:</span> {notification.reservations.reservation_number}
                  </div>
                )}
              </div>

              {notification.error_message && (
                <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded">
                  <p className="text-sm text-red-600">
                    <span className="font-bold">エラー:</span> {notification.error_message}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* メール詳細モーダル */}
      {selectedEmail && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedEmail(null)}
        >
          <div
            className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h2 className="text-2xl font-bold">メール詳細</h2>
                <button
                  onClick={() => setSelectedEmail(null)}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">通知タイプ</p>
                  <span className={`inline-block px-3 py-1 rounded text-sm font-bold ${getTypeBadgeColor(selectedEmail.notification_type)}`}>
                    {getTypeLabel(selectedEmail.notification_type)}
                  </span>
                </div>

                <div>
                  <p className="text-sm text-gray-600">送信状態</p>
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(selectedEmail.status)}
                    <span className="font-bold">{getStatusLabel(selectedEmail.status)}</span>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-600">送信日時</p>
                  <p className="font-bold">
                    {format(new Date(selectedEmail.sent_at), 'yyyy年MM月dd日 HH:mm:ss', { locale: ja })}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">宛先</p>
                  <p className="font-bold">{selectedEmail.recipient_name}</p>
                  <p className="text-sm text-gray-600">{selectedEmail.recipient_email}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600">件名</p>
                  <p className="font-bold">{selectedEmail.subject}</p>
                </div>

                <div>
                  <p className="text-sm text-gray-600 mb-2">本文</p>
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 whitespace-pre-wrap text-sm">
                    {selectedEmail.body}
                  </div>
                </div>

                {selectedEmail.error_message && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">エラーメッセージ</p>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <p className="text-sm text-red-600">{selectedEmail.error_message}</p>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setSelectedEmail(null)}
                className="w-full mt-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-400 transition"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 説明パネル */}
      <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-900 mb-2">📧 メール送信について</h3>
        <div className="text-sm text-yellow-800 space-y-1">
          <p>• 現在、メール送信履歴の記録機能のみ実装されています</p>
          <p>• 実際のメール送信には、Resend・SendGrid・AWS SES等の外部サービスとの連携が必要です</p>
          <p>• 予約作成時・キャンセル時に自動的に通知履歴が記録されます</p>
          <p>• リマインダーは毎日18:00に翌日の予約に対して送信予定として記録されます</p>
        </div>
      </div>
    </div>
  );
}
