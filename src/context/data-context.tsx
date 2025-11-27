'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction, Budget, Bill } from '@/lib/types';
import { 
    getTransactions,
    addTransaction as addTransactionApi,
    getBudgets,
    addBudget as addBudgetApi,
    updateBudget as updateBudgetApi,
    deleteBudget as deleteBudgetApi,
    getBills,
    addBill as addBillApi,
    updateBill as updateBillApi,
    deleteBill as deleteBillApi,
} from '@/lib/data';
import { formatISO } from 'date-fns';

// Mock user ID. In a real app, this would come from an auth context.
const MOCK_USER_ID = '1';

interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  loading: boolean;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'userId'>) => Promise<void>;
  addBudget: (budget: Omit<Budget, 'id' | 'userId'>) => Promise<void>;
  updateBudget: (id: string, newAmount: number) => Promise<void>;
  deleteBudget: (id: string) => Promise<void>;
  refreshBudgets: () => void;
  addBill: (bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => Promise<void>;
  updateBill: (id: string, updates: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  toggleBillPaidStatus: (id: string, currentStatus: boolean) => Promise<void>;
  refreshBills: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [transactionsData, budgetsData, billsData] = await Promise.all([
        getTransactions(MOCK_USER_ID),
        getBudgets(MOCK_USER_ID),
        getBills(MOCK_USER_ID),
      ]);
      setTransactions(transactionsData);
      setBudgets(budgetsData);
      setBills(billsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Handle error appropriately, e.g., show a toast notification
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    const newTransaction = await addTransactionApi(MOCK_USER_ID, transaction);
    setTransactions(prev => [newTransaction, ...prev]);
  }, []);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id' | 'userId'>) => {
    const newBudget = await addBudgetApi(MOCK_USER_ID, budget);
    setBudgets(prev => [...prev, newBudget]);
  }, []);

  const updateBudget = useCallback(async (id: string, newAmount: number) => {
    await updateBudgetApi(MOCK_USER_ID, id, newAmount);
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, amount: newAmount } : b));
  }, []);

  const deleteBudget = useCallback(async (id: string) => {
    await deleteBudgetApi(MOCK_USER_ID, id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, []);

  const refreshBudgets = useCallback(async () => {
    setLoading(true);
    const budgetsData = await getBudgets(MOCK_USER_ID);
    setBudgets(budgetsData);
    setLoading(false);
  }, []);
  
  const addBill = useCallback(async (bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => {
    const [year, month, day] = bill.dueDate.split('-').map(Number);
    const [hours, minutes] = bill.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes);

    const newBillData = {
        ...bill,
        isPaid: false,
        dueDate: formatISO(dueDate),
    };
    
    const newBill = await addBillApi(MOCK_USER_ID, newBillData);
    setBills(prev => [...prev, newBill].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  }, []);

  const updateBill = useCallback(async (id: string, updates: Omit<Bill, 'id'| 'isPaid' | 'userId'>) => {
      const [year, month, day] = updates.dueDate.split('-').map(Number);
      const [hours, minutes] = updates.dueTime.split(':').map(Number);
      const dueDate = new Date(year, month - 1, day, hours, minutes);
      const finalUpdates = { ...updates, dueDate: formatISO(dueDate) };

      await updateBillApi(MOCK_USER_ID, id, finalUpdates);
      setBills(prev => prev.map(b => b.id === id ? { ...b, ...finalUpdates } : b)
                          .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  }, []);

  const deleteBill = useCallback(async (id: string) => {
      await deleteBillApi(MOCK_USER_ID, id);
      setBills(prev => prev.filter(b => b.id !== id));
  }, []);

  const toggleBillPaidStatus = useCallback(async (id: string, currentStatus: boolean) => {
      const newStatus = !currentStatus;
      await updateBillApi(MOCK_USER_ID, id, { isPaid: newStatus });

      const bill = bills.find(b => b.id === id);
      if (!bill) return;

      if (newStatus) { // If marking as paid
        await addTransaction({
          type: 'expense',
          amount: bill.amount,
          category: 'Tagihan',
          date: new Date().toISOString(),
          description: bill.name,
        });
      }
      
      setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: newStatus } : b));
  }, [bills, addTransaction]);

  const refreshBills = useCallback(async () => {
    setLoading(true);
    const billsData = await getBills(MOCK_USER_ID);
    setBills(billsData);
    setLoading(false);
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
