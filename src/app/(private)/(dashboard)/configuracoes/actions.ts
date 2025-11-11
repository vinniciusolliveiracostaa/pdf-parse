'use server'

import { eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'
import { headers } from 'next/headers'
import { db } from '@/db/drizzle'
import { settings } from '@/db/schema/settings'
import { auth } from '@/lib/auth'

export async function updateThemeColor(color: string) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return { success: false, error: 'Não autenticado' }
    }

    const userAccount = await db.query.account.findFirst({
      where: (accounts, { eq }) => eq(accounts.userId, session.user.id),
    })

    if (userAccount?.role !== 'ADMIN') {
      return { success: false, error: 'Sem permissão' }
    }

    if (!color || !color.startsWith('#')) {
      return { success: false, error: 'Cor inválida (use formato #RRGGBB)' }
    }

    const existingSettings = await db.query.settings.findFirst()

    if (existingSettings) {
      await db
        .update(settings)
        .set({
          primaryColor: color,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existingSettings.id))
    } else {
      await db.insert(settings).values({
        id: 'default',
        primaryColor: color,
      })
    }

    // Revalidar todas as páginas para aplicar o novo tema
    revalidatePath('/', 'layout')

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar cor:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}

export async function updateSystemName(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return { success: false, error: 'Não autenticado' }
    }

    const userAccount = await db.query.account.findFirst({
      where: (accounts, { eq }) => eq(accounts.userId, session.user.id),
    })

    if (userAccount?.role !== 'ADMIN') {
      return { success: false, error: 'Sem permissão' }
    }

    const systemName = formData.get('systemName') as string

    if (!systemName) {
      return { success: false, error: 'Nome do sistema é obrigatório' }
    }

    const existingSettings = await db.query.settings.findFirst()

    if (existingSettings) {
      await db
        .update(settings)
        .set({
          systemName,
          updatedAt: new Date(),
        })
        .where(eq(settings.id, existingSettings.id))
    } else {
      await db.insert(settings).values({
        id: 'default',
        systemName,
      })
    }

    revalidatePath('/configuracoes')
    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar nome do sistema:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
