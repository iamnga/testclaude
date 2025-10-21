import React from 'react';
import { Card, Table, Tag, Typography } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { BankOutlined, DollarOutlined } from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import type { Account } from '../../types';
import AppLayout from '../../components/AppLayout';

const { Title } = Typography;

const AccountList: React.FC = () => {
  const { user } = useAuth();

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency;
  };

  const columns: ColumnsType<Account> = [
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      render: (text: string) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <BankOutlined style={{ color: '#1890ff' }} />
          <strong>{text}</strong>
        </div>
      ),
    },
    {
      title: 'Tên tài khoản',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Số dư',
      dataIndex: 'balance',
      key: 'balance',
      align: 'right',
      render: (balance: number, record: Account) => (
        <strong style={{ color: '#52c41a' }}>
          {formatCurrency(balance, record.currency)}
        </strong>
      ),
    },
    {
      title: 'Số dư khả dụng',
      dataIndex: 'availableBalance',
      key: 'availableBalance',
      align: 'right',
      render: (availableBalance: number, record: Account) => (
        <strong style={{ color: '#1890ff' }}>
          {formatCurrency(availableBalance, record.currency)}
        </strong>
      ),
    },
    {
      title: 'Hạn mức thấu chi',
      dataIndex: 'overdraftLimit',
      key: 'overdraftLimit',
      align: 'right',
      render: (overdraftLimit: number, record: Account) => (
        <span>
          {overdraftLimit > 0 ? (
            <>
              <Tag color="orange">Có hạn mức</Tag>
              <div style={{ marginTop: 4 }}>
                {formatCurrency(overdraftLimit, record.currency)}
              </div>
            </>
          ) : (
            <Tag color="default">Không có</Tag>
          )}
        </span>
      ),
    },
    {
      title: 'Loại tiền tệ',
      dataIndex: 'currency',
      key: 'currency',
      align: 'center',
      render: (currency: string) => (
        <Tag color={currency === 'VND' ? 'blue' : 'green'} icon={<DollarOutlined />}>
          {currency}
        </Tag>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BankOutlined style={{ marginRight: 12 }} />
          Danh sách tài khoản
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Xem số dư, số dư khả dụng và hạn mức thấu chi của các tài khoản được phân quyền
        </p>
      </div>

      <Card>
        <Table
          columns={columns}
          dataSource={user?.accounts || []}
          rowKey="accountNumber"
          pagination={false}
          bordered
        />
      </Card>

      {user?.accounts && user.accounts.length > 0 && (
        <Card
          style={{ marginTop: 16 }}
          title="Chú thích"
          size="small"
        >
          <div style={{ fontSize: 13, color: '#666' }}>
            <p><strong>Số dư:</strong> Tổng số tiền hiện có trong tài khoản</p>
            <p><strong>Số dư khả dụng:</strong> Số tiền có thể sử dụng ngay (đã trừ phong toả nếu có)</p>
            <p><strong>Hạn mức thấu chi:</strong> Số tiền tối đa được phép chi vượt quá số dư</p>
          </div>
        </Card>
      )}
    </AppLayout>
  );
};

export default AccountList;
