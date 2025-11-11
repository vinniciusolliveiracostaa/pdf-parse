// src/lib/pdf-parsers/pdf-extractor.ts

// Usando a sintaxe funcional (v1) para evitar erros de worker/DOM
import pdf from 'pdf-parse'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Apenas extrai o texto bruto de forma confiável
    const result = await pdf(buffer)
    return result.text
  } catch (error) {
    // ... tratamento de erro ...
    console.error('Erro ao extrair texto do PDF:', error)
    throw new Error(
      `Falha ao extrair texto do PDF: ${
        error instanceof Error ? error.message : 'Erro desconhecido'
      }`,
    )
  }
}
