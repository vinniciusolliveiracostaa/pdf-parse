import { desc, eq } from 'drizzle-orm'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { leilao, relatorio } from '@/db/schema/leiloes'

export default async function RelatoriosPage() {
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
    .limit(100)

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card className="w-9/10 mx-auto">
        <CardHeader>
          <CardTitle>Dados dos Relatórios</CardTitle>
          <CardDescription>
            Todos os registros importados dos relatórios de arrematantes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {relatorios.length === 0 ? (
              <p className="text-muted-foreground">
                Nenhum relatório importado ainda
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Data Licitação</th>
                      <th className="text-left p-2">CPF/CNPJ</th>
                      <th className="text-left p-2">Nº Lote</th>
                      <th className="text-left p-2">Valor Lance</th>
                      <th className="text-left p-2">Tarifa</th>
                      <th className="text-left p-2">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {relatorios.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">
                          {item.dataLicitacao
                            ? new Date(item.dataLicitacao).toLocaleDateString(
                                'pt-BR',
                              )
                            : 'N/A'}
                        </td>
                        <td className="p-2 font-mono text-xs">
                          {item.cpfCnpj || '-'}
                        </td>
                        <td className="p-2 font-mono">{item.numeroLote}</td>
                        <td className="p-2">R$ {item.valorLance}</td>
                        <td className="p-2">R$ {item.tarifa}</td>
                        <td className="p-2 font-semibold">R$ {item.total}</td>
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
