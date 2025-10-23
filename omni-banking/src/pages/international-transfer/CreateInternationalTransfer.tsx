import React, { useState } from 'react';
import {
  Card,
  Steps,
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Upload,
  message,
  Typography,
  Space,
  Alert,
  Descriptions,
  Radio,
  List,
  Divider,
} from 'antd';
import type { UploadFile, UploadProps } from 'antd';
import {
  GlobalOutlined,
  BankOutlined,
  FileTextOutlined,
  DollarOutlined,
  CheckCircleOutlined,
  UploadOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import AppLayout from '../../components/AppLayout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { InternationalTransferDocument } from '../../types';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface FormData {
  // Step 1: Transfer Information
  fromAccount: string;
  amount: number;
  currency: string;
  purpose: string;
  purposeDescription: string;

  // Step 2: Beneficiary Information
  beneficiaryName: string;
  beneficiaryAddress: string;
  beneficiaryCountry: string;
  beneficiaryBankName: string;
  beneficiaryBankAddress: string;
  beneficiarySwiftCode: string;
  beneficiaryAccountNumber: string;
  useIntermediaryBank: boolean;
  intermediaryBankName?: string;
  intermediaryBankAddress?: string;
  intermediarySwiftCode?: string;

  // Step 3: Documents (handled separately)

  // Step 4: Fee Type
  feeType: 'SHARE' | 'OUR' | 'BEN';
}

