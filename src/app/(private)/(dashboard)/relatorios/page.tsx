import { count, desc, eq } from 'drizzle-orm'
import { DataTable } from '@/components/data-table'
import { SectionCards, type StatCard } from '@/components/section-cards'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { leilao, relatorio } from '@/db/schema/leiloes'
import { columns } from './columns'

function parseValor(valor: string): number {
  return parseFloat(
    valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
  )
}

interface RelatoriosPageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
  }>
}

export default async function RelatoriosPage({
  searchParams,
}: RelatoriosPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const offset = (page - 1) * pageSize

  const relatorios = await db
    .select({
      id: relatorio.id,
      cpfCnpj: relatorio.cpfCnpj,
      numeroLote: relatorio.numeroLote,
      valorLance: relatorio.valorLance,
      tarifa: relatorio.tarifa,
      total: relatorio.total,
      dataLicitacao: leilao.dataLicitacao,
    })
    .from(relatorio)
    .leftJoin(leilao, eq(relatorio.leilaoId, leilao.id))
    .orderBy(desc(relatorio.createdAt))
    .limit(pageSize)
    .offset(offset)

  const [totalCount] = await db.select({ count: count() }).from(relatorio)

  const valorTotalArrematado = relatorios.reduce((acc, item) => {
    return acc + parseValor(item.total)
  }, 0)

  const totalTarifas = relatorios.reduce((acc, item) => {
    return acc + parseValor(item.tarifa)
  }, 0)

  const ticketMedio =
    totalCount.count > 0 ? valorTotalArrematado / totalCount.count : 0

  const cards: StatCard[] = [
    {
      title: 'Total de Arrematações',
      value: totalCount.count.toLocaleString('pt-BR'),
      description: 'Total de Arrematações',
      footer: {
        label: 'Relatórios importados',
        description: 'Arrematações registradas',
      },
    },
    {
      title: 'Valor Total',
      value: valorTotalArrematado.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: 'Valor Total',
      footer: {
        label: 'Soma dos valores arrematados',
        description: 'Total com tarifas incluídas',
      },
    },
    {
      title: 'Total em Tarifas',
      value: totalTarifas.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: 'Total em Tarifas',
      footer: {
        label: 'Soma das tarifas cobradas',
        description: 'Custos administrativos',
      },
    },
    {
      title: 'Ticket Médio',
      value: ticketMedio.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: 'Ticket Médio',
      footer: {
        label: 'Média por arrematação',
        description: 'Valor médio dos lances',
      },
    },
  ]

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-0">
      <div className="shrink-0">
        <SectionCards cards={cards} />
      </div>
      <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <CardHeader className="shrink-0">
          <CardTitle>Dados dos Relatórios</CardTitle>
          <CardDescription>
            Todos os itens importados dos relatórios de leilão
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
          <DataTable
            columns={columns}
            data={relatorios}
            pageCount={Math.ceil(totalCount.count / pageSize)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
