'use client'

import {
  ChevronRight,
  FileText,
  Home,
  Search,
  Settings,
  Upload,
  User,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

interface RouteConfig {
  name: string
  icon?: React.ComponentType<{ className?: string }>
  parent?: string
}

const routeConfig: Record<string, RouteConfig> = {
  '/': {
    name: 'Dashboard',
    icon: Home,
  },
  '/upload': {
    name: 'Upload PDFs',
    icon: Upload,
  },
  '/busca': {
    name: 'Buscar Lote',
    icon: Search,
  },
  '/analises/graficos': {
    name: 'Gráficos',
    icon: FileText,
    parent: 'Análises',
  },
  '/analises/estatisticas': {
    name: 'Estatísticas',
    icon: FileText,
    parent: 'Análises',
  },
  '/analises/tendencias': {
    name: 'Tendências',
    icon: FileText,
    parent: 'Análises',
  },
  '/catalogos': {
    name: 'Catálogos',
    icon: FileText,
    parent: 'Dados Brutos',
  },
  '/relatorios': {
    name: 'Relatórios',
    icon: FileText,
    parent: 'Dados Brutos',
  },
  '/configuracoes': {
    name: 'Configurações',
    icon: Settings,
  },
  '/account': {
    name: 'Minha Conta',
    icon: User,
  },
}

export function DynamicBreadcrumb() {
  const pathname = usePathname()
  const config = routeConfig[pathname] || { name: 'Página', icon: Home }
  const Icon = config.icon

  const isHomePage = pathname === '/'

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {!isHomePage && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link
                  href="/"
                  className="flex items-center gap-1.5 text-muted-foreground transition-colors hover:text-foreground"
                >
                  <Home className="h-3.5 w-3.5" />
                  Dashboard
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
          </>
        )}

        {config.parent && (
          <>
            <BreadcrumbItem>
              <BreadcrumbPage className="text-muted-foreground">
                {config.parent}
              </BreadcrumbPage>
            </BreadcrumbItem>
            <BreadcrumbSeparator>
              <ChevronRight className="h-4 w-4" />
            </BreadcrumbSeparator>
          </>
        )}

        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-1.5 font-medium">
            {Icon && <Icon className="h-4 w-4" />}
            {config.name}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
