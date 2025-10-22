import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  message,
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
} from '@ant-design/icons';
import { mockVirtualAccountTransactions, mockVirtualAccounts } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { VirtualAccountTransaction } from '../../types';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const VirtualAccountTransactions: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<VirtualAccountTransaction | null>(null);

  // Get account from URL param if available
  useEffect(() => {
    const accountParam = searchParams.get('account');
    if (accountParam) {
      setSelectedAccount(accountParam);
    }
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  const activeVirtualAccounts = useMemo(() => {
    return mockVirtualAccounts.filter((acc) => acc.status === 'active');
  }, []);

  const filteredTransactions = useMemo(() => {
    let filtered = [...mockVirtualAccountTransactions];

    // Filter by virtual account
    if (selectedAccount !== 'all') {
      filtered = filtered.filter((tx) => tx.virtualAccountNumber === selectedAccount);
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
  }, [selectedAccount, dateRange]);

  const handleExportExcel = () => {
    if (filteredTransactions.length === 0) {
      message.warning('Không có giao dịch nào để xuất!');
      return;
    }

    message.success(`Đang xuất ${filteredTransactions.length} giao dịch ra file Excel...`);
    setTimeout(() => {
      message.info(`Tải xuống thành công: VirtualAccountTransactions_${Date.now()}.xlsx`);
    }, 1000);
  };

  const handleViewDetail = (record: VirtualAccountTransaction) => {
    setSelectedTransaction(record);
    setDetailModalVisible(true);
  };

  const columns: ColumnsType<VirtualAccountTransaction> = [
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
      title: 'Số TK định danh',
      dataIndex: 'virtualAccountNumber',
      key: 'virtualAccountNumber',
      width: 150,
      render: (number: string) => <Text strong>{number}</Text>,
    },
    {
      title: 'Tên TK định danh',
      dataIndex: 'virtualAccountName',
      key: 'virtualAccountName',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Từ TK',
      dataIndex: 'fromAccount',
      key: 'fromAccount',
      width: 140,
    },
    {
      title: 'Tên người gửi',
      dataIndex: 'fromAccountName',
      key: 'fromAccountName',
      ellipsis: true,
      width: 180,
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
          +{formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.amount - b.amount,
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      width: 200,
    },
    {
      title: 'Mã tham chiếu',
      dataIndex: 'referenceNumber',
      key: 'referenceNumber',
      width: 160,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => <Tag color="success">Thành công</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 100,
      fixed: 'right',
      render: (_: any, record: VirtualAccountTransaction) => (
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
    const totalAmount = filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0);
    return {
      count: filteredTransactions.length,
      totalAmount,
    };
  }, [filteredTransactions]);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <HistoryOutlined style={{ marginRight: 12 }} />
          Lịch sử giao dịch tài khoản định danh
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu và xuất báo cáo giao dịch thu tiền qua tài khoản định danh
        </p>
      </div>

      <Alert
        message="Về giao dịch tài khoản định danh"
        description={
          <div>
            <p>• Chỉ hiển thị các giao dịch GHI CÓ (nhận tiền) vào tài khoản định danh</p>
            <p>• Tiền đã được tự động chuyển vào tài khoản thật liên kết</p>
            <p>• Có thể xuất báo cáo Excel để đối soát và báo cáo</p>
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
            <div style={{ fontSize: 14, color: '#666' }}>Tổng tiền nhận được</div>
            <div style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>
              {formatCurrency(statistics.totalAmount)}
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
            style={{ width: 350 }}
            value={selectedAccount}
            onChange={setSelectedAccount}
            placeholder="Chọn tài khoản định danh"
          >
            <Select.Option value="all">Tất cả tài khoản</Select.Option>
            {activeVirtualAccounts.map((acc) => (
              <Select.Option key={acc.id} value={acc.virtualAccountNumber}>
                {acc.virtualAccountNumber} - {acc.accountName}
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
          scroll={{ x: 1600 }}
          summary={(pageData) => {
            const pageTotal = pageData.reduce((sum, tx) => sum + tx.amount, 0);
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell index={0} colSpan={5} align="right">
                    <Text strong>Tổng trang này:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    <Text strong style={{ color: '#52c41a', fontSize: 14 }}>
                      +{formatCurrency(pageTotal)}
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
        title="Chi tiết giao dịch"
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
            <Descriptions.Item label="Mã tham chiếu">
              <Text strong>{selectedTransaction.referenceNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số TK định danh">
              {selectedTransaction.virtualAccountNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Tên TK định danh">
              {selectedTransaction.virtualAccountName}
            </Descriptions.Item>
            <Descriptions.Item label="Loại giao dịch">
              <Tag color="success">Ghi có (Nhận tiền)</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Từ tài khoản">
              {selectedTransaction.fromAccount}
            </Descriptions.Item>
            <Descriptions.Item label="Tên người gửi">
              {selectedTransaction.fromAccountName}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                +{formatCurrency(selectedTransaction.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Nội dung">
              {selectedTransaction.content}
            </Descriptions.Item>
            <Descriptions.Item label="Thời gian giao dịch">
              {formatDateTime(selectedTransaction.transactionDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color="success">Thành công</Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </AppLayout>
  );
};

export default VirtualAccountTransactions;
