'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction, Budget, Bill } from '@/lib/types';
import { useLocalStorage } from '@/hooks/use-local-storage';
import { 
    addTransaction as addTransactionLocal,
    updateBudget as updateBudgetLocal,
    deleteBudget as deleteBudgetLocal,
    addBill as addBillLocal,
    updateBill as updateBillLocal,
    deleteBill as deleteBillLocal,
    addBudget as addBudgetLocal,
} from '@/lib/data';
import { formatISO } from 'date-fns';
import { useAuth } from './auth-context';
import { v4 as uuidv4 } from 'uuid';

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id'>) => Promise<void>;
  updateBudget: (id: string, newAmount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  refreshBudgets: () => void;
  addBill: (bill: Omit<Bill, 'id' | 'isPaid'>) => Promise<void>;
  updateBill: (id: string, updates: Partial<Omit<Bill, 'id'>>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  toggleBillPaidStatus: (id: string, currentStatus: boolean) => Promise<void>;
  refreshBills: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('transactions', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('budgets', []);
  const [bills, setBills] = useLocalStorage<Bill[]>('bills', []);
  const [loading, setLoading] = useState(true);

  // When auth is done loading, data is also "done" loading from local storage
  useEffect(() => {
    if (!authLoading) {
      setLoading(false);
    }
  }, [authLoading]);
  
  // Clear data on logout
  useEffect(() => {
      if (!user && !authLoading) {
          setTransactions([]);
          setBudgets([]);
          setBills([]);
      }
  }, [user, authLoading, setTransactions, setBudgets, setBills])

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction = { ...transaction, id: uuidv4() };
    addTransactionLocal(newTransaction, setTransactions);
  }, [setTransactions]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    const newBudget = { ...budget, id: uuidv4() };
    addBudgetLocal(newBudget, setBudgets);
  }, [setBudgets]);

  const updateBudget = useCallback(async (id: string, newAmount: number) => {
    updateBudgetLocal(id, newAmount, setBudgets);
  }, [setBudgets]);

  const deleteBudget = useCallback(async (id: string) => {
    deleteBudgetLocal(id, setBudgets);
  }, [setBudgets]);

  const refreshBudgets = useCallback(() => {
    // No-op for local storage, changes are instant
  }, []);
  
  const addBill = useCallback(async (bill: Omit<Bill, 'id' | 'isPaid'>) => {
    const [year, month, day] = bill.dueDate.split('-').map(Number);
    const [hours, minutes] = bill.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes);

    const newBill = {
        ...bill,
        id: uuidv4(),
        isPaid: false,
        dueDate: formatISO(dueDate),
    };
    addBillLocal(newBill, setBills);
  }, [setBills]);

  const updateBill = useCallback(async (id: string, updates: Partial<Omit<Bill, 'id'>>) => {
      updateBillLocal(id, updates, setBills);
  }, [setBills]);

  const deleteBill = useCallback(async (id: string) => {
      deleteBillLocal(id, setBills);
  }, [setBills]);

  const toggleBillPaidStatus = useCallback(async (id: string, currentStatus: boolean) => {
      const newStatus = !currentStatus;
      const bill = bills.find(b => b.id === id);
      
      if (!bill) {
          console.error("Bill not found for toggling");
          return;
      }

      updateBillLocal(id, { isPaid: newStatus }, setBills);
      
      if (newStatus) { // If marking as paid
          addTransaction({
              type: 'expense',
              amount: bill.amount,
              category: 'Tagihan',
              date: new Date().toISOString(),
              description: `Pembayaran: ${bill.name}`,
          })
      }
  }, [bills, setBills, addTransaction]);


  const refreshBills = useCallback(async () => {
    // No-op for local storage
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
