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
import { useAuth } from './auth-context';

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
  updateBill: (id: string, updates: Partial<Omit<Bill, 'id' | 'userId'>>) => Promise<void>;
  deleteBill: (id: string) => Promise<void>;
  toggleBillPaidStatus: (id: string, currentStatus: boolean) => Promise<void>;
  refreshBills: () => void;
  clearLocalData: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  const clearLocalData = useCallback(() => {
    setTransactions([]);
    setBudgets([]);
    setBills([]);
    setLoading(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        clearLocalData();
        return;
      }
      
      try {
        setLoading(true);
        const [transactionsData, budgetsData, billsData] = await Promise.all([
          getTransactions(user.uid),
          getBudgets(user.uid),
          getBills(user.uid),
        ]);
        setTransactions(transactionsData);
        setBudgets(budgetsData);
        setBills(billsData);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, clearLocalData]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id' | 'userId'>) => {
    if (!user) throw new Error("User not authenticated");
    const newTransaction = await addTransactionApi(user.uid, transaction);
    setTransactions(prev => [newTransaction, ...prev]);
  }, [user]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id' | 'userId'>) => {
    if (!user) throw new Error("User not authenticated");
    const newBudget = await addBudgetApi(user.uid, budget);
    setBudgets(prev => [...prev, newBudget]);
  }, [user]);

  const updateBudget = useCallback(async (id: string, newAmount: number) => {
    if (!user) throw new Error("User not authenticated");
    await updateBudgetApi(user.uid, id, newAmount);
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, amount: newAmount } : b));
  }, [user]);

  const deleteBudget = useCallback(async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteBudgetApi(user.uid, id);
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, [user]);

  const refreshBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const budgetsData = await getBudgets(user.uid);
    setBudgets(budgetsData);
    setLoading(false);
  }, [user]);
  
  const addBill = useCallback(async (bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => {
    if (!user) throw new Error("User not authenticated");
    
    const [year, month, day] = bill.dueDate.split('-').map(Number);
    const [hours, minutes] = bill.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes);

    const newBillData = {
        ...bill,
        isPaid: false,
        dueDate: formatISO(dueDate),
    };
    
    const newBill = await addBillApi(user.uid, newBillData);
    setBills(prev => [...prev, newBill].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  }, [user]);

  const updateBill = useCallback(async (id: string, updates: Partial<Omit<Bill, 'id' | 'userId'>>) => {
      if (!user) throw new Error("User not authenticated");
      
      let finalUpdates: Partial<Bill> = { ...updates };

      if (updates.dueDate && 'dueTime' in updates) {
        const [year, month, day] = updates.dueDate.split('-').map(Number);
        const [hours, minutes] = (updates.dueTime || '00:00').split(':').map(Number);
        const dueDate = new Date(year, month - 1, day, hours, minutes);
        finalUpdates = { ...updates, dueDate: formatISO(dueDate) };
      }

      await updateBillApi(user.uid, id, finalUpdates);
      setBills(prev => prev.map(b => b.id === id ? { ...b, ...finalUpdates } as Bill : b)
                          .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
  }, [user]);

  const deleteBill = useCallback(async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      await deleteBillApi(user.uid, id);
      setBills(prev => prev.filter(b => b.id !== id));
  }, [user]);

  const toggleBillPaidStatus = useCallback(async (id: string, currentStatus: boolean) => {
      if (!user) throw new Error("User not authenticated");
      
      const newStatus = !currentStatus;
      await updateBillApi(user.uid, id, { isPaid: newStatus });

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
  }, [bills, addTransaction, user]);

  const refreshBills = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const billsData = await getBills(user.uid);
    setBills(billsData);
    setLoading(false);
  }, [user]);

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
    clearLocalData
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
