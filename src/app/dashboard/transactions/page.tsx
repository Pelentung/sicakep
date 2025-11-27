'use client';

import { useState } from 'react';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { MonthPicker } from '@/components/month-picker';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useData } from '@/context/data-context';

export default function TransactionsPage() {
  const { transactions, loading, addTransaction } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = parseISO(t.date);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return transactionDate >= start && transactionDate <= end;
  });

  if (loading) {
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
            <AddTransactionDialog onTransactionAdded={addTransaction} />
        </div>
      </div>
      <TransactionsTable transactions={filteredTransactions} />
    </div>
  );
}
