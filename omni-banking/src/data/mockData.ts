import type { User, Transaction, DepositContract } from '../types';

// Mock users - password mặc định từ OCB
export const mockUsers: User[] = [
  {
    id: '1',
    username: 'user_demo',
    fullName: 'Nguyễn Văn A',
    email: 'support@ocb.com.vn',
    phone: '1900 6678',
    password: 'OCB@2024', // Mật khẩu mặc định từ OCB
    isFirstLogin: true,
    accounts: [
      {
        accountNumber: '0011234567890',
        accountName: 'TK Thanh toán VND',
        balance: 150000000,
        availableBalance: 150000000,
        overdraftLimit: 0,
        currency: 'VND'
      },
      {
        accountNumber: '0011234567891',
        accountName: 'TK Tiết kiệm VND',
        balance: 500000000,
        availableBalance: 500000000,
        overdraftLimit: 0,
        currency: 'VND'
      },
      {
        accountNumber: '0011234567892',
        accountName: 'TK Ngoại tệ USD',
        balance: 50000,
        availableBalance: 50000,
        overdraftLimit: 0,
        currency: 'USD'
      }
    ]
  },
  {
    id: '2',
    username: 'company_demo',
    fullName: 'Công ty TNHH ABC',
    email: 'support@ocb.com.vn',
    phone: '1900 6678',
    password: 'OCB@2024',
    isFirstLogin: false,
    accounts: [
      {
        accountNumber: '0019876543210',
        accountName: 'TK Doanh nghiệp',
        balance: 2500000000,
        availableBalance: 2450000000,
        overdraftLimit: 100000000,
        currency: 'VND'
      }
    ]
  }
];

// Mock transactions - Giao dịch thu/chi gần nhất
export const mockTransactions: Transaction[] = [
  {
    id: 'TXN001',
    type: 'credit',
    amount: 50000000,
    currency: 'VND',
    description: 'Chuyển tiền từ Công ty XYZ - Thanh toán hợp đồng',
    date: '2025-10-20T14:30:00',
    accountNumber: '0011234567890',
    status: 'Thành công'
  },
  {
    id: 'TXN002',
    type: 'debit',
    amount: 15000000,
    currency: 'VND',
    description: 'Chuyển khoản - Thanh toán nhà cung cấp',
    date: '2025-10-20T10:15:00',
    accountNumber: '0011234567890',
    status: 'Thành công'
  },
  {
    id: 'TXN003',
    type: 'credit',
    amount: 30000000,
    currency: 'VND',
    description: 'Nhận tiền từ khách hàng DEF',
    date: '2025-10-19T16:45:00',
    accountNumber: '0011234567890',
    status: 'Thành công'
  },
  {
    id: 'TXN004',
    type: 'debit',
    amount: 25000000,
    currency: 'VND',
    description: 'Chi lương tháng 10/2025',
    date: '2025-10-19T09:00:00',
    accountNumber: '0011234567890',
    status: 'Thành công'
  },
  {
    id: 'TXN005',
    type: 'credit',
    amount: 100000000,
    currency: 'VND',
    description: 'Nhận tiền từ hợp đồng dịch vụ',
    date: '2025-10-18T11:20:00',
    accountNumber: '0011234567890',
    status: 'Thành công'
  }
];

// Mock deposit contracts - Hợp đồng tiền gửi
export const mockDepositContracts: DepositContract[] = [
  {
    id: 'HDTG001',
    contractNumber: 'HDTG2025001234',
    accountNumber: '0011234567891',
    amount: 200000000,
    interestRate: 5.5,
    term: 12,
    termUnit: 'month',
    startDate: '2025-01-15',
    endDate: '2026-01-15',
    status: 'active'
  },
  {
    id: 'HDTG002',
    contractNumber: 'HDTG2025001235',
    accountNumber: '0011234567891',
    amount: 300000000,
    interestRate: 6.0,
    term: 24,
    termUnit: 'month',
    startDate: '2025-03-01',
    endDate: '2027-03-01',
    status: 'active'
  },
  {
    id: 'HDTG003',
    contractNumber: 'HDTG2024009876',
    accountNumber: '0011234567891',
    amount: 150000000,
    interestRate: 5.0,
    term: 6,
    termUnit: 'month',
    startDate: '2024-10-01',
    endDate: '2025-04-01',
    status: 'matured'
  }
];
