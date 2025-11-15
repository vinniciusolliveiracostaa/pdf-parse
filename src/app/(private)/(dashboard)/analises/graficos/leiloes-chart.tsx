'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface LeiloesChartProps {
  data: Array<{
    date: string
    catalogos: number
    relatorios: number
  }>
}

const chartConfig = {
  catalogos: {
    label: 'Catálogos',
    color: 'var(--chart-1)',
  },
  relatorios: {
    label: 'Relatórios',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig

export function LeiloesChart({ data }: LeiloesChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="fillCatalogos" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-catalogos)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-catalogos)"
              stopOpacity={0.05}
            />
          </linearGradient>
          <linearGradient id="fillRelatorios" x1="0" y1="0" x2="0" y2="1">
            <stop
              offset="5%"
              stopColor="var(--color-relatorios)"
              stopOpacity={0.3}
            />
            <stop
              offset="95%"
              stopColor="var(--color-relatorios)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
        />
        <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Area
          type="monotone"
          dataKey="catalogos"
          stroke="var(--color-catalogos)"
          fill="url(#fillCatalogos)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="relatorios"
          stroke="var(--color-relatorios)"
          fill="url(#fillRelatorios)"
          strokeWidth={2}
        />
      </AreaChart>
    </ChartContainer>
  )
}
