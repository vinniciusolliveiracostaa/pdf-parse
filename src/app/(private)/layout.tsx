import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { AppSidebar } from '@/components/app-sidebar'
import { DynamicBreadcrumb } from '@/components/dynamic-breadcrumb'
import { DynamicThemeProvider } from '@/components/theme-provider-dynamic'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { auth } from '@/lib/auth'
import { getSettings } from './(dashboard)/configuracoes/actions'

export default async function PrivateLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const settings = await getSettings()

  return (
    <>
      <DynamicThemeProvider theme={settings.theme}>
        <SidebarProvider
          style={
            {
              '--sidebar-width': 'calc(var(--spacing) * 72)',
            } as React.CSSProperties
          }
        >
          <AppSidebar user={session.user} />
          <SidebarInset className="flex h-screen max-h-screen w-full max-w-full flex-col overflow-hidden">
            <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
              <div className="flex items-center gap-2 px-4">
                <SidebarTrigger className="-ml-1" />
                <Separator orientation="vertical" className="mr-2 h-4" />
                <DynamicBreadcrumb />
              </div>
            </header>
            <main className="flex flex-1 flex-col overflow-hidden">
              {children}
            </main>
          </SidebarInset>
        </SidebarProvider>
      </DynamicThemeProvider>
    </>
  )
}
