import React, { useState } from 'react';
import { Card, Table, Tag, Button, Typography, DatePicker, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { FileProtectOutlined, DownloadOutlined, EyeOutlined } from '@ant-design/icons';
import type { EInvoice } from '../../types';
import { mockEInvoices } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import dayjs from 'dayjs';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const EInvoices: React.FC = () => {
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);

  const formatCurrency = (amount: number, currency: string = 'VND') => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const handleDownload = (invoice: EInvoice) => {
    message.success(`Đang tải xuống hóa đơn ${invoice.invoiceNumber}...`);
    // Mock download
    setTimeout(() => {
      message.info(`Tải xuống hoàn tất: ${invoice.invoiceNumber}.pdf`);
    }, 1000);
  };

  const handleView = (invoice: EInvoice) => {
    message.info(`Đang mở hóa đơn ${invoice.invoiceNumber}...`);
    // Mock view - in real app would open PDF viewer
  };

  // Filter by date range
  const filteredData = dateRange && dateRange[0] && dateRange[1]
    ? mockEInvoices.filter(invoice => {
        const invDate = dayjs(invoice.invoiceDate);
        return invDate.isAfter(dateRange[0]) && invDate.isBefore(dateRange[1]);
      })
    : mockEInvoices;

  const columns: ColumnsType<EInvoice> = [
    {
      title: 'Số hóa đơn',
      dataIndex: 'invoiceNumber',
      key: 'invoiceNumber',
      width: 200,
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: 'Ngày phát hành',
      dataIndex: 'invoiceDate',
      key: 'invoiceDate',
      width: 150,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.invoiceDate).unix() - dayjs(b.invoiceDate).unix(),
      defaultSortOrder: 'descend',
    },
    {
      title: 'Loại giao dịch',
      dataIndex: 'transactionType',
      key: 'transactionType',
      ellipsis: true,
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 140,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 140,
      align: 'right',
      render: (amount: number, record: EInvoice) => (
        <span>{formatCurrency(amount, record.currency)}</span>
      ),
    },
    {
      title: 'Thuế',
      dataIndex: 'taxAmount',
      key: 'taxAmount',
      width: 120,
      align: 'right',
      render: (amount: number, record: EInvoice) => (
        <span>{formatCurrency(amount, record.currency)}</span>
      ),
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount: number, record: EInvoice) => (
        <strong style={{ color: '#1890ff' }}>
          {formatCurrency(amount, record.currency)}
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
        <Tag color={status === 'issued' ? 'success' : 'error'}>
          {status === 'issued' ? 'Đã phát hành' : 'Đã hủy'}
        </Tag>
      ),
      filters: [
        { text: 'Đã phát hành', value: 'issued' },
        { text: 'Đã hủy', value: 'cancelled' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_, record: EInvoice) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleView(record)}
          >
            Xem
          </Button>
          <Button
            type="link"
            size="small"
            icon={<DownloadOutlined />}
            onClick={() => handleDownload(record)}
            disabled={record.status === 'cancelled'}
          >
            Tải về
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <FileProtectOutlined style={{ marginRight: 12 }} />
          Hóa đơn điện tử
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu và tải xuống hóa đơn điện tử phát sinh từ các giao dịch tại OCB
        </p>
      </div>

      <Card
        title="Danh sách hóa đơn điện tử"
        extra={
          <Space>
            <span>Lọc theo thời gian:</span>
            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
            />
          </Space>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hóa đơn`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      <Card
        style={{ marginTop: 16 }}
        title="Thông tin hóa đơn điện tử"
        size="small"
      >
        <div style={{ fontSize: 13, color: '#666' }}>
          <p>• <strong>Hóa đơn điện tử:</strong> Được phát hành tự động khi khách hàng thực hiện giao dịch phát sinh phí tại OCB</p>
          <p>• <strong>Định dạng:</strong> Hóa đơn được lưu trữ ở định dạng PDF, có chữ ký số hợp lệ của OCB</p>
          <p>• <strong>Giá trị pháp lý:</strong> Hóa đơn điện tử có giá trị pháp lý như hóa đơn giấy theo quy định của pháp luật</p>
          <p>• <strong>Tra cứu:</strong> Khách hàng có thể tra cứu và tra soát hóa đơn trên Cổng thông tin của Tổng cục Thuế</p>
          <p>• <strong>Hủy hóa đơn:</strong> Hóa đơn đã hủy không thể tải về và không có giá trị pháp lý</p>
        </div>
      </Card>
    </AppLayout>
  );
};

export default EInvoices;
