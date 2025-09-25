import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import AdminLogin from './pages/Admin/AdminLogin.jsx';
import AdminDashboard from './pages/Admin/AdminDashboard.jsx';
import AdminUsers from './pages/Admin/AdminUsers.jsx';
import AdminProducts from './pages/Admin/AdminProducts.jsx';
import AdminOrders from './pages/Admin/AdminOrders.jsx';
import AdminSettings from './pages/Admin/AdminSettings.jsx';
import AdminLayout from './components/admin/AdminLayout.jsx';

// Import extended admin features
import DarkDashboard from './pages/Admin/DarkDashboard.jsx';
import Categories from './pages/Admin/Categories.jsx';
import Blog from './pages/Admin/Blog.jsx';
import Support from './pages/Admin/Support.jsx';
import Security from './pages/Admin/Security.jsx';
import BackgroundSettings from './pages/Admin/BackgroundSettings.jsx';
import Coupons from './pages/Admin/Coupons.jsx';
import PWAManagement from './pages/Admin/PWAManagement.jsx';
import MediaManagement from './components/admin/MediaManagement.jsx';
import BackgroundManagement from './components/admin/BackgroundManagement.jsx';

// Admin authentication context
import { AdminAuthProvider, useAdminAuth } from './context/AdminAuthContext.jsx';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

const AdminApp = () => {
  return (
    <AdminAuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-900">
          <Routes>
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/" element={
              <ProtectedRoute>
                <AdminLayout>
                  <DarkDashboard />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/users" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminUsers />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/products" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminProducts />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/orders" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminOrders />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/settings" element={
              <ProtectedRoute>
                <AdminLayout>
                  <AdminSettings />
                </AdminLayout>
              </ProtectedRoute>
            } />

            {/* Extended Admin Features */}
            <Route path="/categories" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Categories />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/blog" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Blog />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/support" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Support />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/security" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Security />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/background-settings" element={
              <ProtectedRoute>
                <AdminLayout>
                  <BackgroundSettings />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/coupons" element={
              <ProtectedRoute>
                <AdminLayout>
                  <Coupons />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/pwa" element={
              <ProtectedRoute>
                <AdminLayout>
                  <PWAManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/media" element={
              <ProtectedRoute>
                <AdminLayout>
                  <MediaManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />
            <Route path="/backgrounds" element={
              <ProtectedRoute>
                <AdminLayout>
                  <BackgroundManagement />
                </AdminLayout>
              </ProtectedRoute>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#1f2937',
                color: '#f9fafb',
                border: '1px solid #374151'
              }
            }}
          />
        </div>
      </Router>
    </AdminAuthProvider>
  );
};

export default AdminApp;