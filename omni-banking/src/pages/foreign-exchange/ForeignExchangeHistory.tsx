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
  Alert,
  Descriptions,
  Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  HistoryOutlined,
  DownloadOutlined,
  FilterOutlined,
  EyeOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { mockForeignExchangeTransactions } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { ForeignExchangeTransaction } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const ForeignExchangeHistory: React.FC = () => {
  const [currencyFilter, setCurrencyFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ForeignExchangeTransaction | null>(null);

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    }
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      completed: { color: 'success', text: 'Thành công' },
      pending: { color: 'warning', text: 'Đang xử lý' },
      failed: { color: 'error', text: 'Thất bại' },
    };
    const s = statusMap[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const currencies = useMemo(() => {
    return Array.from(new Set(mockForeignExchangeTransactions.map((tx) => tx.fromCurrency)));
  }, []);

  const filteredTransactions = useMemo(() => {
    let filtered = [...mockForeignExchangeTransactions];

    // Filter by currency
    if (currencyFilter !== 'all') {
      filtered = filtered.filter((tx) => tx.fromCurrency === currencyFilter);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((tx) => {
        const txDate = dayjs(tx.transactionDate);
        return txDate.isAfter(dateRange[0]) && txDate.isBefore(dateRange[1]);
      });
    }

    return filtered.sort((a, b) =>
      dayjs(b.transactionDate).unix() - dayjs(a.transactionDate).unix()
    );
  }, [currencyFilter, dateRange]);

  const handleViewDetail = (record: ForeignExchangeTransaction) => {
    setSelectedTransaction(record);
    setDetailModalVisible(true);
  };

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      return;
    }
    alert(`Đang xuất ${filteredTransactions.length} giao dịch ra file Excel...`);
  };

  const columns: ColumnsType<ForeignExchangeTransaction> = [
    {
      title: 'Thời gian',
      dataIndex: 'transactionDate',
      key: 'transactionDate',
      width: 160,
      fixed: 'left',
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.transactionDate).unix() - dayjs(b.transactionDate).unix(),
    },
    {
      title: 'Mã giao dịch',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 160,
      render: (ref: string) => <Text strong>{ref}</Text>,
    },
    {
      title: 'Ngoại tệ bán',
      key: 'fromCurrency',
      width: 120,
      render: (_: any, record: ForeignExchangeTransaction) => (
        <Tag color="blue" style={{ fontSize: 13 }}>
          {record.fromCurrency}
        </Tag>
      ),
    },
    {
      title: 'Số lượng',
      dataIndex: 'fromAmount',
      key: 'fromAmount',
      width: 130,
      align: 'right',
      render: (amount: number, record: ForeignExchangeTransaction) => (
        <Text style={{ fontSize: 14 }}>
          {formatCurrency(amount, record.fromCurrency)}
        </Text>
      ),
    },
    {
      title: 'Tỷ giá',
      dataIndex: 'exchangeRate',
      key: 'exchangeRate',
      width: 130,
      align: 'right',
      render: (rate: number) => (
        <Text style={{ color: '#1890ff', fontSize: 14 }}>
          {formatCurrency(rate, 'VND')}
        </Text>
      ),
    },
    {
      title: 'Số tiền nhận được',
      dataIndex: 'toAmount',
      key: 'toAmount',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: 15 }}>
          {formatCurrency(amount, 'VND')}
        </Text>
      ),
      sorter: (a, b) => a.toAmount - b.toAmount,
    },
    {
      title: 'TK ngoại tệ',
      dataIndex: 'fromAccount',
      key: 'fromAccount',
      width: 140,
    },
    {
      title: 'TK VND nhận',
      dataIndex: 'toAccount',
      key: 'toAccount',
      width: 140,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: ForeignExchangeTransaction) => (
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

  const statistics = useMemo(() => {
    const totalVND = filteredTransactions.reduce((sum, tx) => sum + tx.toAmount, 0);
    return {
      count: filteredTransactions.length,
      totalVND,
    };
  }, [filteredTransactions]);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <HistoryOutlined style={{ marginRight: 12 }} />
          Lịch sử giao dịch ngoại tệ
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu lịch sử giao dịch bán ngoại tệ
        </p>
      </div>

      <Alert
        message="Về lịch sử giao dịch"
        description={
          <div>
            <p>• Hiển thị tất cả giao dịch bán ngoại tệ đã thực hiện</p>
            <p>• Lọc theo loại ngoại tệ và khoảng thời gian</p>
            <p style={{ marginBottom: 0 }}>• Xuất báo cáo Excel để đối soát</p>
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
            <div style={{ fontSize: 14, color: '#666' }}>Tổng số giao dịch</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {statistics.count}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng tiền VND nhận được</div>
            <div style={{ fontSize: 22, fontWeight: 'bold', color: '#52c41a' }}>
              {formatCurrency(statistics.totalVND, 'VND')}
            </div>
          </div>
        </Space>
      </Card>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc & Tìm kiếm</>}
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportExcel}
            disabled={filteredTransactions.length === 0}
          >
            Xuất Excel
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <Select
            style={{ width: 200 }}
            value={currencyFilter}
            onChange={setCurrencyFilter}
            placeholder="Loại ngoại tệ"
          >
            <Select.Option value="all">Tất cả ngoại tệ</Select.Option>
            {currencies.map((currency) => (
              <Select.Option key={currency} value={currency}>
                {currency}
              </Select.Option>
            ))}
          </Select>

          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
          />
        </Space>
      </Card>

      {/* Transactions Table */}
      <Card title={`Danh sách: ${filteredTransactions.length} giao dịch`}>
        <Table
          columns={columns}
          dataSource={filteredTransactions}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1400 }}
          summary={(pageData) => {
            const pageTotal = pageData.reduce((sum, tx) => sum + tx.toAmount, 0);
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    <Text strong>Tổng trang này:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <Text strong style={{ color: '#52c41a', fontSize: 15 }}>
                      {formatCurrency(pageTotal, 'VND')}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} colSpan={4} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <span>
            <SwapOutlined style={{ marginRight: 8 }} />
            Chi tiết giao dịch
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedTransaction && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Mã giao dịch">
              <Text strong>{selectedTransaction.referenceNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian giao dịch">
              {formatDateTime(selectedTransaction.transactionDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngoại tệ bán">
              <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
                {selectedTransaction.fromCurrency}
              </Tag>
              <Text type="secondary" style={{ marginLeft: 8 }}>
                {selectedTransaction.fromCurrencyName}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số lượng ngoại tệ">
              <Text strong style={{ fontSize: 16 }}>
                {formatCurrency(selectedTransaction.fromAmount, selectedTransaction.fromCurrency)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tỷ giá áp dụng">
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                {formatCurrency(selectedTransaction.exchangeRate, 'VND')}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền VND nhận được">
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                {formatCurrency(selectedTransaction.toAmount, 'VND')}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tài khoản ngoại tệ">
              {selectedTransaction.fromAccount}
            </Descriptions.Item>
            <Descriptions.Item label="Tài khoản VND nhận">
              {selectedTransaction.toAccount}
            </Descriptions.Item>
            <Descriptions.Item label="Người thực hiện">
              {selectedTransaction.createdBy}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {getStatusTag(selectedTransaction.status)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </AppLayout>
  );
};

export default ForeignExchangeHistory;
