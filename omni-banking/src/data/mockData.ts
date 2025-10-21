import type { User, Transaction, DepositContract, BlockedAccount, EInvoice, BillService, BillPayment } from '../types';

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

// Generate more transactions for statement (sao kê) - 90 days
const generateMoreTransactions = (): Transaction[] => {
  const transactions: Transaction[] = [];
  const types: ('credit' | 'debit')[] = ['credit', 'debit'];
  const descriptions = {
    credit: [
      'Chuyển tiền từ Công ty XYZ',
      'Nhận tiền từ khách hàng',
      'Thu tiền hợp đồng dịch vụ',
      'Hoàn tiền từ nhà cung cấp',
      'Lãi tiền gửi',
      'Thu phí dịch vụ',
      'Nhận chuyển khoản',
    ],
    debit: [
      'Thanh toán nhà cung cấp',
      'Chi lương nhân viên',
      'Thanh toán hóa đơn điện',
      'Thanh toán hóa đơn nước',
      'Chuyển khoản',
      'Rút tiền mặt',
      'Phí dịch vụ ngân hàng',
    ]
  };

  // Generate 50 transactions in the last 90 days
  for (let i = 0; i < 50; i++) {
    const type = types[Math.floor(Math.random() * types.length)];
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(Math.floor(Math.random() * 24));
    date.setMinutes(Math.floor(Math.random() * 60));

    const descList = descriptions[type];
    const description = descList[Math.floor(Math.random() * descList.length)];
    const amount = Math.floor(Math.random() * 100000000) + 1000000;

    transactions.push({
      id: `TXN${String(i + 100).padStart(5, '0')}`,
      type,
      amount,
      currency: 'VND',
      description,
      date: date.toISOString(),
      accountNumber: '0011234567890',
      status: 'Thành công'
    });
  }

  // Sort by date descending
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

// Mock transactions - Giao dịch thu/chi
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
  },
  ...generateMoreTransactions()
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

// Mock blocked accounts - Giao dịch phong toả
export const mockBlockedAccounts: BlockedAccount[] = [
  {
    id: 'BLK001',
    accountNumber: '0011234567890',
    accountName: 'TK Thanh toán VND',
    blockedAmount: 20000000,
    currency: 'VND',
    blockReason: 'Phong toả theo yêu cầu cơ quan nhà nước',
    blockDate: '2025-10-15T09:00:00',
    status: 'blocked',
    referenceNumber: 'PT20251015001'
  },
  {
    id: 'BLK002',
    accountNumber: '0011234567891',
    accountName: 'TK Tiết kiệm VND',
    blockedAmount: 50000000,
    currency: 'VND',
    blockReason: 'Phong toả tạm thời - Tranh chấp hợp đồng',
    blockDate: '2025-10-10T14:30:00',
    releaseDate: '2025-10-25T14:30:00',
    status: 'blocked',
    referenceNumber: 'PT20251010002'
  },
  {
    id: 'BLK003',
    accountNumber: '0011234567890',
    accountName: 'TK Thanh toán VND',
    blockedAmount: 10000000,
    currency: 'VND',
    blockReason: 'Phong toả bảo đảm thanh toán',
    blockDate: '2025-09-20T10:15:00',
    releaseDate: '2025-10-05T10:15:00',
    status: 'released',
    referenceNumber: 'PT20250920001'
  }
];

// Mock e-invoices - Hóa đơn điện tử
export const mockEInvoices: EInvoice[] = [
  {
    id: 'INV001',
    invoiceNumber: 'HĐĐT-OCB/25C/00012345',
    invoiceDate: '2025-10-20T14:30:00',
    accountNumber: '0011234567890',
    transactionType: 'Phí chuyển tiền liên ngân hàng',
    amount: 5500,
    currency: 'VND',
    taxAmount: 550,
    totalAmount: 6050,
    description: 'Phí chuyển tiền - GD TXN002',
    status: 'issued',
    downloadUrl: '/invoices/INV001.pdf'
  },
  {
    id: 'INV002',
    invoiceNumber: 'HĐĐT-OCB/25C/00012346',
    invoiceDate: '2025-10-19T16:45:00',
    accountNumber: '0011234567890',
    transactionType: 'Phí quản lý tài khoản',
    amount: 50000,
    currency: 'VND',
    taxAmount: 5000,
    totalAmount: 55000,
    description: 'Phí quản lý tài khoản tháng 10/2025',
    status: 'issued',
    downloadUrl: '/invoices/INV002.pdf'
  },
  {
    id: 'INV003',
    invoiceNumber: 'HĐĐT-OCB/25C/00012347',
    invoiceDate: '2025-10-18T11:20:00',
    accountNumber: '0011234567890',
    transactionType: 'Phí SMS Banking',
    amount: 11000,
    currency: 'VND',
    taxAmount: 1100,
    totalAmount: 12100,
    description: 'Phí SMS Banking tháng 10/2025',
    status: 'issued',
    downloadUrl: '/invoices/INV003.pdf'
  },
  {
    id: 'INV004',
    invoiceNumber: 'HĐĐT-OCB/25C/00012348',
    invoiceDate: '2025-10-15T09:30:00',
    accountNumber: '0011234567891',
    transactionType: 'Phí mở hợp đồng tiền gửi',
    amount: 0,
    currency: 'VND',
    taxAmount: 0,
    totalAmount: 0,
    description: 'Mở HĐTG số HDTG2025001234 - Miễn phí',
    status: 'issued',
    downloadUrl: '/invoices/INV004.pdf'
  },
  {
    id: 'INV005',
    invoiceNumber: 'HĐĐT-OCB/25C/00012340',
    invoiceDate: '2025-09-28T10:00:00',
    accountNumber: '0011234567890',
    transactionType: 'Phí chuyển tiền quốc tế',
    amount: 200000,
    currency: 'VND',
    taxAmount: 20000,
    totalAmount: 220000,
    description: 'Phí chuyển tiền quốc tế - Đã hủy',
    status: 'cancelled',
    downloadUrl: '/invoices/INV005.pdf'
  }
];

