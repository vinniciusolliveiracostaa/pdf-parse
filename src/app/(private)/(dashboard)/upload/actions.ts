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

    if (!catalogoPdf || !relatorioPdf || !dataLicitacao) {
      return { success: false, error: 'Todos os campos são obrigatórios' }
    }

    // Converte Files para Buffer
    const catalogoBuffer = Buffer.from(await catalogoPdf.arrayBuffer())
    const relatorioBuffer = Buffer.from(await relatorioPdf.arrayBuffer())

    console.log('📄 Extraindo texto do catálogo...')
    const catalogoText = await extractTextFromPDF(catalogoBuffer)

    console.log('📄 Extraindo texto do relatório...')
    const relatorioText = await extractTextFromPDF(relatorioBuffer)

    console.log('🔍 Parsing do catálogo...')
    const catalogoItems = parseCatalogo(catalogoText)

    console.log('🔍 Parsing do relatório...')
    const relatorioItems = parseRelatorio(relatorioText)

    if (catalogoItems.length === 0) {
      return {
        success: false,
        error: 'Não foi possível extrair dados do catálogo',
      }
    }

    if (relatorioItems.length === 0) {
      return {
        success: false,
        error: 'Não foi possível extrair dados do relatório',
      }
    }

    console.log(`✅ Catálogo: ${catalogoItems.length} lotes encontrados`)
    console.log(
      `✅ Relatório: ${relatorioItems.length} arrematações encontradas`,
    )

    // Cria o leilão
    const leilaoId = uuidv7()
    await db.insert(leilao).values({
      id: leilaoId,
      dataLicitacao: dataLicitacao,
    })

    console.log('💾 Salvando catálogo no banco...')
    const catalogoCount = await saveCatalogoToDb(leilaoId, catalogoItems)

    console.log('💾 Salvando relatório no banco...')
    const relatorioCount = await saveRelatorioToDb(leilaoId, relatorioItems)

    console.log('🎉 Upload concluído com sucesso!')

    return {
      success: true,
      data: {
        leilaoId,
        catalogoCount,
        relatorioCount,
      },
    }
  } catch (error) {
    console.error('❌ Erro ao processar PDFs:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
