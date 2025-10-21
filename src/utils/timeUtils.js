/**
 * 時間範囲から30分単位のコマ数を計算
 * @param {string} timeRange - "10:00-11:30" 形式
 * @returns {number} コマ数
 */
export const calculateSlots = (timeRange) => {
  if (!timeRange || !timeRange.includes('-')) return 1;

  const [start, end] = timeRange.split('-');
  const [startHour, startMin] = start.split(':').map(Number);
  const [endHour, endMin] = end.split(':').map(Number);

  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  const totalMinutes = endMinutes - startMinutes;
  return totalMinutes / 30; // 30分単位
};

/**
 * 時間範囲を分数に変換
 * @param {string} timeRange - "10:00-11:30" 形式
 * @returns {number} 分数
 */
export const calculateMinutes = (timeRange) => {
  return calculateSlots(timeRange) * 30;
};

/**
 * 時間範囲を時間表記に変換（表示用）
 * @param {string} timeRange - "10:00-11:30" 形式
 * @returns {string} "1.5時間" のような形式
 */
export const formatDuration = (timeRange) => {
  const minutes = calculateMinutes(timeRange);
  const hours = minutes / 60;

  if (hours === Math.floor(hours)) {
    return `${hours}時間`;
  } else {
    return `${hours}時間`;
  }
};
