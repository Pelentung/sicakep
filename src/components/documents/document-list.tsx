'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import type { Transaction, Budget, Bill, Note } from '@/lib/types';
import { useAuth } from './auth-context';
import { db, storage } from '@/firebase/config';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, writeBatch, serverTimestamp, query, orderBy, FirestoreError } from 'firebase/firestore';
import { ref, deleteObject } from "firebase/storage";
import { formatISO } from 'date-fns';
import { errorEmitter } from '@/lib/events';
import { FirestorePermissionError } from '@/firebase/errors';


interface DataContextType {
  transactions: Transaction[];
  budgets: Budget[];
  bills: Bill[];
  notes: Note[];
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
  addNote: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
  updateNote: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<void>;
  deleteNote: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [bills, setBills] = useState<Bill[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  // Firestore listeners
  useEffect(() => {
    if (user) {
      setLoading(true);

      const createErrorHandler = (collectionName: string) => (error: FirestoreError) => {
        if (error.code === 'permission-denied') {
          errorEmitter.emit('permission-error', new FirestorePermissionError({
            operation: 'list',
            path: `users/${user.uid}/${collectionName}`
          }));
        } else {
          console.error(`An unexpected error occurred while listening to ${collectionName}:`, error);
        }
      };

      const transactionsQuery = query(collection(db, `users/${user.uid}/transactions`), orderBy('date', 'desc'));
      const unsubTransactions = onSnapshot(transactionsQuery, (snapshot) => {
        const trans: Transaction[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
        setTransactions(trans);
        setLoading(false); 
      }, createErrorHandler('transactions'));

      const budgetsQuery = query(collection(db, `users/${user.uid}/budgets`));
      const unsubBudgets = onSnapshot(budgetsQuery, (snapshot) => {
        const buds: Budget[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Budget));
        setBudgets(buds);
      }, createErrorHandler('budgets'));

      const billsQuery = query(collection(db, `users/${user.uid}/bills`), orderBy('dueDate', 'asc'));
      const unsubBills = onSnapshot(billsQuery, (snapshot) => {
        const b: Bill[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Bill));
        setBills(b);
      }, createErrorHandler('bills'));

      const notesQuery = query(collection(db, `users/${user.uid}/notes`), orderBy('createdAt', 'desc'));
      const unsubNotes = onSnapshot(notesQuery, (snapshot) => {
        const n: Note[] = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), createdAt: doc.data().createdAt?.toDate().toISOString() } as Note));
        setNotes(n);
      }, createErrorHandler('notes'));


      return () => {
        unsubTransactions();
        unsubBudgets();
        unsubBills();
        unsubNotes();
      };
    } else if (!authLoading) {
      // User is logged out, clear data
      setTransactions([]);
      setBudgets([]);
      setBills([]);
      setNotes([]);
      setLoading(false);
    }
  }, [user, authLoading]);
  
  const addTransaction = useCallback(async (transaction: Omit<Transaction, 'id'>) => {
      if (!user) throw new Error("User not authenticated");
      const collectionRef = collection(db, `users/${user.uid}/transactions`);
      const payload = { ...transaction, createdAt: serverTimestamp() };
      addDoc(collectionRef, payload).catch(error => {
          if (error instanceof FirestoreError && error.code === 'permission-denied') {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'create',
                  path: `${collectionRef.path}/<new_id>`,
                  requestResourceData: payload,
              }));
          } else {
              console.error("Error adding transaction:", error);
          }
      });
  }, [user]);

  const addBudget = useCallback(async (budget: Omit<Budget, 'id'>) => {
      if (!user) throw new Error("User not authenticated");
      const collectionRef = collection(db, `users/${user.uid}/budgets`);
      const payload = { ...budget, createdAt: serverTimestamp() };
      addDoc(collectionRef, payload).catch(error => {
          if (error instanceof FirestoreError && error.code === 'permission-denied') {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'create',
                  path: `${collectionRef.path}/<new_id>`,
                  requestResourceData: payload,
              }));
          } else {
              console.error("Error adding budget:", error);
          }
      });
  }, [user]);

  const updateBudget = useCallback(async (id: string, newAmount: number) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(db, `users/${user.uid}/budgets`, id);
      const payload = { amount: newAmount };
      updateDoc(docRef, payload).catch(error => {
          if (error instanceof FirestoreError && error.code === 'permission-denied') {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'update',
                  path: docRef.path,
                  requestResourceData: payload,
              }));
          } else {
              console.error("Error updating budget:", error);
          }
      });
  }, [user]);

  const deleteBudget = useCallback(async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(db, `users/${user.uid}/budgets`, id);
      deleteDoc(docRef).catch(error => {
          if (error instanceof FirestoreError && error.code === 'permission-denied') {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'delete',
                  path: docRef.path,
              }));
          } else {
              console.error("Error deleting budget:", error);
          }
      });
  }, [user]);

  const refreshBudgets = useCallback(() => {
    // No-op for Firestore real-time listener
  }, []);
  
  const addBill = useCallback(async (bill: Omit<Bill, 'id' | 'isPaid'>) => {
    if (!user) throw new Error("User not authenticated");
    const [year, month, day] = bill.dueDate.split('-').map(Number);
    const [hours, minutes] = bill.dueTime.split(':').map(Number);
    const dueDate = new Date(year, month - 1, day, hours, minutes);

    const collectionRef = collection(db, `users/${user.uid}/bills`);
    const payload = {
        ...bill,
        isPaid: false,
        dueDate: formatISO(dueDate),
        createdAt: serverTimestamp(),
    };
    addDoc(collectionRef, payload).catch(error => {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: `${collectionRef.path}/<new_id>`,
                requestResourceData: payload,
            }));
        } else {
            console.error("Error adding bill:", error);
        }
    });
  }, [user]);

  const updateBill = useCallback(async (id: string, updates: Partial<Omit<Bill, 'id'>>) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(db, `users/${user.uid}/bills`, id);
      let finalUpdates: Partial<Bill> = { ...updates };
      if (updates.dueDate && 'dueTime' in updates && updates.dueTime) {
        const [year, month, day] = updates.dueDate.split('-').map(Number);
        const [hours, minutes] = updates.dueTime.split(':').map(Number);
        const newDueDate = new Date(year, month - 1, day, hours, minutes);
        finalUpdates.dueDate = formatISO(newDueDate);
      }
      updateDoc(docRef, finalUpdates).catch(error => {
          if (error instanceof FirestoreError && error.code === 'permission-denied') {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'update',
                  path: docRef.path,
                  requestResourceData: finalUpdates,
              }));
          } else {
              console.error("Error updating bill:", error);
          }
      });
  }, [user]);

  const deleteBill = useCallback(async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(db, `users/${user.uid}/bills`, id);
      deleteDoc(docRef).catch(error => {
          if (error instanceof FirestoreError && error.code === 'permission-denied') {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'delete',
                  path: docRef.path,
              }));
          } else {
              console.error("Error deleting bill:", error);
          }
      });
  }, [user]);

  const toggleBillPaidStatus = useCallback(async (id: string, currentStatus: boolean) => {
      if (!user) throw new Error("User not authenticated");
      const newStatus = !currentStatus;
      const bill = bills.find(b => b.id === id);
      if (!bill) return;

      const batch = writeBatch(db);

      // Update bill status
      const billRef = doc(db, `users/${user.uid}/bills`, id);
      batch.update(billRef, { isPaid: newStatus });

      // If marking as paid, add a transaction
      if (newStatus) {
          const transactionRef = doc(collection(db, `users/${user.uid}/transactions`));
          batch.set(transactionRef, {
              type: 'expense',
              amount: bill.amount,
              category: 'Tagihan',
              date: new Date().toISOString(),
              description: `Pembayaran: ${bill.name}`,
              createdAt: serverTimestamp()
          });
      }
      
      batch.commit().catch(error => {
           if (error instanceof FirestoreError && error.code === 'permission-denied') {
              // This is a complex error to model. We'll emit a generic one for the batch.
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'update',
                  path: billRef.path, // We report the primary operation path
                  requestResourceData: { isPaid: newStatus, note: "This was a batch write with a transaction." }
              }));
          } else {
              console.error("Error toggling bill status:", error);
          }
      });

  }, [user, bills]);


  const refreshBills = useCallback(async () => {
    // No-op for Firestore real-time listener
  }, []);

  const addNote = useCallback(async (note: Omit<Note, 'id' | 'createdAt'>) => {
    if (!user) throw new Error("User not authenticated");
    const collectionRef = collection(db, `users/${user.uid}/notes`);
    const payload = { ...note, createdAt: serverTimestamp() };
    addDoc(collectionRef, payload).catch(error => {
        if (error instanceof FirestoreError && error.code === 'permission-denied') {
            errorEmitter.emit('permission-error', new FirestorePermissionError({
                operation: 'create',
                path: `${collectionRef.path}/<new_id>`,
                requestResourceData: payload,
            }));
        } else {
            console.error("Error adding note:", error);
        }
    });
  }, [user]);

  const updateNote = useCallback(async (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(db, `users/${user.uid}/notes`, id);
      updateDoc(docRef, updates).catch(error => {
          if (error instanceof FirestoreError && error.code === 'permission-denied') {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'update',
                  path: docRef.path,
                  requestResourceData: updates,
              }));
          } else {
              console.error("Error updating note:", error);
          }
      });
  }, [user]);

  const deleteNote = useCallback(async (id: string) => {
      if (!user) throw new Error("User not authenticated");
      const docRef = doc(db, `users/${user.uid}/notes`, id);
      deleteDoc(docRef).catch(error => {
          if (error instanceof FirestoreError && error.code === 'permission-denied') {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                  operation: 'delete',
                  path: docRef.path,
              }));
          } else {
              console.error("Error deleting note:", error);
          }
      });
  }, [user]);

  const value = {
    transactions,
    budgets,
    bills,
    notes,
    loading: authLoading || loading,
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
    addNote,
    updateNote,
    deleteNote,
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