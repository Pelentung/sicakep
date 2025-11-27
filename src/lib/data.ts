import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  type Firestore,
} from 'firebase/firestore';
import {
  addDocumentNonBlocking,
  deleteDocumentNonBlocking,
  setDocumentNonBlocking,
  updateDocumentNonBlocking,
} from '@/firebase/non-blocking-updates';

import { formatISO, parseISO } from 'date-fns';
import type { Transaction, Budget, Bill, FinancialSummary } from './types';

// We now pass firestore and userId to all data functions.
// This file will no longer hold state.

export const getTransactions = async (
  db: Firestore,
  userId: string
): Promise<Transaction[]> => {
  const transactionsCol = collection(db, 'users', userId, 'transactions');
  const snapshot = await getDocs(transactionsCol);
  return snapshot.docs.map(
    (doc) => ({ ...doc.data(), id: doc.id } as Transaction)
  );
};

export const getBudgets = async (
  db: Firestore,
  userId: string
): Promise<Budget[]> => {
  const budgetsCol = collection(db, 'users', userId, 'budgets');
  const snapshot = await getDocs(budgetsCol);
  return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Budget));
};

export const getBills = async (
  db: Firestore,
  userId: string
): Promise<Bill[]> => {
  const billsCol = collection(db, 'users', userId, 'bills');
  const snapshot = await getDocs(billsCol);
  const bills = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Bill));
  return bills.sort((a,b) => parseISO(a.dueDate).getTime() - parseISO(b.dueDate).getTime());
};

export const addTransaction = (
  db: Firestore,
  userId: string,
  transaction: Omit<Transaction, 'id' | 'userId'>
) => {
  const transactionsCol = collection(db, 'users', userId, 'transactions');
  addDocumentNonBlocking(transactionsCol, { ...transaction, userId });
};

export const addBudget = (
  db: Firestore,
  userId: string,
  budget: Omit<Budget, 'id' | 'userId'>
) => {
  const budgetsCol = collection(db, 'users', userId, 'budgets');
  addDocumentNonBlocking(budgetsCol, { ...budget, userId });
};

export const updateBudget = (
  db: Firestore,
  userId: string,
  id: string,
  newAmount: number
) => {
  const budgetDoc = doc(db, 'users', userId, 'budgets', id);
  updateDocumentNonBlocking(budgetDoc, { amount: newAmount });
};

export const deleteBudget = (db: Firestore, userId: string, id: string) => {
  const budgetDoc = doc(db, 'users', userId, 'budgets', id);
  deleteDocumentNonBlocking(budgetDoc);
};

export const addBill = (
  db: Firestore,
  userId: string,
  bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>
) => {
  const [year, month, day] = bill.dueDate.split('-').map(Number);
  const [hours, minutes] = bill.dueTime.split(':').map(Number);
  const dueDate = new Date(year, month - 1, day, hours, minutes);

  const newBill: Omit<Bill, 'id'> = {
    ...bill,
    isPaid: false,
    dueDate: formatISO(dueDate),
    userId,
  };
  const billsCol = collection(db, 'users', userId, 'bills');
  addDocumentNonBlocking(billsCol, newBill);
};

export const updateBill = (
  db: Firestore,
  userId: string,
  id: string,
  updates: Omit<Bill, 'id' | 'isPaid' | 'userId'>
) => {
  const billDoc = doc(db, 'users', userId, 'bills', id);
  const [year, month, day] = updates.dueDate.split('-').map(Number);
  const [hours, minutes] = updates.dueTime.split(':').map(Number);
  const dueDate = new Date(year, month - 1, day, hours, minutes);

  updateDocumentNonBlocking(billDoc, { ...updates, dueDate: formatISO(dueDate) });
};

export const deleteBill = (db: Firestore, userId: string, id: string) => {
  const billDoc = doc(db, 'users', userId, 'bills', id);
  deleteDocumentNonBlocking(billDoc);
};

export const toggleBillPaidStatus = (db: Firestore, userId: string, id: string, currentStatus: boolean) => {
  const billDoc = doc(db, 'users', userId, 'bills', id);
  updateDocumentNonBlocking(billDoc, { isPaid: !currentStatus });
};

export const getFinancialSummary = (
  transactions: Transaction[]
): FinancialSummary => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  return { totalIncome, totalExpenses, balance };
};

export const getSpendingByCategory = (
  transactions: Transaction[]
): Record<string, number> => {
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
