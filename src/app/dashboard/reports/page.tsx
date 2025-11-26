'use client';

import { useState } from 'react';
import { getFinancialSummary, getSpendingByCategory, getTransactions } from '@/lib/data';
import { IncomeExpenseChart } from '@/components/reports/income-expense-chart';
import { CategorySpendingChart } from '@/components/reports/category-spending-chart';
import { MonthPicker } from '@/components/month-picker';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';

export default function ReportsPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const allTransactions = getTransactions();

  const filteredTransactions = allTransactions.filter((t) => {
    const transactionDate = parseISO(t.date);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return transactionDate >= start && transactionDate <= end;
  });

  const summary = getFinancialSummary(filteredTransactions);
  const spendingByCategory = getSpendingByCategory(filteredTransactions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Laporan Keuangan
        </h1>
        <MonthPicker date={currentMonth} onDateChange={setCurrentMonth} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <IncomeExpenseChart data={summary} />
        <CategorySpendingChart data={spendingByCategory} />
      </div>
    </div>
  );
}
