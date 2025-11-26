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
import { deleteBill, updateBill } from '@/lib/data';
import type { Bill } from '@/lib/types';
import { format, parseISO } from 'date-fns';

interface EditBillDialogProps {
  bill: Bill;
  onBillUpdated: () => void;
}

export function EditBillDialog({ bill, onBillUpdated }: EditBillDialogProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [name, setName] = useState(bill.name);
  const [amount, setAmount] = useState(bill.amount.toString());
  const [dueDate, setDueDate] = useState(format(parseISO(bill.dueDate), 'yyyy-MM-dd'));
  const [dueTime, setDueTime] = useState(bill.dueTime);
  const { toast } = useToast();

  const handleUpdate = () => {
    if (!name || !amount || !dueDate || !dueTime) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Semua kolom harus diisi.',
      });
      return;
    }

    updateBill(bill.id, { name, amount: Number(amount), dueDate, dueTime });
    toast({
      title: 'Sukses',
      description: 'Tagihan telah diperbarui.',
    });
    onBillUpdated();
    setOpen(false);
  };

  const handleDelete = () => {
    deleteBill(bill.id);
    toast({
      title: 'Sukses',
      description: 'Tagihan telah dihapus.',
    });
    onBillUpdated();
    setShowDeleteAlert(false);
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
          <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name-edit" className="text-right">
              Nama
            </Label>
            <Input
              id="name-edit"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount-edit" className="text-right">
              Jumlah
            </Label>
            <Input
              id="amount-edit"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueDate-edit" className="text-right">
              Tgl. Tempo
            </Label>
            <Input
              id="dueDate-edit"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dueTime-edit" className="text-right">
              Jam Tempo
            </Label>
            <Input
              id="dueTime-edit"
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="col-span-3"
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
