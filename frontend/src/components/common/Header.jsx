import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCart,
  User,
  Menu,
  X,
  Search,
  LogOut,
  Package,
  Settings
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();

  const { getTotalItems } = useCart();

  // Admin kullanıcılar için header'ı gösterme, onlar admin panele yönlendirilecek
  if (isAdmin) {
    return null;
  }
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
      setIsMobileMenuOpen(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  };

  const navigation = [
    { name: 'Ana Sayfa', href: '/' },
    { name: 'Ürünler', href: '/products' },
    { name: 'Blog', href: '/blog' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg border-b-4 border-rick-green">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center space-x-2 text-rick-green hover:text-green-600 transition-all duration-300 hover:scale-105"
          >
            <div className="text-2xl sm:text-3xl animate-float">🌿</div>
            <span className="text-lg sm:text-xl lg:text-2xl font-heading font-bold">Rick'in Bitkiler</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6 xl:space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green transition-all duration-300 font-heading font-semibold text-base xl:text-lg hover:scale-105 hover:animate-slime-wiggle"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden xl:flex items-center">
            <div className="relative">
              <input
                type="text"
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 pl-10 pr-4 py-2 sm:py-3 border-2 border-rick-green rounded-none focus:ring-2 focus:ring-rick-purple focus:border-rick-purple transition-all duration-300 font-sans text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-rick-green" />
            </div>
          </form>

          {/* Right Section */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 sm:p-3 text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green transition-all duration-300 hover:scale-110 hover:animate-slime-drip"
            >
              <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6" />
              {getTotalItems() > 0 && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-1 -right-1 bg-rick-purple text-white text-xs rounded-none w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center font-heading font-bold animate-bounce"
                >
                  {getTotalItems()}
                </motion.span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 p-2 sm:p-3 text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green transition-all duration-300 hover:scale-105 hover:animate-slime-wiggle"
                >
                  <User className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span className="hidden md:block text-xs sm:text-sm font-heading font-semibold">
                    {user?.nickname}
                  </span>
                </button>

                <AnimatePresence>
                  {isProfileMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 sm:w-56 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-none shadow-lg border-2 border-rick-green py-2"
                    >
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rick-green/10 dark:hover:bg-rick-green/20 hover:text-rick-green transition-all duration-300 font-heading"
                      >
                        <User className="w-4 h-4" />
                        <span>Profilim</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center space-x-2 px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rick-green/10 dark:hover:bg-rick-green/20 hover:text-rick-green transition-all duration-300 font-heading"
                      >
                        <Package className="w-4 h-4" />
                        <span>Siparişlerim</span>
                      </Link>
                      {isAdmin && (
                        <Link
                          to="/admin-panel/dashboard"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="flex items-center space-x-2 px-4 py-2 sm:py-3 text-sm sm:text-base text-gray-700 dark:text-gray-300 hover:bg-rick-purple/10 dark:hover:bg-rick-purple/20 hover:text-rick-purple transition-all duration-300 font-heading"
                        >
                          <Settings className="w-4 h-4" />
                          <span>Admin Panel</span>
                        </Link>
                      )}
                      <hr className="my-1 border-gray-200 dark:border-gray-700" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-4 py-2 sm:py-3 text-sm sm:text-base text-rick-pink hover:bg-rick-pink/10 dark:hover:bg-rick-pink/20 transition-all duration-300 font-heading"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Çıkış Yap</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-2">
                <Link
                  to="/auth/login"
                  className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base font-heading font-semibold text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green transition-all duration-300 hover:scale-105"
                >
                  Giriş Yap
                </Link>
                <Link
                  to="/auth/register"
                  className="px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm lg:text-base font-heading font-semibold bg-rick-green text-white hover:bg-green-600 transition-all duration-300 hover:scale-105 hover:animate-slime-drip rounded-none"
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 sm:p-3 text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green transition-all duration-300 hover:scale-110"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5 sm:w-6 sm:h-6" />
              ) : (
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t-2 border-rick-green py-4 sm:py-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm"
            >
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4 sm:mb-6">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ürün ara..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-rick-green rounded-none focus:ring-2 focus:ring-rick-purple focus:border-rick-purple transition-all duration-300 font-sans text-sm sm:text-base"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-rick-green" />
                </div>
              </form>

              {/* Mobile Navigation */}
              <nav className="space-y-2">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block px-3 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green hover:bg-rick-green/10 dark:hover:bg-rick-green/20 rounded-none transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
                  >
                    {item.name}
                  </Link>
                ))}

                {!isAuthenticated && (
                  <div className="border-t-2 border-rick-green pt-4 mt-4 space-y-2">
                    <Link
                      to="/auth/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green hover:bg-rick-green/10 dark:hover:bg-rick-green/20 rounded-none transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
                    >
                      Giriş Yap
                    </Link>
                    <Link
                      to="/auth/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="block px-3 sm:px-4 py-2 sm:py-3 bg-rick-green text-white hover:bg-green-600 rounded-none transition-all duration-300 font-heading font-semibold text-base sm:text-lg hover:animate-slime-drip"
                    >
                      Kayıt Ol
                    </Link>
                  </div>
                )}

                {/* Mobile User Menu */}
                {isAuthenticated && (
                  <div className="border-t-2 border-rick-green pt-4 mt-4 space-y-2">
                    <div className="px-3 sm:px-4 py-1 sm:py-2 text-rick-green font-heading font-bold text-base sm:text-lg">
                      Merhaba, {user?.nickname}!
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green hover:bg-rick-green/10 dark:hover:bg-rick-green/20 rounded-none transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
                    >
                      <User className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Profilim</span>
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 hover:text-rick-green dark:hover:text-rick-green hover:bg-rick-green/10 dark:hover:bg-rick-green/20 rounded-none transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
                    >
                      <Package className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Siparişlerim</span>
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin-panel/dashboard"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-gray-700 dark:text-gray-300 hover:text-rick-purple dark:hover:text-rick-purple hover:bg-rick-purple/10 dark:hover:bg-rick-purple/20 rounded-none transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
                      >
                        <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Admin Panel</span>
                      </Link>
                    )}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 text-rick-pink hover:bg-rick-pink/10 dark:hover:bg-rick-pink/20 rounded-none transition-all duration-300 font-heading font-semibold text-base sm:text-lg"
                    >
                      <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Çıkış Yap</span>
                    </button>
                  </div>
                )}
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;