'use client'

import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'

interface DistribuicaoChartProps {
  data: Array<{
    faixa: string
    count: number
    fill: string
  }>
}

const chartConfig = {
  count: {
    label: 'Quantidade',
  },
  faixa1: {
    label: 'Faixa 1',
    color: 'hsl(var(--chart-1))',
  },
  faixa2: {
    label: 'Faixa 2',
    color: 'hsl(var(--chart-2))',
  },
  faixa3: {
    label: 'Faixa 3',
    color: 'hsl(var(--chart-3))',
  },
  faixa4: {
    label: 'Faixa 4',
    color: 'hsl(var(--chart-4))',
  },
  faixa5: {
    label: 'Faixa 5',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig

const COLORS = [
  'var(--color-faixa1)',
  'var(--color-faixa2)',
  'var(--color-faixa3)',
  'var(--color-faixa4)',
  'var(--color-faixa5)',
]

export function DistribuicaoChart({ data }: DistribuicaoChartProps) {
  if (data.length === 0 || data.every((d) => d.count === 0)) {
    return (
      <div className="flex h-[400px] items-center justify-center text-muted-foreground">
        Nenhum dado disponível
      </div>
    )
  }

  const totalCount = data.reduce((sum, item) => sum + item.count, 0)

  return (
    <div className="flex flex-col gap-4 @xl/main:flex-row @xl/main:items-center">
      <ChartContainer config={chartConfig} className="h-[400px] flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span>{name}:</span>
                      <span className="font-bold">{value} itens</span>
                      <span className="text-muted-foreground">
                        ({(((value as number) / totalCount) * 100).toFixed(1)}
                        %)
                      </span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              dataKey="count"
              nameKey="faixa"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.faixa}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="flex flex-col gap-3 @xl/main:w-64">
        {data.map((item, index) => (
          <div
            key={item.faixa}
            className="flex items-center justify-between rounded-lg border p-3"
          >
            <div className="flex items-center gap-3">
              <div
                className="h-4 w-4 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-sm font-medium">{item.faixa}</span>
            </div>
            <span className="text-sm font-bold">{item.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
