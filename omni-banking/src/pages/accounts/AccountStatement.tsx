import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Input,
  Select,
  DatePicker,
  Button,
  Space,
  Tag,
  Typography,
  Row,
  Col,
  Statistic,
  message,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  FileSearchOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import type { Transaction } from '../../types';
import { mockTransactions } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const AccountStatement: React.FC = () => {
  const { user } = useAuth();
  const [searchText, setSearchText] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [transactionType, setTransactionType] = useState<string>('all');
  const [amountRange, setAmountRange] = useState<{ min?: number; max?: number }>({});

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = mockTransactions;

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

    // Filter by transaction type
    if (transactionType !== 'all') {
      filtered = filtered.filter(t => t.type === transactionType);
    }

    // Filter by amount range
    if (amountRange.min !== undefined) {
      filtered = filtered.filter(t => t.amount >= amountRange.min!);
    }
    if (amountRange.max !== undefined) {
      filtered = filtered.filter(t => t.amount <= amountRange.max!);
    }

    return filtered;
  }, [searchText, selectedAccount, dateRange, transactionType, amountRange]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const credit = filteredTransactions
      .filter(t => t.type === 'credit')
      .reduce((sum, t) => sum + t.amount, 0);
    const debit = filteredTransactions
      .filter(t => t.type === 'debit')
      .reduce((sum, t) => sum + t.amount, 0);
    return { credit, debit, total: credit - debit };
  }, [filteredTransactions]);

  const columns: ColumnsType<Transaction> = [
    {
      title: 'Ngày GD',
      dataIndex: 'date',
      key: 'date',
      width: 160,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.date).unix() - dayjs(b.date).unix(),
    },
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      width: 120,
    },
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      align: 'center',
      render: (type: string) => (
        <Tag
          color={type === 'credit' ? 'green' : 'red'}
          icon={type === 'credit' ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
        >
          {type === 'credit' ? 'Thu' : 'Chi'}
        </Tag>
      ),
    },
    {
      title: 'Diễn giải',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 180,
      align: 'right',
      render: (amount: number, record: Transaction) => (
        <strong style={{ color: record.type === 'credit' ? '#3f8600' : '#cf1322' }}>
          {record.type === 'credit' ? '+' : '-'}
          {formatCurrency(amount, record.currency)}
        </strong>
      ),
      sorter: (a, b) => a.amount - b.amount,
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
  ];

  const handleExport = (format: 'xlsx' | 'xls' | 'pdf') => {
    message.success(`Đang tải xuống sao kê định dạng ${format.toUpperCase()}...`);
    // Mock export - in real app would generate and download file
    setTimeout(() => {
      message.info(`Tải xuống hoàn tất: statement_${dayjs().format('YYYYMMDD')}.${format}`);
    }, 1000);
  };

  const handleReset = () => {
    setSearchText('');
    setSelectedAccount('all');
    setDateRange(null);
    setTransactionType('all');
    setAmountRange({});
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileSearchOutlined style={{ marginRight: 12 }} />
          Sao kê tài khoản
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Truy vấn sao kê và tải xuống dữ liệu giao dịch trong 90 ngày gần nhất
        </p>
      </div>

      {/* Statistics */}
      <Row gutter={16} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng thu"
              value={statistics.credit}
              precision={0}
              valueStyle={{ color: '#3f8600' }}
              prefix={<ArrowUpOutlined />}
              suffix="VND"
              formatter={(value) => new Intl.NumberFormat('vi-VN').format(value as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Tổng chi"
              value={statistics.debit}
              precision={0}
              valueStyle={{ color: '#cf1322' }}
              prefix={<ArrowDownOutlined />}
              suffix="VND"
              formatter={(value) => new Intl.NumberFormat('vi-VN').format(value as number)}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Chênh lệch"
              value={statistics.total}
              precision={0}
              valueStyle={{ color: statistics.total >= 0 ? '#3f8600' : '#cf1322' }}
              suffix="VND"
              formatter={(value) => new Intl.NumberFormat('vi-VN').format(value as number)}
            />
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card title={<><FilterOutlined /> Tìm kiếm nâng cao</>} style={{ marginBottom: 16 }}>
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={8}>
              <label>Tài khoản:</label>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={selectedAccount}
                onChange={setSelectedAccount}
              >
                <Select.Option value="all">Tất cả tài khoản</Select.Option>
                {user?.accounts.map(acc => (
                  <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                    {acc.accountNumber} - {acc.accountName}
                  </Select.Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <label>Loại giao dịch:</label>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                value={transactionType}
                onChange={setTransactionType}
              >
                <Select.Option value="all">Tất cả</Select.Option>
                <Select.Option value="credit">Thu</Select.Option>
                <Select.Option value="debit">Chi</Select.Option>
              </Select>
            </Col>
            <Col xs={24} sm={12} lg={8}>
              <label>Khoảng thời gian:</label>
              <RangePicker
                style={{ width: '100%', marginTop: 8 }}
                value={dateRange}
                onChange={setDateRange}
                format="DD/MM/YYYY"
              />
            </Col>
          </Row>
          <Row gutter={16}>
            <Col xs={24} sm={12} lg={12}>
              <label>Từ khóa:</label>
              <Input
                style={{ marginTop: 8 }}
                placeholder="Tìm theo mã GD hoặc diễn giải"
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
              />
            </Col>
            <Col xs={24} sm={6} lg={6}>
              <label>Số tiền từ:</label>
              <Input
                style={{ marginTop: 8 }}
                type="number"
                placeholder="Tối thiểu"
                value={amountRange.min}
                onChange={(e) => setAmountRange({ ...amountRange, min: Number(e.target.value) || undefined })}
              />
            </Col>
            <Col xs={24} sm={6} lg={6}>
              <label>Số tiền đến:</label>
              <Input
                style={{ marginTop: 8 }}
                type="number"
                placeholder="Tối đa"
                value={amountRange.max}
                onChange={(e) => setAmountRange({ ...amountRange, max: Number(e.target.value) || undefined })}
              />
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button onClick={handleReset}>Đặt lại bộ lọc</Button>
            </Col>
          </Row>
        </Space>
      </Card>

      {/* Transaction Table */}
      <Card
        title={`Kết quả: ${filteredTransactions.length} giao dịch`}
        extra={
          <Space>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={() => handleExport('xlsx')}
            >
              Xuất Excel
            </Button>
            <Button
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
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>
    </AppLayout>
  );
};

export default AccountStatement;
