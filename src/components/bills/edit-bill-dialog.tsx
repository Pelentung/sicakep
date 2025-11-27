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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Bill } from '@/lib/types';
import { format, parseISO } from 'date-fns';
import { useData } from '@/context/data-context';
import { CurrencyInput } from '../ui/currency-input';

interface EditBillDialogProps {
  bill: Bill;
  onUpdate: () => void; // onUpdate is now just for refreshing the list display if needed after an action
}

export function EditBillDialog({ bill, onUpdate }: EditBillDialogProps) {
  const { updateBill, deleteBill } = useData();
  const [open, setOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [name, setName] = useState(bill.name);
  const [amount, setAmount] = useState<number | undefined>(bill.amount);
  const [dueDate, setDueDate] = useState(format(parseISO(bill.dueDate), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState(bill.dueTime);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!name || amount === undefined || !dueDate || !dueTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Semua kolom harus diisi.',
      });
      return;
    }

    await updateBill(bill.id, { name, amount: Number(amount), dueDate, dueTime });
    toast({
      title: 'Sukses',
      description: 'Tagihan telah diperbarui.',
    });
    setOpen(false);
    // No need to call onUpdate, context handles state
  };

  const handleDelete = async () => {
    await deleteBill(bill.id);
    toast({
      title: 'Sukses',
      description: 'Tagihan telah dihapus.',
    });
    setShowDeleteAlert(false);
    // No need to call onUpdate, context handles state
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>Edit</DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-600"
          >
            Hapus
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Tagihan: {bill.name}</DialogTitle>
            <DialogDescription>
              Perbarui detail tagihan Anda di sini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name-edit">Nama</Label>
              <Input
                id="name-edit"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount-edit">Jumlah</Label>
              <CurrencyInput
                id="amount-edit"
                value={amount}
                onValueChange={setAmount}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate-edit">Tgl. Tempo</Label>
              <Input
                id="dueDate-edit"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime-edit">Jam Tempo</Label>
              <Input
                id="dueTime-edit"
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus tagihan{' '}
              <span className="font-bold">{bill.name}</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