// Mock bill services
export const mockBillServices: BillService[] = [
  { code: 'EVN', name: 'Điện lực miền Nam (EVN SPC)', category: 'electricity' },
  { code: 'EVNHN', name: 'Điện lực Hà Nội (EVN HANOI)', category: 'electricity' },
  { code: 'EVNHCM', name: 'Điện lực TP.HCM', category: 'electricity' },
  { code: 'SAWACO', name: 'Nước Sài Gòn (SAWACO)', category: 'water' },
  { code: 'HAWACO', name: 'Nước Hà Nội (HAWACO)', category: 'water' },
  { code: 'VNPT', name: 'VNPT VinaPhone', category: 'mobile' },
  { code: 'VIETTEL', name: 'Viettel Mobile', category: 'mobile' },
  { code: 'MOBI', name: 'MobiFone', category: 'mobile' },
  { code: 'FPT', name: 'FPT Telecom', category: 'internet' },
  { code: 'VIETTEL_NET', name: 'Viettel Internet', category: 'internet' },
  { code: 'VNPT_NET', name: 'VNPT Internet', category: 'internet' },
  { code: 'BAMBOO', name: 'Bamboo Airways', category: 'airline' },
  { code: 'VNA', name: 'Vietnam Airlines', category: 'airline' },
  { code: 'VIETJET', name: 'VietJet Air', category: 'airline' },
  { code: 'VNPT_PHONE', name: 'VNPT - Điện thoại cố định', category: 'phone' },
  { code: 'VIETTEL_PHONE', name: 'Viettel - Điện thoại cố định', category: 'phone' },
];

// Mock bill payment history
export const mockBillPayments: BillPayment[] = [
  {
    id: 'BILL001',
    serviceCode: 'EVN',
    serviceName: 'Điện lực miền Nam (EVN SPC)',
    customerCode: 'PD12345678',
    customerName: 'Nguyễn Văn A',
    billNumber: 'EVN202510001',
    amount: 1500000,
    fromAccount: '0011234567890',
    paymentDate: '2025-10-15T10:30:00',
    period: '09/2025',
    status: 'completed',
    feeAmount: 2200,
    totalAmount: 1502200,
  },
  {
    id: 'BILL002',
    serviceCode: 'SAWACO',
    serviceName: 'Nước Sài Gòn (SAWACO)',
    customerCode: 'NC98765432',
    customerName: 'Nguyễn Văn A',
    billNumber: 'SW202510002',
    amount: 350000,
    fromAccount: '0011234567890',
    paymentDate: '2025-10-10T14:20:00',
    period: '09/2025',
    status: 'completed',
    feeAmount: 1100,
    totalAmount: 351100,
  },
  {
    id: 'BILL003',
    serviceCode: 'VIETTEL',
    serviceName: 'Viettel Mobile',
    customerCode: '0912345678',
    customerName: 'Nguyễn Văn A',
    amount: 200000,
    fromAccount: '0011234567890',
    paymentDate: '2025-10-05T09:15:00',
    period: '10/2025',
    status: 'completed',
    feeAmount: 1100,
    totalAmount: 201100,
  },
  {
    id: 'BILL004',
    serviceCode: 'FPT',
    serviceName: 'FPT Telecom',
    customerCode: 'FPT123456',
    customerName: 'Nguyễn Văn A',
    amount: 500000,
    fromAccount: '0011234567890',
    paymentDate: '2025-09-28T16:45:00',
    period: '09/2025',
    status: 'completed',
    feeAmount: 1650,
    totalAmount: 501650,
  },
  {
    id: 'BILL005',
    serviceCode: 'BAMBOO',
    serviceName: 'Bamboo Airways',
    customerCode: 'BB2025100001',
    customerName: 'Nguyễn Văn A',
    billNumber: 'BAMBOO202510001',
    amount: 3500000,
    fromAccount: '0011234567890',
    paymentDate: '2025-09-20T11:00:00',
    status: 'completed',
    feeAmount: 5500,
    totalAmount: 3505500,
  },
];
