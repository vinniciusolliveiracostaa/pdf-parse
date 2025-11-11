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

  const catalogosData = await db
    .select()
    .from(catalogo)
    .innerJoin(leilao, sql`${catalogo.leilaoId} = ${leilao.id}`)
    .limit(500)

  const relatoriosData = await db
    .select()
    .from(relatorio)
    .innerJoin(leilao, sql`${relatorio.leilaoId} = ${leilao.id}`)
    .limit(500)

  const todosCatalogos = catalogosData.map((item) => ({
    tipo: 'catalogo' as const,
    numeroLote: item.catalogo.lote,
    numeroContrato: item.catalogo.contrato,
    descricao: item.catalogo.descricao,
    valor: item.catalogo.valor,
    peso: item.catalogo.peso,
    anotacoes: item.catalogo.anotacoes,
    dataLeilao: item.leilao.dataLicitacao,
    valorLance: null,
    tarifa: null,
    total: null,
    cpfCnpj: null,
  }))

  const todosRelatorios = relatoriosData.map((item) => ({
    tipo: 'relatorio' as const,
    numeroLote: item.relatorio.numeroLote,
    numeroContrato: null,
    descricao: null,
    valor: null,
    peso: null,
    anotacoes: null,
    dataLeilao: item.leilao.dataLicitacao,
    valorLance: item.relatorio.valorLance,
    tarifa: item.relatorio.tarifa,
    total: item.relatorio.total,
    cpfCnpj: item.relatorio.cpfCnpj,
  }))

  const todosLotes = [...todosCatalogos, ...todosRelatorios]

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
