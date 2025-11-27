'use client'

import { useState } from "react";
import { BudgetCard } from "@/components/budgets/budget-card";
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoaderCircle } from "lucide-react";
import { useData } from "@/context/data-context";

export default function BudgetsPage() {
    const { budgets, transactions, loading, addBudget, refreshBudgets } = useData();
    
    const spendingByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = 0;
            }
            acc[t.category] += t.amount;
            return acc;
        }, {} as Record<string, number>);

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Anggaran Bulanan</h1>
                <AddBudgetDialog onBudgetAdded={addBudget}>
                    <Button>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Tambah Anggaran
                    </Button>
                </AddBudgetDialog>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgets.map(budget => (
                    <BudgetCard 
                        key={budget.id}
                        budget={budget}
                        spent={spendingByCategory[budget.category] || 0}
                        onUpdate={refreshBudgets}
                    />
                ))}
            </div>
            {budgets.length === 0 && (
                <div className="col-span-full p-8 text-center text-muted-foreground">
                    Belum ada anggaran yang dibuat.
                </div>
            )}
        </div>
    );
}
