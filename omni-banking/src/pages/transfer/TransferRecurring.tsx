import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Select,
  DatePicker,
  Button,
  InputNumber,
  message,
  Table,
  Tag,
  Space,
  Typography,
  Modal,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  ClockCircleOutlined,
  PlusOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import { useAuth } from '../../context/AuthContext';
import AppLayout from '../../components/AppLayout';
import dayjs from 'dayjs';

const { Title } = Typography;
const { TextArea } = Input;

interface RecurringItem {
  id: string;
  transactionName: string;
  fromAccount: string;
  beneficiaryAccount: string;
  beneficiaryName: string;
  amount: number;
  content: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextExecutionDate: string;
  status: 'active' | 'paused';
  totalExecutions: number;
}

const TransferRecurring: React.FC = () => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [recurringList, setRecurringList] = useState<RecurringItem[]>([
    {
      id: '1',
      transactionName: 'Trả tiền thuê nhà hàng tháng',
      fromAccount: '0011234567890',
      beneficiaryAccount: '0019876543210',
      beneficiaryName: 'Nguyễn Văn A',
      amount: 10000000,
      content: 'Tiền thuê nhà tháng',
      frequency: 'monthly',
      nextExecutionDate: '2025-11-01',
      status: 'active',
      totalExecutions: 6,
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN').format(amount) + ' VND';
  };

  const handleSubmit = async (values: any) => {
    message.loading({ content: 'Đang tạo lệnh định kỳ...', key: 'submit' });

    setTimeout(() => {
      const newItem: RecurringItem = {
        id: Date.now().toString(),
        ...values,
        status: 'active',
        totalExecutions: 0,
        nextExecutionDate: values.startDate.format('YYYY-MM-DD'),
      };

      setRecurringList([newItem, ...recurringList]);
      message.success({ content: 'Tạo lệnh định kỳ thành công!', key: 'submit' });
      setIsModalOpen(false);
      form.resetFields();
    }, 1000);
  };

  const handleToggleStatus = (id: string) => {
    setRecurringList(
      recurringList.map(item =>
        item.id === id
          ? { ...item, status: item.status === 'active' ? 'paused' : 'active' }
          : item
      )
    );
    message.success('Cập nhật trạng thái thành công!');
  };

  const handleDelete = (id: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa lệnh chuyển tiền định kỳ này?',
      onOk: () => {
        setRecurringList(recurringList.filter(item => item.id !== id));
        message.success('Xóa lệnh thành công!');
      },
    });
  };

  const columns: ColumnsType<RecurringItem> = [
    {
      title: 'Tên giao dịch',
      dataIndex: 'transactionName',
      key: 'transactionName',
      width: 200,
    },
    {
      title: 'Người thụ hưởng',
      dataIndex: 'beneficiaryName',
      key: 'beneficiaryName',
      render: (name: string, record: RecurringItem) => (
        <div>
          <div>{name}</div>
          <div style={{ fontSize: 12, color: '#999' }}>{record.beneficiaryAccount}</div>
        </div>
      ),
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      align: 'right',
      render: (amount: number) => <strong>{formatCurrency(amount)}</strong>,
    },
    {
      title: 'Chu kỳ',
      dataIndex: 'frequency',
      key: 'frequency',
      render: (freq: string) => (
        <Tag color="blue">
          {freq === 'daily' && 'Hàng ngày'}
          {freq === 'weekly' && 'Hàng tuần'}
          {freq === 'monthly' && 'Hàng tháng'}
        </Tag>
      ),
    },
    {
      title: 'Lần thực hiện tiếp theo',
      dataIndex: 'nextExecutionDate',
      key: 'nextExecutionDate',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Số lần đã thực hiện',
      dataIndex: 'totalExecutions',
      key: 'totalExecutions',
      align: 'center',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'success' : 'warning'}>
          {status === 'active' ? 'Đang hoạt động' : 'Tạm dừng'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: RecurringItem) => (
        <Space>
          <Button
            size="small"
            icon={record.status === 'active' ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
            onClick={() => handleToggleStatus(record.id)}
          >
            {record.status === 'active' ? 'Tạm dừng' : 'Kích hoạt'}
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <ClockCircleOutlined style={{ marginRight: 12 }} />
          Chuyển tiền định kỳ
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Đặt lệnh chuyển tiền định kỳ đến tài khoản OCB
        </p>
      </div>

      <Card
        title="Danh sách lệnh chuyển tiền định kỳ"
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Tạo lệnh mới
          </Button>
        }
      >
        <Table
          columns={columns}
          dataSource={recurringList}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* Modal Create */}
      <Modal
        title="Tạo lệnh chuyển tiền định kỳ"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        width={700}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="transactionName"
            label="Tên giao dịch"
            rules={[{ required: true, message: 'Vui lòng nhập tên giao dịch!' }]}
          >
            <Input placeholder="VD: Trả tiền thuê nhà hàng tháng" />
          </Form.Item>

          <Form.Item
            name="fromAccount"
            label="Tài khoản nguồn"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn tài khoản">
              {user?.accounts.filter(a => a.currency === 'VND').map((acc) => (
                <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                  {acc.accountNumber} - {acc.accountName}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="beneficiaryAccount"
            label="Số tài khoản người thụ hưởng (OCB)"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập số tài khoản OCB" />
          </Form.Item>

          <Form.Item
            name="beneficiaryName"
            label="Tên người thụ hưởng"
            rules={[{ required: true }]}
          >
            <Input placeholder="Nhập tên người thụ hưởng" />
          </Form.Item>

          <Form.Item
            name="amount"
            label="Số tiền"
            rules={[{ required: true }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="Nhập số tiền"
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
              addonAfter="VND"
            />
          </Form.Item>

          <Form.Item
            name="content"
            label="Nội dung"
            rules={[{ required: true }]}
          >
            <TextArea rows={2} placeholder="Nhập nội dung chuyển khoản" />
          </Form.Item>

          <Form.Item
            name="frequency"
            label="Chu kỳ"
            rules={[{ required: true }]}
          >
            <Select placeholder="Chọn chu kỳ">
              <Select.Option value="daily">Hàng ngày</Select.Option>
              <Select.Option value="weekly">Hàng tuần</Select.Option>
              <Select.Option value="monthly">Hàng tháng</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="startDate"
            label="Ngày bắt đầu"
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item
            name="endDate"
            label="Ngày kết thúc"
            rules={[{ required: true }]}
          >
            <DatePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              disabledDate={(current) => current && current < dayjs().startOf('day')}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                Tạo lệnh
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </AppLayout>
  );
};

export default TransferRecurring;
