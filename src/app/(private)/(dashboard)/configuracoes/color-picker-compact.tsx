'use client'

import { Palette } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { updateThemeColor } from './actions'

interface ColorPickerCompactProps {
  currentColor: string
}

const PRESET_COLORS = [
  { name: 'Azul', value: '#3b82f6' },
  { name: 'Roxo', value: '#8b5cf6' },
  { name: 'Verde', value: '#10b981' },
  { name: 'Laranja', value: '#f59e0b' },
  { name: 'Vermelho', value: '#ef4444' },
  { name: 'Rosa', value: '#ec4899' },
  { name: 'Ciano', value: '#06b6d4' },
  { name: 'Índigo', value: '#6366f1' },
]

export function ColorPickerCompact({ currentColor }: ColorPickerCompactProps) {
  const [color, setColor] = useState(currentColor)
  const [isUpdating, setIsUpdating] = useState(false)

  const handleChange = async (newColor: string) => {
    setColor(newColor)
    setIsUpdating(true)
    try {
      await updateThemeColor(newColor)
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-2">
      <Label>Cor do Tema</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start gap-2"
            type="button"
            disabled={isUpdating}
          >
            <div
              className="h-5 w-5 shrink-0 rounded border"
              style={{ backgroundColor: color }}
            />
            <span className="flex-1 truncate font-mono text-sm">{color}</span>
            <Palette className="h-4 w-4 shrink-0" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Cores Predefinidas</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleChange(preset.value)}
                    className="group relative h-10 w-full rounded-md border-2 transition-all hover:scale-110"
                    style={{
                      backgroundColor: preset.value,
                      borderColor:
                        color === preset.value
                          ? 'hsl(var(--foreground))'
                          : 'transparent',
                    }}
                    title={preset.name}
                    disabled={isUpdating}
                  >
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="custom-color" className="text-xs">
                Cor Personalizada
              </Label>
              <div className="mt-2">
                <input
                  id="custom-color"
                  type="color"
                  value={color}
                  onChange={(e) => handleChange(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded border"
                  disabled={isUpdating}
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
