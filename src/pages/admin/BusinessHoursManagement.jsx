import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FaArrowLeft, FaClock, FaSave, FaCalendar, FaChevronLeft, FaChevronRight, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameMonth, isSameDay, parseISO } from 'date-fns';
import { ja } from 'date-fns/locale/ja';

export default function BusinessHoursManagement({ embedded = false }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('base'); // 'base' or 'calendar'
  const [studios, setStudios] = useState([]);
  const [businessHours, setBusinessHours] = useState([]);
  const [blockedSlots, setBlockedSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // カレンダー用の状態
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [studioAvailability, setStudioAvailability] = useState({});

  const weekDays = [
    { value: 0, label: '日曜日' },
    { value: 1, label: '月曜日' },
    { value: 2, label: '火曜日' },
    { value: 3, label: '水曜日' },
    { value: 4, label: '木曜日' },
    { value: 5, label: '金曜日' },
    { value: 6, label: '土曜日' }
  ];

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedDate && activeTab === 'calendar') {
      loadStudioAvailabilityForDate(selectedDate);
    }
  }, [selectedDate, activeTab]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // スタジオ一覧取得
      const { data: studiosData } = await supabase
        .from('studios')
        .select('*')
        .eq('is_active', true)
        .order('area')
        .order('display_order');

      // 営業時間取得（カレンダータブで使用）
      const { data: hoursData, error: hoursError } = await supabase
        .from('business_hours')
        .select('*')
        .order('area')
        .order('day_of_week');

      // business_hoursテーブルが存在しない場合はエラーを無視
      if (hoursError && hoursError.code !== 'PGRST116' && hoursError.code !== '42P01') {
        console.warn('営業時間データ取得エラー:', hoursError);
      }

      // データがない場合は初期化（テーブルが存在する場合のみ）
      if (!hoursError && (!hoursData || hoursData.length === 0)) {
        await initializeBusinessHours();
      } else if (hoursData) {
        setBusinessHours(hoursData);
      }

      // ブロック一覧取得
      const { data: blocksData } = await supabase
        .from('blocked_slots')
        .select('*')
        .order('blocked_date')
        .order('start_time');

      setStudios(studiosData || []);
      setBlockedSlots(blocksData || []);
    } catch (error) {
      console.error('データ取得エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const initializeBusinessHours = async () => {
    try {
      const defaultHours = [];
      ['onpukan', 'midori'].forEach(area => {
        [0, 1, 2, 3, 4, 5, 6].forEach(day => {
          defaultHours.push({
            area,
            day_of_week: day,
            is_closed: false,
            open_time: '09:00',
            close_time: '22:00'
          });
        });
      });

      const { data, error } = await supabase
        .from('business_hours')
        .insert(defaultHours)
        .select();

      if (error) throw error;
      setBusinessHours(data);
    } catch (error) {
      console.error('初期データ作成エラー:', error);
    }
  };

  const loadStudioAvailabilityForDate = async (date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dayOfWeek = getDay(date);

    const availability = {};

    for (const studio of studios) {
      // 基本営業時間を取得
      const baseHours = businessHours.find(
        h => h.area === studio.area && h.day_of_week === dayOfWeek
      );

      if (!baseHours || baseHours.is_closed) {
        // 定休日の場合は全て予約不可
        availability[studio.id] = Array(26).fill(false); // 9:00-22:00 = 26コマ（30分刻み）
        continue;
      }

      // 営業時間をブール配列に変換（9:00-22:00の30分刻み）
      const timeSlots = Array(26).fill(false);
      const openHour = parseInt(baseHours.open_time.split(':')[0]);
      const openMinute = parseInt(baseHours.open_time.split(':')[1]);
      const closeHour = parseInt(baseHours.close_time.split(':')[0]);
      const closeMinute = parseInt(baseHours.close_time.split(':')[1]);

      const openIndex = (openHour - 9) * 2 + (openMinute === 30 ? 1 : 0);
      const closeIndex = (closeHour - 9) * 2 + (closeMinute === 30 ? 1 : 0);

      for (let i = openIndex; i < closeIndex; i++) {
        timeSlots[i] = true;
      }

      // ブロックされた時間帯を除外
      const blocks = blockedSlots.filter(
        b => b.studio_id === studio.id && b.blocked_date === dateStr
      );

      blocks.forEach(block => {
        const startHour = parseInt(block.start_time.split(':')[0]);
        const startMinute = parseInt(block.start_time.split(':')[1]);
        const endHour = parseInt(block.end_time.split(':')[0]);
        const endMinute = parseInt(block.end_time.split(':')[1]);

        const startIndex = (startHour - 9) * 2 + (startMinute === 30 ? 1 : 0);
        const endIndex = (endHour - 9) * 2 + (endMinute === 30 ? 1 : 0);

        for (let i = startIndex; i < endIndex; i++) {
          timeSlots[i] = false;
        }
      });

      availability[studio.id] = timeSlots;
    }

    setStudioAvailability(availability);
  };

  const toggleTimeSlot = async (studioId, slotIndex) => {
    const studio = studios.find(s => s.id === studioId);
    if (!studio) return;

    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const newAvailability = { ...studioAvailability };
    const currentValue = newAvailability[studioId][slotIndex];
    newAvailability[studioId][slotIndex] = !currentValue;

    // 時間を計算
    const hour = Math.floor(slotIndex / 2) + 9;
    const minute = slotIndex % 2 === 0 ? 0 : 30;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const nextHour = Math.floor((slotIndex + 1) / 2) + 9;
    const nextMinute = (slotIndex + 1) % 2 === 0 ? 0 : 30;
    const nextTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

    try {
      if (!currentValue) {
        // 予約可能にする = ブロックを削除
        const { error } = await supabase
          .from('blocked_slots')
          .delete()
          .eq('studio_id', studioId)
          .eq('blocked_date', dateStr)
          .eq('start_time', timeStr)
          .eq('end_time', nextTimeStr);

        if (error) throw error;
      } else {
        // 予約不可にする = ブロックを追加
        const { error } = await supabase
          .from('blocked_slots')
          .insert([{
            studio_id: studioId,
            blocked_date: dateStr,
            start_time: timeStr,
            end_time: nextTimeStr,
            reason: '管理画面から設定',
            reason_category: 'other'
          }]);

        if (error && error.code !== '23505') throw error; // 重複エラーは無視
      }

      setStudioAvailability(newAvailability);
      await fetchData(); // ブロック一覧を再取得
    } catch (error) {
      console.error('時間帯切り替えエラー:', error);
      alert('時間帯の切り替えに失敗しました');
    }
  };

  const getAreaName = (area) => {
    return area === 'onpukan' ? 'おんぷ館' : 'みどり楽器';
  };

  // カレンダー関連の関数
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const calendarDays = [];
  const startDayOfWeek = getDay(monthStart);

  // 前月の日付で埋める
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // 当月の日付
  daysInMonth.forEach(day => {
    calendarDays.push(day);
  });

  return (
    <div className={embedded ? '' : 'min-h-screen bg-gray-100'}>
      {/* ヘッダー */}
      {!embedded && (
        <header className="bg-white shadow-md">
          <div className="container mx-auto px-4 py-4">
            <button
              onClick={() => navigate('/admin/dashboard')}
              className="flex items-center text-primary-green hover:text-green-600 transition mb-2"
            >
              <FaArrowLeft className="mr-2" />
              ダッシュボードに戻る
            </button>
            <h1 className="text-2xl font-bold text-gray-800">営業時間管理</h1>
            <p className="text-sm text-gray-600">基本設定とカレンダーで営業時間を管理</p>
          </div>
        </header>
      )}

      {/* タブナビゲーション */}
      <div className="bg-white shadow-sm border-b">
        <div className={embedded ? 'px-4' : 'container mx-auto px-4'}>
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('base')}
              className={`px-6 py-3 font-bold transition border-b-4 ${
                activeTab === 'base'
                  ? 'border-primary-green text-primary-green bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaClock className="inline mr-2" />
              基本設定（曜日ベース）
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-6 py-3 font-bold transition border-b-4 ${
                activeTab === 'calendar'
                  ? 'border-primary-green text-primary-green bg-green-50'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <FaCalendar className="inline mr-2" />
              カレンダー（日付ごと設定）
            </button>
          </div>
        </div>
      </div>

      {/* メインコンテンツ */}
      <main className={embedded ? 'py-6' : 'container mx-auto px-4 py-8'}>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
          </div>
        ) : (
          <>
            {activeTab === 'base' && <BaseSettingsTab businessHours={businessHours} weekDays={weekDays} onUpdate={fetchData} />}
            {activeTab === 'calendar' && (
              <CalendarTab
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                selectedDate={selectedDate}
                setSelectedDate={setSelectedDate}
                calendarDays={calendarDays}
                studios={studios}
                studioAvailability={studioAvailability}
                toggleTimeSlot={toggleTimeSlot}
                getAreaName={getAreaName}
              />
            )}
          </>
        )}
      </main>
    </div>
  );
}

// 基本設定タブコンポーネント（スタジオごと・曜日ごとの設定）
function BaseSettingsTab({ businessHours, weekDays, onUpdate }) {
  const [studios, setStudios] = useState([]);
  const [studioWeeklyBlocks, setStudioWeeklyBlocks] = useState({});
  const [isDragging, setIsDragging] = useState(false);
  const [dragStudioId, setDragStudioId] = useState(null);
  const [dragDayOfWeek, setDragDayOfWeek] = useState(null);
  const [dragStartValue, setDragStartValue] = useState(null);
  const [expandedStudios, setExpandedStudios] = useState({});

  useEffect(() => {
    fetchStudiosAndBlocks();
  }, []);

  const fetchStudiosAndBlocks = async () => {
    try {
      // スタジオ一覧取得（全てのスタジオを表示）
      const { data: studiosData, error: studiosError } = await supabase
        .from('studios')
        .select('*')
        .order('area')
        .order('display_order');

      if (studiosError) {
        console.error('スタジオ取得エラー:', studiosError);
      }

      console.log('取得したスタジオ数:', studiosData?.length);
      console.log('スタジオ一覧:', studiosData);

      setStudios(studiosData || []);

      // 曜日別ブロック設定を取得（weekly_blocked_slotsテーブル）
      const { data: blocksData } = await supabase
        .from('weekly_blocked_slots')
        .select('*');

      // スタジオごと・曜日ごとの時間帯配列に変換
      const weeklyAvailability = {};
      studiosData?.forEach(studio => {
        weeklyAvailability[studio.id] = {};
        [0, 1, 2, 3, 4, 5, 6].forEach(day => {
          // デフォルトは全時間帯利用可能（9:00-22:00 = 26コマ）
          weeklyAvailability[studio.id][day] = Array(26).fill(true);
        });
      });

      // ブロックデータを反映
      blocksData?.forEach(block => {
        const studioId = block.studio_id;
        const dayOfWeek = block.day_of_week;
        const startHour = parseInt(block.start_time.split(':')[0]);
        const startMinute = parseInt(block.start_time.split(':')[1]);
        const endHour = parseInt(block.end_time.split(':')[0]);
        const endMinute = parseInt(block.end_time.split(':')[1]);

        const startIndex = (startHour - 9) * 2 + (startMinute === 30 ? 1 : 0);
        const endIndex = (endHour - 9) * 2 + (endMinute === 30 ? 1 : 0);

        if (weeklyAvailability[studioId] && weeklyAvailability[studioId][dayOfWeek]) {
          for (let i = startIndex; i < endIndex; i++) {
            weeklyAvailability[studioId][dayOfWeek][i] = false;
          }
        }
      });

      setStudioWeeklyBlocks(weeklyAvailability);
    } catch (error) {
      console.error('データ取得エラー:', error);
    }
  };

  const toggleTimeSlot = async (studioId, dayOfWeek, slotIndex) => {
    const currentValue = studioWeeklyBlocks[studioId]?.[dayOfWeek]?.[slotIndex];
    if (currentValue === undefined) return;

    const newValue = !currentValue;

    // UIを即座に更新
    const newBlocks = { ...studioWeeklyBlocks };
    newBlocks[studioId][dayOfWeek][slotIndex] = newValue;
    setStudioWeeklyBlocks(newBlocks);

    // 時間を計算
    const hour = Math.floor(slotIndex / 2) + 9;
    const minute = slotIndex % 2 === 0 ? 0 : 30;
    const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
    const nextHour = Math.floor((slotIndex + 1) / 2) + 9;
    const nextMinute = (slotIndex + 1) % 2 === 0 ? 0 : 30;
    const nextTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

    try {
      if (newValue) {
        // 利用可能にする = ブロックを削除
        await supabase
          .from('weekly_blocked_slots')
          .delete()
          .eq('studio_id', studioId)
          .eq('day_of_week', dayOfWeek)
          .eq('start_time', timeStr)
          .eq('end_time', nextTimeStr);
      } else {
        // 利用不可にする = ブロックを追加
        await supabase
          .from('weekly_blocked_slots')
          .insert([{
            studio_id: studioId,
            day_of_week: dayOfWeek,
            start_time: timeStr,
            end_time: nextTimeStr,
            reason: '曜日別定期ブロック'
          }]);
      }
    } catch (error) {
      console.error('時間帯切り替えエラー:', error);
      // エラー時は元に戻す
      newBlocks[studioId][dayOfWeek][slotIndex] = currentValue;
      setStudioWeeklyBlocks(newBlocks);
    }
  };

  // 一括操作：全て利用可能にする
  const setAllAvailable = async (studioId, dayOfWeek) => {
    const newBlocks = { ...studioWeeklyBlocks };
    newBlocks[studioId][dayOfWeek] = Array(26).fill(true);
    setStudioWeeklyBlocks(newBlocks);

    try {
      // その曜日の全ブロックを削除
      await supabase
        .from('weekly_blocked_slots')
        .delete()
        .eq('studio_id', studioId)
        .eq('day_of_week', dayOfWeek);
    } catch (error) {
      console.error('一括設定エラー:', error);
      await fetchStudiosAndBlocks();
    }
  };

  // 一括操作：全て利用不可にする
  const setAllUnavailable = async (studioId, dayOfWeek) => {
    const newBlocks = { ...studioWeeklyBlocks };
    newBlocks[studioId][dayOfWeek] = Array(26).fill(false);
    setStudioWeeklyBlocks(newBlocks);

    try {
      // 既存のブロックを削除
      await supabase
        .from('weekly_blocked_slots')
        .delete()
        .eq('studio_id', studioId)
        .eq('day_of_week', dayOfWeek);

      // 全時間帯をブロック
      const blocksToInsert = [];
      for (let i = 0; i < 26; i++) {
        const hour = Math.floor(i / 2) + 9;
        const minute = i % 2 === 0 ? 0 : 30;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const nextHour = Math.floor((i + 1) / 2) + 9;
        const nextMinute = (i + 1) % 2 === 0 ? 0 : 30;
        const nextTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

        blocksToInsert.push({
          studio_id: studioId,
          day_of_week: dayOfWeek,
          start_time: timeStr,
          end_time: nextTimeStr,
          reason: '曜日別定期ブロック'
        });
      }

      await supabase
        .from('weekly_blocked_slots')
        .insert(blocksToInsert);
    } catch (error) {
      console.error('一括設定エラー:', error);
      await fetchStudiosAndBlocks();
    }
  };

  // 一括操作：時間範囲を指定して設定
  const setTimeRange = async (studioId, dayOfWeek, startHour, endHour, isAvailable) => {
    const startIndex = (startHour - 9) * 2;
    const endIndex = (endHour - 9) * 2;

    const newBlocks = { ...studioWeeklyBlocks };
    for (let i = startIndex; i < endIndex; i++) {
      newBlocks[studioId][dayOfWeek][i] = isAvailable;
    }
    setStudioWeeklyBlocks(newBlocks);

    try {
      // 指定範囲のブロックを削除
      const blocksToDelete = [];
      for (let i = startIndex; i < endIndex; i++) {
        const hour = Math.floor(i / 2) + 9;
        const minute = i % 2 === 0 ? 0 : 30;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const nextHour = Math.floor((i + 1) / 2) + 9;
        const nextMinute = (i + 1) % 2 === 0 ? 0 : 30;
        const nextTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

        await supabase
          .from('weekly_blocked_slots')
          .delete()
          .eq('studio_id', studioId)
          .eq('day_of_week', dayOfWeek)
          .eq('start_time', timeStr)
          .eq('end_time', nextTimeStr);
      }

      // 利用不可の場合はブロックを追加
      if (!isAvailable) {
        const blocksToInsert = [];
        for (let i = startIndex; i < endIndex; i++) {
          const hour = Math.floor(i / 2) + 9;
          const minute = i % 2 === 0 ? 0 : 30;
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          const nextHour = Math.floor((i + 1) / 2) + 9;
          const nextMinute = (i + 1) % 2 === 0 ? 0 : 30;
          const nextTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

          blocksToInsert.push({
            studio_id: studioId,
            day_of_week: dayOfWeek,
            start_time: timeStr,
            end_time: nextTimeStr,
            reason: '曜日別定期ブロック'
          });
        }

        await supabase
          .from('weekly_blocked_slots')
          .insert(blocksToInsert);
      }
    } catch (error) {
      console.error('時間範囲設定エラー:', error);
      await fetchStudiosAndBlocks();
    }
  };

  const toggleStudioExpanded = (studioId) => {
    setExpandedStudios(prev => ({
      ...prev,
      [studioId]: !prev[studioId]
    }));
  };

  const handleMouseDown = (studioId, dayOfWeek, slotIndex) => {
    setIsDragging(true);
    setDragStudioId(studioId);
    setDragDayOfWeek(dayOfWeek);
    setDragStartValue(!studioWeeklyBlocks[studioId]?.[dayOfWeek]?.[slotIndex]);
    toggleTimeSlot(studioId, dayOfWeek, slotIndex);
  };

  const handleMouseEnter = (studioId, dayOfWeek, slotIndex) => {
    if (isDragging && studioId === dragStudioId && dayOfWeek === dragDayOfWeek) {
      const currentValue = studioWeeklyBlocks[studioId]?.[dayOfWeek]?.[slotIndex];
      if (currentValue !== dragStartValue) {
        toggleTimeSlot(studioId, dayOfWeek, slotIndex);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStudioId(null);
    setDragDayOfWeek(null);
    setDragStartValue(null);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const timeLabels = [];
  for (let h = 9; h <= 21; h++) {
    timeLabels.push(`${h}時`);
  }

  const getAreaName = (area) => {
    return area === 'onpukan' ? 'おんぷ館' : 'みどり楽器';
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>基本設定：</strong>スタジオごとに曜日別のデフォルト利用可否を設定します。カレンダータブで日付ごとの例外を設定できます。
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
        <p className="text-sm text-yellow-800">
          <strong>操作方法：</strong>時間帯をクリックまたはドラッグで利用可能/不可を切り替えられます。■ = 利用可能、□ = 利用不可
        </p>
      </div>

      {studios.map((studio) => {
        const isExpanded = expandedStudios[studio.id];

        return (
          <div key={studio.id} className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* アコーディオンヘッダー */}
            <button
              onClick={() => toggleStudioExpanded(studio.id)}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition"
            >
              <div className="flex items-center">
                <span className="text-3xl mr-3">{studio.icon}</span>
                <div className="text-left">
                  <h2 className="text-xl font-bold">
                    {getAreaName(studio.area)} - {studio.display_name}
                  </h2>
                  <p className="text-sm text-gray-600">曜日別の利用可否設定</p>
                </div>
              </div>
              <div className="text-2xl text-gray-400">
                {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </div>
            </button>

            {/* アコーディオンコンテンツ */}
            {isExpanded && (
              <div className="p-6 pt-0 border-t space-y-4">
                {weekDays.map((day) => {
                  const availability = studioWeeklyBlocks[studio.id]?.[day.value] || Array(26).fill(true);

                  return (
                    <div key={`${studio.id}-${day.value}`} className="border-2 border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-bold text-gray-700 text-lg">
                          {day.label}
                        </div>

                        {/* 一括操作ボタン */}
                        <div className="flex gap-2">
                          <button
                            onClick={() => setAllAvailable(studio.id, day.value)}
                            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                          >
                            全て利用可能
                          </button>
                          <button
                            onClick={() => setAllUnavailable(studio.id, day.value)}
                            className="px-3 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition"
                          >
                            全て利用不可
                          </button>
                          <button
                            onClick={() => setTimeRange(studio.id, day.value, 9, 18, true)}
                            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                          >
                            9-18時を利用可能
                          </button>
                        </div>
                      </div>

                      {/* 時間帯ボタン（30分単位で横に並べる） */}
                      <div className="overflow-x-auto">
                        <div className="flex gap-0.5 min-w-max" onMouseLeave={handleMouseUp}>
                          {availability.map((isAvailable, i) => {
                            const hour = Math.floor(i / 2) + 9;
                            const minute = i % 2 === 0 ? '00' : '30';
                            const nextHour = Math.floor((i + 1) / 2) + 9;
                            const nextMinute = (i + 1) % 2 === 0 ? '00' : '30';

                            return (
                              <button
                                key={i}
                                onMouseDown={() => handleMouseDown(studio.id, day.value, i)}
                                onMouseEnter={() => handleMouseEnter(studio.id, day.value, i)}
                                className={`w-12 h-12 rounded transition text-xs font-medium ${
                                  isAvailable
                                    ? 'bg-green-500 hover:bg-green-600 text-white'
                                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                                }`}
                                title={`${hour}:${minute} - ${nextHour}:${nextMinute}`}
                              >
                                {i % 2 === 0 ? `${hour}` : ''}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// カレンダータブコンポーネント
function CalendarTab({ currentMonth, setCurrentMonth, selectedDate, setSelectedDate, calendarDays, studios, studioAvailability, toggleTimeSlot, getAreaName }) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStudioId, setDragStudioId] = useState(null);
  const [dragStartValue, setDragStartValue] = useState(null);

  // 一括操作：全て予約可能にする
  const setAllAvailableForDate = async (studioId) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      // その日のスタジオの全ブロックを削除
      await supabase
        .from('blocked_slots')
        .delete()
        .eq('studio_id', studioId)
        .eq('blocked_date', dateStr);

      // 親コンポーネントに再読み込みを要求
      window.location.reload();
    } catch (error) {
      console.error('一括設定エラー:', error);
    }
  };

  // 一括操作：全て予約不可にする
  const setAllUnavailableForDate = async (studioId) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');

    try {
      // 既存のブロックを削除
      await supabase
        .from('blocked_slots')
        .delete()
        .eq('studio_id', studioId)
        .eq('blocked_date', dateStr);

      // 全時間帯をブロック
      const blocksToInsert = [];
      for (let i = 0; i < 26; i++) {
        const hour = Math.floor(i / 2) + 9;
        const minute = i % 2 === 0 ? 0 : 30;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const nextHour = Math.floor((i + 1) / 2) + 9;
        const nextMinute = (i + 1) % 2 === 0 ? 0 : 30;
        const nextTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

        blocksToInsert.push({
          studio_id: studioId,
          blocked_date: dateStr,
          start_time: timeStr,
          end_time: nextTimeStr,
          reason: '日付別ブロック',
          reason_category: 'other'
        });
      }

      await supabase
        .from('blocked_slots')
        .insert(blocksToInsert);

      window.location.reload();
    } catch (error) {
      console.error('一括設定エラー:', error);
    }
  };

  // 一括操作：時間範囲を指定して設定
  const setTimeRangeForDate = async (studioId, startHour, endHour, isAvailable) => {
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    const startIndex = (startHour - 9) * 2;
    const endIndex = (endHour - 9) * 2;

    try {
      // 指定範囲のブロックを削除
      for (let i = startIndex; i < endIndex; i++) {
        const hour = Math.floor(i / 2) + 9;
        const minute = i % 2 === 0 ? 0 : 30;
        const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        const nextHour = Math.floor((i + 1) / 2) + 9;
        const nextMinute = (i + 1) % 2 === 0 ? 0 : 30;
        const nextTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

        await supabase
          .from('blocked_slots')
          .delete()
          .eq('studio_id', studioId)
          .eq('blocked_date', dateStr)
          .eq('start_time', timeStr)
          .eq('end_time', nextTimeStr);
      }

      // 予約不可の場合はブロックを追加
      if (!isAvailable) {
        const blocksToInsert = [];
        for (let i = startIndex; i < endIndex; i++) {
          const hour = Math.floor(i / 2) + 9;
          const minute = i % 2 === 0 ? 0 : 30;
          const timeStr = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
          const nextHour = Math.floor((i + 1) / 2) + 9;
          const nextMinute = (i + 1) % 2 === 0 ? 0 : 30;
          const nextTimeStr = `${String(nextHour).padStart(2, '0')}:${String(nextMinute).padStart(2, '0')}`;

          blocksToInsert.push({
            studio_id: studioId,
            blocked_date: dateStr,
            start_time: timeStr,
            end_time: nextTimeStr,
            reason: '日付別ブロック',
            reason_category: 'other'
          });
        }

        await supabase
          .from('blocked_slots')
          .insert(blocksToInsert);
      }

      window.location.reload();
    } catch (error) {
      console.error('時間範囲設定エラー:', error);
    }
  };

  const handleMouseDown = (studioId, slotIndex) => {
    setIsDragging(true);
    setDragStudioId(studioId);
    setDragStartValue(!studioAvailability[studioId]?.[slotIndex]);
    toggleTimeSlot(studioId, slotIndex);
  };

  const handleMouseEnter = (studioId, slotIndex) => {
    if (isDragging && studioId === dragStudioId) {
      const currentValue = studioAvailability[studioId]?.[slotIndex];
      if (currentValue !== dragStartValue) {
        toggleTimeSlot(studioId, slotIndex);
      }
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragStudioId(null);
    setDragStartValue(null);
  };

  useEffect(() => {
    document.addEventListener('mouseup', handleMouseUp);
    return () => document.removeEventListener('mouseup', handleMouseUp);
  }, []);

  const timeLabels = [];
  for (let h = 9; h <= 21; h++) {
    timeLabels.push(`${h}時`);
  }

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* カレンダー部分 */}
      <div className="col-span-4 bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FaChevronLeft />
          </button>
          <h2 className="text-xl font-bold">
            {format(currentMonth, 'yyyy年M月', { locale: ja })}
          </h2>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <FaChevronRight />
          </button>
        </div>

        {/* 曜日ヘッダー */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['日', '月', '火', '水', '木', '金', '土'].map((day, i) => (
            <div key={i} className={`text-center text-sm font-bold ${i === 0 ? 'text-red-600' : i === 6 ? 'text-blue-600' : 'text-gray-700'}`}>
              {day}
            </div>
          ))}
        </div>

        {/* 日付グリッド */}
        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day, i) => {
            if (!day) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dayOfWeek = getDay(day);

            return (
              <button
                key={i}
                onClick={() => setSelectedDate(day)}
                className={`aspect-square flex items-center justify-center text-sm font-medium rounded-lg transition ${
                  isSelected
                    ? 'bg-primary-green text-white'
                    : isToday
                    ? 'bg-blue-100 text-blue-700'
                    : isSameMonth(day, currentMonth)
                    ? 'hover:bg-gray-100'
                    : 'text-gray-400'
                } ${
                  dayOfWeek === 0 ? 'text-red-600' : dayOfWeek === 6 ? 'text-blue-600' : ''
                }`}
              >
                {format(day, 'd')}
              </button>
            );
          })}
        </div>
      </div>

      {/* 詳細パネル */}
      <div className="col-span-8 bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold mb-6">
          {format(selectedDate, 'yyyy年M月d日(E)', { locale: ja })} の営業状況
        </h2>

        <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 mb-6">
          <p className="text-sm text-yellow-800">
            <strong>操作方法：</strong>時間帯をクリックまたはドラッグで予約可能/不可を切り替えられます。■ = 予約可能、□ = 予約不可
          </p>
        </div>

        <div className="space-y-6">
          {studios.map((studio) => {
            const availability = studioAvailability[studio.id] || Array(26).fill(false);

            return (
              <div key={studio.id} className="border-2 border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{studio.icon}</span>
                    <span className="font-bold text-lg">
                      {getAreaName(studio.area)} - {studio.display_name}
                    </span>
                  </div>

                  {/* 一括操作ボタン */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAllAvailableForDate(studio.id)}
                      className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition"
                    >
                      全て予約可能
                    </button>
                    <button
                      onClick={() => setAllUnavailableForDate(studio.id)}
                      className="px-3 py-1 bg-gray-400 text-white text-xs rounded hover:bg-gray-500 transition"
                    >
                      全て予約不可
                    </button>
                    <button
                      onClick={() => setTimeRangeForDate(studio.id, 9, 18, true)}
                      className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition"
                    >
                      9-18時を予約可能
                    </button>
                  </div>
                </div>

                {/* 時間帯ボタン（30分単位で横に並べる） */}
                <div className="overflow-x-auto">
                  <div className="flex gap-0.5 min-w-max" onMouseLeave={handleMouseUp}>
                    {availability.map((isAvailable, i) => {
                      const hour = Math.floor(i / 2) + 9;
                      const minute = i % 2 === 0 ? '00' : '30';
                      const nextHour = Math.floor((i + 1) / 2) + 9;
                      const nextMinute = (i + 1) % 2 === 0 ? '00' : '30';

                      return (
                        <button
                          key={i}
                          onMouseDown={() => handleMouseDown(studio.id, i)}
                          onMouseEnter={() => handleMouseEnter(studio.id, i)}
                          className={`w-12 h-12 rounded transition text-xs font-medium ${
                            isAvailable
                              ? 'bg-green-500 hover:bg-green-600 text-white'
                              : 'bg-gray-300 hover:bg-gray-400 text-gray-700'
                          }`}
                          title={`${hour}:${minute} - ${nextHour}:${nextMinute}`}
                        >
                          {i % 2 === 0 ? `${hour}` : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
