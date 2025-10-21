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
