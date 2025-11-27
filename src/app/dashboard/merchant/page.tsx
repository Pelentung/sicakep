'use client';

import { useState, useTransition } from 'react';
import type { Merchant } from '@/lib/merchant-data';
import { merchants } from '@/lib/merchant-data';
import { MerchantCard } from '@/components/merchant/merchant-card';
import { MerchantTransactionDialog } from '@/components/merchant/merchant-transaction-dialog';
import { useToast } from '@/hooks/use-toast';
import { handleMerchantTransactionAction } from '@/app/actions';
import { useData } from '@/context/data-context';

export default function MerchantPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { addTransaction } = useData();

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

    startTransition(async () => {
      // Di dunia nyata, userId akan didapat dari sesi otentikasi
      const result = await handleMerchantTransactionAction(
        '1',
        selectedMerchant,
        amount,
        customerId
      );

      if (result.success) {
        // Tambahkan transaksi ke state global via context
        addTransaction({
          type: 'expense',
          amount: amount,
          category: selectedMerchant.category,
          date: new Date().toISOString(),
          description: `${selectedMerchant.name} - No: ${customerId}`,
        });
        
        toast({
          title: 'Transaksi Berhasil',
          description: result.message,
        });
        handleDialogClose();
      } else {
        toast({
          variant: 'destructive',
          title: 'Transaksi Gagal',
          description: result.error,
        });
      }
    });
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
          isPending={isPending}
        />
      )}
    </div>
  );
}
