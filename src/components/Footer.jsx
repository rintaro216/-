import { FaPhone, FaMapMarkerAlt, FaClock } from 'react-icons/fa';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-3 gap-8">
          {/* おんぷ館情報 */}
          <div>
            <h3 className="text-lg font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">🎵</span>
              おんぷ館
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p className="flex items-start">
                <FaMapMarkerAlt className="mt-1 mr-2 flex-shrink-0" />
                <span>〒466-0833<br />愛知県名古屋市昭和区隼人町3-10</span>
              </p>
              <p className="flex items-center">
                <FaPhone className="mr-2" />
                <span>052-836-0811</span>
              </p>
              <p className="flex items-start">
                <FaClock className="mt-1 mr-2 flex-shrink-0" />
                <span>営業時間: 10:00-20:00</span>
              </p>
            </div>
          </div>

          {/* アクセス */}
          <div>
            <h3 className="text-lg font-bold mb-4">アクセス</h3>
            <div className="text-sm text-gray-300 space-y-2">
              <p>地下鉄鶴舞線「いりなか駅」</p>
              <p>1番出口より徒歩2分</p>
              <p className="mt-4 text-xs text-gray-400">
                駅から非常に近く、アクセス抜群です
              </p>
            </div>
          </div>

          {/* リンク */}
          <div>
            <h3 className="text-lg font-bold mb-4">ご利用案内</h3>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>
                <a href="#" className="hover:text-primary-orange transition">利用規約</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-orange transition">キャンセルポリシー</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-orange transition">よくある質問</a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-orange transition">お問い合わせ</a>
              </li>
            </ul>
          </div>
        </div>

        {/* コピーライト */}
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 おんぷ館. All rights reserved.</p>
          <p className="mt-2">Powered by おんぷタイム</p>
        </div>
      </div>
    </footer>
  );
}
