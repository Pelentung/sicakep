import { subMonths, formatISO, parseISO, startOfDay } from 'date-fns';
import type { Transaction, Budget, Bill, FinancialSummary } from './types';

const now = new Date();

let mockTransactions: Transaction[] = [
  { id: '1', type: 'income', amount: 5000, category: 'Gaji', date: formatISO(subMonths(now, 1)), description: 'Gaji Bulanan' },
  { id: '2', type: 'expense', amount: 75, category: 'Makanan', date: formatISO(new Date(now.setDate(2))), description: 'Makan siang' },
  { id: '3', type: 'expense', amount: 200, category: 'Transportasi', date: formatISO(new Date(new Date().setDate(3))), description: 'Bensin' },
  { id: '4', type: 'expense', amount: 1500, category: 'Sewa', date: formatISO(new Date(new Date().setDate(5))), description: 'Sewa apartemen' },
  { id: '5', type: 'income', amount: 300, category: 'Freelance', date: formatISO(new Date(new Date().setDate(10))), description: 'Proyek desain' },
  { id: '6', type: 'expense', amount: 50, category: 'Hiburan', date: formatISO(new Date(new Date().setDate(12))), description: 'Tiket bioskop' },
  { id: '7', type: 'expense', amount: 100, category: 'Belanja', date: formatISO(new Date(new Date().setDate(15))), description: 'Baju baru' },
  { id: '8', type: 'expense', amount: 80, category: 'Kesehatan', date: formatISO(new Date(new Date().setDate(18))), description: 'Obat' },
  { id: '9', type: 'expense', amount: 120, category: 'Makanan', date: formatISO(new Date(new Date().setDate(20))), description: 'Makan malam' },
  { id: '10', type: 'expense', amount: 300, category: 'Tagihan', date: formatISO(new Date(new Date().setDate(25))), description: 'Tagihan listrik' },
];

let mockBudgets: Budget[] = [
  { id: '1', category: 'Makanan', amount: 800 },
  { id: '2', category: 'Transportasi', amount: 400 },
  { id: '3', category: 'Hiburan', amount: 200 },
  { id: '4', category: 'Belanja', amount: 500 },
  { id: '5', category: 'Sewa', amount: 1500 },
  { id: '6', category: 'Tagihan', amount: 500 },
];

let mockBills: Bill[] = [
  { id: '1', name: 'Tagihan Internet', amount: 50, dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), 28)), isPaid: false },
  { id: '2', name: 'Langganan Streaming', amount: 15, dueDate: formatISO(new Date(now.getFullYear(), now.getMonth() + 1, 5)), isPaid: false },
  { id: '3', name: 'Cicilan', amount: 250, dueDate: formatISO(new Date(now.getFullYear(), now.getMonth() + 1, 10)), isPaid: false },
  { id: '4', name: 'Tagihan Listrik', amount: 75, dueDate: formatISO(new Date(now.getFullYear(), now.getMonth(), 15)), isPaid: true },
];

export const getTransactions = (): Transaction[] => {
  return mockTransactions;
};

export const getBudgets = (): Budget[] => {
  return mockBudgets;
};

export const getBills = (): Bill[] => {
  return mockBills.sort((a,b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
  const newTransaction = { ...transaction, id: crypto.randomUUID() };
  mockTransactions.push(newTransaction);
  return newTransaction;
}

export const addBudget = (budget: Omit<Budget, 'id'>) => {
  const newBudget = { ...budget, id: crypto.randomUUID() };
  mockBudgets.push(newBudget);
  mockBudgets.sort((a,b) => a.category.localeCompare(b.category));
  return newBudget;
}

export const updateBudget = (id: string, newAmount: number) => {
    const budgetIndex = mockBudgets.findIndex(b => b.id === id);
    if (budgetIndex !== -1) {
        mockBudgets[budgetIndex].amount = newAmount;
        return mockBudgets[budgetIndex];
    }
    return null;
}

export const deleteBudget = (id: string) => {
    const budgetIndex = mockBudgets.findIndex(b => b.id === id);
    if (budgetIndex !== -1) {
        mockBudgets.splice(budgetIndex, 1);
        return true;
    }
    return false;
}

export const addBill = (bill: Omit<Bill, 'id' | 'isPaid'>) => {
    const newBill: Bill = { ...bill, id: crypto.randomUUID(), isPaid: false, dueDate: formatISO(startOfDay(parseISO(bill.dueDate))) };
    mockBills.push(newBill);
    return newBill;
};

export const updateBill = (id: string, updates: Omit<Bill, 'id' | 'isPaid'>) => {
    const billIndex = mockBills.findIndex(b => b.id === id);
    if (billIndex !== -1) {
        mockBills[billIndex] = { ...mockBills[billIndex], ...updates, dueDate: formatISO(startOfDay(parseISO(updates.dueDate))) };
        return mockBills[billIndex];
    }
    return null;
};

export const deleteBill = (id: string) => {
    const billIndex = mockBills.findIndex(b => b.id === id);
    if (billIndex !== -1) {
        mockBills.splice(billIndex, 1);
        return true;
    }
    return false;
};

export const toggleBillPaidStatus = (id: string) => {
    const billIndex = mockBills.findIndex(b => b.id === id);
    if (billIndex !== -1) {
        mockBills[billIndex].isPaid = !mockBills[billIndex].isPaid;
        return mockBills[billIndex];
    }
    return null;
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
