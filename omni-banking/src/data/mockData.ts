import type { User, Transaction, DepositContract, DepositTerm, DepositSettlement, BlockedAccount, EInvoice, BillService, BillPayment, PendingTransaction, FutureTransfer } from '../types';

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
    status: 'active',
    productName: 'Tiết kiệm linh hoạt 12 tháng',
    interestPaymentMethod: 'maturity',
    autoRenewal: true
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
    status: 'active',
    productName: 'Tiết kiệm tích lũy 24 tháng',
    interestPaymentMethod: 'monthly',
    autoRenewal: false
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
    status: 'matured',
    productName: 'Tiết kiệm ngắn hạn 6 tháng',
    interestPaymentMethod: 'maturity',
    autoRenewal: false
  }
];

// Mock deposit terms - Lãi suất tiền gửi
export const mockDepositTerms: DepositTerm[] = [
  {
    term: 1,
    termUnit: 'month',
    interestRate: 3.0,
    minAmount: 10000000,
    productName: 'Tiết kiệm ngắn hạn 1 tháng'
  },
  {
    term: 3,
    termUnit: 'month',
    interestRate: 3.5,
    minAmount: 10000000,
    productName: 'Tiết kiệm ngắn hạn 3 tháng'
  },
  {
    term: 6,
    termUnit: 'month',
    interestRate: 4.5,
    minAmount: 10000000,
    productName: 'Tiết kiệm ngắn hạn 6 tháng'
  },
  {
    term: 9,
    termUnit: 'month',
    interestRate: 5.0,
    minAmount: 50000000,
    productName: 'Tiết kiệm linh hoạt 9 tháng'
  },
  {
    term: 12,
    termUnit: 'month',
    interestRate: 5.5,
    minAmount: 50000000,
    productName: 'Tiết kiệm linh hoạt 12 tháng'
  },
  {
    term: 18,
    termUnit: 'month',
    interestRate: 5.8,
    minAmount: 100000000,
    productName: 'Tiết kiệm tích lũy 18 tháng'
  },
  {
    term: 24,
    termUnit: 'month',
    interestRate: 6.0,
    minAmount: 100000000,
    productName: 'Tiết kiệm tích lũy 24 tháng'
  },
  {
    term: 36,
    termUnit: 'month',
    interestRate: 6.2,
    minAmount: 200000000,
    productName: 'Tiết kiệm dài hạn 36 tháng'
  },
];

