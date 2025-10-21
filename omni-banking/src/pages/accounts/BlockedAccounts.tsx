import React, { useState } from 'react';
import { Card, Table, Tag, Typography, Select, Space } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { LockOutlined, UnlockOutlined } from '@ant-design/icons';
import type { BlockedAccount } from '../../types';
import { mockBlockedAccounts } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import dayjs from 'dayjs';

const { Title } = Typography;

const BlockedAccounts: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Filter blocked accounts by status
  const filteredData = statusFilter === 'all'
    ? mockBlockedAccounts
    : mockBlockedAccounts.filter(item => item.status === statusFilter);

  const columns: ColumnsType<BlockedAccount> = [
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Tên tài khoản',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Số tiền phong toả',
      dataIndex: 'blockedAmount',
      key: 'blockedAmount',
      align: 'right',
      render: (amount: number, record: BlockedAccount) => (
        <strong style={{ color: '#ff4d4f' }}>
          {formatCurrency(amount, record.currency)}
        </strong>
      ),
    },
    {
      title: 'Lý do phong toả',
      dataIndex: 'blockReason',
      key: 'blockReason',
      ellipsis: true,
    },
    {
      title: 'Ngày phong toả',
      dataIndex: 'blockDate',
      key: 'blockDate',
      width: 150,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.blockDate).unix() - dayjs(b.blockDate).unix(),
    },
    {
      title: 'Ngày dự kiến giải toả',
      dataIndex: 'releaseDate',
      key: 'releaseDate',
      width: 170,
      render: (date: string | undefined) => (
        date ? formatDateTime(date) : <Tag color="default">Chưa xác định</Tag>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      align: 'center',
      render: (status: string) => (
        <Tag
          color={status === 'blocked' ? 'red' : 'green'}
          icon={status === 'blocked' ? <LockOutlined /> : <UnlockOutlined />}
        >
          {status === 'blocked' ? 'Đang phong toả' : 'Đã giải toả'}
        </Tag>
      ),
      filters: [
        { text: 'Đang phong toả', value: 'blocked' },
        { text: 'Đã giải toả', value: 'released' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Mã tham chiếu',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 140,
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <LockOutlined style={{ marginRight: 12 }} />
          Giao dịch phong toả
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu các tài khoản đang bị phong toả và lịch sử phong toả
        </p>
      </div>

      <Card
        title="Danh sách giao dịch phong toả"
        extra={
          <Space>
            <span>Lọc theo trạng thái:</span>
            <Select
              style={{ width: 180 }}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Select.Option value="all">Tất cả</Select.Option>
              <Select.Option value="blocked">Đang phong toả</Select.Option>
              <Select.Option value="released">Đã giải toả</Select.Option>
            </Select>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} bản ghi`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title="Lưu ý"
        size="small"
      >
        <div style={{ fontSize: 13, color: '#666' }}>
          <p>• <strong>Phong toả:</strong> Là việc tạm thời hạn chế quyền sử dụng một phần hoặc toàn bộ số dư trong tài khoản</p>
          <p>• <strong>Lý do phong toả:</strong> Có thể do yêu cầu từ cơ quan nhà nước, tranh chấp hợp đồng, hoặc bảo đảm thanh toán</p>
          <p>• <strong>Số dư khả dụng:</strong> Sau khi bị phong toả, số dư khả dụng sẽ giảm tương ứng với số tiền bị phong toả</p>
          <p>• <strong>Liên hệ:</strong> Để biết thêm chi tiết, vui lòng liên hệ hotline 1900 6678 hoặc đến chi nhánh OCB gần nhất</p>
        </div>
      </Card>
    </AppLayout>
  );
};

export default BlockedAccounts;
