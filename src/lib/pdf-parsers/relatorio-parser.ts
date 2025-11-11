import { uuidv7 } from 'uuidv7'
import { db } from '@/db/drizzle'
import { relatorio } from '@/db/schema/leiloes'

export interface RelatorioData {
  CPF_CNPJ?: string
  NUMERO_LOTE: string
  VALOR_LANCE: string
  TARIFA: string
  TOTAL: string
}

/**
 * Limpa e formata CPF/CNPJ
 */
function formatCpfCnpj(cpfCnpj: string): string {
  return cpfCnpj.trim().replace(/\s+/g, '')
}

/**
 * Parser linha por linha para relatório
 */
function parseRelatorioContent(rawText: string): RelatorioData[] {
  const allData: RelatorioData[] = []

  const cleanedText = rawText
    .replace(/CAIXA ECONÔMICA FEDERAL[\s\S]*?Data Atual:.*?\d+:/g, '')
    .replace(
      /C\.P\.F\/C\.N\.PJ\s+Número Lote\s+Valor Lance\s+Tarifa Arrematação\s+Total/g,
      '',
    )
    .replace(/Matrícula:.*?Data da Licitação:.*?\d+\/\d+\/\d+/g, '')
    .replace(/Alô CAIXA:.*?Ouvidoria:.*?\d+/g, '')
    .replace(/\(\d+\)\s+[\d.]+Total/g, '')

  const lines = cleanedText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const cpfCnpjPattern =
    /^\d{3}\.\d{3}\.XXX-\d{2}$|^\d{3}\.\d{2}X\.XXX-\d{2}$|^\d{2}\.\d{3}\.XXX\/\d{4}-\d{2}$/
  const lotePattern = /^\d{4}\.\d{6}-\d$/

  let currentCpfCnpj = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (
      line.includes('Sipen - Sistema') ||
      line.includes('Relatório de Apuração') ||
      line.includes('P.V. ') ||
      line.length < 5
    ) {
      continue
    }

    if (cpfCnpjPattern.test(line)) {
      currentCpfCnpj = formatCpfCnpj(line)
      continue
    }

    if (lotePattern.test(line.split(/\s+/)[0])) {
      const parts = line.split(/\s+/)

      if (parts.length >= 4) {
        allData.push({
          CPF_CNPJ: currentCpfCnpj || undefined,
          NUMERO_LOTE: parts[0],
          VALOR_LANCE: parts[1],
          TARIFA: parts[2],
          TOTAL: parts[3],
        })
      }
    }
  }

  return allData
}

/**
 * Parser alternativo usando regex
 */
function parseRelatorioContentRegex(rawText: string): RelatorioData[] {
  const allData: RelatorioData[] = []

  const content = rawText
    .replace(/CAIXA ECONÔMICA FEDERAL[\s\S]*?Total/m, '')
    .replace(/Alô CAIXA:[\s\S]*$/g, '')

  const cpfCnpjPattern =
    /(\d{3}\.\d{3}\.XXX-\d{2}|\d{3}\.\d{2}X\.XXX-\d{2}|\d{2}\.\d{3}\.XXX\/\d{4}-\d{2})/g
  const blocks = content
    .split(cpfCnpjPattern)
    .filter((b) => b.trim().length > 0)

  let currentCpfCnpj = ''

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i].trim()

    if (
      /^\d{3}\.\d{3}\.XXX-\d{2}$|^\d{3}\.\d{2}X\.XXX-\d{2}$|^\d{2}\.\d{3}\.XXX\/\d{4}-\d{2}$/.test(
        block,
      )
    ) {
      currentCpfCnpj = formatCpfCnpj(block)
      continue
    }

    if (currentCpfCnpj) {
      const lines = block
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.length > 0)

      for (const line of lines) {
        if (
          line.includes('Total') ||
          line.includes('Matrícula') ||
          line.includes('Data da Licitação') ||
          line.length < 10
        ) {
          continue
        }

        const match = line.match(
          /^(\d{4}\.\d{6}-\d)\s+([\d.,]+)\s+([\d.,]+)\s+([\d.,]+)/,
        )

        if (match) {
          allData.push({
            CPF_CNPJ: currentCpfCnpj,
            NUMERO_LOTE: match[1],
            VALOR_LANCE: match[2],
            TARIFA: match[3],
            TOTAL: match[4],
          })
        }
      }
    }
  }

  return allData
}

/**
 * Função principal de parsing do relatório
 */
export function parseRelatorio(rawText: string): RelatorioData[] {
  let registros = parseRelatorioContent(rawText)

  if (registros.length === 0) {
    registros = parseRelatorioContentRegex(rawText)
  }

  return registros
}

/**
 * Insere dados do relatório no banco de dados
 */
export async function saveRelatorioToDb(
  leilaoId: string,
  relatorioData: RelatorioData[],
) {
  const records = relatorioData.map((item) => ({
    id: uuidv7(),
    leilaoId,
    cpfCnpj: item.CPF_CNPJ || null,
    numeroLote: item.NUMERO_LOTE,
    valorLance: item.VALOR_LANCE,
    tarifa: item.TARIFA,
    total: item.TOTAL,
  }))

  await db.insert(relatorio).values(records)

  return records.length
}