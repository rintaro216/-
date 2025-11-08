import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale/ja';
import { FaPlus, FaEdit, FaTrash, FaEye, FaEyeSlash, FaArrowLeft } from 'react-icons/fa';
import ImageUpload from '../../components/ImageUpload';
import { sendAnnouncementToGroup } from '../../services/lineNotificationService';

export default function AnnouncementManagement() {
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'normal',
    is_published: false,
    publish_start_date: '',
    publish_end_date: '',
    display_order: 0,
    image_url: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnnouncements(data || []);
    } catch (error) {
      console.error('お知らせ取得エラー:', error);
      alert('お知らせの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (announcement = null) => {
    if (announcement) {
      setEditingAnnouncement(announcement);
      setFormData({
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        is_published: announcement.is_published,
        publish_start_date: announcement.publish_start_date || '',
        publish_end_date: announcement.publish_end_date || '',
        display_order: announcement.display_order || 0,
        image_url: announcement.image_url || ''
      });
    } else {
      setEditingAnnouncement(null);
      setFormData({
        title: '',
        content: '',
        priority: 'normal',
        is_published: false,
        publish_start_date: '',
        publish_end_date: '',
        display_order: 0,
        image_url: ''
      });
    }
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAnnouncement(null);
    setFormData({
      title: '',
      content: '',
      priority: 'normal',
      is_published: false,
      publish_start_date: '',
      publish_end_date: '',
      display_order: 0,
      image_url: ''
    });
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.title || formData.title.trim().length < 2) {
      newErrors.title = 'タイトルは2文字以上で入力してください';
    }

    if (!formData.content || formData.content.trim().length < 5) {
      newErrors.content = '内容は5文字以上で入力してください';
    }

    if (formData.publish_start_date && formData.publish_end_date) {
      if (new Date(formData.publish_start_date) > new Date(formData.publish_end_date)) {
        newErrors.publish_end_date = '終了日は開始日以降の日付を選択してください';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      const dataToSave = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        priority: formData.priority,
        is_published: formData.is_published,
        publish_start_date: formData.publish_start_date || null,
        publish_end_date: formData.publish_end_date || null,
        display_order: parseInt(formData.display_order) || 0,
        image_url: formData.image_url.trim() || null
      };

      if (editingAnnouncement) {
        // 更新
        const { error } = await supabase
          .from('announcements')
          .update(dataToSave)
          .eq('id', editingAnnouncement.id);

        if (error) throw error;
        alert('お知らせを更新しました');
      } else {
        // 新規作成
        const { error } = await supabase
          .from('announcements')
          .insert([dataToSave]);

        if (error) throw error;

        // 新規作成時、公開状態ならLINE通知を送信
        if (dataToSave.is_published) {
          sendAnnouncementToGroup({
            title: dataToSave.title,
            content: dataToSave.content,
            image_url: dataToSave.image_url
          }).catch(err => {
            console.error('LINE通知送信エラー:', err);
            // エラーでもお知らせ作成は成功として扱う
          });
        }

        alert('お知らせを作成しました');
      }

      handleCloseModal();
      fetchAnnouncements();
    } catch (error) {
      console.error('お知らせ保存エラー:', error);
      alert('お知らせの保存に失敗しました: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('このお知らせを削除してもよろしいですか？')) return;

    try {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      alert('お知らせを削除しました');
      fetchAnnouncements();
    } catch (error) {
      console.error('お知らせ削除エラー:', error);
      alert('お知らせの削除に失敗しました');
    }
  };

  const togglePublish = async (announcement) => {
    try {
      const newPublishState = !announcement.is_published;

      const { error } = await supabase
        .from('announcements')
        .update({ is_published: newPublishState })
        .eq('id', announcement.id);

      if (error) throw error;

      // 非公開→公開に変更した場合、LINE通知を送信
      if (newPublishState) {
        sendAnnouncementToGroup({
          title: announcement.title,
          content: announcement.content,
          image_url: announcement.image_url
        }).catch(err => {
          console.error('LINE通知送信エラー:', err);
          // エラーでも公開は成功として扱う
        });
      }

      fetchAnnouncements();
    } catch (error) {
      console.error('公開状態の変更エラー:', error);
      alert('公開状態の変更に失敗しました');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => navigate('/admin/dashboard')}
        className="mb-6 flex items-center text-primary-green hover:text-green-600 transition"
      >
        <FaArrowLeft className="mr-2" />
        ダッシュボードに戻る
      </button>

      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">お知らせ管理</h1>
        <button
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>新規作成</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-green"></div>
        </div>
      ) : announcements.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-gray-500 text-lg">お知らせがまだありません</p>
          <p className="text-gray-400 text-sm mt-2">「新規作成」ボタンから作成してください</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <div
              key={announcement.id}
              className="card border-2 border-gray-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-grow">
                  <div className="flex items-center space-x-3 mb-2">
                    <h2 className="text-xl font-bold text-gray-800">
                      {announcement.title}
                    </h2>
                    {announcement.priority === 'important' && (
                      <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded">
                        重要
                      </span>
                    )}
                    {announcement.is_published ? (
                      <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded">
                        公開中
                      </span>
                    ) : (
                      <span className="px-3 py-1 bg-gray-400 text-white text-xs font-bold rounded">
                        非公開
                      </span>
                    )}
                  </div>

                  <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                    {announcement.content}
                  </p>

                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>表示順: {announcement.display_order}</span>
                    {announcement.publish_start_date && (
                      <span>
                        開始: {format(new Date(announcement.publish_start_date), 'yyyy/MM/dd')}
                      </span>
                    )}
                    {announcement.publish_end_date && (
                      <span>
                        終了: {format(new Date(announcement.publish_end_date), 'yyyy/MM/dd')}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() => togglePublish(announcement)}
                    className={`p-2 rounded transition ${
                      announcement.is_published
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                    title={announcement.is_published ? '非公開にする' : '公開する'}
                  >
                    {announcement.is_published ? <FaEye /> : <FaEyeSlash />}
                  </button>
                  <button
                    onClick={() => handleOpenModal(announcement)}
                    className="p-2 bg-blue-100 text-blue-600 rounded hover:bg-blue-200 transition"
                    title="編集"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(announcement.id)}
                    className="p-2 bg-red-100 text-red-600 rounded hover:bg-red-200 transition"
                    title="削除"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* モーダル */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-6">
                {editingAnnouncement ? 'お知らせを編集' : 'お知らせを新規作成'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* タイトル */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    タイトル <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary-orange transition ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="スタジオ予約システムがリニューアルしました！"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* 内容 */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    内容 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="content"
                    value={formData.content}
                    onChange={handleChange}
                    rows="5"
                    className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary-orange transition ${
                      errors.content ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="オンラインで簡単に予約できるようになりました。30分単位でのご予約が可能です。"
                  />
                  {errors.content && (
                    <p className="text-red-500 text-sm mt-1">{errors.content}</p>
                  )}
                </div>

                {/* 優先度 */}
                <div>
                  <label className="block text-sm font-bold mb-2">優先度</label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange transition"
                  >
                    <option value="normal">通常</option>
                    <option value="important">重要</option>
                  </select>
                </div>

                {/* 公開設定 */}
                <div>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_published"
                      checked={formData.is_published}
                      onChange={handleChange}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-bold">公開する（公開すると登録ユーザーにLINE通知が送信されます）</span>
                  </label>
                </div>

                {/* 公開期間 */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      公開開始日（任意）
                    </label>
                    <input
                      type="date"
                      name="publish_start_date"
                      value={formData.publish_start_date}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">
                      公開終了日（任意）
                    </label>
                    <input
                      type="date"
                      name="publish_end_date"
                      value={formData.publish_end_date}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:border-primary-orange transition ${
                        errors.publish_end_date ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.publish_end_date && (
                      <p className="text-red-500 text-sm mt-1">{errors.publish_end_date}</p>
                    )}
                  </div>
                </div>

                {/* 表示順 */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    表示順（数字が小さいほど上に表示）
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    value={formData.display_order}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-primary-orange transition"
                  />
                </div>

                {/* 画像アップロード */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    画像（任意）
                  </label>
                  <ImageUpload
                    currentImageUrl={formData.image_url}
                    onImageChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    onImageRemove={() => setFormData(prev => ({ ...prev, image_url: '' }))}
                  />
                </div>

                {/* ボタン */}
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary py-3"
                  >
                    {editingAnnouncement ? '更新する' : '作成する'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-bold hover:bg-gray-400 transition"
                  >
                    キャンセル
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
