'use server'

import { eq } from 'drizzle-orm'
import { headers } from 'next/headers'
import { db } from '@/db/drizzle'
import { user } from '@/db/schema/users'
import { auth } from '@/lib/auth'

export async function updateProfile(formData: FormData) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return { success: false, error: 'Não autenticado' }
    }

    const name = formData.get('name') as string
    const email = formData.get('email') as string

    if (!name || !email) {
      return { success: false, error: 'Nome e email são obrigatórios' }
    }

    await db
      .update(user)
      .set({
        name,
        email,
        updatedAt: new Date(),
      })
      .where(eq(user.id, session.user.id))

    return { success: true }
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
