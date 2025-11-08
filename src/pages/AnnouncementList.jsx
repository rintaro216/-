import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { FaArrowLeft, FaThumbtack } from 'react-icons/fa';

const CATEGORIES = {
  all: { label: '全て', color: 'bg-gray-500', icon: '📋' },
  general: { label: '一般', color: 'bg-blue-500', icon: '📰' },
  important: { label: '重要', color: 'bg-red-500', icon: '🚨' },
  maintenance: { label: 'メンテナンス', color: 'bg-yellow-500', icon: '🔧' },
  event: { label: 'イベント', color: 'bg-green-500', icon: '🎉' }
};

export default function AnnouncementList() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const today = new Date().toISOString().split('T')[0];

      let query = supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true);

      // 公開期間内のものだけ取得
      query = query.or(`publish_start_date.is.null,publish_start_date.lte.${today}`);
      query = query.or(`publish_end_date.is.null,publish_end_date.gte.${today}`);

      const { data, error } = await query
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('お知らせ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredAnnouncements = selectedCategory === 'all'
    ? announcements
    : announcements.filter(a => a.category === selectedCategory);

  const isNew = (createdAt) => {
    const created = new Date(createdAt);
    const now = new Date();
    const diffDays = (now - created) / (1000 * 60 * 60 * 24);
    return diffDays <= 3; // 3日以内は NEW
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/')}
          className="mb-6 flex items-center text-primary-green hover:text-green-600 transition"
        >
          <FaArrowLeft className="mr-2" />
          トップページに戻る
        </button>

        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">お知らせ一覧</h1>

        {/* カテゴリフィルター */}
        <div className="mb-8 flex flex-wrap gap-3">
          {Object.entries(CATEGORIES).map(([key, cat]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-4 py-2 rounded-full font-bold transition flex items-center space-x-2 ${
                selectedCategory === key
                  ? `${cat.color} text-white shadow-lg`
                  : 'bg-white text-gray-700 hover:bg-gray-100 border-2 border-gray-300'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
              <span className="text-xs opacity-75">
                ({key === 'all' ? announcements.length : announcements.filter(a => a.category === key).length})
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-gray-500 text-lg">
              {selectedCategory === 'all'
                ? 'お知らせがありません'
                : `${CATEGORIES[selectedCategory].label}のお知らせはありません`}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnnouncements.map((announcement) => {
              const category = CATEGORIES[announcement.category] || CATEGORIES.general;

              return (
                <Link
                  key={announcement.id}
                  to={`/announcements/${announcement.id}`}
                  className="card hover:shadow-xl transition transform hover:-translate-y-1 cursor-pointer"
                >
                  {/* ピン留め・NEWバッジ */}
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-flex items-center space-x-1 px-3 py-1 ${category.color} text-white text-xs font-bold rounded-full`}>
                      <span>{category.icon}</span>
                      <span>{category.label}</span>
                    </span>
                    <div className="flex items-center space-x-2">
                      {announcement.is_pinned && (
                        <FaThumbtack className="text-primary-orange" title="ピン留め" />
                      )}
                      {isNew(announcement.created_at) && (
                        <span className="bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                          NEW
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 画像 */}
                  {announcement.image_url && (
                    <div className="mb-4">
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}

                  {/* タイトル */}
                  <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2">
                    {announcement.title}
                  </h2>

                  {/* 概要 */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {announcement.content}
                  </p>

                  {/* 日付 */}
                  <div className="text-xs text-gray-500">
                    {format(new Date(announcement.created_at), 'yyyy年M月d日', { locale: ja })}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
