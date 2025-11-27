'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { Bill } from '@/lib/types';
import { useData } from '@/context/data-context';


export function BillNotification() {
  const { bills } = useData();
  const [hasDueBills, setHasDueBills] = useState(false);

  useEffect(() => {
    const unpaid = bills.filter(bill => !bill.isPaid);
    if (unpaid) {
      const due = unpaid.some(bill => isPast(parseISO(bill.dueDate)));
      setHasDueBills(due);
    }
  }, [bills]);


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
