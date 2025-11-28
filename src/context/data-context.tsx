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

  const refreshAllData = useCallback(async () => {
      if (user) {
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
      } else {
        clearLocalData();
      }
  }, [user, clearLocalData]);

  useEffect(() => {
    refreshAllData();
  }, [user, refreshAllData]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error("User not authenticated");
    const tempId = `temp_${Date.now()}`;
    setTransactions(prev => [{ id: tempId, ...transaction }, ...prev]);
    const newTransaction = await addTransactionApi(user.uid, transaction);
    if (newTransaction) {
        setTransactions(prev => prev.map(t => t.id === tempId ? newTransaction : t));
    } else {
        // If the API call failed, remove the optimistic update
        setTransactions(prev => prev.filter(t => t.id !== tempId));
    }
  }, [user]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    if (!user) throw new Error("User not authenticated");
    const tempId = `temp_${Date.now()}`;
    setBudgets(prev => [...prev, { id: tempId, ...budget }]);
    const newBudget = await addBudgetApi(user.uid, budget);
    if (newBudget) {
        setBudgets(prev => prev.map(b => b.id === tempId ? newBudget : b));
    } else {
        setBudgets(prev => prev.filter(b => b.id !== tempId));
    }
  }, [user]);

  const updateBudget = useCallback(async (id: string, newAmount: number) => {
    if (!user) throw new Error("User not authenticated");
    setBudgets(prev => prev.map(b => b.id === id ? { ...b, amount: newAmount } : b));
    await updateBudgetApi(user.uid, id, newAmount);
  }, [user]);

  const deleteBudget = useCallback(async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    setBudgets(prev => prev.filter(b => b.id !== id));
    await deleteBudgetApi(user.uid, id);
  }, [user]);

  const refreshBudgets = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const budgetsData = await getBudgets(user.uid);
    setBudgets(budgetsData);
    setLoading(false);
  }, [user]);
  
  const addBill = useCallback(async (bill: Omit<Bill, 'id' | 'isPaid'>) => {
    if (!user) throw new Error("User not authenticated");
    
    const [year, month, day] = bill.dueDate.split('-').map(Number);
    const [hours, minutes] = bill.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes);

    const newBillData = {
        ...bill,
        isPaid: false,
        dueDate: formatISO(dueDate),
    };
    
    const tempId = `temp_${Date.now()}`;
    setBills(prev => [...prev, { id: tempId, ...newBillData }].sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    
    const newBill = await addBillApi(user.uid, newBillData);
    if(newBill) {
        setBills(prev => prev.map(b => b.id === tempId ? newBill : b).sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
    } else {
        setBills(prev => prev.filter(b => b.id !== tempId));
    }
  }, [user]);

  const updateBill = useCallback(async (id: string, updates: Partial<Omit<Bill, 'id'>>) => {
      if (!user) throw new Error("User not authenticated");
      
      let finalUpdates: Partial<Bill> = { ...updates };

      if (updates.dueDate && 'dueTime' in updates) {
        const [year, month, day] = updates.dueDate.split('-').map(Number);
        const [hours, minutes] = (updates.dueTime || '00:00').split(':').map(Number);
        const dueDate = new Date(year, month - 1, day, hours, minutes);
        finalUpdates = { ...updates, dueDate: formatISO(dueDate) };
      }

      setBills(prev => prev.map(b => b.id === id ? { ...b, ...finalUpdates } as Bill : b)
                          .sort((a,b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()));
      await updateBillApi(user.uid, id, finalUpdates);
  }, [user]);

  const deleteBill = useCallback(async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      setBills(prev => prev.filter(b => b.id !== id));
      await deleteBillApi(user.uid, id);
  }, [user]);

  const toggleBillPaidStatus = useCallback(async (id: string, currentStatus: boolean) => {
    if (!user) throw new Error("User not authenticated");

    const newStatus = !currentStatus;
    const originalBills = bills;

    // Optimistic update for UI responsiveness
    setBills(prev => prev.map(b => b.id === id ? { ...b, isPaid: newStatus } : b));

    try {
        await updateBillApi(user.uid, id, { isPaid: newStatus });

        const bill = originalBills.find(b => b.id === id);
        if (!bill) return;

        if (newStatus) { // If marking as paid, add a transaction
            await addTransaction({
                type: 'expense',
                amount: bill.amount,
                category: 'Tagihan',
                date: new Date().toISOString(),
                description: `Pembayaran: ${bill.name}`,
            });
            // Refresh transactions to show the new payment
            const transactionsData = await getTransactions(user.uid);
            setTransactions(transactionsData);
        } else {
            // If marking as unpaid, you might want to find and remove the corresponding payment transaction.
            // This is more complex and depends on the app's logic. For now, we'll just update the bill.
        }
    } catch (error) {
        // If something fails, revert the optimistic update
        setBills(originalBills);
        console.error("Failed to toggle bill status or add transaction:", error);
    }
  }, [user, bills, addTransaction]);


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
