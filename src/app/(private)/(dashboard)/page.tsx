import { count, desc, sql } from 'drizzle-orm'
import { FileText, Package, Scale, TrendingUp } from 'lucide-react'
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

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Leilões Importados
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{leiloesCount.count}</div>
            <p className="text-xs text-muted-foreground">
              Total de leilões processados
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Itens Catalogados
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{catalogosCount.count}</div>
            <p className="text-xs text-muted-foreground">Lotes disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Arrematações</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{relatoriosCount.count}</div>
            <p className="text-xs text-muted-foreground">
              Registros de arrematantes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Com Peso Identificado
            </CardTitle>
            <Scale className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{catalogosComPeso.length}</div>
            <p className="text-xs text-muted-foreground">
              Itens com cálculo de R$/g
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Últimos Leilões</CardTitle>
            <CardDescription>Leilões importados recentemente</CardDescription>
          </CardHeader>
          <CardContent>
            {ultimosLeiloes.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum leilão importado. Faça upload dos PDFs para começar.
              </p>
            ) : (
              <div className="space-y-2">
                {ultimosLeiloes.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {new Date(item.dataLicitacao).toLocaleDateString(
                          'pt-BR',
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ID: {item.id}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top 10 - Maior Valor/Grama</CardTitle>
            <CardDescription>
              Itens com melhor relação valor por grama
            </CardDescription>
          </CardHeader>
          <CardContent>
            {topValoresPorGrama.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                Nenhum item com peso identificado ainda
              </p>
            ) : (
              <div className="space-y-2">
                {topValoresPorGrama.map((item, index) => (
                  <div
                    key={item?.lote}
                    className="flex items-start justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">
                          #{index + 1}
                        </span>
                        <p className="font-mono text-sm font-medium">
                          {item?.lote}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 truncate">
                        {item?.descricao}...
                      </p>
                      <div className="flex gap-3 mt-2 text-xs">
                        <span className="text-muted-foreground">
                          Peso: {item?.peso}
                        </span>
                        <span className="text-muted-foreground">
                          Total: {item?.total}
                        </span>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-sm font-bold text-primary">
                        {item?.valorPorGrama.toLocaleString('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        })}
                        /g
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
