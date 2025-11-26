"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

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

export function IncomeExpenseChart({ data }: { data: { totalIncome: number; totalExpenses: number } }) {

  const chartData = [
    {
      label: "Total",
      pemasukan: data.totalIncome,
      pengeluaran: data.totalExpenses
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pemasukan vs Pengeluaran</CardTitle>
        <CardDescription>Perbandingan total pemasukan dan pengeluaran.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart accessibilityLayer data={chartData} layout="vertical">
            <YAxis
              type="category"
              dataKey="label"
              hide
            />
            <XAxis type="number" hide />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent 
                formatter={(value, name) => `${chartConfig[name as keyof typeof chartConfig].label}: Rp${Number(value).toLocaleString()}`}
                hideLabel
                />}
            />
            <Bar dataKey="pemasukan" layout="vertical" fill="var(--color-pemasukan)" radius={4} />
            <Bar dataKey="pengeluaran" layout="vertical" fill="var(--color-pengeluaran)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
