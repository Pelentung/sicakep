'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { BellRing } from 'lucide-react';
import { isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useData } from '@/context/data-context';
import { cn } from '@/lib/utils';

export function BillNotification() {
  const { bills } = useData();
  const [dueBillsCount, setDueBillsCount] = useState(0);

  useEffect(() => {
    const unpaidDueBills = bills.filter(
      (bill) => !bill.isPaid && isPast(parseISO(bill.dueDate))
    );
    setDueBillsCount(unpaidDueBills.length);
  }, [bills]);

  if (dueBillsCount === 0) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="destructive" size="icon" className="relative h-9 w-9 rounded-full">
            <Link href="/dashboard/bills">
              <BellRing className="h-5 w-5 animate-swing" />
              <span
                className={cn(
                  'absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-background text-xs font-bold text-destructive'
                )}
              >
                {dueBillsCount}
              </span>
              <span className="sr-only">Lihat tagihan jatuh tempo</span>
            </Link>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Anda memiliki {dueBillsCount} tagihan yang telah jatuh tempo!</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
