'use client'

import { Loader2, Mail, Shield, Trash2, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { useSession } from '@/lib/auth-client'
import { updateProfile } from './actions'

export default function AccountPage() {
  const { data: session, isPending } = useSession()
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  useEffect(() => {
    if (session?.user) {
      setName(session.user.name)
      setEmail(session.user.email)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const result = await updateProfile(formData)

    if (result.success) {
      toast.success('Perfil atualizado com sucesso!')
    } else {
      toast.error(result.error || 'Erro ao atualizar perfil')
    }

    setLoading(false)
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="@container/main flex flex-1 flex-col gap-4 p-4 pt-2">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Minha Conta</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais e preferências
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Perfil</CardTitle>
            <CardDescription>
              Atualize sua foto e informações pessoais
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={session?.user.image || undefined} />
                <AvatarFallback className="text-lg">
                  {session?.user.name ? getInitials(session.user.name) : '?'}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <Button variant="outline" size="sm" disabled>
                  Alterar Foto
                </Button>
                <p className="text-xs text-muted-foreground">
                  JPG, GIF ou PNG. Máximo 1MB.
                </p>
              </div>
            </div>

            <Separator />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 @md/main:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">
                    <User className="mr-2 inline h-4 w-4" />
                    Nome completo
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="Seu nome completo"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">
                    <Mail className="mr-2 inline h-4 w-4" />
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    if (session?.user) {
                      setName(session.user.name)
                      setEmail(session.user.email)
                    }
                  }}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    'Salvar alterações'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Segurança da Conta</CardTitle>
            <CardDescription>
              Gerencie sua senha e configurações de segurança
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current-password">
                <Shield className="mr-2 inline h-4 w-4" />
                Senha atual
              </Label>
              <Input
                id="current-password"
                type="password"
                placeholder="••••••••"
                disabled
              />
            </div>

            <div className="grid gap-4 @md/main:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="new-password">Nova senha</Label>
                <Input
                  id="new-password"
                  type="password"
                  placeholder="••••••••"
                  disabled
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirmar senha</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  placeholder="••••••••"
                  disabled
                />
              </div>
            </div>

            <div className="flex justify-end">
              <Button disabled>Atualizar senha</Button>
            </div>

            <Separator />

            <div className="space-y-2">
              <h4 className="font-medium">Autenticação de dois fatores</h4>
              <p className="text-sm text-muted-foreground">
                Adicione uma camada extra de segurança à sua conta
              </p>
              <Button variant="outline" disabled>
                Habilitar 2FA
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informações da Conta</CardTitle>
            <CardDescription>Detalhes e metadados da sua conta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              <div className="space-y-1">
                <p className="text-sm font-medium">ID do Usuário</p>
                <p className="font-mono text-sm text-muted-foreground">
                  {session?.user.id}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Email Verificado</p>
                <p className="text-sm text-muted-foreground">
                  {session?.user.emailVerified ? (
                    <span className="text-chart-3">✓ Verificado</span>
                  ) : (
                    <span className="text-chart-4">✗ Não verificado</span>
                  )}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-medium">Conta criada em</p>
                <p className="text-sm text-muted-foreground">
                  {session?.user.createdAt
                    ? new Date(session.user.createdAt).toLocaleDateString(
                        'pt-BR',
                        {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                        },
                      )
                    : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
            <CardDescription>
              Ações irreversíveis relacionadas à sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start justify-between gap-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
              <div className="space-y-1">
                <h4 className="font-medium">Deletar conta</h4>
                <p className="text-sm text-muted-foreground">
                  Esta ação é permanente e não pode ser desfeita. Todos os seus
                  dados serão removidos.
                </p>
              </div>
              <Button variant="destructive" disabled>
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
