import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  DatePicker,
  Select,
  Input,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  HistoryOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { mockBillPayments, mockBillServices } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import dayjs from 'dayjs';
import type { BillPayment } from '../../types';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const BillPaymentHistory: React.FC = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const getCategoryFromService = (serviceCode: string) => {
    const service = mockBillServices.find(s => s.code === serviceCode);
    return service?.category || 'other';
  };

  const filteredPayments = useMemo(() => {
    let filtered = [...mockBillPayments];

    // Filter by account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(p => p.fromAccount === selectedAccount);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => getCategoryFromService(p.serviceCode) === selectedCategory);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(p =>
        p.serviceName.toLowerCase().includes(searchText.toLowerCase()) ||
        p.customerCode.toLowerCase().includes(searchText.toLowerCase()) ||
        p.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(p => {
        const paymentDate = dayjs(p.paymentDate);
        return paymentDate.isAfter(dateRange[0]) && paymentDate.isBefore(dateRange[1]);
      });
    }

    return filtered;
  }, [searchText, selectedAccount, selectedCategory, dateRange]);

  const handleViewDetail = (record: BillPayment) => {
    message.info(`Đang xem chi tiết giao dịch ${record.id}...`);
  };

  const handleDownloadReceipt = (record: BillPayment) => {
    message.success(`Đang tải biên lai ${record.id}.pdf...`);
    setTimeout(() => {
      message.info(`Tải xuống thành công: BienLai_${record.id}.pdf`);
    }, 1000);
  };

  const handleExport = (format: 'pdf' | 'xlsx') => {
    if (filteredPayments.length === 0) {
      message.warning('Không có giao dịch nào để xuất!');
      return;
    }

    message.success(`Đang xuất ${filteredPayments.length} giao dịch...`);
    setTimeout(() => {
      message.info(`Tải xuống thành công: LichSuThanhToan_${dayjs().format('YYYYMMDD')}.${format}`);
    }, 1000);
  };

  const columns: ColumnsType<BillPayment> = [
    {
      title: 'Ngày thanh toán',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 150,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      render: (id: string) => <strong>{id}</strong>,
    },
    {
      title: 'Dịch vụ',
      dataIndex: 'serviceName',
      key: 'serviceName',
      ellipsis: true,
    },
    {
      title: 'Mã khách hàng',
      dataIndex: 'customerCode',
      key: 'customerCode',
      width: 130,
    },
    {
      title: 'Kỳ',
      dataIndex: 'period',
      key: 'period',
      width: 80,
      render: (period: string) => period || '-',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Phí',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      width: 90,
      align: 'right',
      render: (fee: number) => formatCurrency(fee),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 130,
      align: 'right',
      render: (total: number) => (
        <strong style={{ color: '#cf1322' }}>{formatCurrency(total)}</strong>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      align: 'center',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          completed: 'success',
          pending: 'warning',
          failed: 'error',
        };
        const textMap: Record<string, string> = {
          completed: 'Thành công',
          pending: 'Đang xử lý',
          failed: 'Thất bại',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: any, record: BillPayment) => (
        <Space>
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
          <Button
            size="small"
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadReceipt(record)}
          >
            Tải biên lai
          </Button>
        </Space>
      ),
    },
  ];

  const categories = [
    { value: 'all', label: 'Tất cả dịch vụ' },
    { value: 'electricity', label: 'Tiền điện' },
    { value: 'water', label: 'Tiền nước' },
    { value: 'mobile', label: 'Điện thoại di động' },
    { value: 'internet', label: 'Internet' },
    { value: 'phone', label: 'Điện thoại cố định' },
    { value: 'airline', label: 'Vé máy bay' },
  ];

  const totalAmount = filteredPayments.reduce((sum, p) => sum + p.totalAmount, 0);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <HistoryOutlined style={{ marginRight: 12 }} />
          Lịch sử thanh toán hóa đơn
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu và quản lý lịch sử thanh toán hóa đơn
        </p>
      </div>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc</>}
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Select
              style={{ width: 200 }}
              value={selectedCategory}
              onChange={setSelectedCategory}
              placeholder="Loại dịch vụ"
            >
              {categories.map(cat => (
                <Select.Option key={cat.value} value={cat.value}>
                  {cat.label}
                </Select.Option>
              ))}
            </Select>

            <Select
              style={{ width: 250 }}
              value={selectedAccount}
              onChange={setSelectedAccount}
              placeholder="Chọn tài khoản"
            >
              <Select.Option value="all">Tất cả tài khoản</Select.Option>
              {user?.accounts.map(acc => (
                <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountNumber} - {acc.accountName}
                </Select.Option>
              ))}
            </Select>

            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày', 'Đến ngày']}
            />

            <Input
              placeholder="Tìm theo mã GD, dịch vụ, mã KH"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />
          </Space>
        </Space>
      </Card>

      {/* Transaction Table */}
      <Card
        title={
          <Space>
            <span>Kết quả: {filteredPayments.length} giao dịch</span>
            <span style={{ color: '#1890ff', fontWeight: 'normal' }}>
              | Tổng: {formatCurrency(totalAmount)}
            </span>
          </Space>
        }
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExport('xlsx')}
            >
              Xuất Excel
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExport('pdf')}
            >
              Xuất PDF
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredPayments}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1300 }}
        />
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title="Lưu ý"
        size="small"
      >
        <div style={{ fontSize: 13, color: '#666' }}>
          <p>• <strong>Biên lai thanh toán:</strong> Tải biên lai để làm chứng từ xác nhận thanh toán</p>
          <p>• <strong>Lịch sử lưu trữ:</strong> Hệ thống lưu trữ lịch sử thanh toán trong vòng 12 tháng</p>
          <p>• <strong>Xuất dữ liệu:</strong> Hỗ trợ xuất bảng kê dạng Excel hoặc PDF</p>
          <p>• <strong>Hỗ trợ:</strong> Liên hệ hotline 1900 6678 nếu có thắc mắc về giao dịch</p>
        </div>
      </Card>
    </AppLayout>
  );
};

export default BillPaymentHistory;
