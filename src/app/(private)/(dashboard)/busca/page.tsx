'use client'

import { Search } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { buscarLote, type LoteResult } from './actions'

export default function BuscaPage() {
  const [termo, setTermo] = useState('')
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<LoteResult[]>([])
  const [error, setError] = useState('')

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResults([])

    const result = await buscarLote(termo)

    if (result.success) {
      setResults(result.data || [])
    } else {
      setError(result.error || 'Erro ao buscar')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Buscar Lote</CardTitle>
          <CardDescription>
            Busque por número do lote ou nome do item para ver os cálculos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="flex gap-2 mb-6">
            <Input
              placeholder="Ex: 0235.000186-0 ou ANEL"
              value={termo}
              onChange={(e) => setTermo(e.target.value)}
              disabled={loading}
            />
            <Button type="submit" disabled={loading}>
              <Search className="mr-2 h-4 w-4" />
              {loading ? 'Buscando...' : 'Buscar'}
            </Button>
          </form>

          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md mb-4">
              {error}
            </div>
          )}

          {results.length > 0 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                {results.length} resultado(s) encontrado(s)
              </p>
              {results.map((item, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="text-lg">Lote {item.lote}</CardTitle>
                    <CardDescription>Contrato: {item.contrato}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <strong>Descrição:</strong>
                      <p className="text-sm mt-1">{item.descricao}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-2">
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Valor (Catálogo)
                        </p>
                        <p className="font-semibold">{item.valor}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">
                          Total (Relatório)
                        </p>
                        <p className="font-semibold">{item.total}</p>
                      </div>
                      {item.peso && (
                        <>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Peso
                            </p>
                            <p className="font-semibold">{item.peso}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">
                              Valor por Grama
                            </p>
                            <p className="font-semibold text-primary">
                              {item.valorPorGrama || 'N/A'}
                            </p>
                          </div>
                        </>
                      )}
                    </div>

                    {item.anotacoes && (
                      <div className="pt-2">
                        <strong className="text-sm">Anotações:</strong>
                        <p className="text-sm text-muted-foreground mt-1">
                          {item.anotacoes}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
