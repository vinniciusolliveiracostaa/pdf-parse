'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { updateTheme } from './actions'

interface ThemeEditorProps {
  primaryColor: string
}

const PRESET_COLORS = [
  { name: 'Azul', color: '#6366f1' },
  { name: 'Verde', color: '#10b981' },
  { name: 'Laranja', color: '#f59e0b' },
  { name: 'Rosa', color: '#ec4899' },
  { name: 'Roxo', color: '#8b5cf6' },
  { name: 'Vermelho', color: '#ef4444' },
  { name: 'Ciano', color: '#06b6d4' },
  { name: 'Amarelo', color: '#eab308' },
]

export function ThemeEditor({ primaryColor: initialColor }: ThemeEditorProps) {
  const [color, setColor] = useState(initialColor)
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    const result = await updateTheme(color)

    if (result.success) {
      toast.success('Tema atualizado com sucesso!')
      setTimeout(() => window.location.reload(), 500)
    } else {
      toast.error(result.error || 'Erro ao salvar tema')
    }
    setLoading(false)
  }

  return (
    <div className="space-y-6">
      {/* Color Picker */}
      <div className="space-y-3">
        <Label>Cor Principal</Label>
        <div className="flex gap-3 items-center">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-24 w-24 rounded-lg border-2 cursor-pointer"
          />
          <div className="flex-1 space-y-2">
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="w-full px-3 py-2 rounded-md border font-mono text-sm"
              placeholder="#6366f1"
            />
            <p className="text-xs text-muted-foreground">
              Todas as cores do sistema serão geradas automaticamente baseadas
              nesta cor
            </p>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-3">
        <Label>Cores Pré-definidas</Label>
        <div className="grid grid-cols-4 gap-2">
          {PRESET_COLORS.map((preset) => (
            <Button
              key={preset.name}
              onClick={() => setColor(preset.color)}
              className="flex flex-col items-center gap-2 p-3 rounded-lg border-2 hover:border-primary transition-colors"
              style={{
                borderColor:
                  color === preset.color ? 'var(--primary)' : 'transparent',
              }}
            >
              <div
                className="w-full h-12 rounded-md"
                style={{ backgroundColor: preset.color }}
              />
              <span className="text-xs font-medium">{preset.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <Button onClick={handleSave} disabled={loading} className="w-full">
        {loading ? 'Salvando...' : 'Aplicar Tema'}
      </Button>
    </div>
  )
}
