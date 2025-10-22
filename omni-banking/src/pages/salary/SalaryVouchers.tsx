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
  DatePicker,
  Alert,
  Modal,
  Descriptions,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  FileTextOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
  LockOutlined,
} from '@ant-design/icons';
import { mockSalaryVouchers, mockSalaryPayments } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { SalaryVoucher } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const SalaryVouchers: React.FC = () => {
  const [searchBatchCode, setSearchBatchCode] = useState('');
  const [searchAccount, setSearchAccount] = useState('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedVoucher, setSelectedVoucher] = useState<SalaryVoucher | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const maskData = (data: string, visibleChars: number = 4): string => {
    if (data.length <= visibleChars) return data;
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + data.slice(-visibleChars);
  };

  const filteredVouchers = useMemo(() => {
    let filtered = [...mockSalaryVouchers];

    // Filter by batch code
    if (searchBatchCode) {
      filtered = filtered.filter(v =>
        v.batchCode.toLowerCase().includes(searchBatchCode.toLowerCase())
      );
    }

    // Filter by account
    if (searchAccount !== 'all') {
      filtered = filtered.filter(v => v.fromAccount === searchAccount);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(v => {
        const execDate = dayjs(v.executedDate);
        return execDate.isAfter(dateRange[0]) && execDate.isBefore(dateRange[1]);
      });
    }

    return filtered;
  }, [searchBatchCode, searchAccount, dateRange]);

  const handleDownload = (record: SalaryVoucher, format: 'pdf' | 'xlsx') => {
    if (!record.hasDetailAccess) {
      message.warning('Bạn không có quyền tải chi tiết chứng từ này!');
      return;
    }

    const typeText = record.voucherType === 'debit_note' ? 'GiayBaoNo' : 'BangKe';
    message.success(`Đang tải ${typeText}_${record.batchCode}.${format}...`);
    setTimeout(() => {
      message.info(`Tải xuống thành công: ${typeText}_${record.batchCode}.${format}`);
    }, 1000);
  };

  const handleViewDetail = (record: SalaryVoucher) => {
    setSelectedVoucher(record);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<SalaryVoucher> = [
    {
      title: 'Mã lô',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 150,
      fixed: 'left',
      render: (code: string, record: SalaryVoucher) => (
        <Space>
          <Text strong>{record.hasDetailAccess ? code : maskData(code)}</Text>
          {!record.hasDetailAccess && (
            <LockOutlined style={{ color: '#fa8c16' }} />
          )}
        </Space>
      ),
    },
    {
      title: 'Tên đợt',
      dataIndex: 'batchName',
      key: 'batchName',
      ellipsis: true,
      render: (name: string, record: SalaryVoucher) => (
        record.hasDetailAccess ? name : maskData(name, 10)
      ),
    },
    {
      title: 'Loại chứng từ',
      dataIndex: 'voucherType',
      key: 'voucherType',
      width: 150,
      render: (type: string) => (
        <Tag color={type === 'debit_note' ? 'blue' : 'green'}>
          {type === 'debit_note' ? 'Giấy báo nợ' : 'Bảng kê'}
        </Tag>
      ),
    },
    {
      title: 'Tài khoản',
      dataIndex: 'fromAccount',
      key: 'fromAccount',
      width: 150,
      render: (account: string, record: SalaryVoucher) => (
        record.hasDetailAccess ? account : maskData(account)
      ),
    },
    {
      title: 'Số NV',
      dataIndex: 'totalItems',
      key: 'totalItems',
      width: 80,
      align: 'center',
      render: (items: number, record: SalaryVoucher) => (
        record.hasDetailAccess ? items : '***'
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (amount: number, record: SalaryVoucher) => (
        <Text strong style={{ color: record.hasDetailAccess ? '#cf1322' : '#999' }}>
          {record.hasDetailAccess ? formatCurrency(amount) : '***'}
        </Text>
      ),
    },
    {
      title: 'Ngày thực hiện',
      dataIndex: 'executedDate',
      key: 'executedDate',
      width: 150,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Quyền truy cập',
      dataIndex: 'hasDetailAccess',
      key: 'hasDetailAccess',
      width: 120,
      align: 'center',
      render: (hasAccess: boolean) => (
        <Tag color={hasAccess ? 'success' : 'warning'}>
          {hasAccess ? 'Có quyền' : 'Hạn chế'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 250,
      fixed: 'right',
      render: (_: any, record: SalaryVoucher) => (
        <Space>
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          {record.voucherType === 'debit_note' && (
            <Button
              size="small"
              type="link"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record, 'pdf')}
              disabled={!record.hasDetailAccess}
            >
              Giấy báo nợ
            </Button>
          )}
          {record.voucherType === 'statement' && (
            <>
              <Button
                size="small"
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record, 'xlsx')}
                disabled={!record.hasDetailAccess}
              >
                Excel
              </Button>
              <Button
                size="small"
                type="link"
                icon={<DownloadOutlined />}
                onClick={() => handleDownload(record, 'pdf')}
                disabled={!record.hasDetailAccess}
              >
                PDF
              </Button>
            </>
          )}
        </Space>
      ),
    },
  ];

  const getPaymentDetail = (voucherId: string) => {
    const voucher = mockSalaryVouchers.find(v => v.id === voucherId);
    if (!voucher) return null;

    return mockSalaryPayments.find(p => p.id === voucher.salaryPaymentId);
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: 12 }} />
          Chứng từ chi lương bảo mật
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu và tải chứng từ giao dịch chi lương bảo mật (chỉ user được phân quyền mới xem chi tiết)
        </p>
      </div>

      <Alert
        message="Lưu ý về quyền truy cập"
        description={
          <div>
            <p>• <strong>Có quyền:</strong> Xem đầy đủ thông tin và tải chứng từ</p>
            <p>• <strong>Hạn chế:</strong> Chỉ xem thông tin đã che (masked), không tải được chứng từ chi tiết</p>
            <p>• Liên hệ quản trị viên để được cấp quyền truy cập đầy đủ</p>
          </div>
        }
        type="warning"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc & Tìm kiếm</>}
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <Input
            placeholder="Tìm theo mã lô (VD: SAL2025090001)"
            prefix={<SearchOutlined />}
            value={searchBatchCode}
            onChange={(e) => setSearchBatchCode(e.target.value)}
            style={{ width: 280 }}
            allowClear
          />

          <Select
            style={{ width: 250 }}
            value={searchAccount}
            onChange={setSearchAccount}
            placeholder="Tài khoản"
          >
            <Select.Option value="all">Tất cả tài khoản</Select.Option>
            <Select.Option value="0011234567890">0011234567890</Select.Option>
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </Space>
      </Card>

      {/* Vouchers Table */}
      <Card
        title={`Kết quả: ${filteredVouchers.length} chứng từ`}
      >
        <Table
          columns={columns}
          dataSource={filteredVouchers}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} chứng từ`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={`Chi tiết chứng từ ${selectedVoucher?.batchCode}`}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedVoucher && (
          <>
            {!selectedVoucher.hasDetailAccess && (
              <Alert
                message="Quyền truy cập hạn chế"
                description="Bạn không có quyền xem chi tiết đầy đủ của chứng từ này. Một số thông tin đã được che."
                type="warning"
                showIcon
                icon={<LockOutlined />}
                style={{ marginBottom: 16 }}
              />
            )}

            <Descriptions column={1} bordered>
              <Descriptions.Item label="Mã lô">
                {selectedVoucher.hasDetailAccess ? selectedVoucher.batchCode : maskData(selectedVoucher.batchCode)}
              </Descriptions.Item>
              <Descriptions.Item label="Tên đợt">
                {selectedVoucher.hasDetailAccess ? selectedVoucher.batchName : maskData(selectedVoucher.batchName, 10)}
              </Descriptions.Item>
              <Descriptions.Item label="Loại chứng từ">
                {selectedVoucher.voucherType === 'debit_note' ? 'Giấy báo nợ' : 'Bảng kê'}
              </Descriptions.Item>
              <Descriptions.Item label="Tài khoản nguồn">
                {selectedVoucher.hasDetailAccess ? selectedVoucher.fromAccount : maskData(selectedVoucher.fromAccount)}
              </Descriptions.Item>
              <Descriptions.Item label="Số nhân viên">
                {selectedVoucher.hasDetailAccess ? selectedVoucher.totalItems : '***'}
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền">
                <Text strong style={{ fontSize: 16, color: selectedVoucher.hasDetailAccess ? '#cf1322' : '#999' }}>
                  {selectedVoucher.hasDetailAccess ? formatCurrency(selectedVoucher.totalAmount) : '***'}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Ngày thực hiện">
                {formatDateTime(selectedVoucher.executedDate)}
              </Descriptions.Item>
            </Descriptions>

            {selectedVoucher.hasDetailAccess && (
              <div style={{ marginTop: 16 }}>
                <Space>
                  {selectedVoucher.voucherType === 'debit_note' && (
                    <Button
                      type="primary"
                      icon={<DownloadOutlined />}
                      onClick={() => handleDownload(selectedVoucher, 'pdf')}
                    >
                      Tải giấy báo nợ (PDF)
                    </Button>
                  )}
                  {selectedVoucher.voucherType === 'statement' && (
                    <>
                      <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(selectedVoucher, 'xlsx')}
                      >
                        Tải bảng kê (Excel)
                      </Button>
                      <Button
                        icon={<DownloadOutlined />}
                        onClick={() => handleDownload(selectedVoucher, 'pdf')}
                      >
                        Tải bảng kê (PDF)
                      </Button>
                    </>
                  )}
                </Space>
              </div>
            )}

            {!selectedVoucher.hasDetailAccess && (
              <Alert
                message="Để tải chứng từ, vui lòng liên hệ quản trị viên để được cấp quyền"
                type="info"
                showIcon
                style={{ marginTop: 16 }}
              />
            )}
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default SalaryVouchers;