// Mock deposit settlements - Lệnh tất toán
export const mockDepositSettlements: DepositSettlement[] = [
  {
    id: 'SETTLE001',
    contractId: 'HDTG003',
    contractNumber: 'HDTG2024009876',
    settlementDate: '2025-04-01',
    principalAmount: 150000000,
    interestAmount: 3750000,
    totalAmount: 153750000,
    destinationAccount: '0011234567890',
    status: 'completed',
    createdDate: '2025-03-28T10:30:00'
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

// Mock pending transactions - Giao dịch chờ duyệt
export const mockPendingTransactions: PendingTransaction[] = [
  {
    id: 'PENDING001',
    transactionType: 'transfer',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0019876543210',
      accountName: 'Công ty TNHH XYZ',
      bankCode: 'OCB',
      bankName: 'Ngân hàng TMCP Phương Đông'
    },
    amount: 50000000,
    currency: 'VND',
    content: 'Thanh toán hợp đồng dịch vụ tháng 10/2025',
    feeAmount: 2200,
    totalAmount: 50002200,
    status: 'pending',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-22T08:30:00',
  },
  {
    id: 'PENDING002',
    transactionType: 'transfer',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0021234567890',
      accountName: 'Nguyễn Thị B',
      bankCode: 'VCB',
      bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam'
    },
    amount: 25000000,
    currency: 'VND',
    content: 'Chuyển tiền lương tháng 10',
    feeAmount: 3300,
    totalAmount: 25003300,
    status: 'pending',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-22T09:15:00',
  },
  {
    id: 'PENDING003',
    transactionType: 'bill_payment',
    fromAccount: '0011234567890',
    amount: 1500000,
    currency: 'VND',
    content: 'Thanh toán hóa đơn tiền điện tháng 10/2025',
    feeAmount: 2200,
    totalAmount: 1502200,
    status: 'pending',
    validationStatus: 'ok',
    serviceName: 'Điện lực miền Nam (EVN SPC)',
    createdBy: 'user_demo',
    createdDate: '2025-10-22T10:00:00',
  },
  {
    id: 'PENDING004',
    transactionType: 'deposit_contract',
    fromAccount: '0011234567890',
    amount: 100000000,
    currency: 'VND',
    content: 'Mở hợp đồng tiền gửi kỳ hạn 12 tháng',
    feeAmount: 0,
    totalAmount: 100000000,
    status: 'pending',
    validationStatus: 'ok',
    productName: 'Tiết kiệm linh hoạt 12 tháng - 5.5%/năm',
    createdBy: 'user_demo',
    createdDate: '2025-10-22T11:20:00',
  },
  {
    id: 'PENDING005',
    transactionType: 'batch_transfer',
    fromAccount: '0011234567890',
    amount: 75000000,
    currency: 'VND',
    content: 'Chi lương nhân viên tháng 10/2025',
    feeAmount: 5500,
    totalAmount: 75005500,
    status: 'pending',
    validationStatus: 'ok',
    batchName: 'Chi lương tháng 10/2025',
    itemCount: 15,
    createdBy: 'user_demo',
    createdDate: '2025-10-22T13:45:00',
  },
  {
    id: 'PENDING006',
    transactionType: 'transfer',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0031234567890',
      accountName: 'Công ty ABC',
      bankCode: 'TCB',
      bankName: 'Ngân hàng TMCP Kỹ thương Việt Nam'
    },
    amount: 30000000,
    currency: 'VND',
    content: 'Thanh toán nhà cung cấp',
    feeAmount: 3300,
    totalAmount: 30003300,
    status: 'pending',
    validationStatus: 'init',
    validationMessage: 'Đang kiểm tra thông tin tài khoản người nhận',
    createdBy: 'user_demo',
    createdDate: '2025-10-22T14:10:00',
  },
  {
    id: 'PENDING007',
    transactionType: 'transfer',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0041234567890',
      accountName: 'Trần Văn C',
    },
    amount: 15000000,
    currency: 'VND',
    content: 'Thanh toán hợp đồng',
    feeAmount: 2200,
    totalAmount: 15002200,
    status: 'rejected',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-21T15:30:00',
    approvedBy: 'approver_demo',
    approvedDate: '2025-10-21T16:00:00',
    rejectedReason: 'Thông tin người nhận không chính xác',
  },
  {
    id: 'PENDING008',
    transactionType: 'bill_payment',
    fromAccount: '0011234567890',
    amount: 850000,
    currency: 'VND',
    content: 'Thanh toán hóa đơn nước tháng 10/2025',
    feeAmount: 1100,
    totalAmount: 851100,
    status: 'rejected',
    validationStatus: 'ok',
    serviceName: 'Nước Sài Gòn (SAWACO)',
    createdBy: 'user_demo',
    createdDate: '2025-10-21T10:00:00',
    approvedBy: 'approver_demo',
    approvedDate: '2025-10-21T10:30:00',
    rejectedReason: 'Số tiền thanh toán không khớp với hóa đơn',
  },
];

