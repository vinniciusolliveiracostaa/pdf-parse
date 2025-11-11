import type { Buffer } from 'node:buffer' // Usando 'import type' e protocolo node
import type {
  PDFDocumentLoadingTask,
  PDFDocumentProxy,
  TextContent,
  TextItem,
  // O tipo se chama TextMarkedContent
  TextMarkedContent, 
} from 'pdfjs-dist/types/src/display/api' // Tipos mantidos aqui

/**
 * Extrai texto de um PDF a partir de um Buffer
 * Usa implementação própria sem dependências externas problemáticas
 */
export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Apenas importamos o módulo principal usando require().
    // O require() garante que a versão CommonJS (Node.js) do pdfjs-dist 
    // seja carregada, que opera no mesmo thread e NÃO requer Workers.
    // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    const pdfjsLib = require('pdfjs-dist') 
    
    // Tipagem explícita da função getDocument (necessária após o require)
    const getDocument = pdfjsLib.getDocument as (params: {
      data: Uint8Array
      standardFontDataUrl: undefined
      cMapUrl: undefined
      cMapPacked: boolean
    }) => PDFDocumentLoadingTask

    // Converte o Buffer (entrada da Server Action) para Uint8Array
    const uint8Array = new Uint8Array(buffer)
    
    // Carrega o documento
    const loadingTask = getDocument({
      data: uint8Array,
      standardFontDataUrl: undefined,
      cMapUrl: undefined,
      cMapPacked: false,
    })
    
    // Tipagem do documento
    const pdfDocument: PDFDocumentProxy = await loadingTask.promise
    let fullText = ''

    // Extrai texto de todas as páginas
    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum)
      const textContent: TextContent = await page.getTextContent()

      // Tipagem explícita do item (Usando TextMarkedContent)
      const pageText = textContent.items
        .map((item: TextItem | TextMarkedContent) => {
          // Verifica se o item é um TextItem, que possui a propriedade 'str'
          if ('str' in item) {
            return item.str
          }
          return ''
        })
        .join(' ')
      fullText += `${pageText}\n`
    }

    return fullText
  } catch (error) {
    console.error('Erro ao extrair texto do PDF:', error)
    throw new Error(
      `Falha ao extrair texto do PDF: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
    )
  }
}