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
  FileTextOutlined,
  DownloadOutlined,
  EyeOutlined,
  SearchOutlined,
  FilterOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { mockTransactions } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const TransferVouchers: React.FC = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  // Filter only debit transactions (trích nợ)
  const debitTransactions = useMemo(() => {
    let filtered = mockTransactions.filter(t => t.type === 'debit');

    // Filter by account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter(t => t.accountNumber === selectedAccount);
    }

    // Filter by search text
    if (searchText) {
      filtered = filtered.filter(t =>
        t.description.toLowerCase().includes(searchText.toLowerCase()) ||
        t.id.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(t => {
        const txDate = dayjs(t.date);
        return txDate.isAfter(dateRange[0]) && txDate.isBefore(dateRange[1]);
      });
    }

    return filtered;
  }, [searchText, selectedAccount, dateRange]);

  const handleDownloadVoucher = (record: any, format: 'pdf' | 'xlsx') => {
    message.success(`Đang tải giấy báo nợ ${record.id}.${format}...`);
    // Mock download
    setTimeout(() => {
      message.info(`Tải xuống thành công: GBN_${record.id}.${format}`);
    }, 1000);
  };

  const handleDownloadBatch = (format: 'pdf' | 'xlsx') => {
    if (debitTransactions.length === 0) {
      message.warning('Không có giao dịch nào để xuất!');
      return;
    }

    message.success(`Đang tải bảng kê ${debitTransactions.length} giao dịch...`);
    setTimeout(() => {
      message.info(`Tải xuống thành công: BangKe_${dayjs().format('YYYYMMDD')}.${format}`);
    }, 1000);
  };

  const columns: ColumnsType<any> = [
    {
      title: 'Ngày GD',
      dataIndex: 'date',
      key: 'date',
      width: 150,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      render: (id: string) => <strong>{id}</strong>,
    },
    {
      title: 'Tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 140,
    },
    {
      title: 'Nội dung',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      render: (amount: number, record: any) => (
        <strong style={{ color: '#cf1322' }}>
          -{formatCurrency(amount, record.currency)}
        </strong>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => (
        <Tag color="success">{status}</Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => message.info('Đang mở giấy báo nợ...')}
          >
            Xem
          </Button>
          <Button
            size="small"
            type="link"
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadVoucher(record, 'pdf')}
          >
            Tải PDF
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileTextOutlined style={{ marginRight: 12 }} />
          Chứng từ giao dịch trực tuyến
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tìm kiếm và tải giấy báo nợ của các giao dịch trích nợ từ tài khoản
        </p>
      </div>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Tìm kiếm giao dịch</>}
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Select
              style={{ width: 250 }}
              value={selectedAccount}
              onChange={setSelectedAccount}
              placeholder="Chọn tài khoản"
            >
              <Select.Option value="all">Tất cả tài khoản</Select.Option>
              {user?.accounts.map(acc => (
                <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountNumber}
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
              placeholder="Tìm theo mã GD hoặc nội dung"
              prefix={<SearchOutlined />}
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />
          </Space>
        </Space>
      </Card>

      {/* Transaction Table */}
      <Card
        title={`Kết quả: ${debitTransactions.length} giao dịch`}
        extra={
          <Space>
            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadBatch('xlsx')}
            >
              Xuất Excel
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleDownloadBatch('pdf')}
            >
              Xuất PDF
            </Button>
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={debitTransactions}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1100 }}
        />
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title="Lưu ý"
        size="small"
      >
        <div style={{ fontSize: 13, color: '#666' }}>
          <p>• <strong>Giấy báo nợ:</strong> Chứng từ xác nhận giao dịch trích nợ từ tài khoản của bạn</p>
          <p>• <strong>Tải tối đa:</strong> 10 giấy báo nợ/giấy báo có trong vòng 90 ngày</p>
          <p>• <strong>Định dạng:</strong> Hỗ trợ tải về dạng PDF (từng GD) hoặc Excel/PDF (bảng kê nhiều GD)</p>
          <p>• <strong>Giá trị pháp lý:</strong> Giấy báo nợ có giá trị pháp lý để làm chứng từ kế toán</p>
        </div>
      </Card>
    </AppLayout>
  );
};

export default TransferVouchers;
