import { useState, useRef } from 'react';
import { FaUpload, FaTrash, FaImage } from 'react-icons/fa';
import { uploadImage, deleteImage, createImagePreview } from '../services/imageUploadService';

export default function ImageUpload({ currentImageUrl, onImageChange, onImageRemove }) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState(currentImageUrl || null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError('');
    setIsUploading(true);

    try {
      // プレビューを生成
      const previewUrl = await createImagePreview(file);
      setPreview(previewUrl);

      // 画像をアップロード
      const result = await uploadImage(file);

      if (result.success) {
        setPreview(result.url);
        onImageChange(result.url);
      } else {
        setError(result.error);
        setPreview(currentImageUrl || null);
      }
    } catch (err) {
      console.error('アップロードエラー:', err);
      setError('アップロード中にエラーが発生しました');
      setPreview(currentImageUrl || null);
    } finally {
      setIsUploading(false);
      // ファイル入力をリセット
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = async () => {
    if (!preview) return;

    if (!confirm('画像を削除しますか？')) return;

    setIsUploading(true);
    setError('');

    try {
      // Storageから削除（URLの場合のみ）
      if (preview.startsWith('http')) {
        await deleteImage(preview);
      }

      setPreview(null);
      onImageRemove();
    } catch (err) {
      console.error('削除エラー:', err);
      setError('削除中にエラーが発生しました');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-4">
        {/* アップロードボタン */}
        <label className="flex items-center space-x-2 px-4 py-2 bg-primary-green text-white rounded-lg cursor-pointer hover:bg-green-600 transition">
          <FaUpload />
          <span>{preview ? '画像を変更' : '画像をアップロード'}</span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            disabled={isUploading}
            className="hidden"
          />
        </label>

        {/* 削除ボタン */}
        {preview && (
          <button
            type="button"
            onClick={handleRemove}
            disabled={isUploading}
            className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition disabled:opacity-50"
          >
            <FaTrash />
            <span>削除</span>
          </button>
        )}
      </div>

      {/* アップロード中 */}
      {isUploading && (
        <div className="flex items-center space-x-2 text-primary-green">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-green"></div>
          <span className="text-sm">処理中...</span>
        </div>
      )}

      {/* エラーメッセージ */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* プレビュー */}
      {preview ? (
        <div className="border-2 border-gray-300 rounded-lg p-4">
          <p className="text-sm font-bold text-gray-700 mb-2">プレビュー:</p>
          <img
            src={preview}
            alt="アップロード画像"
            className="max-w-full max-h-64 rounded-lg shadow-md object-contain"
          />
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <FaImage className="text-6xl text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-sm">画像がアップロードされていません</p>
          <p className="text-gray-400 text-xs mt-2">
            対応形式: JPEG, PNG, GIF, WebP<br />
            最大サイズ: 5MB
          </p>
        </div>
      )}

      {/* 注意事項 */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-xs text-blue-800">
          💡 画像はお知らせスライダーに表示されます。推奨サイズ: 横800px × 縦400px程度
        </p>
      </div>
    </div>
  );
}
