import { getFinancialSummary, getTransactions } from "@/lib/data";
import { SummaryCards } from "@/components/dashboard/summary-cards";
import { OverviewChart } from "@/components/dashboard/overview-chart";
import { UpcomingBills } from "@/components/dashboard/upcoming-bills";
import { AiInsights } from "@/components/dashboard/ai-insights";

export default function DashboardPage() {
    const transactions = getTransactions();
    const summary = getFinancialSummary(transactions);

    return (
        <div className="space-y-6">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
            <SummaryCards summary={summary} />
            <div className="grid gap-6 lg:grid-cols-2">
                <OverviewChart transactions={transactions} />
                <div className="space-y-6">
                    <UpcomingBills />
                    <AiInsights />
                </div>
            </div>
        </div>
    );
}
