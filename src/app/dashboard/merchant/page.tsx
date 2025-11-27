'use client';

import { useState } from 'react';
import type { Merchant } from '@/lib/merchant-data';
import { merchants } from '@/lib/merchant-data';
import { MerchantCard } from '@/components/merchant/merchant-card';
import { MerchantTransactionDialog } from '@/components/merchant/merchant-transaction-dialog';
import { addTransaction, getTransactions } from '@/lib/data';
import type { Transaction } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function MerchantPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleMerchantClick = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMerchant(null);
  };

  const handleTransaction = (amount: number, customerId: string) => {
    if (!selectedMerchant) return;

    const transaction: Omit<Transaction, 'id' | 'userId'> = {
      type: 'expense',
      amount: amount,
      category: selectedMerchant.category,
      date: new Date().toISOString(),
      description: `${selectedMerchant.name} - No: ${customerId}`,
    };

    addTransaction(transaction);
    
    toast({
        title: 'Transaksi Berhasil',
        description: `Pembayaran ${selectedMerchant.name} sebesar ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)} telah berhasil.`,
    });

    handleDialogClose();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground md:text-3xl">
        Pembayaran & Pembelian
      </h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {merchants.map((merchant) => (
          <MerchantCard
            key={merchant.id}
            merchant={merchant}
            onClick={() => handleMerchantClick(merchant)}
          />
        ))}
      </div>

      {selectedMerchant && (
        <MerchantTransactionDialog
          isOpen={isDialogOpen}
          onClose={handleDialogClose}
          merchant={selectedMerchant}
          onConfirm={handleTransaction}
        />
      )}
    </div>
  );
}
