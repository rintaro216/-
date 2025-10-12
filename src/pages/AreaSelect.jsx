import { useNavigate } from 'react-router-dom';
import { FaMusic, FaDrum, FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AreaSelect() {
  const navigate = useNavigate();

  const handleAreaSelect = (area) => {
    navigate(`/reserve/date?area=${area}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate('/')}
        className="mb-6 flex items-center text-primary-green hover:text-green-600 transition"
      >
        <FaArrowLeft className="mr-2" />
        戻る
      </button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
          スタジオエリアを選ぶ
        </h1>
        <p className="text-gray-600 mb-8">
          ご利用されるエリアを選択してください
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* おんぷ館エリア */}
        <motion.div
          onClick={() => handleAreaSelect('onpukan')}
          className="card cursor-pointer hover:scale-105 transform transition border-2 border-transparent hover:border-primary-green"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-center">
            <FaMusic className="text-6xl md:text-7xl text-primary-green mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">おんぷ館エリア</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-gray-700 mb-2">
                <span className="font-bold">スタジオ数：</span>A〜G室（7部屋）
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-bold">設備：</span>ピアノ・歌・弦楽器対応
              </p>
              <p className="text-gray-700">
                <span className="font-bold">料金：</span>660円〜/時間
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>✓ グランドピアノあり（Aスタジオ）</p>
              <p>✓ アップライトピアノ</p>
              <p>✓ 防音室（楽器持込可）</p>
            </div>

            <button className="btn-primary w-full text-lg py-4">
              このエリアを選択
            </button>
          </div>
        </motion.div>

        {/* みどり楽器エリア */}
        <motion.div
          onClick={() => handleAreaSelect('midori')}
          className="card cursor-pointer hover:scale-105 transform transition border-2 border-transparent hover:border-primary-orange"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="text-center">
            <FaDrum className="text-6xl md:text-7xl text-primary-orange mx-auto mb-6" />
            <h2 className="text-2xl md:text-3xl font-bold mb-4">みどり楽器エリア</h2>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-gray-700 mb-2">
                <span className="font-bold">スタジオ数：</span>3部屋
              </p>
              <p className="text-gray-700 mb-2">
                <span className="font-bold">設備：</span>ドラム×2、ギター・ベース×1
              </p>
              <p className="text-gray-700">
                <span className="font-bold">料金：</span>660円〜/時間
              </p>
            </div>

            <div className="space-y-2 text-sm text-gray-600 mb-6">
              <p>✓ ドラムセット完備</p>
              <p>✓ アンプ・エフェクター</p>
              <p>✓ 本格的バンド練習に最適</p>
            </div>

            <button className="btn-primary w-full text-lg py-4">
              このエリアを選択
            </button>
          </div>
        </motion.div>
      </div>

      {/* 注意事項 */}
      <motion.div
        className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.5 }}
      >
        <h3 className="font-bold text-blue-900 mb-2 flex items-center">
          <span className="text-xl mr-2">ℹ️</span>
          ご利用にあたって
        </h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• 料金は利用者区分（一般・生徒）により異なります</li>
          <li>• 当日予約も可能です</li>
          <li>• キャンセルは前日までにお願いします</li>
          <li>• 詳しくはお電話でお問い合わせください（052-836-0811）</li>
        </ul>
      </motion.div>
    </div>
  );
}
