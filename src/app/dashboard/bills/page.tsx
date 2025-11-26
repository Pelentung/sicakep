'use client';

import { useState } from 'react';
import { getBills, toggleBillPaidStatus } from '@/lib/data';
import type { Bill } from '@/lib/types';
import { AddBillDialog } from '@/components/bills/add-bill-dialog';
import { BillList } from '@/components/bills/bill-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

export default function BillsPage() {
  const [bills, setBills] = useState<Bill[]>(getBills());

  const refreshBills = () => {
    setBills([...getBills()]);
  };

  const handleTogglePaid = (id: string) => {
    toggleBillPaidStatus(id);
    refreshBills();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Pengingat Tagihan
        </h1>
        <AddBillDialog onBillAdded={refreshBills}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Tagihan
          </Button>
        </AddBillDialog>
      </div>

      <BillList
        bills={bills}
        onBillUpdated={refreshBills}
        onTogglePaid={handleTogglePaid}
      />
    </div>
  );
}
