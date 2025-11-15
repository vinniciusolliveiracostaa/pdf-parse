'use client'

import { Check, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updateTheme } from './actions' // 👈 Ação trocada para updateTheme

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
  // 👇 Estado simplificado
  const [color, setColor] = useState(currentColor)
  const [loading, setLoading] = useState(false)

  // 👇 Lógica de salvar do ThemeEditor
  const handleSave = async () => {
    setLoading(true)
    const result = await updateTheme(color) // Usa o estado 'color'

    if (result.success) {
      toast.success('Tema atualizado com sucesso!')
      setTimeout(() => window.location.reload(), 500) // 👈 Recarrega
    } else {
      toast.error(result.error || 'Erro ao salvar tema') // 👈 Mensagem padronizada
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
          {presetColors.map((preset) => (
            <button
              key={preset.value}
              disabled={loading}
              onClick={() => setColor(preset.value)} // 👈 Só muda o estado
              className="group relative h-12 w-12 rounded-md border-2 transition-all hover:scale-110 disabled:cursor-not-allowed disabled:opacity-50"
              style={{
                backgroundColor: preset.value,
                borderColor:
                  color === preset.value ? preset.value : 'transparent', // 👈 Usa 'color'
              }}
              type="button"
              title={preset.name}
            >
              {color === preset.value && ( // 👈 Usa 'color'
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
            value={color} // 👈 Usa 'color'
            onChange={(e) => setColor(e.target.value)} // 👈 Usa 'setColor'
            className="h-10 w-20 cursor-pointer"
            disabled={loading}
          />
          <Input
            type="text"
            value={color} // 👈 Usa 'color'
            onChange={(e) => setColor(e.target.value)} // 👈 Usa 'setColor'
            placeholder="#3b82f6"
            className="flex-1 font-mono"
            disabled={loading}
          />
          <Button
            onClick={handleSave} // 👈 Chama handleSave
            disabled={loading} // 👈 Desabilitado só com loading
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