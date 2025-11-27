'use client';

import { useState, useEffect } from 'react';
import { getBills, addBill, toggleBillPaidStatus } from '@/lib/data';
import type { Bill } from '@/lib/types';
import { AddBillDialog } from '@/components/bills/add-bill-dialog';
import { BillList } from '@/components/bills/bill-list';
import { Button } from '@/components/ui/button';
import { PlusCircle, LoaderCircle } from 'lucide-react';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBills(getBills());
    setLoading(false);
  }, []);

  const refreshBills = () => {
    setBills(getBills());
  };

  const handleBillAdded = (bill: Omit<Bill, 'id' | 'isPaid' | 'userId'>) => {
    addBill(bill);
    refreshBills();
  };

  const handleTogglePaid = (id: string, currentStatus: boolean) => {
    toggleBillPaidStatus(id, currentStatus);
    refreshBills();
  };

  if (loading) {
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
