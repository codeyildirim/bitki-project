// Merkezi localStorage yönetim servisi
// Tüm localStorage işlemlerini tek bir yerden yönetir

class StorageService {
  // Auth anahtarları
  static AUTH_KEY = 'auth';
  static USER_KEY = 'user';
  static TOKEN_KEY = 'token';
  static ADMIN_TOKEN_KEY = 'adminToken';
  static ADMIN_USER_KEY = 'adminUser';
  static CART_KEY = 'cart';
  static THEME_KEY = 'theme';

  // Auth işlemleri
  setAuth(token, user) {
    try {
      const authData = { token, user, timestamp: Date.now() };
      localStorage.setItem(StorageService.AUTH_KEY, JSON.stringify(authData));
      return true;
    } catch (error) {
      console.error('Auth data kaydetme hatası:', error);
      return false;
    }
  }

  getAuth() {
    try {
      const authData = localStorage.getItem(StorageService.AUTH_KEY);
      if (!authData) return null;
      return JSON.parse(authData);
    } catch (error) {
      console.error('Auth data okuma hatası:', error);
      this.clearAuth();
      return null;
    }
  }

  getToken() {
    const auth = this.getAuth();
    const token = auth?.token || null;
    // Clean up invalid token values
    if (token === 'null' || token === 'undefined') {
      this.clearAuth();
      return null;
    }
    return token;
  }

  getUser() {
    const auth = this.getAuth();
    return auth?.user || null;
  }

  clearAuth() {
    localStorage.removeItem(StorageService.AUTH_KEY);
    localStorage.removeItem(StorageService.USER_KEY);
    localStorage.removeItem(StorageService.TOKEN_KEY);
  }

  // Admin auth işlemleri
  setAdminAuth(token, user) {
    try {
      const adminData = { token, user, timestamp: Date.now() };
      localStorage.setItem(StorageService.ADMIN_TOKEN_KEY, token);
      localStorage.setItem(StorageService.ADMIN_USER_KEY, JSON.stringify(user));
      return true;
    } catch (error) {
      console.error('Admin auth data kaydetme hatası:', error);
      return false;
    }
  }

  getAdminToken() {
    try {
      const token = localStorage.getItem(StorageService.ADMIN_TOKEN_KEY);
      // Clean up invalid token values
      if (token === 'null' || token === 'undefined' || !token) {
        this.clearAdminAuth();
        return null;
      }
      return token;
    } catch (error) {
      console.error('Admin token okuma hatası:', error);
      return null;
    }
  }

  getAdminUser() {
    try {
      const userData = localStorage.getItem(StorageService.ADMIN_USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Admin user okuma hatası:', error);
      this.clearAdminAuth();
      return null;
    }
  }

  clearAdminAuth() {
    localStorage.removeItem(StorageService.ADMIN_TOKEN_KEY);
    localStorage.removeItem(StorageService.ADMIN_USER_KEY);
  }

  // Sepet işlemleri
  setCart(cartItems) {
    try {
      localStorage.setItem(StorageService.CART_KEY, JSON.stringify(cartItems));
      return true;
    } catch (error) {
      console.error('Sepet kaydetme hatası:', error);
      return false;
    }
  }

  getCart() {
    try {
      const cartData = localStorage.getItem(StorageService.CART_KEY);
      return cartData ? JSON.parse(cartData) : [];
    } catch (error) {
      console.error('Sepet okuma hatası:', error);
      return [];
    }
  }

  clearCart() {
    localStorage.removeItem(StorageService.CART_KEY);
  }

  // Tema işlemleri
  setTheme(theme) {
    try {
      localStorage.setItem(StorageService.THEME_KEY, theme);
      return true;
    } catch (error) {
      console.error('Tema kaydetme hatası:', error);
      return false;
    }
  }

  getTheme() {
    try {
      return localStorage.getItem(StorageService.THEME_KEY) || 'light';
    } catch (error) {
      console.error('Tema okuma hatası:', error);
      return 'light';
    }
  }

  // Genel temizlik
  clearAll() {
    this.clearAuth();
    this.clearAdminAuth();
    this.clearCart();
    localStorage.removeItem(StorageService.THEME_KEY);
  }

  // Eski anahtarları temizle
  cleanupOldKeys() {
    const oldKeys = [
      'userToken',
      'currentUser',
      'authToken',
      'userData',
      'isLoggedIn',
      'loginTime',
      'selectedCity',
      'cartItems',
      'userCity',
      'lastLogin'
    ];

    oldKeys.forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Storage durumunu kontrol et
  checkStorage() {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.error('localStorage kullanılamıyor:', error);
      return false;
    }
  }

  // Debug: Tüm anahtarları listele
  getAllKeys() {
    if (!this.checkStorage()) return [];

    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      keys.push(localStorage.key(i));
    }
    return keys;
  }

  // Debug: Storage boyutunu hesapla
  getStorageSize() {
    if (!this.checkStorage()) return 0;

    let total = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        total += localStorage.getItem(key).length + key.length;
      }
    }
    return total;
  }
}

// Singleton instance
const storage = new StorageService();

// Production'da eski anahtarları temizle
if (typeof window !== 'undefined') {
  storage.cleanupOldKeys();
}

export default storage;