import NewsSlider from '../components/NewsSlider';
import { Link } from 'react-router-dom';
import { FaMusic, FaDrum, FaSearch } from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ヒーローセクション - お知らせスライドショー */}
      <section className="container mx-auto px-4 py-8">
        <NewsSlider />
      </section>

      {/* 予約確認リンク */}
      <section className="container mx-auto px-4 py-4">
        <div className="max-w-md mx-auto">
          <Link
            to="/reservation/check"
            className="flex items-center justify-center space-x-2 bg-white border-2 border-primary-green text-primary-green px-6 py-3 rounded-lg font-bold hover:bg-green-50 transition shadow-sm"
          >
            <FaSearch />
            <span>予約確認・キャンセル</span>
          </Link>
        </div>
      </section>

      {/* スタジオ予約CTA */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-gray-800">
          🎹 スタジオを予約する
        </h2>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* おんぷ館エリア */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <Link
              to="/reserve/date?area=onpukan"
              className="card hover:scale-105 transform transition block"
            >
              <div className="text-center">
                <FaMusic className="text-5xl md:text-6xl text-primary-green mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">おんぷ館エリア</h3>
                <p className="text-gray-600 mb-4">
                  A〜C室（3部屋）
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  ピアノ・歌・弦楽器対応
                </p>
                <div className="text-primary-orange font-bold mb-4">
                  330円〜/30分
                </div>
                <button className="btn-primary w-full">
                  予約する
                </button>
              </div>
            </Link>
          </motion.div>

          {/* みどり楽器エリア */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link
              to="/reserve/date?area=midori"
              className="card hover:scale-105 transform transition block"
            >
              <div className="text-center">
                <FaDrum className="text-5xl md:text-6xl text-primary-orange mx-auto mb-4" />
                <h3 className="text-xl md:text-2xl font-bold mb-2">みどり楽器エリア</h3>
                <p className="text-gray-600 mb-4">
                  1部屋
                </p>
                <p className="text-sm text-gray-500 mb-6">
                  ドラム・ギター・バンド練習対応<br/>
                  土日のみ営業（10:00-19:00）
                </p>
                <div className="text-primary-orange font-bold mb-4">
                  個人700円・バンド1800円/60分
                </div>
                <button className="btn-primary w-full">
                  予約する
                </button>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* 特徴セクション */}
      <section className="bg-white py-12 mt-8">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
            おんぷ館の特徴
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-4">🚉</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">駅近便利</h3>
              <p className="text-gray-600 text-sm md:text-base">
                地下鉄いりなか駅<br />
                徒歩2分
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-4">🎹</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">充実の設備</h3>
              <p className="text-gray-600 text-sm md:text-base">
                グランドピアノから<br />
                ドラムセットまで
              </p>
            </div>

            <div className="text-center">
              <div className="text-4xl md:text-5xl mb-4">⏰</div>
              <h3 className="text-lg md:text-xl font-bold mb-2">柔軟な予約</h3>
              <p className="text-gray-600 text-sm md:text-base">
                30分から予約可能<br />
                当日予約もOK
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 利用の流れセクション */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-12 text-gray-800">
          ご利用の流れ
        </h2>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-6">
            {[
              { step: 1, title: 'エリアを選ぶ', desc: 'おんぷ館 or みどり楽器' },
              { step: 2, title: '日時を選ぶ', desc: 'カレンダーから希望日時を選択' },
              { step: 3, title: 'スタジオを選ぶ', desc: '空室状況を確認して選択' },
              { step: 4, title: '利用者区分を選ぶ', desc: '一般 or 生徒（料金が異なります）' },
              { step: 5, title: '予約情報を入力', desc: 'お名前・電話番号など' },
              { step: 6, title: '予約完了！', desc: '当日お越しください' },
            ].map((item) => (
              <div key={item.step} className="flex items-start space-x-4 bg-white p-4 rounded-lg shadow">
                <div className="flex-shrink-0 w-10 h-10 bg-primary-orange text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div className="flex-grow">
                  <h4 className="font-bold text-lg">{item.title}</h4>
                  <p className="text-gray-600 text-sm">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link to="/reserve" className="inline-block">
              <button className="btn-primary text-lg px-10 py-4">
                さっそく予約する
              </button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
