import { ArrowDownCircle, ArrowUpCircle, Banknote } from "lucide-react"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { FinancialSummary } from "@/lib/types";

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
}

export function SummaryCards({ summary }: { summary: FinancialSummary }) {
    return (
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Pemasukan
                    </CardTitle>
                    <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.totalIncome)}</div>
                    <p className="text-xs text-muted-foreground">
                        Bulan ini
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                        Total Pengeluaran
                    </CardTitle>
                    <ArrowDownCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
                    <p className="text-xs text-muted-foreground">
                        Bulan ini
                    </p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                    <Banknote className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(summary.balance)}</div>
                    <p className="text-xs text-muted-foreground">
                        Saldo saat ini
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
