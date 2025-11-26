'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';
import { getBills } from '@/lib/data';
import { isPast, parseISO } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function BillNotification() {
  const [hasDueBills, setHasDueBills] = useState(false);

  useEffect(() => {
    const checkBills = () => {
      const unpaidDueBills = getBills().some(
        (bill) => !bill.isPaid && isPast(parseISO(bill.dueDate))
      );
      setHasDueBills(unpaidDueBills);
    };

    checkBills();
    // Check every 10 seconds to see if bills have been paid
    const interval = setInterval(checkBills, 10000);

    return () => clearInterval(interval);
  }, []);

  if (!hasDueBills) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button asChild variant="ghost" size="icon">
            <Link href="/dashboard/bills">
              <Bell className="h-5 w-5 text-red-500 animate-pulse" />
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
