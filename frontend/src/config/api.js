// API Configuration
export const API_CONFIG = {
  // Base API URL - ALWAYS use production URL, no localhost!
  BASE_URL: 'https://bitki-backend.onrender.com',
  baseURL: 'https://bitki-backend.onrender.com',

  // API Endpoints
  ENDPOINTS: {
    // Auth endpoints
    AUTH: {
      LOGIN: '/api/auth/login',
      REGISTER: '/api/auth/register',
      PROFILE: '/api/auth/profile',
      RECOVER_PASSWORD: '/api/auth/recover-password',
      LOGOUT: '/api/auth/logout'
    },

    // Admin endpoints
    ADMIN: {
      LOGIN: '/api/admin/login',
      DASHBOARD: '/api/admin/dashboard',
      USERS: '/api/admin/users',
      PRODUCTS: '/api/admin/products',
      CATEGORIES: '/api/admin/categories',
      ORDERS: '/api/admin/orders',
      REVIEWS: '/api/admin/reviews',
      LOGS: '/api/admin/logs',
      IP_BANS: '/api/admin/ip-bans',
      BACKGROUNDS: '/api/admin/background'
    },

    // Public endpoints
    PRODUCTS: '/api/products',
    CATEGORIES: '/api/categories',
    CART: '/api/cart',
    ADDRESSES: '/api/addresses',
    ORDERS: '/api/orders',
    PAYMENT: '/api/payment',
    BLOG: '/api/blog',
    CAPTCHA: '/api/captcha',
    CITIES: '/api/cities',
    HEALTH: '/api/health',

    // Support & Media
    SUPPORT: '/api/support',
    MEDIA: '/api/media',
    BACKGROUNDS: '/api/backgrounds',
    COUPONS: '/api/coupons',
    PWA: '/api/pwa',
    SETTINGS: '/api/settings'
  }
};

// API helper functions
export const createApiUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

export const createAuthHeaders = (includeAuth = true) => {
  const headers = {
    'Content-Type': 'application/json'
  };

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const createFormDataHeaders = (includeAuth = true) => {
  const headers = {};

  if (includeAuth) {
    const token = localStorage.getItem('token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  // FormData için Content-Type header'ını set etmeyin, browser otomatik ayarlar
  return headers;
};

// API call wrapper
export const apiCall = async (endpoint, options = {}) => {
  const url = createApiUrl(endpoint);
  const config = {
    method: 'GET',
    headers: createAuthHeaders(),
    ...options
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
};

// Domain-specific configuration - PRODUCTION ONLY
export const DOMAIN_CONFIG = {
  PUBLIC_DOMAIN: 'https://bitki-project.vercel.app',
  ADMIN_DOMAIN: 'https://bitki-admin.vercel.app'
};

export default API_CONFIG;