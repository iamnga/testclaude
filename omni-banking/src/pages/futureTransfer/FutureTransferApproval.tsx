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
  Input,
  Radio,
  Alert,
  Badge,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  FilterOutlined,
  SafetyOutlined,
  KeyOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { mockFutureTransfers } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { FutureTransfer } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const FutureTransferApproval: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [loading, setLoading] = useState(false);
  const [transfers, setTransfers] = useState<FutureTransfer[]>(mockFutureTransfers);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const pendingTransfers = useMemo(() => {
    let filtered = transfers.filter(t => t.status === 'pending_approval');

    if (filterType !== 'all') {
      filtered = filtered.filter(t => t.transferType === filterType);
    }

    return filtered;
  }, [transfers, filterType]);

  const selectedTransfers = useMemo(() => {
    return pendingTransfers.filter(t => selectedRowKeys.includes(t.id));
  }, [pendingTransfers, selectedRowKeys]);

  const canApproveSelected = useMemo(() => {
    return selectedTransfers.every(t => t.validationStatus === 'ok');
  }, [selectedTransfers]);

  const handleApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một giao dịch!');
      return;
    }

    if (!canApproveSelected) {
      message.error('Chỉ có thể duyệt các giao dịch có Validation Status = OK!');
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

  const handleSubmitAuth = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      setTimeout(() => {
        const actionText = currentAction === 'approve' ? 'Duyệt' : 'Từ chối';

        setTransfers(prev => prev.map(t => {
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

  const columns: ColumnsType<FutureTransfer> = [
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left',
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'transferType',
      key: 'transferType',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'single' ? 'blue' : 'purple'}>
          {type === 'single' ? 'Theo món' : 'Theo lô'}
        </Tag>
      ),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 250,
      render: (content: string, record: FutureTransfer) => (
        <div>
          <div>{content}</div>
          {record.batchCode && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              Mã lô: {record.batchCode} ({record.itemCount} GD)
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
      render: (beneficiary, record: FutureTransfer) => {
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
        if (record.batchName) {
          return <Text type="secondary">{record.batchName}</Text>;
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
      title: 'Ngày thực hiện',
      dataIndex: 'executionDate',
      key: 'executionDate',
      width: 150,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.executionDate).unix() - dayjs(b.executionDate).unix(),
    },
    {
      title: 'Validation',
      dataIndex: 'validationStatus',
      key: 'validationStatus',
      width: 110,
      align: 'center',
      render: (status: string, record: FutureTransfer) => {
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
  ];

  const totalPending = pendingTransfers.reduce((sum, t) => sum + t.totalAmount, 0);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ClockCircleOutlined style={{ marginRight: 12 }} />
          Duyệt giao dịch tương lai
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Xem và phê duyệt các lệnh chuyển tiền tương lai (chuyển tiền theo món hoặc theo lô/chi lương)
        </p>
      </div>

      <Card style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Chờ duyệt</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
              <Badge count={pendingTransfers.length} showZero color="#fa8c16" />
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng giá trị</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#1890ff' }}>
              {formatCurrency(totalPending)}
            </div>
          </div>
        </Space>
      </Card>

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
            <Select.Option value="single">Chuyển tiền theo món</Select.Option>
            <Select.Option value="batch">Chuyển tiền theo lô</Select.Option>
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

      <Card
        title={`Danh sách giao dịch chờ duyệt (${pendingTransfers.length})`}
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
            message="Chỉ có thể duyệt các giao dịch có Validation Status = OK"
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={pendingTransfers}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

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
          message={`Bạn đang ${currentAction === 'approve' ? 'duyệt' : 'từ chối'} ${selectedRowKeys.length} giao dịch tương lai`}
          description={
            <div style={{ marginTop: 8 }}>
              {selectedTransfers.map(t => (
                <div key={t.id} style={{ marginBottom: 4 }}>
                  • {t.id} - {t.content} - {formatCurrency(t.totalAmount)}
                  <br />
                  <Text type="secondary" style={{ fontSize: 12, marginLeft: 12 }}>
                    Thực hiện: {formatDateTime(t.executionDate)}
                  </Text>
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
                    description="Hệ thống sẽ tự động gọi OCB Sign Plugin để ký số giao dịch."
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

export default FutureTransferApproval;
