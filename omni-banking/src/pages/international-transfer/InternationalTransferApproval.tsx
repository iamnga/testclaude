import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Checkbox,
  Modal,
  Descriptions,
  Alert,
  Input,
  Radio,
  Form,
  message,
  List,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SafetyOutlined,
  FileProtectOutlined,
} from '@ant-design/icons';
import { mockInternationalTransfers } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { InternationalTransfer } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const InternationalTransferApproval: React.FC = () => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<InternationalTransfer | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [authMethod, setAuthMethod] = useState<'iotp' | 'digital_signature'>('iotp');
  const [otpCode, setOtpCode] = useState('');
  const [rejectedReason, setRejectedReason] = useState('');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  const getStatusTag = (status: string) => {
    return <Tag color="cyan">Chờ phê duyệt</Tag>;
  };

  const getPurposeText = (purpose: string) => {
    const purposeMap: Record<string, string> = {
      payment_import: 'Thanh toán hàng hóa nhập khẩu',
      service_payment: 'Thanh toán dịch vụ',
      investment: 'Đầu tư vốn',
      education: 'Chi phí giáo dục',
      medical: 'Chi phí y tế',
      family_support: 'Hỗ trợ gia đình',
      other: 'Mục đích khác',
    };
    return purposeMap[purpose] || purpose;
  };

  // Filter only pending approval transfers
  const pendingTransfers = useMemo(() => {
    return mockInternationalTransfers
      .filter(t => t.status === 'pending_approval')
      .sort((a, b) => dayjs(b.createdDate).unix() - dayjs(a.createdDate).unix());
  }, []);

  const selectedTransfers = useMemo(() => {
    return pendingTransfers.filter(t => selectedRowKeys.includes(t.id));
  }, [selectedRowKeys, pendingTransfers]);

  const handleViewDetail = (record: InternationalTransfer) => {
    setSelectedTransfer(record);
    setDetailModalVisible(true);
  };

  const handleApprove = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một giao dịch!');
      return;
    }

    setActionType('approve');
    setAuthModalVisible(true);
  };

  const handleReject = () => {
    if (selectedRowKeys.length === 0) {
      message.warning('Vui lòng chọn ít nhất một giao dịch!');
      return;
    }

    setActionType('reject');
    setRejectModalVisible(true);
  };

  const handleRejectConfirm = () => {
    if (!rejectedReason.trim()) {
      message.error('Vui lòng nhập lý do từ chối!');
      return;
    }

    setRejectModalVisible(false);
    setAuthModalVisible(true);
  };

  const handleAuthConfirm = async () => {
    if (authMethod === 'iotp' && !otpCode) {
      message.error('Vui lòng nhập mã iOTP!');
      return;
    }

    setLoading(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (actionType === 'approve') {
        message.success(`Đã phê duyệt ${selectedRowKeys.length} giao dịch chuyển tiền quốc tế!`);
      } else {
        message.success(`Đã từ chối ${selectedRowKeys.length} giao dịch!`);
      }

      setSelectedRowKeys([]);
      setAuthModalVisible(false);
      setOtpCode('');
      setRejectedReason('');
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = () => {
    message.success('Đã gửi mã iOTP CORP đến thiết bị của bạn!');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (newSelectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(newSelectedRowKeys);
    },
  };

  const columns: ColumnsType<InternationalTransfer> = [
    {
      title: 'Mã tham chiếu',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 180,
      fixed: 'left',
      render: (number: string) => <Text strong code>{number}</Text>,
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 140,
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Người tạo',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
    {
      title: 'Người thụ hưởng',
      dataIndex: ['beneficiary', 'name'],
      key: 'beneficiaryName',
      width: 200,
      ellipsis: true,
      render: (name: string, record: InternationalTransfer) => (
        <div>
          <div><Text strong>{name}</Text></div>
          <div><Text type="secondary" style={{ fontSize: 12 }}>{record.beneficiary.country}</Text></div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount: number, record: InternationalTransfer) => (
        <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
          {formatCurrency(amount, record.currency)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Mục đích',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 180,
      render: (purpose: string) => getPurposeText(purpose),
    },
    {
      title: 'Phí',
      dataIndex: 'feeType',
      key: 'feeType',
      width: 80,
      align: 'center',
      render: (feeType: string) => <Tag>{feeType}</Tag>,
    },
    {
      title: 'Chứng từ',
      dataIndex: 'documents',
      key: 'documents',
      width: 100,
      align: 'center',
      render: (documents: any[]) => (
        <Tag color="blue">{documents.length} file</Tag>
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
      title: 'Thao tác',
      key: 'action',
      width: 120,
      fixed: 'right',
      render: (_: any, record: InternationalTransfer) => (
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
          Phê duyệt chuyển tiền quốc tế
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Phê duyệt hoặc từ chối các giao dịch chuyển tiền quốc tế
        </p>
      </div>

      <Alert
        message="Về phê duyệt chuyển tiền quốc tế"
        description={
          <div>
            <p>• Kiểm tra kỹ thông tin người thụ hưởng và ngân hàng nhận trước khi phê duyệt</p>
            <p>• Xác nhận chứng từ đã đầy đủ và hợp lệ theo quy định</p>
            <p>• Sử dụng iOTP CORP hoặc Chữ ký số để xác thực phê duyệt</p>
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
            <div style={{ fontSize: 14, color: '#666' }}>Chờ phê duyệt</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {pendingTransfers.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Đã chọn</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#13c2c2' }}>
              {selectedRowKeys.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng giá trị (USD)</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#52c41a' }}>
              {formatCurrency(
                selectedTransfers.filter(t => t.currency === 'USD').reduce((sum, t) => sum + t.amount, 0),
                'USD'
              )}
            </div>
          </div>
        </Space>
      </Card>

      {/* Action Buttons */}
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Button
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleApprove}
            disabled={selectedRowKeys.length === 0}
          >
            Phê duyệt ({selectedRowKeys.length})
          </Button>
          <Button
            danger
            icon={<CloseCircleOutlined />}
            onClick={handleReject}
            disabled={selectedRowKeys.length === 0}
          >
            Từ chối ({selectedRowKeys.length})
          </Button>
        </Space>
      </Card>

      {/* Table */}
      <Card title={`Danh sách: ${pendingTransfers.length} giao dịch chờ phê duyệt`}>
        <Table
          rowSelection={rowSelection}
          columns={columns}
          dataSource={pendingTransfers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1700 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết giao dịch chuyển tiền quốc tế"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
      >
        {selectedTransfer && (
          <>
            <Card title="Thông tin chung" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Mã tham chiếu" span={2}>
                  <Text strong code>{selectedTransfer.referenceNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {formatDateTime(selectedTransfer.createdDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                  {selectedTransfer.createdBy}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày gửi" span={2}>
                  {selectedTransfer.submittedDate && formatDateTime(selectedTransfer.submittedDate)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Thông tin chuyển tiền" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Tài khoản ghi nợ" span={2}>
                  {selectedTransfer.fromAccount} - {selectedTransfer.fromAccountName}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền" span={2}>
                  <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                    {formatCurrency(selectedTransfer.amount, selectedTransfer.currency)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mục đích" span={2}>
                  {getPurposeText(selectedTransfer.purpose)}
                </Descriptions.Item>
                <Descriptions.Item label="Diễn giải" span={2}>
                  {selectedTransfer.purposeDescription}
                </Descriptions.Item>
                <Descriptions.Item label="Phí dịch vụ" span={2}>
                  <Tag>{selectedTransfer.feeType}</Tag>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Thông tin người thụ hưởng" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Tên" span={2}>
                  <Text strong>{selectedTransfer.beneficiary.name}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {selectedTransfer.beneficiary.address}
                </Descriptions.Item>
                <Descriptions.Item label="Quốc gia" span={2}>
                  {selectedTransfer.beneficiary.country}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Thông tin ngân hàng nhận" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Tên ngân hàng" span={2}>
                  <Text strong>{selectedTransfer.beneficiaryBank.bankName}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ" span={2}>
                  {selectedTransfer.beneficiaryBank.bankAddress}
                </Descriptions.Item>
                <Descriptions.Item label="Mã SWIFT">
                  <Text code>{selectedTransfer.beneficiaryBank.swiftCode}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Số tài khoản">
                  <Text code>{selectedTransfer.beneficiaryBank.accountNumber}</Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            {selectedTransfer.intermediaryBank && (
              <Card title="Thông tin ngân hàng trung gian" style={{ marginBottom: 16 }}>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="Tên ngân hàng" span={2}>
                    <Text strong>{selectedTransfer.intermediaryBank.bankName}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ" span={2}>
                    {selectedTransfer.intermediaryBank.bankAddress}
                  </Descriptions.Item>
                  <Descriptions.Item label="Mã SWIFT" span={2}>
                    <Text code>{selectedTransfer.intermediaryBank.swiftCode}</Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>
            )}

            <Card title={`Chứng từ đã tải lên (${selectedTransfer.documents.length} file)`}>
              <List
                dataSource={selectedTransfer.documents}
                renderItem={(doc) => (
                  <List.Item>
                    <List.Item.Meta
                      title={doc.documentType}
                      description={`${doc.fileName} - ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`}
                    />
                  </List.Item>
                )}
              />
            </Card>
          </>
        )}
      </Modal>

      {/* Reject Modal */}
      <Modal
        title="Từ chối giao dịch"
        open={rejectModalVisible}
        onOk={handleRejectConfirm}
        onCancel={() => setRejectModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
      >
        <Alert
          message={`Bạn đang từ chối ${selectedRowKeys.length} giao dịch`}
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form.Item label="Lý do từ chối" required>
          <TextArea
            rows={4}
            value={rejectedReason}
            onChange={(e) => setRejectedReason(e.target.value)}
            placeholder="Nhập lý do từ chối (bắt buộc)"
            maxLength={500}
            showCount
          />
        </Form.Item>
      </Modal>

      {/* Authentication Modal */}
      <Modal
        title={actionType === 'approve' ? 'Xác thực phê duyệt' : 'Xác thực từ chối'}
        open={authModalVisible}
        onOk={handleAuthConfirm}
        onCancel={() => setAuthModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        confirmLoading={loading}
      >
        <Alert
          message={`Bạn đang ${actionType === 'approve' ? 'phê duyệt' : 'từ chối'} ${selectedRowKeys.length} giao dịch`}
          description={
            actionType === 'approve' ? (
              <div>
                <p>Tổng giá trị: <Text strong>{formatCurrency(
                  selectedTransfers.filter(t => t.currency === 'USD').reduce((sum, t) => sum + t.amount, 0),
                  'USD'
                )}</Text></p>
              </div>
            ) : (
              <div>
                <p>Lý do từ chối: <Text strong>{rejectedReason}</Text></p>
              </div>
            )
          }
          type={actionType === 'approve' ? 'info' : 'warning'}
          showIcon
          style={{ marginBottom: 16 }}
        />

        <Form layout="vertical">
          <Form.Item label="Phương thức xác thực">
            <Radio.Group value={authMethod} onChange={(e) => setAuthMethod(e.target.value)}>
              <Space direction="vertical">
                <Radio value="iotp">
                  <Space>
                    <SafetyOutlined style={{ color: '#1890ff' }} />
                    <span>iOTP CORP</span>
                  </Space>
                </Radio>
                <Radio value="digital_signature">
                  <Space>
                    <FileProtectOutlined style={{ color: '#52c41a' }} />
                    <span>Chữ ký số</span>
                  </Space>
                </Radio>
              </Space>
            </Radio.Group>
          </Form.Item>

          {authMethod === 'iotp' && (
            <>
              <Button
                type="dashed"
                onClick={handleSendOTP}
                style={{ marginBottom: 16, width: '100%' }}
              >
                Gửi mã iOTP
              </Button>

              <Form.Item label="Mã iOTP" required>
                <Input.OTP
                  length={6}
                  value={otpCode}
                  onChange={setOtpCode}
                />
              </Form.Item>
            </>
          )}

          {authMethod === 'digital_signature' && (
            <Alert
              message="Sử dụng chữ ký số"
              description="Hệ thống sẽ tự động ký số bằng thiết bị USB Token của bạn khi bạn nhấn Xác nhận"
              type="info"
              showIcon
            />
          )}
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default InternationalTransferApproval;
