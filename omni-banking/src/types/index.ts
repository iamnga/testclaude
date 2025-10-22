export interface User {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  password: string;
  isFirstLogin: boolean;
  accounts: Account[];
}

export interface Account {
  accountNumber: string;
  accountName: string;
  balance: number;
  availableBalance: number;
  overdraftLimit: number;
  currency: string;
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  currency: string;
  description: string;
  date: string;
  accountNumber: string;
  status: string;
}

export interface DepositContract {
  id: string;
  contractNumber: string;
  accountNumber: string;
  amount: number;
  interestRate: number;
  term: number;
  termUnit: 'month' | 'year';
  startDate: string;
  endDate: string;
  status: 'active' | 'matured' | 'closed';
  productName: string;
  interestPaymentMethod: 'monthly' | 'maturity' | 'upfront';
  autoRenewal: boolean;
}

export interface DepositTerm {
  term: number;
  termUnit: 'month' | 'year';
  interestRate: number;
  minAmount: number;
  productName: string;
}

export interface DepositSettlement {
  id: string;
  contractId: string;
  contractNumber: string;
  settlementDate: string;
  principalAmount: number;
  interestAmount: number;
  totalAmount: number;
  destinationAccount: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdDate: string;
}

export interface QuickAccessItem {
  key: string;
  title: string;
  icon: string;
  path: string;
  description: string;
}

export interface BlockedAccount {
  id: string;
  accountNumber: string;
  accountName: string;
  blockedAmount: number;
  currency: string;
  blockReason: string;
  blockDate: string;
  releaseDate?: string;
  status: 'blocked' | 'released';
  referenceNumber: string;
}

export interface EInvoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  accountNumber: string;
  transactionType: string;
  amount: number;
  currency: string;
  taxAmount: number;
  totalAmount: number;
  description: string;
  status: 'issued' | 'cancelled';
  downloadUrl?: string;
}

// Transfer types
export interface Beneficiary {
  accountNumber: string;
  accountName: string;
  bankCode?: string;
  bankName?: string;
}

export interface TransferOrder {
  id: string;
  fromAccount: string;
  beneficiary: Beneficiary;
  amount: number;
  currency: string;
  content: string;
  transferType: 'internal' | 'interbank' | 'napas247';
  executionDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'failed';
  createdDate: string;
  createdBy: string;
  approvedBy?: string;
  feeAmount: number;
  feeType: 'sender' | 'receiver';
}

export interface BatchTransferItem {
  id: string;
  beneficiary: Beneficiary;
  amount: number;
  content: string;
  status: 'ok' | 'error' | 'init';
  errorMessage?: string;
}

export interface BatchTransfer {
  id: string;
  batchName: string;
  fromAccount: string;
  totalAmount: number;
  totalItems: number;
  transferType: 'internal' | 'mixed';
  items: BatchTransferItem[];
  status: 'draft' | 'pending' | 'approved' | 'completed';
  createdDate: string;
  executionDate: string;
}

export interface RecurringTransfer {
  id: string;
  transactionName: string;
  fromAccount: string;
  beneficiary: Beneficiary;
  amount: number;
  content: string;
  startDate: string;
  endDate: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextExecutionDate: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  createdDate: string;
  totalExecutions: number;
  completedExecutions: number;
}

export interface TransferVoucher {
  id: string;
  transactionId: string;
  fromAccount: string;
  beneficiary: Beneficiary;
  amount: number;
  currency: string;
  content: string;
  transactionDate: string;
  status: 'success' | 'failed';
  voucherUrl?: string;
}

// Bill Payment types
export interface BillService {
  code: string;
  name: string;
  category: 'electricity' | 'water' | 'phone' | 'internet' | 'airline' | 'mobile' | 'other';
  icon?: string;
}

export interface BillPayment {
  id: string;
  serviceCode: string;
  serviceName: string;
  customerCode: string;
  customerName: string;
  billNumber?: string;
  amount: number;
  fromAccount: string;
  paymentDate: string;
  period?: string;
  status: 'pending' | 'completed' | 'failed';
  feeAmount: number;
  totalAmount: number;
}

// Pending Transaction types
export interface PendingTransaction {
  id: string;
  transactionType: 'transfer' | 'bill_payment' | 'deposit_contract' | 'batch_transfer';
  fromAccount: string;
  toAccount?: string;
  beneficiary?: Beneficiary;
  amount: number;
  currency: string;
  content: string;
  feeAmount: number;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  validationStatus: 'ok' | 'init' | 'error';
  validationMessage?: string;
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  // Additional fields for specific transaction types
  serviceName?: string; // For bill payments
  productName?: string; // For deposit contracts
  batchName?: string; // For batch transfers
  itemCount?: number; // For batch transfers
}

export interface ApprovalAction {
  transactionIds: string[];
  action: 'approve' | 'reject';
  authMethod: 'iotp' | 'digital_signature';
  otpCode?: string;
  signature?: string;
  rejectedReason?: string;
}

