"use client"

import * as React from "react"
import { Label, Pie, PieChart, Sector } from "recharts"
import type { PieSectorDataItem } from "recharts/types/polar/Pie"

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
  'Makanan': { label: 'Makanan', color: 'hsl(var(--chart-1))' },
  'Transportasi': { label: 'Transportasi', color: 'hsl(var(--chart-2))' },
  'Sewa': { label: 'Sewa', color: 'hsl(var(--chart-3))' },
  'Hiburan': { label: 'Hiburan', color: 'hsl(var(--chart-4))' },
  'Belanja': { label: 'Belanja', color: 'hsl(var(--chart-5))' },
  'Lainnya': { label: 'Lainnya', color: 'hsl(var(--muted))' },
} satisfies ChartConfig

export function CategorySpendingChart({ data }: { data: Record<string, number> }) {
  const chartData = Object.entries(data).map(([category, amount]) => ({
    name: category,
    value: amount,
    fill: chartConfig[category as keyof typeof chartConfig]?.color || chartConfig.Lainnya.color,
  }));

  const totalValue = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.value, 0)
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Pengeluaran per Kategori</CardTitle>
        <CardDescription>Distribusi pengeluaran Anda di berbagai kategori.</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={0}
              activeShape={({ outerRadius = 0, ...props }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius}
                    innerRadius={outerRadius - 10}
                  />
                </g>
              )}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {totalValue.toLocaleString('id-ID', {style:'currency', currency: 'IDR', minimumFractionDigits: 0})}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Pengeluaran
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
