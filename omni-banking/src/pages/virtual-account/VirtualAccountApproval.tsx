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
  Modal,
  Descriptions,
  Alert,
  Radio,
  Form,
  Divider,
} from 'antd';
import type { ColumnsType, TableRowSelection } from 'antd/es/table';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  SafetyOutlined,
} from '@ant-design/icons';
import { mockVirtualAccounts } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { VirtualAccount } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const VirtualAccountApproval: React.FC = () => {
  const [form] = Form.useForm();
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<VirtualAccount | null>(null);
  const [approvalAction, setApprovalAction] = useState<'approve' | 'reject'>('approve');
  const [authMethod, setAuthMethod] = useState<'iotp' | 'digital_signature'>('iotp');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const pendingAccounts = useMemo(() => {
    let filtered = mockVirtualAccounts.filter((acc) => acc.status === 'pending_approval');

    // Filter by keyword
    if (searchKeyword) {
      filtered = filtered.filter(
        (acc) =>
          acc.virtualAccountNumber.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          acc.accountName.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          acc.description.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return filtered;
  }, [searchKeyword]);

  const handleViewDetail = (record: VirtualAccount) => {
    setSelectedAccount(record);
    setDetailModalVisible(true);
  };

  const handleOpenAuthModal = (action: 'approve' | 'reject') => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 tài khoản để thực hiện!');
      return;
    }

    setApprovalAction(action);
    setAuthModalVisible(true);
  };

  const handleAuthenticate = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Mock authentication and approval
      setTimeout(() => {
        setLoading(false);
        setAuthModalVisible(false);
        form.resetFields();

        const actionText = approvalAction === 'approve' ? 'phê duyệt' : 'từ chối';
        message.success(`Đã ${actionText} thành công ${selectedRowKeys.length} tài khoản định danh!`);

        setSelectedRowKeys([]);
      }, 1500);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin xác thực!');
    }
  };

  const rowSelection: TableRowSelection<VirtualAccount> = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
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
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 150,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: () => <Tag color="warning">Chờ duyệt</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: VirtualAccount) => (
        <Button
          size="small"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Chi tiết
        </Button>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CheckCircleOutlined style={{ marginRight: 12 }} />
          Phê duyệt tài khoản định danh
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Duyệt hoặc từ chối các yêu cầu tạo tài khoản định danh mới
        </p>
      </div>

      <Alert
        message="Lưu ý khi phê duyệt"
        description={
          <div>
            <p>• Kiểm tra kỹ thông tin tài khoản định danh trước khi phê duyệt</p>
            <p>• Đảm bảo tên tài khoản và mô tả rõ ràng, phù hợp với mục đích sử dụng</p>
            <p>• Tài khoản liên kết phải đang hoạt động và có đủ quyền hạn</p>
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
            <div style={{ fontSize: 14, color: '#666' }}>Chờ duyệt</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
              {pendingAccounts.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Đã chọn</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {selectedRowKeys.length}
            </div>
          </div>
        </Space>
      </Card>

      {/* Filters and Actions */}
      <Card
        title={<><FilterOutlined /> Bộ lọc & Thao tác</>}
        style={{ marginBottom: 16 }}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo số TK, tên, mô tả..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />
        </Space>

        <Divider style={{ margin: '16px 0' }} />

        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={() => handleOpenAuthModal('approve')}
            disabled={selectedRowKeys.length === 0}
          >
            Phê duyệt ({selectedRowKeys.length})
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={() => handleOpenAuthModal('reject')}
            disabled={selectedRowKeys.length === 0}
          >
            Từ chối ({selectedRowKeys.length})
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card title={`Danh sách: ${pendingAccounts.length} tài khoản chờ duyệt`}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={pendingAccounts}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tài khoản`,
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết tài khoản định danh"
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
            <Descriptions.Item label="Người tạo">{selectedAccount.createdBy}</Descriptions.Item>
            <Descriptions.Item label="Ngày tạo">{formatDateTime(selectedAccount.createdDate)}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color="warning">Chờ duyệt</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Authentication Modal */}
      <Modal
        title={
          <span>
            <SafetyOutlined style={{ marginRight: 8 }} />
            Xác thực {approvalAction === 'approve' ? 'phê duyệt' : 'từ chối'}
          </span>
        }
        open={authModalVisible}
        onCancel={() => {
          setAuthModalVisible(false);
          form.resetFields();
        }}
        onOk={handleAuthenticate}
        confirmLoading={loading}
        width={600}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Alert
          message={`Bạn đang ${approvalAction === 'approve' ? 'phê duyệt' : 'từ chối'} ${selectedRowKeys.length} tài khoản định danh`}
          type={approvalAction === 'approve' ? 'success' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form form={form} layout="vertical">
          <Form.Item label="Phương thức xác thực">
            <Radio.Group value={authMethod} onChange={(e) => setAuthMethod(e.target.value)}>
              <Radio value="iotp">iOTP CORP</Radio>
              <Radio value="digital_signature">Chữ ký số</Radio>
            </Radio.Group>
          </Form.Item>

          {authMethod === 'iotp' && (
            <Form.Item
              name="otpCode"
              label="Mã OTP"
              rules={[{ required: true, message: 'Vui lòng nhập mã OTP!' }]}
            >
              <Input placeholder="Nhập mã OTP từ ứng dụng iOTP CORP" size="large" />
            </Form.Item>
          )}

          {authMethod === 'digital_signature' && (
            <Form.Item
              name="signature"
              label="Chữ ký số"
              rules={[{ required: true, message: 'Vui lòng nhập chữ ký số!' }]}
            >
              <Input.TextArea placeholder="Nhập chữ ký số" rows={3} size="large" />
            </Form.Item>
          )}

          {approvalAction === 'reject' && (
            <Form.Item
              name="rejectedReason"
              label="Lý do từ chối"
              rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
            >
              <Input.TextArea
                placeholder="Nhập lý do từ chối (sẽ được gửi đến người tạo)"
                rows={3}
                size="large"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default VirtualAccountApproval;
