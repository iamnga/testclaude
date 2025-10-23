import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Select,
  InputNumber,
  Button,
  Alert,
  Typography,
  Space,
  Divider,
  Descriptions,
  Steps,
  Result,
  message,
} from 'antd';
import {
  SwapOutlined,
  DollarOutlined,
  BankOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { mockExchangeRates } from '../../data/mockData';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const SellForeignCurrency: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [vndAmount, setVndAmount] = useState<number>(0);
  const [transactionResult, setTransactionResult] = useState<any>(null);

  // Check if within working hours (Mon-Fri, 8:00-16:00)
  const isWithinWorkingHours = () => {
    const now = dayjs();
    const dayOfWeek = now.day(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const hour = now.hour();

    // Check if Monday to Friday (1-5) and between 8:00-16:00
    return dayOfWeek >= 1 && dayOfWeek <= 5 && hour >= 8 && hour < 16;
  };

  const formatCurrency = (amount: number, currency: string) => {
    if (currency === 'VND') {
      return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
    }
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  const formatDateTime = (dateString: string) => {
    return dayjs(dateString).format('DD/MM/YYYY HH:mm:ss');
  };

  // Get foreign currency accounts
  const foreignAccounts = user?.accounts.filter((acc) => acc.currency !== 'VND') || [];
  const vndAccounts = user?.accounts.filter((acc) => acc.currency === 'VND') || [];

  useEffect(() => {
    if (selectedCurrency && amount > 0) {
      const rate = mockExchangeRates.find((r) => r.currency === selectedCurrency);
      if (rate) {
        setExchangeRate(rate.buyRate);
        setVndAmount(amount * rate.buyRate);
      }
    }
  }, [selectedCurrency, amount]);

  const handleNext = async () => {
    try {
      await form.validateFields();
      if (currentStep === 0) {
        const values = form.getFieldsValue();
        setSelectedCurrency(values.currency);
        setAmount(values.amount);
        setCurrentStep(1);
      } else if (currentStep === 1) {
        setLoading(true);
        // Mock transaction
        setTimeout(() => {
          setLoading(false);
          setTransactionResult({
            referenceNumber: `FX${Date.now()}`,
            transactionDate: dayjs().format(),
            fromCurrency: selectedCurrency,
            amount: amount,
            exchangeRate: exchangeRate,
            vndAmount: vndAmount,
          });
          setCurrentStep(2);
        }, 1500);
      }
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentStep(0);
    setSelectedCurrency('');
    setAmount(0);
    setExchangeRate(0);
    setVndAmount(0);
    setTransactionResult(null);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            {!isWithinWorkingHours() && (
              <Alert
                message="Ngoài giờ giao dịch"
                description="Giao dịch mua bán ngoại tệ chỉ được thực hiện trong giờ làm việc: Thứ 2 - Thứ 6, 8:00 - 16:00. Bạn vẫn có thể đặt lệnh và giao dịch sẽ được xử lý vào ngày làm việc tiếp theo."
                type="warning"
                showIcon
                icon={<ClockCircleOutlined />}
                style={{ marginBottom: 24 }}
              />
            )}

            <Form form={form} layout="vertical">
              <Form.Item
                name="currency"
                label="Loại ngoại tệ muốn bán"
                rules={[{ required: true, message: 'Vui lòng chọn loại ngoại tệ!' }]}
              >
                <Select
                  size="large"
                  placeholder="Chọn loại ngoại tệ"
                  onChange={(value) => setSelectedCurrency(value)}
                >
                  {mockExchangeRates
                    .filter((rate) => rate.currency !== 'VND')
                    .map((rate) => (
                      <Select.Option key={rate.currency} value={rate.currency}>
                        <Space>
                          <Text strong>{rate.currency}</Text>
                          <Text type="secondary">- {rate.currencyName}</Text>
                          <Text style={{ color: '#52c41a' }}>
                            (Mua: {formatCurrency(rate.buyRate, 'VND')})
                          </Text>
                        </Space>
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="fromAccount"
                label="Tài khoản ngoại tệ"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản!' }]}
              >
                <Select size="large" placeholder="Chọn tài khoản ngoại tệ">
                  {foreignAccounts.map((acc) => (
                    <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.availableBalance, acc.currency)})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="amount"
                label="Số lượng ngoại tệ muốn bán"
                rules={[
                  { required: true, message: 'Vui lòng nhập số lượng!' },
                  {
                    validator: (_, value) => {
                      if (value <= 0) {
                        return Promise.reject('Số lượng phải lớn hơn 0');
                      }
                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  size="large"
                  min={0}
                  step={100}
                  onChange={(value) => setAmount(value || 0)}
                />
              </Form.Item>

              <Form.Item
                name="toAccount"
                label="Tài khoản VND nhận tiền"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản nhận!' }]}
              >
                <Select size="large" placeholder="Chọn tài khoản VND">
                  {vndAccounts.map((acc) => (
                    <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.availableBalance, 'VND')})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedCurrency && amount > 0 && (
                <Alert
                  message="Ước tính số tiền nhận được"
                  description={
                    <div>
                      <p>
                        <Text strong>Tỷ giá: </Text>
                        <Text style={{ fontSize: 16, color: '#1890ff' }}>
                          {formatCurrency(exchangeRate, 'VND')}
                        </Text>
                      </p>
                      <p style={{ marginBottom: 0 }}>
                        <Text strong>Số tiền VND nhận được: </Text>
                        <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                          ≈ {formatCurrency(vndAmount, 'VND')}
                        </Text>
                      </p>
                    </div>
                  }
                  type="success"
                  showIcon
                />
              )}
            </Form>
          </>
        );

      case 1:
        return (
          <>
            <Alert
              message="Xác nhận thông tin giao dịch"
              description="Vui lòng kiểm tra kỹ thông tin trước khi xác nhận."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Descriptions column={1} bordered>
              <Descriptions.Item label="Loại ngoại tệ">
                <Text strong style={{ fontSize: 16 }}>
                  {selectedCurrency}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số lượng bán">
                <Text strong style={{ fontSize: 16 }}>
                  {formatCurrency(amount, selectedCurrency)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tỷ giá áp dụng">
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  {formatCurrency(exchangeRate, 'VND')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Số tiền VND nhận được">
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  {formatCurrency(vndAmount, 'VND')}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tài khoản ngoại tệ">
                {form.getFieldValue('fromAccount')}
              </Descriptions.Item>
              <Descriptions.Item label="Tài khoản VND nhận">
                {form.getFieldValue('toAccount')}
              </Descriptions.Item>
            </Descriptions>
          </>
        );

      case 2:
        return (
          <Result
            status="success"
            icon={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            title="Giao dịch thành công!"
            subTitle={
              isWithinWorkingHours()
                ? 'Giao dịch đã được xử lý thành công. Số tiền VND đã được chuyển vào tài khoản của bạn.'
                : 'Giao dịch đã được đặt lệnh. Sẽ được xử lý vào ngày làm việc tiếp theo.'
            }
            extra={[
              <Card key="details" style={{ textAlign: 'left', marginTop: 16 }}>
                <Descriptions column={1} bordered>
                  <Descriptions.Item label="Mã giao dịch">
                    <Text strong>{transactionResult?.referenceNumber}</Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian">
                    {formatDateTime(transactionResult?.transactionDate)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngoại tệ bán">
                    {formatCurrency(transactionResult?.amount, transactionResult?.fromCurrency)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Tỷ giá">
                    {formatCurrency(transactionResult?.exchangeRate, 'VND')}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số tiền nhận được">
                    <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                      {formatCurrency(transactionResult?.vndAmount, 'VND')}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Card>,
              <Button key="new" type="primary" onClick={handleReset} style={{ marginTop: 16 }}>
                Thực hiện giao dịch mới
              </Button>,
            ]}
          />
        );

      default:
        return null;
    }
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SwapOutlined style={{ marginRight: 12 }} />
          Bán ngoại tệ giao ngay
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Bán ngoại tệ và nhận tiền VND ngay lập tức (trong giờ làm việc)
        </p>
      </div>

      <Alert
        message="Về giao dịch bán ngoại tệ"
        description={
          <div>
            <p>• Giao dịch được thực hiện trong giờ làm việc: <Text strong>Thứ 2 - Thứ 6, 8:00 - 16:00</Text></p>
            <p>• Tỷ giá áp dụng theo bảng giá tại thời điểm giao dịch</p>
            <p>• Tiền VND sẽ được chuyển vào tài khoản ngay sau khi xử lý</p>
            <p style={{ marginBottom: 0 }}>• Ngoài giờ làm việc, giao dịch sẽ được xử lý vào ngày làm việc tiếp theo</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      <Card>
        <Steps current={currentStep} style={{ marginBottom: 32 }}>
          <Steps.Step title="Nhập thông tin" icon={<DollarOutlined />} />
          <Steps.Step title="Xác nhận" icon={<BankOutlined />} />
          <Steps.Step title="Hoàn thành" icon={<CheckCircleOutlined />} />
        </Steps>

        {renderStepContent()}

        {currentStep < 2 && (
          <>
            <Divider />
            <Space>
              {currentStep > 0 && (
                <Button size="large" onClick={() => setCurrentStep(currentStep - 1)}>
                  Quay lại
                </Button>
              )}
              <Button
                type="primary"
                size="large"
                onClick={handleNext}
                loading={loading}
              >
                {currentStep === 0 ? 'Tiếp tục' : 'Xác nhận giao dịch'}
              </Button>
            </Space>
          </>
        )}
      </Card>
    </AppLayout>
  );
};

export default SellForeignCurrency;
