import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Modal } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Login.css';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [changePasswordForm] = Form.useForm();
  const navigate = useNavigate();
  const { login, changePassword } = useAuth();

  const onFinish = async (values: { username: string; password: string }) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);

      if (result.success) {
        if (result.requirePasswordChange) {
          message.warning('Đây là lần đăng nhập đầu tiên. Vui lòng đổi mật khẩu!');
          setShowChangePassword(true);
        } else {
          message.success('Đăng nhập thành công!');
          navigate('/dashboard');
        }
      } else {
        message.error(result.error || 'Đăng nhập thất bại!');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: { newPassword: string; confirmPassword: string }) => {
    if (values.newPassword !== values.confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp!');
      return;
    }

    if (values.newPassword.length < 6) {
      message.error('Mật khẩu phải có ít nhất 6 ký tự!');
      return;
    }

    try {
      const success = await changePassword(values.newPassword);
      if (success) {
        message.success('Đổi mật khẩu thành công!');
        setShowChangePassword(false);
        navigate('/dashboard');
      } else {
        message.error('Đổi mật khẩu thất bại!');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra. Vui lòng thử lại!');
    }
  };

  return (
    <div className="login-container">
      <div className="login-wrapper">
        <div className="login-header">
          <div className="logo">
            <h1>OMNI CORP</h1>
            <p>OCB - Ngân hàng số dành cho doanh nghiệp</p>
          </div>
        </div>

        <Card className="login-card">
          <h2 className="login-title">Đăng nhập</h2>
          <p className="login-subtitle">Vui lòng nhập thông tin đăng nhập</p>

          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input
                prefix={<UserOutlined />}
                placeholder="Tên đăng nhập"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="Mật khẩu"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
              >
                Đăng nhập
              </Button>
            </Form.Item>
          </Form>

          <div className="login-help">
            <p>Hotline hỗ trợ: <strong>1900 6678</strong></p>
            <p>Email: <strong>support@ocb.com.vn</strong></p>
          </div>

          <div className="login-demo-info">
            <p><strong>Tài khoản demo:</strong></p>
            <p>Username: <code>user_demo</code> | Password: <code>OCB@2024</code></p>
            <p>Username: <code>company_demo</code> | Password: <code>OCB@2024</code></p>
          </div>
        </Card>
      </div>

      {/* Modal Đổi mật khẩu lần đầu */}
      <Modal
        title="Đổi mật khẩu lần đầu tiên"
        open={showChangePassword}
        onCancel={() => {
          message.warning('Bạn cần đổi mật khẩu để tiếp tục!');
        }}
        footer={null}
        closable={false}
      >
        <p style={{ marginBottom: 20, color: '#ff4d4f' }}>
          Đây là lần đăng nhập đầu tiên. Vui lòng đổi mật khẩu do OCB cung cấp để tiếp tục.
        </p>
        <Form
          form={changePasswordForm}
          onFinish={handleChangePassword}
          layout="vertical"
        >
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
            ]}
          >
            <Input.Password placeholder="Nhập mật khẩu mới" />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Xác nhận mật khẩu"
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' }
            ]}
          >
            <Input.Password placeholder="Nhập lại mật khẩu mới" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Login;
