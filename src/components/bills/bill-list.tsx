'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';
import type { Bill } from '@/lib/types';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';
import { EditBillDialog } from './edit-bill-dialog';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

interface BillListProps {
  bills: Bill[];
  onTogglePaid: (id: string, currentStatus: boolean) => void;
}

export function BillList({
  bills,
  onTogglePaid,
}: BillListProps) {
  const upcomingBills = bills.filter((b) => !b.isPaid);
  const paidBills = bills.filter((b) => b.isPaid);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <BillSection
        title="Belum Dibayar"
        bills={upcomingBills}
        onTogglePaid={onTogglePaid}
        emptyMessage="Tidak ada tagihan yang belum dibayar."
      />
      <BillSection
        title="Sudah Dibayar"
        bills={paidBills}
        onTogglePaid={onTogglePaid}
        emptyMessage="Tidak ada tagihan yang sudah dibayar."
      />
    </div>
  );
}

interface BillSectionProps {
  title: string;
  bills: Bill[];
  onTogglePaid: (id: string, currentStatus: boolean) => void;
  emptyMessage: string;
}

function BillSection({
  title,
  bills,
  onTogglePaid,
  emptyMessage,
}: BillSectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {bills.length > 0 ? (
          <div className="space-y-4">
            {bills.map((bill) => (
              <div
                key={bill.id}
                className={cn(
                  'flex items-center gap-4 rounded-lg border p-3',
                  bill.isPaid ? 'bg-muted/50' : ''
                )}
              >
                <Checkbox
                  id={`bill-${bill.id}`}
                  checked={bill.isPaid}
                  onCheckedChange={() => onTogglePaid(bill.id, bill.isPaid)}
                  aria-label="Tandai sebagai lunas"
                />
                <div className="flex-1">
                  <p
                    className={cn(
                      'font-medium',
                      bill.isPaid && 'text-muted-foreground line-through'
                    )}
                  >
                    {bill.name}
                  </p>
                  <p
                    className={cn(
                      'text-sm',
                      getDueDateColor(bill.dueDate, bill.isPaid)
                    )}
                  >
                    Jatuh tempo:{' '}
                    {format(parseISO(bill.dueDate), 'd MMMM yyyy, HH:mm', {
                      locale: id,
                    })}
                  </p>
                </div>
                <div
                  className={cn(
                    'font-semibold',
                    bill.isPaid && 'text-muted-foreground line-through'
                  )}
                >
                  {formatCurrency(bill.amount)}
                </div>
                <EditBillDialog bill={bill} />
              </div>
            ))}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

function getDueDateColor(dueDateStr: string, isPaid: boolean) {
  if (isPaid) return 'text-muted-foreground';
  const dueDate = parseISO(dueDateStr);
  if (isPast(dueDate) && !isToday(dueDate)) return 'text-red-500 font-medium';
  if (isToday(dueDate)) return 'text-orange-500 font-medium';
  return 'text-muted-foreground';
}
