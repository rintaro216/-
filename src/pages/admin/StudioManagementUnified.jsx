import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaMusic, FaClock, FaBan } from 'react-icons/fa';

// 既存コンポーネントから機能をインポート
import StudioManagement from './StudioManagement';
import BusinessHoursManagement from './BusinessHoursManagement';

export default function StudioManagementUnified() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('studios'); // 'studios', 'hours'

  const tabs = [
    {
      id: 'studios',
      label: 'スタジオ設定',
      icon: FaMusic,
      description: 'スタジオの稼働/休止設定'
    },
    {
      id: 'hours',
      label: '営業時間',
      icon: FaClock,
      description: '営業時間・曜日別・日付別設定'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <header className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center text-primary-green hover:text-green-600 transition mb-2"
          >
            <FaArrowLeft className="mr-2" />
            ダッシュボードに戻る
          </button>
          <h1 className="text-2xl font-bold text-gray-800">スタジオ総合管理</h1>
          <p className="text-sm text-gray-600">スタジオ・営業時間を一括管理</p>
        </div>
      </header>

      {/* タブナビゲーション */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 px-6 py-4 font-medium transition-all
                    border-b-4 whitespace-nowrap
                    ${isActive
                      ? 'border-primary-green text-primary-green bg-green-50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  <Icon className="text-xl" />
                  <div className="text-left">
                    <div className="font-bold">{tab.label}</div>
                    <div className="text-xs opacity-75">{tab.description}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* タブコンテンツ */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'studios' && (
          <div className="animate-fadeIn">
            <StudioManagementContent />
          </div>
        )}
        {activeTab === 'hours' && (
          <div className="animate-fadeIn">
            <BusinessHoursContent />
          </div>
        )}
      </main>
    </div>
  );
}

// スタジオ設定コンテンツ（既存のStudioManagementから本体部分のみ）
function StudioManagementContent() {
  return (
    <div>
      <StudioManagement embedded={true} />
    </div>
  );
}

// 営業時間コンテンツ（既存のBusinessHoursManagementから本体部分のみ）
function BusinessHoursContent() {
  return (
    <div>
      <BusinessHoursManagement embedded={true} />
    </div>
  );
}
