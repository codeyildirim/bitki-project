import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout Components
import Layout from './components/common/Layout';

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


// Loading Component
import LoadingSpinner from './components/common/LoadingSpinner';
import PWAInstallBanner from './components/common/PWAInstallBanner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
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
        <Route path="/auth/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/auth/recover" element={<RecoverPassword />} />

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