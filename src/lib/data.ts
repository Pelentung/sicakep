'use client';

import { getFirestore, collection, getDocs, doc, addDoc, updateDoc, deleteDoc, query, orderBy, writeBatch, FirestoreError } from 'firebase/firestore';
import { app } from '@/firebase/config';
import type { Transaction, Budget, Bill, FinancialSummary } from './types';
import { FirestorePermissionError } from '@/firebase/errors';
import { errorEmitter } from './events';


const db = getFirestore(app);

// --- Transactions ---
export const getTransactions = async (userId: string): Promise<Transaction[]> => {
    const transactionCollection = collection(db, 'users', userId, 'transactions');
    try {
        const q = query(transactionCollection, orderBy('date', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'list',
                path: transactionCollection.path
            }));
        } else {
            console.error("Error getting transactions:", error);
        }
        return [];
    }
};

export const addTransaction = async (userId: string, transaction: Omit<Transaction, 'id'>): Promise<void> => {
    const transactionCollection = collection(db, 'users', userId, 'transactions');
    try {
        await addDoc(transactionCollection, transaction);
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: transactionCollection.path,
                requestResourceData: transaction
            }));
        }
        // Do not rethrow, let the emitter handle it.
    }
};

// --- Budgets ---
export const getBudgets = async (userId: string): Promise<Budget[]> => {
    const budgetCollection = collection(db, 'users', userId, 'budgets');
    try {
        const querySnapshot = await getDocs(budgetCollection);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'list',
                path: budgetCollection.path
            }));
        } else {
            console.error("Error getting budgets:", error);
        }
        return [];
    }
};

export const addBudget = async (userId: string, budget: Omit<Budget, 'id'>): Promise<void> => {
    const budgetCollection = collection(db, 'users', userId, 'budgets');
    try {
        await addDoc(budgetCollection, budget);
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
             errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: budgetCollection.path,
                requestResourceData: budget
             }));
        }
        // Do not rethrow
    }
};

export const updateBudget = async (userId: string, budgetId: string, newAmount: number): Promise<void> => {
    const budgetRef = doc(db, 'users', userId, 'budgets', budgetId);
    const updateData = { amount: newAmount };
    try {
        await updateDoc(budgetRef, updateData);
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'update',
                path: budgetRef.path,
                requestResourceData: updateData
            }));
        }
        // Do not rethrow
    }
};

export const deleteBudget = async (userId: string, budgetId: string): Promise<void> => {
    const budgetRef = doc(db, 'users', userId, 'budgets', budgetId);
    try {
        await deleteDoc(budgetRef);
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'delete',
                path: budgetRef.path
            }));
        }
        // Do not rethrow
    }
};


// --- Bills ---
export const getBills = async (userId: string): Promise<Bill[]> => {
    const billCollection = collection(db, 'users', userId, 'bills');
    try {
        const q = query(billCollection, orderBy('dueDate', 'asc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bill));
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'list',
                path: billCollection.path
            }));
        } else {
            console.error("Error getting bills:", error);
        }
        return [];
    }
};

export const addBill = async (userId: string, bill: Omit<Bill, 'id'>): Promise<void> => {
    const billCollection = collection(db, 'users', userId, 'bills');
    try {
        await addDoc(billCollection, bill);
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: billCollection.path,
                requestResourceData: bill
            }));
        }
        // Do not rethrow
    }
};

export const updateBill = async (userId: string, billId: string, updates: Partial<Bill>): Promise<void> => {
    const billRef = doc(db, 'users', userId, 'bills', billId);
    try {
        await updateDoc(billRef, updates);
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'update',
                path: billRef.path,
                requestResourceData: updates
            }));
        }
        // Do not rethrow
    }
};

export const deleteBill = async (userId: string, billId: string): Promise<void> => {
    const billRef = doc(db, 'users', userId, 'bills', billId);
    try {
        await deleteDoc(billRef);
    } catch (error) {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'delete',
                path: billRef.path
            }));
        }
        // Do not rethrow
    }
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
