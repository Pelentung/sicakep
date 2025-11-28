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
import { db } from '@/firebase/config';
import { collection, onSnapshot, query, orderBy, Unsubscribe, FirestoreError } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from '@/lib/events';

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

  useEffect(() => {
    if (user) {
        setLoading(true);
        const unsubscribes: Unsubscribe[] = [];

        const setupListener = <T extends { id: string }>(
            collectionName: string,
            setter: React.Dispatch<React.SetStateAction<T[]>>,
            orderByField?: string,
            orderByDirection: 'asc' | 'desc' = 'desc'
        ) => {
            const collectionRef = collection(db, 'users', user.uid, collectionName);
            const q = orderByField 
                ? query(collectionRef, orderBy(orderByField, orderByDirection))
                : collectionRef;
            
            const unsubscribe = onSnapshot(q, 
                (snapshot) => {
                    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
                    setter(data);
                    setLoading(false); // Set loading to false on first successful data load
                }, 
                (error) => {
                    if (error instanceof FirestoreError && error.code === 'permission-denied') {
                        errorEmitter.emit('permission-error', new FirestorePermissionError({
                            operation: 'list',
                            path: collectionRef.path
                        }));
                    } else {
                        console.error(`Error listening to ${collectionName}:`, error);
                    }
                    setLoading(false); // Also set loading to false on error
                }
            );
            unsubscribes.push(unsubscribe);
        };

        setupListener<Transaction>('transactions', setTransactions, 'date', 'desc');
        setupListener<Budget>('budgets', setBudgets, 'category', 'asc');
        setupListener<Bill>('bills', setBills, 'dueDate', 'asc');

        // Cleanup function to unsubscribe from all listeners on component unmount or user change
        return () => {
            unsubscribes.forEach(unsub => unsub());
            clearLocalData();
        };
    } else {
        // If there's no user, clear data and stop loading
        clearLocalData();
        setLoading(false);
    }
  }, [user, clearLocalData]);

  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) throw new Error("User not authenticated");
    // No more optimistic update needed with real-time listeners
    await addTransactionApi(user.uid, transaction);
  }, [user]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
    if (!user) throw new Error("User not authenticated");
    await addBudgetApi(user.uid, budget);
  }, [user]);

  const updateBudget = useCallback(async (id: string, newAmount: number) => {
    if (!user) throw new Error("User not authenticated");
    await updateBudgetApi(user.uid, id, newAmount);
  }, [user]);

  const deleteBudget = useCallback(async (id: string) => {
    if (!user) throw new Error("User not authenticated");
    await deleteBudgetApi(user.uid, id);
  }, [user]);

  const refreshBudgets = useCallback(async () => {
    // This function is now less critical due to real-time listeners,
    // but can be kept for manual refresh triggers if desired.
    if (!user) return;
    const budgetsData = await getBudgets(user.uid);
    setBudgets(budgetsData);
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
    
    await addBillApi(user.uid, newBillData);
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

      await updateBillApi(user.uid, id, finalUpdates);
  }, [user]);

  const deleteBill = useCallback(async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      await deleteBillApi(user.uid, id);
  }, [user]);

  const toggleBillPaidStatus = useCallback(async (id: string, currentStatus: boolean) => {
    if (!user) throw new Error("User not authenticated");

    const newStatus = !currentStatus;
    const bill = bills.find(b => b.id === id);
    if (!bill) {
        console.error("Bill not found for toggling status");
        return;
    }

    // Now, we don't need optimistic updates, just call the API.
    // The listener will update the UI.
    try {
        await updateBillApi(user.uid, id, { isPaid: newStatus });

        // If marking as paid, create the transaction.
        if (newStatus) {
            await addTransactionApi(user.uid, {
                type: 'expense',
                amount: bill.amount,
                category: 'Tagihan',
                date: new Date().toISOString(),
                description: `Pembayaran: ${bill.name}`,
            });
        }
    } catch (error) {
        console.error("Failed to toggle bill status or add transaction:", error);
        // We could add a toast here to inform the user of the failure.
    }
  }, [user, bills]);


  const refreshBills = useCallback(async () => {
    if (!user) return;
    const billsData = await getBills(user.uid);
    setBills(billsData);
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
