'use client';

import { useState, useEffect } from 'react';
import { getFinancialSummary, getTransactions } from '@/lib/data';
import { SummaryCards } from '@/components/dashboard/summary-cards';
import { OverviewChart } from '@/components/dashboard/overview-chart';
import { UpcomingBills } from '@/components/dashboard/upcoming-bills';
import { AiInsights } from '@/components/dashboard/ai-insights';
import { MonthPicker } from '@/components/month-picker';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { getUser, type UserProfile } from '@/lib/user-data';

export default function DashboardPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const allTransactions = getTransactions();

  const filteredTransactions = allTransactions.filter((t) => {
    const transactionDate = parseISO(t.date);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return transactionDate >= start && transactionDate <= end;
  });

  const summary = getFinancialSummary(filteredTransactions);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="relative flex overflow-x-hidden">
          <div className="animate-marquee whitespace-nowrap">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Selamat Datang, <span className="uppercase">{user?.name || 'Pengguna'}</span>!
            </h1>
          </div>
           <div className="absolute top-0 animate-marquee2 whitespace-nowrap">
             <h1 className="text-2xl md:text-3xl font-bold text-foreground">
              Selamat Datang, <span className="uppercase">{user?.name || 'Pengguna'}</span>!
            </h1>
          </div>
        </div>
        <MonthPicker date={currentMonth} onDateChange={setCurrentMonth} />
      </div>
      <SummaryCards summary={summary} />
      <div className="grid gap-6 lg:grid-cols-2">
        <OverviewChart transactions={allTransactions} selectedMonth={currentMonth} />
        <div className="space-y-6">
          <UpcomingBills />
          <AiInsights selectedMonth={currentMonth} />
        </div>
      </div>
    </div>
  );
}
