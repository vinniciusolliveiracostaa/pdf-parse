import { count, desc, eq, sql } from 'drizzle-orm'

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
import { catalogo, leilao } from '@/db/schema/leiloes'
import { columns } from './columns'

function parseValor(valor: string): number {
  return parseFloat(
    valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
  )
}

interface CatalogosPageProps {
  searchParams: Promise<{
    page?: string
    pageSize?: string
  }>
}

export default async function CatalogosPage({
  searchParams,
}: CatalogosPageProps) {
  const params = await searchParams
  const page = Number(params.page) || 1
  const pageSize = Number(params.pageSize) || 10
  const offset = (page - 1) * pageSize

  const catalogos = await db
    .select({
      id: catalogo.id,
      lote: catalogo.lote,
      contrato: catalogo.contrato,
      descricao: catalogo.descricao,
      valor: catalogo.valor,
      peso: catalogo.peso,
      anotacoes: catalogo.anotacoes,
      dataLicitacao: leilao.dataLicitacao,
    })
    .from(catalogo)
    .leftJoin(leilao, eq(catalogo.leilaoId, leilao.id))
    .orderBy(desc(catalogo.createdAt))
    .limit(pageSize)
    .offset(offset)

  const [totalCount] = await db.select({ count: count() }).from(catalogo)

  const [comPesoCount] = await db
    .select({ count: count() })
    .from(catalogo)
    .where(sql`${catalogo.peso} IS NOT NULL`)

  const valorTotal = catalogos.reduce((acc, item) => {
    return acc + parseValor(item.valor)
  }, 0)

  const valorMedio = totalCount.count > 0 ? valorTotal / totalCount.count : 0

  const cards: StatCard[] = [
    {
      title: 'Total de Lotes',
      value: totalCount.count.toLocaleString('pt-BR'),
      description: 'Total de Lotes',
      footer: {
        label: 'Catálogos importados',
        description: 'Itens disponíveis no sistema',
      },
    },
    {
      title: 'Valor Total',
      value: valorTotal.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: 'Valor Total',
      footer: {
        label: 'Soma de todos os lotes',
        description: 'Valor acumulado dos catálogos',
      },
    },
    {
      title: 'Com Peso',
      value: comPesoCount.count.toLocaleString('pt-BR'),
      description: 'Com Peso',
      footer: {
        label: 'Itens com peso identificado',
        description: 'Permite cálculo de R$/g',
      },
    },
    {
      title: 'Valor Médio',
      value: valorMedio.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
      description: 'Valor Médio',
      footer: {
        label: 'Média por lote',
        description: 'Valor médio dos catálogos',
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
          <CardTitle>Dados dos Catálogos</CardTitle>
          <CardDescription>
            Todos os itens importados dos catálogos de leilão
          </CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-6">
          <DataTable
            columns={columns}
            data={catalogos}
            pageCount={Math.ceil(totalCount.count / pageSize)}
          />
        </CardContent>
      </Card>
    </div>
  )
}
