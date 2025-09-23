import React, { useState, useEffect } from 'react';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';

const AdminBlog = () => {
  const { adminApi } = useAdminAuth();
  const [posts, setPosts] = useState([]);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('posts');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    image_url: '',
    image_file: null,
    is_published: false
  });
  const [imageType, setImageType] = useState('url');

  useEffect(() => {
    fetchPosts();
    fetchComments();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await adminApi.get('/api/blog/admin/posts');
      if (response.data.success) {
        setPosts(response.data.data || []);
      } else {
        setPosts([]);
      }
    } catch (error) {
      console.error('Blog posts loading failed:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await adminApi.get('/api/blog/admin/comments');
      if (response.data.success) {
        setComments(response.data.data || []);
      } else {
        setComments([]);
      }
    } catch (error) {
      console.error('Comments loading failed:', error);
      setComments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = new FormData();
      submitData.append('title', formData.title);
      submitData.append('content', formData.content);
      submitData.append('excerpt', formData.excerpt);
      submitData.append('is_published', formData.is_published);

      if (imageType === 'file' && formData.image_file) {
        submitData.append('image', formData.image_file);
      } else if (imageType === 'url' && formData.image_url) {
        submitData.append('image_url', formData.image_url);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      const response = editingPost
        ? await adminApi.put(`/api/blog/admin/posts/${editingPost.id}`, submitData, config)
        : await adminApi.post('/api/blog/admin/posts', submitData, config);

      if (response.data.success) {
        fetchPosts();
        resetForm();
        alert('Blog yazısı başarıyla kaydedildi');
      } else {
        alert(response.data.message || 'Hata oluştu');
      }
    } catch (error) {
      console.error('Blog post save error:', error);
      alert('Blog yazısı kaydedilemedi');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu blog yazısını silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await adminApi.delete(`/api/blog/admin/posts/${id}`);
      if (response.data.success) {
        fetchPosts();
        alert('Blog yazısı silindi');
      } else {
        alert(response.data.message || 'Blog yazısı silinemedi');
      }
    } catch (error) {
      console.error('Blog post delete error:', error);
      alert('Blog yazısı silinemedi');
    }
  };

  const handleDeleteComment = async (id) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) return;

    try {
      const response = await adminApi.delete(`/api/blog/admin/comments/${id}`);
      if (response.data.success) {
        fetchComments();
        alert('Yorum silindi');
      } else {
        alert(response.data.message || 'Yorum silinemedi');
      }
    } catch (error) {
      console.error('Comment delete error:', error);
      alert('Yorum silinemedi');
    }
  };

  const handleApproveComment = async (id) => {
    try {
      const response = await adminApi.put(`/api/blog/admin/comments/${id}/approve`);
      if (response.data.success) {
        fetchComments();
        alert('Yorum onaylandı');
      } else {
        alert(response.data.message || 'Yorum onaylanamadı');
      }
    } catch (error) {
      console.error('Comment approve error:', error);
      alert('Yorum onaylanamadı');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      content: post.content,
      excerpt: post.excerpt || '',
      image_url: post.image_url || '',
      image_file: null,
      is_published: post.is_published
    });
    setImageType(post.image_url ? 'url' : 'file');
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      image_url: '',
      image_file: null,
      is_published: false
    });
    setImageType('url');
    setEditingPost(null);
    setShowAddForm(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 font-mono">Blog Yönetimi</h1>
          <p className="text-gray-400 font-mono">Blog yazılarını ve yorumları yönet</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-red-900 hover:bg-red-800 text-red-200 px-4 py-2 rounded-lg transition-colors border border-red-700 font-mono"
        >
          [ADD] Yeni Yazı
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-red-900">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('posts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm font-mono ${
              activeTab === 'posts'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Blog Yazıları ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm font-mono ${
              activeTab === 'comments'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            Yorumlar ({comments.length})
          </button>
        </nav>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-black border border-red-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-4 font-mono">
            {editingPost ? '[EDIT] Yazıyı Düzenle' : '[CREATE] Yeni Yazı'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Başlık *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Özet
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                rows="2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                İçerik *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                rows="10"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1 font-mono">
                Görsel
              </label>
              <div className="flex gap-4 mb-3">
                <label className="flex items-center text-gray-300">
                  <input
                    type="radio"
                    value="url"
                    checked={imageType === 'url'}
                    onChange={(e) => setImageType(e.target.value)}
                    className="mr-2"
                  />
                  URL
                </label>
                <label className="flex items-center text-gray-300">
                  <input
                    type="radio"
                    value="file"
                    checked={imageType === 'file'}
                    onChange={(e) => setImageType(e.target.value)}
                    className="mr-2"
                  />
                  Dosya Yükle
                </label>
              </div>

              {imageType === 'url' && (
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                  placeholder="https://example.com/image.jpg"
                />
              )}

              {imageType === 'file' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, image_file: e.target.files[0]})}
                  className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500"
                />
              )}
            </div>

            <div>
              <label className="flex items-center text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  className="mr-2"
                />
                Yayınla
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-900 hover:bg-green-800 text-green-200 px-6 py-2 rounded-lg transition-colors border border-green-700 font-mono"
              >
                {editingPost ? '[SAVE] Güncelle' : '[CREATE] Oluştur'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-lg transition-colors border border-gray-600 font-mono"
              >
                [CANCEL] İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Başlık
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Yazar
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    İstatistikler
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900">
                {posts.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-400 font-mono">
                      Henüz blog yazısı bulunmuyor
                    </td>
                  </tr>
                ) : (
                  posts.map((post) => (
                    <tr key={post.id} className="hover:bg-red-900/20">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {post.title}
                          </div>
                          {post.excerpt && (
                            <div className="text-sm text-gray-400">
                              {post.excerpt.substring(0, 60)}...
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {post.author_name || 'Admin'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                          post.is_published
                            ? 'bg-green-900 text-green-200'
                            : 'bg-gray-800 text-gray-300'
                        }`}>
                          {post.is_published ? 'Yayında' : 'Taslak'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        <div>👁 {post.view_count || 0}</div>
                        <div>💬 {post.comment_count || 0}</div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        <button
                          onClick={() => handleEdit(post)}
                          className="text-green-400 hover:text-green-300 mr-3 font-mono"
                        >
                          [EDIT]
                        </button>
                        <button
                          onClick={() => handleDelete(post.id)}
                          className="text-red-400 hover:text-red-300 font-mono"
                        >
                          [DELETE]
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comments Tab */}
      {activeTab === 'comments' && (
        <div className="bg-black border border-red-900 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-900">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Yorum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Yazı
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    Durum
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    İşlemler
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900">
                {comments.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-mono">
                      Henüz yorum bulunmuyor
                    </td>
                  </tr>
                ) : (
                  comments.map((comment) => (
                    <tr key={comment.id} className="hover:bg-red-900/20">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {comment.author_name}
                          </div>
                          <div className="text-sm text-gray-400">
                            {comment.content}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {comment.post_title}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 text-xs leading-5 font-semibold rounded-full ${
                          comment.is_approved
                            ? 'bg-green-900 text-green-200'
                            : 'bg-yellow-900 text-yellow-200'
                        }`}>
                          {comment.is_approved ? 'Onaylandı' : 'Bekliyor'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {!comment.is_approved && (
                          <button
                            onClick={() => handleApproveComment(comment.id)}
                            className="text-green-400 hover:text-green-300 mr-3 font-mono"
                          >
                            [APPROVE]
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="text-red-400 hover:text-red-300 font-mono"
                        >
                          [DELETE]
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBlog;