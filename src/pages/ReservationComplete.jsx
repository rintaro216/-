import { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { studioData } from '../data/studioData';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { FaCheckCircle, FaHome, FaCalendarPlus, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function ReservationComplete() {
  const [searchParams] = useSearchParams();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  const reservationId = searchParams.get('reservationId');
  const area = searchParams.get('area');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const studioId = searchParams.get('studio');
  const userType = searchParams.get('userType');
  const price = searchParams.get('price');
  const name = decodeURIComponent(searchParams.get('name') || '');

  const areaData = studioData[area];
  const studio = areaData?.studios.find(s => s.id === studioId);

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      {/* 完了メッセージ */}
      <motion.div
        className="text-center mb-8"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
        >
          <FaCheckCircle className="text-6xl md:text-8xl text-primary-green mx-auto mb-4" />
        </motion.div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
          予約が完了しました！
        </h1>
        <p className="text-gray-600">
          ご予約ありがとうございます
        </p>
      </motion.div>

      {/* 予約番号 */}
      <motion.div
        className="card bg-primary-orange text-white text-center mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <p className="text-sm mb-2">予約番号</p>
        <p className="text-4xl md:text-5xl font-bold tracking-widest font-mono">
          {reservationId}
        </p>
        <p className="text-xs mt-3 opacity-90">
          当日、受付でこの番号をお伝えください
        </p>
        <p className="text-xs mt-1 opacity-75">
          キャンセル時もこの番号が必要です
        </p>
      </motion.div>

      {/* 予約内容 */}
      <motion.div
        className="card mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="font-bold text-xl mb-4 flex items-center">
          📅 ご予約内容
        </h2>
        <div className="border-t border-gray-200 pt-4 space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600">予約者名</span>
            <span className="font-bold">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">エリア</span>
            <span className="font-bold">{areaData?.area}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">スタジオ</span>
            <span className="font-bold">{studio?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">日時</span>
            <span className="font-bold">
              {date && format(new Date(date), 'yyyy年M月d日（E）', { locale: ja })}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">時間</span>
            <span className="font-bold">{time}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">利用区分</span>
            <span className="font-bold">{userType === 'student' ? '生徒' : '一般'}</span>
          </div>
          <div className="flex justify-between border-t border-gray-200 pt-3 mt-3">
            <span className="text-gray-600 font-bold">料金（当日現金払い）</span>
            <span className="font-bold text-2xl text-primary-orange">
              {parseInt(price).toLocaleString()}円
            </span>
          </div>
        </div>
      </motion.div>

      {/* アクセス情報 */}
      <motion.div
        className="card bg-blue-50 border-2 border-blue-200 mb-6"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <h2 className="font-bold text-lg mb-3 flex items-center">
          📍 アクセス
        </h2>
        <p className="text-gray-700 mb-2">
          <span className="font-bold">住所：</span>{areaData?.address}
        </p>
        <p className="text-gray-700">
          <span className="font-bold">アクセス：</span>地下鉄鶴舞線「いりなか駅」1番出口より徒歩2分
        </p>
      </motion.div>

      {/* 注意事項 */}
      <motion.div
        className="card bg-yellow-50 border-2 border-yellow-200 mb-8"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h2 className="font-bold text-lg mb-3 flex items-center">
          ⚠️ 注意事項
        </h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>開始時刻の5分前にお越しください</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>受付でお名前と予約番号をお伝えください</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>お支払いは当日、受付にて現金でお願いします</span>
          </li>
          <li className="flex items-start">
            <span className="mr-2">•</span>
            <span>キャンセルは予約日の24時間前まで可能です（下記ボタンから）</span>
          </li>
        </ul>
      </motion.div>

      {/* アクションボタン */}
      <motion.div
        className="space-y-3"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        <Link to="/reservation/check" className="block">
          <button className="btn-primary w-full text-lg py-4 flex items-center justify-center">
            <FaSearch className="mr-2" />
            予約確認・キャンセル
          </button>
        </Link>

        <Link to="/" className="block">
          <button className="btn-secondary w-full text-lg py-4 flex items-center justify-center">
            <FaHome className="mr-2" />
            ホームに戻る
          </button>
        </Link>
      </motion.div>

      {/* フッター情報 */}
      <motion.div
        className="mt-8 text-center text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
      >
        <p>ご不明な点がございましたら、お気軽にお問い合わせください</p>
        <p className="font-bold mt-2">📞 052-836-0811</p>
      </motion.div>
    </div>
  );
}
