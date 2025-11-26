import { subMonths, formatISO } from 'date-fns';
import type { Transaction, Budget, Bill, FinancialSummary } from './types';

const now = new Date();

const mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 5000, category: 'Gaji', date: formatISO(subMonths(now, 1)), description: 'Gaji Bulanan' },
  { id: '2', type: 'expense', amount: 75, category: 'Makanan', date: formatISO(new Date(now.setDate(2))), description: 'Makan siang' },
  { id: '3', type: 'expense', amount: 200, category: 'Transportasi', date: formatISO(new Date(now.setDate(3))), description: 'Bensin' },
  { id: '4', type: 'expense', amount: 1500, category: 'Sewa', date: formatISO(new Date(now.setDate(5))), description: 'Sewa apartemen' },
  { id: '5', type: 'income', amount: 300, category: 'Freelance', date: formatISO(new Date(now.setDate(10))), description: 'Proyek desain' },
  { id: '6', type: 'expense', amount: 50, category: 'Hiburan', date: formatISO(new Date(now.setDate(12))), description: 'Tiket bioskop' },
  { id: '7', type: 'expense', amount: 100, category: 'Belanja', date: formatISO(new Date(now.setDate(15))), description: 'Baju baru' },
  { id: '8', type: 'expense', amount: 80, category: 'Kesehatan', date: formatISO(new Date(now.setDate(18))), description: 'Obat' },
  { id: '9', type: 'expense', amount: 120, category: 'Makanan', date: formatISO(new Date(now.setDate(20))), description: 'Makan malam' },
  { id: '10', type: 'expense', amount: 300, category: 'Tagihan', date: formatISO(new Date(now.setDate(25))), description: 'Tagihan listrik' },
];

const mockBudgets: Budget[] = [
  { id: '1', category: 'Makanan', amount: 800 },
  { id: '2', category: 'Transportasi', amount: 400 },
  { id: '3', category: 'Hiburan', amount: 200 },
  { id: '4', category: 'Belanja', amount: 500 },
  { id: '5', category: 'Sewa', amount: 1500 },
  { id: '6', category: 'Tagihan', amount: 500 },
];

const mockBills: Bill[] = [
  { id: '1', name: 'Tagihan Internet', amount: 50, dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), 28)), isPaid: false },
  { id: '2', name: 'Langganan Streaming', amount: 15, dueDate: formatISO(new Date(now.getFullYear(), now.getMonth() + 1, 5)), isPaid: false },
  { id: '3', name: 'Cicilan', amount: 250, dueDate: formatISO(new Date(now.getFullYear(), now.getMonth() + 1, 10)), isPaid: false },
];

export const getTransactions = (): Transaction[] => {
  return mockTransactions;
};

export const getBudgets = (): Budget[] => {
  return mockBudgets;
};

export const getBills = (): Bill[] => {
  return mockBills;
};

export const getFinancialSummary = (transactions: Transaction[]): FinancialSummary => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  return { totalIncome, totalExpenses, balance };
};

export const getSpendingByCategory = (transactions: Transaction[]): Record<string, number> => {
    return transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = 0;
            }
            acc[t.category] += t.amount;
            return acc;
        }, {} as Record<string, number>);
}
