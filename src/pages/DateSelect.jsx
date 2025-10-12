import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isToday, isBefore, startOfToday } from 'date-fns';
import { ja } from 'date-fns/locale';
import { FaArrowLeft, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export default function DateSelect() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const area = searchParams.get('area');

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(null);

  // カレンダー生成（今月のみ表示）
  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const today = startOfToday();

  // 時間帯データ（ダミー）- イオンシネマ風
  const timeSlots = [
    { time: '10:00-11:00', available: 7, status: 'available' },
    { time: '11:00-12:00', available: 5, status: 'available' },
    { time: '13:00-14:00', available: 6, status: 'available' },
    { time: '14:00-15:00', available: 2, status: 'limited' },
    { time: '15:00-16:00', available: 0, status: 'occupied' },
    { time: '16:00-17:00', available: 4, status: 'available' },
    { time: '17:00-18:00', available: 3, status: 'available' },
    { time: '18:00-19:00', available: 4, status: 'available' },
    { time: '19:00-20:00', available: 6, status: 'available' },
  ];

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

  const handleNext = () => {
    if (selectedTime) {
      navigate(`/reserve/studio?area=${area}&date=${format(selectedDate, 'yyyy-MM-dd')}&time=${selectedTime}`);
    }
  };

  const isPastDate = (date) => {
    return isBefore(date, today);
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

      {/* カレンダー */}
      <div className="card mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">
            📅 {format(new Date(), 'yyyy年MM月', { locale: ja })}
          </h2>
          <div className="flex space-x-2">
            <button className="p-2 rounded hover:bg-gray-100 transition">
              <FaChevronLeft />
            </button>
            <button className="p-2 rounded hover:bg-gray-100 transition">
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
          {daysInMonth.map((day) => {
            const isPast = isPastDate(day);
            const isSelected = isSameDay(day, selectedDate);
            const isCurrentDay = isToday(day);

            return (
              <button
                key={day.toString()}
                onClick={() => !isPast && setSelectedDate(day)}
                disabled={isPast}
                className={`
                  p-2 md:p-3 rounded-lg text-center transition text-sm md:text-base
                  ${isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : isSelected
                    ? 'bg-status-selected text-white font-bold shadow-lg scale-105'
                    : isCurrentDay
                    ? 'bg-blue-100 hover:bg-blue-200 font-bold'
                    : 'hover:bg-gray-100'
                  }
                `}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 時間帯選択 */}
      <div className="card">
        <h2 className="text-xl font-bold mb-4">
          🕐 利用時間（{format(selectedDate, 'M月d日（E）', { locale: ja })}）
        </h2>

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

        <div className="space-y-3">
          {timeSlots.map((slot) => (
            <button
              key={slot.time}
              onClick={() => slot.status !== 'occupied' && setSelectedTime(slot.time)}
              disabled={slot.status === 'occupied'}
              className={`
                w-full p-4 rounded-lg border-2 text-left transition
                flex items-center justify-between
                ${selectedTime === slot.time
                  ? 'border-status-selected bg-yellow-50 shadow-md scale-105'
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
              <span className="text-sm text-gray-500">
                {slot.status === 'occupied' ? '満室' : `空室${slot.available}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* 次へボタン */}
      <div className="mt-8">
        <button
          onClick={handleNext}
          disabled={!selectedTime}
          className={`
            w-full py-4 rounded-lg font-bold text-lg transition
            ${selectedTime
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
