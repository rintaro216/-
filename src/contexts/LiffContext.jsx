import { createContext, useContext, useState, useEffect } from 'react';
import { initializeLiff, getLineUserId, getLineProfile } from '../services/liffService';

const LiffContext = createContext();

export const useLiff = () => {
  const context = useContext(LiffContext);
  if (!context) {
    throw new Error('useLiff must be used within a LiffProvider');
  }
  return context;
};

export const LiffProvider = ({ children }) => {
  const [isLiffReady, setIsLiffReady] = useState(false);
  const [isInLiff, setIsInLiff] = useState(false);
  const [liffProfile, setLiffProfile] = useState(null);
  const [lineUserId, setLineUserId] = useState(null);

  useEffect(() => {
    const initLiff = async () => {
      console.log('🚀 LiffProvider: LIFF初期化を開始...');

      const result = await initializeLiff();

      if (result.success && result.isLiffEnvironment) {
        console.log('✅ LiffProvider: LIFF環境で実行中');
        setIsInLiff(true);

        // LINEユーザープロフィールを取得
        const profile = await getLineProfile();
        const userId = await getLineUserId();

        if (profile && userId) {
          setLiffProfile(profile);
          setLineUserId(userId);
          console.log('✅ LiffProvider: ユーザー情報取得成功', {
            displayName: profile.displayName,
            userId: userId
          });
        }
      } else {
        console.log('ℹ️ LiffProvider: 通常のWebブラウザで実行中');
        setIsInLiff(false);
      }

      setIsLiffReady(true);
    };

    initLiff();
  }, []); // 一度だけ実行

  const value = {
    isLiffReady,
    isInLiff,
    liffProfile,
    lineUserId
  };

  return (
    <LiffContext.Provider value={value}>
      {children}
    </LiffContext.Provider>
  );
};
