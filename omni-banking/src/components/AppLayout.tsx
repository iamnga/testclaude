import React, { useState } from 'react';
import { Layout, Menu, Avatar, Dropdown } from 'antd';
import type { MenuProps } from 'antd';
import {
  DashboardOutlined,
  BankOutlined,
  SwapOutlined,
  FileTextOutlined,
  CheckCircleOutlined,
  SaveOutlined,
  WalletOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UnorderedListOutlined,
  FileSearchOutlined,
  LockOutlined,
  FileProtectOutlined,
  DollarOutlined,
  HistoryOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/AppLayout.css';

const { Header, Sider, Content } = Layout;

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: 'Thông tin cá nhân',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng xuất',
      onClick: handleLogout,
    },
  ];

  const menuItems: MenuProps['items'] = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Tổng quan',
      onClick: () => navigate('/dashboard'),
    },
    {
      key: 'account-info',
      icon: <BankOutlined />,
      label: 'Thông tin tài khoản',
      children: [
        {
          key: '/accounts/list',
          icon: <UnorderedListOutlined />,
          label: 'Danh sách tài khoản',
          onClick: () => navigate('/accounts/list'),
        },
        {
          key: '/accounts/statement',
          icon: <FileSearchOutlined />,
          label: 'Sao kê tài khoản',
          onClick: () => navigate('/accounts/statement'),
        },
        {
          key: '/accounts/blocked',
          icon: <LockOutlined />,
          label: 'Giao dịch phong toả',
          onClick: () => navigate('/accounts/blocked'),
        },
        {
          key: '/accounts/einvoices',
          icon: <FileProtectOutlined />,
          label: 'Hóa đơn điện tử',
          onClick: () => navigate('/accounts/einvoices'),
        },
      ],
    },
    {
      key: 'transfer',
      icon: <SwapOutlined />,
      label: 'Chuyển tiền',
      children: [
        {
          key: '/transfer',
          label: 'Chuyển khoản theo món',
          onClick: () => navigate('/transfer'),
        },
        {
          key: '/transfer/batch',
          label: 'Chuyển khoản theo lô',
          onClick: () => navigate('/transfer/batch'),
        },
        {
          key: '/transfer/recurring',
          label: 'Chuyển tiền định kỳ',
          onClick: () => navigate('/transfer/recurring'),
        },
        {
          key: '/transfer/vouchers',
          label: 'Chứng từ giao dịch',
          onClick: () => navigate('/transfer/vouchers'),
        },
      ],
    },
    {
      key: 'bills',
      icon: <DollarOutlined />,
      label: 'Thanh toán hóa đơn',
      children: [
        {
          key: '/bills',
          icon: <FileTextOutlined />,
          label: 'Thanh toán hóa đơn',
          onClick: () => navigate('/bills'),
        },
        {
          key: '/bills/history',
          icon: <HistoryOutlined />,
          label: 'Lịch sử thanh toán',
          onClick: () => navigate('/bills/history'),
        },
      ],
    },
    {
      key: 'deposit',
      icon: <SaveOutlined />,
      label: 'Hợp đồng tiền gửi',
      children: [
        {
          key: '/deposit',
          label: 'Mở hợp đồng',
          onClick: () => navigate('/deposit'),
        },
        {
          key: '/deposit/list',
          label: 'Danh sách hợp đồng',
          onClick: () => navigate('/deposit/list'),
        },
      ],
    },
    {
      key: '/pending',
      icon: <CheckCircleOutlined />,
      label: 'Giao dịch chờ duyệt',
      onClick: () => navigate('/pending'),
    },
    {
      key: 'future-transfer',
      icon: <ClockCircleOutlined />,
      label: 'Chuyển tiền tương lai',
      children: [
        {
          key: '/future-transfer/approval',
          label: 'Duyệt giao dịch tương lai',
          onClick: () => navigate('/future-transfer/approval'),
        },
        {
          key: '/future-transfer/management',
          label: 'Quản lý giao dịch tương lai',
          onClick: () => navigate('/future-transfer/management'),
        },
      ],
    },
    {
      key: 'salary',
      icon: <DollarOutlined />,
      label: 'Chi lương bảo mật',
      children: [
        {
          key: '/salary/create',
          label: 'Chuyển khoản chi lương',
          onClick: () => navigate('/salary/create'),
        },
        {
          key: '/salary/approval',
          label: 'Giao dịch chờ duyệt',
          onClick: () => navigate('/salary/approval'),
        },
        {
          key: '/salary/vouchers',
          label: 'Chứng từ chi lương',
          onClick: () => navigate('/salary/vouchers'),
        },
      ],
    },
    {
      key: 'virtual-account',
      icon: <BankOutlined />,
      label: 'Tài khoản định danh',
      children: [
        {
          key: '/virtual-account/management',
          label: 'Quản lý TK định danh',
          onClick: () => navigate('/virtual-account/management'),
        },
        {
          key: '/virtual-account/approval',
          label: 'Phê duyệt TK định danh',
          onClick: () => navigate('/virtual-account/approval'),
        },
        {
          key: '/virtual-account/transactions',
          label: 'Lịch sử giao dịch',
          onClick: () => navigate('/virtual-account/transactions'),
        },
      ],
    },
    {
      key: 'loans',
      icon: <WalletOutlined />,
      label: 'Khoản vay',
      children: [
        {
          key: '/loans',
          label: 'Danh sách khoản vay',
          onClick: () => navigate('/loans'),
        },
        {
          key: '/loans/repayment-history',
          label: 'Lịch sử trả nợ',
          onClick: () => navigate('/loans/repayment-history'),
        },
      ],
    },
  ];

  // Get current selected key from location
  const getSelectedKey = () => {
    const path = location.pathname;
    // Check if path matches any submenu item
    for (const item of menuItems) {
      if (item && 'children' in item && item.children) {
        for (const child of item.children) {
          if (child && 'key' in child && path === child.key) {
            return [child.key as string];
          }
        }
      }
    }
    return [path];
  };

  // Get default open keys for submenus
  const getDefaultOpenKeys = () => {
    const path = location.pathname;
    if (path.startsWith('/accounts/')) return ['account-info'];
    if (path.startsWith('/transfer/')) return ['transfer'];
    if (path.startsWith('/bills/')) return ['bills'];
    if (path.startsWith('/deposit/')) return ['deposit'];
    if (path.startsWith('/future-transfer/')) return ['future-transfer'];
    if (path.startsWith('/salary/')) return ['salary'];
    if (path.startsWith('/virtual-account/')) return ['virtual-account'];
    if (path.startsWith('/loans')) return ['loans'];
    if (path === '/bills') return ['bills'];
    return [];
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <Layout className="app-layout">
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        className="app-sider"
        width={250}
      >
        <div className="logo">
          <BankOutlined style={{ fontSize: collapsed ? 24 : 28 }} />
          {!collapsed && <span>OMNI CORP</span>}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={getSelectedKey()}
          defaultOpenKeys={getDefaultOpenKeys()}
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header className="app-header">
          <div className="header-left">
            {React.createElement(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
              className: 'trigger',
              onClick: () => setCollapsed(!collapsed),
            })}
          </div>
          <div className="header-right">
            <div className="user-info">
              <div className="user-details">
                <div className="user-name">{user.fullName}</div>
                <div className="user-username">@{user.username}</div>
              </div>
              <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                />
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content className="app-content">
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppLayout;
