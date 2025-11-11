declare module 'pdf-parse' {
  interface PDFInfo {
    text: string
    numpages: number
    numrender: number
    info: Record<string, unknown>
    metadata: Record<string, unknown> | null
    version: string
  }

  function parse(dataBuffer: Buffer): Promise<PDFInfo>
  
  export = parse
}