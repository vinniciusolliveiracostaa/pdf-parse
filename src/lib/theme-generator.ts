import { oklch, parse } from 'culori'

export interface ThemeColors {
  background: string
  foreground: string
  card: string
  'card-foreground': string
  popover: string
  'popover-foreground': string
  primary: string
  'primary-foreground': string
  secondary: string
  'secondary-foreground': string
  muted: string
  'muted-foreground': string
  accent: string
  'accent-foreground': string
  destructive: string
  'destructive-foreground': string
  border: string
  input: string
  ring: string
  'chart-1': string
  'chart-2': string
  'chart-3': string
  'chart-4': string
  'chart-5': string
  sidebar: string
  'sidebar-foreground': string
  'sidebar-primary': string
  'sidebar-primary-foreground': string
  'sidebar-accent': string
  'sidebar-accent-foreground': string
  'sidebar-border': string
  'sidebar-ring': string
}

export interface ThemeConfig {
  primaryColor: string
  colors: {
    light: ThemeColors
    dark: ThemeColors
  }
}

/**
 * Gera um tema completo (light + dark) baseado em uma única cor primária
 */
export function generateThemeFromPrimaryColor(primaryHex: string): ThemeConfig {
  const primary = parse(primaryHex)
  if (!primary) throw new Error('Cor inválida')

  const primaryOklch = oklch(primary)
  if (!primaryOklch) throw new Error('Erro ao converter cor')

  const { l: pL, c: pC, h: pH } = primaryOklch

  const toOklch = (l: number, c: number, h: number) => {
    return `oklch(${l.toFixed(3)} ${c.toFixed(3)} ${h.toFixed(3)})`
  }

  // Gera 5 variações para charts
  const chartColors = Array.from({ length: 5 }, (_, i) => {
    const factor = 1 - i * 0.15
    return toOklch(Math.max(0.4, pL * factor), pC * (1 - i * 0.05), pH || 264)
  })

  return {
    primaryColor: primaryHex,
    colors: {
      // LIGHT MODE
      light: {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0.141 0.005 285.823)',
        card: 'oklch(1 0 0)',
        'card-foreground': 'oklch(0.141 0.005 285.823)',
        popover: 'oklch(1 0 0)',
        'popover-foreground': 'oklch(0.141 0.005 285.823)',
        primary: toOklch(pL, pC, pH || 264),
        'primary-foreground': toOklch(0.97, 0.014, (pH || 264) - 10),
        secondary: 'oklch(0.967 0.001 286.375)',
        'secondary-foreground': 'oklch(0.21 0.006 285.885)',
        muted: 'oklch(0.967 0.001 286.375)',
        'muted-foreground': 'oklch(0.552 0.016 285.938)',
        accent: 'oklch(0.967 0.001 286.375)',
        'accent-foreground': 'oklch(0.21 0.006 285.885)',
        destructive: 'oklch(0.577 0.245 27.325)',
        'destructive-foreground': 'oklch(0.985 0 0)',
        border: 'oklch(0.92 0.004 286.32)',
        input: 'oklch(0.92 0.004 286.32)',
        ring: 'oklch(0.708 0 0)',
        'chart-1': chartColors[0],
        'chart-2': chartColors[1],
        'chart-3': chartColors[2],
        'chart-4': chartColors[3],
        'chart-5': chartColors[4],
        sidebar: 'oklch(0.985 0 0)',
        'sidebar-foreground': 'oklch(0.141 0.005 285.823)',
        'sidebar-primary': toOklch(pL * 0.9, pC * 0.9, pH || 264),
        'sidebar-primary-foreground': toOklch(0.97, 0.014, (pH || 264) - 10),
        'sidebar-accent': 'oklch(0.967 0.001 286.375)',
        'sidebar-accent-foreground': 'oklch(0.21 0.006 285.885)',
        'sidebar-border': 'oklch(0.92 0.004 286.32)',
        'sidebar-ring': 'oklch(0.708 0 0)',
      },
      // DARK MODE
      dark: {
        background: 'oklch(0.141 0.005 285.823)',
        foreground: 'oklch(0.985 0 0)',
        card: 'oklch(0.21 0.006 285.885)',
        'card-foreground': 'oklch(0.985 0 0)',
        popover: 'oklch(0.21 0.006 285.885)',
        'popover-foreground': 'oklch(0.985 0 0)',
        primary: toOklch(pL, pC, pH || 264),
        'primary-foreground': toOklch(0.97, 0.014, (pH || 264) - 10),
        secondary: 'oklch(0.274 0.006 286.033)',
        'secondary-foreground': 'oklch(0.985 0 0)',
        muted: 'oklch(0.274 0.006 286.033)',
        'muted-foreground': 'oklch(0.705 0.015 286.067)',
        accent: 'oklch(0.274 0.006 286.033)',
        'accent-foreground': 'oklch(0.985 0 0)',
        destructive: 'oklch(0.704 0.191 22.216)',
        'destructive-foreground': 'oklch(0.985 0 0)',
        border: 'oklch(1 0 0 / 10%)',
        input: 'oklch(1 0 0 / 15%)',
        ring: 'oklch(0.556 0 0)',
        'chart-1': chartColors[0],
        'chart-2': chartColors[1],
        'chart-3': chartColors[2],
        'chart-4': chartColors[3],
        'chart-5': chartColors[4],
        sidebar: 'oklch(0.21 0.006 285.885)',
        'sidebar-foreground': 'oklch(0.985 0 0)',
        'sidebar-primary': toOklch(Math.min(0.8, pL * 1.2), pC, pH || 264),
        'sidebar-primary-foreground': toOklch(0.97, 0.014, (pH || 264) - 10),
        'sidebar-accent': 'oklch(0.274 0.006 286.033)',
        'sidebar-accent-foreground': 'oklch(0.985 0 0)',
        'sidebar-border': 'oklch(1 0 0 / 10%)',
        'sidebar-ring': 'oklch(0.439 0 0)',
      },
    },
  }
}

export const DEFAULT_THEME = generateThemeFromPrimaryColor('#6366f1')
