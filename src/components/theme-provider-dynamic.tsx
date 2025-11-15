'use client'

import { useTheme } from 'next-themes'
import { useEffect } from 'react'
import type { ThemeConfig } from '@/db/schema/settings'

interface DynamicThemeProviderProps {
  theme: ThemeConfig
  children: React.ReactNode
}

export function DynamicThemeProvider({
  theme,
  children,
}: DynamicThemeProviderProps) {
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const root = document.documentElement
    const isDark = resolvedTheme === 'dark'

    // Aplica as cores corretas (light ou dark) baseado no tema atual
    const colors = isDark ? theme.colors.dark : theme.colors.light

    Object.entries(colors).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value)
    })
  }, [theme, resolvedTheme])

  return <>{children}</>
}
