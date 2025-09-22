import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';

const BlogPost = () => {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      const response = await fetch(`/api/blog/${id}`);
      const data = await response.json();
      if (data.success) {
        setPost(data.data);
        setComments(data.data.comments || []);
      }
    } catch (error) {
      console.error('Blog yazısı yüklenemedi:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
          <div className="space-y-3">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Blog yazısı bulunamadı</h2>
        <Link to="/blog" className="text-green-600 hover:text-green-700">
          Blog'a geri dön
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-green-600">Ana Sayfa</Link>
          <span>/</span>
          <Link to="/blog" className="hover:text-green-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-900">{post.title}</span>
        </div>
      </nav>

      <article className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center space-x-4 text-gray-600">
            <span>✍️ {post.author}</span>
            <span>📅 {new Date(post.created_at).toLocaleDateString('tr-TR')}</span>
            <span>👁️ {post.views || 0} görüntüleme</span>
          </div>
        </header>

        {/* Featured Image */}
        {post.image && (
          <div className="mb-8">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="prose prose-lg max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </div>

        {/* Tags */}
        {post.tags && (
          <div className="mb-8">
            <div className="flex flex-wrap gap-2">
              {post.tags.split(',').map((tag, index) => (
                <span
                  key={index}
                  className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm"
                >
                  #{tag.trim()}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Comments */}
        <div className="border-t pt-8">
          <h3 className="text-2xl font-bold mb-6">Yorumlar ({comments.length})</h3>
          {comments.length === 0 ? (
            <p className="text-gray-500">Henüz yorum yapılmamış.</p>
          ) : (
            <div className="space-y-6">
              {comments.map((comment) => (
                <div key={comment.id} className="bg-gray-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold">{comment.author}</div>
                    <div className="text-sm text-gray-500">
                      {new Date(comment.created_at).toLocaleDateString('tr-TR')}
                    </div>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
};

export default BlogPost;