// Mock future transfers - Chuyển tiền tương lai
export const mockFutureTransfers: FutureTransfer[] = [
  {
    id: 'FT001',
    transferType: 'single',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0019876543210',
      accountName: 'Công ty TNHH XYZ',
      bankCode: 'OCB',
      bankName: 'Ngân hàng TMCP Phương Đông'
    },
    amount: 80000000,
    currency: 'VND',
    content: 'Thanh toán hợp đồng dịch vụ tháng 11/2025',
    feeAmount: 2200,
    totalAmount: 80002200,
    executionDate: '2025-11-01T09:00:00',
    status: 'pending_approval',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-22T14:30:00',
  },
  {
    id: 'FT002',
    transferType: 'single',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0021234567890',
      accountName: 'Nguyễn Thị B',
      bankCode: 'VCB',
      bankName: 'Ngân hàng TMCP Ngoại thương Việt Nam'
    },
    amount: 30000000,
    currency: 'VND',
    content: 'Chuyển tiền lương tháng 11/2025',
    feeAmount: 3300,
    totalAmount: 30003300,
    executionDate: '2025-11-05T10:00:00',
    status: 'pending_approval',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-22T15:00:00',
  },
  {
    id: 'FT003',
    transferType: 'batch',
    batchCode: 'BATCH2025110001',
    batchName: 'Chi lương nhân viên tháng 11/2025',
    fromAccount: '0011234567890',
    amount: 120000000,
    currency: 'VND',
    content: 'Chi lương nhân viên tháng 11/2025',
    feeAmount: 8800,
    totalAmount: 120008800,
    executionDate: '2025-11-10T08:00:00',
    status: 'pending_approval',
    validationStatus: 'ok',
    itemCount: 25,
    createdBy: 'user_demo',
    createdDate: '2025-10-22T16:00:00',
  },
  {
    id: 'FT004',
    transferType: 'single',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0031234567890',
      accountName: 'Công ty ABC',
      bankCode: 'TCB',
      bankName: 'Ngân hàng TMCP Kỹ thương Việt Nam'
    },
    amount: 45000000,
    currency: 'VND',
    content: 'Thanh toán nhà cung cấp',
    feeAmount: 3300,
    totalAmount: 45003300,
    executionDate: '2025-11-15T14:00:00',
    status: 'pending_approval',
    validationStatus: 'init',
    validationMessage: 'Đang kiểm tra thông tin tài khoản người nhận',
    createdBy: 'user_demo',
    createdDate: '2025-10-22T17:00:00',
  },
  {
    id: 'FT005',
    transferType: 'single',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0041234567890',
      accountName: 'Trần Văn C',
      bankCode: 'ACB',
      bankName: 'Ngân hàng TMCP Á Châu'
    },
    amount: 25000000,
    currency: 'VND',
    content: 'Thanh toán phí dịch vụ',
    feeAmount: 3300,
    totalAmount: 25003300,
    executionDate: '2025-10-28T11:00:00',
    status: 'approved',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-20T10:00:00',
    approvedBy: 'approver_demo',
    approvedDate: '2025-10-20T11:00:00',
  },
  {
    id: 'FT006',
    transferType: 'batch',
    batchCode: 'BATCH2025100001',
    batchName: 'Chi lương nhân viên tháng 10/2025',
    fromAccount: '0011234567890',
    amount: 95000000,
    currency: 'VND',
    content: 'Chi lương nhân viên tháng 10/2025',
    feeAmount: 6600,
    totalAmount: 95006600,
    executionDate: '2025-10-25T08:00:00',
    status: 'approved',
    validationStatus: 'ok',
    itemCount: 20,
    createdBy: 'user_demo',
    createdDate: '2025-10-18T14:00:00',
    approvedBy: 'approver_demo',
    approvedDate: '2025-10-18T15:00:00',
  },
  {
    id: 'FT007',
    transferType: 'single',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0051234567890',
      accountName: 'Nguyễn Văn D',
      bankCode: 'VPB',
      bankName: 'Ngân hàng TMCP Việt Nam Thịnh Vượng'
    },
    amount: 60000000,
    currency: 'VND',
    content: 'Thanh toán hợp đồng tư vấn',
    feeAmount: 3300,
    totalAmount: 60003300,
    executionDate: '2025-11-20T13:00:00',
    status: 'approved',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-19T09:00:00',
    approvedBy: 'approver_demo',
    approvedDate: '2025-10-19T10:00:00',
  },
  {
    id: 'FT008',
    transferType: 'single',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0061234567890',
      accountName: 'Công ty DEF',
    },
    amount: 35000000,
    currency: 'VND',
    content: 'Thanh toán phí bảo trì',
    feeAmount: 3300,
    totalAmount: 35003300,
    executionDate: '2025-10-30T10:00:00',
    status: 'executed',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-15T11:00:00',
    approvedBy: 'approver_demo',
    approvedDate: '2025-10-15T12:00:00',
    executedDate: '2025-10-30T10:00:00',
  },
  {
    id: 'FT009',
    transferType: 'batch',
    batchCode: 'BATCH2025090001',
    batchName: 'Chi lương nhân viên tháng 9/2025',
    fromAccount: '0011234567890',
    amount: 88000000,
    currency: 'VND',
    content: 'Chi lương nhân viên tháng 9/2025',
    feeAmount: 6600,
    totalAmount: 88006600,
    executionDate: '2025-09-25T08:00:00',
    status: 'executed',
    validationStatus: 'ok',
    itemCount: 18,
    createdBy: 'user_demo',
    createdDate: '2025-09-18T14:00:00',
    approvedBy: 'approver_demo',
    approvedDate: '2025-09-18T15:00:00',
    executedDate: '2025-09-25T08:00:00',
  },
  {
    id: 'FT010',
    transferType: 'single',
    fromAccount: '0011234567890',
    beneficiary: {
      accountNumber: '0071234567890',
      accountName: 'Công ty GHI',
      bankCode: 'MB',
      bankName: 'Ngân hàng TMCP Quân Đội'
    },
    amount: 50000000,
    currency: 'VND',
    content: 'Thanh toán hợp đồng mua hàng',
    feeAmount: 3300,
    totalAmount: 50003300,
    executionDate: '2025-10-26T09:00:00',
    status: 'rejected',
    validationStatus: 'ok',
    createdBy: 'user_demo',
    createdDate: '2025-10-21T08:00:00',
    approvedBy: 'approver_demo',
    approvedDate: '2025-10-21T09:00:00',
    rejectedReason: 'Thông tin hợp đồng không rõ ràng',
  },
];
