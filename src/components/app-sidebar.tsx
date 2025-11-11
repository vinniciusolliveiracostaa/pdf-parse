'use client'

import {
  GalleryVerticalEnd,
  Home,
  Search,
  Upload,
  FileText,
  Settings,
} from 'lucide-react'
import type * as React from 'react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from '@/components/ui/sidebar'

type User = {
  name: string
  email: string
  image?: string | null
}

export function AppSidebar({ user, ...props }: React.ComponentProps<typeof Sidebar> & { user: User }) {
  const data = {
    user: {
      name: user.name,
      email: user.email,
      avatar: user.image || undefined,
    },
  navMain: [
    {
      title: 'Dashboard',
      url: '/',
      icon: Home,
    },
    {
      title: 'Upload PDFs',
      url: '/upload',
      icon: Upload,
    },
    {
      title: 'Buscar Lote',
      url: '/busca',
      icon: Search,
    },
    {
      title: 'Dados Brutos',
      url: '#',
      icon: FileText,
      items: [
        {
          title: 'Catálogos',
          url: '/catalogos',
        },
        {
          title: 'Relatórios',
          url: '/relatorios',
        },
      ],
    },
    {
      title: 'Configurações',
      url: '/configuracoes',
      icon: Settings,
    },
  ],
}

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-4">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-lg">
            <GalleryVerticalEnd className="size-4" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold">Leilão Caixa</span>
            <span className="text-xs text-muted-foreground">Sistema de Análise</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
