'use client'

import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Lote {
  tipo: string
  numeroLote: string
  numeroContrato: string | null
  descricao: string | null
  valor: string | null
  peso: string | null
  anotacoes: string | null
  dataLeilao: string
  valorLance: string | null
  tarifa: string | null
  total: string | null
  cpfCnpj: string | null
}

interface BuscaLoteClientProps {
  lotes: Lote[]
}

export function BuscaLoteClient({ lotes }: BuscaLoteClientProps) {
  const [searchTerm, setSearchTerm] = useState('')

  const lotesFiltrados = useMemo(() => {
    if (!searchTerm.trim()) return lotes

    const term = searchTerm.toLowerCase()
    return lotes.filter(
      (lote) =>
        lote.numeroLote.toLowerCase().includes(term) ||
        lote.descricao?.toLowerCase().includes(term) ||
        lote.numeroContrato?.toLowerCase().includes(term),
    )
  }, [searchTerm, lotes])

  const parseValor = (valor: string): number => {
    return parseFloat(
      valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim(),
    )
  }

  const calcularValorPorGrama = (lote: Lote): string | null => {
    if (!lote.valor || !lote.peso) return null

    const pesoMatch = lote.peso.match(/(\d+(?:,\d+)?)\s*g/)
    if (!pesoMatch) return null

    const pesoGramas = parseFloat(pesoMatch[1].replace(',', '.'))
    if (pesoGramas === 0) return null

    const valorNumerico = parseValor(lote.valor)
    const valorPorGrama = valorNumerico / pesoGramas

    return valorPorGrama.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
    })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pesquisar
          </CardTitle>
          <CardDescription>
            {lotesFiltrados.length} de {lotes.length} lotes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Digite o número do lote ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </CardContent>
      </Card>

      <Card className="flex min-h-0 flex-1 flex-col">
        <CardHeader className="shrink-0">
          <CardTitle>Resultados</CardTitle>
          <CardDescription>
            Todos os lotes cadastrados no sistema
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {lotesFiltrados.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {searchTerm ? 'Nenhum lote encontrado' : 'Nenhum lote cadastrado'}
            </div>
          ) : (
            <div className="space-y-4">
              {lotesFiltrados.map((lote, idx) => {
                const valorPorGrama = calcularValorPorGrama(lote)
                return (
                  <Card key={`${lote.tipo}-${lote.numeroLote}-${idx}`}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CardTitle className="text-lg">
                              Lote {lote.numeroLote}
                            </CardTitle>
                            <Badge
                              variant={
                                lote.tipo === 'catalogo'
                                  ? 'default'
                                  : 'secondary'
                              }
                            >
                              {lote.tipo === 'catalogo'
                                ? 'Catálogo'
                                : 'Relatório'}
                            </Badge>
                          </div>
                          <CardDescription>
                            {new Date(lote.dataLeilao).toLocaleDateString(
                              'pt-BR',
                            )}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-3 @md/main:grid-cols-2">
                        {lote.numeroContrato && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Contrato
                            </p>
                            <p className="font-semibold">
                              {lote.numeroContrato}
                            </p>
                          </div>
                        )}
                        {lote.descricao && (
                          <div className="@md/main:col-span-2">
                            <p className="text-sm text-muted-foreground">
                              Descrição
                            </p>
                            <p className="font-semibold">{lote.descricao}</p>
                          </div>
                        )}
                        {lote.valor && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Valor
                            </p>
                            <p className="font-semibold">{lote.valor}</p>
                          </div>
                        )}
                        {lote.peso && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Peso
                            </p>
                            <p className="font-semibold">{lote.peso}</p>
                          </div>
                        )}
                        {valorPorGrama && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Valor por Grama
                            </p>
                            <p className="font-semibold text-primary">
                              {valorPorGrama}
                            </p>
                          </div>
                        )}
                        {lote.valorLance && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Valor Lance
                            </p>
                            <p className="font-semibold">{lote.valorLance}</p>
                          </div>
                        )}
                        {lote.tarifa && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Tarifa
                            </p>
                            <p className="font-semibold">{lote.tarifa}</p>
                          </div>
                        )}
                        {lote.total && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Total
                            </p>
                            <p className="font-semibold text-primary">
                              {lote.total}
                            </p>
                          </div>
                        )}
                        {lote.cpfCnpj && (
                          <div>
                            <p className="text-sm text-muted-foreground">
                              CPF/CNPJ
                            </p>
                            <p className="font-mono text-sm">{lote.cpfCnpj}</p>
                          </div>
                        )}
                        {lote.anotacoes && (
                          <div className="@md/main:col-span-2">
                            <p className="text-sm text-muted-foreground">
                              Anotações
                            </p>
                            <p className="text-sm">{lote.anotacoes}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
