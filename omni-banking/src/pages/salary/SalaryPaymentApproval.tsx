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
  EyeOutlined,
} from '@ant-design/icons';
import { mockSalaryPayments } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { SalaryPayment, SalaryPaymentItem } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SalaryPaymentApproval: React.FC = () => {
  const [form] = Form.useForm();
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('pending_approval');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<SalaryPayment | null>(null);
  const [currentAction, setCurrentAction] = useState<'approve' | 'reject'>('approve');
  const [loading, setLoading] = useState(false);
  const [payments, setPayments] = useState<SalaryPayment[]>(mockSalaryPayments);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(p => p.status === filterStatus);
    }

    if (filterAccount !== 'all') {
      filtered = filtered.filter(p => p.fromAccount === filterAccount);
    }

    return filtered;
  }, [payments, filterStatus, filterAccount]);

  const selectedPayments = useMemo(() => {
    return filteredPayments.filter(p => selectedRowKeys.includes(p.id));
  }, [filteredPayments, selectedRowKeys]);

  const canApproveSelected = useMemo(() => {
    return selectedPayments.every(p =>
      p.status === 'pending_approval' && p.validationStatus === 'ok'
    );
  }, [selectedPayments]);

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

  const handleViewDetail = (record: SalaryPayment) => {
    setSelectedPayment(record);
    setDetailModalVisible(true);
  };

  const handleSubmitAuth = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      setTimeout(() => {
        const actionText = currentAction === 'approve' ? 'Duyệt' : 'Từ chối';

        setPayments(prev => prev.map(p => {
          if (selectedRowKeys.includes(p.id)) {
            return {
              ...p,
              status: currentAction === 'approve' ? 'approved' : 'rejected',
              approvedBy: 'approver_demo',
              approvedDate: new Date().toISOString(),
              rejectedReason: currentAction === 'reject' ? values.rejectedReason : undefined,
            };
          }
          return p;
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

  const itemColumns: ColumnsType<SalaryPaymentItem> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Mã NV',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 100,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'employeeName',
      key: 'employeeName',
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 150,
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bankName',
      key: 'bankName',
      render: (bankName: string) => bankName || '-',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
  ];

  const columns: ColumnsType<SalaryPayment> = [
    {
      title: 'Mã lô',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 150,
      fixed: 'left',
      render: (code: string) => <Text strong>{code}</Text>,
    },
    {
      title: 'Tên đợt',
      dataIndex: 'batchName',
      key: 'batchName',
      ellipsis: true,
      width: 250,
    },
    {
      title: 'Loại',
      dataIndex: 'transferType',
      key: 'transferType',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'internal' ? 'blue' : 'orange'}>
          {type === 'internal' ? 'Trong hệ thống' : 'Ngoài hệ thống'}
        </Tag>
      ),
    },
    {
      title: 'Tài khoản nguồn',
      dataIndex: 'fromAccount',
      key: 'fromAccount',
      width: 150,
    },
    {
      title: 'Số NV',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#cf1322' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Validation',
      dataIndex: 'validationStatus',
      key: 'validationStatus',
      width: 110,
      align: 'center',
      render: (status: string, record: SalaryPayment) => {
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
          pending_approval: 'warning',
          approved: 'success',
          rejected: 'error',
          executed: 'default',
        };
        const textMap: Record<string, string> = {
          pending_approval: 'Chờ duyệt',
          approved: 'Đã duyệt',
          rejected: 'Từ chối',
          executed: 'Đã thực hiện',
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
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: SalaryPayment) => (
        <Button
          size="small"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  const pendingCount = payments.filter(p => p.status === 'pending_approval').length;
  const approvedCount = payments.filter(p => p.status === 'approved').length;
  const totalPending = payments
    .filter(p => p.status === 'pending_approval')
    .reduce((sum, p) => sum + p.totalAmount, 0);

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
    getCheckboxProps: (record: SalaryPayment) => ({
      disabled: record.status !== 'pending_approval',
    }),
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CheckCircleOutlined style={{ marginRight: 12 }} />
          Giao dịch chờ duyệt chi lương bảo mật
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          User ký duyệt truy cập danh sách và duyệt các giao dịch chi lương
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
            style={{ width: 180 }}
            value={filterStatus}
            onChange={setFilterStatus}
            placeholder="Trạng thái"
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="pending_approval">Chờ duyệt</Select.Option>
            <Select.Option value="approved">Đã duyệt</Select.Option>
            <Select.Option value="rejected">Từ chối</Select.Option>
          </Select>

          <Select
            style={{ width: 250 }}
            value={filterAccount}
            onChange={setFilterAccount}
            placeholder="Tài khoản"
          >
            <Select.Option value="all">Tất cả tài khoản</Select.Option>
            <Select.Option value="0011234567890">0011234567890</Select.Option>
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

      {/* Payment Table */}
      <Card
        title={`Danh sách giao dịch (${filteredPayments.length})`}
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
          dataSource={filteredPayments}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết lô ${selectedPayment?.batchCode}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={900}
      >
        {selectedPayment && (
          <>
            <Alert
              message={`${selectedPayment.batchName}`}
              description={`Tổng: ${formatCurrency(selectedPayment.totalAmount)} | ${selectedPayment.totalItems} nhân viên`}
              type="info"
              showIcon
              style={{ marginBottom: 16 }}
            />

            <Table
              columns={itemColumns}
              dataSource={selectedPayment.items}
              rowKey="id"
              pagination={false}
              scroll={{ x: 700 }}
            />
          </>
        )}
      </Modal>

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
          message={`Bạn đang ${currentAction === 'approve' ? 'duyệt' : 'từ chối'} ${selectedRowKeys.length} giao dịch chi lương`}
          description={
            <div style={{ marginTop: 8 }}>
              {selectedPayments.map(p => (
                <div key={p.id} style={{ marginBottom: 4 }}>
                  • {p.batchCode} - {p.batchName} - {p.totalItems} NV - {formatCurrency(p.totalAmount)}
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

export default SalaryPaymentApproval;
