import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FaArrowLeft, FaMusic, FaCheckCircle, FaTimesCircle, FaEdit } from 'react-icons/fa';

export default function StudioManagement() {
  const navigate = useNavigate();
  const [studios, setStudios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterArea, setFilterArea] = useState('all');

  useEffect(() => {
    fetchStudios();
  }, []);

  const fetchStudios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('studios')
        .select('*')
        .order('area')
        .order('display_order');

      if (error) throw error;
      setStudios(data || []);
    } catch (error) {
      console.error('スタジオデータ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudioStatus = async (studioId, currentStatus) => {
    const newStatus = !currentStatus;
    const action = newStatus ? '稼働' : '休止';

    if (!window.confirm(`このスタジオを${action}状態にしますか？`)) return;

    try {
      const { error } = await supabase
        .from('studios')
        .update({ is_active: newStatus })
        .eq('id', studioId);

      if (error) throw error;

      alert(`スタジオを${action}状態にしました`);
      fetchStudios(); // 再取得
    } catch (error) {
      console.error('ステータス更新エラー:', error);
      alert('ステータスの更新に失敗しました');
    }
  };

  const getAreaName = (area) => {
    return area === 'onpukan' ? 'おんぷ館' : 'みどり楽器';
  };

  const filteredStudios = filterArea === 'all'
    ? studios
    : studios.filter(s => s.area === filterArea);

  // エリアごとにグループ化
  const studiosByArea = {
    onpukan: filteredStudios.filter(s => s.area === 'onpukan'),
    midori: filteredStudios.filter(s => s.area === 'midori')
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
          <h1 className="text-2xl font-bold text-gray-800">スタジオ管理</h1>
          <p className="text-sm text-gray-600">スタジオの休止設定・情報確認</p>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {/* フィルター */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">エリア選択</h2>
          <div className="flex space-x-4">
            <button
              onClick={() => setFilterArea('all')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                filterArea === 'all'
                  ? 'bg-primary-green text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全て
            </button>
            <button
              onClick={() => setFilterArea('onpukan')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                filterArea === 'onpukan'
                  ? 'bg-primary-green text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              おんぷ館
            </button>
            <button
              onClick={() => setFilterArea('midori')}
              className={`px-6 py-3 rounded-lg font-bold transition ${
                filterArea === 'midori'
                  ? 'bg-primary-green text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              みどり楽器
            </button>
          </div>
        </div>

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">全スタジオ数</p>
            <p className="text-3xl font-bold text-gray-800">{studios.length}</p>
            <p className="text-xs text-gray-500 mt-1">室</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">稼働中</p>
            <p className="text-3xl font-bold text-green-600">
              {studios.filter(s => s.is_active).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">室</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow">
            <p className="text-sm text-gray-600 mb-1">休止中</p>
            <p className="text-3xl font-bold text-red-600">
              {studios.filter(s => !s.is_active).length}
            </p>
            <p className="text-xs text-gray-500 mt-1">室</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : (
          <>
            {/* おんぷ館 */}
            {(filterArea === 'all' || filterArea === 'onpukan') && studiosByArea.onpukan.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FaMusic className="text-primary-green mr-2" />
                  おんぷ館（{studiosByArea.onpukan.length}室）
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studiosByArea.onpukan.map((studio) => (
                    <StudioCard
                      key={studio.id}
                      studio={studio}
                      onToggleStatus={toggleStudioStatus}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* みどり楽器 */}
            {(filterArea === 'all' || filterArea === 'midori') && studiosByArea.midori.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                  <FaMusic className="text-primary-green mr-2" />
                  みどり楽器（{studiosByArea.midori.length}室）
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {studiosByArea.midori.map((studio) => (
                    <StudioCard
                      key={studio.id}
                      studio={studio}
                      onToggleStatus={toggleStudioStatus}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// スタジオカードコンポーネント
function StudioCard({ studio, onToggleStatus }) {
  const equipment = Array.isArray(studio.equipment) ? studio.equipment : JSON.parse(studio.equipment || '[]');
  const features = Array.isArray(studio.features) ? studio.features : JSON.parse(studio.features || '[]');

  return (
    <div className={`border-2 rounded-xl p-4 transition ${
      studio.is_active
        ? 'border-green-200 bg-green-50'
        : 'border-red-200 bg-red-50'
    }`}>
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-2xl">{studio.icon}</span>
          <h3 className="font-bold text-lg">{studio.display_name}</h3>
        </div>
        {studio.is_active ? (
          <FaCheckCircle className="text-green-600 text-xl" />
        ) : (
          <FaTimesCircle className="text-red-600 text-xl" />
        )}
      </div>

      {/* ステータスバッジ */}
      <div className="mb-3">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
          studio.is_active
            ? 'bg-green-500 text-white'
            : 'bg-red-500 text-white'
        }`}>
          {studio.is_active ? '稼働中' : '休止中'}
        </span>
      </div>

      {/* 料金 */}
      <div className="mb-3 pb-3 border-b border-gray-300">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">一般</span>
          <span className="font-bold">¥{studio.price_general.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">生徒</span>
          <span className="font-bold">¥{studio.price_student.toLocaleString()}</span>
        </div>
      </div>

      {/* 設備 */}
      <div className="mb-3">
        <p className="text-xs font-bold text-gray-600 mb-1">設備：</p>
        <div className="flex flex-wrap gap-1">
          {equipment.slice(0, 2).map((item, index) => (
            <span key={index} className="text-xs bg-gray-200 px-2 py-1 rounded">
              {item}
            </span>
          ))}
          {equipment.length > 2 && (
            <span className="text-xs text-gray-500">他{equipment.length - 2}件</span>
          )}
        </div>
      </div>

      {/* アクションボタン */}
      <button
        onClick={() => onToggleStatus(studio.id, studio.is_active)}
        className={`w-full py-2 rounded-lg font-bold transition ${
          studio.is_active
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-green-500 text-white hover:bg-green-600'
        }`}
      >
        {studio.is_active ? '休止にする' : '稼働にする'}
      </button>
    </div>
  );
}
