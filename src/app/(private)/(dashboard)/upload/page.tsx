'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadPdfs } from './actions'

export default function UploadPage() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await uploadPdfs(formData)

    if (result.success) {
      toast.success(
        `PDFs processados com sucesso! Catálogo: ${result.data?.catalogoCount} itens, Relatório: ${result.data?.relatorioCount} registros`,
      )
      router.push('/')
    } else {
      toast.error(result.error || 'Erro ao processar PDFs')
    }

    setLoading(false)
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload de PDFs do Leilão</CardTitle>
          <CardDescription>
            Faça upload do catálogo e relatório de arrematantes para processar
            os dados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="dataLicitacao">Data da Licitação</Label>
              <Input
                id="dataLicitacao"
                name="dataLicitacao"
                type="date"
                required
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="catalogo">Catálogo (PDF)</Label>
              <Input
                id="catalogo"
                name="catalogo"
                type="file"
                accept=".pdf"
                required
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Contém: LOTE, CONTRATO, DESCRIÇÃO, VALOR, ANOTAÇÕES
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relatorio">Relatório de Arrematantes (PDF)</Label>
              <Input
                id="relatorio"
                name="relatorio"
                type="file"
                accept=".pdf"
                required
                disabled={loading}
              />
              <p className="text-sm text-muted-foreground">
                Contém: CPF/CNPJ, NÚMERO DO LOTE, VALOR LANCE, TARIFA, TOTAL
              </p>
            </div>

            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Processando...' : 'Upload e Processar PDFs'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
