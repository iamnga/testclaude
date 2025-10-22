import React, { useState } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  message,
  Modal,
  Form,
  Select,
  Descriptions,
  Alert,
  DatePicker,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  UnorderedListOutlined,
  EyeOutlined,
  DollarOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { mockDepositContracts } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { DepositContract } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const DepositList: React.FC = () => {
  const { user } = useAuth();
  const [selectedContract, setSelectedContract] = useState<DepositContract | null>(null);
  const [viewModalVisible, setViewModalVisible] = useState(false);
  const [settlementModalVisible, setSettlementModalVisible] = useState(false);
  const [settlementForm] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const formatDate = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY');
  };

  const calculateInterest = (contract: DepositContract) => {
    const monthlyRate = contract.interestRate / 100 / 12;
    const months = contract.term;
    return contract.amount * monthlyRate * months;
  };

  const calculateMaturityAmount = (contract: DepositContract) => {
    return contract.amount + calculateInterest(contract);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = dayjs(endDate);
    const now = dayjs();
    return end.diff(now, 'day');
  };

  const handleViewDetail = (record: DepositContract) => {
    setSelectedContract(record);
    setViewModalVisible(true);
  };

  const handleSettlement = (record: DepositContract) => {
    setSelectedContract(record);
    setSettlementModalVisible(true);
    settlementForm.resetFields();
  };

  const handleDownloadContract = (record: DepositContract) => {
    message.success(`Đang tải hợp đồng ${record.contractNumber}.pdf...`);
    setTimeout(() => {
      message.info(`Tải xuống thành công: HopDong_${record.contractNumber}.pdf`);
    }, 1000);
  };

  const handleSubmitSettlement = async () => {
    try {
      const values = await settlementForm.validateFields();
      setLoading(true);

      // Mock submit
      setTimeout(() => {
        setLoading(false);
        message.success('Tạo lệnh tất toán thành công!');
        setSettlementModalVisible(false);
        settlementForm.resetFields();
        setSelectedContract(null);
      }, 1500);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const columns: ColumnsType<DepositContract> = [
    {
      title: 'Số hợp đồng',
      dataIndex: 'contractNumber',
      key: 'contractNumber',
      render: (number: string) => <Text strong>{number}</Text>,
      width: 150,
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
      ellipsis: true,
    },
    {
      title: 'Số tiền gốc',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      width: 150,
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Lãi suất',
      dataIndex: 'interestRate',
      key: 'interestRate',
      align: 'center',
      width: 100,
      render: (rate: number) => (
        <Text strong style={{ color: '#52c41a' }}>
          {rate}%
        </Text>
      ),
    },
    {
      title: 'Kỳ hạn',
      dataIndex: 'term',
      key: 'term',
      align: 'center',
      width: 100,
      render: (term: number, record: DepositContract) => (
        `${term} ${record.termUnit === 'month' ? 'tháng' : 'năm'}`
      ),
    },
    {
      title: 'Ngày mở',
      dataIndex: 'startDate',
      key: 'startDate',
      width: 120,
      render: (date: string) => formatDate(date),
    },
    {
      title: 'Ngày đến hạn',
      dataIndex: 'endDate',
      key: 'endDate',
      width: 120,
      render: (date: string, record: DepositContract) => {
        const daysRemaining = getDaysRemaining(date);
        return (
          <div>
            <div>{formatDate(date)}</div>
            {record.status === 'active' && daysRemaining > 0 && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                Còn {daysRemaining} ngày
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 120,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          active: 'success',
          matured: 'warning',
          closed: 'default',
        };
        const textMap: Record<string, string> = {
          active: 'Đang hoạt động',
          matured: 'Đã đến hạn',
          closed: 'Đã đóng',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 280,
      fixed: 'right',
      render: (_: any, record: DepositContract) => (
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
            onClick={() => handleDownloadContract(record)}
          >
            Tải HĐ
          </Button>
          {(record.status === 'active' || record.status === 'matured') && (
            <Button
              size="small"
              type="link"
              danger
              icon={<DollarOutlined />}
              onClick={() => handleSettlement(record)}
            >
              Tất toán
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const activeContracts = mockDepositContracts.filter(c => c.status === 'active');
  const maturedContracts = mockDepositContracts.filter(c => c.status === 'matured');
  const totalPrincipal = activeContracts.reduce((sum, c) => sum + c.amount, 0);
  const totalExpectedInterest = activeContracts.reduce((sum, c) => sum + calculateInterest(c), 0);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <UnorderedListOutlined style={{ marginRight: 12 }} />
          Danh sách hợp đồng tiền gửi
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tra cứu và quản lý hợp đồng tiền gửi
        </p>
      </div>

      {/* Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng hợp đồng đang hoạt động</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {activeContracts.length}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng tiền gốc</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {formatCurrency(totalPrincipal)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Lãi dự kiến</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
              {formatCurrency(totalExpectedInterest)}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Hợp đồng đến hạn</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
              {maturedContracts.length}
            </div>
          </div>
        </Space>
      </Card>

      {/* Contract Table */}
      <Card
        title={`Danh sách hợp đồng (${mockDepositContracts.length})`}
        extra={
          <Button
            icon={<DownloadOutlined />}
            onClick={() => message.success('Đang xuất danh sách...')}
          >
            Xuất Excel
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={mockDepositContracts}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} hợp đồng`,
          }}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* View Detail Modal */}
      <Modal
        title="Chi tiết hợp đồng tiền gửi"
        open={viewModalVisible}
        onCancel={() => setViewModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setViewModalVisible(false)}>
            Đóng
          </Button>,
          <Button
            key="download"
            type="primary"
            icon={<DownloadOutlined />}
            onClick={() => selectedContract && handleDownloadContract(selectedContract)}
          >
            Tải hợp đồng
          </Button>,
        ]}
        width={700}
      >
        {selectedContract && (
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Số hợp đồng">
              <Text strong>{selectedContract.contractNumber}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Sản phẩm">
              {selectedContract.productName}
            </Descriptions.Item>
            <Descriptions.Item label="Tài khoản">
              {selectedContract.accountNumber}
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền gốc">
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                {formatCurrency(selectedContract.amount)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Lãi suất">
              <Text strong style={{ color: '#52c41a' }}>
                {selectedContract.interestRate}%/năm
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Kỳ hạn">
              {selectedContract.term} {selectedContract.termUnit === 'month' ? 'tháng' : 'năm'}
            </Descriptions.Item>
            <Descriptions.Item label="Phương thức trả lãi">
              {selectedContract.interestPaymentMethod === 'maturity' && 'Trả lãi cuối kỳ'}
              {selectedContract.interestPaymentMethod === 'monthly' && 'Trả lãi hàng tháng'}
              {selectedContract.interestPaymentMethod === 'upfront' && 'Trả lãi trước'}
            </Descriptions.Item>
            <Descriptions.Item label="Tự động gia hạn">
              {selectedContract.autoRenewal ? 'Có' : 'Không'}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày mở">
              {formatDate(selectedContract.startDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Ngày đến hạn">
              {formatDate(selectedContract.endDate)}
            </Descriptions.Item>
            <Descriptions.Item label="Lãi dự kiến">
              <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                {formatCurrency(calculateInterest(selectedContract))}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Tổng tiền đến hạn">
              <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                {formatCurrency(calculateMaturityAmount(selectedContract))}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              <Tag color={selectedContract.status === 'active' ? 'success' : 'warning'}>
                {selectedContract.status === 'active' ? 'Đang hoạt động' : 'Đã đến hạn'}
              </Tag>
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      {/* Settlement Modal */}
      <Modal
        title={
          <Space>
            <DollarOutlined />
            <span>Tất toán hợp đồng tiền gửi</span>
          </Space>
        }
        open={settlementModalVisible}
        onCancel={() => setSettlementModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setSettlementModalVisible(false)}>
            Hủy
          </Button>,
          <Button
            key="submit"
            type="primary"
            icon={<CheckCircleOutlined />}
            onClick={handleSubmitSettlement}
            loading={loading}
          >
            Xác nhận tất toán
          </Button>,
        ]}
        width={700}
      >
        {selectedContract && (
          <>
            <Alert
              message="Lưu ý"
              description={
                selectedContract.status === 'matured'
                  ? 'Hợp đồng đã đến hạn. Bạn có thể tất toán mà không bị phạt.'
                  : 'Hợp đồng chưa đến hạn. Tất toán trước hạn có thể bị tính lại lãi suất theo quy định.'
              }
              type={selectedContract.status === 'matured' ? 'success' : 'warning'}
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Card title="Thông tin hợp đồng" size="small" style={{ marginBottom: 24 }}>
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Số hợp đồng">
                  {selectedContract.contractNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền gốc">
                  {formatCurrency(selectedContract.amount)}
                </Descriptions.Item>
                <Descriptions.Item label="Lãi dự kiến">
                  {formatCurrency(calculateInterest(selectedContract))}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền nhận">
                  <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                    {formatCurrency(calculateMaturityAmount(selectedContract))}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Form form={settlementForm} layout="vertical">
              <Form.Item
                name="destinationAccount"
                label="Tài khoản nhận tiền"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản!' }]}
              >
                <Select placeholder="Chọn tài khoản nhận tiền" size="large">
                  {user?.accounts.filter(a => a.currency === 'VND').map((acc) => (
                    <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="settlementDate"
                label="Ngày tất toán"
                rules={[{ required: true, message: 'Vui lòng chọn ngày tất toán!' }]}
                initialValue={dayjs()}
              >
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD/MM/YYYY"
                  disabledDate={(current) => {
                    return current && current < dayjs().startOf('day');
                  }}
                />
              </Form.Item>
            </Form>
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default DepositList;
