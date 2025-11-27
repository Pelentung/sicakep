'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Merchant } from '@/lib/merchant-data';
import { useToast } from '@/hooks/use-toast';
import { LoaderCircle } from 'lucide-react';
import { CurrencyInput } from '../ui/currency-input';

interface MerchantTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant;
  onConfirm: (amount: number, customerId: string) => void;
  isPending: boolean;
}

export function MerchantTransactionDialog({
  isOpen,
  onClose,
  merchant,
  onConfirm,
  isPending,
}: MerchantTransactionDialogProps) {
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const { toast } = useToast();

  const handleConfirm = () => {
    if (!customerId || amount === undefined) {
      toast({
        variant: 'destructive',
        title: 'Input Tidak Lengkap',
        description: 'Harap isi semua kolom yang diperlukan.',
      });
      return;
    }
    onConfirm(Number(amount), customerId);
    // State tidak direset di sini agar dialog tidak "flash"
    // Reset terjadi setelah transaksi sukses di komponen parent
  };

  // Reset state saat dialog ditutup
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setCustomerId('');
      setAmount(undefined);
      onClose();
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {merchant.type === 'purchase' ? 'Beli' : 'Bayar'} {merchant.name}
          </DialogTitle>
          <DialogDescription>
            Masukkan detail untuk {merchant.description.toLowerCase()}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="customer-id">{merchant.label}</Label>
            <Input
              id="customer-id"
              placeholder={merchant.placeholder}
              value={customerId}
              onChange={(e) => setCustomerId(e.target.value)}
              disabled={isPending}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onValueChange={setAmount}
              disabled={isPending}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPending}>
            Batal
          </Button>
          <Button onClick={handleConfirm} disabled={isPending}>
            {isPending ? <LoaderCircle className="animate-spin" /> : 'Lanjutkan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
