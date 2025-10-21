import React, { useState } from 'react';
import {
  Card,
  Form,
  Select,
  Button,
  Upload,
  Table,
  message,
  Steps,
  Typography,
  Space,
  Tag,
  Alert,
} from 'antd';
import {
  UploadOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  SwapOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';

const { Title, Text } = Typography;

interface BatchItem {
  key: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  content: string;
  status: 'ok' | 'error';
  errorMessage?: string;
}

const TransferBatch: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [batchData, setBatchData] = useState<BatchItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  // Mock template download
  const handleDownloadTemplate = () => {
    message.info('Đang tải file mẫu...');
    // In real app, would download Excel template
  };

  // Mock file upload
  const handleFileUpload = (file: any) => {
    message.loading({ content: 'Đang kiểm tra file...', key: 'upload' });

    // Mock validation
    setTimeout(() => {
      const mockData: BatchItem[] = [
        {
          key: '1',
          accountNumber: '0019876543210',
          accountName: 'Nguyễn Văn A',
          amount: 5000000,
          content: 'Chi lương tháng 10',
          status: 'ok',
        },
        {
          key: '2',
          accountNumber: '0011234567890',
          accountName: 'Trần Thị B',
          amount: 7000000,
          content: 'Chi lương tháng 10',
          status: 'ok',
        },
        {
          key: '3',
          accountNumber: '0012345678901',
          accountName: 'Lê Văn C',
          amount: 6500000,
          content: 'Chi lương tháng 10',
          status: 'ok',
        },
        {
          key: '4',
          accountNumber: 'INVALID123',
          accountName: 'Phạm Thị D',
          amount: 8000000,
          content: 'Chi lương tháng 10',
          status: 'error',
          errorMessage: 'Số tài khoản không hợp lệ',
        },
      ];

      setBatchData(mockData);
      const total = mockData.reduce((sum, item) => sum + item.amount, 0);
      setTotalAmount(total);

      message.success({ content: 'Kiểm tra file thành công!', key: 'upload' });
      setCurrentStep(1);
    }, 1500);

    return false; // Prevent auto upload
  };

  const handleSubmit = () => {
    const validItems = batchData.filter(item => item.status === 'ok');

    if (validItems.length === 0) {
      message.error('Không có giao dịch hợp lệ!');
      return;
    }

    message.loading({ content: 'Đang tạo lệnh...', key: 'submit' });

    setTimeout(() => {
      message.success({ content: 'Tạo lô chuyển khoản thành công!', key: 'submit' });
      setCurrentStep(2);
    }, 1500);
  };

  const columns: ColumnsType<BatchItem> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
    },
    {
      title: 'Tên người thụ hưởng',
      dataIndex: 'accountName',
      key: 'accountName',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount: number) => formatCurrency(amount),
    },
    {
      title: 'Nội dung',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status: string, record: BatchItem) => (
        <>
          {status === 'ok' ? (
            <Tag color="success">Hợp lệ</Tag>
          ) : (
            <Tag color="error" title={record.errorMessage}>Lỗi</Tag>
          )}
        </>
      ),
    },
  ];

  const steps = [
    { title: 'Tải file', icon: <UploadOutlined /> },
    { title: 'Kiểm tra', icon: <CheckCircleOutlined /> },
    { title: 'Hoàn tất', icon: <CheckCircleOutlined /> },
  ];

  const validCount = batchData.filter(i => i.status === 'ok').length;
  const errorCount = batchData.filter(i => i.status === 'error').length;

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SwapOutlined style={{ marginRight: 12 }} />
          Chuyển khoản theo lô / Chi lương
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Chuyển khoản hàng loạt cho nhiều người thụ hưởng từ file Excel
        </p>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {/* Step 1: Upload */}
        {currentStep === 0 && (
          <div>
            <Form form={form} layout="vertical">
              <Form.Item
                name="fromAccount"
                label="Tài khoản nguồn"
                rules={[{ required: true }]}
              >
                <Select placeholder="Chọn tài khoản" size="large">
                  {user?.accounts.filter(a => a.currency === 'VND').map((acc) => (
                    <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.availableBalance)})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Card style={{ marginBottom: 24, backgroundColor: '#f0f5ff' }}>
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Hướng dẫn:</Text>
                  <Text>1. Tải file mẫu Excel</Text>
                  <Text>2. Điền thông tin người thụ hưởng vào file</Text>
                  <Text>3. Tải file lên hệ thống để kiểm tra</Text>
                  <Button
                    icon={<DownloadOutlined />}
                    onClick={handleDownloadTemplate}
                  >
                    Tải file mẫu Excel
                  </Button>
                </Space>
              </Card>

              <Form.Item
                name="file"
                label="Tải file danh sách người thụ hưởng"
                rules={[{ required: true, message: 'Vui lòng tải file!' }]}
              >
                <Upload
                  beforeUpload={handleFileUpload}
                  accept=".xlsx,.xls"
                  maxCount={1}
                >
                  <Button icon={<FileExcelOutlined />} size="large">
                    Chọn file Excel
                  </Button>
                </Upload>
              </Form.Item>
            </Form>
          </div>
        )}

        {/* Step 2: Review */}
        {currentStep === 1 && (
          <div>
            <Alert
              message={`Tổng: ${batchData.length} giao dịch | Hợp lệ: ${validCount} | Lỗi: ${errorCount}`}
              type={errorCount > 0 ? 'warning' : 'success'}
              style={{ marginBottom: 16 }}
              description={
                <div>
                  <p>Tổng số tiền: <Text strong style={{ fontSize: 16, color: '#1890ff' }}>{formatCurrency(totalAmount)}</Text></p>
                  {errorCount > 0 && <p style={{ color: '#ff4d4f' }}>Lưu ý: Các giao dịch lỗi sẽ không được thực hiện</p>}
                </div>
              }
            />

            <Table
              columns={columns}
              dataSource={batchData}
              pagination={false}
              scroll={{ x: 800 }}
              style={{ marginBottom: 24 }}
            />

            <Space style={{ width: '100%', justifyContent: 'center' }}>
              <Button size="large" onClick={() => setCurrentStep(0)}>
                Tải lại file
              </Button>
              <Button type="primary" size="large" onClick={handleSubmit}>
                Tạo lệnh chuyển khoản ({validCount} GD)
              </Button>
            </Space>
          </div>
        )}

        {/* Step 3: Success */}
        {currentStep === 2 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
            <Title level={3}>Tạo lô chuyển khoản thành công!</Title>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
              Đã tạo lệnh chuyển khoản cho {validCount} người thụ hưởng.<br />
              Tổng số tiền: <Text strong>{formatCurrency(totalAmount)}</Text><br />
              Lệnh đang chờ phê duyệt.
            </p>
            <Space>
              <Button size="large" onClick={() => {
                setCurrentStep(0);
                setBatchData([]);
                form.resetFields();
              }}>
                Tạo lô mới
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

export default TransferBatch;
