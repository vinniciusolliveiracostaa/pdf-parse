'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { db } from '@/db/drizzle'
import { settings, type ThemeConfig } from '@/db/schema/settings'
import { auth } from '@/lib/auth'
import {
  DEFAULT_THEME,
  generateThemeFromPrimaryColor,
} from '@/lib/theme-generator'

export async function getSettings() {
  const result = await db.select().from(settings).limit(1)

  if (result.length === 0) {
    // cria a configuração padrão se não existir
    const [newSettings] = await db
      .insert(settings)
      .values({
        id: 'default',
        theme: DEFAULT_THEME,
      })
      .returning()
    return newSettings
  }

  return result[0]
}

export async function updateTheme(primaryColor: string) {
  try {
    const theme = generateThemeFromPrimaryColor(primaryColor)

    await db
      .update(settings)
      .set({
        theme,
        updatedAt: new Date(),
      })
      .where(eq(settings.id, 'default'))

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error updating theme colors:', error)
    return { success: false, error: 'Erro ao atualizar as cores do tema' }
  }
}

export async function updateSystemInfo(data: {
  systemName: string
  logoUrl?: string
}) {
  try {
    await db
      .update(settings)
      .set({
        systemName: data.systemName,
        logoUrl: data.logoUrl || null,
        updatedAt: new Date(),
      })
      .where(eq(settings.id, 'default'))

    revalidatePath('/', 'layout')
    return { success: true }
  } catch (error) {
    console.error('Error updating system info:', error)
    return {
      success: false,
      error: 'Erro ao atualizar as informações do sistema',
    }
  }
}
