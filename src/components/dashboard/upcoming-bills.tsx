import Link from "next/link";
import { Bell } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getBills } from "@/lib/data";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Button } from "../ui/button";

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
}

export function UpcomingBills() {
  const bills = getBills().filter(b => !b.isPaid).slice(0, 3);

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="space-y-1.5">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Tagihan Mendatang
          </CardTitle>
          <CardDescription>
            3 tagihan belum dibayar berikutnya.
          </CardDescription>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/dashboard/bills">Lihat Semua</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {bills.length > 0 ? (
          <ul className="space-y-4">
            {bills.map((bill) => (
              <li key={bill.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{bill.name}</p>
                  <p className="text-sm text-muted-foreground">
                    Jatuh tempo: {format(parseISO(bill.dueDate), 'd MMMM yyyy', { locale: id })}
                  </p>
                </div>
                <div className="font-semibold text-right">{formatCurrency(bill.amount)}</div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">Tidak ada tagihan mendatang.</p>
        )}
      </CardContent>
    </Card>
  );
}
