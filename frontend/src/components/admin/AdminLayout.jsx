import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext.jsx';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  FileText,
  Shield,
  HelpCircle,
  Tag,
  Smartphone,
  Image,
  Folder,
  Palette,
  Grid3X3
} from 'lucide-react';

const AdminLayout = ({ children }) => {
  const { user, logout } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    // Ana Dashboard
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },

    // Temel Yönetim
    { name: 'Kullanıcılar', href: '/users', icon: Users },
    { name: 'Ürünler', href: '/products', icon: Package },
    { name: 'Siparişler', href: '/orders', icon: ShoppingCart },
    { name: 'Kategoriler', href: '/categories', icon: Grid3X3 },

    // İçerik ve Müşteri
    { name: 'Blog', href: '/blog', icon: FileText },
    { name: 'Destek', href: '/support', icon: HelpCircle },
    { name: 'Kuponlar', href: '/coupons', icon: Tag },

    // Medya ve Görsel
    { name: 'Medya Yönetimi', href: '/media', icon: Image },
    { name: 'Arkaplan Yönetimi', href: '/backgrounds', icon: Folder },
    { name: 'Arkaplan Ayarları', href: '/background-settings', icon: Palette },

    // Sistem ve Güvenlik
    { name: 'Güvenlik', href: '/security', icon: Shield },
    { name: 'PWA Yönetimi', href: '/pwa', icon: Smartphone },
    { name: 'Ayarlar', href: '/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-gray-800">
          <div className="flex h-16 items-center justify-between px-4">
            <span className="text-xl font-bold text-white">Admin Panel</span>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 overflow-y-auto px-2 py-4">
            {navigation.map((item, index) => {
              const isActive = location.pathname === item.href;
              const showGroupHeader =
                (index === 0) || // Dashboard
                (index === 1) || // Temel Yönetim
                (index === 5) || // İçerik ve Müşteri
                (index === 8) || // Medya ve Görsel
                (index === 11); // Sistem ve Güvenlik

              const groupTitles = [
                'Dashboard',
                'Temel Yönetim',
                '',
                '',
                '',
                'İçerik ve Müşteri',
                '',
                '',
                'Medya ve Görsel',
                '',
                '',
                'Sistem ve Güvenlik',
                '',
                ''
              ];

              return (
                <div key={item.name}>
                  {showGroupHeader && groupTitles[index] && (
                    <div className="px-2 py-2">
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                        {groupTitles[index]}
                      </h3>
                    </div>
                  )}
                  <Link
                    to={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-red-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="mr-3 h-5 w-5" />
                    {item.name}
                  </Link>
                </div>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-800 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 py-4">
            <span className="text-xl font-bold text-white">Admin Panel</span>
          </div>
          <nav className="flex-1 flex flex-col overflow-y-auto">
            <div className="space-y-1 px-2 py-4">
              {navigation.map((item, index) => {
                const isActive = location.pathname === item.href;
                const showGroupHeader =
                  (index === 0) || // Dashboard
                  (index === 1) || // Temel Yönetim
                  (index === 5) || // İçerik ve Müşteri
                  (index === 8) || // Medya ve Görsel
                  (index === 11); // Sistem ve Güvenlik

                const groupTitles = [
                  'Dashboard',
                  'Temel Yönetim',
                  '',
                  '',
                  '',
                  'İçerik ve Müşteri',
                  '',
                  '',
                  'Medya ve Görsel',
                  '',
                  '',
                  'Sistem ve Güvenlik',
                  '',
                  ''
                ];

                return (
                  <div key={item.name}>
                    {showGroupHeader && groupTitles[index] && (
                      <div className="px-2 py-2">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                          {groupTitles[index]}
                        </h3>
                      </div>
                    )}
                    <Link
                      to={item.href}
                      className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                        isActive
                          ? 'bg-red-600 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.name}
                    </Link>
                  </div>
                );
              })}
            </div>
          </nav>
          <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
            <div className="flex items-center w-full">
              <div>
                <p className="text-sm font-medium text-white">{user?.nickname}</p>
                <p className="text-xs text-gray-400">Admin</p>
              </div>
              <button
                onClick={handleLogout}
                className="ml-auto bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white p-2 rounded-md transition-colors"
                title="Çıkış Yap"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-gray-800 shadow lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="border-r border-gray-700 px-4 text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex-1 flex justify-between px-4">
            <div className="flex-1 flex items-center">
              <h1 className="text-xl font-semibold text-white">Admin Panel</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-300">{user?.nickname}</span>
              <button
                onClick={handleLogout}
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white p-2 rounded-md transition-colors"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="flex-1">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;