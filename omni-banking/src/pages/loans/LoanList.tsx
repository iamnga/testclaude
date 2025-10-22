import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Select,
  Modal,
  Descriptions,
  Alert,
  Progress,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  WalletOutlined,
  FilterOutlined,
  EyeOutlined,
  HistoryOutlined,
} from '@ant-design/icons';
import { mockLoans } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { Loan } from '../../types';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;

const LoanList: React.FC = () => {
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState<Loan | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: 'Đang hoạt động' },
      completed: { color: 'default', text: 'Đã hoàn thành' },
      overdue: { color: 'error', text: 'Quá hạn' },
      closed: { color: 'default', text: 'Đã đóng' },
    };
    const s = statusMap[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const filteredLoans = useMemo(() => {
    let filtered = [...mockLoans];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((loan) => loan.status === statusFilter);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((loan) => loan.loanType === typeFilter);
    }

    return filtered;
  }, [statusFilter, typeFilter]);

  const handleViewDetail = (record: Loan) => {
    setSelectedLoan(record);
    setDetailModalVisible(true);
  };

  const handleViewRepaymentHistory = (record: Loan) => {
    navigate(`/loans/repayment-history?loan=${record.loanNumber}`);
  };

  const calculateRepaidPercentage = (loan: Loan) => {
    const repaid = loan.principalAmount - loan.outstandingBalance;
    return Math.round((repaid / loan.principalAmount) * 100);
  };

  const columns: ColumnsType<Loan> = [
    {
      title: 'Số hợp đồng',
      dataIndex: 'loanNumber',
      key: 'loanNumber',
      width: 150,
      fixed: 'left',
      render: (number: string) => <Text strong>{number}</Text>,
    },
    {
      title: 'Loại vay',
      dataIndex: 'loanTypeName',
      key: 'loanTypeName',
      width: 140,
    },
    {
      title: 'Số tiền vay',
      dataIndex: 'principalAmount',
      key: 'principalAmount',
      width: 140,
      align: 'right',
      render: (amount: number) => (
        <Text style={{ color: '#666' }}>{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Số dư nợ',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      width: 140,
      align: 'right',
      render: (amount: number, record: Loan) => (
        <Text strong style={{ color: record.status === 'overdue' ? '#ff4d4f' : '#1890ff' }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.outstandingBalance - b.outstandingBalance,
    },
    {
      title: 'Đã trả',
      key: 'repaidPercentage',
      width: 120,
      render: (_: any, record: Loan) => {
        const percentage = calculateRepaidPercentage(record);
        return (
          <Progress
            percent={percentage}
            size="small"
            status={record.status === 'completed' ? 'success' : 'active'}
          />
        );
      },
    },
    {
      title: 'Lãi suất',
      dataIndex: 'interestRate',
      key: 'interestRate',
      width: 100,
      align: 'center',
      render: (rate: number) => <Text>{rate}%/năm</Text>,
    },
    {
      title: 'Kỳ hạn',
      dataIndex: 'term',
      key: 'term',
      width: 90,
      align: 'center',
      render: (term: number) => `${term} tháng`,
    },
    {
      title: 'Ngày đáo hạn',
      dataIndex: 'maturityDate',
      key: 'maturityDate',
      width: 120,
      render: (date: string) => formatDateTime(date),
    },
    {
      title: 'Trả kỳ sau',
      dataIndex: 'nextPaymentDate',
      key: 'nextPaymentDate',
      width: 120,
      render: (date: string | undefined, record: Loan) => {
        if (!date || record.status === 'completed') return '-';
        const isPast = dayjs(date).isBefore(dayjs());
        return (
          <Text type={isPast ? 'danger' : undefined}>
            {formatDateTime(date)}
          </Text>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 200,
      fixed: 'right',
      render: (_: any, record: Loan) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            size="small"
            type="link"
            icon={<HistoryOutlined />}
            onClick={() => handleViewRepaymentHistory(record)}
          >
            Lịch sử trả nợ
          </Button>
        </Space>
      ),
    },
  ];

  const statistics = useMemo(() => {
    const totalOutstanding = filteredLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0);
    const totalPrincipal = filteredLoans.reduce((sum, loan) => sum + loan.principalAmount, 0);
    const activeLoans = filteredLoans.filter((l) => l.status === 'active').length;
    const overdueLoans = filteredLoans.filter((l) => l.status === 'overdue').length;
    return {
      totalOutstanding,
      totalPrincipal,
      activeLoans,
      overdueLoans,
    };
  }, [filteredLoans]);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <WalletOutlined style={{ marginRight: 12 }} />
          Danh sách khoản vay
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Xem thông tin chi tiết các khoản vay và lịch sử trả nợ
        </p>
      </div>

      <Alert
        message="Về khoản vay"
        description={
          <div>
            <p>• Theo dõi số dư nợ còn lại và lịch trình trả nợ của từng khoản vay</p>
            <p>• Kiểm tra ngày trả nợ kế tiếp để đảm bảo không bị quá hạn</p>
            <p>• Xem lịch sử trả nợ chi tiết bằng cách nhấn vào "Lịch sử trả nợ"</p>
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
            <div style={{ fontSize: 14, color: '#666' }}>Tổng số khoản vay</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {filteredLoans.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Đang hoạt động</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
              {statistics.activeLoans}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Quá hạn</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#ff4d4f' }}>
              {statistics.overdueLoans}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng dư nợ</div>
            <div style={{ fontSize: 20, fontWeight: 'bold', color: '#fa8c16' }}>
              {formatCurrency(statistics.totalOutstanding)}
            </div>
          </div>
        </Space>
      </Card>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc</>}
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <Select
            style={{ width: 200 }}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Trạng thái"
          >
            <Select.Option value="all">Tất cả trạng thái</Select.Option>
            <Select.Option value="active">Đang hoạt động</Select.Option>
            <Select.Option value="overdue">Quá hạn</Select.Option>
            <Select.Option value="completed">Đã hoàn thành</Select.Option>
            <Select.Option value="closed">Đã đóng</Select.Option>
          </Select>

          <Select
            style={{ width: 200 }}
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Loại vay"
          >
            <Select.Option value="all">Tất cả loại vay</Select.Option>
            <Select.Option value="business">Vay kinh doanh</Select.Option>
            <Select.Option value="mortgage">Vay mua nhà</Select.Option>
            <Select.Option value="personal">Vay tiêu dùng</Select.Option>
            <Select.Option value="overdraft">Thấu chi</Select.Option>
          </Select>
        </Space>
      </Card>

      {/* Table */}
      <Card title={`Danh sách: ${filteredLoans.length} khoản vay`}>
        <Table
          columns={columns}
          dataSource={filteredLoans}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} khoản vay`,
          }}
          scroll={{ x: 1600 }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết khoản vay"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="history"
            type="primary"
            icon={<HistoryOutlined />}
            onClick={() => {
              setDetailModalVisible(false);
              if (selectedLoan) {
                handleViewRepaymentHistory(selectedLoan);
              }
            }}
          >
            Xem lịch sử trả nợ
          </Button>,
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedLoan && (
          <>
            <Alert
              message={`Đã trả ${calculateRepaidPercentage(selectedLoan)}% khoản vay`}
              type={selectedLoan.status === 'overdue' ? 'error' : 'info'}
              showIcon
              style={{ marginBottom: 16 }}
            />
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Số hợp đồng vay">
                <Text strong>{selectedLoan.loanNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Loại vay">{selectedLoan.loanTypeName}</Descriptions.Item>
              <Descriptions.Item label="Số tiền vay ban đầu">
                <Text strong style={{ fontSize: 16 }}>
                  {formatCurrency(selectedLoan.principalAmount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số dư nợ còn lại">
                <Text strong style={{ fontSize: 16, color: selectedLoan.status === 'overdue' ? '#ff4d4f' : '#1890ff' }}>
                  {formatCurrency(selectedLoan.outstandingBalance)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Đã trả">
                <Progress
                  percent={calculateRepaidPercentage(selectedLoan)}
                  status={selectedLoan.status === 'completed' ? 'success' : 'active'}
                />
              </Descriptions.Item>
              <Descriptions.Item label="Lãi suất">{selectedLoan.interestRate}%/năm</Descriptions.Item>
              <Descriptions.Item label="Kỳ hạn">{selectedLoan.term} tháng</Descriptions.Item>
              <Descriptions.Item label="Ngày giải ngân">
                {formatDateTime(selectedLoan.disbursementDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày đáo hạn">
                {formatDateTime(selectedLoan.maturityDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Tài khoản trả nợ">
                {selectedLoan.repaymentAccount}
              </Descriptions.Item>
              {selectedLoan.nextPaymentDate && (
                <>
                  <Descriptions.Item label="Ngày trả nợ kế tiếp">
                    <Text type={dayjs(selectedLoan.nextPaymentDate).isBefore(dayjs()) ? 'danger' : undefined}>
                      {formatDateTime(selectedLoan.nextPaymentDate)}
                    </Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tiền trả kỳ sau">
                    <Text strong style={{ fontSize: 16, color: '#fa8c16' }}>
                      {formatCurrency(selectedLoan.nextPaymentAmount || 0)}
                    </Text>
                  </Descriptions.Item>
                </>
              )}
              <Descriptions.Item label="Trạng thái">{getStatusTag(selectedLoan.status)}</Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default LoanList;
