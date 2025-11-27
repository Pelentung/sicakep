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


const incomeCategories = ["Gaji", "Freelance", "Investasi", "Lainnya"];
const expenseCategories = ["Makanan", "Transportasi", "Sewa", "Hiburan", "Belanja", "Kesehatan", "Tagihan", "Lainnya"];

interface AddTransactionDialogProps {
    onTransactionAdded: (transaction: Omit<Transaction, 'id' | 'userId'>) => void;
}

export function AddTransactionDialog({ onTransactionAdded }: AddTransactionDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [description, setDescription] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!amount || !category || !date) {
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
    setAmount('');
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
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tipe</Label>
            <RadioGroup 
              value={type} 
              className="col-span-3 flex gap-4"
              onValueChange={(value) => {
                setType(value as 'income' | 'expense');
                setCategory(''); // Reset category on type change
              }}
              >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="income" id="r1" />
                <Label htmlFor="r1">Pemasukan</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="expense" id="r2" />
                <Label htmlFor="r2">Pengeluaran</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Jumlah
            </Label>
            <Input id="amount" type="number" placeholder="Rp 0" className="col-span-3" value={amount} onChange={e => setAmount(e.target.value)} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Kategori
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {(type === 'income' ? incomeCategories : expenseCategories).map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Tanggal
            </Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Textarea id="description" placeholder="Deskripsi singkat (opsional)" className="col-span-3" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
