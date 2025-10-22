import React, { useState, useMemo } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Steps,
  Descriptions,
  Typography,
  Space,
  message,
  InputNumber,
  Radio,
  Alert,
  Table,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  SaveOutlined,
  CheckCircleOutlined,
  CalculatorOutlined,
  DollarOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { mockDepositTerms } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { DepositTerm } from '../../types';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const CreateDeposit: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedTerm, setSelectedTerm] = useState<DepositTerm | null>(null);
  const [depositData, setDepositData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const calculateInterest = (principal: number, rate: number, term: number, method: string) => {
    const monthlyRate = rate / 100 / 12;
    const totalInterest = principal * monthlyRate * term;

    if (method === 'upfront') {
      return totalInterest;
    } else if (method === 'monthly') {
      return totalInterest / term; // Monthly payment
    } else {
      return totalInterest; // Maturity
    }
  };

  const handleTermChange = (termKey: string) => {
    const [term, unit] = termKey.split('-');
    const termData = mockDepositTerms.find(
      t => t.term === parseInt(term) && t.termUnit === unit
    );
    setSelectedTerm(termData || null);
    form.setFieldsValue({ depositTerm: termKey });
  };

  const handleCalculate = async () => {
    try {
      const values = await form.validateFields(['fromAccount', 'amount', 'depositTerm']);

      if (!selectedTerm) {
        message.error('Vui lòng chọn kỳ hạn!');
        return;
      }

      const amount = values.amount;
      if (amount < selectedTerm.minAmount) {
        message.error(`Số tiền tối thiểu cho kỳ hạn này là ${formatCurrency(selectedTerm.minAmount)}`);
        return;
      }

      message.success('Tính toán lãi suất thành công!');
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();

      if (!selectedTerm) {
        message.error('Vui lòng chọn kỳ hạn!');
        return;
      }

      const startDate = dayjs();
      const endDate = startDate.add(selectedTerm.term, selectedTerm.termUnit);
      const totalInterest = calculateInterest(
        values.amount,
        selectedTerm.interestRate,
        selectedTerm.term,
        values.interestPaymentMethod
      );

      setDepositData({
        fromAccount: values.fromAccount,
        amount: values.amount,
        term: selectedTerm,
        interestPaymentMethod: values.interestPaymentMethod,
        autoRenewal: values.autoRenewal,
        startDate: startDate.format('DD/MM/YYYY'),
        endDate: endDate.format('DD/MM/YYYY'),
        totalInterest,
      });
      setCurrentStep(1);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    // Mock submit
    setTimeout(() => {
      setLoading(false);
      message.success('Mở hợp đồng tiền gửi thành công!');
      setCurrentStep(2);
    }, 1500);
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentStep(0);
    setSelectedTerm(null);
    setDepositData(null);
  };

  const steps = [
    {
      title: 'Thông tin hợp đồng',
      icon: <SaveOutlined />,
    },
    {
      title: 'Xác nhận',
      icon: <CheckCircleOutlined />,
    },
    {
      title: 'Hoàn tất',
      icon: <CheckCircleOutlined />,
    },
  ];

  // Group deposit terms by category
  const groupedTerms = useMemo(() => {
    const groups: { [key: string]: DepositTerm[] } = {
      'Ngắn hạn (1-6 tháng)': [],
      'Trung hạn (9-12 tháng)': [],
      'Dài hạn (18-36 tháng)': [],
    };

    mockDepositTerms.forEach(term => {
      if (term.term <= 6) {
        groups['Ngắn hạn (1-6 tháng)'].push(term);
      } else if (term.term <= 12) {
        groups['Trung hạn (9-12 tháng)'].push(term);
      } else {
        groups['Dài hạn (18-36 tháng)'].push(term);
      }
    });

    return groups;
  }, []);

  const interestRateColumns: ColumnsType<DepositTerm> = [
    {
      title: 'Kỳ hạn',
      dataIndex: 'term',
      key: 'term',
      render: (term: number, record: DepositTerm) => (
        `${term} ${record.termUnit === 'month' ? 'tháng' : 'năm'}`
      ),
    },
    {
      title: 'Lãi suất (%/năm)',
      dataIndex: 'interestRate',
      key: 'interestRate',
      render: (rate: number) => (
        <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
          {rate.toFixed(2)}%
        </Text>
      ),
    },
    {
      title: 'Số tiền tối thiểu',
      dataIndex: 'minAmount',
      key: 'minAmount',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'productName',
      key: 'productName',
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SaveOutlined style={{ marginRight: 12 }} />
          Mở hợp đồng tiền gửi
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Mở hợp đồng tiền gửi online với lãi suất hấp dẫn
        </p>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {/* Step 1: Contract Information */}
        {currentStep === 0 && (
          <>
            {/* Interest Rate Table */}
            <Card
              title={
                <Space>
                  <DollarOutlined />
                  <span>Bảng lãi suất tiền gửi</span>
                </Space>
              }
              style={{ marginBottom: 24 }}
            >
              <Alert
                message="Lưu ý"
                description="Lãi suất áp dụng có thể thay đổi theo từng thời điểm. Vui lòng liên hệ hotline 1900 6678 để biết thêm chi tiết."
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              {Object.entries(groupedTerms).map(([groupName, terms]) => (
                <div key={groupName} style={{ marginBottom: 24 }}>
                  <Title level={5}>{groupName}</Title>
                  <Table
                    columns={interestRateColumns}
                    dataSource={terms}
                    rowKey={(record) => `${record.term}-${record.termUnit}`}
                    pagination={false}
                    size="small"
                  />
                </div>
              ))}
            </Card>

            <Form form={form} layout="vertical">
              <Card title="Thông tin mở hợp đồng" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="fromAccount"
                  label="Tài khoản nguồn"
                  rules={[{ required: true, message: 'Vui lòng chọn tài khoản!' }]}
                >
                  <Select placeholder="Chọn tài khoản" size="large">
                    {user?.accounts.filter(a => a.currency === 'VND').map((acc) => (
                      <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                        {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.availableBalance)})
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="amount"
                  label="Số tiền gửi"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số tiền!' },
                    { type: 'number', min: 10000000, message: 'Số tiền tối thiểu là 10,000,000 VND' }
                  ]}
                >
                  <InputNumber
                    placeholder="Nhập số tiền gửi"
                    size="large"
                    style={{ width: '100%' }}
                    formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={value => value!.replace(/,/g, '') as any}
                    addonAfter="VND"
                  />
                </Form.Item>

                <Form.Item
                  name="depositTerm"
                  label="Kỳ hạn gửi"
                  rules={[{ required: true, message: 'Vui lòng chọn kỳ hạn!' }]}
                >
                  <Select
                    placeholder="Chọn kỳ hạn gửi"
                    size="large"
                    onChange={handleTermChange}
                  >
                    {mockDepositTerms.map(term => (
                      <Select.Option
                        key={`${term.term}-${term.termUnit}`}
                        value={`${term.term}-${term.termUnit}`}
                      >
                        {term.productName} - {term.interestRate}%/năm
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                {selectedTerm && (
                  <Alert
                    message={`Lãi suất: ${selectedTerm.interestRate}%/năm | Số tiền tối thiểu: ${formatCurrency(selectedTerm.minAmount)}`}
                    type="success"
                    showIcon
                    style={{ marginBottom: 16 }}
                  />
                )}

                <Form.Item
                  name="interestPaymentMethod"
                  label="Phương thức trả lãi"
                  rules={[{ required: true, message: 'Vui lòng chọn phương thức trả lãi!' }]}
                  initialValue="maturity"
                >
                  <Radio.Group size="large">
                    <Radio value="maturity">Trả lãi cuối kỳ</Radio>
                    <Radio value="monthly">Trả lãi hàng tháng</Radio>
                    <Radio value="upfront">Trả lãi trước</Radio>
                  </Radio.Group>
                </Form.Item>

                <Form.Item
                  name="autoRenewal"
                  label="Tự động gia hạn"
                  rules={[{ required: true }]}
                  initialValue={false}
                >
                  <Radio.Group size="large">
                    <Radio value={true}>Có, tự động gia hạn khi đến hạn</Radio>
                    <Radio value={false}>Không, tất toán khi đến hạn</Radio>
                  </Radio.Group>
                </Form.Item>

                <Divider />

                <Space>
                  <Button
                    icon={<CalculatorOutlined />}
                    size="large"
                    onClick={handleCalculate}
                  >
                    Tính toán lãi suất
                  </Button>
                  <Button type="primary" size="large" onClick={handleNext}>
                    Tiếp tục
                  </Button>
                </Space>
              </Card>
            </Form>
          </>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 1 && depositData && (
          <div>
            <Card title="Xác nhận thông tin hợp đồng tiền gửi" style={{ marginBottom: 24 }}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Tài khoản nguồn">
                  {depositData.fromAccount}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền gửi">
                  <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                    {formatCurrency(depositData.amount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Sản phẩm">
                  {depositData.term.productName}
                </Descriptions.Item>
                <Descriptions.Item label="Kỳ hạn">
                  {depositData.term.term} {depositData.term.termUnit === 'month' ? 'tháng' : 'năm'}
                </Descriptions.Item>
                <Descriptions.Item label="Lãi suất">
                  <Text strong style={{ color: '#52c41a', fontSize: 16 }}>
                    {depositData.term.interestRate}%/năm
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phương thức trả lãi">
                  {depositData.interestPaymentMethod === 'maturity' && 'Trả lãi cuối kỳ'}
                  {depositData.interestPaymentMethod === 'monthly' && 'Trả lãi hàng tháng'}
                  {depositData.interestPaymentMethod === 'upfront' && 'Trả lãi trước'}
                </Descriptions.Item>
                <Descriptions.Item label="Tự động gia hạn">
                  {depositData.autoRenewal ? 'Có' : 'Không'}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày mở">
                  {depositData.startDate}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đến hạn">
                  {depositData.endDate}
                </Descriptions.Item>
                <Descriptions.Item label="Lãi dự kiến">
                  <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                    {formatCurrency(depositData.totalInterest)}
                    {depositData.interestPaymentMethod === 'monthly' && ' / tháng'}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button size="large" onClick={() => setCurrentStep(0)}>
                Quay lại
              </Button>
              <Button type="primary" size="large" onClick={handleSubmit} loading={loading}>
                Xác nhận mở hợp đồng
              </Button>
            </Space>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
            <Title level={3}>Mở hợp đồng tiền gửi thành công!</Title>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
              Hợp đồng đã được mở thành công.<br />
              Số hợp đồng: <Text strong>HDTG{Date.now()}</Text>
            </p>
            <Space>
              <Button size="large" onClick={handleReset}>
                Mở hợp đồng mới
              </Button>
              <Button type="primary" size="large" onClick={() => window.location.href = '/deposit/list'}>
                Xem danh sách hợp đồng
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </AppLayout>
  );
};

export default CreateDeposit;
