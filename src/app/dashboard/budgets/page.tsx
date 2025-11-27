'use client'

import { useState, useEffect } from "react";
import { getBudgets, getTransactions, addBudget } from "@/lib/data";
import { BudgetCard } from "@/components/budgets/budget-card";
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Budget, Transaction } from "@/lib/types";
import { LoaderCircle } from "lucide-react";

export default function BudgetsPage() {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        setBudgets(getBudgets());
        setTransactions(getTransactions());
        setLoading(false);
    }, []);

    const refreshBudgets = () => {
        setBudgets(getBudgets());
    }

    const spendingByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = 0;
            }
            acc[t.category] += t.amount;
            return acc;
        }, {} as Record<string, number>);

    const handleBudgetAdded = (budget: Omit<Budget, 'id' | 'userId'>) => {
        addBudget(budget);
        refreshBudgets();
    }

    if (loading) {
        return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-foreground md:text-3xl">Anggaran Bulanan</h1>
                <AddBudgetDialog onBudgetAdded={handleBudgetAdded}>
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
