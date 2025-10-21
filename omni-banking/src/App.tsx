import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AccountList from './pages/accounts/AccountList';
import AccountStatement from './pages/accounts/AccountStatement';
import BlockedAccounts from './pages/accounts/BlockedAccounts';
import EInvoices from './pages/accounts/EInvoices';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (redirect to dashboard if already logged in)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  if (user && !user.isFirstLogin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

// Placeholder component for routes that are not yet implemented
const ComingSoon: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',
      flexDirection: 'column',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>{title}</h1>
      <p style={{ fontSize: 20 }}>Tính năng đang được phát triển...</p>
      <a href="/dashboard" style={{ color: 'white', marginTop: 20, textDecoration: 'underline' }}>
        Quay lại Dashboard
      </a>
    </div>
  );
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      {/* Account Info Routes */}
      <Route path="/accounts/list" element={
        <ProtectedRoute>
          <AccountList />
        </ProtectedRoute>
      } />

      <Route path="/accounts/statement" element={
        <ProtectedRoute>
          <AccountStatement />
        </ProtectedRoute>
      } />

      <Route path="/accounts/blocked" element={
        <ProtectedRoute>
          <BlockedAccounts />
        </ProtectedRoute>
      } />

      <Route path="/accounts/einvoices" element={
        <ProtectedRoute>
          <EInvoices />
        </ProtectedRoute>
      } />

      {/* Placeholder routes for quick access items */}
      <Route path="/transfer" element={
        <ProtectedRoute>
          <ComingSoon title="Chuyển tiền" />
        </ProtectedRoute>
      } />

      <Route path="/deposit" element={
        <ProtectedRoute>
          <ComingSoon title="Mở hợp đồng tiền gửi" />
        </ProtectedRoute>
      } />

      <Route path="/pending" element={
        <ProtectedRoute>
          <ComingSoon title="Giao dịch chờ duyệt" />
        </ProtectedRoute>
      } />

      <Route path="/bills" element={
        <ProtectedRoute>
          <ComingSoon title="Thanh toán hóa đơn" />
        </ProtectedRoute>
      } />

      <Route path="/transactions" element={
        <ProtectedRoute>
          <ComingSoon title="Lịch sử giao dịch" />
        </ProtectedRoute>
      } />

      {/* Catch all - redirect to login */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider locale={viVN}>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
