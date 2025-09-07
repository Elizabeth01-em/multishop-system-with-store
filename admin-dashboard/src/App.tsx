// src/App.tsx
import React from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';

// Import pages
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import InventoryDashboard from './pages/InventoryDashboard';
import OrdersPage from './pages/OrdersPage';
import TransfersPage from './pages/TransfersPage';
import ShopManagementPage from './pages/ShopManagementPage';
import UserManagementPage from './pages/UserManagementPage';
import AnalyticsPage from './pages/AnalyticsPage';
import GlobalInventoryPage from './pages/GlobalInventoryPage';
import ProductCatalogPage from './pages/ProductCatalogPage';
import ProfilePage from './pages/ProfilePage';
import SettingsPage from './pages/SettingsPage';

const AppRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <Routes>
      {/* Universal Protected Routes */}
      <Route 
        path="/" 
        element={<ProtectedRoute element={<DashboardPage />} />}
      />
      <Route 
        path="/inventory" 
        element={<ProtectedRoute element={<InventoryDashboard />} />}
      />
      <Route 
        path="/orders" 
        element={<ProtectedRoute element={<OrdersPage />} />}
      />
      <Route 
        path="/transfers" 
        element={<ProtectedRoute element={<TransfersPage />} />}
      />
      <Route 
        path="/profile" 
        element={<ProtectedRoute element={<ProfilePage />} />}
      />
      
      {/* Owner Only Routes */}
      {user?.role === 'OWNER' && (
        <>
          <Route 
            path="/analytics" 
            element={<ProtectedRoute element={<AnalyticsPage />} />}
          />
          <Route 
            path="/global-inventory" 
            element={<ProtectedRoute element={<GlobalInventoryPage />} />}
          />
          <Route 
            path="/products-admin" 
            element={<ProtectedRoute element={<ProductCatalogPage />} />}
          />
          <Route 
            path="/shops" 
            element={<ProtectedRoute element={<ShopManagementPage />} />}
          />
          <Route 
            path="/users" 
            element={<ProtectedRoute element={<UserManagementPage />} />}
          />
          <Route 
            path="/settings" 
            element={<ProtectedRoute element={<SettingsPage />} />}
          />
        </>
      )}
      
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;