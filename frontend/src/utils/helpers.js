export const formatPrice = (price) => {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY'
  }).format(price);
};

export const formatDate = (dateString) => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(dateString));
};

export const formatDateShort = (dateString) => {
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(new Date(dateString));
};

export const validateNickname = (nickname) => {
  if (!nickname) return 'Nickname gereklidir';
  if (nickname.length < 3) return 'Nickname en az 3 karakter olmalıdır';
  if (nickname.length > 24) return 'Nickname en fazla 24 karakter olmalıdır';
  if (!/^[A-Za-z0-9_.]+$/.test(nickname)) return 'Nickname sadece harf, rakam, altçizgi ve nokta içerebilir';
  return null;
};

export const validatePassword = (password) => {
  if (!password) return 'Şifre gereklidir';
  if (password.length < 6) return 'Şifre en az 6 karakter olmalıdır';
  return null;
};

export const validateEmail = (email) => {
  if (!email) return 'E-posta gereklidir';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Geçerli bir e-posta adresi giriniz';
  return null;
};

export const validatePhone = (phone) => {
  if (!phone) return 'Telefon gereklidir';
  const cleanPhone = phone.replace(/\D/g, '');
  if (!/^(90)?5[0-9]{9}$/.test(cleanPhone)) return 'Geçerli bir telefon numarası giriniz';
  return null;
};

export const formatPhone = (phone) => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('90')) {
    return cleaned.replace(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/, '+90 ($1) $2 $3 $4');
  } else if (cleaned.startsWith('5')) {
    return cleaned.replace(/^(\d{3})(\d{3})(\d{2})(\d{2})$/, '($1) $2 $3 $4');
  }
  return phone;
};

export const getOrderStatusText = (status) => {
  const statusMap = {
    'bekliyor': 'Bekliyor',
    'onaylandı': 'Onaylandı',
    'hazırlanıyor': 'Hazırlanıyor',
    'kargoda': 'Kargoda',
    'tamamlandı': 'Tamamlandı',
    'iptal': 'İptal'
  };
  return statusMap[status] || status;
};

export const getOrderStatusColor = (status) => {
  const colorMap = {
    'bekliyor': 'bg-yellow-100 text-yellow-800',
    'onaylandı': 'bg-blue-100 text-blue-800',
    'hazırlanıyor': 'bg-orange-100 text-orange-800',
    'kargoda': 'bg-purple-100 text-purple-800',
    'tamamlandı': 'bg-green-100 text-green-800',
    'iptal': 'bg-red-100 text-red-800'
  };
  return colorMap[status] || 'bg-gray-100 text-gray-800';
};

export const truncateText = (text, maxLength = 100) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
};

export const generateStars = (rating) => {
  const stars = [];
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 !== 0;

  for (let i = 0; i < fullStars; i++) {
    stars.push('full');
  }

  if (hasHalfStar) {
    stars.push('half');
  }

  while (stars.length < 5) {
    stars.push('empty');
  }

  return stars;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      document.body.removeChild(textArea);
      return true;
    } catch (err) {
      document.body.removeChild(textArea);
      return false;
    }
  }
};

export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};

export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;
  return `https://bitki-backend.onrender.com/uploads/${imagePath}`;
};