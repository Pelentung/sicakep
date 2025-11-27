'use client';

import { useState, useEffect } from 'react';
import { getFinancialSummary, getTransactions } from '@/lib/data';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { UpcomingBills } from '@/components/dashboard/upcoming-bills';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { MonthPicker } from '@/components/month-picker';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';
import type { Transaction } from '@/lib/types';
import { LoaderCircle } from 'lucide-react';

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const { user: authUser } = useUser();
  const db = useFirestore();

  const transactionsQuery = useMemoFirebase(() => {
    if (!authUser) return null;
    return collection(db, 'users', authUser.uid, 'transactions');
  }, [db, authUser]);

  const { data: allTransactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

  const filteredTransactions = (allTransactions || []).filter((t) => {
    const transactionDate = parseISO(t.date);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return transactionDate >= start && transactionDate <= end;
  });

  const summary = getFinancialSummary(filteredTransactions);
  
  if (transactionsLoading) {
     return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Dashboard
        </h1>
        <MonthPicker date={currentMonth} onDateChange={setCurrentMonth} />
      </div>
      <SummaryCards summary={summary} />
      <div className="grid gap-6 lg:grid-cols-2">
        <OverviewChart transactions={allTransactions || []} selectedMonth={currentMonth} />
        <div className="space-y-6">
          <UpcomingBills />
          <AiInsights selectedMonth={currentMonth} />
        </div>
      </div>
    </div>
  );
}
