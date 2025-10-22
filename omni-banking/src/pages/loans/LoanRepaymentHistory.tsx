import React, { useState, useMemo, useEffect } from 'react';
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
  Statistic,
  Row,
  Col,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  HistoryOutlined,
  DownloadOutlined,
  FilterOutlined,
  EyeOutlined,
  WarningOutlined,
} from '@ant-design/icons';
import { mockLoanRepayments, mockLoans } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { LoanRepayment } from '../../types';
import dayjs from 'dayjs';
import { useSearchParams } from 'react-router-dom';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const LoanRepaymentHistory: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [selectedLoan, setSelectedLoan] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedRepayment, setSelectedRepayment] = useState<LoanRepayment | null>(null);

  // Get loan from URL param if available
  useEffect(() => {
    const loanParam = searchParams.get('loan');
    if (loanParam) {
      setSelectedLoan(loanParam);
    }
  }, [searchParams]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  const getStatusTag = (status: string) => {
    const statusMap: Record<string, { color: string; text: string }> = {
      completed: { color: 'success', text: 'Thành công' },
      pending: { color: 'warning', text: 'Chờ xử lý' },
      failed: { color: 'error', text: 'Thất bại' },
    };
    const s = statusMap[status] || { color: 'default', text: status };
    return <Tag color={s.color}>{s.text}</Tag>;
  };

  const getPaymentMethodTag = (method: string) => {
    const methodMap: Record<string, { color: string; text: string }> = {
      auto_debit: { color: 'blue', text: 'Tự động trích nợ' },
      manual: { color: 'orange', text: 'Trả thủ công' },
    };
    const m = methodMap[method] || { color: 'default', text: method };
    return <Tag color={m.color}>{m.text}</Tag>;
  };

  const filteredRepayments = useMemo(() => {
    let filtered = [...mockLoanRepayments];

    // Filter by loan
    if (selectedLoan !== 'all') {
      filtered = filtered.filter((rep) => rep.loanNumber === selectedLoan);
    }

    // Filter by date range
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((rep) => {
        const repDate = dayjs(rep.paymentDate);
        return repDate.isAfter(dateRange[0]) && repDate.isBefore(dateRange[1]);
      });
    }

    return filtered.sort((a, b) =>
      dayjs(b.paymentDate).unix() - dayjs(a.paymentDate).unix()
    );
  }, [selectedLoan, dateRange]);

  const handleViewDetail = (record: LoanRepayment) => {
    setSelectedRepayment(record);
    setDetailModalVisible(true);
  };

  const handleExportPDF = () => {
    if (filteredRepayments.length === 0) {
      return;
    }
    alert(`Đang xuất ${filteredRepayments.length} giao dịch ra file PDF...`);
  };

  const columns: ColumnsType<LoanRepayment> = [
    {
      title: 'Ngày trả nợ',
      dataIndex: 'paymentDate',
      key: 'paymentDate',
      width: 160,
      fixed: 'left',
      render: (date: string) => formatDateTime(date),
      sorter: (a, b) => dayjs(a.paymentDate).unix() - dayjs(b.paymentDate).unix(),
    },
    {
      title: 'Số hợp đồng',
      dataIndex: 'loanNumber',
      key: 'loanNumber',
      width: 150,
      render: (number: string) => <Text strong>{number}</Text>,
    },
    {
      title: 'Loại vay',
      dataIndex: 'loanTypeName',
      key: 'loanTypeName',
      width: 130,
    },
    {
      title: 'Tiền gốc',
      dataIndex: 'principalAmount',
      key: 'principalAmount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <Text style={{ color: '#666' }}>{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Tiền lãi',
      dataIndex: 'interestAmount',
      key: 'interestAmount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <Text style={{ color: '#fa8c16' }}>{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Tiền phạt',
      dataIndex: 'penaltyAmount',
      key: 'penaltyAmount',
      width: 110,
      align: 'right',
      render: (amount: number) => {
        if (amount === 0) return '-';
        return (
          <Text strong style={{ color: '#ff4d4f' }}>
            {formatCurrency(amount)}
          </Text>
        );
      },
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 140,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff', fontSize: 14 }}>
          {formatCurrency(amount)}
        </Text>
      ),
      sorter: (a, b) => a.totalAmount - b.totalAmount,
    },
    {
      title: 'Dư nợ còn lại',
      dataIndex: 'outstandingBalance',
      key: 'outstandingBalance',
      width: 140,
      align: 'right',
      render: (amount: number) => (
        <Text style={{ color: '#52c41a' }}>{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Phương thức',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      width: 150,
      render: (method: string) => getPaymentMethodTag(method),
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
      render: (_: any, record: LoanRepayment) => (
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
    const totalPrincipal = filteredRepayments.reduce((sum, rep) => sum + rep.principalAmount, 0);
    const totalInterest = filteredRepayments.reduce((sum, rep) => sum + rep.interestAmount, 0);
    const totalPenalty = filteredRepayments.reduce((sum, rep) => sum + rep.penaltyAmount, 0);
    const totalPaid = filteredRepayments.reduce((sum, rep) => sum + rep.totalAmount, 0);
    return {
      count: filteredRepayments.length,
      totalPrincipal,
      totalInterest,
      totalPenalty,
      totalPaid,
    };
  }, [filteredRepayments]);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <HistoryOutlined style={{ marginRight: 12 }} />
          Lịch sử trả nợ vay
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Xem lịch sử các kỳ trả nợ và chi tiết từng giao dịch trả nợ
        </p>
      </div>

      <Alert
        message="Về lịch sử trả nợ"
        description={
          <div>
            <p>• Hiển thị tất cả các lần trả nợ đã thực hiện (gốc, lãi, phạt nếu có)</p>
            <p>• Theo dõi số dư nợ còn lại sau mỗi lần trả</p>
            <p>• Kiểm tra phương thức trả nợ (tự động trích nợ hoặc trả thủ công)</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Statistic
              title="Tổng số lần trả"
              value={statistics.count}
              valueStyle={{ color: '#1890ff' }}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Tổng tiền gốc"
              value={statistics.totalPrincipal}
              valueStyle={{ color: '#666', fontSize: 20 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Tổng tiền lãi"
              value={statistics.totalInterest}
              valueStyle={{ color: '#fa8c16', fontSize: 20 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
          <Col span={6}>
            <Statistic
              title="Tổng tiền đã trả"
              value={statistics.totalPaid}
              valueStyle={{ color: '#52c41a', fontSize: 20 }}
              formatter={(value) => formatCurrency(Number(value))}
            />
          </Col>
        </Row>
        {statistics.totalPenalty > 0 && (
          <Alert
            message={
              <span>
                <WarningOutlined /> Tổng tiền phạt: <Text strong style={{ color: '#ff4d4f' }}>{formatCurrency(statistics.totalPenalty)}</Text>
              </span>
            }
            type="warning"
            showIcon={false}
            style={{ marginTop: 16 }}
          />
        )}
      </Card>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc & Tìm kiếm</>}
        extra={
          <Button
            type="primary"
            icon={<DownloadOutlined />}
            onClick={handleExportPDF}
            disabled={filteredRepayments.length === 0}
          >
            Xuất PDF
          </Button>
        }
        style={{ marginBottom: 16 }}
      >
        <Space wrap>
          <Select
            style={{ width: 300 }}
            value={selectedLoan}
            onChange={setSelectedLoan}
            placeholder="Chọn khoản vay"
          >
            <Select.Option value="all">Tất cả khoản vay</Select.Option>
            {mockLoans.map((loan) => (
              <Select.Option key={loan.id} value={loan.loanNumber}>
                {loan.loanNumber} - {loan.loanTypeName}
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

      {/* Repayment Table */}
      <Card title={`Lịch sử: ${filteredRepayments.length} lần trả nợ`}>
        <Table
          columns={columns}
          dataSource={filteredRepayments}
          rowKey="id"
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} lần trả nợ`,
          }}
          scroll={{ x: 1600 }}
          summary={(pageData) => {
            const pagePrincipal = pageData.reduce((sum, rep) => sum + rep.principalAmount, 0);
            const pageInterest = pageData.reduce((sum, rep) => sum + rep.interestAmount, 0);
            const pagePenalty = pageData.reduce((sum, rep) => sum + rep.penaltyAmount, 0);
            const pageTotal = pageData.reduce((sum, rep) => sum + rep.totalAmount, 0);
            return (
              <Table.Summary fixed>
                <Table.Summary.Row style={{ backgroundColor: '#fafafa' }}>
                  <Table.Summary.Cell index={0} colSpan={3} align="right">
                    <Text strong>Tổng trang này:</Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={3} align="right">
                    <Text strong style={{ color: '#666' }}>
                      {formatCurrency(pagePrincipal)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={4} align="right">
                    <Text strong style={{ color: '#fa8c16' }}>
                      {formatCurrency(pageInterest)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={5} align="right">
                    {pagePenalty > 0 ? (
                      <Text strong style={{ color: '#ff4d4f' }}>
                        {formatCurrency(pagePenalty)}
                      </Text>
                    ) : '-'}
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={6} align="right">
                    <Text strong style={{ color: '#1890ff', fontSize: 14 }}>
                      {formatCurrency(pageTotal)}
                    </Text>
                  </Table.Summary.Cell>
                  <Table.Summary.Cell index={7} colSpan={4} />
                </Table.Summary.Row>
              </Table.Summary>
            );
          }}
        />
      </Card>

      {/* Detail Modal */}
      <Modal
        title="Chi tiết trả nợ"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedRepayment && (
          <>
            {selectedRepayment.penaltyAmount > 0 && (
              <Alert
                message="Giao dịch có tiền phạt"
                description="Lần trả nợ này có phát sinh tiền phạt do trả chậm"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />
            )}
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Mã tham chiếu">
                <Text strong>{selectedRepayment.referenceNumber}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số hợp đồng vay">
                {selectedRepayment.loanNumber}
              </Descriptions.Item>
              <Descriptions.Item label="Loại vay">
                {selectedRepayment.loanTypeName}
              </Descriptions.Item>
              <Descriptions.Item label="Ngày trả nợ">
                {formatDateTime(selectedRepayment.paymentDate)}
              </Descriptions.Item>
              <Descriptions.Item label="Tiền gốc">
                <Text style={{ fontSize: 16, color: '#666' }}>
                  {formatCurrency(selectedRepayment.principalAmount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tiền lãi">
                <Text style={{ fontSize: 16, color: '#fa8c16' }}>
                  {formatCurrency(selectedRepayment.interestAmount)}
                </Text>
              </Descriptions.Item>
              {selectedRepayment.penaltyAmount > 0 && (
                <Descriptions.Item label="Tiền phạt">
                  <Text strong style={{ fontSize: 16, color: '#ff4d4f' }}>
                    {formatCurrency(selectedRepayment.penaltyAmount)}
                  </Text>
                </Descriptions.Item>
              )}
              <Descriptions.Item label="Tổng tiền đã trả">
                <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                  {formatCurrency(selectedRepayment.totalAmount)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số dư nợ còn lại sau khi trả">
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {formatCurrency(selectedRepayment.outstandingBalance)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Phương thức trả nợ">
                {getPaymentMethodTag(selectedRepayment.paymentMethod)}
              </Descriptions.Item>
              <Descriptions.Item label="Trạng thái">
                {getStatusTag(selectedRepayment.status)}
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default LoanRepaymentHistory;
