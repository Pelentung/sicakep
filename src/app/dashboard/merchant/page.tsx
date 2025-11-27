'use client';

import { useState, useTransition } from 'react';
import type { Merchant } from '@/lib/merchant-data';
import { merchants } from '@/lib/merchant-data';
import { MerchantCard } from '@/components/merchant/merchant-card';
import { MerchantTransactionDialog } from '@/components/merchant/merchant-transaction-dialog';
import { useToast } from '@/hooks/use-toast';
import { handleMerchantTransactionAction } from '@/app/actions';
import { useData } from '@/context/data-context';
import type { Bill } from '@/lib/types';
import { useAuth } from '@/context/auth-context';

export default function MerchantPage() {
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();
  const { user } = useAuth();
  const { addTransaction, bills, toggleBillPaidStatus } = useData();

  const handleMerchantClick = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedMerchant(null);
  };
  
  const findAndPayBill = (merchantName: string) => {
    // Logic to find a matching unpaid bill
    const billKeywords: { [key: string]: string[] } = {
        'PLN': ['listrik'],
        'PDAM': ['air', 'pdam'],
        'Internet & TV': ['internet', 'tv'],
        'Cicilan Kredit': ['cicilan', 'kredit'],
        'BPJS': ['bpjs'],
    };

    const keywords = billKeywords[merchantName];
    if (!keywords) return;

    const unpaidBill = bills.find(bill => 
        !bill.isPaid && keywords.some(keyword => bill.name.toLowerCase().includes(keyword))
    );

    if (unpaidBill) {
        toggleBillPaidStatus(unpaidBill.id, false); // Mark as paid
        toast({
            title: 'Tagihan Diperbarui',
            description: `Tagihan "${unpaidBill.name}" telah ditandai lunas.`,
        });
    }
  };

  const handleTransaction = (amount: number, customerId: string) => {
    if (!selectedMerchant || !user) return;

    startTransition(async () => {
      const result = await handleMerchantTransactionAction(
        user.uid,
        selectedMerchant,
        amount,
        customerId
      );

      if (result.success) {
        // Add transaction to global state via context
        addTransaction({
          type: 'expense',
          amount: amount,
          category: selectedMerchant.category,
          date: new Date().toISOString(),
          description: `${selectedMerchant.name} - No: ${customerId}`,
        });

        // If it's a bill payment, find and update the bill status
        if (selectedMerchant.type === 'payment') {
            findAndPayBill(selectedMerchant.name);
        }
        
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
