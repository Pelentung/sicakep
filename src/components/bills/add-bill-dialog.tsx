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
import { addBill } from '@/lib/data';
import type { Bill } from '@/lib/types';

interface AddBillDialogProps {
  children: React.ReactNode;
  onBillAdded: () => void;
}

export function AddBillDialog({ children, onBillAdded }: AddBillDialogProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!name || !amount || !dueDate) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Semua kolom harus diisi.',
      });
      return;
    }
    
    addBill({ name, amount: Number(amount), dueDate });

    toast({
      title: 'Sukses',
      description: 'Tagihan baru telah ditambahkan.',
    });
    onBillAdded();
    setOpen(false);
    setName('');
    setAmount('');
    setDueDate('');
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Nama
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
              placeholder="Cth: Tagihan Listrik"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Jumlah
            </Label>
            <Input
              id="amount"
              type="number"
              placeholder="Rp 0"
              className="col-span-3"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate" className="text-right">
              Tgl. Jatuh Tempo
            </Label>
            <Input
              id="dueDate"
              type="date"
              className="col-span-3"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
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
