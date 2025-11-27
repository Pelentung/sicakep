'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"
import { useState } from "react"
import { RadioGroup, RadioGroupItem } from "../ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import type { Transaction } from "@/lib/types"
import { CurrencyInput } from "../ui/currency-input"


const incomeCategories = ["Gaji", "Freelance", "Investasi", "Lainnya"];
const expenseCategories = ["Makanan", "Transportasi", "Sewa", "Hiburan", "Belanja", "Kesehatan", "Tagihan", "Lainnya"];

interface AddTransactionDialogProps {
    onTransactionAdded: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
}

export function AddTransactionDialog({ onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (amount === undefined || !category || !date) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Jumlah, Kategori, dan Tanggal harus diisi.",
        });
        return;
    }
    
    onTransactionAdded({
        type,
        amount: Number(amount),
        category,
        date,
        description,
    });

    toast({
        title: "Sukses",
        description: "Transaksi baru telah ditambahkan.",
    });

    // Reset form
    setOpen(false);
    setAmount(undefined);
    setCategory('');
    setDate(new Date().toISOString().substring(0, 10));
    setDescription('');
    setType('expense');
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Tambah Transaksi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Transaksi</DialogTitle>
          <DialogDescription>
            Catat pemasukan atau pengeluaran baru Anda.
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
                <RadioGroupItem value="income" id="r1" />
                <Label htmlFor="r1" className="font-normal">Pemasukan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="r2" />
                <Label htmlFor="r2" className="font-normal">Pengeluaran</Label>
              </div>
            </RadioGroup>
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
            <Label htmlFor="category">Kategori</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="category">
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
            <Label htmlFor="date">Tanggal</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi</Label>
            <Textarea id="description" placeholder="Deskripsi singkat (opsional)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
