import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  message,
  Modal,
  Form,
  Select,
  Input,
  Radio,
  Alert,
  Popconfirm,
  Badge,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  DeleteOutlined,
  FilterOutlined,
  SafetyOutlined,
  KeyOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { mockPendingTransactions } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { PendingTransaction } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const PendingTransactions: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<PendingTransaction[]>(mockPendingTransactions);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transactionType === filterType);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    return filtered;
  }, [transactions, filterType, filterStatus]);

  const selectedTransactions = useMemo(() => {
    return filteredTransactions.filter(t => selectedRowKeys.includes(t.id));
  }, [filteredTransactions, selectedRowKeys]);

  const canApproveSelected = useMemo(() => {
    return selectedTransactions.every(t =>
      t.status === 'pending' && t.validationStatus === 'ok'
    );
  }, [selectedTransactions]);

  const getTransactionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      transfer: 'Chuyển khoản',
      bill_payment: 'Thanh toán hóa đơn',
      deposit_contract: 'Hợp đồng tiền gửi',
      batch_transfer: 'Chuyển khoản theo lô',
    };
    return labels[type] || type;
  };

  const getTransactionTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      transfer: 'blue',
      bill_payment: 'orange',
      deposit_contract: 'green',
      batch_transfer: 'purple',
    };
    return colors[type] || 'default';
  };

  const handleApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một giao dịch!');
      return;
    }

    if (!canApproveSelected) {
      message.error('Chỉ có thể duyệt các giao dịch có trạng thái Chờ duyệt và Validation OK!');
      return;
    }

    setCurrentAction('approve');
    setAuthModalVisible(true);
  };

  const handleReject = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một giao dịch!');
      return;
    }

    setCurrentAction('reject');
    setAuthModalVisible(true);
  };

  const handleDelete = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    message.success('Đã xóa giao dịch thành công!');
  };

  const handleSubmitAuth = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Mock API call
      setTimeout(() => {
        const actionText = currentAction === 'approve' ? 'Duyệt' : 'Từ chối';

        // Update transaction status
        setTransactions(prev => prev.map(t => {
          if (selectedRowKeys.includes(t.id)) {
            return {
              ...t,
              status: currentAction === 'approve' ? 'approved' : 'rejected',
              approvedBy: 'approver_demo',
              approvedDate: new Date().toISOString(),
              rejectedReason: currentAction === 'reject' ? values.rejectedReason : undefined,
            };
          }
          return t;
        }));

        setLoading(false);
        setAuthModalVisible(false);
        form.resetFields();
        setSelectedRowKeys([]);
        message.success(`${actionText} ${selectedRowKeys.length} giao dịch thành công!`);
      }, 1500);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const columns: ColumnsType<PendingTransaction> = [
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left',
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: 'Loại GD',
      dataIndex: 'transactionType',
      key: 'transactionType',
      width: 150,
      render: (type: string) => (
        <Tag color={getTransactionTypeColor(type)}>
          {getTransactionTypeLabel(type)}
        </Tag>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 250,
      render: (content: string, record: PendingTransaction) => (
        <div>
          <div>{content}</div>
          {record.serviceName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.serviceName}
            </Text>
          )}
          {record.productName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.productName}
            </Text>
          )}
          {record.batchName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.batchName} ({record.itemCount} giao dịch)
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Người nhận',
      dataIndex: 'beneficiary',
      key: 'beneficiary',
      width: 180,
      render: (beneficiary, record: PendingTransaction) => {
        if (beneficiary) {
          return (
            <div>
              <div>{beneficiary.accountName}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {beneficiary.accountNumber}
              </Text>
            </div>
          );
        }
        return '-';
      },
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#cf1322' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Phí',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      width: 100,
      align: 'right',
      render: (fee: number) => formatCurrency(fee),
    },
    {
      title: 'Validation',
      dataIndex: 'validationStatus',
      key: 'validationStatus',
      width: 120,
      align: 'center',
      render: (status: string, record: PendingTransaction) => {
        const colorMap: Record<string, string> = {
          ok: 'success',
          init: 'processing',
          error: 'error',
        };
        const textMap: Record<string, string> = {
          ok: 'OK',
          init: 'INIT',
          error: 'ERROR',
        };
        return (
          <div>
            <Tag color={colorMap[status]}>{textMap[status]}</Tag>
            {record.validationMessage && (
              <div style={{ fontSize: 11, color: '#999', marginTop: 4 }}>
                {record.validationMessage}
              </div>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending: 'warning',
          approved: 'success',
          rejected: 'error',
        };
        const textMap: Record<string, string> = {
          pending: 'Chờ duyệt',
          approved: 'Đã duyệt',
          rejected: 'Từ chối',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
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
      sorter: (a, b) => dayjs(a.createdDate).unix() - dayjs(b.createdDate).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: PendingTransaction) => (
        <Space>
          {record.status === 'rejected' && (
            <Popconfirm
              title="Xóa giao dịch"
              description="Bạn có chắc chắn muốn xóa giao dịch này?"
              onConfirm={() => handleDelete(record.id)}
              okText="Xóa"
              cancelText="Hủy"
            >
              <Button
                size="small"
                type="link"
                danger
                icon={<DeleteOutlined />}
              >
                Xóa
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];

  const pendingCount = transactions.filter(t => t.status === 'pending').length;
  const approvedCount = transactions.filter(t => t.status === 'approved').length;
  const rejectedCount = transactions.filter(t => t.status === 'rejected').length;
  const totalPending = transactions
    .filter(t => t.status === 'pending')
    .reduce((sum, t) => sum + t.totalAmount, 0);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: PendingTransaction) => ({
      disabled: record.status !== 'pending',
    }),
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CheckCircleOutlined style={{ marginRight: 12 }} />
          Giao dịch chờ duyệt
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Quản lý và phê duyệt các giao dịch chuyển khoản, thanh toán và hợp đồng tiền gửi
        </p>
      </div>

      {/* Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Chờ duyệt</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
              <Badge count={pendingCount} showZero color="#fa8c16" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Đã duyệt</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
              {approvedCount}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Từ chối</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#cf1322' }}>
              {rejectedCount}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng giá trị chờ duyệt</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
              {formatCurrency(totalPending)}
            </div>
          </div>
        </Space>
      </Card>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc</>}
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <Select
            style={{ width: 200 }}
            value={filterType}
            onChange={setFilterType}
            placeholder="Loại giao dịch"
          >
            <Select.Option value="all">Tất cả loại</Select.Option>
            <Select.Option value="transfer">Chuyển khoản</Select.Option>
            <Select.Option value="bill_payment">Thanh toán hóa đơn</Select.Option>
            <Select.Option value="deposit_contract">Hợp đồng tiền gửi</Select.Option>
            <Select.Option value="batch_transfer">Chuyển khoản theo lô</Select.Option>
          </Select>

          <Select
            style={{ width: 180 }}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Trạng thái"
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="pending">Chờ duyệt</Select.Option>
            <Select.Option value="approved">Đã duyệt</Select.Option>
            <Select.Option value="rejected">Từ chối</Select.Option>
          </Select>

          {selectedRowKeys.length > 0 && (
            <Alert
              message={`Đã chọn ${selectedRowKeys.length} giao dịch`}
              type="info"
              showIcon
              closable
              onClose={() => setSelectedRowKeys([])}
            />
          )}
        </Space>
      </Card>

      {/* Transaction Table */}
      <Card
        title={`Danh sách giao dịch (${filteredTransactions.length})`}
        extra={
          <Space>
            <Button
              type="default"
              danger
              icon={<CloseCircleOutlined />}
              onClick={handleReject}
              disabled={selectedRowKeys.length === 0}
            >
              Từ chối ({selectedRowKeys.length})
            </Button>
            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={handleApprove}
              disabled={selectedRowKeys.length === 0 || !canApproveSelected}
            >
              Duyệt ({selectedRowKeys.length})
            </Button>
          </Space>
        }
      >
        {!canApproveSelected && selectedRowKeys.length > 0 && (
          <Alert
            message="Chỉ có thể duyệt các giao dịch có trạng thái Chờ duyệt và Validation OK"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* Authentication Modal */}
      <Modal
        title={
          <Space>
            <SafetyOutlined />
            <span>{currentAction === 'approve' ? 'Xác thực duyệt giao dịch' : 'Xác thực từ chối giao dịch'}</span>
          </Space>
        }
        open={authModalVisible}
        onCancel={() => setAuthModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setAuthModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleSubmitAuth}
            loading={loading}
          >
            Xác nhận
          </Button>,
        ]}
        width={600}
      >
        <Alert
          message={`Bạn đang ${currentAction === 'approve' ? 'duyệt' : 'từ chối'} ${selectedRowKeys.length} giao dịch`}
          description={
            <div style={{ marginTop: 8 }}>
              {selectedTransactions.map(t => (
                <div key={t.id} style={{ marginBottom: 4 }}>
                  • {t.id} - {t.content} - {formatCurrency(t.totalAmount)}
                </div>
              ))}
            </div>
          }
          type={currentAction === 'approve' ? 'info' : 'warning'}
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form form={form} layout="vertical">
          <Form.Item
            name="authMethod"
            label="Phương thức xác thực"
            rules={[{ required: true, message: 'Vui lòng chọn phương thức xác thực!' }]}
            initialValue="iotp"
          >
            <Radio.Group>
              <Space direction="vertical">
                <Radio value="iotp">
                  <Space>
                    <KeyOutlined />
                    <span>iOTP CORP (Mã OTP)</span>
                  </Space>
                </Radio>
                <Radio value="digital_signature">
                  <Space>
                    <SafetyOutlined />
                    <span>Chữ ký số (OCB Sign Plugin)</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) =>
              prevValues.authMethod !== currentValues.authMethod
            }
          >
            {({ getFieldValue }) => {
              const authMethod = getFieldValue('authMethod');

              if (authMethod === 'iotp') {
                return (
                  <Form.Item
                    name="otpCode"
                    label="Mã OTP"
                    rules={[
                      { required: true, message: 'Vui lòng nhập mã OTP!' },
                      { len: 6, message: 'Mã OTP phải có 6 ký tự!' }
                    ]}
                  >
                    <Input
                      placeholder="Nhập mã OTP từ iOTP CORP"
                      maxLength={6}
                      size="large"
                      prefix={<KeyOutlined />}
                    />
                  </Form.Item>
                );
              }

              if (authMethod === 'digital_signature') {
                return (
                  <Alert
                    message="Chữ ký số"
                    description="Hệ thống sẽ tự động gọi OCB Sign Plugin để ký số giao dịch. Vui lòng đảm bảo đã cài đặt plugin và thiết bị USB Token được kết nối."
                    type="info"
                    showIcon
                    icon={<SafetyOutlined />}
                  />
                );
              }

              return null;
            }}
          </Form.Item>

          {currentAction === 'reject' && (
            <Form.Item
              name="rejectedReason"
              label="Lý do từ chối"
              rules={[{ required: true, message: 'Vui lòng nhập lý do từ chối!' }]}
            >
              <Input.TextArea
                placeholder="Nhập lý do từ chối giao dịch"
                rows={3}
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default PendingTransactions;