const CreateInternationalTransfer: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [documents, setDocuments] = useState<InternationalTransferDocument[]>([]);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [loading, setLoading] = useState(false);

  const foreignCurrencyAccounts = user?.accounts.filter(acc => acc.currency !== 'VND') || [];

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US').format(amount) + ' ' + currency;
  };

  // Purpose options
  const purposeOptions = [
    { value: 'payment_import', label: 'Thanh toán hàng hóa nhập khẩu' },
    { value: 'service_payment', label: 'Thanh toán dịch vụ' },
    { value: 'investment', label: 'Đầu tư vốn' },
    { value: 'education', label: 'Chi phí giáo dục' },
    { value: 'medical', label: 'Chi phí y tế' },
    { value: 'family_support', label: 'Hỗ trợ gia đình' },
    { value: 'other', label: 'Mục đích khác' },
  ];

  // Country options (some common countries)
  const countryOptions = [
    'United States',
    'United Kingdom',
    'Singapore',
    'Japan',
    'China',
    'South Korea',
    'Germany',
    'France',
    'Australia',
    'Canada',
  ];

  // Document type options
  const documentTypeOptions = [
    'Hợp đồng mua bán',
    'Hóa đơn thương mại',
    'Hợp đồng dịch vụ',
    'Giấy phép đầu tư',
    'Quyết định đầu tư',
    'Giấy báo học phí',
    'Thư mời nhập học',
    'Giấy hẹn khám',
    'Bảng báo giá điều trị',
    'Giấy xác nhận quan hệ gia đình',
    'Giấy phép nhập khẩu',
    'Danh mục hàng hóa',
    'Chứng từ khác',
  ];

  const handleFileUpload: UploadProps['beforeUpload'] = (file) => {
    const isValidType = ['image/jpeg', 'image/jpg', 'image/gif', 'image/png', 'application/pdf'].includes(file.type);
    if (!isValidType) {
      message.error('Chỉ chấp nhận file JPEG, JPG, GIF, PNG, PDF!');
      return Upload.LIST_IGNORE;
    }

    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      message.error('Kích thước file không được vượt quá 5MB!');
      return Upload.LIST_IGNORE;
    }

    // Check total size
    const currentTotalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const newTotalSize = currentTotalSize + file.size;
    const maxTotalSize = 50 * 1024 * 1024; // 50MB

    if (newTotalSize > maxTotalSize) {
      message.error('Tổng dung lượng tất cả file không được vượt quá 50MB!');
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  const handleAddDocument = (documentType: string, uploadFile: UploadFile) => {
    const newDoc: InternationalTransferDocument = {
      id: `DOC${Date.now()}`,
      documentType,
      fileName: uploadFile.name,
      fileSize: uploadFile.size || 0,
      uploadDate: new Date().toISOString(),
    };

    setDocuments([...documents, newDoc]);
    message.success(`Đã thêm file: ${uploadFile.name}`);
  };

  const handleRemoveDocument = (docId: string) => {
    setDocuments(documents.filter(doc => doc.id !== docId));
    message.success('Đã xóa file');
  };

  const handleNext = async () => {
    try {
      await form.validateFields();
      const values = form.getFieldsValue();

      // Save current step data
      setFormData({ ...formData, ...values });

      if (currentStep === 2 && documents.length === 0) {
        message.warning('Vui lòng tải lên ít nhất một chứng từ!');
        return;
      }

      setCurrentStep(currentStep + 1);
    } catch (error) {
      message.error('Vui lòng điền đầy đủ thông tin!');
    }
  };

  const handlePrev = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async (saveAsDraft: boolean = false) => {
    setLoading(true);

    try {
      const values = form.getFieldsValue();
      const finalData = { ...formData, ...values };

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      if (saveAsDraft) {
        message.success('Đã lưu nháp giao dịch chuyển tiền quốc tế!');
        navigate('/international-transfer/history');
      } else {
        message.success('Đã gửi yêu cầu chuyển tiền quốc tế! Vui lòng chờ OCB thẩm định hồ sơ.');
        navigate('/international-transfer/tracking');
      }
    } catch (error) {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <Form form={form} layout="vertical">
      <Alert
        message="Lưu ý về chuyển tiền quốc tế"
        description={
          <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
            <li>Số tiền chuyển tối đa 9 chữ số + 2 chữ số thập phân</li>
            <li>Cần cung cấp đầy đủ chứng từ hợp lệ theo quy định</li>
            <li>OCB sẽ thẩm định hồ sơ trong vòng 1-2 ngngày làm việc</li>
          </ul>
        }
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Form.Item
        label="Tài khoản ghi nợ"
        name="fromAccount"
        rules={[{ required: true, message: 'Vui lòng chọn tài khoản!' }]}
      >
        <Select placeholder="Chọn tài khoản ngoại tệ">
          {foreignCurrencyAccounts.map((acc) => (
            <Select.Option key={acc.accountNumber} value={acc.accountNumber}>
              {acc.accountNumber} - {acc.accountName} ({formatCurrency(acc.balance, acc.currency)})
            </Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Form.Item
        label="Số tiền chuyển"
        name="amount"
        rules={[
          { required: true, message: 'Vui lòng nhập số tiền!' },
          { type: 'number', min: 1, message: 'Số tiền phải lớn hơn 0!' },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="Nhập số tiền"
          formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
          parser={(value) => value!.replace(/\$\s?|(,*)/g, '')}
          precision={2}
          max={999999999.99}
        />
      </Form.Item>

      <Form.Item
        label="Loại ngoại tệ"
        name="currency"
        rules={[{ required: true, message: 'Vui lòng chọn loại ngoại tệ!' }]}
      >
        <Select placeholder="Chọn loại ngoại tệ">
          <Select.Option value="USD">USD - Đô la Mỹ</Select.Option>
          <Select.Option value="EUR">EUR - Euro</Select.Option>
          <Select.Option value="GBP">GBP - Bảng Anh</Select.Option>
          <Select.Option value="JPY">JPY - Yên Nhật</Select.Option>
          <Select.Option value="AUD">AUD - Đô la Úc</Select.Option>
          <Select.Option value="SGD">SGD - Đô la Singapore</Select.Option>
        </Select>
      </Form.Item>

      <Form.Item
        label="Mục đích chuyển tiền"
        name="purpose"
        rules={[{ required: true, message: 'Vui lòng chọn mục đích!' }]}
      >
        <Select placeholder="Chọn mục đích chuyển tiền" options={purposeOptions} />
      </Form.Item>

      <Form.Item
        label="Diễn giải chi tiết"
        name="purposeDescription"
        rules={[
          { required: true, message: 'Vui lòng nhập diễn giải!' },
          { max: 500, message: 'Diễn giải không được vượt quá 500 ký tự!' },
        ]}
      >
        <TextArea
          rows={4}
          placeholder="Nhập diễn giải chi tiết về mục đích chuyển tiền (tối đa 500 ký tự)"
          showCount
          maxLength={500}
        />
      </Form.Item>
    </Form>
  );

  const renderStep2 = () => (
    <Form form={form} layout="vertical">
      <Alert
        message="Thông tin người thụ hưởng"
        description="Vui lòng nhập chính xác thông tin người thụ hưởng và ngân hàng nhận tiền"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Title level={5}>Thông tin người thụ hưởng (Beneficiary)</Title>
      <Form.Item
        label="Tên người thụ hưởng"
        name="beneficiaryName"
        rules={[{ required: true, message: 'Vui lòng nhập tên người thụ hưởng!' }]}
      >
        <Input placeholder="Nhập tên đầy đủ của người thụ hưởng" />
      </Form.Item>

      <Form.Item
        label="Địa chỉ"
        name="beneficiaryAddress"
        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
      >
        <Input placeholder="Nhập địa chỉ đầy đủ" />
      </Form.Item>

      <Form.Item
        label="Quốc gia"
        name="beneficiaryCountry"
        rules={[{ required: true, message: 'Vui lòng chọn quốc gia!' }]}
      >
        <Select placeholder="Chọn quốc gia" showSearch>
          {countryOptions.map(country => (
            <Select.Option key={country} value={country}>{country}</Select.Option>
          ))}
        </Select>
      </Form.Item>

      <Divider />

      <Title level={5}>Thông tin ngân hàng nhận (Beneficiary Bank)</Title>
      <Form.Item
        label="Tên ngân hàng"
        name="beneficiaryBankName"
        rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng!' }]}
      >
        <Input placeholder="Nhập tên ngân hàng nhận tiền" />
      </Form.Item>

      <Form.Item
        label="Địa chỉ ngân hàng"
        name="beneficiaryBankAddress"
        rules={[{ required: true, message: 'Vui lòng nhập địa chỉ ngân hàng!' }]}
      >
        <Input placeholder="Nhập địa chỉ ngân hàng" />
      </Form.Item>

      <Form.Item
        label="Mã SWIFT"
        name="beneficiarySwiftCode"
        rules={[
          { required: true, message: 'Vui lòng nhập mã SWIFT!' },
          { pattern: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, message: 'Mã SWIFT không hợp lệ!' },
        ]}
      >
        <Input placeholder="Nhập mã SWIFT (8 hoặc 11 ký tự)" maxLength={11} />
      </Form.Item>

      <Form.Item
        label="Số tài khoản"
        name="beneficiaryAccountNumber"
        rules={[{ required: true, message: 'Vui lòng nhập số tài khoản!' }]}
      >
        <Input placeholder="Nhập số tài khoản người thụ hưởng" />
      </Form.Item>

      <Divider />

      <Form.Item
        label="Sử dụng ngân hàng trung gian"
        name="useIntermediaryBank"
        valuePropName="checked"
      >
        <Radio.Group>
          <Radio value={false}>Không</Radio>
          <Radio value={true}>Có</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item noStyle shouldUpdate={(prev, curr) => prev.useIntermediaryBank !== curr.useIntermediaryBank}>
        {({ getFieldValue }) => {
          const useIntermediary = getFieldValue('useIntermediaryBank');

          if (!useIntermediary) return null;

          return (
            <>
              <Title level={5}>Thông tin ngân hàng trung gian (Intermediary Bank)</Title>
              <Form.Item
                label="Tên ngân hàng trung gian"
                name="intermediaryBankName"
                rules={[{ required: true, message: 'Vui lòng nhập tên ngân hàng trung gian!' }]}
              >
                <Input placeholder="Nhập tên ngân hàng trung gian" />
              </Form.Item>

              <Form.Item
                label="Địa chỉ ngân hàng trung gian"
                name="intermediaryBankAddress"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input placeholder="Nhập địa chỉ ngân hàng trung gian" />
              </Form.Item>

              <Form.Item
                label="Mã SWIFT ngân hàng trung gian"
                name="intermediarySwiftCode"
                rules={[
                  { required: true, message: 'Vui lòng nhập mã SWIFT!' },
                  { pattern: /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, message: 'Mã SWIFT không hợp lệ!' },
                ]}
              >
                <Input placeholder="Nhập mã SWIFT (8 hoặc 11 ký tự)" maxLength={11} />
              </Form.Item>
            </>
          );
        }}
      </Form.Item>
    </Form>
  );

  const renderStep3 = () => {
    const [tempDocType, setTempDocType] = useState<string>('');
    const [tempFile, setTempFile] = useState<UploadFile | null>(null);

    const totalSize = documents.reduce((sum, doc) => sum + doc.fileSize, 0);
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);

    return (
      <div>
        <Alert
          message="Yêu cầu về chứng từ"
          description={
            <ul style={{ paddingLeft: 20, marginBottom: 0 }}>
              <li>Định dạng: JPEG, JPG, GIF, PNG, PDF</li>
              <li>Kích thước mỗi file: Tối đa 5MB</li>
              <li>Tổng dung lượng: Tối đa 50MB</li>
              <li>Cần tải lên ít nhất 1 chứng từ liên quan</li>
            </ul>
          }
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Card title="Tải lên chứng từ" style={{ marginBottom: 16 }}>
          <Space direction="vertical" style={{ width: '100%' }} size="large">
            <div>
              <Text strong>Loại chứng từ:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Chọn loại chứng từ"
                value={tempDocType}
                onChange={setTempDocType}
              >
                {documentTypeOptions.map(type => (
                  <Select.Option key={type} value={type}>{type}</Select.Option>
                ))}
              </Select>
            </div>

            <div>
              <Text strong>Chọn file:</Text>
              <Upload
                beforeUpload={handleFileUpload}
                maxCount={1}
                fileList={tempFile ? [tempFile] : []}
                onChange={({ fileList }) => {
                  if (fileList.length > 0) {
                    setTempFile(fileList[0]);
                  } else {
                    setTempFile(null);
                  }
                }}
                onRemove={() => setTempFile(null)}
              >
                <Button icon={<UploadOutlined />} style={{ marginTop: 8 }}>
                  Chọn file
                </Button>
              </Upload>
            </div>

            <Button
              type="primary"
              disabled={!tempDocType || !tempFile}
              onClick={() => {
                if (tempDocType && tempFile) {
                  handleAddDocument(tempDocType, tempFile);
                  setTempDocType('');
                  setTempFile(null);
                }
              }}
            >
              Thêm chứng từ
            </Button>
          </Space>
        </Card>

        <Card
          title={`Danh sách chứng từ đã tải (${documents.length} file - ${totalSizeMB}MB / 50MB)`}
        >
          {documents.length === 0 ? (
            <Text type="secondary">Chưa có chứng từ nào được tải lên</Text>
          ) : (
            <List
              dataSource={documents}
              renderItem={(doc) => (
                <List.Item
                  actions={[
                    <Button
                      type="link"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => handleRemoveDocument(doc.id)}
                    >
                      Xóa
                    </Button>
                  ]}
                >
                  <List.Item.Meta
                    title={doc.documentType}
                    description={
                      <>
                        <div>{doc.fileName}</div>
                        <div>Kích thước: {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</div>
                      </>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Card>
      </div>
    );
  };

  const renderStep4 = () => {
    const selectedAccount = foreignCurrencyAccounts.find(
      acc => acc.accountNumber === formData.fromAccount
    );

    return (
      <Form form={form} layout="vertical">
        <Alert
          message="Chọn phương thức thanh toán phí"
          description="Phí dịch vụ chuyển tiền quốc tế sẽ được tính dựa trên phương thức thanh toán phí bạn chọn"
          type="info"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Form.Item
          label="Phương thức thanh toán phí"
          name="feeType"
          rules={[{ required: true, message: 'Vui lòng chọn phương thức thanh toán phí!' }]}
        >
          <Radio.Group style={{ width: '100%' }}>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <Card
                hoverable
                onClick={() => form.setFieldValue('feeType', 'SHARE')}
                style={{
                  borderColor: form.getFieldValue('feeType') === 'SHARE' ? '#1890ff' : undefined,
                }}
              >
                <Radio value="SHARE">
                  <div style={{ marginLeft: 8 }}>
                    <Text strong>SHARE - Chia phí</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        Người gửi trả phí của OCB, người nhận trả phí của ngân hàng nhận.
                        Đây là phương thức phổ biến nhất.
                      </Text>
                    </div>
                  </div>
                </Radio>
              </Card>

              <Card
                hoverable
                onClick={() => form.setFieldValue('feeType', 'OUR')}
                style={{
                  borderColor: form.getFieldValue('feeType') === 'OUR' ? '#1890ff' : undefined,
                }}
              >
                <Radio value="OUR">
                  <div style={{ marginLeft: 8 }}>
                    <Text strong>OUR - Người gửi trả toàn bộ phí</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        Người gửi trả tất cả các loại phí (phí OCB + phí ngân hàng nhận + phí ngân hàng trung gian).
                        Người nhận sẽ nhận đủ số tiền.
                      </Text>
                    </div>
                  </div>
                </Radio>
              </Card>

              <Card
                hoverable
                onClick={() => form.setFieldValue('feeType', 'BEN')}
                style={{
                  borderColor: form.getFieldValue('feeType') === 'BEN' ? '#1890ff' : undefined,
                }}
              >
                <Radio value="BEN">
                  <div style={{ marginLeft: 8 }}>
                    <Text strong>BEN - Người nhận trả toàn bộ phí</Text>
                    <div style={{ marginTop: 8 }}>
                      <Text type="secondary">
                        Người nhận trả tất cả các loại phí. Số tiền người nhận nhận được sẽ bị trừ phí.
                        Phương thức này ít được sử dụng.
                      </Text>
                    </div>
                  </div>
                </Radio>
              </Card>
            </Space>
          </Radio.Group>
        </Form.Item>

        {selectedAccount && (
          <Alert
            message={`Tài khoản hiện tại: ${selectedAccount.accountNumber} - Số dư: ${formatCurrency(selectedAccount.balance, selectedAccount.currency)}`}
            type="warning"
            showIcon
            style={{ marginTop: 16 }}
          />
        )}
      </Form>
    );
  };

  const renderStep5 = () => {
    const values = form.getFieldsValue();
    const finalData = { ...formData, ...values };
    const selectedAccount = foreignCurrencyAccounts.find(
      acc => acc.accountNumber === finalData.fromAccount
    );

    const feeTypeLabels = {
      SHARE: 'SHARE - Chia phí',
      OUR: 'OUR - Người gửi trả toàn bộ phí',
      BEN: 'BEN - Người nhận trả toàn bộ phí',
    };

    const purposeLabel = purposeOptions.find(p => p.value === finalData.purpose)?.label || finalData.purpose;

    return (
      <div>
        <Alert
          message="Xác nhận thông tin"
          description="Vui lòng kiểm tra kỹ thông tin trước khi gửi yêu cầu. Sau khi gửi, bạn không thể chỉnh sửa."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Card title="Thông tin chuyển tiền" style={{ marginBottom: 16 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tài khoản ghi nợ">
              {selectedAccount?.accountNumber} - {selectedAccount?.accountName}
            </Descriptions.Item>
            <Descriptions.Item label="Số dư hiện tại">
              <Text strong style={{ fontSize: 16, color: '#1890ff' }}>
                {selectedAccount && formatCurrency(selectedAccount.balance, selectedAccount.currency)}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số tiền chuyển">
              <Text strong style={{ fontSize: 18, color: '#52c41a' }}>
                {formatCurrency(finalData.amount || 0, finalData.currency || 'USD')}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="Mục đích chuyển tiền">
              {purposeLabel}
            </Descriptions.Item>
            <Descriptions.Item label="Diễn giải chi tiết">
              {finalData.purposeDescription}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Thông tin người thụ hưởng" style={{ marginBottom: 16 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên người thụ hưởng">
              <Text strong>{finalData.beneficiaryName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {finalData.beneficiaryAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Quốc gia">
              {finalData.beneficiaryCountry}
            </Descriptions.Item>
          </Descriptions>
        </Card>

        <Card title="Thông tin ngân hàng nhận" style={{ marginBottom: 16 }}>
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Tên ngân hàng">
              <Text strong>{finalData.beneficiaryBankName}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Địa chỉ">
              {finalData.beneficiaryBankAddress}
            </Descriptions.Item>
            <Descriptions.Item label="Mã SWIFT">
              <Text code>{finalData.beneficiarySwiftCode}</Text>
            </Descriptions.Item>
            <Descriptions.Item label="Số tài khoản">
              <Text code>{finalData.beneficiaryAccountNumber}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>

        {finalData.useIntermediaryBank && (
          <Card title="Thông tin ngân hàng trung gian" style={{ marginBottom: 16 }}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên ngân hàng">
                <Text strong>{finalData.intermediaryBankName}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">
                {finalData.intermediaryBankAddress}
              </Descriptions.Item>
              <Descriptions.Item label="Mã SWIFT">
                <Text code>{finalData.intermediarySwiftCode}</Text>
              </Descriptions.Item>
            </Descriptions>
          </Card>
        )}

        <Card title="Chứng từ đã tải lên" style={{ marginBottom: 16 }}>
          <List
            dataSource={documents}
            renderItem={(doc) => (
              <List.Item>
                <List.Item.Meta
                  avatar={<FileTextOutlined style={{ fontSize: 24, color: '#1890ff' }} />}
                  title={doc.documentType}
                  description={`${doc.fileName} - ${(doc.fileSize / 1024 / 1024).toFixed(2)} MB`}
                />
              </List.Item>
            )}
          />
        </Card>

        <Card title="Phương thức thanh toán phí">
          <Descriptions column={1} bordered>
            <Descriptions.Item label="Phương thức">
              <Text strong>{feeTypeLabels[finalData.feeType as keyof typeof feeTypeLabels]}</Text>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    );
  };

  const steps = [
    {
      title: 'Thông tin chuyển tiền',
      icon: <GlobalOutlined />,
      content: renderStep1(),
    },
    {
      title: 'Người thụ hưởng',
      icon: <BankOutlined />,
      content: renderStep2(),
    },
    {
      title: 'Tải chứng từ',
      icon: <FileTextOutlined />,
      content: renderStep3(),
    },
    {
      title: 'Phí dịch vụ',
      icon: <DollarOutlined />,
      content: renderStep4(),
    },
    {
      title: 'Xác nhận',
      icon: <CheckCircleOutlined />,
      content: renderStep5(),
    },
  ];

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <GlobalOutlined style={{ marginRight: 12 }} />
          Tạo lệnh chuyển tiền quốc tế
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Thực hiện chuyển tiền ra nước ngoài với hệ thống SWIFT
        </p>
      </div>

      <Card>
        <Steps current={currentStep} items={steps} style={{ marginBottom: 32 }} />

        <div style={{ marginTop: 32 }}>
          {steps[currentStep].content}
        </div>

        <div style={{ marginTop: 32, textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={handlePrev}>
                Quay lại
              </Button>
            )}

            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={handleNext}>
                Tiếp theo
              </Button>
            )}

            {currentStep === steps.length - 1 && (
              <>
                <Button onClick={() => handleSubmit(true)} loading={loading}>
                  Lưu nháp
                </Button>
                <Button type="primary" onClick={() => handleSubmit(false)} loading={loading}>
                  Gửi yêu cầu
                </Button>
              </>
            )}
          </Space>
        </div>
      </Card>
    </AppLayout>
  );
};

export default CreateInternationalTransfer;
