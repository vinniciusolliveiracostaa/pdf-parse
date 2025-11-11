import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/build/pdf'

export async function extractTextFromPDF(buffer: Buffer): Promise<string> {
  try {
    // Aponta para o worker na pasta public
    GlobalWorkerOptions.workerSrc = '/pdf/pdf.worker.js'

    const uint8Array = new Uint8Array(buffer)
    const loadingTask = getDocument({ data: uint8Array })
    const pdfDocument = await loadingTask.promise

    let fullText = ''

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      const page = await pdfDocument.getPage(pageNum)
      const textContent = await page.getTextContent()

      const pageText = textContent.items
        .map((item) => ('str' in item ? item.str : ''))
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