// Future Transfer types
export interface FutureTransfer {
  id: string;
  transferType: 'single' | 'batch';
  batchCode?: string;
  batchName?: string;
  fromAccount: string;
  beneficiary?: Beneficiary;
  amount: number;
  currency: string;
  content: string;
  feeAmount: number;
  totalAmount: number;
  executionDate: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'executed' | 'cancelled';
  validationStatus: 'ok' | 'init' | 'error';
  validationMessage?: string;
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  executedDate?: string;
  rejectedReason?: string;
  itemCount?: number; // For batch transfers
}

// Salary Payment types
export interface SalaryPaymentItem {
  id: string;
  employeeId: string;
  employeeName: string;
  accountNumber: string;
  bankCode?: string;
  bankName?: string;
  amount: number;
  status: 'ok' | 'error';
  errorMessage?: string;
}

export interface SalaryPayment {
  id: string;
  batchCode: string;
  batchName: string;
  fromAccount: string;
  subAccount?: string; // Tài khoản phụ
  transferType: 'internal' | 'external'; // Trong/ngoài hệ thống
  totalAmount: number;
  totalItems: number;
  currency: string;
  feeAmount: number;
  status: 'draft' | 'pending_approval' | 'approved' | 'rejected' | 'executed';
  validationStatus: 'ok' | 'init' | 'error';
  validationMessage?: string;
  items: SalaryPaymentItem[];
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  executedDate?: string;
  rejectedReason?: string;
}

export interface SalaryVoucher {
  id: string;
  salaryPaymentId: string;
  batchCode: string;
  batchName: string;
  voucherType: 'debit_note' | 'statement'; // Giấy báo nợ hoặc bảng kê
  fromAccount: string;
  totalAmount: number;
  totalItems: number;
  executedDate: string;
  downloadUrl?: string;
  hasDetailAccess: boolean; // Quyền xem chi tiết
}

// Virtual Account types
export interface VirtualAccount {
  id: string;
  virtualAccountNumber: string;
  accountName: string;
  description: string;
  linkedAccount: string; // Tài khoản thật liên kết
  balance: number;
  currency: string;
  status: 'pending_approval' | 'approved' | 'rejected' | 'active' | 'inactive';
  createdBy: string;
  createdDate: string;
  approvedBy?: string;
  approvedDate?: string;
  rejectedReason?: string;
  lastTransactionDate?: string;
}

export interface VirtualAccountTransaction {
  id: string;
  virtualAccountNumber: string;
  virtualAccountName: string;
  transactionType: 'credit'; // Chỉ ghi có (nhận tiền)
  amount: number;
  currency: string;
  fromAccount: string;
  fromAccountName: string;
  content: string;
  transactionDate: string;
  status: 'completed';
  referenceNumber: string;
}

// Loan types - Khoản vay
export interface Loan {
  id: string;
  loanNumber: string; // Số hợp đồng vay
  loanType: 'business' | 'personal' | 'mortgage' | 'overdraft'; // Loại vay
  loanTypeName: string;
  principalAmount: number; // Số tiền vay ban đầu
  outstandingBalance: number; // Số dư nợ còn lại
  interestRate: number; // Lãi suất (%/năm)
  term: number; // Kỳ hạn (tháng)
  disbursementDate: string; // Ngày giải ngân
  maturityDate: string; // Ngày đáo hạn
  repaymentAccount: string; // Tài khoản trả nợ
  status: 'active' | 'completed' | 'overdue' | 'closed';
  nextPaymentDate?: string; // Ngày trả nợ kế tiếp
  nextPaymentAmount?: number; // Số tiền trả kỳ sau
  currency: string;
}

export interface LoanRepayment {
  id: string;
  loanNumber: string;
  loanTypeName: string;
  paymentDate: string; // Ngày trả nợ
  principalAmount: number; // Tiền gốc
  interestAmount: number; // Tiền lãi
  penaltyAmount: number; // Tiền phạt (nếu có)
  totalAmount: number; // Tổng tiền trả
  outstandingBalance: number; // Số dư nợ còn lại sau khi trả
  status: 'completed' | 'pending' | 'failed';
  paymentMethod: 'auto_debit' | 'manual'; // Tự động trích nợ hoặc trả thủ công
  referenceNumber: string;
}

// Utility types - Công cụ tiện ích
export interface ATMBranch {
  id: string;
  type: 'atm' | 'branch'; // Loại: ATM hoặc Chi nhánh
  name: string;
  address: string;
  district: string; // Quận/Huyện
  city: string; // Thành phố
  latitude: number;
  longitude: number;
  phone?: string;
  workingHours?: string;
  services?: string[]; // Dịch vụ (chỉ cho chi nhánh)
  atmType?: 'withdraw' | 'deposit' | 'both'; // Loại ATM (chỉ cho ATM)
  is24h?: boolean; // Hoạt động 24/7
}

export interface ExchangeRate {
  currency: string; // Mã tiền tệ (USD, EUR, JPY, etc.)
  currencyName: string;
  buyRate: number; // Tỷ giá mua
  sellRate: number; // Tỷ giá bán
  transferRate: number; // Tỷ giá chuyển khoản
  lastUpdated: string;
}

export interface InterestRate {
  term: number; // Kỳ hạn (tháng)
  termName: string;
  rate: number; // Lãi suất (%/năm)
  minAmount: number; // Số tiền tối thiểu
}
