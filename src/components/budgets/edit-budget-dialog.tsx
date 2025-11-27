'use client'

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { MoreHorizontal, Trash2 } from "lucide-react"
import type { Budget } from "@/lib/types"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useData } from "@/context/data-context"
import { CurrencyInput } from "../ui/currency-input"

interface EditBudgetDialogProps {
    budget: Budget;
    onUpdate: () => void;
}

export function EditBudgetDialog({ budget, onUpdate }: EditBudgetDialogProps) {
    const { updateBudget, deleteBudget } = useData();
    const [open, setOpen] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [amount, setAmount] = useState<number | undefined>(budget.amount);
    const { toast } = useToast();

    const handleUpdate = () => {
        if (amount === undefined) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Jumlah tidak boleh kosong.",
            });
            return;
        }

        updateBudget(budget.id, Number(amount));
        toast({
            title: "Sukses",
            description: `Anggaran untuk ${budget.category} telah diperbarui.`,
        });
        setOpen(false);
    };
    
    const handleDelete = () => {
        deleteBudget(budget.id);
        toast({
            title: "Sukses",
            description: `Anggaran untuk ${budget.category} telah dihapus.`,
        });
        setShowDeleteAlert(false);
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setOpen(true)}>
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setShowDeleteAlert(true)} className="text-red-600">
                        Hapus
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Anggaran: {budget.category}</DialogTitle>
                        <DialogDescription>
                            Perbarui jumlah anggaran untuk kategori ini.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="amount" className="text-right">
                                Jumlah
                            </Label>
                            <CurrencyInput
                                id="amount"
                                value={amount}
                                onValueChange={setAmount}
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
                            Tindakan ini tidak dapat dibatalkan. Ini akan menghapus anggaran untuk kategori <span className="font-bold">{budget.category}</span> secara permanen.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Batal</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Hapus
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
