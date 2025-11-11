'use client'

import { useEffect } from 'react'

interface ThemeCustomizerProps {
  primaryColor: string
}

export function ThemeCustomizer({ primaryColor }: ThemeCustomizerProps) {
  useEffect(() => {
    const root = document.documentElement

    // Converte hex para OKLCH (formato usado pelo shadcn v4)
    const hexToOKLCH = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!result) return null

      // Converte hex para RGB (0-1)
      const r = parseInt(result[1], 16) / 255
      const g = parseInt(result[2], 16) / 255
      const b = parseInt(result[3], 16) / 255

      // Gamma correction para linearizar RGB
      const toLinear = (c: number) =>
        c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4

      const rLin = toLinear(r)
      const gLin = toLinear(g)
      const bLin = toLinear(b)

      // RGB linear para XYZ
      const x = 0.4124564 * rLin + 0.3575761 * gLin + 0.1804375 * bLin
      const y = 0.2126729 * rLin + 0.7151522 * gLin + 0.072175 * bLin
      const z = 0.0193339 * rLin + 0.119192 * gLin + 0.9503041 * bLin

      // XYZ para OKLab
      const l_ = Math.cbrt(
        0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z,
      )
      const m_ = Math.cbrt(
        0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z,
      )
      const s_ = Math.cbrt(
        0.0482003018 * x + 0.2643662691 * y + 0.633851707 * z,
      )

      const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
      const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
      const b_ = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_

      // OKLab para OKLCH
      const C = Math.sqrt(a * a + b_ * b_)
      let H = (Math.atan2(b_, a) * 180) / Math.PI
      if (H < 0) H += 360

      return {
        l: Number(L.toFixed(3)),
        c: Number(C.toFixed(3)),
        h: Number(H.toFixed(3)),
      }
    }

    const oklch = hexToOKLCH(primaryColor)

    if (oklch) {
      // Define a cor primary em formato OKLCH
      root.style.setProperty(
        '--primary',
        `oklch(${oklch.l} ${oklch.c} ${oklch.h})`,
      )

      // Define a cor primary-foreground (contraste automático)
      // Se L > 0.6 (cor clara), usa texto escuro, senão usa texto claro
      const foregroundL = oklch.l > 0.6 ? 0.141 : 0.97
      const foregroundC = oklch.l > 0.6 ? 0.005 : 0.014
      const foregroundH = oklch.l > 0.6 ? 285.823 : 254.604
      root.style.setProperty(
        '--primary-foreground',
        `oklch(${foregroundL} ${foregroundC} ${foregroundH})`,
      )

      // Atualiza também sidebar-primary para consistência
      root.style.setProperty(
        '--sidebar-primary',
        `oklch(${oklch.l} ${oklch.c} ${oklch.h})`,
      )

      // Atualiza chart colors baseados na primary (variações de luminosidade)
      const chartColors = [
        { l: Math.min(oklch.l + 0.32, 0.99), c: oklch.c * 0.43 },
        { l: Math.min(oklch.l + 0.13, 0.99), c: oklch.c * 0.88 },
        { l: Math.min(oklch.l + 0.06, 0.99), c: oklch.c },
        { l: oklch.l, c: oklch.c },
        { l: Math.max(oklch.l - 0.06, 0.1), c: oklch.c * 0.82 },
      ]

      chartColors.forEach((color, i) => {
        root.style.setProperty(
          `--chart-${i + 1}`,
          `oklch(${color.l.toFixed(3)} ${color.c.toFixed(3)} ${oklch.h})`,
        )
      })
    }
  }, [primaryColor])

  return null
}
