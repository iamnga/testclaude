import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Select,
  DatePicker,
  Input,
  Modal,
  Descriptions,
  Alert,
  List,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  HistoryOutlined,
  FilterOutlined,
  EyeOutlined,
  CopyOutlined,
  DownloadOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { mockInternationalTransfers } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { InternationalTransfer } from '../../types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const InternationalTransferHistory: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [searchText, setSearchText] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<InternationalTransfer | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      draft: { color: 'default', text: 'Bản nháp' },
      submitted: { color: 'processing', text: 'Đã gửi' },
      ocb_review: { color: 'warning', text: 'OCB đang thẩm định' },
      need_revision: { color: 'orange', text: 'Cần bổ sung hồ sơ' },
      pending_approval: { color: 'cyan', text: 'Chờ phê duyệt' },
      approved: { color: 'blue', text: 'Đã phê duyệt' },
      rejected: { color: 'error', text: 'Đã từ chối' },
      processing: { color: 'geekblue', text: 'Đang xử lý' },
      completed: { color: 'success', text: 'Hoàn thành' },
      failed: { color: 'error', text: 'Thất bại' },
    };
    const s = statusMap[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const getFeeTypeText = (feeType: string) => {
    const feeTypeMap: Record<string, string> = {
      SHARE: 'SHARE - Chia phí',
      OUR: 'OUR - Người gửi trả toàn bộ',
      BEN: 'BEN - Người nhận trả toàn bộ',
    };
    return feeTypeMap[feeType] || feeType;
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

  const filteredTransfers = useMemo(() => {
    let filtered = [...mockInternationalTransfers];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((transfer) => transfer.status === statusFilter);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((transfer) => {
        const transferDate = dayjs(transfer.createdDate);
        return transferDate.isAfter(dateRange[0]) && transferDate.isBefore(dateRange[1]);
      });
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      filtered = filtered.filter((transfer) =>
        transfer.referenceNumber.toLowerCase().includes(searchLower) ||
        transfer.beneficiary.name.toLowerCase().includes(searchLower) ||
        transfer.beneficiary.country.toLowerCase().includes(searchLower) ||
        transfer.purposeDescription.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort((a, b) =>
      dayjs(b.createdDate).unix() - dayjs(a.createdDate).unix()
    );
  }, [statusFilter, dateRange, searchText]);

  const handleViewDetail = (record: InternationalTransfer) => {
    setSelectedTransfer(record);
    setDetailModalVisible(true);
  };

  const handleCopy = (record: InternationalTransfer) => {
    Modal.confirm({
      title: 'Sao chép giao dịch',
      content: 'Bạn có muốn sao chép thông tin giao dịch này để tạo lệnh chuyển tiền mới?',
      okText: 'Sao chép',
      cancelText: 'Hủy',
      onOk: () => {
        // In a real app, we would navigate with state
        message.success('Đã sao chép thông tin giao dịch. Chuyển đến trang tạo lệnh mới...');
        setTimeout(() => {
          navigate('/international-transfer/create');
        }, 1000);
      },
    });
  };

  const handleDownloadMT103 = (transfer: InternationalTransfer) => {
    if (transfer.mt103Url) {
      message.success(`Đang tải file MT103: ${transfer.referenceNumber}.pdf`);
      // In a real app, this would trigger an actual download
    } else {
      message.error('File MT103 chưa được tạo cho giao dịch này!');
    }
  };

  const columns: ColumnsType<InternationalTransfer> = [
    {
      title: 'Mã tham chiếu',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 180,
      fixed: 'left',
      render: (number: string, record: InternationalTransfer) => {
        if (!number) {
          return <Tag color="default">Chưa có mã</Tag>;
        }
        return <Text strong code>{number}</Text>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 160,
      render: (date: string) => formatDate(date),
      sorter: (a, b) => dayjs(a.createdDate).unix() - dayjs(b.createdDate).unix(),
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
      width: 100,
      align: 'center',
      render: (feeType: string) => <Tag>{feeType}</Tag>,
    },
    {
      title: 'Ngân hàng nhận',
      dataIndex: ['beneficiaryBank', 'bankName'],
      key: 'beneficiaryBankName',
      width: 200,
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
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
          {record.status !== 'draft' && (
            <Button
              size="small"
              type="link"
              icon={<CopyOutlined />}
              onClick={() => handleCopy(record)}
            >
              Sao chép
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const statistics = useMemo(() => {
    const totalAmount = filteredTransfers.reduce((sum, t) => sum + (t.currency === 'USD' ? t.amount : 0), 0);
    const completed = filteredTransfers.filter((t) => t.status === 'completed').length;
    const processing = filteredTransfers.filter((t) => ['submitted', 'ocb_review', 'pending_approval', 'approved', 'processing'].includes(t.status)).length;
    const failed = filteredTransfers.filter((t) => ['rejected', 'failed'].includes(t.status)).length;
    return {
      totalAmount,
      completed,
      processing,
      failed,
    };
  }, [filteredTransfers]);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <HistoryOutlined style={{ marginRight: 12 }} />
          Lịch sử chuyển tiền quốc tế
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu lịch sử và quản lý các giao dịch chuyển tiền quốc tế
        </p>
      </div>

      {/* Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng số giao dịch</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {filteredTransfers.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Đang xử lý</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#faad14' }}>
              {statistics.processing}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Hoàn thành</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
              {statistics.completed}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Thất bại</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>
              {statistics.failed}
            </div>
          </div>
        </Space>
      </Card>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Tìm kiếm & Bộ lọc</>}
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => message.info('Đang xuất báo cáo...')}
          >
            Xuất Excel
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Search
            placeholder="Tìm theo mã tham chiếu, người nhận, quốc gia..."
            allowClear
            style={{ width: 350 }}
            onSearch={setSearchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          <Select
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Trạng thái"
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="draft">Bản nháp</Select.Option>
            <Select.Option value="submitted">Đã gửi</Select.Option>
            <Select.Option value="ocb_review">OCB đang thẩm định</Select.Option>
            <Select.Option value="need_revision">Cần bổ sung hồ sơ</Select.Option>
            <Select.Option value="pending_approval">Chờ phê duyệt</Select.Option>
            <Select.Option value="approved">Đã phê duyệt</Select.Option>
            <Select.Option value="processing">Đang xử lý</Select.Option>
            <Select.Option value="completed">Hoàn thành</Select.Option>
            <Select.Option value="rejected">Đã từ chối</Select.Option>
            <Select.Option value="failed">Thất bại</Select.Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </Space>
      </Card>

      {/* Table */}
      <Card title={`Danh sách: ${filteredTransfers.length} giao dịch`}>
        <Table
          columns={columns}
          dataSource={filteredTransfers}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết giao dịch chuyển tiền quốc tế"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        width={900}
        footer={[
          selectedTransfer?.mt103Url && (
            <Button
              key="mt103"
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => selectedTransfer && handleDownloadMT103(selectedTransfer)}
            >
              Tải file MT103
            </Button>
          ),
          selectedTransfer?.status !== 'draft' && (
            <Button
              key="copy"
              icon={<CopyOutlined />}
              onClick={() => selectedTransfer && handleCopy(selectedTransfer)}
            >
              Sao chép giao dịch
            </Button>
          ),
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
                type={selectedTransfer.status === 'completed' ? 'success' : selectedTransfer.status === 'rejected' || selectedTransfer.status === 'failed' ? 'error' : 'info'}
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            {selectedTransfer.canSupplementDocuments && selectedTransfer.documentDeadline && (
              <Alert
                message="Cần bổ sung hồ sơ"
                description={`Hạn nộp hồ sơ: ${formatDateTime(selectedTransfer.documentDeadline)}`}
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}

            <Card title="Thông tin chung" style={{ marginBottom: 16 }}>
              <Descriptions column={2} bordered>
                <Descriptions.Item label="Mã tham chiếu" span={2}>
                  <Text strong code>{selectedTransfer.referenceNumber || 'Chưa có mã'}</Text>
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái" span={2}>
                  {getStatusTag(selectedTransfer.status)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {formatDateTime(selectedTransfer.createdDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Người tạo">
                  {selectedTransfer.createdBy}
                </Descriptions.Item>
                {selectedTransfer.submittedDate && (
                  <Descriptions.Item label="Ngày gửi" span={2}>
                    {formatDateTime(selectedTransfer.submittedDate)}
                  </Descriptions.Item>
                )}
                {selectedTransfer.approvedDate && (
                  <Descriptions.Item label="Ngày phê duyệt" span={2}>
                    {formatDateTime(selectedTransfer.approvedDate)} bởi {selectedTransfer.approvedBy}
                  </Descriptions.Item>
                )}
                {selectedTransfer.completedDate && (
                  <Descriptions.Item label="Ngày hoàn thành" span={2}>
                    {formatDateTime(selectedTransfer.completedDate)}
                  </Descriptions.Item>
                )}
                {selectedTransfer.rejectedReason && (
                  <Descriptions.Item label="Lý do từ chối" span={2}>
                    <Text type="danger">{selectedTransfer.rejectedReason}</Text>
                  </Descriptions.Item>
                )}
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
                  {getFeeTypeText(selectedTransfer.feeType)}
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
              {selectedTransfer.documents.length === 0 ? (
                <Text type="secondary">Không có chứng từ</Text>
              ) : (
                <List
                  dataSource={selectedTransfer.documents}
                  renderItem={(doc) => (
                    <List.Item>
                      <List.Item.Meta
                        avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                        title={doc.documentType}
                        description={`${doc.fileName} - ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB - ${formatDateTime(doc.uploadDate)}`}
                      />
                    </List.Item>
                  )}
                />
              )}
            </Card>
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default InternationalTransferHistory;
