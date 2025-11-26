import { formatISO, parseISO } from 'date-fns';
import type { Transaction, Budget, Bill, FinancialSummary } from './types';

import transactionsData from '@/database/transactions.json';
import budgetsData from '@/database/budgets.json';
import billsData from '@/database/bills.json';

// Function to generate dynamic dates for transactions and bills
const now = new Date();
const getDynamicDate = (day: number, monthOffset = 0, hour = 0, minute = 0) => {
  const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, day, hour, minute);
  return formatISO(date);
};

// We use structuredClone to avoid modifying the original imported JSON data.
// This simulates a fresh data fetch on each call.
let mockTransactions: Transaction[] = structuredClone(transactionsData).map((t, i) => {
    // Make dates dynamic relative to current month
    const day = (i * 3) + 1;
    if (i === 0) { // First transaction in previous month
        return { ...t, date: getDynamicDate(15, -1) };
    }
    return { ...t, date: getDynamicDate(day > 28 ? 28 : day) };
});

let mockBudgets: Budget[] = structuredClone(budgetsData);

let mockBills: Bill[] = structuredClone(billsData).map((bill, i) => {
    switch(i) {
        case 0: return { ...bill, dueDate: getDynamicDate(28, 0, 10, 0) };
        case 1: return { ...bill, dueDate: getDynamicDate(5, 1, 12, 0) };
        case 2: return { ...bill, dueDate: getDynamicDate(10, 1, 9, 0) };
        case 3: return { ...bill, dueDate: getDynamicDate(15, 0, 18, 0) };
        default: return bill;
    }
});


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
    const [year, month, day] = bill.dueDate.split('-').map(Number);
    const [hours, minutes] = bill.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes);
    
    const newBill: Bill = { ...bill, id: crypto.randomUUID(), isPaid: false, dueDate: formatISO(dueDate) };
    mockBills.push(newBill);
    return newBill;
};

export const updateBill = (id: string, updates: Omit<Bill, 'id' | 'isPaid'>) => {
    const billIndex = mockBills.findIndex(b => b.id === id);
    if (billIndex !== -1) {
        const [year, month, day] = updates.dueDate.split('-').map(Number);
        const [hours, minutes] = updates.dueTime.split(':').map(Number);
        const dueDate = new Date(year, month - 1, day, hours, minutes);

        mockBills[billIndex] = { ...mockBills[billIndex], ...updates, dueDate: formatISO(dueDate) };
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
