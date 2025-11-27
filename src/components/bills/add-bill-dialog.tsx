'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Bill } from '@/lib/types';
import { CurrencyInput } from '../ui/currency-input';

interface AddBillDialogProps {
  children: React.ReactNode;
  onBillAdded: (bill: Omit<Bill, 'id' | 'isPaid'>) => Promise<void>;
}

export function AddBillDialog({ children, onBillAdded }: AddBillDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('09:00');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!name || amount === undefined || !dueDate || !dueTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Semua kolom harus diisi.',
      });
      return;
    }
    
    await onBillAdded({ name, amount: Number(amount), dueDate, dueTime });

    toast({
      title: 'Sukses',
      description: 'Tagihan baru telah ditambahkan.',
    });
    setOpen(false);
    setName('');
    setAmount(undefined);
    setDueDate('');
    setDueTime('09:00');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Tagihan</DialogTitle>
          <DialogDescription>
            Buat pengingat baru untuk tagihan yang akan datang.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nama</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Cth: Tagihan Listrik"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="amount">Jumlah</Label>
            <CurrencyInput
              id="amount"
              value={amount}
              onValueChange={setAmount}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueDate">Tgl. Tempo</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dueTime">Jam Tempo</Label>
            <Input
              id="dueTime"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
