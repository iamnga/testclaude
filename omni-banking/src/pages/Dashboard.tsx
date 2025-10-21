import React from 'react';
import { Layout, Card, Row, Col, Statistic, Timeline, Button, Avatar, Dropdown } from 'antd';
import {
  SwapOutlined,
  FileAddOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  UserOutlined,
  LogoutOutlined,
  PhoneOutlined,
  MailOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  BankOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { mockTransactions, mockDepositContracts } from '../data/mockData';
import '../styles/Dashboard.css';

const { Header, Content } = Layout;

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
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

  // Lọc giao dịch của user hiện tại
  const userTransactions = mockTransactions.slice(0, 5);

  // Lọc hợp đồng tiền gửi active
  const activeContracts = mockDepositContracts.filter(c => c.status === 'active');

  // Tính tổng giao dịch thu/chi gần nhất
  const recentCredit = userTransactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const recentDebit = userTransactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Quick access items
  const quickAccessItems = [
    {
      key: 'transfer',
      title: 'Chuyển tiền',
      icon: <SwapOutlined style={{ fontSize: 32, color: '#1890ff' }} />,
      path: '/transfer',
      description: 'Chuyển khoản nhanh',
    },
    {
      key: 'deposit',
      title: 'Mở hợp đồng tiền gửi',
      icon: <FileAddOutlined style={{ fontSize: 32, color: '#52c41a' }} />,
      path: '/deposit',
      description: 'Gửi tiết kiệm online',
    },
    {
      key: 'pending',
      title: 'Giao dịch chờ duyệt',
      icon: <CheckCircleOutlined style={{ fontSize: 32, color: '#faad14' }} />,
      path: '/pending',
      description: 'Quản lý phê duyệt',
    },
    {
      key: 'bills',
      title: 'Thanh toán hóa đơn',
      icon: <FileTextOutlined style={{ fontSize: 32, color: '#722ed1' }} />,
      path: '/bills',
      description: 'Thanh toán dịch vụ',
    },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!user) {
    navigate('/');
    return null;
  }

  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <div className="header-left">
          <BankOutlined style={{ fontSize: 28, color: '#fff', marginRight: 12 }} />
          <h1>OMNI CORP</h1>
        </div>
        <div className="header-right">
          <div className="user-info">
            <div className="user-details">
              <div className="user-name">{user.fullName}</div>
              <div className="user-username">@{user.username}</div>
            </div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Avatar size={40} icon={<UserOutlined />} style={{ cursor: 'pointer', backgroundColor: '#1890ff' }} />
            </Dropdown>
          </div>
        </div>
      </Header>

      <Content className="dashboard-content">
        <div className="content-wrapper">
          {/* Contact Info Banner */}
          <Card className="contact-banner" bordered={false}>
            <Row gutter={16} align="middle">
              <Col flex="auto">
                <p style={{ margin: 0, fontSize: 14, color: '#666' }}>
                  Cần hỗ trợ? Liên hệ với chúng tôi
                </p>
              </Col>
              <Col>
                <PhoneOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <strong>Hotline: {user.phone}</strong>
              </Col>
              <Col>
                <MailOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                <strong>Email: {user.email}</strong>
              </Col>
            </Row>
          </Card>

          {/* Quick Access */}
          <Card title="Truy cập nhanh" className="quick-access-card" bordered={false}>
            <Row gutter={[16, 16]}>
              {quickAccessItems.map(item => (
                <Col xs={24} sm={12} md={6} key={item.key}>
                  <Card
                    hoverable
                    className="quick-access-item"
                    onClick={() => navigate(item.path)}
                  >
                    <div className="quick-access-icon">{item.icon}</div>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </Card>
                </Col>
              ))}
            </Row>
          </Card>

          {/* Statistics */}
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card bordered={false}>
                <Statistic
                  title="Giao dịch Thu gần nhất"
                  value={formatCurrency(recentCredit)}
                  suffix="VND"
                  valueStyle={{ color: '#3f8600' }}
                  prefix={<ArrowUpOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false}>
                <Statistic
                  title="Giao dịch Chi gần nhất"
                  value={formatCurrency(recentDebit)}
                  suffix="VND"
                  valueStyle={{ color: '#cf1322' }}
                  prefix={<ArrowDownOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card bordered={false}>
                <Statistic
                  title="Hợp đồng tiền gửi"
                  value={activeContracts.length}
                  suffix="hợp đồng"
                  valueStyle={{ color: '#1890ff' }}
                  prefix={<FileAddOutlined />}
                />
              </Card>
            </Col>
          </Row>

          {/* Recent Transactions */}
          <Card title="Giao dịch gần nhất" bordered={false} className="transactions-card">
            <Timeline>
              {userTransactions.map(transaction => (
                <Timeline.Item
                  key={transaction.id}
                  color={transaction.type === 'credit' ? 'green' : 'red'}
                  dot={
                    transaction.type === 'credit' ? (
                      <ArrowUpOutlined style={{ fontSize: 16 }} />
                    ) : (
                      <ArrowDownOutlined style={{ fontSize: 16 }} />
                    )
                  }
                >
                  <div className="transaction-item">
                    <div className="transaction-header">
                      <span className="transaction-description">{transaction.description}</span>
                      <span className={`transaction-amount ${transaction.type}`}>
                        {transaction.type === 'credit' ? '+' : '-'}
                        {formatCurrency(transaction.amount)} {transaction.currency}
                      </span>
                    </div>
                    <div className="transaction-footer">
                      <span className="transaction-date">{formatDate(transaction.date)}</span>
                      <span className="transaction-status">{transaction.status}</span>
                    </div>
                  </div>
                </Timeline.Item>
              ))}
            </Timeline>
            <Button type="link" block onClick={() => navigate('/transactions')}>
              Xem tất cả giao dịch
            </Button>
          </Card>

          {/* Deposit Contracts */}
          {activeContracts.length > 0 && (
            <Card title="Hợp đồng tiền gửi đang hoạt động" bordered={false}>
              {activeContracts.map(contract => (
                <Card.Grid key={contract.id} style={{ width: '33.33%' }} hoverable>
                  <div className="contract-item">
                    <h4>{contract.contractNumber}</h4>
                    <p>Số tiền: <strong>{formatCurrency(contract.amount)} VND</strong></p>
                    <p>Lãi suất: <strong>{contract.interestRate}%/năm</strong></p>
                    <p>Kỳ hạn: <strong>{contract.term} {contract.termUnit === 'month' ? 'tháng' : 'năm'}</strong></p>
                    <p style={{ fontSize: 12, color: '#999' }}>
                      Đáo hạn: {new Date(contract.endDate).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                </Card.Grid>
              ))}
            </Card>
          )}
        </div>
      </Content>
    </Layout>
  );
};

export default Dashboard;
