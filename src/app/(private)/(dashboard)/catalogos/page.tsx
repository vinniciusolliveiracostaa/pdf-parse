import { db } from '@/db/drizzle'
import { catalogo, leilao } from '@/db/schema/leiloes'
import { desc, eq } from 'drizzle-orm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function CatalogosPage() {
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
    .limit(100)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card className="max-w-7xl mx-auto">
        <CardHeader>
          <CardTitle>Dados dos Catálogos</CardTitle>
          <CardDescription>
            Todos os itens importados dos catálogos de leilão
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {catalogos.length === 0 ? (
              <p className="text-muted-foreground">Nenhum catálogo importado ainda</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Data Licitação</th>
                      <th className="text-left p-2">Lote</th>
                      <th className="text-left p-2">Contrato</th>
                      <th className="text-left p-2">Descrição</th>
                      <th className="text-left p-2">Valor</th>
                      <th className="text-left p-2">Peso</th>
                    </tr>
                  </thead>
                  <tbody>
                    {catalogos.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          {item.dataLicitacao ? 
                            new Date(item.dataLicitacao).toLocaleDateString('pt-BR') : 
                            'N/A'
                          }
                        </td>
                        <td className="p-2 font-mono">{item.lote}</td>
                        <td className="p-2 font-mono text-xs">{item.contrato}</td>
                        <td className="p-2 max-w-md truncate" title={item.descricao}>
                          {item.descricao}
                        </td>
                        <td className="p-2">{item.valor}</td>
                        <td className="p-2">{item.peso || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
