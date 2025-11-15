import { jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'

export interface ThemeConfig {
  primaryColor: string
  colors: {
    // LIGHT MODE
    light: {
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
    // DARK MODE
    dark: {
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
  }
}

export const settings = pgTable('settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => 'default'),
  systemName: text('system_name').default('Leilão Caixa').notNull(),
  logoUrl: text('logo_url'),
  // Cores do tema como JSON
  theme: jsonb('theme').$type<ThemeConfig>().notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date())
    .notNull(),
})
