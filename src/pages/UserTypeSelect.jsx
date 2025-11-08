import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaUserGraduate, FaUsers } from 'react-icons/fa';
import { studioData } from '../data/studioData';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { calculateSlots, calculateMinutes } from '../utils/timeUtils';

export default function UserTypeSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const area = searchParams.get('area');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const studioId = searchParams.get('studio');

  const [selectedType, setSelectedType] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // スタジオ情報を取得
  const areaData = studioData[area];
  const studio = areaData?.studios.find(s => s.id === studioId);

  if (!studio) {
    return <div>スタジオが見つかりません</div>;
  }

  // エリアによって料金計算を切り替え
  const isMidori = area === 'midori';
  const minutes = calculateMinutes(time);
  const hours = minutes / 60;

  // 料金計算とラベル設定
  let price1, price2, label1, label2, Icon1, Icon2, type1, type2, unitText1, unitText2, note;

  if (isMidori) {
    // みどり楽器：個人練習 / バンド練習（1時間単位）
    price1 = studio.pricing.individual * hours;
    price2 = studio.pricing.band * hours;
    label1 = '個人練習';
    label2 = 'バンド練習';
    Icon1 = FaUser;
    Icon2 = FaUsers;
    type1 = 'individual';
    type2 = 'band';
    unitText1 = `${studio.pricing.individual.toLocaleString()}円/1時間 × ${hours}時間`;
    unitText2 = `${studio.pricing.band.toLocaleString()}円/1時間 × ${hours}時間`;
    note = '個人練習はドラム・ギター等の個人利用が対象です';
  } else {
    // おんぷ館：一般 / 生徒（30分単位）
    const slots = calculateSlots(time);
    price1 = studio.pricing.general * slots;
    price2 = studio.pricing.student * slots;
    label1 = '一般のお客様';
    label2 = '生徒さん';
    Icon1 = FaUser;
    Icon2 = FaUserGraduate;
    type1 = 'general';
    type2 = 'student';
    unitText1 = `${studio.pricing.general.toLocaleString()}円/30分 × ${slots}コマ（${minutes}分）`;
    unitText2 = `${studio.pricing.student.toLocaleString()}円/30分 × ${slots}コマ（${minutes}分）`;
    note = '生徒料金は、おんぷ館でレッスンを受講されている方が対象です';
  }

  const handleNext = () => {
    if (selectedType) {
      navigate(`/reserve/form?area=${area}&date=${date}&time=${time}&studio=${studioId}&userType=${selectedType}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-primary-green hover:text-green-600 transition"
      >
        <FaArrowLeft className="mr-2" />
        戻る
      </button>

      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
        {isMidori ? '利用タイプを選ぶ' : '利用者区分を選ぶ'}
      </h1>
      <p className="text-gray-600 mb-6">
        {isMidori 
          ? '個人練習ですか？それともバンド練習ですか？' 
          : 'あなたは一般のお客様ですか？それとも生徒さんですか？'}
      </p>

      {/* 選択中のスタジオ情報 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
        <p className="text-sm text-gray-600 mb-1">選択したスタジオ</p>
        <p className="font-bold text-lg mb-2">
          {areaData.areaDisplayName || areaData.area} {studio.name}
        </p>
        <p className="text-gray-700">
          {date && format(new Date(date), 'M月d日（E）', { locale: ja })} {time}
        </p>
      </div>

      {/* 利用者区分選択 */}
      <div className="space-y-4 mb-8">
        {/* オプション1 */}
        <div
          onClick={() => setSelectedType(type1)}
          className={`
            card cursor-pointer border-2 transition
            ${selectedType === type1
              ? 'border-status-selected bg-yellow-50 shadow-lg scale-105'
              : 'border-gray-200 hover:border-primary-orange'
            }
          `}
        >
          <div className="flex items-center space-x-6">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${selectedType === type1 ? 'bg-primary-orange' : 'bg-gray-100'}
            `}>
              <Icon1 className={`text-3xl ${selectedType === type1 ? 'text-white' : 'text-gray-400'}`} />
            </div>

            <div className="flex-grow">
              <h2 className="text-xl md:text-2xl font-bold mb-2">{label1}</h2>
              <p className="text-2xl md:text-3xl font-bold text-primary-orange">
                {price1.toLocaleString()}円
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {unitText1}
              </p>
            </div>

            {selectedType === type1 && (
              <div className="text-status-selected text-4xl">
                ✓
              </div>
            )}
          </div>
        </div>

        {/* オプション2 */}
        <div
          onClick={() => setSelectedType(type2)}
          className={`
            card cursor-pointer border-2 transition
            ${selectedType === type2
              ? 'border-status-selected bg-yellow-50 shadow-lg scale-105'
              : 'border-gray-200 hover:border-primary-green'
            }
          `}
        >
          <div className="flex items-center space-x-6">
            <div className={`
              w-16 h-16 rounded-full flex items-center justify-center
              ${selectedType === type2 ? 'bg-primary-green' : 'bg-gray-100'}
            `}>
              <Icon2 className={`text-3xl ${selectedType === type2 ? 'text-white' : 'text-gray-400'}`} />
            </div>

            <div className="flex-grow">
              <h2 className="text-xl md:text-2xl font-bold mb-2">{label2}</h2>
              <p className="text-2xl md:text-3xl font-bold text-primary-green">
                {price2.toLocaleString()}円
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {unitText2}
              </p>
              {!isMidori && (
                <p className="text-xs text-gray-500 mt-1">
                  ※レッスン受講中の方
                </p>
              )}
            </div>

            {selectedType === type2 && (
              <div className="text-status-selected text-4xl">
                ✓
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 注意事項 */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <h3 className="font-bold text-gray-900 mb-2">
          💡 料金について
        </h3>
        <ul className="text-sm text-gray-700 space-y-1">
          <li>• 表示料金は選択した時間（{minutes}分）の合計金額です</li>
          <li>• お支払いは当日、受付にて現金でお願いします</li>
          <li>• {note}</li>
        </ul>
      </div>

      {/* 次へボタン */}
      <button
        onClick={handleNext}
        disabled={!selectedType}
        className={`
          w-full py-4 rounded-lg font-bold text-lg transition
          ${selectedType
            ? 'btn-primary'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }
        `}
      >
        次へ：予約者情報を入力
      </button>
    </div>
  );
}
