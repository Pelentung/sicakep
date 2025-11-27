'use client'

import { useState } from "react";
import { getBudgets, getTransactions, addBudget, updateBudget, deleteBudget } from "@/lib/data";
import { BudgetCard } from "@/components/budgets/budget-card";
import { AddBudgetDialog } from "@/components/budgets/add-budget-dialog";
import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Budget, Transaction } from "@/lib/types";
import { useUser, useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection } from "firebase/firestore";
import { LoaderCircle } from "lucide-react";

export default function BudgetsPage() {
    const { user: authUser } = useUser();
    const db = useFirestore();

    const budgetsQuery = useMemoFirebase(() => {
        if (!authUser) return null;
        return collection(db, 'users', authUser.uid, 'budgets');
    }, [db, authUser]);
    const { data: budgets, isLoading: budgetsLoading } = useCollection<Budget>(budgetsQuery);

    const transactionsQuery = useMemoFirebase(() => {
        if (!authUser) return null;
        return collection(db, 'users', authUser.uid, 'transactions');
    }, [db, authUser]);
    const { data: transactions, isLoading: transactionsLoading } = useCollection<Transaction>(transactionsQuery);

    const spendingByCategory = (transactions || [])
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = 0;
            }
            acc[t.category] += t.amount;
            return acc;
        }, {} as Record<string, number>);

    const handleBudgetAdded = (budget: Omit<Budget, 'id' | 'userId'>) => {
        if (!authUser) return;
        addBudget(db, authUser.uid, budget);
    }

    if (budgetsLoading || transactionsLoading) {
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
                {(budgets || []).map(budget => (
                    <BudgetCard 
                        key={budget.id}
                        budget={budget}
                        spent={spendingByCategory[budget.category] || 0}
                    />
                ))}
            </div>
            {(budgets || []).length === 0 && (
                <div className="col-span-full p-8 text-center text-muted-foreground">
                    Belum ada anggaran yang dibuat.
                </div>
            )}
        </div>
    );
}
