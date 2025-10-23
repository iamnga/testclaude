import React, { useState } from 'react';
import {
  Card,
  Tabs,
  Form,
  Input,
  Button,
  Select,
  Upload,
  Avatar,
  Space,
  Typography,
  message,
  Alert,
  Divider,
  Row,
  Col,
} from 'antd';
import {
  SettingOutlined,
  LockOutlined,
  UserOutlined,
  BankOutlined,
  PhoneOutlined,
  MailOutlined,
  CameraOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import type { UploadProps } from 'antd';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [passwordForm] = Form.useForm();
  const [usernameForm] = Form.useForm();
  const [contactForm] = Form.useForm();
  const [defaultAccountForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);

  const handleChangePassword = async () => {
    try {
      const values = await passwordForm.validateFields();
      setLoading(true);

      // Mock password change
      setTimeout(() => {
        setLoading(false);
        message.success('Đổi mật khẩu thành công!');
        passwordForm.resetFields();
      }, 1000);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleChangeUsername = async () => {
    try {
      const values = await usernameForm.validateFields();
      setLoading(true);

      // Mock username change
      setTimeout(() => {
        setLoading(false);
        message.success('Thay đổi tên đăng nhập thành công!');
      }, 1000);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleUpdateContact = async () => {
    try {
      const values = await contactForm.validateFields();
      setLoading(true);

      // Mock contact update
      setTimeout(() => {
        setLoading(false);
        message.success('Cập nhật thông tin liên lạc thành công!');
      }, 1000);
    } catch (error) {
      message.error('Vui lòng nhập đầy đủ thông tin!');
    }
  };

  const handleSetDefaultAccount = async () => {
    try {
      const values = await defaultAccountForm.validateFields();
      setLoading(true);

      // Mock default account setting
      setTimeout(() => {
        setLoading(false);
        message.success('Thiết lập tài khoản mặc định thành công!');
      }, 1000);
    } catch (error) {
      message.error('Vui lòng chọn tài khoản!');
    }
  };

  const uploadProps: UploadProps = {
    name: 'avatar',
    showUploadList: false,
    beforeUpload: (file) => {
      const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
      if (!isJpgOrPng) {
        message.error('Chỉ hỗ trợ file JPG/PNG!');
        return false;
      }
      const isLt2M = file.size / 1024 / 1024 < 2;
      if (!isLt2M) {
        message.error('Kích thước ảnh phải nhỏ hơn 2MB!');
        return false;
      }

      // Mock upload
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setAvatarUrl(reader.result as string);
        message.success('Tải ảnh đại diện thành công!');
      });
      reader.readAsDataURL(file);
      return false;
    },
  };

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <SettingOutlined style={{ marginRight: 12 }} />
          Cài đặt cá nhân
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Quản lý thông tin cá nhân và cài đặt tài khoản
        </p>
      </div>

      <Card>
        <Tabs defaultActiveKey="password" tabPosition="left">
          {/* Change Password Tab */}
          <TabPane
            tab={
              <span>
                <LockOutlined />
                Đổi mật khẩu
              </span>
            }
            key="password"
          >
            <Title level={4}>Đổi mật khẩu</Title>
            <Alert
              message="Lưu ý khi đổi mật khẩu"
              description={
                <div>
                  <p>• Mật khẩu phải có ít nhất 8 ký tự</p>
                  <p>• Bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt</p>
                  <p style={{ marginBottom: 0 }}>• Không sử dụng mật khẩu cũ hoặc quá đơn giản</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={passwordForm}
              layout="vertical"
              style={{ maxWidth: 500 }}
            >
              <Form.Item
                name="currentPassword"
                label="Mật khẩu hiện tại"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="newPassword"
                label="Mật khẩu mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' },
                ]}
              >
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác nhận mật khẩu mới"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleChangePassword}
                  loading={loading}
                >
                  Đổi mật khẩu
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Change Username Tab */}
          <TabPane
            tab={
              <span>
                <UserOutlined />
                Tên đăng nhập
              </span>
            }
            key="username"
          >
            <Title level={4}>Thay đổi tên đăng nhập</Title>
            <Alert
              message="Tên đăng nhập hiện tại"
              description={
                <Text strong style={{ fontSize: 16 }}>
                  {user?.username}
                </Text>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={usernameForm}
              layout="vertical"
              style={{ maxWidth: 500 }}
            >
              <Form.Item
                name="newUsername"
                label="Tên đăng nhập mới"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên đăng nhập mới!' },
                  { min: 6, message: 'Tên đăng nhập phải có ít nhất 6 ký tự!' },
                  { pattern: /^[a-zA-Z0-9_]+$/, message: 'Chỉ được dùng chữ cái, số và dấu gạch dưới!' },
                ]}
              >
                <Input size="large" prefix={<UserOutlined />} />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu xác nhận"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu để xác nhận!' }]}
              >
                <Input.Password size="large" prefix={<LockOutlined />} />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleChangeUsername}
                  loading={loading}
                >
                  Thay đổi tên đăng nhập
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Default Account Tab */}
          <TabPane
            tab={
              <span>
                <BankOutlined />
                TK mặc định
              </span>
            }
            key="defaultAccount"
          >
            <Title level={4}>Tài khoản mặc định khi chuyển tiền</Title>
            <Alert
              message="Về tài khoản mặc định"
              description="Tài khoản được chọn sẽ tự động hiển thị khi bạn thực hiện chuyển tiền, giúp tiết kiệm thời gian."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={defaultAccountForm}
              layout="vertical"
              style={{ maxWidth: 500 }}
              initialValues={{ defaultAccount: user?.accounts[0]?.accountNumber }}
            >
              <Form.Item
                name="defaultAccount"
                label="Chọn tài khoản mặc định"
                rules={[{ required: true, message: 'Vui lòng chọn tài khoản!' }]}
              >
                <Select size="large" placeholder="Chọn tài khoản">
                  {user?.accounts.map((acc) => (
                    <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
                      {acc.accountNumber} - {acc.accountName} ({acc.currency})
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleSetDefaultAccount}
                  loading={loading}
                >
                  Thiết lập tài khoản mặc định
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Contact Information Tab */}
          <TabPane
            tab={
              <span>
                <PhoneOutlined />
                Thông tin liên lạc
              </span>
            }
            key="contact"
          >
            <Title level={4}>Thông tin liên lạc</Title>
            <Alert
              message="Cập nhật thông tin liên lạc"
              description="Thông tin này sẽ được sử dụng để liên hệ với bạn khi cần thiết."
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Form
              form={contactForm}
              layout="vertical"
              style={{ maxWidth: 500 }}
              initialValues={{
                email: user?.email,
                phone: user?.phone,
              }}
            >
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' },
                ]}
              >
                <Input size="large" prefix={<MailOutlined />} />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: 'Vui lòng nhập số điện thoại!' },
                  { pattern: /^[0-9]{10,11}$/, message: 'Số điện thoại không hợp lệ!' },
                ]}
              >
                <Input size="large" prefix={<PhoneOutlined />} />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa chỉ"
              >
                <Input.TextArea rows={3} size="large" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  size="large"
                  onClick={handleUpdateContact}
                  loading={loading}
                >
                  Cập nhật thông tin
                </Button>
              </Form.Item>
            </Form>
          </TabPane>

          {/* Profile Picture Tab */}
          <TabPane
            tab={
              <span>
                <CameraOutlined />
                Ảnh đại diện
              </span>
            }
            key="avatar"
          >
            <Title level={4}>Quản lý ảnh đại diện</Title>
            <Alert
              message="Yêu cầu ảnh đại diện"
              description={
                <div>
                  <p>• Định dạng: JPG hoặc PNG</p>
                  <p>• Kích thước tối đa: 2MB</p>
                  <p style={{ marginBottom: 0 }}>• Khuyến nghị: Ảnh vuông, kích thước 200x200 pixels trở lên</p>
                </div>
              }
              type="info"
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Row gutter={24}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <Avatar
                    size={200}
                    icon={<UserOutlined />}
                    src={avatarUrl}
                    style={{ marginBottom: 16 }}
                  />
                  <div>
                    <Text type="secondary">Ảnh đại diện hiện tại</Text>
                  </div>
                </div>
              </Col>
              <Col span={12}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Upload {...uploadProps}>
                    <Button icon={<UploadOutlined />} size="large" block>
                      Chọn ảnh mới
                    </Button>
                  </Upload>
                  {avatarUrl && (
                    <Button
                      danger
                      size="large"
                      block
                      onClick={() => {
                        setAvatarUrl(undefined);
                        message.info('Đã xóa ảnh đại diện');
                      }}
                    >
                      Xóa ảnh đại diện
                    </Button>
                  )}
                </Space>
              </Col>
            </Row>
          </TabPane>
        </Tabs>
      </Card>
    </AppLayout>
  );
};

export default Settings;
