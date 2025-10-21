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

