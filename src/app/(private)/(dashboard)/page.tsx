import { count, desc, sql } from 'drizzle-orm'
import { ArrowRight, TrendingDown, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { SectionCards, type StatCard } from '@/components/section-cards'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { catalogo, leilao, relatorio } from '@/db/schema/leiloes'
import { DashboardMiniChart } from './dashboard-mini-chart'

function parseValor(valor: string): number {
  return parseFloat(
    valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
  )
}

function parsePeso(peso: string): number {
  return parseFloat(peso.replace('G', '').replace(',', '.').trim())
}

export default async function Page() {
  // Estatísticas gerais
  const [leiloesCount] = await db.select({ count: count() }).from(leilao)
  const [catalogosCount] = await db.select({ count: count() }).from(catalogo)
  const [relatoriosCount] = await db.select({ count: count() }).from(relatorio)

  // Últimos leilões
  const ultimosLeiloes = await db
    .select()
    .from(leilao)
    .orderBy(desc(leilao.dataLicitacao))
    .limit(5)

  // Itens com melhor valor por grama (top 10)
  const catalogosComPeso = await db
    .select()
    .from(catalogo)
    .innerJoin(relatorio, sql`${catalogo.lote} = ${relatorio.numeroLote}`)
    .where(sql`${catalogo.peso} IS NOT NULL`)
    .orderBy(desc(catalogo.createdAt))
    .limit(100)

  const topValoresPorGrama = catalogosComPeso
    .map((item) => {
      if (!item.catalogo.peso) return null
      const total = parseValor(item.relatorio.total)
      const peso = parsePeso(item.catalogo.peso)
      if (peso === 0) return null
      return {
        lote: item.catalogo.lote,
        descricao: item.catalogo.descricao.substring(0, 60),
        peso: item.catalogo.peso,
        total: item.relatorio.total,
        valorPorGrama: total / peso,
      }
    })
    .filter(Boolean)
    .sort((a, b) => (b?.valorPorGrama || 0) - (a?.valorPorGrama || 0))
    .slice(0, 10)

  // Calcular valor total dos leilões
  const valorTotalLeiloes = catalogosComPeso.reduce((acc, item) => {
    return acc + parseValor(item.relatorio.total)
  }, 0)

  const valorMedioPorLote =
    catalogosCount.count > 0 ? valorTotalLeiloes / catalogosCount.count : 0

  // Dados para mini gráfico (últimos 7 leilões)
  const ultimosLeiloesGrafico = await db
    .select({
      data: leilao.dataLicitacao,
      total: sql<number>`count(${catalogo.id})`,
    })
    .from(leilao)
    .leftJoin(catalogo, sql`${catalogo.leilaoId} = ${leilao.id}`)
    .groupBy(leilao.dataLicitacao)
    .orderBy(desc(leilao.dataLicitacao))
    .limit(7)

  const chartData = ultimosLeiloesGrafico.reverse().map((item) => ({
    date: new Date(item.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    }),
    total: Number(item.total),
  }))

  // Calcular tendência
  const tendencia =
    chartData.length > 1
      ? chartData[chartData.length - 1].total > chartData[0].total
      : true

  // Stats cards
  const statsCards: StatCard[] = [
    {
      title: 'Leilões',
      value: leiloesCount.count,
      description: 'Leilões Importados',
      footer: {
        label: 'Total processados',
        description: 'Documentos de catálogos e relatórios',
      },
    },
    {
      title: 'Catálogos',
      value: catalogosCount.count.toLocaleString('pt-BR'),
      description: 'Itens Catalogados',
      footer: {
        label: 'Lotes disponíveis',
        description: 'Produtos prontos para análise',
      },
    },
    {
      title: 'Arrematações',
      value: relatoriosCount.count.toLocaleString('pt-BR'),
      description: 'Total de Arrematações',
      footer: {
        label: 'Registros de lances',
        description: 'Dados de arrematantes processados',
      },
    },
    {
      title: 'Valor Médio',
      value: valorMedioPorLote.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        maximumFractionDigits: 0,
      }),
      description: 'Valor Médio/Lote',
      footer: {
        label: 'Média calculada',
        description: 'Com base nos lotes processados',
      },
    },
  ]

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-2">
      <div className="flex shrink-0 flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral dos leilões e análises de mercado
        </p>
      </div>

      <div className="shrink-0">
        <SectionCards cards={statsCards} />
      </div>

      <div className="grid min-h-0 flex-1 gap-6 @2xl/main:grid-cols-3">
        <Card className="flex min-h-0 flex-col @2xl/main:col-span-2">
          <CardHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>
                  Evolução dos leilões nos últimos 7 registros
                </CardDescription>
              </div>
              <Badge variant={tendencia ? 'default' : 'secondary'}>
                {tendencia ? (
                  <>
                    <TrendingUp className="mr-1 h-3 w-3" />
                    Crescimento
                  </>
                ) : (
                  <>
                    <TrendingDown className="mr-1 h-3 w-3" />
                    Declínio
                  </>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            <DashboardMiniChart data={chartData} />
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {chartData.length > 0
                  ? `${chartData.reduce((sum, d) => sum + d.total, 0)} itens cadastrados`
                  : 'Aguardando dados'}
              </p>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/analises/graficos">
                  Ver análise completa
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="grid min-h-0 gap-6 @xl/main:grid-cols-2 @2xl/main:grid-cols-1">
          <Card className="flex min-h-0 flex-col">
            <CardHeader className="shrink-0">
              <CardTitle>Últimos Leilões</CardTitle>
              <CardDescription>
                Leilões importados recentemente no sistema
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {ultimosLeiloes.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                    <svg
                      className="h-8 w-8 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground mt-4">
                    Nenhum leilão importado ainda
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Faça upload dos PDFs para começar
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {ultimosLeiloes.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative flex items-center justify-between rounded-lg border bg-card p-4 transition-all hover:border-primary/50 hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div className="bg-primary/10 text-primary flex h-10 w-10 items-center justify-center rounded-lg font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <p className="font-semibold">
                            {new Date(item.dataLicitacao).toLocaleDateString(
                              'pt-BR',
                              {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric',
                              },
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ID: {item.id}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">Processado</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="flex min-h-0 flex-col">
            <CardHeader className="shrink-0">
              <CardTitle>🏆 Top 10 - Melhor Valor/Grama</CardTitle>
              <CardDescription>
                Lotes com melhor custo-benefício por grama de peso
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-auto">
              {topValoresPorGrama.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="bg-muted flex h-16 w-16 items-center justify-center rounded-full">
                    <svg
                      className="h-8 w-8 text-muted-foreground"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"
                      />
                    </svg>
                  </div>
                  <p className="text-muted-foreground mt-4">
                    Nenhum item com peso identificado
                  </p>
                  <p className="text-muted-foreground text-sm">
                    Aguardando processamento de catálogos
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {topValoresPorGrama.map((item, index) => (
                    <div
                      key={item?.lote}
                      className="group relative flex items-start justify-between rounded-lg border bg-card p-3 transition-all hover:border-primary/50 hover:shadow-sm"
                    >
                      <div className="flex flex-1 items-start gap-3">
                        <div
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                            index === 0
                              ? 'bg-chart-1/20 text-chart-1'
                              : index === 1
                                ? 'bg-chart-2/20 text-chart-2'
                                : index === 2
                                  ? 'bg-chart-3/20 text-chart-3'
                                  : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-mono text-sm font-semibold">
                              {item?.lote}
                            </p>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                            {item?.descricao}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                            <span className="text-muted-foreground">
                              ⚖️ {item?.peso}
                            </span>
                            <span className="text-muted-foreground">
                              💰 {item?.total}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="ml-3 shrink-0 text-right">
                        <p className="text-sm font-bold text-primary">
                          {item?.valorPorGrama.toLocaleString('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">/grama</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
