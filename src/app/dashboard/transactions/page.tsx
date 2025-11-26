'use client';

import { useState } from 'react';
import { getTransactions } from '@/lib/data';
import { AddTransactionDialog } from '@/components/transactions/add-transaction-dialog';
import { TransactionsTable } from '@/components/transactions/transactions-table';
import { MonthPicker } from '@/components/month-picker';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';

export default function TransactionsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const allTransactions = getTransactions();

  const filteredTransactions = allTransactions.filter((t) => {
    const transactionDate = parseISO(t.date);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return transactionDate >= start && transactionDate <= end;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Riwayat Transaksi
        </h1>
        <div className="flex items-center gap-2">
            <MonthPicker date={currentMonth} onDateChange={setCurrentMonth} />
            <AddTransactionDialog />
        </div>
      </div>
      <TransactionsTable transactions={filteredTransactions} />
    </div>
  );
}
