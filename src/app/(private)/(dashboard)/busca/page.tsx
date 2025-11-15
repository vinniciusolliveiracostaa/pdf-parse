import { sql } from 'drizzle-orm'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from '@/db/drizzle'
import { catalogo, leilao, relatorio } from '@/db/schema/leiloes'
import { auth } from '@/lib/auth'
import { BuscaLoteClient } from './busca-client'

export default async function BuscaPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  // Buscar todos os catálogos com seus relatórios correspondentes
  const catalogosData = await db
    .select({
      lote: catalogo.lote,
      contrato: catalogo.contrato,
      descricao: catalogo.descricao,
      peso: catalogo.peso,
      anotacoes: catalogo.anotacoes,
      dataLeilao: leilao.dataLicitacao,
      // Buscar relatório correspondente
      valorRelatorio: sql<string>`(
        SELECT ${relatorio.total}
        FROM ${relatorio}
        WHERE ${relatorio.numeroLote} = ${catalogo.lote}
          AND ${relatorio.leilaoId} = ${catalogo.leilaoId}
        LIMIT 1
      )`,
    })
    .from(catalogo)
    .innerJoin(leilao, sql`${catalogo.leilaoId} = ${leilao.id}`)
    .limit(500)

  const todosLotes = catalogosData.map((item) => ({
    numeroLote: item.lote,
    numeroContrato: item.contrato,
    descricao: item.descricao,
    peso: item.peso,
    dataLeilao: item.dataLeilao,
    valorTotal: item.valorRelatorio,
  }))

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-2">
      <div className="flex shrink-0 flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Buscar Lote</h1>
        <p className="text-muted-foreground">
          Pesquise por número do lote ou descrição
        </p>
      </div>

      <BuscaLoteClient lotes={todosLotes} />
    </div>
  )
}
