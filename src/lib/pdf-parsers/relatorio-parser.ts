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
 * Remove R$ e espaços dos valores antes de salvar no banco
 */
function cleanValor(valor: string): string {
  return valor.replace(/R\$\s*/g, '').trim()
}

/**
 * Parser 1: Linha por linha para relatório (Fallback)
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

  // Esta Regex é usada pelo Parser 1 e não foi a fonte do problema atual
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
 * Parser 2: Alternativo usando regex (Com correção de índice e debug)
 */
function parseRelatorioContentRegex(rawText: string): RelatorioData[] {
  console.log('--- INÍCIO DEBUG: parseRelatorioContentRegex ---')
  const allData: RelatorioData[] = []
  let content = rawText

  // 1. Normalização de quebra de linha
  content = content.replace(/\r\n|\r/g, '\n')

  // PADRÕES DE CPF/CNPJ CORRIGIDOS NOVAMENTE: Mais flexível para lidar com 'X's no meio.
  const cpfCnpjPattern =
    /(\d{2,3}\.[\dX]{1,3}\.[\dX]{1,3}[-./][\dX]{1,4}-\d{2})/g
  const cpfCnpjValidator =
    /\d{2,3}\.[\dX]{1,3}\.[\dX]{1,3}[-./][\dX]{1,4}-\d{2}/

  // 2. Tenta encontrar a posição do primeiro CPF/CNPJ no texto
  const firstCpfCnpjMatch = content.match(cpfCnpjPattern)
  console.log(
    '1. Match do Primeiro CPF/CNPJ:',
    firstCpfCnpjMatch ? firstCpfCnpjMatch[0] : 'NÃO ENCONTRADO',
  )

  // CORREÇÃO: Força o uso do index com '!' (Corrigido na rodada anterior)
  if (firstCpfCnpjMatch) {
    content = content.substring(firstCpfCnpjMatch.index!)
    console.log(
      '2. Content limpo (substring) OK. Início: ',
      `${content.substring(0, 50).replace(/\n/g, '\\n')}...`,
    )
  } else {
    console.log(
      '2. Falha ao encontrar CPF/CNPJ (Index não disponível). Retornando 0 registros.',
    )
    return allData
  }

  // 3. Limpeza de Totais e Rodapés
  content = content
    .replace(/Matrícula:.*?Data da Licitação:.*?\d+\/\d+\/\d+/g, '') // Remove cabeçalhos residuais
    .replace(/Alô CAIXA:[\s\S]*$/g, '') // Remove rodapé
    .replace(/\(\d+\)[\s\d.,]*Total/g, '') // Remove linhas de Total

  // Regex de dados colados (super flexível)
  const dataGluedRegex = new RegExp(
    '(\\d{4}\\.\\d{6}-\\d)' + // Grupo 1: Lote
      '([\\d\\.]+,\\d{2})' + // Grupo 2: Lance (e.g., 3.090,00)
      '([\\d\\.]+,\\d{2})' + // Grupo 3: Tarifa (e.g., 185,40)
      '([\\d\\.]+,\\d{2})', // Grupo 4: Total (e.g., 3.275,40)
    'i',
  )

  // Divide o texto em blocos APENAS pelos CPF/CNPJ VÁLIDOS
  const blocks = content
    .split(cpfCnpjPattern)
    .filter((b) => b.trim().length > 0)
  console.log('3. Total de blocos (CPFs + Dados):', blocks.length)

  let currentCpfCnpj = ''

  for (const block of blocks) {
    const trimmedBlock = block.trim()

    // Este if agora deve ser executado APENAS para o CPF/CNPJ
    if (cpfCnpjValidator.test(trimmedBlock)) {
      currentCpfCnpj = formatCpfCnpj(trimmedBlock)
      console.log(`4. Novo Arrematante: ${currentCpfCnpj}`)
      continue
    }

    if (currentCpfCnpj) {
      console.log(
        `5. Processando bloco de dados para ${currentCpfCnpj}. Tamanho do bloco: ${trimmedBlock.length}`,
      )

      const lines = trimmedBlock.split('\n').filter((l) => l.trim().length > 0)
      console.log(`5a. Total de linhas no bloco: ${lines.length}`)

      for (const line of lines) {
        // Ignora lixo ou cabeçalhos residuais
        if (
          line.includes('Matrícula') ||
          line.includes('Data da Licitação') ||
          line.includes('Total') ||
          line.length < 10
        ) {
          continue
        }

        const match = line.match(dataGluedRegex)

        if (match) {
          allData.push({
            CPF_CNPJ: currentCpfCnpj,
            NUMERO_LOTE: match[1],
            VALOR_LANCE: match[2],
            TARIFA: match[3],
            TOTAL: match[4],
          })
          console.log(
            `✅ 6. Match SUCESSO! Lote: ${match[1]}, Total de Registros: ${allData.length}`,
          )
        } else {
          // DEBUG: Se falhar, vamos ver qual linha falhou
          console.log(
            `❌ 6. Match FALHOU na linha: "${line.substring(0, 60).replace(/\n/g, '\\n')}..."`,
          )
        }
      }
    }
  }
  console.log('--- FIM DEBUG: Total de Registros Encontrados:', allData.length)

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
    valorLance: cleanValor(item.VALOR_LANCE),
    tarifa: cleanValor(item.TARIFA),
    total: cleanValor(item.TOTAL),
  }))

  await db.insert(relatorio).values(records)

  return records.length
}
