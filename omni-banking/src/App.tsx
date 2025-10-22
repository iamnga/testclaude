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
import TransferSingle from './pages/transfer/TransferSingle';
import TransferBatch from './pages/transfer/TransferBatch';
import TransferRecurring from './pages/transfer/TransferRecurring';
import TransferVouchers from './pages/transfer/TransferVouchers';
import BillPayment from './pages/bills/BillPayment';
import BillPaymentHistory from './pages/bills/BillPaymentHistory';
import CreateDeposit from './pages/deposit/CreateDeposit';
import DepositList from './pages/deposit/DepositList';
import PendingTransactions from './pages/pending/PendingTransactions';
import FutureTransferApproval from './pages/futureTransfer/FutureTransferApproval';
import FutureTransferManagement from './pages/futureTransfer/FutureTransferManagement';

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

      {/* Transfer Routes */}
      <Route path="/transfer" element={
        <ProtectedRoute>
          <TransferSingle />
        </ProtectedRoute>
      } />

      <Route path="/transfer/batch" element={
        <ProtectedRoute>
          <TransferBatch />
        </ProtectedRoute>
      } />

      <Route path="/transfer/recurring" element={
        <ProtectedRoute>
          <TransferRecurring />
        </ProtectedRoute>
      } />

      <Route path="/transfer/vouchers" element={
        <ProtectedRoute>
          <TransferVouchers />
        </ProtectedRoute>
      } />

      {/* Deposit Contract Routes */}
      <Route path="/deposit" element={
        <ProtectedRoute>
          <CreateDeposit />
        </ProtectedRoute>
      } />

      <Route path="/deposit/list" element={
        <ProtectedRoute>
          <DepositList />
        </ProtectedRoute>
      } />

      {/* Pending Transactions Route */}
      <Route path="/pending" element={
        <ProtectedRoute>
          <PendingTransactions />
        </ProtectedRoute>
      } />

      {/* Future Transfer Routes */}
      <Route path="/future-transfer/approval" element={
        <ProtectedRoute>
          <FutureTransferApproval />
        </ProtectedRoute>
      } />

      <Route path="/future-transfer/management" element={
        <ProtectedRoute>
          <FutureTransferManagement />
        </ProtectedRoute>
      } />

      {/* Bill Payment Routes */}
      <Route path="/bills" element={
        <ProtectedRoute>
          <BillPayment />
        </ProtectedRoute>
      } />

      <Route path="/bills/history" element={
        <ProtectedRoute>
          <BillPaymentHistory />
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
