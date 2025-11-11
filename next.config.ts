import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  turbopack: {
    resolveAlias: {
      canvas: 'false',
    },
  },
  serverExternalPackages: ['pdf-parse'],
}

export default nextConfig
