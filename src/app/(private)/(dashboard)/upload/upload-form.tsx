'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadPdfs } from './actions'

export function UploadForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await uploadPdfs(formData)

    if (result.success) {
      toast.success(
        `PDFs processados! Catálogo: ${result.data?.catalogoCount} itens, Relatório: ${result.data?.relatorioCount} registros`,
      )
      router.refresh()
      ;(e.target as HTMLFormElement).reset()
    } else {
      toast.error(result.error || 'Erro ao processar PDFs')
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
        <p className="text-xs text-muted-foreground">
          LOTE, CONTRATO, DESCRIÇÃO, VALOR, ANOTAÇÕES
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="relatorio">Relatório (PDF)</Label>
        <Input
          id="relatorio"
          name="relatorio"
          type="file"
          accept=".pdf"
          required
          disabled={loading}
        />
        <p className="text-xs text-muted-foreground">
          CPF/CNPJ, LOTE, VALOR LANCE, TARIFA, TOTAL
        </p>
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Processando...' : 'Upload e Processar'}
      </Button>
    </form>
  )
}
