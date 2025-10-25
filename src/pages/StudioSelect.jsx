import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft, FaBan } from 'react-icons/fa';
import { studioData } from '../data/studioData';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { calculateSlots } from '../utils/timeUtils';

export default function StudioSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const area = searchParams.get('area');
  const date = searchParams.get('date');
  const time = searchParams.get('time');

  const [blockedStudioIds, setBlockedStudioIds] = useState([]);
  const [reservedStudioIds, setReservedStudioIds] = useState([]);
  const [inactiveStudioIds, setInactiveStudioIds] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const areaData = studioData[area];

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (isSupabaseConfigured() && date && time) {
      fetchBlockedAndReservedStudios();
    } else {
      setIsLoading(false);
    }
  }, [date, time, area]);

  const fetchBlockedAndReservedStudios = async () => {
    try {
      const [startTime] = time.split('-');

      // ブロックされたスタジオを取得
      const { data: blocked } = await supabase
        .from('blocked_slots')
        .select('studio_id')
        .eq('blocked_date', date)
        .lte('start_time', startTime + ':00')
        .gt('end_time', startTime + ':00');

      // 予約済みスタジオを取得
      const { data: reserved } = await supabase
        .from('reservations')
        .select('studio_id')
        .eq('reservation_date', date)
        .eq('start_time', startTime + ':00')
        .eq('status', 'confirmed');

      // 休止中のスタジオを取得
      const { data: inactive } = await supabase
        .from('studios')
        .select('id')
        .eq('area', area)
        .eq('is_active', false);

      setBlockedStudioIds(blocked?.map(b => b.studio_id) || []);
      setReservedStudioIds(reserved?.map(r => r.studio_id) || []);
      setInactiveStudioIds(inactive?.map(i => i.id) || []);
    } catch (error) {
      console.error('ブロック・予約情報取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

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

{isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {areaData.studios.map((studio) => {
            const isBlocked = blockedStudioIds.includes(studio.id);
            const isReserved = reservedStudioIds.includes(studio.id);
            const isInactive = inactiveStudioIds.includes(studio.id);
            const isAvailable = !isBlocked && !isReserved && !isInactive;

            return (
              <div
                key={studio.id}
                onClick={() => isAvailable && handleStudioSelect(studio.id)}
                className={`card border-2 transform transition ${
                  isAvailable
                    ? 'cursor-pointer hover:scale-102 border-transparent hover:border-primary-orange'
                    : 'opacity-60 cursor-not-allowed border-gray-300'
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className="text-5xl flex-shrink-0">
                    {studio.icon}
                  </div>

                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-xl md:text-2xl font-bold">{studio.name}</h2>
                      {isBlocked && (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded">
                          <FaBan />
                          <span>ブロック中</span>
                        </span>
                      )}
                      {isReserved && !isBlocked && !isInactive && (
                        <span className="px-3 py-1 bg-gray-500 text-white text-sm font-bold rounded">
                          予約済み
                        </span>
                      )}
                      {isInactive && !isBlocked && !isReserved && (
                        <span className="flex items-center space-x-1 px-3 py-1 bg-orange-500 text-white text-sm font-bold rounded">
                          <FaBan />
                          <span>休止中</span>
                        </span>
                      )}
                    </div>

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
                        <p className="text-sm text-gray-600">料金（30分単位）</p>
                        <p className="text-lg font-bold text-primary-orange">
                          一般 {studio.pricing.general.toLocaleString()}円 /
                          生徒 {studio.pricing.student.toLocaleString()}円
                        </p>
                      </div>
                      <button
                        className={`px-6 py-2 ${
                          isAvailable
                            ? 'btn-primary'
                            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }`}
                        disabled={!isAvailable}
                      >
                        {isAvailable ? '選択する' : '利用不可'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-900 mb-2">
          ⚠️ 料金について
        </h3>
        <p className="text-sm text-yellow-800">
          表示されている料金は30分あたりの金額です。選択した時間数に応じて料金が計算されます。
        </p>
      </div>
    </div>
  );
}
