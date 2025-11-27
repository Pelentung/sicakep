'use client';

import { useState, useEffect } from 'react';
import { addTransaction, getTransactions } from '@/lib/data';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { MonthPicker } from '@/components/month-picker';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import type { Transaction } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';

export default function TransactionsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);

  useEffect(() => {
    setAllTransactions(getTransactions());
    setTransactionsLoading(false);
  }, []);

  const filteredTransactions = allTransactions.filter((t) => {
    const transactionDate = parseISO(t.date);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return transactionDate >= start && transactionDate <= end;
  });

  const handleTransactionAdded = (transaction: Omit<Transaction, 'id' | 'userId'>) => {
      addTransaction(transaction);
      setAllTransactions(getTransactions());
  }

  if (transactionsLoading) {
      return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Riwayat Transaksi
        </h1>
        <div className="flex items-center gap-2">
            <MonthPicker date={currentMonth} onDateChange={setCurrentMonth} />
            <AddTransactionDialog onTransactionAdded={handleTransactionAdded} />
        </div>
      </div>
      <TransactionsTable transactions={filteredTransactions} />
    </div>
  );
}
