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
import { useState } from "react"
import { addBudget } from "@/lib/data"
import { useToast } from "@/hooks/use-toast"


const expenseCategories = ["Makanan", "Transportasi", "Sewa", "Hiburan", "Belanja", "Kesehatan", "Tagihan", "Lainnya"];

export function AddBudgetDialog({ children, onBudgetAdded }: { children: React.ReactNode, onBudgetAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState('');
  const [amount, setAmount] = useState('');
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!category || !amount) {
        toast({
            variant: "destructive",
            title: "Error",
            description: "Kategori dan Jumlah harus diisi.",
        });
        return;
    }
    
    addBudget({ category, amount: Number(amount) });
    toast({
        title: "Sukses",
        description: "Anggaran baru telah ditambahkan.",
    });
    onBudgetAdded();
    setOpen(false);
    setCategory('');
    setAmount('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Anggaran</DialogTitle>
          <DialogDescription>
            Buat anggaran baru untuk kategori pengeluaran.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                Kategori
                </Label>
                <Select onValueChange={setCategory} value={category}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                    {expenseCategories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                </SelectContent>
                </Select>
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
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
