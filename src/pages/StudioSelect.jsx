import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { studioData } from '../data/studioData';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

export default function StudioSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const area = searchParams.get('area');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const areaData = studioData[area];

  if (!areaData) {
    return <div>エリアが見つかりません</div>;
  }

  const handleStudioSelect = (studioId) => {
    navigate(`/reserve/user-type?area=${area}&date=${date}&time=${time}&studio=${studioId}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-primary-green hover:text-green-600 transition"
      >
        <FaArrowLeft className="mr-2" />
        戻る
      </button>

      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
        スタジオを選ぶ
      </h1>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-gray-700">
          <span className="font-bold">{areaData.area}</span> ／
          <span className="ml-2">{date && format(new Date(date), 'M月d日（E）', { locale: ja })}</span> ／
          <span className="ml-2">{time}</span>
        </p>
      </div>

      <div className="space-y-4">
        {areaData.studios.map((studio) => (
          <div
            key={studio.id}
            onClick={() => handleStudioSelect(studio.id)}
            className="card cursor-pointer hover:scale-102 transform transition border-2 border-transparent hover:border-primary-orange"
          >
            <div className="flex items-start space-x-4">
              <div className="text-5xl flex-shrink-0">
                {studio.icon}
              </div>

              <div className="flex-grow">
                <h2 className="text-xl md:text-2xl font-bold mb-2">{studio.name}</h2>

                <div className="grid md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">設備</p>
                    <ul className="text-sm text-gray-700">
                      {studio.equipment.map((item, index) => (
                        <li key={index}>• {item}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className="text-sm text-gray-600 mb-1">特徴</p>
                    <ul className="text-sm text-gray-700">
                      {studio.features.map((feature, index) => (
                        <li key={index}>• {feature}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">料金（1時間）</p>
                    <p className="text-lg font-bold text-primary-orange">
                      一般 {studio.pricing.general.toLocaleString()}円 /
                      生徒 {studio.pricing.student.toLocaleString()}円
                    </p>
                  </div>
                  <button className="btn-primary px-6 py-2">
                    選択する
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-900 mb-2">
          ⚠️ 料金について
        </h3>
        <p className="text-sm text-yellow-800">
          表示されている料金は1時間あたりの金額です。次のステップで利用者区分（一般・生徒）を選択していただきます。
        </p>
      </div>
    </div>
  );
}
