'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface DashboardMiniChartProps {
  data: Array<{
    date: string
    total: number
  }>
}

const chartConfig = {
  total: {
    label: 'Total de Itens',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function DashboardMiniChart({ data }: DashboardMiniChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[250px] items-center justify-center text-muted-foreground">
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[250px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillTotal" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-total)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-total)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={11}
          width={30}
        />
        <ChartTooltip content={<ChartTooltipContent />} cursor={false} />
        <Area
          type="monotone"
          dataKey="total"
          stroke="var(--color-total)"
          fill="url(#fillTotal)"
          strokeWidth={2.5}
        />
      </AreaChart>
    </ChartContainer>
  )
}
