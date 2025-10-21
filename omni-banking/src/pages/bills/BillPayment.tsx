import React, { useState } from 'react';
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
  Row,
  Col,
  Divider,
} from 'antd';
import {
  DollarOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  ThunderboltOutlined,
  MobileOutlined,
  WifiOutlined,
  PhoneOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import { mockBillServices } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { BillService } from '../../types';

const { Title, Text } = Typography;

const BillPayment: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedService, setSelectedService] = useState<BillService | null>(null);
  const [billInfo, setBillInfo] = useState<any>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'electricity':
        return <ThunderboltOutlined />;
      case 'water':
        return <DollarOutlined />;
      case 'mobile':
        return <MobileOutlined />;
      case 'internet':
        return <WifiOutlined />;
      case 'phone':
        return <PhoneOutlined />;
      default:
        return <DollarOutlined />;
    }
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      electricity: 'Điện',
      water: 'Nước',
      mobile: 'Điện thoại di động',
      internet: 'Internet',
      airline: 'Vé máy bay',
      phone: 'Điện thoại cố định',
    };
    return names[category] || category;
  };

  const categories = [
    { value: 'electricity', label: 'Tiền điện', icon: <ThunderboltOutlined /> },
    { value: 'water', label: 'Tiền nước', icon: <DollarOutlined /> },
    { value: 'mobile', label: 'Điện thoại di động', icon: <MobileOutlined /> },
    { value: 'internet', label: 'Internet', icon: <WifiOutlined /> },
    { value: 'phone', label: 'Điện thoại cố định', icon: <PhoneOutlined /> },
    { value: 'airline', label: 'Vé máy bay', icon: <DollarOutlined /> },
  ];

  const filteredServices = selectedCategory
    ? mockBillServices.filter(s => s.category === selectedCategory)
    : [];

  const handleQueryBill = async () => {
    try {
      const values = await form.validateFields(['serviceCode', 'customerCode']);
      setLoading(true);

      // Mock API call to query bill
      setTimeout(() => {
        const service = mockBillServices.find(s => s.code === values.serviceCode);
        const mockBill = {
          customerCode: values.customerCode,
          customerName: user?.fullName || 'Nguyễn Văn A',
          billNumber: `${values.serviceCode}${Date.now()}`,
          period: '10/2025',
          dueDate: '2025-11-05',
          amount: Math.floor(Math.random() * 2000000) + 100000,
          feeAmount: 1100 + Math.floor(Math.random() * 1000),
        };

        setBillInfo(mockBill);
        setSelectedService(service || null);
        setLoading(false);
        message.success('Tra cứu hóa đơn thành công!');
      }, 1000);
    } catch (error) {
      setLoading(false);
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields(['fromAccount']);
      setPaymentData({
        ...billInfo,
        fromAccount: values.fromAccount,
        totalAmount: billInfo.amount + billInfo.feeAmount,
        service: selectedService,
      });
      setCurrentStep(1);
    } catch (error) {
      message.error('Vui lòng chọn tài khoản thanh toán!');
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    // Mock submit
    setTimeout(() => {
      setLoading(false);
      message.success('Thanh toán hóa đơn thành công!');
      setCurrentStep(2);
    }, 1500);
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentStep(0);
    setSelectedCategory('');
    setSelectedService(null);
    setBillInfo(null);
    setPaymentData(null);
  };

  const steps = [
    {
      title: 'Tra cứu hóa đơn',
      icon: <SearchOutlined />,
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

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <DollarOutlined style={{ marginRight: 12 }} />
          Thanh toán hóa đơn
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Thanh toán hóa đơn điện, nước, điện thoại, internet và các dịch vụ khác
        </p>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {/* Step 1: Query Bill */}
        {currentStep === 0 && (
          <Form form={form} layout="vertical">
            <Card title="Chọn dịch vụ" style={{ marginBottom: 24 }}>
              <Row gutter={16}>
                {categories.map(cat => (
                  <Col xs={24} sm={12} md={8} key={cat.value} style={{ marginBottom: 16 }}>
                    <Card
                      hoverable
                      onClick={() => setSelectedCategory(cat.value)}
                      style={{
                        border: selectedCategory === cat.value ? '2px solid #1890ff' : '1px solid #d9d9d9',
                        textAlign: 'center',
                      }}
                    >
                      <div style={{ fontSize: 32, color: '#1890ff', marginBottom: 8 }}>
                        {cat.icon}
                      </div>
                      <Text strong>{cat.label}</Text>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Card>

            {selectedCategory && (
              <Card title="Thông tin thanh toán" style={{ marginBottom: 24 }}>
                <Form.Item
                  name="serviceCode"
                  label="Nhà cung cấp dịch vụ"
                  rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp!' }]}
                >
                  <Select placeholder="Chọn nhà cung cấp" size="large" showSearch>
                    {filteredServices.map(service => (
                      <Select.Option key={service.code} value={service.code}>
                        {getCategoryIcon(service.category)} {service.name}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="customerCode"
                  label="Mã khách hàng / Số điện thoại"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mã khách hàng!' },
                  ]}
                >
                  <Input
                    placeholder="Nhập mã khách hàng hoặc số điện thoại"
                    size="large"
                    suffix={
                      <Button
                        type="primary"
                        icon={<SearchOutlined />}
                        onClick={handleQueryBill}
                        loading={loading}
                      >
                        Tra cứu
                      </Button>
                    }
                  />
                </Form.Item>

                {billInfo && (
                  <>
                    <Divider />
                    <Card style={{ backgroundColor: '#f0f5ff', marginBottom: 16 }}>
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Mã khách hàng">
                          {billInfo.customerCode}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tên khách hàng">
                          {billInfo.customerName}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số hóa đơn">
                          {billInfo.billNumber}
                        </Descriptions.Item>
                        <Descriptions.Item label="Kỳ thanh toán">
                          {billInfo.period}
                        </Descriptions.Item>
                        <Descriptions.Item label="Hạn thanh toán">
                          {billInfo.dueDate}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số tiền">
                          <Text strong style={{ fontSize: 16, color: '#cf1322' }}>
                            {formatCurrency(billInfo.amount)}
                          </Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Phí giao dịch">
                          {formatCurrency(billInfo.feeAmount)}
                        </Descriptions.Item>
                        <Descriptions.Item label="Tổng thanh toán">
                          <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                            {formatCurrency(billInfo.amount + billInfo.feeAmount)}
                          </Text>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>

                    <Form.Item
                      name="fromAccount"
                      label="Tài khoản thanh toán"
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

                    <Form.Item style={{ marginBottom: 0 }}>
                      <Button type="primary" size="large" onClick={handleNext} block>
                        Tiếp tục
                      </Button>
                    </Form.Item>
                  </>
                )}
              </Card>
            )}
          </Form>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 1 && paymentData && (
          <div>
            <Card title="Xác nhận thanh toán hóa đơn" style={{ marginBottom: 24 }}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Dịch vụ">
                  {paymentData.service?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Mã khách hàng">
                  {paymentData.customerCode}
                </Descriptions.Item>
                <Descriptions.Item label="Tên khách hàng">
                  {paymentData.customerName}
                </Descriptions.Item>
                <Descriptions.Item label="Số hóa đơn">
                  {paymentData.billNumber}
                </Descriptions.Item>
                <Descriptions.Item label="Kỳ thanh toán">
                  {paymentData.period}
                </Descriptions.Item>
                <Descriptions.Item label="Hạn thanh toán">
                  {paymentData.dueDate}
                </Descriptions.Item>
                <Descriptions.Item label="Tài khoản thanh toán">
                  {paymentData.fromAccount}
                </Descriptions.Item>
                <Descriptions.Item label="Số tiền">
                  <Text strong style={{ fontSize: 16, color: '#cf1322' }}>
                    {formatCurrency(paymentData.amount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phí giao dịch">
                  {formatCurrency(paymentData.feeAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng thanh toán">
                  <Text strong style={{ fontSize: 18, color: '#1890ff' }}>
                    {formatCurrency(paymentData.totalAmount)}
                  </Text>
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button size="large" onClick={() => setCurrentStep(0)}>
                Quay lại
              </Button>
              <Button type="primary" size="large" onClick={handleSubmit} loading={loading}>
                Xác nhận thanh toán
              </Button>
            </Space>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
            <Title level={3}>Thanh toán hóa đơn thành công!</Title>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
              Hóa đơn đã được thanh toán thành công.<br />
              Mã giao dịch: <Text strong>BILL{Date.now()}</Text>
            </p>
            <Space>
              <Button size="large" onClick={handleReset}>
                Thanh toán hóa đơn khác
              </Button>
              <Button type="primary" size="large" onClick={() => window.location.href = '/dashboard'}>
                Về trang chủ
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </AppLayout>
  );
};

export default BillPayment;
