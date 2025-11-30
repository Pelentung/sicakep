'use client';

import { useState } from 'react';
import { getFinancialSummary, getSpendingByCategory } from '@/lib/data';
import { MonthPicker } from '@/components/month-picker';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { LoaderCircle } from 'lucide-react';
import { useData } from '@/context/data-context';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}


export default function ReportsPage() {
  const { transactions, loading } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());


  const filteredTransactions = transactions.filter((t) => {
    const transactionDate = parseISO(t.date);
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    return transactionDate >= start && transactionDate <= end;
  });

  const summary = getFinancialSummary(filteredTransactions);
  const spendingByCategory = getSpendingByCategory(filteredTransactions);

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Laporan Keuangan
        </h1>
        <MonthPicker date={currentMonth} onDateChange={setCurrentMonth} />
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
            <CardHeader>
                <CardTitle>Ringkasan Bulanan</CardTitle>
                <CardDescription>Total pemasukan, pengeluaran, dan saldo untuk bulan yang dipilih.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableBody>
                        <TableRow>
                            <TableCell className="font-medium">Total Pemasukan</TableCell>
                            <TableCell className="text-right text-green-600">{formatCurrency(summary.totalIncome)}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell className="font-medium">Total Pengeluaran</TableCell>
                            <TableCell className="text-right text-red-600">{formatCurrency(summary.totalExpenses)}</TableCell>
                        </TableRow>
                        <TableRow className="bg-muted/50 font-bold">
                            <TableCell>Saldo Akhir</TableCell>
                            <TableCell className="text-right">{formatCurrency(summary.balance)}</TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle>Pengeluaran per Kategori</CardTitle>
                <CardDescription>Rincian pengeluaran Anda berdasarkan kategori.</CardDescription>
            </CardHeader>
            <CardContent>
                 <Table>
                    <TableHeader>
                        <TableRow>
                        <TableHead>Kategori</TableHead>
                        <TableHead className="text-right">Jumlah</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {Object.entries(spendingByCategory).length > 0 ? (
                            Object.entries(spendingByCategory)
                                .sort(([, a], [, b]) => b - a)
                                .map(([category, amount]) => (
                                <TableRow key={category}>
                                    <TableCell className="font-medium">{category}</TableCell>
                                    <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={2} className="text-center text-muted-foreground">Tidak ada data pengeluaran.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
