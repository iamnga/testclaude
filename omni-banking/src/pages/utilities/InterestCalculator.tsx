import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Typography,
  Alert,
  Form,
  InputNumber,
  Select,
  Button,
  Space,
  Descriptions,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  CalculatorOutlined,
  PercentageOutlined,
} from '@ant-design/icons';
import { mockInterestRates } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { InterestRate } from '../../types';

const { Title, Text } = Typography;

const InterestCalculator: React.FC = () => {
  const [form] = Form.useForm();
  const [calculationResult, setCalculationResult] = useState<{
    principal: number;
    term: number;
    rate: number;
    interest: number;
    total: number;
  } | null>(null);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const handleCalculate = () => {
    const values = form.getFieldsValue();
    const { principal, term } = values;

    // Find the interest rate for the selected term
    const rateInfo = mockInterestRates.find((r) => r.term === term);
    if (!rateInfo) return;

    // Calculate interest: Principal * Rate * (Term in months / 12)
    const interest = principal * (rateInfo.rate / 100) * (term / 12);
    const total = principal + interest;

    setCalculationResult({
      principal,
      term,
      rate: rateInfo.rate,
      interest,
      total,
    });
  };

  const handleReset = () => {
    form.resetFields();
    setCalculationResult(null);
  };

  const columns: ColumnsType<InterestRate> = [
    {
      title: 'Kỳ hạn',
      dataIndex: 'termName',
      key: 'termName',
      width: 150,
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Lãi suất',
      dataIndex: 'rate',
      key: 'rate',
      width: 150,
      align: 'center',
      render: (rate: number) => (
        <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
          {rate}% / năm
        </Text>
      ),
    },
    {
      title: 'Số tiền tối thiểu',
      dataIndex: 'minAmount',
      key: 'minAmount',
      width: 200,
      align: 'right',
      render: (amount: number) => (
        <Text type="secondary">{formatCurrency(amount)}</Text>
      ),
    },
    {
      title: 'Ví dụ lãi nhận được',
      key: 'example',
      render: (_: any, record: InterestRate) => {
        const examplePrincipal = 100000000; // 100 million VND
        const exampleInterest = examplePrincipal * (record.rate / 100) * (record.term / 12);
        return (
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              Gửi {formatCurrency(examplePrincipal)}:
            </Text>
            <div>
              <Text strong style={{ color: '#52c41a' }}>
                +{formatCurrency(exampleInterest)}
              </Text>
            </div>
          </div>
        );
      },
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <CalculatorOutlined style={{ marginRight: 12 }} />
          Công cụ tính lãi & Lãi suất
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tính toán lãi tiết kiệm và tra cứu lãi suất hiện hành
        </p>
      </div>

      <Alert
        message="Về lãi suất tiết kiệm"
        description={
          <div>
            <p>• Lãi suất được tính theo công thức: Lãi = Số tiền gửi × Lãi suất × (Kỳ hạn / 12 tháng)</p>
            <p>• Lãi suất có thể thay đổi tùy theo chính sách của ngân hàng</p>
            <p style={{ marginBottom: 0 }}>• Kỳ hạn càng dài, lãi suất càng cao</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Calculator */}
      <Card
        title={
          <span>
            <CalculatorOutlined style={{ marginRight: 8 }} />
            Công cụ tính lãi tiết kiệm
          </span>
        }
        style={{ marginBottom: 16 }}
      >
        <Form
          form={form}
          layout="vertical"
          initialValues={{
            principal: 100000000,
            term: 12,
          }}
        >
          <Space size="large" align="start" style={{ width: '100%' }} wrap>
            <Form.Item
              name="principal"
              label="Số tiền gửi (VND)"
              rules={[
                { required: true, message: 'Vui lòng nhập số tiền!' },
                {
                  validator: (_, value) => {
                    if (value < 10000000) {
                      return Promise.reject('Số tiền tối thiểu là 10,000,000 VND');
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <InputNumber
                style={{ width: 250 }}
                size="large"
                min={10000000}
                step={1000000}
                formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={(value) => value!.replace(/\$\s?|(,*)/g, '') as any}
              />
            </Form.Item>

            <Form.Item
              name="term"
              label="Kỳ hạn"
              rules={[{ required: true, message: 'Vui lòng chọn kỳ hạn!' }]}
            >
              <Select style={{ width: 200 }} size="large">
                {mockInterestRates.map((rate) => (
                  <Select.Option key={rate.term} value={rate.term}>
                    {rate.termName} ({rate.rate}%/năm)
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label=" ">
              <Space>
                <Button type="primary" size="large" onClick={handleCalculate} icon={<CalculatorOutlined />}>
                  Tính toán
                </Button>
                <Button size="large" onClick={handleReset}>
                  Đặt lại
                </Button>
              </Space>
            </Form.Item>
          </Space>
        </Form>

        {calculationResult && (
          <>
            <Divider />
            <Alert
              message="Kết quả tính toán"
              type="success"
              style={{ marginBottom: 16 }}
            />
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Số tiền gửi">
                <Text strong style={{ fontSize: 16 }}>
                  {formatCurrency(calculationResult.principal)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Kỳ hạn">
                <Text strong style={{ fontSize: 16 }}>
                  {calculationResult.term} tháng
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Lãi suất">
                <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                  {calculationResult.rate}% / năm
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Lãi nhận được">
                <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                  +{formatCurrency(calculationResult.interest)}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Tổng tiền nhận về" span={2}>
                <Text strong style={{ fontSize: 20, color: '#1890ff' }}>
                  {formatCurrency(calculationResult.total)}
                </Text>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>

      {/* Interest Rate Table */}
      <Card
        title={
          <span>
            <PercentageOutlined style={{ marginRight: 8 }} />
            Bảng lãi suất tiết kiệm
          </span>
        }
      >
        <Table
          columns={columns}
          dataSource={mockInterestRates}
          rowKey="term"
          pagination={false}
          scroll={{ x: 800 }}
        />

        <Alert
          message="Lưu ý"
          description="Lãi suất chỉ mang tính chất tham khảo. Lãi suất thực tế có thể thay đổi theo chính sách ngân hàng. Vui lòng liên hệ chi nhánh gần nhất để biết lãi suất chính xác."
          type="warning"
          showIcon
          style={{ marginTop: 16 }}
        />
      </Card>
    </AppLayout>
  );
};

export default InterestCalculator;
