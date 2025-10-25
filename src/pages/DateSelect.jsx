import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday, addMonths, subMonths, getDay } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { getAvailabilityByDate } from '../services/reservationService';

export default function DateSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const area = searchParams.get('area');

  // 初期選択日を明日に設定（当日予約は不可のため）
  const tomorrow = addDays(new Date(), 1);
  const [selectedDate, setSelectedDate] = useState(tomorrow);
  const [selectedTimeSlots, setSelectedTimeSlots] = useState([]); // 複数選択に変更
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [timeSlots, setTimeSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // カレンダー生成
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfToday();

  // 月の最初の日の曜日を取得（月曜始まり: 月=0, 火=1, ..., 日=6）
  const startDayOfWeek = (getDay(monthStart) + 6) % 7; // 日曜=0を月曜=0に変換

  // カレンダーグリッド用の空白セルを生成
  const emptyDays = Array(startDayOfWeek).fill(null);

  // 月の切り替え
  const handlePrevMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };

  // ページマウント時にスクロールをリセット
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // 日付が変更された時に空室状況を取得
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!area) return;

      setIsLoading(true);
      try {
        const dateStr = format(selectedDate, 'yyyy-MM-dd');
        const availability = await getAvailabilityByDate(area, dateStr);
        setTimeSlots(availability);
      } catch (error) {
        console.error('空室状況の取得エラー:', error);
        // エラー時は空配列を設定
        setTimeSlots([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAvailability();
  }, [selectedDate, area]);

  const getStatusColor = (status) => {
    switch(status) {
      case 'available': return 'text-status-available';
      case 'limited': return 'text-status-limited';
      case 'occupied': return 'text-status-occupied';
      default: return 'text-gray-500';
    }
  };

  const getStatusBg = (status) => {
    switch(status) {
      case 'available': return 'bg-green-50 border-green-200 hover:bg-green-100';
      case 'limited': return 'bg-orange-50 border-orange-200 hover:bg-orange-100';
      case 'occupied': return 'bg-gray-100 border-gray-300 cursor-not-allowed';
      default: return 'bg-gray-50';
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'available': return '○';
      case 'limited': return '△';
      case 'occupied': return '×';
      default: return '-';
    }
  };

  // 時間帯の選択/選択解除
  const handleTimeSlotClick = (slotTime) => {
    setSelectedTimeSlots((prev) => {
      if (prev.includes(slotTime)) {
        // 既に選択されている場合は解除
        return prev.filter(t => t !== slotTime);
      } else {
        // 新しく選択
        return [...prev, slotTime].sort((a, b) => {
          const indexA = timeSlots.findIndex(s => s.time === a);
          const indexB = timeSlots.findIndex(s => s.time === b);
          return indexA - indexB;
        });
      }
    });
  };

  // 選択された時間帯が連続しているかチェック
  const areTimeSlotsContinuous = () => {
    if (selectedTimeSlots.length <= 1) return true;

    const indices = selectedTimeSlots.map(time =>
      timeSlots.findIndex(s => s.time === time)
    ).sort((a, b) => a - b);

    for (let i = 1; i < indices.length; i++) {
      if (indices[i] !== indices[i - 1] + 1) {
        return false;
      }
    }
    return true;
  };

  // 選択された時間帯から開始・終了時刻を取得
  const getTimeRange = () => {
    if (selectedTimeSlots.length === 0) return null;

    const sortedSlots = [...selectedTimeSlots].sort((a, b) => {
      const indexA = timeSlots.findIndex(s => s.time === a);
      const indexB = timeSlots.findIndex(s => s.time === b);
      return indexA - indexB;
    });

    const firstSlot = sortedSlots[0];
    const lastSlot = sortedSlots[sortedSlots.length - 1];

    const startTime = firstSlot.split('-')[0];
    const endTime = lastSlot.split('-')[1];

    return `${startTime}-${endTime}`;
  };

  const handleNext = () => {
    const timeRange = getTimeRange();
    if (timeRange && areTimeSlotsContinuous()) {
      navigate(`/reserve/studio?area=${area}&date=${format(selectedDate, 'yyyy-MM-dd')}&time=${timeRange}`);
    }
  };

  const isPastDate = (date) => {
    return isBefore(date, today);
  };

  // 当日かどうかをチェック（当日は予約不可）
  const isTodayDate = (date) => {
    return isSameDay(date, today);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <button
        onClick={() => navigate(-1)}
        className="mb-6 flex items-center text-primary-green hover:text-green-600 transition"
      >
        <FaArrowLeft className="mr-2" />
        戻る
      </button>

      <h1 className="text-2xl md:text-3xl font-bold mb-2 text-gray-800">
        日時を選ぶ
      </h1>
      <p className="text-gray-600 mb-6">
        ご希望の日付と時間を選択してください
      </p>

      {/* 当日予約の注意書き */}
      <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
        <p className="text-sm md:text-base text-blue-800">
          <span className="font-bold">📞 当日予約について：</span>
          当日のご予約はお電話にてお願いいたします。
        </p>
      </div>

      {/* カレンダー */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            📅 {format(currentMonth, 'yyyy年MM月', { locale: ja })}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={handlePrevMonth}
              className="p-2 rounded hover:bg-gray-100 transition"
              aria-label="前の月"
            >
              <FaChevronLeft />
            </button>
            <button
              onClick={handleNextMonth}
              className="p-2 rounded hover:bg-gray-100 transition"
              aria-label="次の月"
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2 mb-2">
          {['月', '火', '水', '木', '金', '土', '日'].map((day) => (
            <div key={day} className="text-center font-bold text-gray-600 p-2 text-sm md:text-base">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 md:gap-2">
          {/* 空白セル */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="p-2 md:p-3"></div>
          ))}

          {/* 日付セル */}
          {daysInMonth.map((day) => {
            const isPast = isPastDate(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);
            const isTodayDisabled = isTodayDate(day); // 当日は選択不可

            return (
              <button
                key={day.toString()}
                onClick={() => !isPast && !isTodayDisabled && setSelectedDate(day)}
                disabled={isPast || isTodayDisabled}
                className={`
                  p-2 md:p-3 rounded-lg text-center transition text-sm md:text-base
                  ${isPast || isTodayDisabled
                    ? 'text-gray-300 cursor-not-allowed'
                    : isSelected
                    ? 'bg-status-selected text-white font-bold shadow-lg scale-105'
                    : isCurrentDay
                    ? 'bg-gray-200 font-bold'
                    : 'hover:bg-gray-100'
                  }
                `}
                title={isTodayDisabled ? '当日予約はお電話でお願いします' : ''}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 時間帯選択 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-2">
          🕐 利用時間（{format(selectedDate, 'M月d日（E）', { locale: ja })}）
        </h2>
        <p className="text-sm text-gray-600 mb-4">
          連続する時間帯を複数選択できます（30分単位）
        </p>

        {/* 選択中の時間帯表示 */}
        {selectedTimeSlots.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-800">選択中: {getTimeRange()}</p>
                <p className="text-sm text-gray-600">
                  {selectedTimeSlots.length}コマ（{selectedTimeSlots.length * 30}分）
                </p>
              </div>
              {!areTimeSlotsContinuous() && (
                <span className="text-red-600 text-sm font-bold">
                  ⚠️ 連続した時間帯を選択してください
                </span>
              )}
            </div>
          </div>
        )}

        {/* 凡例 */}
        <div className="flex flex-wrap gap-4 mb-6 text-sm">
          <div className="flex items-center">
            <span className="text-status-available text-2xl mr-1">○</span>
            <span className="text-gray-600">空室あり</span>
          </div>
          <div className="flex items-center">
            <span className="text-status-limited text-2xl mr-1">△</span>
            <span className="text-gray-600">残りわずか</span>
          </div>
          <div className="flex items-center">
            <span className="text-status-occupied text-2xl mr-1">×</span>
            <span className="text-gray-600">満室</span>
          </div>
        </div>

        {/* ローディング表示 */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : (
          <div className="space-y-2">
            {timeSlots.map((slot) => {
              const isSelected = selectedTimeSlots.includes(slot.time);
              return (
                <button
                  key={slot.time}
                  onClick={() => slot.status !== 'occupied' && handleTimeSlotClick(slot.time)}
                  disabled={slot.status === 'occupied'}
                  className={`
                    w-full p-3 rounded-lg border-2 text-left transition
                    flex items-center justify-between
                    ${isSelected
                      ? 'border-status-selected bg-yellow-50 shadow-md'
                      : getStatusBg(slot.status) + ' border-2'
                    }
                  `}
                >
                  <div className="flex items-center space-x-4">
                    <span className={`text-2xl font-bold ${getStatusColor(slot.status)}`}>
                      {getStatusIcon(slot.status)}
                    </span>
                    <span className="text-base md:text-lg font-medium">{slot.time}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="text-sm text-gray-500">
                      {slot.status === 'occupied' ? '満室' : `空室${slot.available}`}
                    </span>
                    {isSelected && (
                      <span className="text-status-selected font-bold">✓</span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 次へボタン */}
      <div className="mt-8">
        <button
          onClick={handleNext}
          disabled={selectedTimeSlots.length === 0 || !areTimeSlotsContinuous()}
          className={`
            w-full py-4 rounded-lg font-bold text-lg transition
            ${selectedTimeSlots.length > 0 && areTimeSlotsContinuous()
              ? 'btn-primary'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          次へ：スタジオを選ぶ
        </button>
      </div>
    </div>
  );
}
