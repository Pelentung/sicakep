'use client';

import type { Transaction, Budget, Bill, FinancialSummary } from './types';
import { formatISO } from 'date-fns';

// --- Local Storage CRUD Operations ---

// --- Transactions ---
export const addTransaction = (
  transaction: Transaction,
  setter: React.Dispatch<React.SetStateAction<Transaction[]>>
) => {
  setter(prev => [...prev, transaction]);
};

// --- Budgets ---
export const addBudget = (
  budget: Budget,
  setter: React.Dispatch<React.SetStateAction<Budget[]>>
) => {
  setter(prev => [...prev, budget]);
};

export const updateBudget = (
  budgetId: string,
  newAmount: number,
  setter: React.Dispatch<React.SetStateAction<Budget[]>>
) => {
  setter(prev => prev.map(b => b.id === budgetId ? { ...b, amount: newAmount } : b));
};

export const deleteBudget = (
  budgetId: string,
  setter: React.Dispatch<React.SetStateAction<Budget[]>>
) => {
  setter(prev => prev.filter(b => b.id !== budgetId));
};

// --- Bills ---
export const addBill = (
  bill: Bill,
  setter: React.Dispatch<React.SetStateAction<Bill[]>>
) => {
  setter(prev => [...prev, bill]);
};

export const updateBill = (
  billId: string,
  updates: Partial<Omit<Bill, 'id'>>,
  setter: React.Dispatch<React.SetStateAction<Bill[]>>
) => {
  setter(prev => prev.map(b => {
      if (b.id === billId) {
          let finalUpdates: Partial<Bill> = { ...updates };
          // Handle combined date/time update for local storage version
          if (updates.dueDate && 'dueTime' in updates && updates.dueTime) {
            const [year, month, day] = updates.dueDate.split('-').map(Number);
            const [hours, minutes] = updates.dueTime.split(':').map(Number);
            const newDueDate = new Date(year, month - 1, day, hours, minutes);
            finalUpdates.dueDate = formatISO(newDueDate);
          }
          return { ...b, ...finalUpdates };
      }
      return b;
  }));
};

export const deleteBill = (
  billId: string,
  setter: React.Dispatch<React.SetStateAction<Bill[]>>
) => {
  setter(prev => prev.filter(b => b.id !== billId));
};


// --- Utility Functions ---

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
