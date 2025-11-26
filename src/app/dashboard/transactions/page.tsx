import { getTransactions } from "@/lib/data";
import { AddTransactionDialog } from "@/components/transactions/add-transaction-dialog";
import { TransactionsTable } from "@/components/transactions/transactions-table";

export default function TransactionsPage() {
    const transactions = getTransactions();

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">Riwayat Transaksi</h1>
                <AddTransactionDialog />
            </div>
            <TransactionsTable transactions={transactions} />
        </div>
    );
}
