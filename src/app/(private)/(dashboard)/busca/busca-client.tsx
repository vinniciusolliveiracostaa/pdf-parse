'use client'

import { AlertCircle, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'

interface Lote {
  numeroLote: string
  numeroContrato: string
  descricao: string
  peso: string | null
  dataLeilao: string
  valorTotal: string | null
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

  const calcularValorPorGrama = (
    lote: Lote,
  ): { valorPorGrama: string; pesoGramas: number } | null => {
    // Valor total vem do relatório, peso vem do catálogo
    if (!lote.valorTotal || !lote.peso) return null

    // Formatos aceitos: XXX,XXG, XX,XXG, XXX,XX G, XX,XX G, X,XXG, X,XX G
    // Regex: captura números com vírgula seguidos de G (com ou sem espaço)
    const pesoMatch = lote.peso.match(/(\d{1,3},\d{2})\s*G/i)
    if (!pesoMatch) {
      console.log('❌ Peso não match:', lote.peso)
      return null
    }

    const pesoGramas = parseFloat(pesoMatch[1].replace(',', '.'))
    if (pesoGramas === 0 || Number.isNaN(pesoGramas)) {
      console.log('❌ Peso inválido após parse:', pesoGramas)
      return null
    }

    const valorNumerico = parseValor(lote.valorTotal)
    if (Number.isNaN(valorNumerico)) {
      console.log('❌ Valor inválido:', lote.valorTotal)
      return null
    }

    const valorPorGrama = valorNumerico / pesoGramas

    console.log('✅ Cálculo OK:', {
      peso: lote.peso,
      pesoGramas,
      valorTotal: lote.valorTotal,
      valorNumerico,
      valorPorGrama,
    })

    return {
      valorPorGrama: valorPorGrama.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
        minimumFractionDigits: 2,
      }),
      pesoGramas,
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 overflow-hidden">
      <Card className="shrink-0">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Pesquisar Lotes
          </CardTitle>
          <CardDescription>
            {lotesFiltrados.length} de {lotes.length} lotes encontrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Digite o número do lote, contrato ou descrição..."
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
            Catálogos com cálculo de valor por grama (quando disponível
            relatório)
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 overflow-auto">
          {lotesFiltrados.length === 0 ? (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              {searchTerm ? 'Nenhum lote encontrado' : 'Nenhum lote cadastrado'}
            </div>
          ) : (
            <div className="space-y-3">
              {lotesFiltrados.map((lote, idx) => {
                const calculo = calcularValorPorGrama(lote)
                const temRelatorio = !!lote.valorTotal

                return (
                  <Card key={`${lote.numeroLote}-${idx}`}>
                    <CardContent className="p-4">
                      {/* Header: Lote e Data */}
                      <div className="mb-3 flex items-start justify-between">
                        <div>
                          <p className="text-lg font-bold">
                            Lote {lote.numeroLote}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Contrato: {lote.numeroContrato}
                          </p>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {new Date(lote.dataLeilao).toLocaleDateString(
                            'pt-BR',
                          )}
                        </p>
                      </div>

                      {/* Descrição no centro */}
                      <div className="mb-4 rounded-md bg-muted/50 p-3">
                        <p className="text-sm">{lote.descricao}</p>
                      </div>

                      {/* Footer: Valores */}
                      {!temRelatorio ? (
                        <Alert
                          variant="destructive"
                          className="flex items-center gap-2 py-2"
                        >
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <AlertDescription className="text-xs">
                            Relatório indisponível para cálculo
                          </AlertDescription>
                        </Alert>
                      ) : !calculo ? (
                        <Alert className="flex items-center gap-2 py-2">
                          <AlertCircle className="h-4 w-4 shrink-0" />
                          <AlertDescription className="text-xs">
                            Peso inválido - não é possível calcular R$/g
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {/* Valor Total (esquerda) */}
                          <div>
                            <p className="text-xs text-muted-foreground">
                              Valor Total
                            </p>
                            <p className="font-semibold">{lote.valorTotal}</p>
                          </div>

                          {/* Peso (centro) */}
                          <div className="text-center">
                            <p className="text-xs text-muted-foreground">
                              Peso
                            </p>
                            <p className="font-semibold">
                              {lote.peso || 'N/A'}
                            </p>
                          </div>

                          {/* Valor por Grama (direita) */}
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">
                              R$ por Grama
                            </p>
                            <p className="font-bold text-primary">
                              {calculo.valorPorGrama}
                            </p>
                          </div>
                        </div>
                      )}
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
