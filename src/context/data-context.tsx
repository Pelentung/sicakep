'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction, Budget, Bill } from '@/lib/types';
import { 
    getInitialTransactions, 
    getInitialBudgets, 
    getInitialBills 
} from '@/lib/data';
import { formatISO } from 'date-fns';

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
  addBudget: (budget: Omit<Budget, 'id' | 'userId'>) => void;
  updateBudget: (id: string, newAmount: number) => void;
  deleteBudget: (id: string) => void;
  refreshBudgets: () => void;
  addBill: (bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => void;
  updateBill: (id: string, updates: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => void;
  deleteBill: (id: string) => void;
  toggleBillPaidStatus: (id: string, currentStatus: boolean) => void;
  refreshBills: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching initial data
    setTransactions(getInitialTransactions());
    setBudgets(getInitialBudgets());
    setBills(getInitialBills());
    setLoading(false);
  }, []);

  const addTransaction = useCallback((transaction: Omit<Transaction, 'id' | 'userId'>) => {
    setTransactions(prev => {
        const newId = (Math.max(...prev.map(t => parseInt(t.id))) + 1).toString();
        const newTransaction: Transaction = { ...transaction, id: newId, userId: '1' };
        return [newTransaction, ...prev];
    });
  }, []);

  const addBudget = useCallback((budget: Omit<Budget, 'id' | 'userId'>) => {
    setBudgets(prev => {
        const newId = (Math.max(0, ...prev.map(b => parseInt(b.id))) + 1).toString();
        const newBudget: Budget = { ...budget, id: newId, userId: '1' };
        return [...prev, newBudget];
    });
  }, []);

  const updateBudget = useCallback((id: string, newAmount: number) => {
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, amount: newAmount } : b));
  }, []);

  const deleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  const refreshBudgets = useCallback(() => {
    // In a real app, you might re-fetch from an API. Here we just re-read.
    setBudgets(getInitialBudgets());
  }, []);
  
  const addBill = useCallback((bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => {
    const [year, month, day] = bill.dueDate.split('-').map(Number);
    const [hours, minutes] = bill.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes);

    setBills(prev => {
        const newId = (Math.max(0, ...prev.map(b => parseInt(b.id))) + 1).toString();
        const newBill: Bill = {
            ...bill,
            id: newId,
            isPaid: false,
            dueDate: formatISO(dueDate),
            userId: '1'
        };
        const sorted = [...prev, newBill].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
        return sorted;
    });
  }, []);

  const updateBill = useCallback((id: string, updates: Omit<Bill, 'id'| 'isPaid' | 'userId'>) => {
      setBills(prev => prev.map(b => {
          if (b.id === id) {
              const [year, month, day] = updates.dueDate.split('-').map(Number);
              const [hours, minutes] = updates.dueTime.split(':').map(Number);
              const dueDate = new Date(year, month - 1, day, hours, minutes);
              return { ...b, ...updates, dueDate: formatISO(dueDate) };
          }
          return b;
      }).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  }, []);

  const deleteBill = useCallback((id: string) => {
      setBills(prev => prev.filter(b => b.id !== id));
  }, []);

  const toggleBillPaidStatus = useCallback((id: string, currentStatus: boolean) => {
      const bill = bills.find(b => b.id === id);
      if (!bill) return;

      // Only add transaction if marking as PAID
      if (!currentStatus) {
        addTransaction({
          type: 'expense',
          amount: bill.amount,
          category: 'Tagihan',
          date: new Date().toISOString(),
          description: bill.name,
        });
      }
      
      setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: !currentStatus } : b));
  }, [bills, addTransaction]);

  const refreshBills = useCallback(() => {
    setBills(getInitialBills());
  }, []);

  const value = {
    transactions,
    budgets,
    bills,
    loading,
    addTransaction,
    addBudget,
    updateBudget,
    deleteBudget,
    refreshBudgets,
    addBill,
    updateBill,
    deleteBill,
    toggleBillPaidStatus,
    refreshBills,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
