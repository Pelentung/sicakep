'use client';

import { useState, useTransition } from 'react';
import { Lightbulb, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useData } from '@/context/data-context';
import type { Transaction } from '@/lib/types';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';


// Placeholder function to simulate the old action.ts behavior locally
async function getAIInsightsAction(transactions: Transaction[], selectedMonth: Date): Promise<{ success: boolean; insights?: string[]; error?: string; }> {
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  const start = startOfMonth(selectedMonth);
  const end = endOfMonth(selectedMonth);

  const filteredTransactions = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= start && transactionDate <= end;
  });

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (totalExpenses === 0) {
    return { success: true, insights: ["Tidak ada data pengeluaran untuk dianalisis di bulan ini. Mulai lacak pengeluaran Anda untuk mendapatkan wawasan!"] };
  }
  
  const insights = [
      `Anda menghabiskan total ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalExpenses)} bulan ini.`,
      "Analisis terperinci tidak tersedia dalam mode demo. Fitur AI memerlukan backend yang aktif.",
      "Coba periksa kategori pengeluaran terbesar Anda di halaman laporan."
  ];

  return { success: true, insights: insights };
}


export function AiInsights({ selectedMonth }: { selectedMonth: Date }) {
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { transactions } = useData();

  const handleGetInsights = () => {
    startTransition(async () => {
      setError(null);
      setInsights(null);
      const result = await getAIInsightsAction(transactions, selectedMonth);
      if (result.success && result.insights) {
        setInsights(result.insights);
      } else if(result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          Wawasan Belanja AI
        </CardTitle>
        <Button onClick={handleGetInsights} disabled={isPending} size="sm">
          {isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            'Dapatkan Wawasan'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isPending && (
          <div className="flex items-center justify-center py-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Menganalisis data Anda...</p>
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {insights && (
            <div className="space-y-2 text-sm text-foreground">
                {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">◆</span>
                        <p>{insight}</p>
                    </div>
                ))}
            </div>
        )}
        {!isPending && !insights && !error && (
            <p className="py-4 text-center text-sm text-muted-foreground">
                Klik tombol untuk mendapatkan analisis AI tentang kebiasaan belanja Anda.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
