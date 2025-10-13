import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { FaLock, FaUser } from 'react-icons/fa';

export default function AdminLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // エラーをクリア
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // ログイン成功
      localStorage.setItem('isAdmin', 'true');
      navigate('/admin/dashboard');
    } catch (error) {
      console.error('ログインエラー:', error);
      setError('メールアドレスまたはパスワードが正しくありません');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-green to-green-600 flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        {/* ロゴ・タイトル */}
        <div className="text-center mb-8">
          <div className="inline-block bg-white rounded-full p-4 mb-4 shadow-lg">
            <FaLock className="text-4xl text-primary-green" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            おんぷタイム 管理画面
          </h1>
          <p className="text-green-100">
            管理者専用ログイン
          </p>
        </div>

        {/* ログインフォーム */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* エラーメッセージ */}
            {error && (
              <div className="bg-red-50 border-2 border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}

            {/* メールアドレス */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaUser className="inline mr-2" />
                メールアドレス
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green transition"
                placeholder="admin@example.com"
              />
            </div>

            {/* パスワード */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                <FaLock className="inline mr-2" />
                パスワード
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-green transition"
                placeholder="••••••••"
              />
            </div>

            {/* ログインボタン */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-lg font-bold text-lg transition ${
                isLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-primary-green text-white hover:bg-green-600'
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></span>
                  ログイン中...
                </span>
              ) : (
                'ログイン'
              )}
            </button>
          </form>

          {/* トップページへ戻る */}
          <div className="mt-6 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-sm text-gray-600 hover:text-gray-800 transition"
            >
              トップページへ戻る
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
