import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { FaArrowLeft, FaCalendar } from 'react-icons/fa';

const CATEGORIES = {
  general: { label: '一般', color: 'bg-blue-500', icon: '📰' },
  important: { label: '重要', color: 'bg-red-500', icon: '🚨' },
  maintenance: { label: 'メンテナンス', color: 'bg-yellow-500', icon: '🔧' },
  event: { label: 'イベント', color: 'bg-green-500', icon: '🎉' }
};

export default function AnnouncementDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [announcement, setAnnouncement] = useState(null);
  const [viewCount, setViewCount] = useState(0);
  const [relatedAnnouncements, setRelatedAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnnouncement();
  }, [id]);

      const fetchRelatedAnnouncements = async (category, currentId) => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('announcements')
        .select('id, title, category, created_at, image_url')
        .eq('category', category)
        .eq('is_published', true)
        .neq('id', currentId)
        .lte('publish_start_date', today)
        .or(`publish_end_date.is.null,publish_end_date.gte.${today}`)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) {
        console.error('関連お知らせ取得エラー:', error);
        return;
      }

      setRelatedAnnouncements(data || []);
    } catch (error) {
      console.error('関連お知らせ取得エラー:', error);
    }
  };

  const incrementViewCount = async (announcementId) => {
    try {
      // 閲覧数を +1 する
      const { error } = await supabase
        .rpc('increment_view_count', { announcement_id: announcementId });

      if (error) {
        console.error('閲覧数更新エラー:', error);
        return;
      }

      // 更新後の閲覧数を取得
      const { data, error: fetchError } = await supabase
        .from('announcements')
        .select('view_count')
        .eq('id', announcementId)
        .single();

      if (!fetchError && data) {
        setViewCount(data.view_count);
      }
    } catch (error) {
      console.error('閲覧数カウントエラー:', error);
    }
  };

  const fetchAnnouncement = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('id', id)
        .eq('is_published', true)
        .single();

      if (error) throw error;

      if (!data) {
        setError('お知らせが見つかりませんでした');
        return;
      }

      // 公開期間チェック
      const today = new Date().toISOString().split('T')[0];
      if (data.publish_start_date && data.publish_start_date > today) {
        setError('このお知らせはまだ公開されていません');
        return;
      }
      if (data.publish_end_date && data.publish_end_date < today) {
        setError('このお知らせの公開期間は終了しました');
        return;
      }

      setAnnouncement(data);
      
      // 閲覧数をインクリメント
      await incrementViewCount(id);
      
      // 関連お知らせを取得
      await fetchRelatedAnnouncements(data.category, id);
    } catch (error) {
      console.error('お知らせ取得エラー:', error);
      setError('お知らせの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  if (error || !announcement) {
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

          <div className="card text-center py-12">
            <p className="text-gray-500 text-xl mb-4">{error}</p>
            <Link to="/announcements" className="text-primary-orange hover:underline">
              お知らせ一覧を見る
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const category = CATEGORIES[announcement.category] || CATEGORIES.general;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-primary-green hover:text-green-600 transition"
        >
          <FaArrowLeft className="mr-2" />
          戻る
        </button>

        <article className="card">
          {/* カテゴリバッジ */}
          <div className="mb-4">
            <span className={`inline-flex items-center space-x-2 px-4 py-2 ${category.color} text-white text-sm font-bold rounded-full`}>
              <span className="text-lg">{category.icon}</span>
              <span>{category.label}</span>
            </span>
          </div>

          {/* タイトル */}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6">
            {announcement.title}
          </h1>

          {/* 日付 */}
          <div className="flex items-center text-gray-500 text-sm mb-8 space-x-4">
            {/* 閲覧数 */}
            {viewCount > 0 && (
              <div className="flex items-center space-x-1">
                <span>👁️</span>
                <span>{viewCount.toLocaleString()}</span>
              </div>
            )}
            <div className="flex items-center space-x-2">
              <FaCalendar />
              <span>
                {format(new Date(announcement.created_at), 'yyyy年M月d日', { locale: ja })}
              </span>
            </div>
            {announcement.publish_end_date && (
              <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                {format(new Date(announcement.publish_end_date), 'M月d日')}まで掲載
              </div>
            )}
          </div>

          {/* 画像 */}
          {announcement.image_url && (
            <div className="mb-8">
              <img
                src={announcement.image_url}
                alt={announcement.title}
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          )}

          {/* 本文 */}
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-700 text-lg leading-relaxed whitespace-pre-wrap">
              {announcement.content}
            </p>
          </div>


          {/* 関連お知らせ */}
          {relatedAnnouncements.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">
                関連するお知らせ
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedAnnouncements.map((item) => {
                  const itemCategory = CATEGORIES[item.category] || CATEGORIES.general;
                  return (
                    <Link
                      key={item.id}
                      to={`/announcements/${item.id}`}
                      className="card hover:shadow-xl transition-shadow duration-300 cursor-pointer"
                    >
                      {/* 画像 */}
                      {item.image_url && (
                        <div className="mb-4">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-40 object-cover rounded-lg"
                          />
                        </div>
                      )}

                      {/* カテゴリバッジ */}
                      <div className="mb-3">
                        <span className={`inline-flex items-center space-x-1 px-3 py-1 ${itemCategory.color} text-white text-xs font-bold rounded-full`}>
                          <span>{itemCategory.icon}</span>
                          <span>{itemCategory.label}</span>
                        </span>
                      </div>

                      {/* タイトル */}
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2">
                        {item.title}
                      </h3>

                      {/* 日付 */}
                      <p className="text-sm text-gray-500">
                        {format(new Date(item.created_at), 'yyyy年M月d日', { locale: ja })}
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* フッター */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <Link
                to="/announcements"
                className="text-primary-orange hover:underline font-medium"
              >
                他のお知らせを見る →
              </Link>
              <Link
                to="/"
                className="btn-primary"
              >
                トップページへ
              </Link>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
