/**
 * LIFF (LINE Front-end Framework) サービス
 *
 * LINEアプリ内でWebアプリを開き、ユーザー情報を取得する
 */

const LIFF_ID = import.meta.env.VITE_LIFF_ID;

let liff = null;

/**
 * LIFF SDKを動的にロード
 */
const loadLiffSDK = () => {
  return new Promise((resolve, reject) => {
    if (window.liff) {
      resolve(window.liff);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://static.line-scdn.net/liff/edge/2/sdk.js';
    script.onload = () => resolve(window.liff);
    script.onerror = () => reject(new Error('LIFF SDK failed to load'));
    document.head.appendChild(script);
  });
};

/**
 * LIFFを初期化
 */
export const initializeLiff = async () => {
  try {
    // LIFF IDが設定されていない場合はスキップ
    if (!LIFF_ID || LIFF_ID === 'your_liff_id_here') {
      console.log('LIFF IDが設定されていません。通常モードで動作します。');
      return { success: false, isLiffEnvironment: false };
    }

    // LIFF SDKをロード
    liff = await loadLiffSDK();

    // LIFF初期化
    await liff.init({ liffId: LIFF_ID });

    // LINEアプリ内かどうかを確認
    const isInClient = liff.isInClient();

    console.log('LIFF初期化成功', {
      isInClient,
      isLoggedIn: liff.isLoggedIn()
    });

    return {
      success: true,
      isLiffEnvironment: isInClient,
      isLoggedIn: liff.isLoggedIn()
    };
  } catch (error) {
    console.error('LIFF初期化エラー:', error);
    return {
      success: false,
      isLiffEnvironment: false,
      error
    };
  }
};

/**
 * LINEログインを実行
 */
export const loginWithLiff = () => {
  if (!liff) {
    console.error('LIFFが初期化されていません');
    return;
  }

  if (!liff.isLoggedIn()) {
    liff.login();
  }
};

/**
 * LINE User IDを取得
 * @returns {Promise<string|null>} LINE User ID
 */
export const getLineUserId = async () => {
  try {
    if (!liff) {
      console.log('LIFFが初期化されていません');
      return null;
    }

    if (!liff.isLoggedIn()) {
      console.log('LINEにログインしていません');
      return null;
    }

    const profile = await liff.getProfile();
    return profile.userId;
  } catch (error) {
    console.error('LINE User ID取得エラー:', error);
    return null;
  }
};

/**
 * LINEユーザープロフィールを取得
 * @returns {Promise<Object|null>} ユーザープロフィール
 */
export const getLineProfile = async () => {
  try {
    if (!liff) {
      console.log('LIFFが初期化されていません');
      return null;
    }

    if (!liff.isLoggedIn()) {
      console.log('LINEにログインしていません');
      return null;
    }

    const profile = await liff.getProfile();
    return {
      userId: profile.userId,
      displayName: profile.displayName,
      pictureUrl: profile.pictureUrl,
      statusMessage: profile.statusMessage
    };
  } catch (error) {
    console.error('LINEプロフィール取得エラー:', error);
    return null;
  }
};

/**
 * LINEアプリ内で実行中かを確認
 * @returns {boolean}
 */
export const isInLineApp = () => {
  if (!liff) return false;
  return liff.isInClient();
};

/**
 * LIFFアプリを閉じる
 */
export const closeLiff = () => {
  if (liff && liff.isInClient()) {
    liff.closeWindow();
  }
};

/**
 * 外部ブラウザで開く
 * @param {string} url - 開くURL
 */
export const openExternalBrowser = (url) => {
  if (liff && liff.isInClient()) {
    liff.openWindow({
      url: url,
      external: true
    });
  } else {
    window.open(url, '_blank');
  }
};

/**
 * メッセージを送信（シェア機能）
 * @param {Array} messages - 送信するメッセージ配列
 */
export const shareMessage = async (messages) => {
  try {
    if (!liff || !liff.isInClient()) {
      console.error('LINEアプリ内でのみ使用できます');
      return { success: false };
    }

    if (liff.isApiAvailable('shareTargetPicker')) {
      await liff.shareTargetPicker(messages);
      return { success: true };
    } else {
      console.error('shareTargetPicker APIが利用できません');
      return { success: false };
    }
  } catch (error) {
    console.error('メッセージ送信エラー:', error);
    return { success: false, error };
  }
};
