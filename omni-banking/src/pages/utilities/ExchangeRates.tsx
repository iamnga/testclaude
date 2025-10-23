import React, { useMemo } from 'react';
import {
  Card,
  Table,
  Typography,
  Alert,
  Space,
  Tag,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  DollarOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import { mockExchangeRates } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { ExchangeRate } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ExchangeRates: React.FC = () => {
  const formatRate = (rate: number, currency: string) => {
    // For JPY and some currencies, no decimal places
    if (['JPY', 'KRW', 'VND'].includes(currency)) {
      return new Intl.NumberFormat('vi-VN').format(rate);
    }
    return new Intl.NumberFormat('vi-VN').format(rate);
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const calculateSpread = (buyRate: number, sellRate: number) => {
    return sellRate - buyRate;
  };

  const calculateSpreadPercent = (buyRate: number, sellRate: number) => {
    return (((sellRate - buyRate) / buyRate) * 100).toFixed(2);
  };

  const columns: ColumnsType<ExchangeRate> = [
    {
      title: 'Ngoại tệ',
      key: 'currency',
      width: 180,
      fixed: 'left',
      render: (_: any, record: ExchangeRate) => (
        <div>
          <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>
            {record.currency}
          </Tag>
          <div style={{ marginTop: 4 }}>
            <Text type="secondary">{record.currencyName}</Text>
          </div>
        </div>
      ),
    },
    {
      title: (
        <div>
          <ArrowDownOutlined style={{ color: '#52c41a', marginRight: 4 }} />
          Ngân hàng MUA
        </div>
      ),
      dataIndex: 'buyRate',
      key: 'buyRate',
      width: 160,
      align: 'right',
      render: (rate: number, record: ExchangeRate) => (
        <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
          {formatRate(rate, record.currency)}
        </Text>
      ),
    },
    {
      title: (
        <div>
          <ArrowUpOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
          Ngân hàng BÁN
        </div>
      ),
      dataIndex: 'sellRate',
      key: 'sellRate',
      width: 160,
      align: 'right',
      render: (rate: number, record: ExchangeRate) => (
        <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
          {formatRate(rate, record.currency)}
        </Text>
      ),
    },
    {
      title: (
        <div>
          <SwapOutlined style={{ color: '#1890ff', marginRight: 4 }} />
          Chuyển khoản
        </div>
      ),
      dataIndex: 'transferRate',
      key: 'transferRate',
      width: 160,
      align: 'right',
      render: (rate: number, record: ExchangeRate) => (
        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
          {formatRate(rate, record.currency)}
        </Text>
      ),
    },
    {
      title: 'Chênh lệch',
      key: 'spread',
      width: 150,
      align: 'right',
      render: (_: any, record: ExchangeRate) => (
        <div>
          <Text style={{ fontSize: 14 }}>
            {formatRate(calculateSpread(record.buyRate, record.sellRate), record.currency)}
          </Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ({calculateSpreadPercent(record.buyRate, record.sellRate)}%)
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: 'Cập nhật',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 150,
      render: (date: string) => (
        <Text type="secondary">{formatDateTime(date)}</Text>
      ),
    },
  ];

  const lastUpdated = useMemo(() => {
    if (mockExchangeRates.length === 0) return '';
    return mockExchangeRates[0].lastUpdated;
  }, []);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <DollarOutlined style={{ marginRight: 12 }} />
          Tỷ giá ngoại tệ
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Xem tỷ giá ngoại tệ mới nhất
        </p>
      </div>

      <Alert
        message={
          <span>
            <strong>Cập nhật lúc:</strong> {formatDateTime(lastUpdated)}
          </span>
        }
        description={
          <div>
            <p>• <strong>Ngân hàng MUA</strong>: Tỷ giá ngân hàng mua ngoại tệ từ khách hàng (bán ngoại tệ)</p>
            <p>• <strong>Ngân hàng BÁN</strong>: Tỷ giá ngân hàng bán ngoại tệ cho khách hàng (mua ngoại tệ)</p>
            <p>• <strong>Chuyển khoản</strong>: Tỷ giá áp dụng cho chuyển khoản ngoại tệ</p>
            <p style={{ marginBottom: 0 }}>• Tỷ giá được cập nhật liên tục trong giờ làm việc</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Popular currencies */}
      <Card title="Ngoại tệ phổ biến" style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', flexWrap: 'wrap' }}>
          {mockExchangeRates.slice(0, 4).map((rate) => (
            <Card.Grid
              key={rate.currency}
              hoverable={false}
              style={{ width: '24%', textAlign: 'center', boxShadow: 'none' }}
            >
              <Tag color="blue" style={{ fontSize: 16, padding: '6px 16px', marginBottom: 8 }}>
                {rate.currency}
              </Tag>
              <div style={{ fontSize: 12, color: '#666', marginBottom: 12 }}>
                {rate.currencyName}
              </div>
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Mua: </Text>
                  <Text strong style={{ color: '#52c41a' }}>
                    {formatRate(rate.buyRate, rate.currency)}
                  </Text>
                </div>
                <div>
                  <Text type="secondary" style={{ fontSize: 12 }}>Bán: </Text>
                  <Text strong style={{ color: '#ff4d4f' }}>
                    {formatRate(rate.sellRate, rate.currency)}
                  </Text>
                </div>
              </Space>
            </Card.Grid>
          ))}
        </Space>
      </Card>

      {/* Full table */}
      <Card title={`Bảng tỷ giá: ${mockExchangeRates.length} loại ngoại tệ`}>
        <Table
          columns={columns}
          dataSource={mockExchangeRates}
          rowKey="currency"
          pagination={false}
          scroll={{ x: 1000 }}
        />

        <Alert
          message="Lưu ý"
          description="Tỷ giá chỉ mang tính chất tham khảo. Tỷ giá thực tế có thể thay đổi theo thời điểm giao dịch. Vui lòng liên hệ chi nhánh gần nhất để biết tỷ giá chính xác."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>
    </AppLayout>
  );
};

export default ExchangeRates;
