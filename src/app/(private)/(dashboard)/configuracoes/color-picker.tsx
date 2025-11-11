'use client'

import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateThemeColor } from './actions'

const presetColors = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Laranja', value: '#f59e0b' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Índigo', value: '#6366f1' },
]

interface ColorPickerProps {
  currentColor: string
}

export function ColorPicker({ currentColor }: ColorPickerProps) {
  const [selectedColor, setSelectedColor] = useState(currentColor)
  const [customColor, setCustomColor] = useState(currentColor)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (color: string) => {
    setLoading(true)

    const result = await updateThemeColor(color)

    if (result.success) {
      toast.success('Cor atualizada com sucesso!')
      setSelectedColor(color)
    } else {
      toast.error(result.error || 'Erro ao atualizar cor')
    }

    setLoading(false)
  }

  return (
    <div className="space-y-4">
      <div>
        <Label className="mb-3 block text-sm font-medium">
          Cores predefinidas
        </Label>
        <div className="grid grid-cols-4 gap-3 @md/main:grid-cols-8">
          {presetColors.map((color) => (
            <button
              key={color.value}
              disabled={loading}
              onClick={() => handleSubmit(color.value)}
              className="group relative h-12 w-12 rounded-md border-2 transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: color.value,
                borderColor:
                  selectedColor === color.value ? color.value : 'transparent',
              }}
              type="button"
              title={color.name}
            >
              {selectedColor === color.value && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Check className="h-5 w-5 text-white drop-shadow-lg" />
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="custom-color" className="text-sm font-medium">
          Cor personalizada
        </Label>
        <div className="flex gap-2">
          <Input
            id="custom-color"
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="h-10 w-20 cursor-pointer"
            disabled={loading}
          />
          <Input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="#3b82f6"
            className="flex-1 font-mono"
            disabled={loading}
          />
          <Button
            onClick={() => handleSubmit(customColor)}
            disabled={loading || customColor === selectedColor}
            size="sm"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              'Aplicar'
            )}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground">
          Digite um código hexadecimal ou use o seletor de cores
        </p>
      </div>
    </div>
  )
}
