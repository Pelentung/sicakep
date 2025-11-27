export type Transaction = {
  id: string;
  userId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // ISO 8601 format
  description: string;
};

export type Budget = {
  id: string;
  userId: string;
  category: string;
  amount: number;
};

export type Bill = {
  id: string;
  userId: string;
  name: string;
  amount: number;
  dueDate: string; // ISO 8601 format
  dueTime: string; // HH:mm format
  isPaid: boolean;
};

export type FinancialSummary = {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
};
