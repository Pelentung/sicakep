'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import type { Transaction } from '@/lib/types';
import { eachDayOfInterval, endOfMonth, format, parseISO, startOfMonth } from 'date-fns';

const chartConfig = {
  pemasukan: {
    label: 'Pemasukan',
    color: 'hsl(var(--chart-1))',
  },
  pengeluaran: {
    label: 'Pengeluaran',
    color: 'hsl(var(--chart-2))',
  },
} satisfies ChartConfig;

export function OverviewChart({ transactions, selectedMonth }: { transactions: Transaction[], selectedMonth: Date }) {
  const dailyData = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth),
  }).map(day => ({
    date: format(day, 'd'),
    pemasukan: 0,
    pengeluaran: 0,
  }));

  transactions.forEach(t => {
    const transactionDate = parseISO(t.date);
    if (transactionDate >= startOfMonth(selectedMonth) && transactionDate <= endOfMonth(selectedMonth)) {
      const dayOfMonth = transactionDate.getDate() - 1;
      if (t.type === 'income') {
        dailyData[dayOfMonth].pemasukan += t.amount;
      } else {
        dailyData[dayOfMonth].pengeluaran += t.amount;
      }
    }
  });


  return (
    <Card>
      <CardHeader>
        <CardTitle>Ikhtisar Bulanan</CardTitle>
        <CardDescription>Pemasukan dan pengeluaran harian untuk bulan yang dipilih.</CardDescription>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={dailyData} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `Rp${Number(value) / 1000}k`}
              width={80}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) =>
                    `${chartConfig[name as keyof typeof chartConfig].label}: Rp${Number(value).toLocaleString()}`
                  }
                  labelFormatter={(label) => `${label} ${format(selectedMonth, 'MMM')}`}
                />
              }
              cursor={false}
            />
            <Bar
              dataKey="pemasukan"
              fill="var(--color-pemasukan)"
              radius={4}
            />
            <Bar
              dataKey="pengeluaran"
              fill="var(--color-pengeluaran)"
              radius={4}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
