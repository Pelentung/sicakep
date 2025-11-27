'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { getBills } from '@/lib/data';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Bill } from '@/lib/types';


export function BillNotification() {
  const [unpaidBills, setUnpaidBills] = useState<Bill[]>([]);
  const [hasDueBills, setHasDueBills] = useState(false);

  useEffect(() => {
    const bills = getBills();
    const unpaid = bills.filter(bill => !bill.isPaid);
    setUnpaidBills(unpaid);
  }, []);

  useEffect(() => {
    if (unpaidBills) {
      const due = unpaidBills.some(bill => isPast(parseISO(bill.dueDate)));
      setHasDueBills(due);
    }
  }, [unpaidBills]);


  if (!hasDueBills) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/bills">
              <Bell className="h-5 w-5 animate-pulse text-red-500" />
              <span className="sr-only">Lihat tagihan jatuh tempo</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Anda memiliki tagihan yang telah jatuh tempo!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
