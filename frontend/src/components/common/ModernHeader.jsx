import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  X,
  LogOut,
  Settings,
  Package,
  Heart
} from 'lucide-react';

const ModernHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const { items } = useCart();
  const navigate = useNavigate();

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    logout();
    setIsUserMenuOpen(false);
    navigate('/');
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">

          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMenu}>
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-lg md:text-xl">🌿</span>
              </div>
              <span className="hidden sm:block text-xl md:text-2xl font-bold text-gray-800">
                Şifalı Bitkiler
              </span>
              <span className="sm:hidden text-lg font-bold text-gray-800">SB</span>
            </Link>
          </div>

          {/* Search Bar - Hidden on mobile */}
          <div className="hidden md:flex flex-1 max-w-lg mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün, kategori ara..."
                  className="w-full px-4 py-2 pl-10 pr-4 text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <button
                  type="submit"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full hover:bg-green-600 transition-colors text-sm"
                >
                  Ara
                </button>
              </div>
            </form>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Ürünler
            </Link>
            <Link to="/blog" className="text-gray-700 hover:text-green-600 transition-colors font-medium">
              Blog
            </Link>
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Search Button */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
              onClick={() => {
                const searchTerm = prompt('Ürün ara:');
                if (searchTerm) {
                  navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
                }
              }}
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Cart */}
            <Link
              to="/cart"
              className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
              onClick={closeMenu}
            >
              <ShoppingCart className="w-5 h-5 md:w-6 md:h-6" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {cartItemCount > 9 ? '9+' : cartItemCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 p-2 text-gray-600 hover:text-green-600 transition-colors"
                >
                  <User className="w-5 h-5 md:w-6 md:h-6" />
                  <span className="hidden md:block text-sm font-medium">{user?.nickname}</span>
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border py-1 z-50">
                    <Link
                      to="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Profil
                    </Link>
                    <Link
                      to="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Package className="w-4 h-4 mr-2" />
                      Siparişlerim
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin-panel"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <Settings className="w-4 h-4 mr-2" />
                        Admin Panel
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Çıkış Yap
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/auth/login"
                  className="hidden md:block px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600 transition-colors"
                  onClick={closeMenu}
                >
                  Giriş
                </Link>
                <Link
                  to="/auth/register"
                  className="px-3 py-2 md:px-4 md:py-2 text-xs md:text-sm font-medium text-white bg-green-500 rounded-full hover:bg-green-600 transition-colors"
                  onClick={closeMenu}
                >
                  Kayıt Ol
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMenu}
              className="md:hidden p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {/* Mobile Search */}
              <form onSubmit={handleSearch} className="mb-4">
                <div className="relative">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ürün, kategori ara..."
                    className="w-full px-4 py-2 pl-10 pr-16 text-gray-700 bg-gray-100 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-green-500 text-white px-3 py-1 rounded-full text-sm"
                  >
                    Ara
                  </button>
                </div>
              </form>

              <Link
                to="/products"
                onClick={closeMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
              >
                Ürünler
              </Link>
              <Link
                to="/blog"
                onClick={closeMenu}
                className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
              >
                Blog
              </Link>

              {!isAuthenticated && (
                <>
                  <Link
                    to="/auth/login"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
                  >
                    Giriş Yap
                  </Link>
                  <Link
                    to="/auth/register"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-green-600 hover:bg-gray-50 rounded-md"
                  >
                    Kayıt Ol
                  </Link>
                </>
              )}

              {isAuthenticated && (
                <>
                  <Link
                    to="/profile"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
                  >
                    Profil
                  </Link>
                  <Link
                    to="/orders"
                    onClick={closeMenu}
                    className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
                  >
                    Siparişlerim
                  </Link>
                  {isAdmin && (
                    <Link
                      to="/admin-panel"
                      onClick={closeMenu}
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-green-600 hover:bg-gray-50 rounded-md"
                    >
                      Admin Panel
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-base font-medium text-red-600 hover:bg-gray-50 rounded-md"
                  >
                    Çıkış Yap
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close user menu */}
      {isUserMenuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsUserMenuOpen(false)}
        />
      )}
    </header>
  );
};

export default ModernHeader;