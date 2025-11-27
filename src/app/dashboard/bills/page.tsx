'use client';

import { useState } from 'react';
import { addBill, toggleBillPaidStatus } from '@/lib/data';
import type { Bill } from '@/lib/types';
import { AddBillDialog } from '@/components/bills/add-bill-dialog';
import { BillList } from '@/components/bills/bill-list';
import { Button } from '@/components/ui/button';
import { PlusCircle, LoaderCircle } from 'lucide-react';
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from 'firebase/firestore';

export default function BillsPage() {
  const { user: authUser } = useUser();
  const db = useFirestore();

  const billsQuery = useMemoFirebase(() => {
    if (!authUser) return null;
    return collection(db, 'users', authUser.uid, 'bills');
  }, [db, authUser]);

  const { data: bills, isLoading: billsLoading } = useCollection<Bill>(billsQuery);

  const handleBillAdded = (bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => {
    if (!authUser) return;
    addBill(db, authUser.uid, bill);
  };

  const handleTogglePaid = (id: string, currentStatus: boolean) => {
    if (!authUser) return;
    toggleBillPaidStatus(db, authUser.uid, id, currentStatus);
  };

  if (billsLoading) {
    return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Pengingat Tagihan
        </h1>
        <AddBillDialog onBillAdded={handleBillAdded}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Tagihan
          </Button>
        </AddBillDialog>
      </div>

      <BillList
        bills={bills || []}
        onTogglePaid={handleTogglePaid}
      />
    </div>
  );
}
