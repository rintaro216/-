import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { studioData } from '../data/studioData';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';

export default function ReservationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const area = searchParams.get('area');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const studioId = searchParams.get('studio');
  const userType = searchParams.get('userType');

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});

  // スタジオ情報を取得
  const areaData = studioData[area];
  const studio = areaData?.studios.find(s => s.id === studioId);
  const price = userType === 'student' ? studio?.pricing.student : studio?.pricing.general;

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'お名前は2文字以上で入力してください';
    }

    if (!formData.phone || !/^\d{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '電話番号は10〜11桁の数字で入力してください';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '正しいメールアドレスを入力してください';
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = '利用規約に同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validate()) {
      // Phase 1ではダミー予約番号を生成
      const reservationId = `OP-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

      navigate(`/reserve/complete?reservationId=${reservationId}&area=${area}&date=${date}&time=${time}&studio=${studioId}&userType=${userType}&price=${price}&name=${encodeURIComponent(formData.name)}`);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
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
        予約情報を入力
      </h1>
      <p className="text-gray-600 mb-6">
        予約に必要な情報を入力してください
      </p>

      {/* 予約内容確認 */}
      <div className="card mb-8 bg-blue-50 border-2 border-blue-200">
        <h2 className="font-bold text-lg mb-4">📋 予約内容</h2>
        <div className="border-t border-blue-200 pt-4 space-y-2 text-sm md:text-base">
          <div className="flex justify-between">
            <span className="text-gray-600">エリア</span>
            <span className="font-bold">{areaData?.area}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">スタジオ</span>
            <span className="font-bold">{studio?.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">日時</span>
            <span className="font-bold">
              {date && format(new Date(date), 'M月d日（E）', { locale: ja })} {time}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">利用区分</span>
            <span className="font-bold">{userType === 'student' ? '生徒' : '一般'}</span>
          </div>
          <div className="flex justify-between border-t border-blue-200 pt-2 mt-2">
            <span className="text-gray-600">料金</span>
            <span className="font-bold text-xl text-primary-orange">
              {price?.toLocaleString()}円
            </span>
          </div>
        </div>
      </div>

      {/* フォーム */}
      <form onSubmit={handleSubmit} className="card">
        <div className="space-y-6">
          {/* お名前 */}
          <div>
            <label className="block text-sm font-bold mb-2">
              お名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary-orange transition ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="山田太郎"
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* 電話番号 */}
          <div>
            <label className="block text-sm font-bold mb-2">
              電話番号 <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary-orange transition ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="09012345678"
            />
            {errors.phone && (
              <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
            )}
          </div>

          {/* メールアドレス */}
          <div>
            <label className="block text-sm font-bold mb-2">
              メールアドレス（任意）
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary-orange transition ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="example@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">
              ※予約確認メールを送信します（Phase 2以降）
            </p>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* 利用規約 */}
          <div>
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="agreedToTerms"
                checked={formData.agreedToTerms}
                onChange={handleChange}
                className="mt-1 w-5 h-5"
              />
              <span className="text-sm">
                <a href="#" className="text-primary-orange hover:underline">利用規約</a>
                に同意する <span className="text-red-500">*</span>
              </span>
            </label>
            {errors.agreedToTerms && (
              <p className="text-red-500 text-sm mt-1">{errors.agreedToTerms}</p>
            )}
          </div>
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          className="btn-primary w-full text-lg py-4 mt-8"
        >
          予約を確定する
        </button>
      </form>
    </div>
  );
}
