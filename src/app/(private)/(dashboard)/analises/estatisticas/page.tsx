import { count } from 'drizzle-orm'
import { SectionCards, type StatCard } from '@/components/section-cards'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { catalogo, leilao, relatorio } from '@/db/schema/leiloes'

function parseValor(valor: string): number {
  return parseFloat(
    valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
  )
}

export default async function EstatisticasPage() {
  // Estatísticas gerais
  const [leiloesCount] = await db.select({ count: count() }).from(leilao)
  const [catalogosCount] = await db.select({ count: count() }).from(catalogo)
  const [relatoriosCount] = await db.select({ count: count() }).from(relatorio)

  // Todos os relatórios para cálculos
  const todosRelatorios = await db.select().from(relatorio)

  const valorTotalArrematado = todosRelatorios.reduce(
    (acc, item) => acc + parseValor(item.total),
    0,
  )
  const totalTarifas = todosRelatorios.reduce(
    (acc, item) => acc + parseValor(item.tarifa),
    0,
  )
  const ticketMedio =
    relatoriosCount.count > 0 ? valorTotalArrematado / relatoriosCount.count : 0

  // Maior e menor arrematação
  const maiorArrematacao = todosRelatorios.reduce((max, item) => {
    const valor = parseValor(item.total)
    return valor > parseValor(max.total) ? item : max
  }, todosRelatorios[0] || { total: 'R$ 0,00' })

  const menorArrematacao = todosRelatorios.reduce((min, item) => {
    const valor = parseValor(item.total)
    return valor < parseValor(min.total) && valor > 0 ? item : min
  }, todosRelatorios[0] || { total: 'R$ 999999999,00' })

  // Cards de estatísticas
  const statsCards: StatCard[] = [
    {
      title: 'Total Arrematado',
      value: valorTotalArrematado.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: 'Valor Total Arrematado',
      footer: {
        label: 'Soma de todas as arrematações',
        description: 'Incluindo tarifas',
      },
    },
    {
      title: 'Ticket Médio',
      value: ticketMedio.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: 'Valor Médio por Arrematação',
      footer: {
        label: 'Média calculada',
        description: `Baseado em ${relatoriosCount.count} arrematações`,
      },
    },
    {
      title: 'Total em Tarifas',
      value: totalTarifas.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: 'Tarifas Cobradas',
      footer: {
        label: 'Custos administrativos',
        description: 'Soma de todas as tarifas',
      },
    },
    {
      title: 'Taxa Média de Tarifa',
      value: `${((totalTarifas / valorTotalArrematado) * 100).toFixed(2)}%`,
      description: 'Percentual Médio de Tarifa',
      footer: {
        label: 'Relação tarifa/valor',
        description: 'Média sobre valor arrematado',
      },
    },
  ]

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-2">
      <div className="flex shrink-0 flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Estatísticas</h1>
        <p className="text-muted-foreground">
          Análises detalhadas e métricas dos leilões
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          <SectionCards cards={statsCards} />

          <div className="grid gap-6 @xl/main:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Maior Arrematação</CardTitle>
                <CardDescription>
                  Lote com maior valor arrematado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {maiorArrematacao ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm font-semibold">
                          Lote: {maiorArrematacao.numeroLote}
                        </p>
                        {maiorArrematacao.cpfCnpj && (
                          <p className="text-sm text-muted-foreground">
                            CPF/CNPJ: {maiorArrematacao.cpfCnpj}
                          </p>
                        )}
                      </div>
                      <Badge className="bg-chart-3 hover:bg-chart-3">
                        Maior
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Valor Lance
                        </p>
                        <p className="text-lg font-bold">
                          {maiorArrematacao.valorLance}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tarifa</p>
                        <p className="text-lg font-bold">
                          {maiorArrematacao.tarifa}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">
                          {maiorArrematacao.total}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Nenhum dado disponível
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Menor Arrematação</CardTitle>
                <CardDescription>
                  Lote com menor valor arrematado
                </CardDescription>
              </CardHeader>
              <CardContent>
                {menorArrematacao ? (
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm font-semibold">
                          Lote: {menorArrematacao.numeroLote}
                        </p>
                        {menorArrematacao.cpfCnpj && (
                          <p className="text-sm text-muted-foreground">
                            CPF/CNPJ: {menorArrematacao.cpfCnpj}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline">Menor</Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 rounded-lg border p-4">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Valor Lance
                        </p>
                        <p className="text-lg font-bold">
                          {menorArrematacao.valorLance}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Tarifa</p>
                        <p className="text-lg font-bold">
                          {menorArrematacao.tarifa}
                        </p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-sm text-muted-foreground">Total</p>
                        <p className="text-2xl font-bold text-primary">
                          {menorArrematacao.total}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">
                    Nenhum dado disponível
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Resumo Geral</CardTitle>
              <CardDescription>
                Visão consolidada de todos os dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 @md/main:grid-cols-3">
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total de Leilões
                  </p>
                  <p className="text-3xl font-bold">{leiloesCount.count}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total de Catálogos
                  </p>
                  <p className="text-3xl font-bold">{catalogosCount.count}</p>
                </div>
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total de Arrematações
                  </p>
                  <p className="text-3xl font-bold">{relatoriosCount.count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
