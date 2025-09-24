import axios from 'axios';

// PRODUCTION API URL - NO LOCALHOST!
const API_BASE_URL = 'https://bitki-backend.onrender.com/api';

// Axios instance oluştur
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor - Token ekleme
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Hata yönetimi
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/auth/login';
    }
    return Promise.reject(error);
  }
);

// API fonksiyonları
export const authApi = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  recoverPassword: (data) => api.post('/auth/recover-password', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
};

export const productsApi = {
  getAll: (params) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  getFeatured: () => api.get('/products/featured'),
  getCategories: () => api.get('/products/categories'),
  addReview: (id, review) => api.post(`/products/${id}/reviews`, review),
};

export const ordersApi = {
  create: (orderData) => api.post('/orders', orderData),
  uploadPaymentProof: (orderId, formData) =>
    api.post(`/orders/${orderId}/payment-proof`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  getUserOrders: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
};

export const blogApi = {
  getPosts: (params) => api.get('/blog', { params }),
  getPost: (id) => api.get(`/blog/${id}`),
  addComment: (id, comment) => api.post(`/blog/${id}/comments`, comment),
};

export const adminApi = {
  // Kullanıcı yönetimi
  getUsers: () => api.get('/admin/users'),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  resetUserPassword: (id, data) => api.put(`/admin/users/${id}/reset-password`, data),

  // IP ban yönetimi
  getIPBans: () => api.get('/admin/ip-bans'),
  addIPBan: (data) => api.post('/admin/ip-bans', data),
  removeIPBan: (id) => api.delete(`/admin/ip-bans/${id}`),

  // Ürün yönetimi
  createProduct: (formData) =>
    api.post('/admin/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  updateProduct: (id, formData) =>
    api.put(`/admin/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  deleteProduct: (id) => api.delete(`/admin/products/${id}`),

  // Kategori yönetimi
  createCategory: (data) => api.post('/admin/categories', data),
  deleteCategory: (id) => api.delete(`/categories/${id}`),

  // Sipariş yönetimi
  getAllOrders: () => api.get('/admin/orders'),
  updateOrderStatus: (id, data) => api.put(`/admin/orders/${id}/status`, data),

  // Yorum yönetimi
  getReviews: () => api.get('/admin/reviews'),
  approveReview: (id) => api.put(`/admin/reviews/${id}/approve`),
  addAdminReview: (data) => api.post('/admin/reviews', data),

  // Blog yönetimi
  createBlogPost: (data) => api.post('/blog/admin/posts', data),
  updateBlogPost: (id, data) => api.put(`/blog/admin/posts/${id}`, data),
  deleteBlogPost: (id) => api.delete(`/blog/admin/posts/${id}`),
  getBlogComments: () => api.get('/blog/admin/comments'),
  approveBlogComment: (id) => api.put(`/blog/admin/comments/${id}/approve`),
};

export const generalApi = {
  getCities: () => api.get('/cities'),
  getCryptoAddresses: () => api.get('/crypto/addresses'),
  health: () => api.get('/health'),
};

export default api;