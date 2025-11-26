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


const incomeCategories = ["Gaji", "Freelance", "Investasi", "Lainnya"];
const expenseCategories = ["Makanan", "Transportasi", "Sewa", "Hiburan", "Belanja", "Kesehatan", "Tagihan", "Lainnya"];

export function AddTransactionDialog() {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<'income' | 'expense'>('expense');

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
              defaultValue="expense" 
              className="col-span-3 flex gap-4"
              onValueChange={(value) => setType(value as 'income' | 'expense')}
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
            <Input id="amount" type="number" placeholder="Rp 0" className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Kategori
            </Label>
            <Select>
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
            <Input id="date" type="date" defaultValue={new Date().toISOString().substring(0, 10)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Deskripsi
            </Label>
            <Textarea id="description" placeholder="Deskripsi singkat (opsional)" className="col-span-3" />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit" onClick={() => setOpen(false)}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
