import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Steps,
  Modal,
  Descriptions,
  Alert,
  Timeline,
  Empty,
  Upload,
  message,
  Form,
  Select,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadFile } from 'antd';
import {
  SyncOutlined,
  EyeOutlined,
  UploadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
} from '@ant-design/icons';
import { mockInternationalTransfers } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { InternationalTransfer } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const InternationalTransferTracking: React.FC = () => {
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [supplementModalVisible, setSupplementModalVisible] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<InternationalTransfer | null>(null);
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      submitted: { color: 'processing', text: 'Đã gửi' },
      ocb_review: { color: 'warning', text: 'OCB đang thẩm định' },
      need_revision: { color: 'orange', text: 'Cần bổ sung hồ sơ' },
      pending_approval: { color: 'cyan', text: 'Chờ phê duyệt' },
      approved: { color: 'blue', text: 'Đã phê duyệt' },
      processing: { color: 'geekblue', text: 'Đang xử lý' },
    };
    const s = statusMap[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
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

  const getProgressStep = (status: string) => {
    const statusSteps: Record<string, number> = {
      submitted: 0,
      ocb_review: 1,
      need_revision: 1, // Same as ocb_review
      pending_approval: 2,
      approved: 3,
      processing: 4,
    };
    return statusSteps[status] || 0;
  };

  // Filter only in-process transfers
  const inProcessTransfers = useMemo(() => {
    return mockInternationalTransfers.filter(t =>
      ['submitted', 'ocb_review', 'need_revision', 'pending_approval', 'approved', 'processing'].includes(t.status)
    ).sort((a, b) => dayjs(b.createdDate).unix() - dayjs(a.createdDate).unix());
  }, []);

  const handleViewDetail = (record: InternationalTransfer) => {
    setSelectedTransfer(record);
    setDetailModalVisible(true);
  };

  const handleSupplementDocuments = (record: InternationalTransfer) => {
    setSelectedTransfer(record);
    setSupplementModalVisible(true);
    setFileList([]);
    form.resetFields();
  };

  const handleSubmitSupplementDocuments = async () => {
    try {
      await form.validateFields();

      if (fileList.length === 0) {
        message.warning('Vui lòng tải lên ít nhất một chứng từ!');
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      message.success('Đã gửi bổ sung hồ sơ thành công!');
      setSupplementModalVisible(false);
      setSelectedTransfer(null);
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin!');
    }
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
    },
    {
      title: 'Mục đích',
      dataIndex: 'purpose',
      key: 'purpose',
      width: 180,
      render: (purpose: string) => getPurposeText(purpose),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 180,
      render: (status: string, record: InternationalTransfer) => (
        <div>
          {getStatusTag(status)}
          {record.statusMessage && (
            <div style={{ marginTop: 4 }}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.statusMessage}
              </Text>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_: any, record: InternationalTransfer) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          {record.canSupplementDocuments && (
            <Button
              size="small"
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => handleSupplementDocuments(record)}
            >
              Bổ sung hồ sơ
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const renderProgressSteps = (transfer: InternationalTransfer) => {
    const currentStep = getProgressStep(transfer.status);

    const steps = [
      {
        title: 'Đã gửi',
        description: transfer.submittedDate ? formatDateTime(transfer.submittedDate) : undefined,
        status: currentStep >= 0 ? 'finish' : 'wait',
      },
      {
        title: 'OCB thẩm định',
        description: transfer.status === 'need_revision' ? 'Cần bổ sung hồ sơ' : undefined,
        status: currentStep > 1 ? 'finish' : currentStep === 1 ? transfer.status === 'need_revision' ? 'error' : 'process' : 'wait',
      },
      {
        title: 'Chờ phê duyệt',
        description: transfer.status === 'pending_approval' ? 'Đang chờ phê duyệt' : undefined,
        status: currentStep > 2 ? 'finish' : currentStep === 2 ? 'process' : 'wait',
      },
      {
        title: 'Đã phê duyệt',
        description: transfer.approvedDate ? formatDateTime(transfer.approvedDate) : undefined,
        status: currentStep > 3 ? 'finish' : currentStep === 3 ? 'process' : 'wait',
      },
      {
        title: 'Đang xử lý',
        description: transfer.status === 'processing' ? 'Chuyển tiền qua SWIFT' : undefined,
        status: currentStep === 4 ? 'process' : 'wait',
      },
    ];

    return <Steps current={currentStep} items={steps} style={{ marginTop: 24 }} />;
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SyncOutlined style={{ marginRight: 12 }} />
          Theo dõi giao dịch chuyển tiền quốc tế
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Theo dõi tiến độ xử lý các giao dịch chuyển tiền quốc tế đang thực hiện
        </p>
      </div>

      <Alert
        message="Về theo dõi giao dịch"
        description={
          <div>
            <p>• Hiển thị các giao dịch đang được xử lý từ khi gửi đến khi hoàn thành</p>
            <p>• Nếu trạng thái "Cần bổ sung hồ sơ", vui lòng bổ sung chứng từ trước hạn</p>
            <p>• Thời gian xử lý trung bình: 2-5 ngày làm việc</p>
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
            <div style={{ fontSize: 14, color: '#666' }}>Đang xử lý</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {inProcessTransfers.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>OCB thẩm định</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#faad14' }}>
              {inProcessTransfers.filter(t => t.status === 'ocb_review').length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Cần bổ sung hồ sơ</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>
              {inProcessTransfers.filter(t => t.status === 'need_revision').length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Chờ phê duyệt</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#13c2c2' }}>
              {inProcessTransfers.filter(t => t.status === 'pending_approval').length}
            </div>
          </div>
        </Space>
      </Card>

      {/* Table */}
      <Card title={`Danh sách: ${inProcessTransfers.length} giao dịch đang xử lý`}>
        {inProcessTransfers.length === 0 ? (
          <Empty
            description="Không có giao dịch nào đang xử lý"
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        ) : (
          <Table
            columns={columns}
            dataSource={inProcessTransfers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Tổng ${total} giao dịch`,
            }}
            scroll={{ x: 1600 }}
          />
        )}
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết tiến độ xử lý"
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
            {selectedTransfer.statusMessage && (
              <Alert
                message={selectedTransfer.statusMessage}
                type={selectedTransfer.status === 'need_revision' ? 'warning' : 'info'}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {selectedTransfer.canSupplementDocuments && selectedTransfer.documentDeadline && (
              <Alert
                message="Cần bổ sung hồ sơ"
                description={
                  <div>
                    <p>Hạn nộp hồ sơ: <Text strong>{formatDateTime(selectedTransfer.documentDeadline)}</Text></p>
                    <Button
                      type="primary"
                      size="small"
                      icon={<UploadOutlined />}
                      onClick={() => {
                        setDetailModalVisible(false);
                        handleSupplementDocuments(selectedTransfer);
                      }}
                    >
                      Bổ sung hồ sơ ngay
                    </Button>
                  </div>
                }
                type="error"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Card title="Thông tin giao dịch" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Mã tham chiếu" span={2}>
                  <Text strong code>{selectedTransfer.referenceNumber}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  {getStatusTag(selectedTransfer.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền" span={2}>
                  <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                    {formatCurrency(selectedTransfer.amount, selectedTransfer.currency)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Người thụ hưởng" span={2}>
                  <Text strong>{selectedTransfer.beneficiary.name}</Text> - {selectedTransfer.beneficiary.country}
                </Descriptions.Item>
                <Descriptions.Item label="Mục đích" span={2}>
                  {getPurposeText(selectedTransfer.purpose)}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Card title="Tiến độ xử lý">
              {renderProgressSteps(selectedTransfer)}
            </Card>

            <Card title="Lịch sử xử lý" style={{ marginTop: 16 }}>
              <Timeline
                items={[
                  selectedTransfer.createdDate && {
                    color: 'blue',
                    dot: <CheckCircleOutlined />,
                    children: (
                      <>
                        <Text strong>Tạo giao dịch</Text>
                        <br />
                        <Text type="secondary">{formatDateTime(selectedTransfer.createdDate)}</Text>
                      </>
                    ),
                  },
                  selectedTransfer.submittedDate && {
                    color: 'green',
                    dot: <CheckCircleOutlined />,
                    children: (
                      <>
                        <Text strong>Gửi yêu cầu chuyển tiền</Text>
                        <br />
                        <Text type="secondary">{formatDateTime(selectedTransfer.submittedDate)}</Text>
                      </>
                    ),
                  },
                  selectedTransfer.status === 'ocb_review' && {
                    color: 'orange',
                    dot: <ClockCircleOutlined />,
                    children: (
                      <>
                        <Text strong>OCB đang thẩm định hồ sơ</Text>
                        <br />
                        <Text type="secondary">Đang xử lý...</Text>
                      </>
                    ),
                  },
                  selectedTransfer.status === 'need_revision' && {
                    color: 'red',
                    dot: <ExclamationCircleOutlined />,
                    children: (
                      <>
                        <Text strong>Yêu cầu bổ sung hồ sơ</Text>
                        <br />
                        <Text type="secondary">{selectedTransfer.statusMessage}</Text>
                      </>
                    ),
                  },
                  selectedTransfer.status === 'pending_approval' && {
                    color: 'cyan',
                    dot: <ClockCircleOutlined />,
                    children: (
                      <>
                        <Text strong>Chờ phê duyệt</Text>
                        <br />
                        <Text type="secondary">Đang chờ phê duyệt...</Text>
                      </>
                    ),
                  },
                  selectedTransfer.approvedDate && {
                    color: 'green',
                    dot: <CheckCircleOutlined />,
                    children: (
                      <>
                        <Text strong>Đã phê duyệt</Text>
                        <br />
                        <Text type="secondary">{formatDateTime(selectedTransfer.approvedDate)} bởi {selectedTransfer.approvedBy}</Text>
                      </>
                    ),
                  },
                  selectedTransfer.status === 'processing' && {
                    color: 'blue',
                    dot: <SyncOutlined spin />,
                    children: (
                      <>
                        <Text strong>Đang xử lý chuyển tiền</Text>
                        <br />
                        <Text type="secondary">Đang chuyển tiền qua hệ thống SWIFT...</Text>
                      </>
                    ),
                  },
                ].filter(Boolean)}
              />
            </Card>
          </>
        )}
      </Modal>

      {/* Supplement Documents Modal */}
      <Modal
        title="Bổ sung hồ sơ chuyển tiền quốc tế"
        open={supplementModalVisible}
        onCancel={() => setSupplementModalVisible(false)}
        onOk={handleSubmitSupplementDocuments}
        okText="Gửi hồ sơ"
        cancelText="Hủy"
        width={700}
      >
        {selectedTransfer && (
          <>
            <Alert
              message="Yêu cầu bổ sung hồ sơ"
              description={
                <div>
                  <p><Text strong>Mã tham chiếu:</Text> {selectedTransfer.referenceNumber}</p>
                  <p><Text strong>Lý do:</Text> {selectedTransfer.statusMessage}</p>
                  {selectedTransfer.documentDeadline && (
                    <p><Text strong>Hạn nộp:</Text> <Text type="danger">{formatDateTime(selectedTransfer.documentDeadline)}</Text></p>
                  )}
                </div>
              }
              type="warning"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form form={form} layout="vertical">
              <Form.Item
                label="Loại chứng từ"
                name="documentType"
                rules={[{ required: true, message: 'Vui lòng chọn loại chứng từ!' }]}
              >
                <Select placeholder="Chọn loại chứng từ">
                  <Select.Option value="Giấy tờ tùy thân">Giấy tờ tùy thân</Select.Option>
                  <Select.Option value="Giấy phép kinh doanh">Giấy phép kinh doanh</Select.Option>
                  <Select.Option value="Hợp đồng bổ sung">Hợp đồng bổ sung</Select.Option>
                  <Select.Option value="Chứng từ khác">Chứng từ khác</Select.Option>
                </Select>
              </Form.Item>

              <Form.Item label="Tải lên chứng từ">
                <Upload
                  beforeUpload={(file) => {
                    const isValidType = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'application/pdf'].includes(file.type);
                    if (!isValidType) {
                      message.error('Chỉ chấp nhận file JPEG, JPG, GIF, PNG, PDF!');
                      return Upload.LIST_IGNORE;
                    }

                    const isLt5M = file.size / 1024 / 1024 < 5;
                    if (!isLt5M) {
                      message.error('Kích thước file không được vượt quá 5MB!');
                      return Upload.LIST_IGNORE;
                    }

                    return false;
                  }}
                  fileList={fileList}
                  onChange={({ fileList }) => setFileList(fileList)}
                  multiple
                >
                  <Button icon={<UploadOutlined />}>Chọn file (tối đa 5MB/file)</Button>
                </Upload>
                <Text type="secondary" style={{ marginTop: 8, display: 'block' }}>
                  Hỗ trợ: JPEG, JPG, GIF, PNG, PDF
                </Text>
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default InternationalTransferTracking;
