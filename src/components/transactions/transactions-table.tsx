'use client';

import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { ArrowDownCircle, ArrowUpCircle } from 'lucide-react';
import type { Transaction } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent } from '../ui/card';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

const categories = ["Semua", "Gaji", "Freelance", "Investasi", "Makanan", "Transportasi", "Sewa", "Hiburan", "Belanja", "Kesehatan", "Tagihan", "Lainnya"];
const types = ["Semua", "Pemasukan", "Pengeluaran"];

export function TransactionsTable({ transactions }: { transactions: Transaction[] }) {
    const [typeFilter, setTypeFilter] = useState('Semua');
    const [categoryFilter, setCategoryFilter] = useState('Semua');

    const filteredTransactions = transactions.filter(t => {
        const typeMatch = typeFilter === 'Semua' || (typeFilter === 'Pemasukan' && t.type === 'income') || (typeFilter === 'Pengeluaran' && t.type === 'expense');
        const categoryMatch = categoryFilter === 'Semua' || t.category === categoryFilter;
        return typeMatch && categoryMatch;
    }).sort((a, b) => parseISO(b.date).getTime() - parseISO(a.date).getTime());

  return (
    <Card>
        <CardContent className="p-0">
            <div className="flex items-center gap-4 p-4 border-b">
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter Tipe" />
                    </SelectTrigger>
                    <SelectContent>
                        {types.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}
                    </SelectContent>
                </Select>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-[180px]">
                        <SelectValue placeholder="Filter Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead className="w-[100px] hidden md:table-cell">Tipe</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="hidden md:table-cell">Kategori</TableHead>
                <TableHead className="hidden md:table-cell">Tanggal</TableHead>
                <TableHead className="text-right">Jumlah</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.id}>
                    <TableCell className="hidden md:table-cell">
                    {transaction.type === 'income' ? (
                        <ArrowUpCircle className="h-5 w-5 text-green-500" />
                    ) : (
                        <ArrowDownCircle className="h-5 w-5 text-red-500" />
                    )}
                    </TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                         {transaction.type === 'income' ? (
                            <ArrowUpCircle className="h-5 w-5 text-green-500 md:hidden" />
                        ) : (
                            <ArrowDownCircle className="h-5 w-5 text-red-500 md:hidden" />
                        )}
                        <div>
                          {transaction.description}
                          <div className="text-sm text-muted-foreground md:hidden">
                            {format(parseISO(transaction.date), 'd MMM yyyy', { locale: id })} - {transaction.category}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                    <Badge variant="outline">{transaction.category}</Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{format(parseISO(transaction.date), 'd MMMM yyyy', { locale: id })}</TableCell>
                    <TableCell className="text-right">{formatCurrency(transaction.amount)}</TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
            {filteredTransactions.length === 0 && (
                <div className="text-center p-8 text-muted-foreground">Tidak ada transaksi yang cocok.</div>
            )}
        </CardContent>
    </Card>
  );
}
