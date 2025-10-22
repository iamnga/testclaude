import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  message,
  Input,
  Select,
  Modal,
  Form,
  Descriptions,
  Popconfirm,
  Alert,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  BankOutlined,
  PlusOutlined,
  SearchOutlined,
  FilterOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { mockVirtualAccounts } from '../../data/mockData';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import type { VirtualAccount } from '../../types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const VirtualAccountManagement: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<VirtualAccount | null>(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      pending_approval: { color: 'warning', text: 'Chờ duyệt' },
      approved: { color: 'processing', text: 'Đã duyệt' },
      rejected: { color: 'error', text: 'Đã từ chối' },
      active: { color: 'success', text: 'Đang hoạt động' },
      inactive: { color: 'default', text: 'Không hoạt động' },
    };
    const s = statusMap[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const filteredAccounts = useMemo(() => {
    let filtered = [...mockVirtualAccounts];

    // Filter by keyword
    if (searchKeyword) {
      filtered = filtered.filter(
        (acc) =>
          acc.virtualAccountNumber.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          acc.accountName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          acc.description.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((acc) => acc.status === statusFilter);
    }

    return filtered;
  }, [searchKeyword, statusFilter]);

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Mock create
      setTimeout(() => {
        setLoading(false);
        message.success('Tạo tài khoản định danh thành công! Đang chờ phê duyệt.');
        setCreateModalVisible(false);
        form.resetFields();
      }, 1000);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleEdit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Mock update
      setTimeout(() => {
        setLoading(false);
        message.success('Cập nhật tài khoản định danh thành công!');
        setEditModalVisible(false);
        form.resetFields();
      }, 1000);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleDelete = (record: VirtualAccount) => {
    message.success(`Đã xóa tài khoản định danh ${record.virtualAccountNumber}`);
  };

  const handleOpenEditModal = (record: VirtualAccount) => {
    setSelectedAccount(record);
    form.setFieldsValue({
      accountName: record.accountName,
      description: record.description,
      linkedAccount: record.linkedAccount,
    });
    setEditModalVisible(true);
  };

  const handleViewDetail = (record: VirtualAccount) => {
    setSelectedAccount(record);
    setDetailModalVisible(true);
  };

  const handleViewTransactions = (record: VirtualAccount) => {
    navigate(`/virtual-account/transactions?account=${record.virtualAccountNumber}`);
  };

  const columns: ColumnsType<VirtualAccount> = [
    {
      title: 'Số TK định danh',
      dataIndex: 'virtualAccountNumber',
      key: 'virtualAccountNumber',
      width: 150,
      fixed: 'left',
      render: (number: string) => <Text strong>{number}</Text>,
    },
    {
      title: 'Tên tài khoản',
      dataIndex: 'accountName',
      key: 'accountName',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Mô tả',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'TK liên kết',
      dataIndex: 'linkedAccount',
      key: 'linkedAccount',
      width: 140,
    },
    {
      title: 'Số dư',
      dataIndex: 'balance',
      key: 'balance',
      width: 130,
      align: 'right',
      render: (balance: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(balance)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 150,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_: any, record: VirtualAccount) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewTransactions(record)}
            disabled={record.status !== 'active'}
          >
            GD
          </Button>
          {(record.status === 'active' || record.status === 'inactive') && (
            <>
              <Button
                size="small"
                type="link"
                icon={<EditOutlined />}
                onClick={() => handleOpenEditModal(record)}
              >
                Sửa
              </Button>
              <Popconfirm
                title="Xác nhận xóa?"
                description="Bạn có chắc chắn muốn xóa tài khoản định danh này?"
                onConfirm={() => handleDelete(record)}
                okText="Xóa"
                cancelText="Hủy"
              >
                <Button
                  size="small"
                  type="link"
                  danger
                  icon={<DeleteOutlined />}
                  disabled={record.balance > 0}
                >
                  Xóa
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  const statistics = {
    total: filteredAccounts.length,
    active: filteredAccounts.filter((a) => a.status === 'active').length,
    pending: filteredAccounts.filter((a) => a.status === 'pending_approval').length,
    inactive: filteredAccounts.filter((a) => a.status === 'inactive').length,
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <BankOutlined style={{ marginRight: 12 }} />
          Quản lý tài khoản định danh
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tạo mới, chỉnh sửa và quản lý tài khoản định danh (Virtual Account)
        </p>
      </div>

      <Alert
        message="Về tài khoản định danh"
        description={
          <div>
            <p>• Tài khoản định danh là số tài khoản ảo được liên kết với tài khoản thật</p>
            <p>• Mỗi tài khoản định danh có thể nhận tiền từ nhiều nguồn khác nhau</p>
            <p>• Tiền sẽ được tự động chuyển vào tài khoản thật đã liên kết</p>
            <p>• Chỉ có thể xóa tài khoản định danh khi số dư bằng 0</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng số TK</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {statistics.total}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Đang hoạt động</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
              {statistics.active}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Chờ duyệt</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
              {statistics.pending}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Không hoạt động</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#999' }}>
              {statistics.inactive}
            </div>
          </div>
        </Space>
      </Card>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc & Tìm kiếm</>}
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
            Tạo TK định danh
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <Input
            placeholder="Tìm theo số TK, tên, mô tả..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Trạng thái"
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="pending_approval">Chờ duyệt</Select.Option>
            <Select.Option value="inactive">Không hoạt động</Select.Option>
            <Select.Option value="rejected">Đã từ chối</Select.Option>
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card title={`Danh sách: ${filteredAccounts.length} tài khoản`}>
        <Table
          columns={columns}
          dataSource={filteredAccounts}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài khoản`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Create Modal */}
      <Modal
        title="Tạo tài khoản định danh mới"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        onOk={handleCreate}
        confirmLoading={loading}
        width={600}
        okText="Tạo tài khoản"
        cancelText="Hủy"
      >
        <Alert
          message="Tài khoản định danh sẽ được gửi đi phê duyệt sau khi tạo"
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        <Form form={form} layout="vertical">
          <Form.Item
            name="accountName"
            label="Tên tài khoản"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
          >
            <Input placeholder="VD: TK Định danh - Thu tiền khách hàng A" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea
              placeholder="Mô tả mục đích sử dụng tài khoản định danh"
              rows={3}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="linkedAccount"
            label="Tài khoản thật liên kết"
            rules={[{ required: true, message: 'Vui lòng chọn tài khoản liên kết!' }]}
          >
            <Select placeholder="Chọn tài khoản liên kết" size="large">
              {user?.accounts
                .filter((a) => a.currency === 'VND')
                .map((acc) => (
                  <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.availableBalance)})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        title="Chỉnh sửa tài khoản định danh"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          form.resetFields();
        }}
        onOk={handleEdit}
        confirmLoading={loading}
        width={600}
        okText="Cập nhật"
        cancelText="Hủy"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="accountName"
            label="Tên tài khoản"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài khoản!' }]}
          >
            <Input placeholder="VD: TK Định danh - Thu tiền khách hàng A" size="large" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô tả"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea
              placeholder="Mô tả mục đích sử dụng tài khoản định danh"
              rows={3}
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="linkedAccount"
            label="Tài khoản thật liên kết"
            rules={[{ required: true, message: 'Vui lòng chọn tài khoản liên kết!' }]}
          >
            <Select placeholder="Chọn tài khoản liên kết" size="large">
              {user?.accounts
                .filter((a) => a.currency === 'VND')
                .map((acc) => (
                  <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.availableBalance)})
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết tài khoản định danh`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedAccount && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Số TK định danh">
              <Text strong>{selectedAccount.virtualAccountNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tên tài khoản">{selectedAccount.accountName}</Descriptions.Item>
            <Descriptions.Item label="Mô tả">{selectedAccount.description}</Descriptions.Item>
            <Descriptions.Item label="TK liên kết">{selectedAccount.linkedAccount}</Descriptions.Item>
            <Descriptions.Item label="Số dư">
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                {formatCurrency(selectedAccount.balance)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">{getStatusTag(selectedAccount.status)}</Descriptions.Item>
            <Descriptions.Item label="Người tạo">{selectedAccount.createdBy}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{formatDateTime(selectedAccount.createdDate)}</Descriptions.Item>
            {selectedAccount.approvedBy && (
              <Descriptions.Item label="Người duyệt">{selectedAccount.approvedBy}</Descriptions.Item>
            )}
            {selectedAccount.approvedDate && (
              <Descriptions.Item label="Ngày duyệt">
                {formatDateTime(selectedAccount.approvedDate)}
              </Descriptions.Item>
            )}
            {selectedAccount.rejectedReason && (
              <Descriptions.Item label="Lý do từ chối">
                <Text type="danger">{selectedAccount.rejectedReason}</Text>
              </Descriptions.Item>
            )}
            {selectedAccount.lastTransactionDate && (
              <Descriptions.Item label="GD gần nhất">
                {formatDateTime(selectedAccount.lastTransactionDate)}
              </Descriptions.Item>
            )}
          </Descriptions>
        )}
      </Modal>
    </AppLayout>
  );
};

export default VirtualAccountManagement;
