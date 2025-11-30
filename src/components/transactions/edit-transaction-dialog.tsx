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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
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
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import type { Transaction } from '@/lib/types';
import { useData } from '@/context/data-context';
import { CurrencyInput } from '../ui/currency-input';

const incomeCategories = ["Gaji", "Freelance", "Investasi", "Lainnya"];
const expenseCategories = ["Makanan", "Transportasi", "Sewa", "Hiburan", "Belanja", "Kesehatan", "Tagihan", "Lainnya"];

interface EditTransactionDialogProps {
  transaction: Transaction;
}

export function EditTransactionDialog({ transaction }: EditTransactionDialogProps) {
  const { updateTransaction, deleteTransaction } = useData();
  const [open, setOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  
  const [type, setType] = useState<'income' | 'expense'>(transaction.type);
  const [amount, setAmount] = useState<number | undefined>(transaction.amount);
  const [category, setCategory] = useState(transaction.category);
  const [date, setDate] = useState(transaction.date.substring(0, 10));
  const [description, setDescription] = useState(transaction.description);
  
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (amount === undefined || !category || !date) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Jumlah, Kategori, dan Tanggal harus diisi.",
        });
        return;
    }
    
    await updateTransaction(transaction.id, {
        type,
        amount: Number(amount),
        category,
        date,
        description,
    });

    toast({
        title: "Sukses",
        description: "Transaksi telah diperbarui.",
    });

    setOpen(false);
  };

  const handleDelete = async () => {
    await deleteTransaction(transaction.id);
    toast({
      title: 'Sukses',
      description: 'Transaksi telah dihapus.',
    });
    setShowDeleteAlert(false);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Edit className="mr-2 h-4 w-4"/>
            <span>Edit</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setShowDeleteAlert(true)}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4"/>
            <span>Hapus</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Transaksi</DialogTitle>
            <DialogDescription>
              Perbarui detail transaksi Anda di sini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
             <div className="space-y-2">
                <Label>Tipe</Label>
                <RadioGroup 
                value={type} 
                className="flex gap-4"
                onValueChange={(value) => {
                    setType(value as 'income' | 'expense');
                    setCategory(''); // Reset category on type change
                }}
                >
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="income" id="r1-edit" />
                    <Label htmlFor="r1-edit" className="font-normal">Pemasukan</Label>
                </div>
                <div className="flex items-center space-x-2">
                    <RadioGroupItem value="expense" id="r2-edit" />
                    <Label htmlFor="r2-edit" className="font-normal">Pengeluaran</Label>
                </div>
                </RadioGroup>
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
                <Label htmlFor="category-edit">Kategori</Label>
                <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category-edit">
                    <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                    {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="date-edit">Tanggal</Label>
                <Input id="date-edit" type="date" value={date} onChange={e => setDate(e.target.value)} />
            </div>
            <div className="space-y-2">
                <Label htmlFor="description-edit">Deskripsi</Label>
                <Textarea id="description-edit" placeholder="Deskripsi singkat (opsional)" value={description} onChange={e => setDescription(e.target.value)} />
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
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus transaksi ini secara permanen.
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
