import { sql } from 'drizzle-orm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { catalogo, leilao, relatorio } from '@/db/schema/leiloes'
import { DistribuicaoChart } from './distribuicao-chart'
import { LeiloesChart } from './leiloes-chart'
import { ValoresChart } from './valores-chart'

function parseValor(valor: string): number {
  return parseFloat(
    valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
  )
}

export default async function GraficosPage() {
  // Buscar todos os leilões com contagem de itens
  const leiloesData = await db
    .select({
      id: leilao.id,
      data: leilao.dataLicitacao,
      totalCatalogos: sql<number>`count(distinct ${catalogo.id})`,
      totalRelatorios: sql<number>`count(distinct ${relatorio.id})`,
    })
    .from(leilao)
    .leftJoin(catalogo, sql`${catalogo.leilaoId} = ${leilao.id}`)
    .leftJoin(relatorio, sql`${relatorio.leilaoId} = ${leilao.id}`)
    .groupBy(leilao.id, leilao.dataLicitacao)
    .orderBy(leilao.dataLicitacao)

  // Buscar valores dos relatórios para gráfico de evolução
  const relatoriosComValores = await db
    .select({
      leilaoId: relatorio.leilaoId,
      dataLicitacao: leilao.dataLicitacao,
      valorLance: relatorio.valorLance,
      tarifa: relatorio.tarifa,
      total: relatorio.total,
    })
    .from(relatorio)
    .innerJoin(leilao, sql`${relatorio.leilaoId} = ${leilao.id}`)
    .orderBy(leilao.dataLicitacao)

  // Processar dados para gráfico de valores
  const valoresPorLeilao = relatoriosComValores.reduce(
    (acc, item) => {
      const data = item.dataLicitacao
      if (!acc[data]) {
        acc[data] = {
          data,
          valorTotal: 0,
          tarifaTotal: 0,
          count: 0,
        }
      }
      acc[data].valorTotal += parseValor(item.total)
      acc[data].tarifaTotal += parseValor(item.tarifa)
      acc[data].count += 1
      return acc
    },
    {} as Record<
      string,
      { data: string; valorTotal: number; tarifaTotal: number; count: number }
    >,
  )

  const valoresChartData = Object.values(valoresPorLeilao).map((item) => ({
    date: new Date(item.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    }),
    valorTotal: Math.round(item.valorTotal),
    tarifaTotal: Math.round(item.tarifaTotal),
    quantidade: item.count,
  }))

  // Processar dados para gráfico de leilões
  const leiloesChartData = leiloesData.map((item) => ({
    date: new Date(item.data).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
    }),
    catalogos: Number(item.totalCatalogos),
    relatorios: Number(item.totalRelatorios),
  }))

  // Distribuição de valores (faixas de preço)
  const faixasValor = {
    'Até R$ 1.000': 0,
    'R$ 1.000 - R$ 5.000': 0,
    'R$ 5.000 - R$ 10.000': 0,
    'R$ 10.000 - R$ 50.000': 0,
    'Acima de R$ 50.000': 0,
  }

  relatoriosComValores.forEach((item) => {
    const valor = parseValor(item.total)
    if (valor <= 1000) faixasValor['Até R$ 1.000']++
    else if (valor <= 5000) faixasValor['R$ 1.000 - R$ 5.000']++
    else if (valor <= 10000) faixasValor['R$ 5.000 - R$ 10.000']++
    else if (valor <= 50000) faixasValor['R$ 10.000 - R$ 50.000']++
    else faixasValor['Acima de R$ 50.000']++
  })

  const distribuicaoData = Object.entries(faixasValor).map(
    ([faixa, count]) => ({
      faixa,
      count,
      fill: `var(--color-${faixa.split(' ')[0].toLowerCase()})`,
    }),
  )

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-2">
      <div className="flex shrink-0 flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Gráficos</h1>
        <p className="text-muted-foreground">
          Visualizações interativas dos dados de leilões
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          <div className="grid gap-6 @xl/main:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Leilões</CardTitle>
                <CardDescription>
                  Quantidade de catálogos e relatórios por leilão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LeiloesChart data={leiloesChartData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Evolução de Valores</CardTitle>
                <CardDescription>
                  Total arrematado e tarifas cobradas por leilão
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ValoresChart data={valoresChartData} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Distribuição por Faixa de Valor</CardTitle>
              <CardDescription>
                Quantidade de arrematações por faixa de preço
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DistribuicaoChart data={distribuicaoData} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
