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
  InputNumber,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UnorderedListOutlined,
  DownloadOutlined,
  SearchOutlined,
  FilterOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import { mockFutureTransfers } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { FutureTransfer } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const FutureTransferManagement: React.FC = () => {
  const [searchBatchCode, setSearchBatchCode] = useState('');
  const [searchBeneficiary, setSearchBeneficiary] = useState('');
  const [searchAccount, setSearchAccount] = useState('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [amountRange, setAmountRange] = useState<{ min?: number; max?: number }>({});
  const [filterStatus, setFilterStatus] = useState<string>('approved');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm');
  };

  const filteredTransfers = useMemo(() => {
    let filtered = [...mockFutureTransfers];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(t => t.status === filterStatus);
    }

    // Filter by batch code
    if (searchBatchCode) {
      filtered = filtered.filter(t =>
        t.batchCode?.toLowerCase().includes(searchBatchCode.toLowerCase())
      );
    }

    // Filter by beneficiary
    if (searchBeneficiary) {
      filtered = filtered.filter(t =>
        t.beneficiary?.accountName.toLowerCase().includes(searchBeneficiary.toLowerCase()) ||
        t.beneficiary?.accountNumber.includes(searchBeneficiary) ||
        t.batchName?.toLowerCase().includes(searchBeneficiary.toLowerCase())
      );
    }

    // Filter by account
    if (searchAccount !== 'all') {
      filtered = filtered.filter(t => t.fromAccount === searchAccount);
    }

    // Filter by execution date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter(t => {
        const execDate = dayjs(t.executionDate);
        return execDate.isAfter(dateRange[0]) && execDate.isBefore(dateRange[1]);
      });
    }

    // Filter by amount range
    if (amountRange.min !== undefined) {
      filtered = filtered.filter(t => t.amount >= amountRange.min!);
    }
    if (amountRange.max !== undefined) {
      filtered = filtered.filter(t => t.amount <= amountRange.max!);
    }

    return filtered;
  }, [mockFutureTransfers, searchBatchCode, searchBeneficiary, searchAccount, dateRange, amountRange, filterStatus]);

  const handleExport = () => {
    if (filteredTransfers.length === 0) {
      message.warning('Không có giao dịch nào để xuất!');
      return;
    }

    message.success(`Đang xuất ${filteredTransfers.length} giao dịch...`);
    setTimeout(() => {
      message.info(`Tải xuống thành công: GiaoDichTuongLai_${dayjs().format('YYYYMMDD')}.xlsx`);
    }, 1000);
  };

  const handleViewDetail = (record: FutureTransfer) => {
    message.info(`Đang xem chi tiết giao dịch ${record.id}...`);
  };

  const columns: ColumnsType<FutureTransfer> = [
    {
      title: 'Mã GD',
      dataIndex: 'id',
      key: 'id',
      width: 100,
      fixed: 'left',
      render: (id: string) => <Text strong>{id}</Text>,
    },
    {
      title: 'Loại',
      dataIndex: 'transferType',
      key: 'transferType',
      width: 120,
      render: (type: string) => (
        <Tag color={type === 'single' ? 'blue' : 'purple'}>
          {type === 'single' ? 'Theo món' : 'Theo lô'}
        </Tag>
      ),
    },
    {
      title: 'Mã lô',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 150,
      render: (code: string) => code || '-',
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 200,
      render: (content: string, record: FutureTransfer) => (
        <div>
          <div>{content}</div>
          {record.batchName && (
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.batchName} ({record.itemCount} GD)
            </Text>
          )}
        </div>
      ),
    },
    {
      title: 'Người nhận / Tài khoản thụ hưởng',
      dataIndex: 'beneficiary',
      key: 'beneficiary',
      width: 200,
      render: (beneficiary, record: FutureTransfer) => {
        if (beneficiary) {
          return (
            <div>
              <div>{beneficiary.accountName}</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {beneficiary.accountNumber}
              </Text>
              {beneficiary.bankName && (
                <div>
                  <Text type="secondary" style={{ fontSize: 11 }}>
                    {beneficiary.bankName}
                  </Text>
                </div>
              )}
            </div>
          );
        }
        if (record.batchName) {
          return <Text type="secondary">{record.batchName}</Text>;
        }
        return '-';
      },
    },
    {
      title: 'Tài khoản nguồn',
      dataIndex: 'fromAccount',
      key: 'fromAccount',
      width: 150,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#cf1322' }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Phí',
      dataIndex: 'feeAmount',
      key: 'feeAmount',
      width: 100,
      align: 'right',
      render: (fee: number) => formatCurrency(fee),
    },
    {
      title: 'Ngày thực hiện',
      dataIndex: 'executionDate',
      key: 'executionDate',
      width: 150,
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.executionDate).unix() - dayjs(b.executionDate).unix(),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          pending_approval: 'warning',
          approved: 'success',
          rejected: 'error',
          executed: 'default',
          cancelled: 'default',
        };
        const textMap: Record<string, string> = {
          pending_approval: 'Chờ duyệt',
          approved: 'Đã duyệt',
          rejected: 'Từ chối',
          executed: 'Đã thực hiện',
          cancelled: 'Đã hủy',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: 'Người duyệt',
      dataIndex: 'approvedBy',
      key: 'approvedBy',
      width: 120,
      render: (by: string) => by || '-',
    },
    {
      title: 'Ngày duyệt',
      dataIndex: 'approvedDate',
      key: 'approvedDate',
      width: 150,
      render: (date: string) => date ? formatDateTime(date) : '-',
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: FutureTransfer) => (
        <Button
          size="small"
          type="link"
          icon={<EyeOutlined />}
          onClick={() => handleViewDetail(record)}
        >
          Xem
        </Button>
      ),
    },
  ];

  const approvedCount = mockFutureTransfers.filter(t => t.status === 'approved').length;
  const executedCount = mockFutureTransfers.filter(t => t.status === 'executed').length;
  const totalAmount = filteredTransfers.reduce((sum, t) => sum + t.totalAmount, 0);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <UnorderedListOutlined style={{ marginRight: 12 }} />
          Quản lý giao dịch tương lai
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu và quản lý danh sách giao dịch tương lai đã phê duyệt
        </p>
      </div>

      {/* Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Đã duyệt</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
              {approvedCount}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Đã thực hiện</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {executedCount}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng giá trị (đã lọc)</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
              {formatCurrency(totalAmount)}
            </div>
          </div>
        </Space>
      </Card>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc & Tìm kiếm</>}
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
          <Space wrap>
            <Select
              style={{ width: 180 }}
              value={filterStatus}
              onChange={setFilterStatus}
              placeholder="Trạng thái"
            >
              <Select.Option value="all">Tất cả trạng thái</Select.Option>
              <Select.Option value="approved">Đã duyệt</Select.Option>
              <Select.Option value="executed">Đã thực hiện</Select.Option>
              <Select.Option value="rejected">Từ chối</Select.Option>
              <Select.Option value="cancelled">Đã hủy</Select.Option>
            </Select>

            <Select
              style={{ width: 250 }}
              value={searchAccount}
              onChange={setSearchAccount}
              placeholder="Tài khoản nguồn"
            >
              <Select.Option value="all">Tất cả tài khoản</Select.Option>
              <Select.Option value="0011234567890">0011234567890</Select.Option>
            </Select>

            <RangePicker
              value={dateRange}
              onChange={setDateRange}
              format="DD/MM/YYYY"
              placeholder={['Từ ngày thực hiện', 'Đến ngày thực hiện']}
            />
          </Space>

          <Space wrap>
            <Input
              placeholder="Tìm theo mã lô (VD: BATCH2025110001)"
              prefix={<SearchOutlined />}
              value={searchBatchCode}
              onChange={(e) => setSearchBatchCode(e.target.value)}
              style={{ width: 300 }}
              allowClear
            />

            <Input
              placeholder="Tìm theo tên/STK người nhận"
              prefix={<SearchOutlined />}
              value={searchBeneficiary}
              onChange={(e) => setSearchBeneficiary(e.target.value)}
              style={{ width: 280 }}
              allowClear
            />

            <InputNumber
              placeholder="Số tiền từ"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/,/g, '') as any}
              style={{ width: 150 }}
              onChange={(value) => setAmountRange(prev => ({ ...prev, min: value || undefined }))}
              value={amountRange.min}
            />

            <InputNumber
              placeholder="Số tiền đến"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value!.replace(/,/g, '') as any}
              style={{ width: 150 }}
              onChange={(value) => setAmountRange(prev => ({ ...prev, max: value || undefined }))}
              value={amountRange.max}
            />
          </Space>
        </Space>
      </Card>

      {/* Transaction Table */}
      <Card
        title={`Kết quả: ${filteredTransfers.length} giao dịch`}
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExport}
          >
            Xuất Excel (.xlsx)
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={filteredTransfers}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} giao dịch`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>
    </AppLayout>
  );
};

export default FutureTransferManagement;
