import { supabase } from '../lib/supabase';

/**
 * 画像をSupabase Storageにアップロード
 * @param {File} file - アップロードする画像ファイル
 * @param {string} folder - 保存先フォルダ（オプション）
 * @returns {Promise<{success: boolean, url?: string, error?: string}>}
 */
export const uploadImage = async (file, folder = '') => {
  try {
    // ファイルサイズチェック（5MB制限）
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return {
        success: false,
        error: 'ファイルサイズが大きすぎます。5MB以下の画像を選択してください。'
      };
    }

    // ファイル形式チェック
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: '対応していないファイル形式です。JPEG、PNG、GIF、WebPのいずれかを選択してください。'
      };
    }

    // ファイル名を生成（タイムスタンプ + ランダム文字列）
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const ext = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomStr}.${ext}`;

    // フォルダパスを構築
    const filePath = folder ? `${folder}/${fileName}` : fileName;

    // Supabase Storageにアップロード
    const { data, error } = await supabase.storage
      .from('announcements')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('画像アップロードエラー:', error);
      return {
        success: false,
        error: 'アップロードに失敗しました: ' + error.message
      };
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase.storage
      .from('announcements')
      .getPublicUrl(filePath);

    return {
      success: true,
      url: publicUrl,
      path: filePath
    };
  } catch (error) {
    console.error('画像アップロード処理エラー:', error);
    return {
      success: false,
      error: 'アップロード中にエラーが発生しました'
    };
  }
};

/**
 * Supabase Storageから画像を削除
 * @param {string} filePath - 削除する画像のパス
 * @returns {Promise<{success: boolean, error?: string}>}
 */
export const deleteImage = async (filePath) => {
  try {
    // URLからファイルパスを抽出
    let path = filePath;
    if (filePath.includes('storage/v1/object/public/announcements/')) {
      path = filePath.split('storage/v1/object/public/announcements/')[1];
    }

    const { error } = await supabase.storage
      .from('announcements')
      .remove([path]);

    if (error) {
      console.error('画像削除エラー:', error);
      return {
        success: false,
        error: '削除に失敗しました: ' + error.message
      };
    }

    return { success: true };
  } catch (error) {
    console.error('画像削除処理エラー:', error);
    return {
      success: false,
      error: '削除中にエラーが発生しました'
    };
  }
};

/**
 * 画像プレビュー用のData URLを生成
 * @param {File} file - プレビューする画像ファイル
 * @returns {Promise<string>} Data URL
 */
export const createImagePreview = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * バケットが存在するか確認
 * @returns {Promise<boolean>}
 */
export const checkStorageBucket = async () => {
  try {
    const { data, error } = await supabase.storage.getBucket('announcements');
    return !error && data !== null;
  } catch (error) {
    console.error('バケット確認エラー:', error);
    return false;
  }
};
