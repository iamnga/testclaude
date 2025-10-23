import React, { useState, useMemo } from 'react';
import {
  Card,
  Table,
  Button,
  Tag,
  Space,
  Typography,
  Select,
  Input,
  Modal,
  Descriptions,
  Alert,
  Tabs,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import {
  EnvironmentOutlined,
  SearchOutlined,
  FilterOutlined,
  PhoneOutlined,
  ClockCircleOutlined,
  BankOutlined,
} from '@ant-design/icons';
import { mockATMBranches } from '../../data/mockData';
import AppLayout from '../../components/AppLayout';
import type { ATMBranch } from '../../types';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const ATMBranchLocator: React.FC = () => {
  const [searchKeyword, setSearchKeyword] = useState('');
  const [cityFilter, setCityFilter] = useState<string>('all');
  const [districtFilter, setDistrictFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'atm' | 'branch'>('all');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<ATMBranch | null>(null);

  const cities = useMemo(() => {
    return Array.from(new Set(mockATMBranches.map((item) => item.city)));
  }, []);

  const districts = useMemo(() => {
    if (cityFilter === 'all') return [];
    return Array.from(
      new Set(
        mockATMBranches.filter((item) => item.city === cityFilter).map((item) => item.district)
      )
    );
  }, [cityFilter]);

  const filteredLocations = useMemo(() => {
    let filtered = [...mockATMBranches];

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((item) => item.type === typeFilter);
    }

    // Filter by city
    if (cityFilter !== 'all') {
      filtered = filtered.filter((item) => item.city === cityFilter);
    }

    // Filter by district
    if (districtFilter !== 'all') {
      filtered = filtered.filter((item) => item.district === districtFilter);
    }

    // Filter by keyword
    if (searchKeyword) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
          item.address.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    return filtered;
  }, [typeFilter, cityFilter, districtFilter, searchKeyword]);

  const handleViewDetail = (record: ATMBranch) => {
    setSelectedLocation(record);
    setDetailModalVisible(true);
  };

  const getTypeTag = (type: string) => {
    return type === 'atm' ? (
      <Tag color="blue">ATM</Tag>
    ) : (
      <Tag color="green">Chi nhánh</Tag>
    );
  };

  const getATMTypeTag = (atmType?: string) => {
    if (!atmType) return null;
    const typeMap: Record<string, { color: string; text: string }> = {
      withdraw: { color: 'orange', text: 'Rút tiền' },
      deposit: { color: 'cyan', text: 'Nộp tiền' },
      both: { color: 'purple', text: 'Rút & Nộp' },
    };
    const t = typeMap[atmType];
    return <Tag color={t.color}>{t.text}</Tag>;
  };

  const columns: ColumnsType<ATMBranch> = [
    {
      title: 'Loại',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      fixed: 'left',
      render: (type: string) => getTypeTag(type),
    },
    {
      title: 'Tên',
      dataIndex: 'name',
      key: 'name',
      width: 250,
      fixed: 'left',
      render: (name: string) => <Text strong>{name}</Text>,
    },
    {
      title: 'Địa chỉ',
      dataIndex: 'address',
      key: 'address',
      ellipsis: true,
      width: 300,
    },
    {
      title: 'Quận/Huyện',
      dataIndex: 'district',
      key: 'district',
      width: 150,
    },
    {
      title: 'Thành phố',
      dataIndex: 'city',
      key: 'city',
      width: 130,
    },
    {
      title: 'Loại ATM',
      dataIndex: 'atmType',
      key: 'atmType',
      width: 120,
      render: (atmType?: string, record: ATMBranch) => {
        if (record.type === 'branch') return '-';
        return getATMTypeTag(atmType);
      },
    },
    {
      title: '24/7',
      dataIndex: 'is24h',
      key: 'is24h',
      width: 80,
      align: 'center',
      render: (is24h?: boolean, record: ATMBranch) => {
        if (record.type === 'branch') return '-';
        return is24h ? <Tag color="success">24/7</Tag> : <Tag>Giờ hành chính</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      width: 150,
      fixed: 'right',
      render: (_: any, record: ATMBranch) => (
        <Space size="small">
          <Button
            size="small"
            type="link"
            icon={<EnvironmentOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
        </Space>
      ),
    },
  ];

  const statistics = useMemo(() => {
    const total = filteredLocations.length;
    const branches = filteredLocations.filter((l) => l.type === 'branch').length;
    const atms = filteredLocations.filter((l) => l.type === 'atm').length;
    const atm24h = filteredLocations.filter((l) => l.type === 'atm' && l.is24h).length;
    return { total, branches, atms, atm24h };
  }, [filteredLocations]);

  return (
    <AppLayout>
      <div className="page-header" style={{ marginBottom: 24 }}>
        <Title level={2}>
          <EnvironmentOutlined style={{ marginRight: 12 }} />
          Tra cứu ATM & Chi nhánh
        </Title>
        <p style={{ color: '#666', margin: 0 }}>
          Tìm kiếm ATM và chi nhánh gần bạn
        </p>
      </div>

      <Alert
        message="Về ATM & Chi nhánh"
        description={
          <div>
            <p>• Tìm kiếm ATM và chi nhánh theo thành phố, quận/huyện</p>
            <p>• ATM hỗ trợ rút tiền, nộp tiền hoặc cả hai</p>
            <p>• Nhiều ATM hoạt động 24/7 phục vụ bạn mọi lúc</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
      />

      {/* Statistics */}
      <Card style={{ marginBottom: 16 }}>
        <Space size="large" style={{ width: '100%', justifyContent: 'space-around' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Tổng số</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {statistics.total}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>Chi nhánh</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#52c41a' }}>
              {statistics.branches}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>ATM</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#1890ff' }}>
              {statistics.atms}
            </div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 14, color: '#666' }}>ATM 24/7</div>
            <div style={{ fontSize: 28, fontWeight: 'bold', color: '#fa8c16' }}>
              {statistics.atm24h}
            </div>
          </div>
        </Space>
      </Card>

      {/* Filters */}
      <Card
        title={<><FilterOutlined /> Bộ lọc & Tìm kiếm</>}
        style={{ marginBottom: 16 }}
      >
        <Space wrap style={{ marginBottom: 16 }}>
          <Input
            placeholder="Tìm theo tên, địa chỉ..."
            prefix={<SearchOutlined />}
            value={searchKeyword}
            onChange={(e) => setSearchKeyword(e.target.value)}
            style={{ width: 300 }}
            allowClear
          />

          <Select
            style={{ width: 150 }}
            value={typeFilter}
            onChange={setTypeFilter}
            placeholder="Loại"
          >
            <Select.Option value="all">Tất cả</Select.Option>
            <Select.Option value="branch">Chi nhánh</Select.Option>
            <Select.Option value="atm">ATM</Select.Option>
          </Select>

          <Select
            style={{ width: 180 }}
            value={cityFilter}
            onChange={(value) => {
              setCityFilter(value);
              setDistrictFilter('all');
            }}
            placeholder="Thành phố"
          >
            <Select.Option value="all">Tất cả thành phố</Select.Option>
            {cities.map((city) => (
              <Select.Option key={city} value={city}>
                {city}
              </Select.Option>
            ))}
          </Select>

          {cityFilter !== 'all' && (
            <Select
              style={{ width: 180 }}
              value={districtFilter}
              onChange={setDistrictFilter}
              placeholder="Quận/Huyện"
            >
              <Select.Option value="all">Tất cả quận/huyện</Select.Option>
              {districts.map((district) => (
                <Select.Option key={district} value={district}>
                  {district}
                </Select.Option>
              ))}
            </Select>
          )}
        </Space>
      </Card>

      {/* Table */}
      <Card title={`Kết quả: ${filteredLocations.length} địa điểm`}>
        <Tabs defaultActiveKey="list">
          <TabPane tab="Danh sách" key="list">
            <Table
              columns={columns}
              dataSource={filteredLocations}
              rowKey="id"
              pagination={{
                pageSize: 20,
                showSizeChanger: true,
                showTotal: (total) => `Tổng ${total} địa điểm`,
              }}
              scroll={{ x: 1200 }}
            />
          </TabPane>
          <TabPane tab="Bản đồ" key="map">
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <EnvironmentOutlined style={{ fontSize: 64, color: '#ccc' }} />
              <p style={{ marginTop: 16, color: '#666' }}>
                Tính năng bản đồ sẽ sớm được cập nhật
              </p>
            </div>
          </TabPane>
        </Tabs>
      </Card>

      {/* Detail Modal */}
      <Modal
        title={
          <span>
            <EnvironmentOutlined style={{ marginRight: 8 }} />
            Chi tiết địa điểm
          </span>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            Đóng
          </Button>,
        ]}
        width={700}
      >
        {selectedLocation && (
          <>
            <div style={{ marginBottom: 16 }}>
              {getTypeTag(selectedLocation.type)}
              {selectedLocation.type === 'atm' && (
                <>
                  {' '}
                  {getATMTypeTag(selectedLocation.atmType)}
                  {selectedLocation.is24h && <Tag color="success">24/7</Tag>}
                </>
              )}
            </div>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Tên">
                <Text strong style={{ fontSize: 16 }}>
                  {selectedLocation.name}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Địa chỉ">{selectedLocation.address}</Descriptions.Item>
              <Descriptions.Item label="Quận/Huyện">{selectedLocation.district}</Descriptions.Item>
              <Descriptions.Item label="Thành phố">{selectedLocation.city}</Descriptions.Item>
              {selectedLocation.type === 'branch' && (
                <>
                  {selectedLocation.phone && (
                    <Descriptions.Item label="Điện thoại">
                      <PhoneOutlined style={{ marginRight: 8 }} />
                      {selectedLocation.phone}
                    </Descriptions.Item>
                  )}
                  {selectedLocation.workingHours && (
                    <Descriptions.Item label="Giờ làm việc">
                      <ClockCircleOutlined style={{ marginRight: 8 }} />
                      {selectedLocation.workingHours}
                    </Descriptions.Item>
                  )}
                  {selectedLocation.services && (
                    <Descriptions.Item label="Dịch vụ">
                      {selectedLocation.services.map((service, index) => (
                        <Tag key={index} color="blue" style={{ marginBottom: 4 }}>
                          {service}
                        </Tag>
                      ))}
                    </Descriptions.Item>
                  )}
                </>
              )}
              {selectedLocation.type === 'atm' && (
                <>
                  <Descriptions.Item label="Loại ATM">
                    {getATMTypeTag(selectedLocation.atmType)}
                  </Descriptions.Item>
                  <Descriptions.Item label="Thời gian hoạt động">
                    {selectedLocation.is24h ? (
                      <Tag color="success">24/7</Tag>
                    ) : (
                      <Tag>Giờ hành chính</Tag>
                    )}
                  </Descriptions.Item>
                </>
              )}
            </Descriptions>
            <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
              <Text type="secondary">
                <EnvironmentOutlined style={{ marginRight: 8 }} />
                Tọa độ: {selectedLocation.latitude}, {selectedLocation.longitude}
              </Text>
            </div>
          </>
        )}
      </Modal>
    </AppLayout>
  );
};

export default ATMBranchLocator;
