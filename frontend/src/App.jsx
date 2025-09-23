import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Layout from './components/common/Layout';
import DarkAdminLayout from './components/admin/DarkAdminLayout';

// Public Pages
import Home from './pages/SimpleHome';
import Products from './pages/EnhancedProducts';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/EnhancedCart';
import Checkout from './pages/EnhancedCheckout';
import Blog from './pages/EnhancedBlog';
import BlogPost from './pages/EnhancedBlogPost';
import Profile from './pages/Profile';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';

// Auth Pages
import Login from './pages/auth/SimpleLogin';
import Register from './pages/auth/SimpleRegister';
import RecoverPassword from './pages/auth/RecoverPassword';

// Admin Pages
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/DarkDashboard';
import AdminProducts from './pages/Admin/Products';
import AdminOrders from './pages/Admin/Orders';
import AdminUsers from './pages/Admin/Users';
import AdminSecurity from './pages/Admin/Security';
import AdminCategories from './pages/Admin/Categories';
import AdminBlog from './pages/Admin/Blog';
import AdminSettings from './pages/Admin/Settings';
import AdminCoupons from './pages/Admin/Coupons';
import PWAManagement from './pages/Admin/PWAManagement';
import AdminSupport from './pages/Admin/Support';
import BackgroundSettings from './pages/Admin/BackgroundSettings';

// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner';
import PWAInstallBanner from './components/common/PWAInstallBanner';

// Protected Route Component - Only for normal users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  // Admin kullanıcıları normal sayfalara erişemez
  if (isAdmin) {
    return <Navigate to="/admin-panel/dashboard" replace />;
  }

  return children;
};

// Admin Only Route Component
const AdminOnlyRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin-panel" replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

// Public Route Component - Allow non-admin users or unauthenticated
const PublicRoute = ({ children }) => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  // Admin kullanıcıları admin panele yönlendir
  if (isAdmin) {
    return <Navigate to="/admin-panel/dashboard" replace />;
  }

  return children;
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-transparent">
        <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
          <Route path="blog" element={<Blog />} />
          <Route path="blog/:id" element={<BlogPost />} />
        </Route>

        {/* Auth Routes */}
        <Route path="/auth/login" element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } />
        <Route path="/auth/register" element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } />
        <Route path="/auth/recover" element={
          <PublicRoute>
            <RecoverPassword />
          </PublicRoute>
        } />

        {/* Protected User Routes */}
        <Route path="/" element={<Layout />}>
          <Route path="checkout" element={
            <ProtectedRoute>
              <Checkout />
            </ProtectedRoute>
          } />
          <Route path="profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          <Route path="orders/:id" element={
            <ProtectedRoute>
              <OrderDetail />
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin Login Route - No PublicRoute wrapper */}
        <Route path="/admin-panel" element={<AdminLogin />} />

        {/* Dark Admin Panel - Admin Only Routes */}
        <Route path="/admin-panel/dashboard" element={
          <AdminOnlyRoute>
            <DarkAdminLayout />
          </AdminOnlyRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="security" element={<AdminSecurity />} />
          <Route path="blog" element={<AdminBlog />} />
          <Route path="coupons" element={<AdminCoupons />} />
          <Route path="pwa" element={<PWAManagement />} />
          <Route path="support" element={<AdminSupport />} />
          <Route path="backgrounds" element={<BackgroundSettings />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* Old Admin Routes - Redirect to new panel */}
        <Route path="/admin" element={<Navigate to="/admin-panel" replace />} />
        <Route path="/admin/*" element={<Navigate to="/admin-panel" replace />} />

        {/* 404 Route */}
        <Route path="*" element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
              <p className="text-xl text-gray-600 mb-8">Sayfa bulunamadı</p>
              <a
                href="/"
                className="btn btn-primary"
              >
                Ana Sayfaya Dön
              </a>
            </div>
          </div>
        } />
      </Routes>

      {/* PWA Install Banner - Only show on public pages */}
      <PWAInstallBanner />
      </div>
    </ThemeProvider>
  );
}

export default App;