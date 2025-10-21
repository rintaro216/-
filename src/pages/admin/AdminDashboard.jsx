import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaMusic, FaDoorOpen, FaSignOutAlt, FaChartBar, FaBan, FaClock, FaBullhorn } from 'react-icons/fa';
import { supabase } from '../../lib/supabase';
import { format, startOfToday, startOfWeek, endOfWeek } from 'date-fns';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [statistics, setStatistics] = useState({
    todayReservations: 0,
    weekReservations: 0,
    activeStudios: 0
  });

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    try {
      const today = format(startOfToday(), 'yyyy-MM-dd');
      const weekStart = format(startOfWeek(startOfToday()), 'yyyy-MM-dd');
      const weekEnd = format(endOfWeek(startOfToday()), 'yyyy-MM-dd');

      // 今日の予約数
      const { count: todayCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .eq('reservation_date', today)
        .eq('status', 'confirmed');

      // 今週の予約数
      const { count: weekCount } = await supabase
        .from('reservations')
        .select('*', { count: 'exact', head: true })
        .gte('reservation_date', weekStart)
        .lte('reservation_date', weekEnd)
        .eq('status', 'confirmed');

      // 稼働中スタジオ数
      const { count: activeCount } = await supabase
        .from('studios')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      setStatistics({
        todayReservations: todayCount || 0,
        weekReservations: weekCount || 0,
        activeStudios: activeCount || 0
      });
    } catch (error) {
      console.error('統計データ取得エラー:', error);
    }
  };

  const handleLogout = async () => {
    try {
      // Supabaseからログアウト
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabaseログアウトエラー:', error);
      }

      // ローカルストレージをクリア
      localStorage.removeItem('isAdmin');
      localStorage.clear(); // 念のため全てクリア

      // ログイン画面に遷移
      navigate('/admin/login', { replace: true });
    } catch (error) {
      console.error('ログアウトエラー:', error);
      // エラーが発生してもログイン画面に遷移
      localStorage.clear();
      navigate('/admin/login', { replace: true });
    }
  };

  const menuItems = [
    {
      title: '予約管理',
      description: '予約の確認・編集・キャンセル・CSV出力',
      icon: FaCalendarAlt,
      color: 'bg-blue-500',
      hoverColor: 'hover:bg-blue-600',
      path: '/admin/reservations'
    },
    {
      title: 'スタジオ管理',
      description: 'スタジオ設定・営業時間管理',
      icon: FaMusic,
      color: 'bg-green-500',
      hoverColor: 'hover:bg-green-600',
      path: '/admin/studios'
    },
    {
      title: 'お知らせ管理',
      description: 'お知らせの作成・編集・公開管理',
      icon: FaBullhorn,
      color: 'bg-orange-500',
      hoverColor: 'hover:bg-orange-600',
      path: '/admin/announcements'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              おんぷタイム 管理画面
            </h1>
            <p className="text-sm text-gray-600">管理者ダッシュボード</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
          >
            <FaSignOutAlt />
            <span>ログアウト</span>
          </button>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {/* ウェルカムメッセージ */}
        <div className="bg-gradient-to-r from-primary-green to-green-600 rounded-2xl p-8 mb-8 text-white">
          <h2 className="text-3xl font-bold mb-2">ようこそ、管理者さん！</h2>
          <p className="text-green-100">
            おんぷタイム予約システムの管理画面です。各機能にアクセスするには下のメニューから選択してください。
          </p>
        </div>

        {/* メニューグリッド */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.title}
                onClick={() => !item.disabled && navigate(item.path)}
                disabled={item.disabled}
                className={`
                  ${item.color} ${!item.disabled && item.hoverColor}
                  text-white rounded-2xl p-6 text-left transition transform
                  ${item.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:scale-105 hover:shadow-xl cursor-pointer'
                  }
                `}
              >
                <div className="flex items-start space-x-4">
                  <div className="bg-white bg-opacity-20 rounded-xl p-4">
                    <Icon className="text-3xl" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">
                      {item.title}
                      {item.disabled && <span className="text-sm ml-2">(準備中)</span>}
                    </h3>
                    <p className="text-sm opacity-90">
                      {item.description}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {/* クイック統計 */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
            <p className="text-sm text-gray-600 mb-1">今日の予約</p>
            <p className="text-3xl font-bold text-blue-600">{statistics.todayReservations}</p>
            <p className="text-xs text-gray-500 mt-1">件</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
            <p className="text-sm text-gray-600 mb-1">今週の予約</p>
            <p className="text-3xl font-bold text-green-600">{statistics.weekReservations}</p>
            <p className="text-xs text-gray-500 mt-1">件</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow hover:shadow-lg transition">
            <p className="text-sm text-gray-600 mb-1">稼働中スタジオ</p>
            <p className="text-3xl font-bold text-primary-orange">{statistics.activeStudios}</p>
            <p className="text-xs text-gray-500 mt-1">室</p>
          </div>
        </div>
      </main>
    </div>
  );
}
