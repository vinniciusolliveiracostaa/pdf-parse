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
 * Remove R$, pontos de milhar e substitui vírgula decimal por ponto para
 * garantir o formato numérico limpo e compatível com o banco de dados.
 */
function cleanMonetaryValue(value: string): string {
  // 1. Remove "R$" no início e qualquer espaço adjacente
  let cleaned = value.replace(/R\$\s*/i, '').trim()

  // 2. Remove pontos de milhar (ex: 1.296,00 -> 1296,00)
  cleaned = cleaned.replace(/\./g, '')

  // 3. Substitui a vírgula decimal por ponto (ex: 1296,00 -> 1296.00)
  cleaned = cleaned.replace(',', '.')

  return cleaned
}

/**
 * Extrai o peso da descrição usando regex, sendo agora robusto para
 * diferentes formatos de texto (com ou sem espaço antes de 'G', e com 'PESO LOTE').
 */
export function extractPeso(descricao: string): string | undefined {
  // 1. Procura o padrão "PESO LOTE: X,XX G" ou "PESO X,XX G" (mais robusto)
  // Adiciona \s* para permitir ZERO ou MAIS espaços antes do G
  const pesoLoteMatch = descricao.match(
    /(?:PESO LOTE|PESO):?\s*([\d.,]+)\s*(G|GR|GRAMAS?)/i,
  )

  if (pesoLoteMatch) {
    // Normaliza o valor capturado: remove pontos de milhar e garante que a vírgula é o separador decimal
    const valor = pesoLoteMatch[1].trim().replace(/\./g, '').replace(',', '.')
    return `${valor}G`
  }

  // 2. Fallback para a busca simples: X,XXG (permitindo espaços)
  const simplePesoMatch = descricao.match(/([\d.,]+)\s*G/i)

  if (simplePesoMatch) {
    const valor = simplePesoMatch[1].trim().replace(/\./g, '').replace(',', '.')
    return `${valor}G`
  }

  return undefined
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

  for (const line of lines) {
    // Ignora linhas de cabeçalho e rodapé
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
      // Finaliza o lote anterior, se houver
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

      // Inicia novo lote
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
        // CORREÇÃO: Usa a função aprimorada cleanMonetaryValue para limpar R$ e formatar o número
        currentLote.VALOR = cleanMonetaryValue(valorMatch[0])
        buffer += ` ${line.replace(valorMatch[0], '').trim()}`
      } else {
        buffer += ` ${line}`
      }
    }
  }

  // Finaliza o último lote
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
 * Parser alternativo usando regex (Bloco)
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

  const robustValorPattern = /R\$\s*([\d\s.,]+)/
  const valorBrutoPattern = /R\$\s*[\d\s.,]+/

  let match: RegExpExecArray | null = null
  blockPattern.lastIndex = 0

  // CORREÇÃO: Substitui a atribuição na expressão de condição por atribuição e verificação explícita.
  while (true) {
    match = blockPattern.exec(content)
    if (match === null) {
      break
    }

    const lote = match[1]
    const contrato = match[2]
    let restOfBlock = match[3]

    const valorMatch = restOfBlock.match(robustValorPattern)

    // Usa a função aprimorada cleanMonetaryValue
    const valor = valorMatch ? cleanMonetaryValue(valorMatch[1]) : 'N/A'

    if (valorMatch) {
      const valorBrutoEncontrado = restOfBlock.match(valorBrutoPattern)
      if (valorBrutoEncontrado) {
        restOfBlock = restOfBlock.replace(valorBrutoEncontrado[0], '')
      }
    }

    const cleanedBlock = restOfBlock.trim()
    const descricaoLimpa = cleanedBlock.replace(/\s*R\$\s*$/g, '').trim()

    const parts = descricaoLimpa.split('-')
    const descricao = parts[0].replace(/\s+/g, ' ').trim()

    const anotacoes =
      parts.length > 1
        ? parts.slice(1).join('-').replace(/\s+/g, ' ').trim()
        : ''

    // O peso agora é extraído pela função robusta
    const peso = extractPeso(descricao)

    allLots.push({
      LOTE: lote,
      CONTRATO: contrato,
      DESCRIÇÃO: descricao,
      VALOR: valor,
      ANOTAÇÕES: anotacoes,
      PESO: peso,
    })
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
