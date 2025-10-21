import { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { supabase } from '../lib/supabase';

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
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

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
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
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
        {announcements.map((announcement) => (
          <SwiperSlide key={announcement.id}>
            <div className={`h-full flex items-center justify-center p-8 text-white ${
              announcement.priority === 'important'
                ? 'bg-gradient-to-r from-red-500 to-orange-500'
                : 'bg-gradient-to-r from-primary-green to-primary-orange'
            }`}>
              <div className="text-center max-w-2xl">
                {announcement.priority === 'important' && (
                  <div className="mb-4">
                    <span className="px-4 py-2 bg-white text-red-600 text-sm font-bold rounded-full">
                      重要なお知らせ
                    </span>
                  </div>
                )}
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  {announcement.title}
                </h2>
                <p className="text-sm md:text-lg mb-6 whitespace-pre-wrap">
                  {announcement.content}
                </p>
                {announcement.image_url && (
                  <div className="mb-6">
                    <img
                      src={announcement.image_url}
                      alt={announcement.title}
                      className="max-h-32 mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                )}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
