import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { newsData } from '../data/newsData';

export default function NewsSlider() {
  return (
    <div className="w-full bg-white rounded-lg shadow-lg overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        spaceBetween={0}
        slidesPerView={1}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        navigation={true}
        loop={true}
        className="h-64 md:h-80"
      >
        {newsData.map((news) => (
          <SwiperSlide key={news.id}>
            <div className="h-full flex items-center justify-center bg-gradient-to-r from-primary-green to-primary-orange p-8 text-white">
              <div className="text-center max-w-2xl">
                <h2 className="text-2xl md:text-4xl font-bold mb-4">
                  {news.title}
                </h2>
                <p className="text-lg md:text-2xl mb-4">
                  {news.subtitle}
                </p>
                <p className="text-sm md:text-lg mb-6">
                  {news.description}
                </p>
                <button className="bg-white text-primary-orange px-6 md:px-8 py-2 md:py-3 rounded-full font-bold hover:bg-yellow-100 transition text-sm md:text-base">
                  詳細を見る
                </button>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
