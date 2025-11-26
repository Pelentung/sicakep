import { getBudgets, getTransactions } from "@/lib/data";
import { BudgetCard } from "@/components/budgets/budget-card";

export default function BudgetsPage() {
    const budgets = getBudgets();
    const transactions = getTransactions();

    const spendingByCategory = transactions
        .filter(t => t.type === 'expense')
        .reduce((acc, t) => {
            if (!acc[t.category]) {
                acc[t.category] = 0;
            }
            acc[t.category] += t.amount;
            return acc;
        }, {} as Record<string, number>);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Anggaran Bulanan</h1>
            </div>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {budgets.map(budget => (
                    <BudgetCard 
                        key={budget.id}
                        category={budget.category}
                        budgeted={budget.amount}
                        spent={spendingByCategory[budget.category] || 0}
                    />
                ))}
            </div>
        </div>
    );
}
