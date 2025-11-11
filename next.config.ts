import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Mantemos o alias para o Turbopack, embora o Webpack seja mais confiável aqui
  turbopack: {
    resolveAlias: {
      canvas: 'false',
    },
  },
  // O Webpack ainda é crucial para o Server Bundle, mesmo com Turbopack.
  webpack: (config, { isServer }) => {
    if (isServer) {
      // 1. Alias para forçar o build Node.js (corrigindo o worker)
      config.resolve.alias = {
        ...config.resolve.alias,
        'pdfjs-dist': 'pdfjs-dist/build/pdf.js',
      }

      // 2. FORÇA O WEBPACK A IGNORAR a dependência 'canvas' no bundle do servidor.
      // O pdfjs-dist tenta carregar isso para renderizar PDFs, mas não é necessário
      // para extração de texto. Isso previne o erro final de build.
      config.externals = [...(config.externals || []), 'canvas']
    }
    return config
  },
}

export default nextConfig
