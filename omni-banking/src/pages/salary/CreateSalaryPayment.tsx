import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  Button,
  Steps,
  Typography,
  Space,
  message,
  Radio,
  Upload,
  Table,
  Alert,
  Divider,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type { UploadProps } from 'antd';
import {
  UploadOutlined,
  CheckCircleOutlined,
  DollarOutlined,
  FileExcelOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import type { SalaryPaymentItem } from '../../types';

const { Title, Text } = Typography;

const CreateSalaryPayment: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [items, setItems] = useState<SalaryPaymentItem[]>([]);
  const [loading, setLoading] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  // Mock file upload and validation
  const handleUpload: UploadProps['customRequest'] = (options) => {
    setLoading(true);

    // Simulate file processing
    setTimeout(() => {
      const mockItems: SalaryPaymentItem[] = [
        {
          id: 'EMP001',
          employeeId: 'NV001',
          employeeName: 'Nguyễn Văn A',
          accountNumber: '0021111111111',
          bankCode: 'OCB',
          bankName: 'Ngân hàng TMCP Phương Đông',
          amount: 12000000,
          status: 'ok',
        },
        {
          id: 'EMP002',
          employeeId: 'NV002',
          employeeName: 'Trần Thị B',
          accountNumber: '0021111111112',
          bankCode: 'OCB',
          bankName: 'Ngân hàng TMCP Phương Đông',
          amount: 15000000,
          status: 'ok',
        },
        {
          id: 'EMP003',
          employeeId: 'NV003',
          employeeName: 'Lê Văn C',
          accountNumber: '0021111111113',
          amount: 10000000,
          status: 'ok',
        },
        {
          id: 'EMP004',
          employeeId: 'NV004',
          employeeName: 'Phạm Văn D',
          accountNumber: 'INVALID',
          amount: 8000000,
          status: 'error',
          errorMessage: 'Số tài khoản không hợp lệ',
        },
        {
          id: 'EMP005',
          employeeId: 'NV005',
          employeeName: 'Hoàng Thị E',
          accountNumber: '0031111111112',
          bankCode: 'VCB',
          bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam',
          amount: 0,
          status: 'error',
          errorMessage: 'Số tiền phải lớn hơn 0',
        },
      ];

      setItems(mockItems);
      setLoading(false);
      setCurrentStep(1);
      message.success('Tải file thành công! Hãy kiểm tra danh sách.');
    }, 1500);
  };

  const handleValidate = () => {
    const errorCount = items.filter(item => item.status === 'error').length;

    if (errorCount > 0) {
      message.error(`Có ${errorCount} nhân viên có lỗi. Vui lòng kiểm tra và sửa file!`);
      return;
    }

    message.success('Kiểm tra thành công! Tất cả dữ liệu hợp lệ.');
    setCurrentStep(2);
  };

  const handleCreateOrder = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Mock create order
      setTimeout(() => {
        setLoading(false);
        message.success('Tạo lệnh chi lương thành công!');
        setCurrentStep(3);
      }, 1500);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentStep(0);
    setItems([]);
  };

  const columns: ColumnsType<SalaryPaymentItem> = [
    {
      title: 'STT',
      key: 'index',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Mã NV',
      dataIndex: 'employeeId',
      key: 'employeeId',
      width: 100,
    },
    {
      title: 'Họ và tên',
      dataIndex: 'employeeName',
      key: 'employeeName',
      width: 180,
    },
    {
      title: 'Số tài khoản',
      dataIndex: 'accountNumber',
      key: 'accountNumber',
      width: 150,
    },
    {
      title: 'Ngân hàng',
      dataIndex: 'bankName',
      key: 'bankName',
      ellipsis: true,
      render: (bankName: string) => bankName || '-',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      width: 130,
      align: 'right',
      render: (amount: number) => (
        <Text strong style={{ color: '#1890ff' }}>
          {formatCurrency(amount)}
        </Text>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      align: 'center',
      render: (status: string, record: SalaryPaymentItem) => {
        if (status === 'ok') {
          return <Text style={{ color: '#52c41a', fontWeight: 'bold' }}>OK</Text>;
        }
        return (
          <div>
            <Text style={{ color: '#cf1322', fontWeight: 'bold' }}>ERROR</Text>
            {record.errorMessage && (
              <div style={{ fontSize: 11, color: '#cf1322', marginTop: 2 }}>
                {record.errorMessage}
              </div>
            )}
          </div>
        );
      },
    },
  ];

  const steps = [
    {
      title: 'Chọn thông tin',
      icon: <DollarOutlined />,
    },
    {
      title: 'Tải file & Kiểm tra',
      icon: <FileExcelOutlined />,
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

  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);
  const okCount = items.filter(item => item.status === 'ok').length;
  const errorCount = items.filter(item => item.status === 'error').length;
  const feeAmount = okCount * 220; // Mock fee calculation

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <DollarOutlined style={{ marginRight: 12 }} />
          Chuyển khoản chi lương bảo mật
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tạo lệnh chi lương cho nhân viên với bảo mật cao
        </p>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        {/* Step 1: Basic Info */}
        {currentStep === 0 && (
          <Form form={form} layout="vertical">
            <Card title="Thông tin cơ bản" style={{ marginBottom: 24 }}>
              <Form.Item
                name="fromAccount"
                label="Tài khoản nguồn"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản!' }]}
              >
                <Select placeholder="Chọn tài khoản nguồn" size="large">
                  {user?.accounts.filter(a => a.currency === 'VND').map((acc) => (
                    <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.availableBalance)})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item
                name="subAccount"
                label="Tài khoản phụ (không bắt buộc)"
                tooltip="Tài khoản phụ dùng để phân biệt các đợt chi lương"
              >
                <Input placeholder="Nhập số tài khoản phụ" size="large" />
              </Form.Item>

              <Form.Item
                name="transferType"
                label="Loại giao dịch"
                rules={[{ required: true, message: 'Vui lòng chọn loại giao dịch!' }]}
                initialValue="internal"
              >
                <Radio.Group size="large">
                  <Radio value="internal">Trong hệ thống OCB</Radio>
                  <Radio value="external">Ngoài hệ thống (Liên ngân hàng)</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                name="batchName"
                label="Tên đợt chi lương"
                rules={[{ required: true, message: 'Vui lòng nhập tên đợt chi lương!' }]}
              >
                <Input placeholder="VD: Chi lương tháng 11/2025" size="large" />
              </Form.Item>
            </Card>

            <Button type="primary" size="large" onClick={() => setCurrentStep(1)}>
              Tiếp tục
            </Button>
          </Form>
        )}

        {/* Step 2: Upload & Validate */}
        {currentStep === 1 && (
          <>
            <Card title="Tải file danh sách nhân viên" style={{ marginBottom: 24 }}>
              <Alert
                message="Hướng dẫn"
                description={
                  <div>
                    <p>File Excel phải có các cột: Mã NV, Họ tên, Số TK, Mã NH (nếu ngoài hệ thống), Số tiền</p>
                    <p>Tải file mẫu tại đây: <a href="#">Template_ChiLuong.xlsx</a></p>
                  </div>
                }
                type="info"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Upload
                accept=".xlsx,.xls"
                customRequest={handleUpload}
                showUploadList={false}
                disabled={items.length > 0}
              >
                <Button icon={<UploadOutlined />} size="large" loading={loading}>
                  {items.length > 0 ? 'Đã tải file' : 'Chọn file Excel'}
                </Button>
              </Upload>

              {items.length > 0 && (
                <Button
                  style={{ marginLeft: 8 }}
                  onClick={() => setItems([])}
                >
                  Tải lại file khác
                </Button>
              )}
            </Card>

            {items.length > 0 && (
              <>
                {/* Statistics */}
                <Card style={{ marginBottom: 16 }}>
                  <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#666' }}>Tổng số nhân viên</div>
                      <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
                        {items.length}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#666' }}>Hợp lệ (OK)</div>
                      <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
                        {okCount}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#666' }}>Lỗi (ERROR)</div>
                      <div style={{ fontSize: 28, fontWeight: 'bold', color: '#cf1322' }}>
                        {errorCount}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#666' }}>Tổng tiền</div>
                      <div style={{ fontSize: 24, fontWeight: 'bold', color: '#fa8c16' }}>
                        {formatCurrency(totalAmount)}
                      </div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 14, color: '#666' }}>Phí dự kiến</div>
                      <div style={{ fontSize: 20, fontWeight: 'bold', color: '#666' }}>
                        {formatCurrency(feeAmount)}
                      </div>
                    </div>
                  </Space>
                </Card>

                {/* Items Table */}
                <Card title={`Danh sách nhân viên (${items.length})`} style={{ marginBottom: 24 }}>
                  <Table
                    columns={columns}
                    dataSource={items}
                    rowKey="id"
                    pagination={false}
                    scroll={{ x: 900 }}
                  />
                </Card>

                <Space>
                  <Button size="large" onClick={() => setCurrentStep(0)}>
                    Quay lại
                  </Button>
                  <Button
                    type="primary"
                    size="large"
                    onClick={handleValidate}
                    disabled={errorCount > 0}
                  >
                    Kiểm tra và tiếp tục
                  </Button>
                </Space>
              </>
            )}
          </>
        )}

        {/* Step 3: Confirm */}
        {currentStep === 2 && (
          <>
            <Card title="Xác nhận thông tin" style={{ marginBottom: 24 }}>
              <Alert
                message="Vui lòng kiểm tra kỹ thông tin trước khi tạo lệnh"
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
              />

              <Divider orientation="left">Thông tin chung</Divider>
              <p><strong>Tên đợt:</strong> {form.getFieldValue('batchName')}</p>
              <p><strong>Tài khoản nguồn:</strong> {form.getFieldValue('fromAccount')}</p>
              <p><strong>Tài khoản phụ:</strong> {form.getFieldValue('subAccount') || 'Không có'}</p>
              <p><strong>Loại giao dịch:</strong> {form.getFieldValue('transferType') === 'internal' ? 'Trong hệ thống' : 'Ngoài hệ thống'}</p>

              <Divider orientation="left">Thống kê</Divider>
              <p><strong>Số lượng nhân viên:</strong> {okCount} người</p>
              <p><strong>Tổng tiền chi lương:</strong> <Text style={{ fontSize: 18, color: '#1890ff', fontWeight: 'bold' }}>{formatCurrency(totalAmount)}</Text></p>
              <p><strong>Phí giao dịch:</strong> {formatCurrency(feeAmount)}</p>
              <p><strong>Tổng cộng:</strong> <Text style={{ fontSize: 20, color: '#cf1322', fontWeight: 'bold' }}>{formatCurrency(totalAmount + feeAmount)}</Text></p>
            </Card>

            <Space>
              <Button size="large" onClick={() => setCurrentStep(1)}>
                Quay lại
              </Button>
              <Button
                type="primary"
                size="large"
                onClick={handleCreateOrder}
                loading={loading}
              >
                Tạo lệnh chi lương
              </Button>
            </Space>
          </>
        )}

        {/* Step 4: Success */}
        {currentStep === 3 && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <CheckCircleOutlined style={{ fontSize: 72, color: '#52c41a', marginBottom: 24 }} />
            <Title level={3}>Tạo lệnh chi lương thành công!</Title>
            <p style={{ fontSize: 16, color: '#666', marginBottom: 32 }}>
              Lệnh chi lương đã được tạo và đang chờ phê duyệt.<br />
              Mã lô: <Text strong>SAL{Date.now()}</Text>
            </p>
            <Space>
              <Button size="large" onClick={handleReset}>
                Tạo lệnh mới
              </Button>
              <Button type="primary" size="large" onClick={() => window.location.href = '/salary/approval'}>
                Xem danh sách chờ duyệt
              </Button>
            </Space>
          </div>
        )}
      </Card>
    </AppLayout>
  );
};

export default CreateSalaryPayment;
