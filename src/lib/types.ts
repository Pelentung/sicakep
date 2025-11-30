export type Transaction = {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  date: string; // ISO 8601 format
  description: string;
};

export type Budget = {
  id: string;
  category: string;
  amount: number;
};

export type Bill = {
  id: string;
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

export type Note = {
    id: string;
    title: string;
    content: string;
    createdAt: string; // ISO 8601 format
};

export type Document = {
    id: string;
    name: string;
    url: string;
    path: string;
    size: number;
    contentType: string;
    createdAt: string; // ISO 8601 format
};
