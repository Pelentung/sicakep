import { formatISO, parseISO } from 'date-fns';
import type { Transaction, Budget, Bill, FinancialSummary } from './types';
import initialTransactions from '@/database/transactions.json';
import initialBudgets from '@/database/budgets.json';
import initialBills from '@/database/bills.json';

// These functions now simulate API calls that might fetch initial data,
// but the actual state management will be in the DataContext.

export const getInitialTransactions = (): Transaction[] => {
  return initialTransactions;
};

export const getInitialBudgets = (): Budget[] => {
  return initialBudgets;
};

export const getInitialBills = (): Bill[] => {
  return initialBills.sort((a,b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
};

// These functions are kept for utility but no longer manage state directly.
// The state mutation logic is now in DataContext.

export const getFinancialSummary = (transactions: Transaction[]): FinancialSummary => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  return { totalIncome, totalExpenses, balance };
};

export const getSpendingByCategory = (transactions: Transaction[]): Record<string, number> => {
  return transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => {
      if (!acc[t.category]) {
        acc[t.category] = 0;
      }
      acc[t.category] += t.amount;
      return acc;
    }, {} as Record<string, number>);
};
