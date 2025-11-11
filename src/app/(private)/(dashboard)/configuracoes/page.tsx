import { eq } from 'drizzle-orm'
import { Palette, Settings as SettingsIcon, Shield, Users } from 'lucide-react'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { db } from '@/db/drizzle'
import { account } from '@/db/schema/accounts'
import { user } from '@/db/schema/users'
import { auth } from '@/lib/auth'
import { ColorPickerCompact } from './color-picker-compact'

export default async function ConfiguracoesPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session) {
    redirect('/sign-in')
  }

  const currentUserAccount = await db.query.account.findFirst({
    where: (accounts, { eq }) => eq(accounts.userId, session.user.id),
  })

  const isAdmin = currentUserAccount?.role === 'ADMIN'

  const allUsersWithAccounts = isAdmin
    ? await db
        .select({
          id: user.id,
          name: user.name,
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          createdAt: user.createdAt,
          role: account.role,
        })
        .from(user)
        .leftJoin(account, eq(user.id, account.userId))
        .orderBy(user.createdAt)
    : []

  const systemSettings = await db.query.settings.findFirst()
  const currentColor = systemSettings?.primaryColor || '#3b82f6'
  const _systemName = systemSettings?.systemName || 'Leilão Caixa'

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 overflow-hidden p-4 pt-2">
      <div className="flex shrink-0 flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie configurações do sistema e usuários
        </p>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <CardTitle>Permissões</CardTitle>
              </div>
              <CardDescription>
                Informações sobre seu nível de acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">Seu papel no sistema</p>
                  <p className="text-sm text-muted-foreground">
                    Define suas permissões e acessos
                  </p>
                </div>
                <Badge variant={isAdmin ? 'default' : 'outline'}>
                  {isAdmin ? 'Administrador' : 'Usuário'}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {isAdmin && (
            <>
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    <CardTitle>Gestão de Usuários</CardTitle>
                  </div>
                  <CardDescription>
                    Visualize e gerencie todos os usuários do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="rounded-lg border">
                      <div className="grid grid-cols-4 gap-4 border-b bg-muted/50 p-4 text-sm font-medium">
                        <div>Nome</div>
                        <div>Email</div>
                        <div>Role</div>
                        <div>Status</div>
                      </div>
                      {allUsersWithAccounts.map((u) => (
                        <div
                          key={u.id}
                          className="grid grid-cols-4 gap-4 border-b p-4 text-sm last:border-b-0"
                        >
                          <div className="font-medium">{u.name}</div>
                          <div className="text-muted-foreground">{u.email}</div>
                          <div>
                            <Badge
                              variant={
                                u.role === 'ADMIN' ? 'default' : 'outline'
                              }
                            >
                              {u.role === 'ADMIN' ? 'Admin' : 'User'}
                            </Badge>
                          </div>
                          <div>
                            {u.emailVerified ? (
                              <Badge variant="outline" className="text-chart-3">
                                Verificado
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-chart-4">
                                Pendente
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Total de {allUsersWithAccounts.length} usuário(s)
                      registrado(s)
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    <CardTitle>Personalização</CardTitle>
                  </div>
                  <CardDescription>
                    Customize a aparência do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 @lg/main:grid-cols-2">
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Logo do Sistema</h4>
                      <p className="text-sm text-muted-foreground">
                        Personalize a logo exibida na barra lateral
                      </p>
                      <div className="flex items-center gap-2">
                        <div className="bg-primary text-primary-foreground flex size-16 items-center justify-center rounded-lg">
                          <SettingsIcon className="size-8" />
                        </div>
                        <div className="space-y-2">
                          <button
                            type="button"
                            disabled
                            className="text-sm text-muted-foreground underline"
                          >
                            Alterar logo (em breve)
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">
                        Cor Principal do Tema
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Escolha a cor principal que será aplicada em todo o
                        sistema
                      </p>
                      <ColorPickerCompact currentColor={currentColor} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {!isAdmin && (
            <Card>
              <CardHeader>
                <CardTitle>Acesso Limitado</CardTitle>
                <CardDescription>
                  Apenas administradores podem acessar configurações avançadas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Entre em contato com um administrador para solicitar
                  permissões adicionais ou alterar configurações do sistema.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
