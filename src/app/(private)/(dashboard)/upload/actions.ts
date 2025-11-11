'use server'
import { uuidv7 } from 'uuidv7'
import { db } from '@/db/drizzle'
import { leilao } from '@/db/schema/leiloes'
import {
  parseCatalogo,
  saveCatalogoToDb,
} from '@/lib/pdf-parsers/catalogo-parser'
import { extractTextFromPDF } from '@/lib/pdf-parsers/pdf-extractor'
import {
  parseRelatorio,
  saveRelatorioToDb,
} from '@/lib/pdf-parsers/relatorio-parser'

export async function uploadPdfs(formData: FormData) {
  try {
    const catalogoPdf = formData.get('catalogo') as File
    const relatorioPdf = formData.get('relatorio') as File
    const dataLicitacao = formData.get('dataLicitacao') as string

    // 1. Validação simples e concisa
    if (!catalogoPdf || !relatorioPdf || !dataLicitacao) {
      return { success: false, error: 'Todos os campos são obrigatórios' }
    }

    // 2. Converção e Extração de Texto em Paralelo
    const catalogoBufferPromise = catalogoPdf.arrayBuffer().then(Buffer.from)
    const relatorioBufferPromise = relatorioPdf.arrayBuffer().then(Buffer.from)

    const [catalogoBuffer, relatorioBuffer] = await Promise.all([
      catalogoBufferPromise,
      relatorioBufferPromise,
    ])

    const [catalogoText, relatorioText] = await Promise.all([
      extractTextFromPDF(catalogoBuffer),
      extractTextFromPDF(relatorioBuffer),
    ])

    if (relatorioText.length < 50) {
      return {
        success: false,
        error: 'Falha na extração de texto do relatório.',
      }
    }

    // 3. Parsing em Paralelo
    const [catalogoItems, relatorioItems] = await Promise.all([
      parseCatalogo(catalogoText),
      parseRelatorio(relatorioText),
    ])

    if (catalogoItems.length === 0) {
      return {
        success: false,
        error: 'Não foi possível extrair lotes do catálogo',
      }
    }

    if (relatorioItems.length === 0) {
      return {
        success: false,
        error: 'Não foi possível extrair arrematações do relatório',
      }
    }

    // 4. Inserção no Banco de Dados
    const leilaoId = uuidv7()

    // Insere o leilão
    await db.insert(leilao).values({
      id: leilaoId,
      dataLicitacao: dataLicitacao,
    })

    // Salvando dados do catálogo e relatório em paralelo
    const [catalogoCount, relatorioCount] = await Promise.all([
      saveCatalogoToDb(leilaoId, catalogoItems),
      saveRelatorioToDb(leilaoId, relatorioItems),
    ])

    return {
      success: true,
      data: {
        leilaoId,
        catalogoCount,
        relatorioCount,
      },
    }
  } catch (error) {
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao processar arquivos.',
    }
  }
}

export async function deleteLeilao(leilaoId: string) {
  const { eq } = await import('drizzle-orm')
  const { headers } = await import('next/headers')
  const { auth } = await import('@/lib/auth')
  const { account } = await import('@/db/schema/accounts')
  const { catalogo, relatorio } = await import('@/db/schema/leiloes')
  const { cache } = await import('@/lib/cache')

  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session) {
      return { success: false, error: 'Não autenticado' }
    }

    const [userAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, session.user.id))
      .limit(1)

    if (!userAccount || userAccount.role !== 'ADMIN') {
      return {
        success: false,
        error: 'Permissão negada. Apenas admins podem excluir leilões.',
      }
    }

    await db.delete(catalogo).where(eq(catalogo.leilaoId, leilaoId))
    await db.delete(relatorio).where(eq(relatorio.leilaoId, leilaoId))
    await db.delete(leilao).where(eq(leilao.id, leilaoId))

    await cache.delPattern('leiloes:*')
    await cache.delPattern('catalogos:*')
    await cache.delPattern('relatorios:*')
    await cache.del('stats:dashboard')

    return { success: true }
  } catch (error) {
    console.error('Erro ao deletar leilão:', error)
    return { success: false, error: 'Erro ao excluir leilão' }
  }
}
