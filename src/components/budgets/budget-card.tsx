import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

interface BudgetCardProps {
    category: string;
    budgeted: number;
    spent: number;
}

export function BudgetCard({ category, budgeted, spent }: BudgetCardProps) {
    const progress = budgeted > 0 ? (spent / budgeted) * 100 : 0;
    const remaining = budgeted - spent;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                    <span>Terpakai</span>
                    <span>{formatCurrency(spent)}</span>
                </div>
                <Progress value={progress} />
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Anggaran: {formatCurrency(budgeted)}</span>
                </div>
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
