import React, { useState, useEffect } from 'react';

const AdminBlog = () => {
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog/admin/posts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setPosts(data.data || []);
      } else {
        // Demo blog posts
        setPosts([
          {
            id: 1,
            title: 'Adaçayının Faydaları ve Kullanım Alanları',
            excerpt: 'Adaçayı, binlerce yıldır şifalı özellikleri ile bilinen önemli bir bitkidir.',
            content: 'Adaçayı (Salvia officinalis), binlerce yıldır şifalı özellikleri ile bilinen önemli bir bitkidir. Antioksidan özellikleri sayesinde vücudu serbest radikallerden korur.',
            image_url: '/images/blog/adacayi.jpg',
            author_name: 'Dr. Ayşe Bitkici',
            is_published: true,
            view_count: 245,
            comment_count: 8,
            created_at: '2024-09-10T14:30:00Z'
          },
          {
            id: 2,
            title: 'Organik Gıdaların Sağlığa Etkileri',
            excerpt: 'Organik gıdalar neden tercih edilmeli ve sağlığımıza nasıl katkıda bulunur?',
            content: 'Organik gıdalar, kimyasal pestisit ve gübre kullanılmadan yetiştirilen doğal ürünlerdir.',
            image_url: '/images/blog/organik-gida.jpg',
            author_name: 'Uzm. Mehmet Doğal',
            is_published: true,
            view_count: 189,
            comment_count: 12,
            created_at: '2024-09-08T10:15:00Z'
          },
          {
            id: 3,
            title: 'Kurkumanın Anti-İnflamatuar Özellikleri',
            excerpt: 'Kurkuma, güçlü anti-inflamatuar etkisi ile bilinir ve birçok hastalığa karşı koruyucu etki gösterir.',
            content: 'Kurkuma (Curcuma longa), içerdiği kurkumin bileşiği sayesinde güçlü anti-inflamatuar özelliklere sahiptir.',
            image_url: '',
            author_name: 'Dr. Fatma Şifalı',
            is_published: false,
            view_count: 56,
            comment_count: 3,
            created_at: '2024-09-05T16:20:00Z'
          }
        ]);
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
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog/admin/comments`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setComments(data.data || []);
      } else {
        // Demo comments
        setComments([
          {
            id: 1,
            post_id: 1,
            post_title: 'Adaçayının Faydaları ve Kullanım Alanları',
            author_name: 'Ali Yılmaz',
            comment: 'Çok faydalı bir yazı olmuş. Adaçayı çayını düzenli içiyorum.',
            is_approved: true,
            created_at: '2024-09-11T09:30:00Z'
          },
          {
            id: 2,
            post_id: 1,
            post_title: 'Adaçayının Faydaları ve Kullanım Alanları',
            author_name: 'Ayşe Kaya',
            comment: 'Hangi miktarda tüketilmesi gerekiyor acaba?',
            is_approved: false,
            created_at: '2024-09-11T14:15:00Z'
          },
          {
            id: 3,
            post_id: 2,
            post_title: 'Organik Gıdaların Sağlığa Etkileri',
            author_name: 'Mehmet Demir',
            comment: 'Organik ürünleri nereden temin edebiliriz?',
            is_approved: true,
            created_at: '2024-09-09T11:45:00Z'
          }
        ]);
      }
    } catch (error) {
      console.error('Blog comments loading failed:', error);
      setComments([]);
    }
  };

  const handleSubmitPost = async (e) => {
    e.preventDefault();
    try {
      const url = editingPost
        ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog/admin/posts/${editingPost.id}`
        : `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog/admin/posts`;

      const method = editingPost ? 'PUT' : 'POST';

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

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: submitData
      });

      const data = await response.json();
      if (data.success) {
        alert('[SUCCESS] Blog post saved successfully');
        fetchPosts();
        resetForm();
      } else {
        alert('[ERROR] Blog post save failed: ' + data.message);
      }
    } catch (error) {
      console.error('Blog post save error:', error);
      alert('[ERROR] System error occurred');
    }
  };

  const handleEditPost = (post) => {
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

  const handleDeletePost = async (postId) => {
    if (!confirm('[CONFIRM] Delete this blog post? This action cannot be undone.')) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog/admin/posts/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('[SUCCESS] Blog post deleted');
        fetchPosts();
      } else {
        alert('[ERROR] Blog post deletion failed: ' + data.message);
      }
    } catch (error) {
      console.error('Blog post deletion error:', error);
      alert('[ERROR] System error occurred');
    }
  };

  const handleApproveComment = async (commentId) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000'}/api/blog/admin/comments/${commentId}/approve`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      const data = await response.json();
      if (data.success) {
        alert('[SUCCESS] Comment approved');
        fetchComments();
      } else {
        alert('[ERROR] Comment approval failed: ' + data.message);
      }
    } catch (error) {
      console.error('Comment approval error:', error);
      alert('[ERROR] System error occurred');
    }
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white font-mono">[BLOG] Content Management</h1>
          <p className="text-gray-400 font-mono">Manage blog posts and user comments</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="bg-red-900 hover:bg-red-800 text-red-200 px-6 py-3 rounded-lg transition-colors border border-red-700 font-mono"
        >
          [CREATE] New Post
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
            [POSTS] Blog Posts ({posts.length})
          </button>
          <button
            onClick={() => setActiveTab('comments')}
            className={`py-2 px-1 border-b-2 font-medium text-sm font-mono ${
              activeTab === 'comments'
                ? 'border-red-500 text-red-400'
                : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300'
            }`}
          >
            [COMMENTS] Comments ({comments.filter(c => !c.is_approved).length} pending)
          </button>
        </nav>
      </div>

      {/* Add/Edit Post Form */}
      {showAddForm && (
        <div className="bg-black border border-red-900 p-6 rounded-lg">
          <h2 className="text-xl font-bold text-red-400 mb-4 font-mono">
            {editingPost ? '[EDIT] Modify Post' : '[CREATE] New Blog Post'}
          </h2>

          <form onSubmit={handleSubmitPost} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Post Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                placeholder="Enter blog post title..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Excerpt
              </label>
              <textarea
                value={formData.excerpt}
                onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                rows="2"
                placeholder="Brief description for post preview..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Content *
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
                className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                rows="8"
                placeholder="Write your blog post content here..."
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-mono">
                Featured Image
              </label>

              {/* Image type selection */}
              <div className="flex gap-4 mb-3">
                <label className="flex items-center text-gray-300 font-mono">
                  <input
                    type="radio"
                    name="imageType"
                    value="url"
                    checked={imageType === 'url'}
                    onChange={(e) => setImageType(e.target.value)}
                    className="mr-2"
                  />
                  URL Link
                </label>
                <label className="flex items-center text-gray-300 font-mono">
                  <input
                    type="radio"
                    name="imageType"
                    value="file"
                    checked={imageType === 'file'}
                    onChange={(e) => setImageType(e.target.value)}
                    className="mr-2"
                  />
                  Upload File
                </label>
              </div>

              {/* URL input */}
              {imageType === 'url' && (
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                  className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono"
                  placeholder="https://example.com/image.jpg"
                />
              )}

              {/* File input */}
              {imageType === 'file' && (
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setFormData({...formData, image_file: e.target.files[0]})}
                  className="w-full p-3 bg-gray-800 border border-red-700 rounded-lg text-white focus:ring-2 focus:ring-red-500 font-mono file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-red-600 file:text-white hover:file:bg-red-700"
                />
              )}
            </div>

            <div>
              <label className="flex items-center text-gray-300 font-mono">
                <input
                  type="checkbox"
                  checked={formData.is_published}
                  onChange={(e) => setFormData({...formData, is_published: e.target.checked})}
                  className="mr-2 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                Publish immediately
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-green-900 hover:bg-green-800 text-green-200 px-6 py-2 rounded-lg transition-colors border border-green-700 font-mono"
              >
                {editingPost ? '[SAVE] Update Post' : '[CREATE] Publish Post'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-6 py-2 rounded-lg transition-colors border border-gray-600 font-mono"
              >
                [CANCEL] Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Posts Tab */}
      {activeTab === 'posts' && (
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-black border border-red-900 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white font-mono mb-2">{post.title}</h3>
                  <p className="text-gray-400 mb-4 font-mono">{post.excerpt}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500 font-mono">
                    <span>Author: {post.author_name}</span>
                    <span>Views: {post.view_count}</span>
                    <span>Comments: {post.comment_count}</span>
                    <span>Created: {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`px-2 py-1 text-xs font-mono rounded ${
                    post.is_published
                      ? 'bg-green-900 text-green-200 border border-green-700'
                      : 'bg-red-900 text-red-200 border border-red-700'
                  }`}>
                    {post.is_published ? '[LIVE]' : '[DRAFT]'}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditPost(post)}
                  className="text-green-400 hover:text-green-300 font-mono text-sm"
                >
                  [EDIT]
                </button>
                <button
                  onClick={() => handleDeletePost(post.id)}
                  className="text-red-400 hover:text-red-300 font-mono text-sm"
                >
                  [DELETE]
                </button>
              </div>
            </div>
          ))}

          {posts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-red-400 font-mono">[EMPTY]</div>
              <h3 className="text-xl font-semibold text-white mb-2 font-mono">No blog posts</h3>
              <p className="text-gray-400 font-mono">Create your first blog post to get started</p>
            </div>
          )}
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
                    [POST_TITLE]
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    [AUTHOR]
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    [COMMENT]
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    [STATUS]
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-red-400 uppercase tracking-wider font-mono">
                    [ACTIONS]
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-red-900">
                {comments.map((comment) => (
                  <tr key={comment.id} className="hover:bg-red-900/20">
                    <td className="px-6 py-4 text-sm text-white font-mono">
                      {comment.post_title}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono">
                      {comment.author_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300 font-mono max-w-xs truncate">
                      {comment.comment}
                    </td>
                    <td className="px-6 py-4 text-sm font-mono">
                      <span className={`px-2 py-1 text-xs rounded ${
                        comment.is_approved
                          ? 'bg-green-900 text-green-200 border border-green-700'
                          : 'bg-red-900 text-red-200 border border-red-700'
                      }`}>
                        {comment.is_approved ? '[APPROVED]' : '[PENDING]'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {!comment.is_approved && (
                        <button
                          onClick={() => handleApproveComment(comment.id)}
                          className="text-green-400 hover:text-green-300 font-mono"
                        >
                          [APPROVE]
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {comments.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 text-red-400 font-mono">[EMPTY]</div>
              <h3 className="text-xl font-semibold text-white mb-2 font-mono">No comments</h3>
              <p className="text-gray-400 font-mono">No user comments found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminBlog;