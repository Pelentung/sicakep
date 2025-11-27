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
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import type { Bill } from '@/lib/types';


export function BillNotification() {
  const { user: authUser } = useUser();
  const db = useFirestore();

  const billsQuery = useMemoFirebase(() => {
    if (!authUser) return null;
    const q = query(
      collection(db, 'users', authUser.uid, 'bills'),
      where('isPaid', '==', false)
    );
    return q;
  }, [db, authUser]);

  const { data: unpaidBills } = useCollection<Bill>(billsQuery);
  const [hasDueBills, setHasDueBills] = useState(false);

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
