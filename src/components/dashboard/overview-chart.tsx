"use client"

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import type { Transaction } from "@/lib/types"

const chartConfig = {
  pemasukan: {
    label: "Pemasukan",
    color: "hsl(var(--chart-1))",
  },
  pengeluaran: {
    label: "Pengeluaran",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig

export function OverviewChart({ transactions }: { transactions: Transaction[] }) {
  const monthlyData = transactions.reduce((acc, t) => {
    const month = new Date(t.date).toLocaleString('default', { month: 'short' });
    if (!acc[month]) {
      acc[month] = { month, pemasukan: 0, pengeluaran: 0 };
    }
    if (t.type === 'income') {
      acc[month].pemasukan += t.amount;
    } else {
      acc[month].pengeluaran += t.amount;
    }
    return acc;
  }, {} as Record<string, { month: string; pemasukan: number; pengeluaran: number }>);

  const chartData = Object.values(monthlyData);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ikhtisar</CardTitle>
      </CardHeader>
      <CardContent className="pl-2">
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `Rp${Number(value) / 1000}k`}
            />
            <ChartTooltip
              content={<ChartTooltipContent 
                formatter={(value, name) => `${chartConfig[name as keyof typeof chartConfig].label}: Rp${Number(value).toLocaleString()}`}
                />}
              cursor={false}
            />
            <Bar dataKey="pemasukan" fill="var(--color-pemasukan)" radius={4} />
            <Bar dataKey="pengeluaran" fill="var(--color-pengeluaran)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
