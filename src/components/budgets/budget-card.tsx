'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import type { Budget } from "@/lib/types"
import { EditBudgetDialog } from "./edit-budget-dialog"

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

interface BudgetCardProps {
    budget: Budget;
    spent: number;
}

export function BudgetCard({ budget, spent }: BudgetCardProps) {
    const progress = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    const remaining = budget.amount - spent;

    return (
        <Card>
            <CardHeader className="flex-row items-start justify-between">
                <div>
                    <CardTitle>{budget.category}</CardTitle>
                    <CardDescription>Anggaran: {formatCurrency(budget.amount)}</CardDescription>
                </div>
                <EditBudgetDialog budget={budget} />
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Terpakai</span>
                    <span>{formatCurrency(spent)}</span>
                </div>
                <Progress value={progress} />
            </CardContent>
            <CardFooter>
                <p className={cn(
                    "text-sm font-medium",
                    remaining >= 0 ? "text-green-600" : "text-red-600"
                )}>
                    {remaining >= 0 ? `${formatCurrency(remaining)} Tersisa` : `${formatCurrency(Math.abs(remaining))} Melebihi`}
                </p>
            </CardFooter>
        </Card>
    )
}
