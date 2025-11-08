import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import { studioData } from '../data/studioData';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { createReservation } from '../services/reservationService';
import { calculateSlots } from '../utils/timeUtils';
import { useLiff } from '../contexts/LiffContext';
import { loginForLineLink, getLineUserId, getLineProfile, isLoggedIn } from '../services/liffService';

export default function ReservationForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const area = searchParams.get('area');
  const date = searchParams.get('date');
  const time = searchParams.get('time');
  const studioId = searchParams.get('studio');
  const userType = searchParams.get('userType');

  const { isLiffReady, isInLiff, liffProfile, lineUserId } = useLiff();

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    receiveLineNotification: false,
    lineUserId: '',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isConnectingLine, setIsConnectingLine] = useState(false);
  const [webLineProfile, setWebLineProfile] = useState(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // LIFF環境でユーザー情報を自動設定
  useEffect(() => {
    if (isLiffReady && isInLiff && liffProfile && lineUserId) {
      setFormData(prev => ({
        ...prev,
        name: liffProfile.displayName || prev.name,
        lineUserId: lineUserId,
        receiveLineNotification: true
      }));

      console.log('✅ LIFF経由でユーザー情報を自動設定:', {
        displayName: liffProfile.displayName,
        userId: lineUserId
      });
    }
  }, [isLiffReady, isInLiff, liffProfile, lineUserId]);

  // Web版でLINEログイン後にUser IDを取得
  useEffect(() => {
    const checkWebLineLogin = async () => {
      if (!isInLiff && isLiffReady && isLoggedIn()) {
        const userId = await getLineUserId();
        const profile = await getLineProfile();
        
        if (userId && profile) {
          setWebLineProfile(profile);
          setFormData(prev => ({
            ...prev,
            name: prev.name || profile.displayName,
            lineUserId: userId,
            receiveLineNotification: true
          }));
          console.log('✅ Web版でLINE連携成功:', { userId, displayName: profile.displayName });
        }
      }
    };

    checkWebLineLogin();
  }, [isLiffReady, isInLiff]);



  // スタジオ情報を取得
  const areaData = studioData[area];
  const studio = areaData?.studios.find(s => s.id === studioId);
  const pricePerSlot = userType === 'student' ? studio?.pricing.student : studio?.pricing.general;
  const slots = calculateSlots(time);
  const price = pricePerSlot * slots;

  const validate = () => {
    const newErrors = {};

    if (!formData.name || formData.name.length < 2) {
      newErrors.name = 'お名前は2文字以上で入力してください';
    }

    if (!formData.phone || !/^\d{10,11}$/.test(formData.phone.replace(/-/g, ''))) {
      newErrors.phone = '電話番号は10〜11桁の数字で入力してください';
    }

    if (!formData.agreedToTerms) {
      newErrors.agreedToTerms = '利用規約に同意してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      // 予約データを作成
      const reservationData = {
        area,
        studioId,
        date,
        timeRange: time,
        userType,
        customerName: formData.name,
        customerPhone: formData.phone,
        lineUserId: formData.receiveLineNotification ? formData.lineUserId : null,
        price
      };

      // 予約を保存
      const result = await createReservation(reservationData);

      if (result.success) {
        // 予約完了ページに遷移
        navigate(`/reserve/complete?reservationId=${result.reservationNumber}&area=${area}&date=${date}&time=${time}&studio=${studioId}&userType=${userType}&price=${price}&name=${encodeURIComponent(formData.name)}`);
      } else {
        // エラー処理
        setErrors({ submit: result.message || '予約の作成に失敗しました' });
      }
    } catch (error) {
      console.error('予約作成エラー:', error);
      setErrors({ submit: '予約の作成中にエラーが発生しました' });
    } finally {
      setIsSubmitting(false);
    }
  };


  // LINE連携ボタンのハンドラー
  const handleLineConnect = async () => {
    setIsConnectingLine(true);
    try {
      const result = await loginForLineLink();
      
      if (result.success && !result.redirecting) {
        setWebLineProfile(result.profile);
        setFormData(prev => ({
          ...prev,
          name: prev.name || result.profile.displayName,
          lineUserId: result.userId,
          receiveLineNotification: true
        }));
      }
    } catch (error) {
      console.error('LINE連携エラー:', error);
      alert('LINE連携に失敗しました。もう一度お試しください。');
    } finally {
      setIsConnectingLine(false);
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
            <span className="font-bold">{areaData?.areaDisplayName || areaData?.area}</span>
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

          {/* LINE通知の受け取り設定 */}
          <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4">
            <div className="flex items-start space-x-3 mb-3">
              <div className="flex-shrink-0 mt-1">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-green-800 mb-2">LINE通知を受け取る（おすすめ）</h3>

                {/* LIFF経由の場合は自動設定済みを表示 */}
                {isInLiff && liffProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-green-300">
                      {liffProfile.pictureUrl && (
                        <img
                          src={liffProfile.pictureUrl}
                          alt={liffProfile.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-bold text-sm text-green-700">✓ LINE連携済み</p>
                        <p className="text-xs text-gray-600">{liffProfile.displayName}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      予約完了・キャンセル・前日リマインダーがLINEに自動送信されます
                    </p>
                  </div>
                ) : webLineProfile ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 bg-white rounded-lg p-3 border border-green-300">
                      {webLineProfile.pictureUrl && (
                        <img
                          src={webLineProfile.pictureUrl}
                          alt={webLineProfile.displayName}
                          className="w-10 h-10 rounded-full"
                        />
                      )}
                      <div>
                        <p className="font-bold text-sm text-green-700">✓ LINE連携済み</p>
                        <p className="text-xs text-gray-600">{webLineProfile.displayName}</p>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700">
                      予約完了・キャンセル・前日リマインダーがLINEに自動送信されます
                    </p>
                  </div>
                ) : (
                  <>
                    <label className="flex items-start space-x-2 cursor-pointer mb-3">
                      <input
                        type="checkbox"
                        name="receiveLineNotification"
                        checked={formData.receiveLineNotification}
                        onChange={handleChange}
                        className="mt-1 w-5 h-5"
                      />
                      <span className="text-sm text-gray-700">
                        予約完了・キャンセル・前日リマインダーをLINEで受け取る
                      </span>
                    </label>
                    {formData.receiveLineNotification && (
                      <div className="pl-7 space-y-3">
                        <p className="text-sm text-gray-600 font-bold">
                          ワンクリックでLINE連携（推奨）
                        </p>
                        <button
                          type="button"
                          onClick={handleLineConnect}
                          disabled={isConnectingLine}
                          className="flex items-center space-x-2 px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition font-bold disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                          </svg>
                          <span>{isConnectingLine ? '連携中...' : 'LINEと連携する'}</span>
                        </button>
                        <p className="text-xs text-gray-500">
                          ※ LINEログイン画面が開きます。承認後、自動的に戻ってきます
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
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

          {/* 送信エラーメッセージ */}
          {errors.submit && (
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
              <p className="text-red-600 font-bold">{errors.submit}</p>
            </div>
          )}
        </div>

        {/* 送信ボタン */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full text-lg py-4 mt-8 rounded-lg font-bold transition ${
            isSubmitting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'btn-primary'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
              予約処理中...
            </span>
          ) : (
            '予約を確定する'
          )}
        </button>
      </form>
    </div>
  );
}
