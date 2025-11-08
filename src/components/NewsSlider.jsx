import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { supabase } from '../lib/supabase';

const CATEGORIES = {
  general: { label: '一般', color: 'bg-blue-500', icon: '📰' },
  important: { label: '重要', color: 'bg-red-500', icon: '🚨' },
  maintenance: { label: 'メンテナンス', color: 'bg-yellow-500', icon: '🔧' },
  event: { label: 'イベント', color: 'bg-green-500', icon: '🎉' }
};

export default function NewsSlider() {
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_published', true)
        .or(`publish_start_date.is.null,publish_start_date.lte.${today}`)
        .or(`publish_end_date.is.null,publish_end_date.gte.${today}`)
        .order('is_pinned', { ascending: false })
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('お知らせ取得エラー:', error);
        setAnnouncements([]);
      } else {
        setAnnouncements(data || []);
      }
    } catch (error) {
      console.error('お知らせ取得エラー:', error);
      setAnnouncements([]);
    } finally {
      setIsLoading(false);
    }
  };

  const truncateText = (text, maxLength) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getCategoryGradient = (category) => {
    switch (category) {
      case 'important':
        return 'bg-gradient-to-r from-red-500 to-orange-500';
      case 'maintenance':
        return 'bg-gradient-to-r from-yellow-500 to-orange-400';
      case 'event':
        return 'bg-gradient-to-r from-green-500 to-teal-500';
      default:
        return 'bg-gradient-to-r from-primary-green to-primary-orange';
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden h-64 md:h-80 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden h-64 md:h-80 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <p className="text-xl font-bold mb-2">お知らせはありません</p>
          <p className="text-sm">新しいお知らせをお待ちください</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          pagination={{ clickable: true }}
          navigation={true}
          loop={announcements.length > 1}
          className="h-64 md:h-80"
        >
          {announcements.map((announcement) => {
            const category = CATEGORIES[announcement.category] || CATEGORIES.general;
            const bgGradient = getCategoryGradient(announcement.category);

            return (
              <SwiperSlide key={announcement.id}>
                <Link to={`/announcements/${announcement.id}`} className="block h-full">
                  {announcement.image_url ? (
                    // 画像がある場合
                    <div className="h-full relative">
                      <img
                        src={announcement.image_url}
                        alt={announcement.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-8 text-white">
                        <div className="text-center max-w-2xl">
                          <div className="mb-4">
                            <span className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-gray-800 text-sm font-bold rounded-full">
                              <span>{category.icon}</span>
                              <span>{category.label}</span>
                            </span>
                          </div>
                          <h2 className="text-2xl md:text-4xl font-bold mb-4 drop-shadow-lg">
                            {announcement.title}
                          </h2>
                          <p className="text-sm md:text-lg mb-6 drop-shadow-lg">
                            {truncateText(announcement.content, 120)}
                          </p>
                          <div className="inline-block px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full font-bold transition">
                            詳細を見る →
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // 画像がない場合（従来通りのグラデーション）
                    <div className={`h-full flex items-center justify-center p-8 text-white ${bgGradient}`}>
                      <div className="text-center max-w-2xl">
                        <div className="mb-4">
                          <span className="inline-flex items-center space-x-2 px-4 py-2 bg-white text-gray-800 text-sm font-bold rounded-full">
                            <span>{category.icon}</span>
                            <span>{category.label}</span>
                          </span>
                        </div>
                        <h2 className="text-2xl md:text-4xl font-bold mb-4">
                          {announcement.title}
                        </h2>
                        <p className="text-sm md:text-lg mb-6">
                          {truncateText(announcement.content, 120)}
                        </p>
                        <div className="inline-block px-6 py-2 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full font-bold transition">
                          詳細を見る →
                        </div>
                      </div>
                    </div>
                  )}
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>

      {announcements.length > 0 && (
        <div className="mt-4 text-center">
          <Link
            to="/announcements"
            className="inline-block text-primary-orange hover:text-orange-600 font-bold transition hover:underline"
          >
            すべてのお知らせを見る →
          </Link>
        </div>
      )}
    </div>
  );
}
