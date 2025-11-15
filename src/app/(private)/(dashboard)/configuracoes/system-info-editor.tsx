'use client'

import Image from 'next/image'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateSystemInfo } from './actions'

interface SystemInfoEditorProps {
  systemName: string
  logoUrl?: string
}

export function SystemInfoEditor({
  systemName: initialName,
  logoUrl: initialLogo,
}: SystemInfoEditorProps) {
  const [systemName, setSystemName] = useState(initialName)
  const [logoUrl, setLogoUrl] = useState(initialLogo || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const result = await updateSystemInfo({
      systemName,
      logoUrl: logoUrl || undefined,
    })

    if (result.success) {
      toast.success('Informações atualizadas!')
      window.location.reload()
    } else {
      toast.error(result.error || 'Erro ao salvar')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="systemName">Nome do Sistema</Label>
        <Input
          id="systemName"
          value={systemName}
          onChange={(e) => setSystemName(e.target.value)}
          placeholder="Leilão Caixa"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="logoUrl">URL do Logo</Label>
        <Input
          id="logoUrl"
          value={logoUrl}
          onChange={(e) => setLogoUrl(e.target.value)}
          placeholder="https://..."
        />
        <p className="text-xs text-muted-foreground">
          Cole a URL de uma imagem para usar como logo
        </p>
      </div>

      {logoUrl && (
        <div className="rounded-lg border p-4 flex items-center justify-center bg-muted/30">
          <Image
            src={logoUrl}
            alt="Logo preview"
            className="max-h-20 object-contain"
          />
        </div>
      )}

      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Salvando...' : 'Salvar Informações'}
      </Button>
    </div>
  )
}
