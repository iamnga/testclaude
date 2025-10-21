import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  Radio,
  InputNumber,
  message,
  Steps,
  Descriptions,
  Typography,
  Space,
  Divider,
} from 'antd';
import {
  SwapOutlined,
  BankOutlined,
  UserOutlined,
  DollarOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const TransferSingle: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [transferData, setTransferData] = useState<any>(null);
  const [transferType, setTransferType] = useState<'internal' | 'interbank' | 'napas247'>('internal');
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  // Calculate fee based on transfer type
  const calculateFee = (amount: number, type: string) => {
    if (type === 'internal') return 0;
    if (type === 'interbank') return 5500;
    if (type === 'napas247') return 7700;
    return 0;
  };

  const handleNext = async () => {
    try {
      const values = await form.validateFields();
      const fee = calculateFee(values.amount, transferType);

      setTransferData({
        ...values,
        transferType,
        fee,
        total: values.amount + fee,
        executionDate: values.executionDate || dayjs(),
      });
      setCurrentStep(1);
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin!');
    }
  };

  const handleSubmit = () => {
    setLoading(true);
    // Mock submit
    setTimeout(() => {
      setLoading(false);
      message.success('Tạo lệnh chuyển khoản thành công! Lệnh đang chờ duyệt.');
      setCurrentStep(2);
    }, 1500);
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentStep(0);
    setTransferData(null);
  };

  const steps = [
    {
      title: 'Nhập thông tin',
      icon: <UserOutlined />,
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
          <SwapOutlined style={{ marginRight: 12 }} />
          Chuyển khoản theo món
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Thực hiện chuyển khoản trong hệ thống OCB, liên ngân hàng hoặc chuyển tiền nhanh NAPAS 247
        </p>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {/* Step 1: Form Input */}
        {currentStep === 0 && (
          <Form form={form} layout="vertical" initialValues={{ feeType: 'sender' }}>
            <Card title="Loại giao dịch" style={{ marginBottom: 24 }}>
              <Radio.Group
                value={transferType}
                onChange={(e) => setTransferType(e.target.value)}
                style={{ width: '100%' }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Radio value="internal">
                    <BankOutlined /> Chuyển khoản trong hệ thống OCB (Miễn phí)
                  </Radio>
                  <Radio value="interbank">
                    Chuyển khoản liên ngân hàng CITAD (Phí 5,500 VND)
                  </Radio>
                  <Radio value="napas247">
                    Chuyển tiền nhanh NAPAS 247 (Phí 7,700 VND)
                  </Radio>
                </Space>
              </Radio.Group>
            </Card>

            <Card title="Thông tin chuyển khoản" style={{ marginBottom: 24 }}>
              <Form.Item
                name="fromAccount"
                label="Tài khoản nguồn"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản nguồn!' }]}
              >
                <Select placeholder="Chọn tài khoản" size="large">
                  {user?.accounts.map((acc) => (
                    <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.availableBalance)})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              {transferType !== 'internal' && (
                <>
                  <Form.Item
                    name="bankCode"
                    label="Ngân hàng thụ hưởng"
                    rules={[{ required: true, message: 'Vui lòng chọn ngân hàng!' }]}
                  >
                    <Select placeholder="Chọn ngân hàng" size="large" showSearch>
                      <Select.Option value="VCB">Vietcombank</Select.Option>
                      <Select.Option value="TCB">Techcombank</Select.Option>
                      <Select.Option value="VTB">Vietinbank</Select.Option>
                      <Select.Option value="MBB">MBBank</Select.Option>
                      <Select.Option value="ACB">ACB</Select.Option>
                      <Select.Option value="VPB">VPBank</Select.Option>
                      <Select.Option value="TPB">TPBank</Select.Option>
                      <Select.Option value="STB">Sacombank</Select.Option>
                    </Select>
                  </Form.Item>
                </>
              )}

              <Form.Item
                name="beneficiaryAccount"
                label="Số tài khoản người thụ hưởng"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tài khoản!' },
                  { pattern: /^[0-9]+$/, message: 'Số tài khoản không hợp lệ!' },
                ]}
              >
                <Input placeholder="Nhập số tài khoản" size="large" />
              </Form.Item>

              <Form.Item
                name="beneficiaryName"
                label="Tên người thụ hưởng"
                rules={[{ required: true, message: 'Vui lòng nhập tên người thụ hưởng!' }]}
              >
                <Input placeholder="Nhập tên người thụ hưởng" size="large" />
              </Form.Item>

              <Form.Item
                name="amount"
                label="Số tiền chuyển"
                rules={[
                  { required: true, message: 'Vui lòng nhập số tiền!' },
                  { type: 'number', min: 10000, message: 'Số tiền tối thiểu 10,000 VND' },
                ]}
              >
                <InputNumber
                  style={{ width: '100%' }}
                  placeholder="Nhập số tiền"
                  size="large"
                  formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
                  addonAfter="VND"
                />
              </Form.Item>

              <Form.Item
                name="content"
                label="Nội dung chuyển khoản"
                rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
              >
                <TextArea rows={3} placeholder="Nhập nội dung chuyển khoản" maxLength={200} showCount />
              </Form.Item>

              <Form.Item name="feeType" label="Phí giao dịch">
                <Radio.Group>
                  <Radio value="sender">Người chuyển trả phí</Radio>
                  <Radio value="receiver">Người nhận trả phí</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item name="executionDate" label="Ngày thực hiện">
                <DatePicker
                  style={{ width: '100%' }}
                  size="large"
                  format="DD/MM/YYYY"
                  placeholder="Chọn ngày thực hiện (để trống = hôm nay)"
                  disabledDate={(current) => current && current < dayjs().startOf('day')}
                />
              </Form.Item>

              <Form.Item style={{ marginBottom: 0 }}>
                <Button type="primary" size="large" onClick={handleNext} block>
                  Tiếp tục
                </Button>
              </Form.Item>
            </Card>
          </Form>
        )}

        {/* Step 2: Confirmation */}
        {currentStep === 1 && transferData && (
          <div>
            <Card title="Xác nhận thông tin chuyển khoản" style={{ marginBottom: 24 }}>
              <Descriptions column={1} bordered>
                <Descriptions.Item label="Loại giao dịch">
                  {transferData.transferType === 'internal' && 'Chuyển khoản trong hệ thống OCB'}
                  {transferData.transferType === 'interbank' && 'Chuyển khoản liên ngân hàng'}
                  {transferData.transferType === 'napas247' && 'Chuyển tiền nhanh NAPAS 247'}
                </Descriptions.Item>
                <Descriptions.Item label="Từ tài khoản">
                  {transferData.fromAccount}
                </Descriptions.Item>
                <Descriptions.Item label="Đến tài khoản">
                  {transferData.beneficiaryAccount}
                </Descriptions.Item>
                <Descriptions.Item label="Tên người thụ hưởng">
                  {transferData.beneficiaryName}
                </Descriptions.Item>
                {transferData.bankCode && (
                  <Descriptions.Item label="Ngân hàng">{transferData.bankCode}</Descriptions.Item>
                )}
                <Descriptions.Item label="Số tiền">
                  <Text strong style={{ fontSize: 16, color: '#cf1322' }}>
                    {formatCurrency(transferData.amount)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Phí giao dịch">
                  {formatCurrency(transferData.fee)}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                    {formatCurrency(transferData.total)}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung">{transferData.content}</Descriptions.Item>
                <Descriptions.Item label="Ngày thực hiện">
                  {transferData.executionDate.format('DD/MM/YYYY')}
                </Descriptions.Item>
              </Descriptions>
            </Card>

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button size="large" onClick={() => setCurrentStep(0)}>
                Quay lại
              </Button>
              <Button type="primary" size="large" onClick={handleSubmit} loading={loading}>
                Xác nhận chuyển khoản
              </Button>
            </Space>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
            <Title level={3}>Tạo lệnh chuyển khoản thành công!</Title>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
              Lệnh chuyển khoản đã được tạo và đang chờ phê duyệt.<br />
              Mã giao dịch: <Text strong>TXN{Date.now()}</Text>
            </p>
            <Space>
              <Button size="large" onClick={handleReset}>
                Tạo lệnh mới
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

export default TransferSingle;
