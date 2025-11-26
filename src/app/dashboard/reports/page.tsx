import { getFinancialSummary, getSpendingByCategory, getTransactions } from "@/lib/data";
import { IncomeExpenseChart } from "@/components/reports/income-expense-chart";
import { CategorySpendingChart } from "@/components/reports/category-spending-chart";

export default function ReportsPage() {
    const transactions = getTransactions();
    const summary = getFinancialSummary(transactions);
    const spendingByCategory = getSpendingByCategory(transactions);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Laporan Keuangan</h1>
            <div className="grid gap-6 md:grid-cols-2">
                <IncomeExpenseChart data={summary} />
                <CategorySpendingChart data={spendingByCategory} />
            </div>
        </div>
    );
}
