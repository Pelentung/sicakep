import { formatISO, parseISO } from 'date-fns';
import type { Transaction, Budget, Bill, FinancialSummary } from './types';
import transactionsData from '@/database/transactions.json';
import budgetsData from '@/database/budgets.json';
import billsData from '@/database/bills.json';

// In-memory "database"
let transactions: Transaction[] = transactionsData;
let budgets: Budget[] = budgetsData;
let bills: Bill[] = billsData;

// We are not using a real database, so data changes are not persisted.
// These functions simulate data fetching and manipulation.

export const getTransactions = (): Transaction[] => {
  return transactions;
};

export const getBudgets = (): Budget[] => {
  return budgets;
};

export const getBills = (): Bill[] => {
  return bills.sort((a,b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
};

export const addTransaction = (transaction: Omit<Transaction, 'id' | 'userId'>) => {
  const newId = (Math.max(...transactions.map(t => parseInt(t.id))) + 1).toString();
  transactions.push({ ...transaction, id: newId, userId: '1' });
};

export const addBudget = (budget: Omit<Budget, 'id' | 'userId'>) => {
    const newId = (Math.max(...budgets.map(b => parseInt(b.id))) + 1).toString();
    budgets.push({ ...budget, id: newId, userId: '1' });
};

export const updateBudget = (id: string, newAmount: number) => {
    budgets = budgets.map(b => b.id === id ? { ...b, amount: newAmount } : b);
};

export const deleteBudget = (id: string) => {
    budgets = budgets.filter(b => b.id !== id);
};

export const addBill = (bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => {
    const newId = (Math.max(...bills.map(b => parseInt(b.id))) + 1).toString();
    const [year, month, day] = bill.dueDate.split('-').map(Number);
    const [hours, minutes] = bill.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes);

    const newBill: Bill = {
        ...bill,
        id: newId,
        isPaid: false,
        dueDate: formatISO(dueDate),
        userId: '1'
    };
    bills.push(newBill);
};

export const updateBill = (id: string, updates: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => {
    bills = bills.map(b => {
        if (b.id === id) {
            const [year, month, day] = updates.dueDate.split('-').map(Number);
            const [hours, minutes] = updates.dueTime.split(':').map(Number);
            const dueDate = new Date(year, month - 1, day, hours, minutes);
            return { ...b, ...updates, dueDate: formatISO(dueDate) };
        }
        return b;
    });
};

export const deleteBill = (id: string) => {
    bills = bills.filter(b => b.id !== id);
};

export const toggleBillPaidStatus = (id: string, currentStatus: boolean) => {
    bills = bills.map(b => b.id === id ? { ...b, isPaid: !currentStatus } : b);
};


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
