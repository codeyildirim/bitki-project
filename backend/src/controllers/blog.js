import { responseSuccess, responseError } from '../utils/helpers.js';
import db from '../models/database.js';

export const getBlogPosts = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const posts = await db.all(`
      SELECT bp.*, u.nickname as author_name,
      (SELECT COUNT(*) FROM blog_comments WHERE post_id = bp.id AND is_approved = 1) as comment_count
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.is_published = 1
      ORDER BY bp.created_at DESC
      LIMIT ? OFFSET ?
    `, [limit, offset]);

    const { total } = await db.get('SELECT COUNT(*) as total FROM blog_posts WHERE is_published = 1');

    res.json(responseSuccess({
      posts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit)
      }
    }));

  } catch (error) {
    console.error('Blog yazıları getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const getBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    const post = await db.get(`
      SELECT bp.*, u.nickname as author_name
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      WHERE bp.id = ? AND bp.is_published = 1
    `, [id]);

    if (!post) {
      return res.status(404).json(responseError('Blog yazısı bulunamadı'));
    }

    const comments = await db.all(`
      SELECT bc.*, u.nickname as user_nickname
      FROM blog_comments bc
      LEFT JOIN users u ON bc.user_id = u.id
      WHERE bc.post_id = ? AND bc.is_approved = 1
      ORDER BY bc.created_at ASC
    `, [id]);

    res.json(responseSuccess({ ...post, comments }));

  } catch (error) {
    console.error('Blog yazısı getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const addBlogComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment } = req.body;

    if (!comment || comment.trim().length < 10) {
      return res.status(400).json(responseError('Yorum en az 10 karakter olmalıdır'));
    }

    const post = await db.get('SELECT * FROM blog_posts WHERE id = ? AND is_published = 1', [id]);
    if (!post) {
      return res.status(404).json(responseError('Blog yazısı bulunamadı'));
    }

    await db.run(`
      INSERT INTO blog_comments (post_id, user_id, comment, is_approved)
      VALUES (?, ?, ?, 0)
    `, [id, req.user.id, comment.trim()]);

    res.json(responseSuccess(null, 'Yorumunuz incelenmek üzere gönderildi'));

  } catch (error) {
    console.error('Blog yorumu ekleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin Blog İşlemleri
export const createBlogPost = async (req, res) => {
  try {
    const { title, content, isPublished } = req.body;

    if (!title || !content) {
      return res.status(400).json(responseError('Başlık ve içerik gereklidir'));
    }

    const result = await db.run(`
      INSERT INTO blog_posts (title, content, author_id, is_published)
      VALUES (?, ?, ?, ?)
    `, [title, content, req.user.id, isPublished || 0]);

    res.json(responseSuccess({ id: result.id }, 'Blog yazısı oluşturuldu'));

  } catch (error) {
    console.error('Blog yazısı oluşturma hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const updateBlogPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, isPublished } = req.body;

    const post = await db.get('SELECT * FROM blog_posts WHERE id = ?', [id]);
    if (!post) {
      return res.status(404).json(responseError('Blog yazısı bulunamadı'));
    }

    await db.run(`
      UPDATE blog_posts
      SET title = ?, content = ?, is_published = ?
      WHERE id = ?
    `, [title, content, isPublished, id]);

    res.json(responseSuccess(null, 'Blog yazısı güncellendi'));

  } catch (error) {
    console.error('Blog yazısı güncelleme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const deleteBlogPost = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('DELETE FROM blog_posts WHERE id = ?', [id]);
    await db.run('DELETE FROM blog_comments WHERE post_id = ?', [id]);

    res.json(responseSuccess(null, 'Blog yazısı silindi'));

  } catch (error) {
    console.error('Blog yazısı silme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const getBlogComments = async (req, res) => {
  try {
    const comments = await db.all(`
      SELECT bc.*, u.nickname as user_nickname, bp.title as post_title
      FROM blog_comments bc
      LEFT JOIN users u ON bc.user_id = u.id
      LEFT JOIN blog_posts bp ON bc.post_id = bp.id
      ORDER BY bc.created_at DESC
    `);

    res.json(responseSuccess(comments));

  } catch (error) {
    console.error('Blog yorumları getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

export const approveBlogComment = async (req, res) => {
  try {
    const { id } = req.params;

    await db.run('UPDATE blog_comments SET is_approved = 1 WHERE id = ?', [id]);

    res.json(responseSuccess(null, 'Yorum onaylandı'));

  } catch (error) {
    console.error('Blog yorumu onaylama hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};

// Admin için tüm blog postlarını getir
export const getAdminBlogPosts = async (req, res) => {
  try {
    const posts = await db.all(`
      SELECT bp.*, u.nickname as author_name,
      (SELECT COUNT(*) FROM blog_comments WHERE post_id = bp.id) as comment_count
      FROM blog_posts bp
      LEFT JOIN users u ON bp.author_id = u.id
      ORDER BY bp.created_at DESC
    `);

    res.json(responseSuccess(posts));

  } catch (error) {
    console.error('Admin blog yazıları getirme hatası:', error);
    res.status(500).json(responseError('Sunucu hatası'));
  }
};