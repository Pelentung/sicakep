import { getFirestore, collection, getDocs, doc, getDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, writeBatch } from 'firebase/firestore';
import { app } from '@/firebase/config'; // Assuming you have this config file
import type { Transaction, Budget, Bill, FinancialSummary } from './types';
import { parseISO } from 'date-fns';

const db = getFirestore(app);

// --- Transactions ---
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
    const q = query(collection(db, 'users', userId, 'transactions'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
};

export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id' | 'userId'>): Promise<Transaction> => {
    const docRef = await addDoc(collection(db, 'users', userId, 'transactions'), transaction);
    return { id: docRef.id, userId, ...transaction };
};

// --- Budgets ---
export const getBudgets = async (userId: string): Promise<Budget[]> => {
    const querySnapshot = await getDocs(collection(db, 'users', userId, 'budgets'));
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
};

export const addBudget = async (userId: string, budget: Omit<Budget, 'id' | 'userId'>): Promise<Budget> => {
    const docRef = await addDoc(collection(db, 'users', userId, 'budgets'), budget);
    return { id: docRef.id, userId, ...budget };
};

export const updateBudget = async (userId: string, budgetId: string, newAmount: number): Promise<void> => {
    const budgetRef = doc(db, 'users', userId, 'budgets', budgetId);
    await updateDoc(budgetRef, { amount: newAmount });
};

export const deleteBudget = async (userId: string, budgetId: string): Promise<void> => {
    await deleteDoc(doc(db, 'users', userId, 'budgets', budgetId));
};


// --- Bills ---
export const getBills = async (userId: string): Promise<Bill[]> => {
    const q = query(collection(db, 'users', userId, 'bills'), orderBy('dueDate', 'asc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bill));
};

export const addBill = async (userId: string, bill: Omit<Bill, 'id' | 'userId'>): Promise<Bill> => {
    const docRef = await addDoc(collection(db, 'users', userId, 'bills'), bill);
    return { id: docRef.id, userId, ...bill };
};

export const updateBill = async (userId: string, billId: string, updates: Partial<Bill>): Promise<void> => {
    const billRef = doc(db, 'users', userId, 'bills', billId);
    await updateDoc(billRef, updates);
};

export const deleteBill = async (userId: string, billId: string): Promise<void> => {
    await deleteDoc(doc(db, 'users', userId, 'bills', billId));
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
