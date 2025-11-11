'use server'

import { db } from '@/db/drizzle'
import { catalogo, relatorio } from '@/db/schema/leiloes'
import { eq, or, like } from 'drizzle-orm'

export interface LoteResult {
  lote: string
  contrato: string
  descricao: string
  valor: string
  peso?: string
  total: string
  valorPorGrama?: string
  anotacoes?: string
}

/**
 * Converte valor em formato brasileiro para número
 */
function parseValor(valor: string): number {
  return parseFloat(valor.replace('R$', '').replace(/\./g, '').replace(',', '.').trim())
}

/**
 * Converte peso (ex: 4,96G) para número
 */
function parsePeso(peso: string): number {
  return parseFloat(peso.replace('G', '').replace(',', '.').trim())
}

/**
 * Formata número para moeda brasileira
 */
function formatMoeda(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export async function buscarLote(termo: string) {
  try {
    if (!termo || termo.trim().length < 3) {
      return { success: false, error: 'Digite pelo menos 3 caracteres para buscar' }
    }

    // Busca no catálogo por número do lote ou descrição
    const catalogoResults = await db
      .select()
      .from(catalogo)
      .where(
        or(
          like(catalogo.lote, `%${termo}%`),
          like(catalogo.descricao, `%${termo}%`)
        )
      )
      .limit(50)

    if (catalogoResults.length === 0) {
      return { success: false, error: 'Nenhum lote encontrado' }
    }

    // Para cada item do catálogo, busca o total no relatório
    const results: LoteResult[] = []

    for (const item of catalogoResults) {
      const relatorioItem = await db
        .select()
        .from(relatorio)
        .where(eq(relatorio.numeroLote, item.lote))
        .limit(1)

      const total = relatorioItem[0]?.total || item.valor

      let valorPorGrama: string | undefined

      // Calcula valor por grama se houver peso
      if (item.peso) {
        try {
          const pesoNum = parsePeso(item.peso)
          const totalNum = parseValor(total)

          if (pesoNum > 0) {
            const valorGrama = totalNum / pesoNum
            valorPorGrama = formatMoeda(valorGrama)
          }
        } catch (error) {
          console.error('Erro ao calcular valor por grama:', error)
        }
      }

      results.push({
        lote: item.lote,
        contrato: item.contrato,
        descricao: item.descricao,
        valor: item.valor,
        peso: item.peso || undefined,
        total,
        valorPorGrama,
        anotacoes: item.anotacoes || undefined,
      })
    }

    return { success: true, data: results }
  } catch (error) {
    console.error('Erro na busca:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido',
    }
  }
}
