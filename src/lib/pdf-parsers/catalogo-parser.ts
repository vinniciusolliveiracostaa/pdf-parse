import { uuidv7 } from 'uuidv7'
import { db } from '@/db/drizzle'
import { catalogo } from '@/db/schema/leiloes'

export interface CatalogoData {
  LOTE: string
  CONTRATO: string
  DESCRIÇÃO: string
  VALOR: string
  ANOTAÇÕES: string
  PESO?: string
}

/**
 * Extrai o peso da descrição usando regex
 * Busca padrão: X,XXG (sempre duas casas decimais antes do G)
 */
export function extractPeso(descricao: string): string | undefined {
  const pesoMatch = descricao.match(/(\d+,\d{2})\s*G/i) 
  return pesoMatch ? `${pesoMatch[1]}G` : undefined
}

/**
 * Parser linha por linha para catálogo
 */
function parsePdfContent(rawText: string): CatalogoData[] {
  const allLots: CatalogoData[] = []

  const cleanedText = rawText
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
    .replace(/LOTE\s*\/\s*CONTRATO\s+ANOTAÇÕES\s+VALOR\s+DESCRIÇÃO/g, '')
    .replace(/LOTE\s*\/\s*CONTRATO\s+DESCRIÇÃO\s+VALOR\s+ANOTAÇÕES/g, '')
    .replace(/Centralizadora:[\s\S]*?(?=\d+\.\d+-\d+|$)/g, '')
    .replace(/Página\s+\d+\s+de\s+\d+/g, '')
    .replace(/OBSERVAÇÕES:[\s\S]*?(?=\d+\.\d+-\d+|$)/g, '')
    .replace(
      /UNIDADES PARTICIPANTES:[\s\S]*?(?=\d+\.\d+-\d+|OBSERVAÇÕES:|$)/g,
      '',
    )

  const lines = cleanedText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0)

  const lotePattern = /(\d+\.\d+-\d+)\s*\/\s*(\d+\.\d+\.\d+-\d+)/
  const valorPattern = /R\$\s*[\d.,]+/

  let currentLote: Partial<CatalogoData> | null = null
  let buffer = ''

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (
      line.includes('Centralizadora:') ||
      line.match(/Página\s+\d+/) ||
      line.includes('LOTE / CONTRATO') ||
      line.includes('DESCRIÇÃO VALOR ANOTAÇÕES') ||
      line.includes('OBSERVAÇÕES:') ||
      line.includes('UNIDADES PARTICIPANTES:')
    ) {
      continue
    }

    const loteMatch = line.match(lotePattern)

    if (loteMatch) {
      if (currentLote?.LOTE) {
        buffer = buffer
          .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
          .replace(/UNIDADES PARTICIPANTES:[\s\S]*/g, '')
          .replace(/OBSERVAÇÕES:[\s\S]*/g, '')
          .trim()

        currentLote.DESCRIÇÃO = buffer.substring(0, 500).trim()
        currentLote.ANOTAÇÕES = buffer.substring(500).trim()
        currentLote.PESO = extractPeso(currentLote.DESCRIÇÃO)
        allLots.push(currentLote as CatalogoData)
      }

      currentLote = {
        LOTE: loteMatch[1],
        CONTRATO: loteMatch[2],
        DESCRIÇÃO: '',
        VALOR: '',
        ANOTAÇÕES: '',
      }
      buffer = line.replace(loteMatch[0], '').trim()
    } else if (currentLote) {
      const valorMatch = line.match(valorPattern)

      if (valorMatch && !currentLote.VALOR) {
        currentLote.VALOR = valorMatch[0]
        buffer += ` ${line.replace(valorMatch[0], '').trim()}`
      } else {
        buffer += ` ${line}`
      }
    }
  }

  if (currentLote?.LOTE) {
    buffer = buffer
      .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
      .replace(/UNIDADES PARTICIPANTES:[\s\S]*/g, '')
      .replace(/OBSERVAÇÕES:[\s\S]*/g, '')
      .trim()

    currentLote.DESCRIÇÃO = buffer.substring(0, 500).trim()
    currentLote.ANOTAÇÕES = buffer.substring(500).trim()
    currentLote.PESO = extractPeso(currentLote.DESCRIÇÃO)
    allLots.push(currentLote as CatalogoData)
  }

  return allLots
}

/**
 * Parser alternativo usando regex
 */
function parsePdfContentRegex(rawText: string): CatalogoData[] {
  const allLots: CatalogoData[] = []

  const content = rawText
    .replace(/--\s*\d+\s+of\s+\d+\s*--/g, '')
    .replace(/Centralizadora:[\s\S]*?Página\s+\d+\s+de\s+\d+/g, '')
    .replace(/LOTE\s*\/\s*CONTRATO\s*DESCRIÇÃO\s*VALOR\s*ANOTAÇÕES/g, '')
    .replace(/LOTE\s*\/\s*CONTRATO\s*ANOTAÇÕES\s*VALOR\s*DESCRIÇÃO/g, '')
    .replace(/OBSERVAÇÕES:[\s\S]*$/g, '')
    .replace(
      /UNIDADES PARTICIPANTES:[\s\S]*?(?=\d+\.\d+-\d+|OBSERVAÇÕES:|$)/g,
      '',
    )

  const blockPattern =
    /(\d+\.\d+-\d+)\s*\/\s*(\d+\.\d+\.\d+-\d+)([\s\S]*?)(?=\d+\.\d+-\d+\s*\/\s*\d+\.\d+\.\d+-\d+|$)/g

  let match: RegExpExecArray | null = null
  match = blockPattern.exec(content)
  while (match !== null) {
    const lote = match[1]
    const contrato = match[2]
    const restOfBlock = match[3].trim()

    const valorMatch = restOfBlock.match(/R\$\s*[\d.,]+/)
    const valor = valorMatch ? valorMatch[0] : 'N/A'

    const parts = restOfBlock.split(valor)
    const descricao = parts[0].replace(/\s+/g, ' ').trim()
    const anotacoes = parts[1] ? parts[1].replace(/\s+/g, ' ').trim() : ''
    const peso = extractPeso(descricao)

    allLots.push({
      LOTE: lote,
      CONTRATO: contrato,
      DESCRIÇÃO: descricao,
      VALOR: valor,
      ANOTAÇÕES: anotacoes,
      PESO: peso,
    })

    match = blockPattern.exec(content)
  }

  return allLots
}

/**
 * Função principal de parsing do catálogo
 */
export function parseCatalogo(rawText: string): CatalogoData[] {
  let lotes = parsePdfContent(rawText)

  if (lotes.length === 0) {
    lotes = parsePdfContentRegex(rawText)
  }

  return lotes
}

/**
 * Insere dados do catálogo no banco de dados
 */
export async function saveCatalogoToDb(
  leilaoId: string,
  catalogoData: CatalogoData[],
) {
  const records = catalogoData.map((item) => ({
    id: uuidv7(),
    leilaoId,
    lote: item.LOTE,
    contrato: item.CONTRATO,
    descricao: item.DESCRIÇÃO,
    valor: item.VALOR,
    anotacoes: item.ANOTAÇÕES || null,
    peso: item.PESO || null,
  }))

  await db.insert(catalogo).values(records)

  return records.length
}
