'use client'

import { usePathname } from 'next/navigation'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'

const routeNames: Record<string, string> = {
  '/': 'Dashboard',
  '/upload': 'Upload PDFs',
  '/busca': 'Buscar Lote',
  '/catalogos': 'Catálogos',
  '/relatorios': 'Relatórios',
  '/configuracoes': 'Configurações',
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const pageName = routeNames[pathname] || 'Dashboard'

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbPage>{pageName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
