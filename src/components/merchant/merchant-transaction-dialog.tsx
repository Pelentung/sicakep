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

interface MerchantTransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  merchant: Merchant;
  onConfirm: (amount: number, customerId: string) => void;
}

export function MerchantTransactionDialog({
  isOpen,
  onClose,
  merchant,
  onConfirm,
}: MerchantTransactionDialogProps) {
  const [customerId, setCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const handleConfirm = () => {
    if (!customerId || !amount) {
      toast({
        variant: 'destructive',
        title: 'Input Tidak Lengkap',
        description: 'Harap isi semua kolom yang diperlukan.',
      });
      return;
    }
    onConfirm(Number(amount), customerId);
    // Reset state after confirm
    setCustomerId('');
    setAmount('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Rp 0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleConfirm}>Lanjutkan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
